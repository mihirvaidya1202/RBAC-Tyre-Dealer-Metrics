<script>
    import { onMount, tick } from 'svelte';
    import { Chart } from 'chart.js/auto';
    import { analyticsApi } from '../../../lib/api';
    import Navbar from '../../../components/Navbar/Navbar.svelte';
    import ErrorTemplate from '../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte';

    let analyticsData = [];
    let error = { message: null, code: null };
    let loading = true;
    let selectedDealer = null;
    let selectedTyre = null;
    let dealerChart = null;
    let tyreChart = null;
    let topDealerPurchase = null;
    let topDealerRating = null;

    const navbarItems = [{ label: 'Dashboard', url: '/admin/landing' }];
    const landingPage = '/admin/landing';

    const handleApiError = (err) => {
        if (err.response) {
            error = {
                message: err.response.message || 'API request failed',
                code: err.response.code || 'API_ERROR'
            };
            
            if (err.response.status === 403) {
                error.message = 'Admin access required. Please login with admin credentials.';
                localStorage.removeItem('token');
            }
        } else {
            error = {
                message: err.message || 'An unexpected error occurred',
                code: 'NETWORK_ERROR'
            };
        }
        console.error('API Error:', err);
    };

    async function fetchAdminAnalytics() {
        const token = localStorage.getItem('token');
        if (!token) {
            error = {
                message: 'You must be logged in to view admin analytics',
                code: 'UNAUTHORIZED'
            };
            return;
        }

        try {
            loading = true;
            error = { message: null, code: null };
            analyticsData = await analyticsApi.fetchAdminAnalytics(token);
        } catch (err) {
            handleApiError(err);
        } finally {
            loading = false;
        }
    }

    async function renderDealerChart(labels, data, title) {
        try {
            await tick();
            const canvasContainer = document.querySelector('.dealerChartContainer');
            if (!canvasContainer) return;
            
            canvasContainer.innerHTML = '<canvas class="dealerChart"></canvas>';
            const ctx = document.querySelector('.dealerChart').getContext('2d');

            if (dealerChart) dealerChart.destroy();
            
            dealerChart = new Chart(ctx, {
                type: 'bar',
                data: { 
                    labels, 
                    datasets: [{ 
                        label: title, 
                        data, 
                        backgroundColor: 'rgba(54, 162, 235, 0.2)', 
                        borderColor: 'rgba(54, 162, 235, 1)', 
                        borderWidth: 1 
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.dataset.label}: ${context.raw}`
                            }
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantity in Stock'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Tyre Models'
                            }
                        }
                    } 
                }
            });
        } catch (err) {
            console.error("Chart error:", err);
            error = {
                message: "Failed to render dealer chart",
                code: "CHART_ERROR"
            };
        }
    }

    async function renderTyreChart(labels, data, title) {
        try {
            await tick();
            const canvasContainer = document.querySelector('.tyreChartContainer');
            if (!canvasContainer) return;
            
            canvasContainer.innerHTML = '<canvas class="tyreChart"></canvas>';
            const ctx = document.querySelector('.tyreChart').getContext('2d');

            if (tyreChart) tyreChart.destroy();
            
            tyreChart = new Chart(ctx, {
                type: 'bar',
                data: { 
                    labels, 
                    datasets: [{ 
                        label: title, 
                        data, 
                        backgroundColor: 'rgba(255, 99, 132, 0.2)', 
                        borderColor: 'rgba(255, 99, 132, 1)', 
                        borderWidth: 1 
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.dataset.label}: ${context.raw}`
                            }
                        }
                    },
                    scales: { 
                        y: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantity in Stock'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Dealers'
                            }
                        }
                    } 
                }
            });
        } catch (err) {
            console.error("Chart error:", err);
            error = {
                message: "Failed to render tyre chart",
                code: "CHART_ERROR"
            };
        }
    }

    function analyzeDealer(dealer) {
        selectedDealer = dealer;
        selectedTyre = null;
        if (tyreChart) {
            tyreChart.destroy();
            tyreChart = null;
        }
        
        const labels = dealer.stocks.map(stock => stock.tyreModel);
        const data = dealer.stocks.map(stock => stock.quantity);
        renderDealerChart(labels, data, `Stock for ${dealer.dealerName}`);
    }

    function analyzeTyre(tyreModel) {
        selectedTyre = tyreModel;
        selectedDealer = null;
        if (dealerChart) {
            dealerChart.destroy();
            dealerChart = null;
        }
        
        const tyreData = analyticsData
            .map(dealer => ({
                dealerName: dealer.dealerName,
                quantity: dealer.stocks.find(stock => stock.tyreModel === tyreModel)?.quantity || 0
            }))
            .filter(entry => entry.quantity > 0);

        const labels = tyreData.map(entry => entry.dealerName);
        const data = tyreData.map(entry => entry.quantity);
        renderTyreChart(labels, data, `Stock of ${tyreModel}`);
    }

    function sendMail(dealer, tyre) {
        const subject = encodeURIComponent(`Low Stock Alert: ${tyre.tyreModel}`);
        const body = encodeURIComponent(
            `Dear ${dealer.dealerName},\n\n` +
            `The stock for ${tyre.tyreModel} is critically low (${tyre.quantity} left). ` +
            `Please consider restocking soon.\n\n` +
            `Best Regards,\nAdmin Team`
        );
        window.location.href = `mailto:${dealer.email}?subject=${subject}&body=${body}`;
    }

    function sendCongratulatoryMail(dealer) {
        const subject = encodeURIComponent("Congratulations! You're the Top Dealer 🎉");
        const body = encodeURIComponent(
            `Hi ${dealer.dealerName},\n\n` +
            `Congratulations! You are the top-performing dealer in terms of tyre purchase!\n\n` +
            `Keep up the great work!\n\n` +
            `Best Regards,\nAdmin Team`
        );
        window.location.href = `mailto:${dealer.email}?subject=${subject}&body=${body}`;
    }

    onMount(fetchAdminAnalytics);

    $: if (!loading && analyticsData.length) {
    topDealerPurchase = analyticsData
        .map(dealer => ({
            ...dealer,
            totalPurchase: dealer.stocks.reduce((sum, stock) => sum + stock.quantity, 0)
        }))
        .sort((a, b) => b.totalPurchase - a.totalPurchase)[0];
    }

    $: if (!loading && analyticsData.length) {
    topDealerRating = analyticsData
        .map(dealer => ({
            ...dealer,
        }))
        .sort((a, b) => b.averageRating - a.averageRating)[0];
    }
