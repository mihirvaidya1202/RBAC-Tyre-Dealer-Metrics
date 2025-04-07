<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { tyresApi } from "../../../lib/api";
    import Navbar from '../../../components/Navbar/Navbar.svelte';
    import ErrorTemplate from '../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte';

    let orders = [];
    let isLoading = false;
    let error = { message: null, code: null };
    const starValues = [1, 2, 3, 4, 5];

    const navbarItems = [
        { label: 'Dashboard', url: '/customer/landing' },
        { label: 'Purchase History', url: '#' },
    ];

    const landingPage = '/customer/landing';

    const handleApiError = (err) => {
        if (err.response) {
            error = {
                message: err.response.message || 'API request failed',
                code: err.response.code || 'API_ERROR'
            };
            
            if (err.response.status === 401 || err.response.status === 403) {
                error.message = 'Session expired. Please login again.';
                localStorage.removeItem('token');
                navigate('/login');
            }
        } else {
            error = {
                message: err.message || 'An unexpected error occurred',
                code: 'NETWORK_ERROR'
            };
        }
        console.error('API Error:', err);
    };

    async function fetchPurchaseHistory() {
        const token = localStorage.getItem('token');
        if (!token) {
            error = {
                message: 'You must be logged in to view this page',
                code: 'UNAUTHORIZED'
            };
            navigate('/login');
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };
            
            const data = await tyresApi.getPurchaseHistory(token);
            if (data && data.length > 0) {
                orders = data.map(order => ({
                    ...order,
                    isDealerRated: order.orderDealerRating > 0,
                    isTyreRated: order.orderTyreRating > 0,
                    tempTyreRating: null,
                    tempDealerRating: null,
                    hoverTyreRating: null,
                    hoverDealerRating: null
                }));
            } else {
                error = {
                    message: "You do not have any previous orders.",
                    code: 'NO_ORDERS'
                };
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    }

    async function submitDealerRating(order, dealerRating) {
        const token = localStorage.getItem('token');
        if (!token) {
            error = {
                message: 'You must be logged in to rate dealers',
                code: 'UNAUTHORIZED'
            };
            navigate('/login');
            return;
        }

        if (!dealerRating) {
            error = {
                message: 'Please select a rating before submitting',
                code: 'VALIDATION_ERROR'
            };
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };
            
            const response = await tyresApi.updateDealerRating(token, order._id, { dealerRating });
            if (response.message === "Dealer rating updated successfully") {
                const updatedOrder = orders.find(o => o._id === order._id);
                if (updatedOrder) {
                    updatedOrder.orderDealerRating = dealerRating;
                    updatedOrder.isDealerRated = true;
                    updatedOrder.tempDealerRating = null;
                }
            } else {
                error = {
                    message: "Failed to submit dealer rating",
                    code: 'API_ERROR'
                };
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    }

    async function submitTyreRating(order, tyreRating) {
        const token = localStorage.getItem('token');
        if (!token) {
            error = {
                message: 'You must be logged in to rate tyres',
                code: 'UNAUTHORIZED'
            };
            navigate('/login');
            return;
        }

        if (!tyreRating) {
            error = {
                message: 'Please select a rating before submitting',
                code: 'VALIDATION_ERROR'
            };
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };
            
            const response = await tyresApi.updateTyreRating(token, order._id, { tyreRating });
            if (response.message === "Tyre rating updated successfully") {
                const updatedOrder = orders.find(o => o._id === order._id);
                if (updatedOrder) {
                    updatedOrder.orderTyreRating = tyreRating;
                    updatedOrder.isTyreRated = true;
                    updatedOrder.tempTyreRating = null;
                }
            } else {
                error = {
                    message: "Failed to submit tyre rating",
                    code: 'API_ERROR'
                };
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    }

    onMount(async () => {
        await fetchPurchaseHistory();
    });
</script>

{#if !error.message}
    <Navbar {navbarItems} {landingPage} />
{/if}

{#if error.message}
    <ErrorTemplate {...error} />
{:else}
    <div class="order-details page-content">
        <h1>Order Details</h1>

        {#if isLoading}
            <div class="loading-indicator">
                <p>Loading your purchase history...</p>
            </div>
        {:else if orders.length === 0}
            <p class="no-data">You do not have any previous orders.</p>
        {:else}
            <ul class="order-list">
                {#each orders as order}
                    <li class="order-item">
                        <h2>{order.tyreId.tyreModel} - {order.tyreId.tyreSize}</h2>
                        <p>Purchased from: {order.dealerId.username}</p>
                        <p>Quantity: {order.quantity}</p>
                        <p>Purchase Date: {new Date(order.purchaseDate).toLocaleString()}</p>

                        {#if order.isDealerRated}
                            <div class="rating-display">
                                <span>Dealer Rating: </span>
                                {#each starValues as value}
                                    <span class={value <= order.orderDealerRating ? 'star active' : 'star'}>★</span>
                                {/each}
                            </div>
                        {:else}
                            <div class="rating-container">
                                <p>Rate Dealer:</p>
                                <div class="stars">
                                    {#each starValues as value}
                                        <span
                                            class="star {order.tempDealerRating >= value || order.hoverDealerRating >= value ? 'active' : ''}"
                                            on:click={() => order.tempDealerRating = value}
                                            on:mouseenter={() => order.hoverDealerRating = value}
                                            on:mouseleave={() => order.hoverDealerRating = null}
                                            disabled={isLoading}
                                        >
                                            ★
                                        </span>
                                    {/each}
                                </div>
                                <p>Selected Rating: {order.tempDealerRating || 'Not rated yet'}</p>
                                <button
                                    on:click={() => submitDealerRating(order, order.tempDealerRating)}
                                    disabled={!order.tempDealerRating || isLoading}
                                >
                                    {isLoading ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        {/if}

                        {#if order.isTyreRated}
                            <div class="rating-display">
                                <span>Tyre Rating: </span>
                                {#each starValues as value}
                                    <span class={value <= order.orderTyreRating ? 'star active' : 'star'}>★</span>
                                {/each}
                            </div>
                        {:else}
                            <div class="rating-container">
                                <p>Rate Tyre:</p>
                                <div class="stars">
                                    {#each starValues as value}
                                        <span
                                            class="star {order.tempTyreRating >= value || order.hoverTyreRating >= value ? 'active' : ''}"
                                            on:click={() => order.tempTyreRating = value}
                                            on:mouseenter={() => order.hoverTyreRating = value}
                                            on:mouseleave={() => order.hoverTyreRating = null}
                                            disabled={isLoading}
                                        >
                                            ★
                                        </span>
                                    {/each}
                                </div>
                                <p>Selected Rating: {order.tempTyreRating || 'Not rated yet'}</p>
                                <button
                                    on:click={() => submitTyreRating(order, order.tempTyreRating)}
                                    disabled={!order.tempTyreRating || isLoading}
                                >
                                    {isLoading ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        {/if}
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
{/if}

<style lang="scss">
    @use './_orderDetails.scss' as *;
</style>