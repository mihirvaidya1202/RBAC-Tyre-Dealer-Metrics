<script>
    import { onMount, tick } from "svelte";
    import { navigate } from "svelte-routing";
    import { analyticsApi, tyreStockApi } from "../../../lib/api";
    import { dealerStockStore, tyreStocks } from '../../../lib/stores';
    import { Chart } from 'chart.js/auto';
    import Navbar from '../../../components/Navbar/Navbar.svelte';
    import ErrorTemplate from "../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte";

    let dealer = null;
    let loading = true;
    let quantities = [];
    let error = { message: null, code: null };
    let chart;

    const navbarItems = [
        {
            label: 'Dashboard',
            url: '/dealer/landing'
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
                message: 'You must be logged in to view analytics',
                code: 'UNAUTHORIZED'
            };
            navigate('/login');
            return;
        }

        try {
            loading = true;
            error = { message: null, code: null };

            const [adminStock, dealerStock] = await Promise.all([
                tyreStockApi.fetchTyreStocks(token),
                tyreStockApi.getDealerStock(token)
            ]);

            tyreStocks.set(adminStock);
            quantities = new Array(adminStock.length).fill(1);
            dealerStockStore.set(dealerStock);

            const response = await analyticsApi.fetchDealerAnalytics(token);
            dealer = response.data || response;

            if (dealer?.tyresSold?.length > 0) {
                await tick();
                renderChart(dealer.tyresSold);
            }

        } catch (err) {
            handleApiError(err);
        } finally {
            loading = false;
        }
    });

    async function renderChart(tyresSold) {
        await tick();

        const ctx = document.getElementById('tyreSalesChart')?.getContext('2d');
        if (!ctx) {
            console.error("Canvas element or context not found");
            return;
        }

        if (chart) {
            chart.destroy();
        }

        try {
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: tyresSold.map(tyre => tyre.tyreModel),
                    datasets: [{
                        label: 'Quantity Sold',
                        data: tyresSold.map(tyre => tyre.quantitySold),
                        backgroundColor: 'rgba(0, 123, 255, 0.5)',
                        borderColor: 'rgba(0, 123, 255, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantity Sold'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Tyre Model'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Sold: ${context.raw}`;
                                }
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.error("Chart rendering error:", err);
            error = {
                message: "Failed to render sales chart",
                code: "CHART_ERROR"
            };
        }
    }

    function formatRating(rating) {
        if (rating === null || rating === undefined) return '0';
        const num = Number(rating);
        if (isNaN(num)) return '0';
        return num % 1 === 0 ? num.toString() : num.toFixed(2);
    }
</script>

{#if !error.message && !loading && dealer}
    <Navbar {navbarItems} {landingPage} />
{/if}

<div class="dealer-analytics-page">
    {#if error.message}
        <ErrorTemplate {...error} />
    {:else}
        <div class="page-content">
            <h1 class="page-title">Dealer Analytics</h1>

            {#if loading}
                <div class="loading-indicator">
                    <p>Loading analytics...</p>
                </div>
            {:else if dealer}
                <div class="dealer-stats-container">
                    <div class="dealer-info-card">
                        <h2>Welcome, {dealer.name} !</h2>
                        
                        <div class="stats-wrapper">
                            <div class="total-sold-box">
                                <h3>Total Tyres Sold</h3>
                                <p class="total-number">
                                    {dealer.tyresSold?.reduce((acc, tyre) => acc + tyre.quantitySold, 0) || 0}
                                </p>
                            </div>
                        </div>

                        <div class="rating-wrapper">
                            <div class="rating-distribution">
                                <h3>Customer Ratings</h3>
                                <div class="total-reviews">
                                    Total Reviews: {dealer.totalRatings || 0}
                                </div>
                                <div class="distribution-bars">
                                    {#each [5, 4, 3, 2, 1] as star}
                                        <div class="rating-bar">
                                            <div class="star-label">
                                                {star} ★
                                            </div>
                                            <div class="progress-container">
                                                <div 
                                                    class="progress-fill" 
                                                    style={`width: ${dealer.ratingDistribution?.[star] || 0}%`}
                                                ></div>
                                            </div>
                                            <div class="percentage">
                                                {dealer.ratingDistribution?.[star] || 0}%
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <div class="rating-circle">
                                <div class="circle-background">
                                    <div class="circle-progress" style={`--rating: ${dealer.averageRating || 0}`}>
                                        <span class="rating-value">
                                            {formatRating(dealer.averageRating)} / 5
                                        </span>
                                    </div>
                                </div>
                                <p class="rating-label">Average Rating</p>
                            </div>
                        </div>
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

                    <div class="chart-section tyre-sales">
                        <h2>Most Sold Tyres</h2>
                        {#if dealer.tyresSold && dealer.tyresSold.length > 0}
                            <div class="tyreSalesContainer">
                                <canvas id="tyreSalesChart"></canvas>
                            </div>
                        {:else}
                            <p class="no-data">No tyre sales data available.</p>
                        {/if}
                    </div>
                </div>
            {:else}
                <p class="no-data">No dealer data available.</p>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    @use './_analytics.scss' as *;
</style>