<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { tyresApi } from "../../../lib/api";
    import Navbar from '../../../components/Navbar/Navbar.svelte';
    import ErrorTemplate from '../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte';

    export let tyreModel;
    export let tyreSize;

    let tyre = null;
    let dealerStockDetails = [];
    let isLoading = false;
    let error = { message: null, code: null };
    let quantities = {};
    let token = null;

    const navbarItems = [
        { label: 'Dashboard', url: '/customer/landing' },
        { label: 'Purchase History', url: '/customer/purchase-history' },
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

    onMount(async () => {
        token = localStorage.getItem('token');
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
            
            const data = await tyresApi.getTyreDetails(tyreModel, tyreSize, token);
            if (data) {
                tyre = data.tyre;
                dealerStockDetails = data.dealerStockDetails;
                dealerStockDetails.forEach((dealer) => {
                    quantities[dealer.dealerId] = 1;
                });
            } else {
                error = {
                    message: "Tyre details not found",
                    code: 'NOT_FOUND'
                };
            }
        } catch (err) {
            handleApiError(err);
        } finally {
            isLoading = false;
        }
    });

    const handleBuy = async (dealerId, tyreId) => {
        const quantity = quantities[dealerId];

        if (!quantity || quantity <= 0) {
            error = {
                message: "Please enter a valid quantity",
                code: 'VALIDATION_ERROR'
            };
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };
            
            await tyresApi.buyTyre(dealerId, tyreId, quantity, token);
            navigate('/customer/purchase-history');
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

<div class="tyre-details page-content">
    {#if error.message}
        <ErrorTemplate {...error} />
    {:else if isLoading}
        <div class="loading-indicator">
            <p>Loading tyre details...</p>
        </div>
    {:else if !tyre}
        <p class="no-data">Tyre details not found.</p>
    {:else}
        <h1>{tyre.tyreModel} - {tyre.tyreSize}</h1>

        <h2>Available Dealers</h2>
        {#if dealerStockDetails.length > 0}
            <ul class="dealer-list">
                {#each dealerStockDetails as dealer}
                    {#if dealer.quantity != 0}
                        <li class="dealer-item">
                            <p>Dealer: {dealer.dealerName}</p>
                            <p>Average Rating: {dealer.averageRating ?? 'No ratings yet'}</p>
                            <p>Quantity Available: {dealer.quantity}</p>
                            <p>Price: ${tyre.price}</p>

                            <div class="purchase-container">
                                <label for={`quantity-${dealer.dealerId}`}>Quantity:</label>
                                <input
                                    type="number"
                                    id={`quantity-${dealer.dealerId}`}
                                    bind:value={quantities[dealer.dealerId]}
                                    min="1"
                                    max={dealer.quantity}
                                    disabled={isLoading}
                                />
                                <button
                                    on:click={() => handleBuy(dealer.dealerId, tyre._id)}
                                    disabled={isLoading || quantities[dealer.dealerId] > dealer.quantity || quantities[dealer.dealerId] <= 0}
                                >
                                    {isLoading ? 'Processing...' : 'Buy'}
                                </button>
                            </div>
                        </li>
                    {/if}
                {/each}
            </ul>
        {:else}
            <p class="no-data">No dealers have this tyre in stock.</p>
        {/if}
    {/if}
</div>

<style lang="scss">
    @use './_tyreDetails.scss' as *;
</style>