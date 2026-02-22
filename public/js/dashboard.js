let fraudChart;

function initChart() {
    const ctx = document.getElementById('fraudChart').getContext('2d');

    // Create a glow gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(217, 70, 239, 0.3)');
    gradient.addColorStop(1, 'rgba(217, 70, 239, 0)');

    fraudChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Transaction Amount',
                data: [],
                borderColor: '#d946ef',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                backgroundColor: gradient,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8', maxRotation: 0 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

async function updateDashboard() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        // Update Text Stats
        document.getElementById('total-transactions').innerText = data.totalTransactions;
        document.getElementById('frauds-detected').innerText = data.fraudsDetected;
        document.getElementById('risk-score').innerText = `${data.globalRiskScore}%`;
        document.getElementById('risk-bar').style.width = `${data.globalRiskScore}%`;

        // Update Chart
        if (fraudChart && data.chartLabels && data.chartLabels.length > 0) {
            fraudChart.data.labels = data.chartLabels;
            fraudChart.data.datasets[0].data = data.chartValues;
            fraudChart.update('none'); // Use 'none' for smoother updates
        }
    } catch (err) {
        console.error('Dashboard sync error:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    updateDashboard();
    setInterval(updateDashboard, 3000);
});

console.log(data);