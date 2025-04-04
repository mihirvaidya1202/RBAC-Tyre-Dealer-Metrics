<script>
    import { onMount, tick } from "svelte";
    import { navigate } from "svelte-routing";
    import { analyticsApi } from "../../../lib/api";
    import { Chart } from 'chart.js/auto';
    import Navbar from '../../../components/Navbar/Navbar.svelte';

    let dealer = null;
    let loading = true;
    let error = "";
    let chart;

    const navbarItems = [
        {
            label: 'Dashboard',
            url: '/dealer/landing'
        }
    ]

    const landingPage = '/dealer/landing'

    onMount(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await analyticsApi.fetchDealerAnalytics(token);
            dealer = response.data || response;

            if (dealer?.tyresSold?.length > 0) {
                await tick();
                renderChart(dealer.tyresSold);
            }
        } catch (err) {
            console.error("Error fetching dealer analytics:", err);
            error = "Failed to load dealer analytics.";
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
                    }
                }
            }
        });
    }
</script>

<Navbar {navbarItems} {landingPage} />
<main>
    {#if error}
        <p>{error}</p>
    {:else if loading}
        <p>Loading...</p>
    {:else if dealer}
        <h1>Dealer Analytics</h1>
        <div class="dealer-info">
            <h2>{dealer.name}</h2>
            <p>Average Rating: {dealer.averageRating || 'No ratings yet'}</p>
        </div>

        <div class="tyre-sales">
            <h2>Most Sold Tyres</h2>
            {#if dealer.tyresSold && dealer.tyresSold.length > 0}
                <canvas id="tyreSalesChart"></canvas>
            {:else}
                <p>No tyre sales data available.</p>
            {/if}
        </div>
    {:else}
        <p>Dealer not found.</p>
    {/if}
</main>

<style>
    main {
        padding: 1.6rem;
        font-family: Arial, sans-serif;
    }

    h1 {
        font-size: 2.4rem;
        margin-bottom: 0.8rem;
    }

    .dealer-info {
        background: #f9f9f9;
        padding: 1.6rem;
        border-radius: 0.8rem;
        margin-top: 1.6rem;
    }

    h2 {
        font-size: 2rem;
        margin-bottom: 0.8rem;
    }

    .tyre-sales {
        margin-top: 1.6rem;
    }

    canvas {
        max-width: 100%;
        height: auto;
    }
</style>
