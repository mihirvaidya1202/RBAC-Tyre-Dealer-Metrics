<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { tyreStocks, loadTyreStocks } from "../../../lib/stores";
    import { tyreStockApi } from "../../../lib/api";
    import Navbar from "../../../components/Navbar/Navbar.svelte";
    import ErrorTemplate from "../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte";

    let tyreModel = "";
    let tyreSize = "";
    let quantity = 0;
    let price = 0;
    let isLoading = false;
    let error = { message: null, code: null };
    let updateQuantities = {};
    let isAdmin = false;

    const navbarItems = [
        {
            label: "Analytics",
            url: "/admin/analytics",
        },
    ];

    const landingPage = "/admin/landing";

    const handleApiError = (err) => {
        if (err.response) {
            error = {
                message: err.response.message || "API request failed",
                code: err.response.code || "API_ERROR",
            };

            if (err.response.status === 403) {
                error.message = "Access denied. Please login again.";
                localStorage.removeItem("token");
                navigate("/login");
            }
        } else {
            error = {
                message: err.message || "An unexpected error occurred",
                code: "NETWORK_ERROR",
            };
        }
        console.error("API Error:", err);
    };

    const verifyAdminRole = (token) => {
        try {
            if (!token) return false;
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.role === "admin";
        } catch (err) {
            console.error("Error decoding token:", err);
            return false;
        }
    };

    onMount(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            error = {
                message: "You must be logged in to access this page",
                code: "UNAUTHORIZED",
            };
            navigate("/login");
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };

            isAdmin = verifyAdminRole(token);
            if (!isAdmin) {
                error = {
                    message: "Access denied. Admin privileges required.",
                    code: "FORBIDDEN",
                };
                return;
            }

            await loadTyreStocks(token);
        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    });

    const handleAddStock = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            error = {
                message: "You must be logged in to add stock",
                code: "UNAUTHORIZED",
            };
            navigate("/login");
            return;
        }

        if (!verifyAdminRole(token)) {
            error = {
                message: "Admin access required",
                code: "FORBIDDEN",
            };
            return;
        }

        if (!tyreModel || !tyreSize || quantity <= 0 || price <= 0) {
            error = {
                message: "Please fill in all fields with valid values",
                code: "VALIDATION_ERROR",
            };
            return;
        }

        const newStock = { tyreModel, tyreSize, quantity, price };

        try {
            isLoading = true;
            error = { message: null, code: null };

            await tyreStockApi.addTyreStock(newStock, token);
            await loadTyreStocks(token);

            tyreModel = "";
            tyreSize = "";
            quantity = 0;
            price = 0;
        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    };

    const handleDeleteStock = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) {
            error = {
                message: "You must be logged in to delete stock",
                code: "UNAUTHORIZED",
            };
            navigate("/login");
            return;
        }

        if (!verifyAdminRole(token)) {
            error = {
                message: "Admin access required",
                code: "FORBIDDEN",
            };
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };

            await tyreStockApi.deleteTyreStock(id, token);
            await loadTyreStocks(token);
        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    };

    const handleUpdateStock = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) {
            error = {
                message: "You must be logged in to update stock",
                code: "UNAUTHORIZED",
            };
            navigate("/login");
            return;
        }

        if (!verifyAdminRole(token)) {
            error = {
                message: "Admin access required",
                code: "FORBIDDEN",
            };
            return;
        }

        const additionalQty = parseInt(updateQuantities[id]);
        if (isNaN(additionalQty) || additionalQty <= 0) {
            error = {
                message: "Please enter a valid quantity (minimum 1)",
                code: "VALIDATION_ERROR",
            };
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };

            await tyreStockApi.updateTyreStock(id, { additionalQty }, token);
            await loadTyreStocks(token);
            updateQuantities[id] = "";
        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    };
</script>

{#if !error.message && isAdmin}
    <Navbar {navbarItems} {landingPage} />
{/if}

<div class="landing-page">
    <div class="page-content">
        {#if error.message}
            <ErrorTemplate {...error} />
        {:else if !isAdmin}
            <ErrorTemplate
                message="Access denied. Admin privileges required."
                code="FORBIDDEN"
            />
        {:else}
            <h1 class="page-title">Admin Dashboard - Tyre Stock Management</h1>

            {#if isLoading}
                <div class="loading-indicator">
                    <p>Loading...</p>
                </div>
            {:else}
                <div class="add-tyre-container">
                    <h2>Add Tyre Stocks</h2>
                    <form on:submit|preventDefault={handleAddStock}>
                        <div class="input-field">
                            <span>Tyre Model</span>
                            <input
                                type="text"
                                bind:value={tyreModel}
                                placeholder="Tyre Model"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div class="input-field">
                            <span>Tyre Size</span>
                            <select
                                bind:value={tyreSize}
                                required
                                disabled={isLoading}
                            >
                                <option value="" disabled selected
                                    >Select Tyre Size</option
                                >
                                <option value="13">13</option>
                                <option value="15">15</option>
                                <option value="17">17</option>
                            </select>
                        </div>
                        <div class="input-field">
                            <span>Tyre Quantity</span>
                            <input
                                type="number"
                                bind:value={quantity}
                                placeholder="Quantity"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div class="input-field">
                            <span>Price</span>
                            <input
                                type="number"
                                bind:value={price}
                                placeholder="Price"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Add Stock"}
                        </button>
                    </form>
                </div>

                <div class="view-stock-container">
                    <h2>Current Tyre Stocks</h2>

                    {#if $tyreStocks.length === 0}
                        <p class="error">No tyre stocks available.</p>
                    {:else}
                        <div class="table-container">
                            <table class="stock-table">
                                <thead>
                                    <tr>
                                        <th>Tyre Model</th>
                                        <th>Tyre Size</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th colspan="2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each $tyreStocks as stock}
                                        <tr>
                                            <td>{stock.tyreModel}</td>
                                            <td>{stock.tyreSize}</td>
                                            <td>{stock.quantity}</td>
                                            <td>${stock.price}</td>
                                            <td class="td-add-input">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    bind:value={updateQuantities[
                                                        stock._id
                                                    ]}
                                                    placeholder="Qty to add"
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    on:click={() =>
                                                        handleUpdateStock(
                                                            stock._id,
                                                        )}
                                                    disabled={isLoading}
                                                >
                                                    Add
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    on:click={() =>
                                                        handleDeleteStock(
                                                            stock._id,
                                                        )}
                                                    disabled={isLoading}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </div>
            {/if}
        {/if}
    </div>
</div>

<style lang="scss">
    @use "./_landing.scss" as *;
</style>
