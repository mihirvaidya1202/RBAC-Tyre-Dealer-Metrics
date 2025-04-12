<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { dealerStockStore, tyreStocks } from '../../../lib/stores';
    import { tyreStockApi } from '../../../lib/api';
    import Navbar from '../../../components/Navbar/Navbar.svelte';
    import ErrorTemplate from '../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte';

    let error = { message: null, code: null };
    let isLoading = false;
    let quantities = [];

    const navbarItems = [
        {
            label: 'Analytics',
            url: '/dealer/analytics'
        }
    ];

    const landingPage = '/dealer/landing';

    const handleApiError = (err) => {
        if (err.response) {
            error = {
                message: err.response.message || 'API request failed',
                code: err.response.code || 'API_ERROR'
            };
            
            if (err.response.status === 403) {
                error.message = 'Access denied. Please login again.';
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

    onMount(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            error = {
                message: 'You must be logged in to access this page',
                code: 'UNAUTHORIZED'
            };
            navigate('/login');
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };

            const [adminStock, dealerStock] = await Promise.all([
                tyreStockApi.fetchTyreStocks(token),
                tyreStockApi.getDealerStock(token)
            ]);

            tyreStocks.set(adminStock);
            quantities = new Array(adminStock.length).fill(1);
            dealerStockStore.set(dealerStock);

        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    });

    const handleAddToDealerStock = async (stock, quantity) => {
        if (!quantity || quantity < 1 || quantity > stock.quantity) {
            error = {
                message: "Invalid quantity selected. Must be between 1 and available quantity.",
                code: 'VALIDATION_ERROR'
            };
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            error = {
                message: 'You must be logged in to add stock',
                code: 'UNAUTHORIZED'
            };
            navigate('/login');
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };
            
            await tyreStockApi.addToDealerStock(stock._id, quantity, token);

            const [updatedDealerStock, updatedAdminStock] = await Promise.all([
                tyreStockApi.getDealerStock(token),
                tyreStockApi.fetchTyreStocks(token)
            ]);

            dealerStockStore.set(updatedDealerStock);
            tyreStocks.set(updatedAdminStock);

        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    };
</script>

{#if !error.message}
    <Navbar {navbarItems} {landingPage} />
{/if}

<div class="landing-page">
    <div class="page-content">
        {#if error.message}
            <ErrorTemplate {...error} />
        {:else}
            <h1 class="page-title">Dealer Dashboard</h1>

            {#if isLoading}
                <div class="loading-indicator">
                    <p>Loading...</p>
                </div>
            {:else}
                <div class="available-stock-table">
                    <h2>Available Tyre Stocks from Admin</h2>
                    
                    {#if $tyreStocks.length === 0}
                        <p class="no-data">No available stock from admin.</p>
                    {:else}
                        <div class="stock-table-container">
                            <table class="stock-table">
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
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    max={stock.quantity} 
                                                    bind:value={quantities[index]} 
                                                    disabled={isLoading}
                                                />
                                            </td>
                                            <td>
                                                <button 
                                                    on:click={() => handleAddToDealerStock(stock, quantities[index])} 
                                                    disabled={isLoading || !quantities[index] || quantities[index] < 0 || quantities[index] > stock.quantity}
                                                >
                                                    {isLoading ? 'Processing...' : 'Add to My Stock'}
                                                </button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </div>
                
                <div class="purchased-stock-table">
                    <h2>Your Tyre Stocks</h2>
                
                    {#if !$dealerStockStore || $dealerStockStore.length === 0}
                        <p class="no-data">No tyre stocks available.</p>
                    {:else}
                        <div class="stock-table-container">
                            <table class="stock-table">
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
                        </div>
                    {/if}
                </div>
            {/if}
        {/if}
    </div>
</div>

<style lang="scss">
    @use './_landing.scss' as *;
</style>