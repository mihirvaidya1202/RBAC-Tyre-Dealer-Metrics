<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { tyresApi } from "../../../lib/api";
    import Navbar from '../../../components/Navbar/Navbar.svelte';

    let orders = [];
    let errorMessage = "";
    let isLoading = true;

    const starValues = [1, 2, 3, 4, 5];

    const navbarItems = [
        {
            label: 'Dashboard',
            url: '/customer/landing'
        },
        {
            label: 'Purchase History',
            url: '#'
        },
    ]

    const landingPage = '/customer/landing'

    async function fetchPurchaseHistory() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
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
                errorMessage = "You do not have any previous orders.";
            }
        } catch (err) {
            console.error("Error fetching purchase history:", err);
            errorMessage = "Failed to load purchase history.";
        } finally {
            isLoading = false;
        }
    }

    onMount(async () => {
        await fetchPurchaseHistory();
    });

    async function submitDealerRating(order, dealerRating) {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await tyresApi.updateDealerRating(token, order._id, { dealerRating });

            if (response.message === "Dealer rating updated successfully") {
                const updatedOrder = orders.find(o => o._id === order._id);
                if (updatedOrder) {
                    updatedOrder.orderDealerRating = dealerRating;
                    updatedOrder.isDealerRated = true;
                    updatedOrder.tempDealerRating = null;
                    window.location.reload();
                }
            } else {
                errorMessage = "Failed to submit dealer rating.";
            }
        } catch (err) {
            console.error("Error submitting dealer rating:", err);
            errorMessage = "Failed to submit dealer rating.";
        }
    }

    async function submitTyreRating(order, tyreRating) {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await tyresApi.updateTyreRating(token, order._id, { tyreRating });

            if (response.message === "Tyre rating updated successfully") {
                const updatedOrder = orders.find(o => o._id === order._id);
                if (updatedOrder) {
                    updatedOrder.orderTyreRating = tyreRating;
                    updatedOrder.isTyreRated = true;
                    updatedOrder.tempTyreRating = null;

                    window.location.reload();
                }
            } else {
                errorMessage = "Failed to submit tyre rating.";
            }
        } catch (err) {
            console.error("Error submitting tyre rating:", err);
            errorMessage = "Failed to submit tyre rating.";
        }
    }
</script>

<Navbar {navbarItems} {landingPage} />
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

                    {#if order.isDealerRated}
                        <p>Dealer Rating: {order.orderDealerRating}</p>
                    {/if}
                    {#if order.isTyreRated}
                        <p>Tyre Rating: {order.orderTyreRating}</p>
                    {/if}

                    {#if !order.isDealerRated}
                        <div class="rating-container">
                            <p>Rate Dealer:</p>
                            <div class="stars">
                                {#each starValues as value}
                                    <span
                                        class="star {order.tempDealerRating >= value || order.hoverDealerRating >= value ? 'active' : ''}"
                                        on:click={() => order.tempDealerRating = value}
                                        on:mouseenter={() => order.hoverDealerRating = value}
                                        on:mouseleave={() => order.hoverDealerRating = null}
                                    >
                                        ★
                                    </span>
                                {/each}
                            </div>
                            <p>Selected Dealer Rating: {order.tempDealerRating || 'Not rated yet'}</p>
                            <button
                                on:click={() => submitDealerRating(order, order.tempDealerRating)}
                                disabled={!order.tempDealerRating}
                            >
                                Submit Dealer Rating
                            </button>
                        </div>
                    {/if}

                    <!-- Star-based rating for tyre -->
                    {#if !order.isTyreRated}
                        <div class="rating-container">
                            <p>Rate Tyre:</p>
                            <div class="stars">
                                {#each starValues as value}
                                    <span
                                        class="star {order.tempTyreRating >= value || order.hoverTyreRating >= value ? 'active' : ''}"
                                        on:click={() => order.tempTyreRating = value}
                                        on:mouseenter={() => order.hoverTyreRating = value}
                                        on:mouseleave={() => order.hoverTyreRating = null}
                                    >
                                        ★
                                    </span>
                                {/each}
                            </div>
                            <p>Selected Tyre Rating: {order.tempTyreRating || 'Not rated yet'}</p>
                            <button
                                on:click={() => submitTyreRating(order, order.tempTyreRating)}
                                disabled={!order.tempTyreRating}
                            >
                                Submit Tyre Rating
                            </button>
                        </div>
                    {/if}
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

    .rating-container {
        margin-top: 10px;
    }

    .stars {
        display: flex;
        gap: 2px;
    }

    .star {
        cursor: pointer;
        font-size: 24px;
        color: #ccc;
        transition: color 0.2s;
    }

    .star.active {
        color: #ffcc00;
    }

    button {
        padding: 5px 10px;
        background-color: #27509b;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
    }

    button:hover {
        background-color: #0056b3;
    }

    button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
</style>