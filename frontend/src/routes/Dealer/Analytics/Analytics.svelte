<script>
    import { onMount, tick } from "svelte";
    import { navigate } from "svelte-routing";
    import { analyticsApi } from "../../../lib/api";
    import { Chart } from 'chart.js/auto';
    import Navbar from '../../../components/Navbar/Navbar.svelte';
    import ErrorTemplate from "../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte";

    let dealer = null;
    let loading = true;
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
</script>

{#if !error.message && !loading && dealer}
    <Navbar {navbarItems} {landingPage} />
{/if}

<div class="dealer-analytics-page">
    {#if error.message}
        <ErrorTemplate {...error} />
    {:else}
        <div class="page-content">
            <h1>Dealer Analytics</h1>

            {#if loading}
                <div class="loading-indicator">
                    <p>Loading analytics...</p>
                </div>
            {:else if dealer}
                <div class="dealer-info">
                    <h2>Welcome {dealer.name} !</h2>
                    <p>Average Rating: {dealer.averageRating || 'No ratings yet'}</p>
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
            {:else}
                <p class="no-data">No dealer data available.</p>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    @use './_analytics.scss' as *;
</style>