</script>

{#if error.message}
    <ErrorTemplate {...error} />
{:else}
    <div class="admin-analytics-page">
        <Navbar {navbarItems} {landingPage} />

        <div class="page-content">
            <h1 class="page-title">Admin Analytics</h1>

            {#if loading}
                <div class="loading-indicator">
                    <p>Loading admin analytics...</p>
                </div>
            {:else}
                <div class="tables-container">
                    <div class="tables-container-section">
                        <h2>Dealers</h2>
                        {#if analyticsData.length === 0}
                            <p class="no-data">No dealers found</p>
                        {:else}
                            <div class="table-container">
                                <table class="table-dealer">
                                    <thead>
                                        <tr>
                                            <th>Dealer Name</th>
                                            <th>Email</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each analyticsData as dealer}
                                            <tr>
                                                <td>{dealer.dealerName}</td>
                                                <td>{dealer.email}</td>
                                                <td>
                                                    <button 
                                                        on:click={() => analyzeDealer(dealer)}
                                                        disabled={!dealer.stocks || dealer.stocks.length === 0}
                                                    >
                                                        {!dealer.stocks || dealer.stocks.length === 0 ? 'No Stock' : 'Analyze'}
                                                    </button>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>

                    {#if selectedDealer}
                        <div class="chart-section">  
                            <h2>{selectedDealer.dealerName} Stock Analysis</h2>
                            {#if selectedDealer.stocks && selectedDealer.stocks.length > 0}
                                <div class="chart-container">
                                    <div class="dealerChartContainer"></div>
                                </div>
                            {:else}
                                <p class="no-data">No stock data available for this dealer</p>
                            {/if}
                        </div>
                    {/if}

                    <div class="tables-container-section">
                        <h2>Tyres</h2>
                        {#if analyticsData.flatMap(d => d.stocks).length === 0}
                            <p class="no-data">No tyre data available</p>
                        {:else}
                            <div class="table-container">
                                <table class="table-tyres">
                                    <thead>
                                        <tr>
                                            <th>Tyre Model</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each [...new Set(analyticsData.flatMap(dealer => dealer.stocks.map(stock => stock.tyreModel)))] as tyreModel}
                                            <tr>
                                                <td>{tyreModel}</td>
                                                <td>
                                                    <button on:click={() => analyzeTyre(tyreModel)}>
                                                        Analyze
                                                    </button>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>

                    {#if selectedTyre}
                        <div class="chart-section">
                            <h2>{selectedTyre} Distribution</h2>
                            <div class="chart-container">
                                <div class="tyreChartContainer"></div>
                            </div>
                        </div>
                    {/if}

                    {#if topDealerPurchase}
                        <div class="tables-container-section">
                            <h2>🏆 Top Dealer: Purchase</h2>

                            <div class="table-container">
                                <table class="table-tyres">
                                    <thead>
                                        <tr>
                                            <th>Dealer</th>
                                            <th>Tyre Purchased</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{topDealerPurchase.dealerName}</td>
                                            <td>{topDealerPurchase.totalPurchase}</td>
                                            <td>
                                                <button on:click={() => sendCongratulatoryMail(topDealerPurchase)}>
                                                    Send Congratulations
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {/if}

                    {#if topDealerRating}
                        <div class="tables-container-section">
                            <h2>🏆 Top Dealer: Rating</h2>

                            <div class="table-container">
                                <table class="table-tyres">
                                    <thead>
                                        <tr>
                                            <th>Dealer</th>
                                            <th>Dealer Rating</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{topDealerRating.dealerName}</td>
                                            <td>{topDealerRating.averageRating}</td>
                                            <td>
                                                <button on:click={() => sendCongratulatoryMail(topDealerPurchase)}>
                                                    Send Congratulations
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {/if}


                    {#if analyticsData.some(dealer => dealer.stocks.some(tyre => tyre.quantity < 5))}
                        <div class="tables-container-section stock-alerts">
                            <h2>⚠️ Low Stock Alerts</h2>

                            <div class="table-container">
                                <table class="table-stock">
                                    <thead>
                                        <tr>
                                            <th>Dealer</th>
                                            <th>Email</th>
                                            <th>Tyre Model</th>
                                            <th>Stock</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each analyticsData as dealer}
                                            {#each dealer.stocks as tyre}
                                                {#if tyre.quantity < 5}
                                                    <tr class:critical={tyre.quantity < 3}>
                                                        <td>{dealer.dealerName}</td>
                                                        <td>{dealer.email}</td>
                                                        <td>{tyre.tyreModel}</td>
                                                        <td>{tyre.quantity}</td>
                                                        <td>
                                                            <button on:click={() => sendMail(dealer, tyre)}>
                                                                Notify Dealer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                {/if}
                                            {/each}
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {:else}
                        <div class="tables-container-section">
                            <h2>Stock Status</h2>
                            <p class="positive">All dealers have sufficient stock levels</p>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style lang="scss">
    @use './_analytics.scss' as *;
</style>