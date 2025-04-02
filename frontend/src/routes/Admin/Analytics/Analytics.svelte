<script>
    import { onMount, tick } from 'svelte';
    import { Chart } from 'chart.js/auto';
    import { analyticsApi } from '../../../lib/api';
    import Navbar from '../../../components/Navbar/Navbar.svelte';

    let analyticsData = [];
    let error = null;
    let selectedDealer = null;
    let selectedTyre = null;
    let dealerChart = null;
    let tyreChart = null;

    const navbarItems = [{ label: 'Dashboard', url: '/admin/landing' }];
    const landingPage = '/admin/landing';

    async function fetchAdminAnalytics() {
        const token = localStorage.getItem('token');
        if (!token) {
            error = "No token found. Please log in.";
            return;
        }

        try {
            analyticsData = await analyticsApi.fetchAdminAnalytics(token);
        } catch (err) {
            error = err.message;
        }
    }

    async function renderDealerChart(labels, data, title) {
        await tick();
        const canvasContainer = document.querySelector('.dealerChartContainer');
        if (!canvasContainer) return;
        canvasContainer.innerHTML = '<canvas class="dealerChart"></canvas>';
        const ctx = document.querySelector('.dealerChart').getContext('2d');

        if (dealerChart) dealerChart.destroy();
        dealerChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: title, data, backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }

    async function renderTyreChart(labels, data, title) {
        await tick();
        const canvasContainer = document.querySelector('.tyreChartContainer');
        if (!canvasContainer) return;
        canvasContainer.innerHTML = '<canvas class="tyreChart"></canvas>';
        const ctx = document.querySelector('.tyreChart').getContext('2d');

        if (tyreChart) tyreChart.destroy();
        tyreChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: [{ label: title, data, backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }

    function analyzeDealer(dealer) {
        selectedDealer = dealer;
        const labels = dealer.stocks.map(stock => stock.tyreModel);
        const data = dealer.stocks.map(stock => stock.quantity);
        renderDealerChart(labels, data, `Tyre Stock for ${dealer.dealerName}`);
    }

    function analyzeTyre(tyreModel) {
        selectedTyre = tyreModel;
        const tyreData = analyticsData
            .map(dealer => ({
                dealerName: dealer.dealerName,
                quantity: dealer.stocks.find(stock => stock.tyreModel === tyreModel)?.quantity || 0
            }))
            .filter(entry => entry.quantity > 0);

        const labels = tyreData.map(entry => entry.dealerName);
        const data = tyreData.map(entry => entry.quantity);
        renderTyreChart(labels, data, `Stock of ${tyreModel} by Dealer`);
    }

    function sendMail(dealer, tyre) {
        const subject = encodeURIComponent(`Low Stock Alert: ${tyre.tyreModel}`);
        const body = encodeURIComponent(
            `Dear ${dealer.dealerName},\n\nThe stock for ${tyre.tyreModel} is critically low (${tyre.quantity} left). Please restock soon.\n\nBest Regards,\nAdmin`
        );
        window.location.href = `mailto:${dealer.email}?subject=${subject}&body=${body}`;
    }

    onMount(fetchAdminAnalytics);
</script>

<div class="admin-analytics-page">
    <Navbar {navbarItems} {landingPage} />

    <div class="page-content">
        <h1 class="page-title">Admin Analytics</h1>

        {#if error}
            <p style="color: red;">{error}</p>
        {/if}

        <div class="tables-container">
            <div class="tables-container-section">
                <h2>Dealers</h2>
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
                                <td><button on:click={() => analyzeDealer(dealer)}>Analyze This Dealer</button></td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {#if selectedDealer}
                <div class="chart-section">  
                    <h2>{selectedDealer.dealerName} analysis</h2>

                    <div class="dealerChartContainer">
                        <canvas class="dealerChart"></canvas>
                    </div>
                </div>
            {/if}

            <div class="tables-container-section">
                <h2>Tyres</h2>
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
                                <td><button on:click={() => analyzeTyre(tyreModel)}>Analyze This Tyre</button></td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            {#if selectedTyre}
                <div class="chart-section">
                    <h2>{selectedTyre} analysis</h2>
                    <div class="tyreChartContainer">
                        <canvas class="tyreChart"></canvas>
                    </div>
                </div>
            {/if}

            {#if analyticsData.some(dealer => dealer.stocks.some(tyre => tyre.quantity < 5))}
                <div class="tables-container-section">
                    <h2>Dealer Stock Monitoring</h2>
                    <table class="table-stock">
                        <thead>
                            <tr>
                                <th>Dealer Name</th>
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
                                        <tr>
                                            <td>{dealer.dealerName}</td>
                                            <td>{dealer.email}</td>
                                            <td>{tyre.tyreModel}</td>
                                            <td>{tyre.quantity}</td>
                                            <td><button on:click={() => sendMail(dealer, tyre)}>Send Mail</button></td>
                                        </tr>
                                    {/if}
                                {/each}
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">
    @use './_analytics.scss' as *;
</style>
