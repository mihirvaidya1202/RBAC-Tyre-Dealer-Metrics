<script>
    import { onMount } from "svelte";
    import { navigate, useParams } from "svelte-routing";
    import { tyresApi } from "../../../lib/api";

    let { tyreModel } = useParams();
    let tyreDetails = null;
    let selectedDealer = null;
    let quantity = 1;
    let orderPlaced = false;

    async function fetchTyreDetails() {
        const data = await tyresApi.getTyreDetails(tyreModel);
        tyreDetails = data.filter(dealer => dealer.quantity > 0);
    }

    async function placeOrder() {
        if (!selectedDealer) return alert("Please select a dealer!");
        if (quantity > selectedDealer.quantity) return alert("Not enough stock!");

        await tyresApi.buyTyre(selectedDealer.dealerId, tyreModel, quantity);
        
        orderPlaced = true;
        selectedDealer.quantity -= quantity;

        tyreDetails = tyreDetails.filter(dealer => dealer.quantity > 0);
    }

    function goBackToLanding() {
        navigate("/");
    }

    onMount(fetchTyreDetails);
</script>

<div class="tyre-page">
    {#if orderPlaced}
        <h2>Order Successfully Placed!</h2>
        <button on:click={goBackToLanding}>Back to Tyres</button>
    {:else}
        <h1>Buy {tyreModel}</h1>

        {#if tyreDetails && tyreDetails.length > 0}
            <label for="dealer">Select Dealer:</label>
            <select bind:value={selectedDealer}>
                <option value="" disabled selected>Select Dealer</option>
                {#each tyreDetails as dealer}
                    <option value={dealer}>{dealer.dealerName} - {dealer.quantity} available</option>
                {/each}
            </select>

            <label for="quantity">Enter Quantity:</label>
            <input type="number" bind:value={quantity} min="1" />

            <button on:click={placeOrder}>Buy Now</button>
        {:else}
            <p>No dealers have stock for this tyre.</p>
        {/if}
    {/if}
</div>

<style>
    .tyre-page {
        padding: 20px;
        text-align: center;
    }
</style>
