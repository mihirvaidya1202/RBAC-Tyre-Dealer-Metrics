<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { tyresApi } from "../../../lib/api";

    let orders = [];
    let errorMessage = "";
    let isLoading = true;

    onMount(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const data = await tyresApi.getPurchaseHistory(token);

            if (data && data.length > 0) {
                orders = data;
            } else {
                errorMessage = "You do not have any previous orders.";
            }
        } catch (err) {
            console.error("Error fetching purchase history:", err);
            errorMessage = "Failed to load purchase history.";
        } finally {
            isLoading = false;
        }
    });
</script>

<main>
    <h1>Order Details</h1>

    {#if isLoading}
        <p>Loading...</p>
    {:else if errorMessage}
        <p>{errorMessage}</p>
    {:else if orders.length === 0}
        <p>You do not have any previous orders.</p>
    {:else}
        <ul>
            {#each orders as order}
                <li>
                    <h2>{order.tyreId.tyreModel} - {order.tyreId.tyreSize}</h2>
                    <p>Purchased from: {order.dealerId.username}</p>
                    <p>Quantity: {order.quantity}</p>
                    <p>Purchase Date: {new Date(order.purchaseDate).toLocaleString()}</p>
                </li>
            {/each}
        </ul>
    {/if}
</main>

<style>
    main {
        padding: 20px;
        font-family: Arial, sans-serif;
    }

    h1 {
        font-size: 24px;
        margin-bottom: 20px;
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

    h2 {
        font-size: 20px;
        margin-bottom: 10px;
    }

    p {
        margin: 5px 0;
    }
</style>