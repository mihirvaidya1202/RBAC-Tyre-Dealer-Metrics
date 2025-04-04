<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { tyresApi } from "../../../lib/api";
    import Navbar from '../../../components/Navbar/Navbar.svelte';


    export let tyreModel;
    export let tyreSize;

    let tyre = null;
    let dealerStockDetails = [];
    let errorMessage = "";
    let quantities = {};
    let token = null;

    const navbarItems = [
        {
            label: 'Dashboard',
            url: '/customer/landing'
        },
        {
            label: 'Purchase History',
            url: '/customer/purchase-history'
        },
    ]

    const landingPage = '/customer/landing'

    onMount(async () => {
        token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const data = await tyresApi.getTyreDetails(tyreModel, tyreSize, token);

            if (data) {
                tyre = data.tyre;
                dealerStockDetails = data.dealerStockDetails;

                dealerStockDetails.forEach((dealer) => {
                    quantities[dealer.dealerId] = 1;
                });
            } else {
                errorMessage = "Tyre details not found.";
            }
        } catch (err) {
            console.error("Error fetching tyre details:", err);
            errorMessage = "Failed to load tyre details.";
        }
    });

    const handleBuy = async (dealerId, tyreId) => {
        const quantity = quantities[dealerId];

        if (!quantity || quantity <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        try {
            const response = await tyresApi.buyTyre(dealerId, tyreId, quantity, token);
            navigate('/customer/purchase-history');
        } catch (err) {
            console.error("Error purchasing tyre:", err);
            alert("Failed to purchase tyre. Please try again.");
        }
    };
</script>

<Navbar {navbarItems} {landingPage} />
<div class="tyre-details page-content">
    {#if errorMessage}
        <p>{errorMessage}</p>
    {:else if !tyre}
        <p>Loading...</p>
    {:else}
        <h1>{tyre.tyreModel} - {tyre.tyreSize}</h1>

        <h2>Available Dealers</h2>
        {#if dealerStockDetails.length > 0}
            <ul>
                {#each dealerStockDetails as dealer}
                    {#if dealer.quantity != 0}
                        <li>
                            <p>Dealer: {dealer.dealerName}</p>
                            <p>Average Rating: {dealer.averageRating ?? 'No ratings yet'}</p>
                            <p>Quantity Available: {dealer.quantity}</p>
                            <!-- we will change this if we decide to add different selling price for each dealer -->
                            <p>Price: ${tyre.price}</p> 

                            <div class="purchase-container">
                                <label for={`quantity-${dealer.dealerId}`}>Quantity:</label>
                                <input
                                    type="number"
                                    id={`quantity-${dealer.dealerId}`}
                                    bind:value={quantities[dealer.dealerId]}
                                    min="1"
                                    max={dealer.quantity}
                                />
                                <button
                                    on:click={() => handleBuy(dealer.dealerId, tyre._id)}
                                    disabled={quantities[dealer.dealerId] > dealer.quantity || quantities[dealer.dealerId] <= 0}
                                >
                                    Buy
                                </button>
                            </div>
                        </li>
                    {/if}
                {/each}
            </ul>
        {:else}
            <p>No dealers have this tyre in stock.</p>
        {/if}
    {/if}
</div>

<style lang="scss">
    @use './_tyreDetails.scss' as *;
</style>