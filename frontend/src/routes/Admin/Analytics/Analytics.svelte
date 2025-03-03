<script>
    import { onMount } from 'svelte';
    import { tyreStocks, loadTyreStocks } from '../../../lib/stores';
    import { Chart } from 'chart.js/auto';

    let chart;

    // Load tyre stocks when the component mounts
    onMount(async () => {
        await loadTyreStocks();

        // Render the chart after data is loaded
        renderChart();
    });

    // Render the analytics chart
    function renderChart() {
        const ctx = document.getElementById('analyticsChart').getContext('2d');
        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: $tyreStocks.map(stock => stock.tyreModel),
                datasets: [{
                    label: 'Tyre Stock Quantity',
                    data: $tyreStocks.map(stock => stock.quantity),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    }
</script>

<style lang="scss">
    @import './_analytics.scss';
</style>

<h1>Admin Dashboard - Analytics</h1>

<canvas id="analyticsChart"></canvas>