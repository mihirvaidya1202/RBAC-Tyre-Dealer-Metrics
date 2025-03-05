<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { dealerStockStore, removeFromDealerStock, tyreStocks, addToDealerStock } from '../../../lib/stores';
    import { tyreStockApi } from '../../../lib/api';

    let error = null;
    let isLoading = false;
    let dealerId = null;
    let quantities = [];

    onMount(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            dealerId = decodedToken.userId;

            isLoading = true;

            const adminStock = await tyreStockApi.fetchTyreStocks(token);
            tyreStocks.set(adminStock);
            quantities = new Array(adminStock.length).fill(1);

            const dealerStock = await tyreStockApi.getDealerStock(token);
            dealerStockStore.set(dealerStock);

            error = null;
        } catch (err) {
            console.error("Error fetching stock:", err);
            error = err.message || "Failed to load stock.";
        } finally {
            isLoading = false;
        }
    });

    const handleAddToDealerStock = async (stock, quantity) => {
    if (!quantity || quantity < 1 || quantity > stock.quantity) {
        error = "Invalid quantity selected.";
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        error = 'You must be logged in to add stock.';
        navigate('/login');
        return;
    }

    try {
        isLoading = true;

        await tyreStockApi.addToDealerStock(stock._id, quantity, token);

        const updatedDealerStock = await tyreStockApi.getDealerStock(token);
        dealerStockStore.set(updatedDealerStock);

        const updatedAdminStock = await tyreStockApi.fetchTyreStocks(token);
        tyreStocks.set(updatedAdminStock);

        error = null;
    } catch (err) {
        console.error("Error in handleAddToDealerStock:", err);
        error = err.message || 'Failed to add stock. Please try again.';
    } finally {
        isLoading = false;
    }
};



    const handleRemove = async (id) => {
        if (!id) {
            error = "Invalid stock ID.";
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            error = 'You must be logged in to remove stock.';
            navigate('/login');
            return;
        }

        try {
            isLoading = true;
            await tyreStockApi.removeFromDealerStock(id, token);
            removeFromDealerStock(id);
            error = null;
        } catch (err) {
            console.error("Error in handleRemove:", err);
            error = err.message || 'Failed to remove stock. Please try again.';
        } finally {
            isLoading = false;
        }
    };
</script>

<h1>Dealer Dashboard</h1>

{#if isLoading}
    <p>Loading...</p>
{/if}

<h2>Available Tyre Stocks from Admin</h2>

{#if $tyreStocks.length === 0}
    <p>No available stock from admin.</p>
{:else}
    <table>
        <thead>
            <tr>
                <th>Tyre Model</th>
                <th>Tyre Size</th>
                <th>Available Quantity</th>
                <th>Price</th>
                <th>Quantity to Add</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {#each $tyreStocks as stock, index}
                <tr>
                    <td>{stock.tyreModel}</td>
                    <td>{stock.tyreSize}</td>
                    <td>{stock.quantity}</td>
                    <td>${stock.price}</td>
                    <td>
                        <input type="number" min="1" max={stock.quantity} bind:value={quantities[index]} />
                    </td>
                    <td>
                        <button on:click={() => handleAddToDealerStock(stock, quantities[index])} disabled={isLoading}>
                            Add to My Stock
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<h2>Your Tyre Stocks</h2>

{#if error}
    <p class="error">{error}</p>
{/if}

{#if !$dealerStockStore || $dealerStockStore.length === 0}
    <p>No tyre stocks available.</p>
{:else}
    <table>
        <thead>
            <tr>
                <th>Tyre Model</th>
                <th>Tyre Size</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            {#each $dealerStockStore as stock}
                <tr>
                    <td>{stock.tyreModel}</td>
                    <td>{stock.tyreSize}</td>
                    <td>{stock.quantity}</td>
                    <td>${stock.price}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    .error {
        color: red;
        margin-bottom: 1rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
    }

    th {
        background-color: #f4f4f4;
    }

    button {
        background-color: #2ecc71;
        color: white;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 4px;
    }

    button:hover {
        background-color: #27ae60;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    input[type="number"] {
        width: 60px;
        padding: 5px;
        text-align: center;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
</style>