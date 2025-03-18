<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { tyresApi } from "../../../lib/api";

    export let tyreModel;
    export let tyreSize;

    let tyre = null;
    let dealerStockDetails = [];
    let errorMessage = "";
    let quantities = {};
    let token = null

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

<main>
    {#if errorMessage}
        <p>{errorMessage}</p>
    {:else if !tyre}
        <p>Loading...</p>
    {:else}
        <h1>{tyre.tyreModel} - {tyre.tyreSize}</h1>
        <p>Price: ${tyre.price}</p>

        <h2>Available Dealers</h2>
        {#if dealerStockDetails.length > 0}
            <ul>
                {#each dealerStockDetails as dealer}
                    <li>
                        <p>Dealer: {dealer.dealerName}</p>
                        <p>Quantity Available: {dealer.quantity}</p>
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
                    </li>
                {/each}
            </ul>
        {:else}
            <p>No dealers have this tyre in stock.</p>
        {/if}
    {/if}
</main>

<style>
    main {
        padding: 20px;
        font-family: Arial, sans-serif;
    }

    h1 {
        font-size: 24px;
        margin-bottom: 10px;
    }

    h2 {
        font-size: 20px;
        margin-top: 20px;
        margin-bottom: 10px;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        border: 1px solid #ddd;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 5px;
    }

    label {
        margin-right: 10px;
    }

    input {
        width: 60px;
        padding: 5px;
        margin-right: 10px;
    }

    button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
    }

    button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
</style>