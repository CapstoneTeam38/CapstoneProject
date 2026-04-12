let fraudChart;

function initChart() {
    const ctx = document.getElementById('fraudChart').getContext('2d');
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

        // Update KPI cards
        document.getElementById('total-transactions').innerText =
            data.totalTransactions ? data.totalTransactions.toLocaleString() : '0';
        document.getElementById('frauds-detected').innerText =
            data.fraudsDetected ? data.fraudsDetected.toLocaleString() : '0';
        document.getElementById('risk-score').innerText =
            `${data.globalRiskScore || 0}%`;
        document.getElementById('risk-bar').style.width =
            `${Math.min(data.globalRiskScore || 0, 100)}%`;

        // Update chart — use live rolling data points
        if (fraudChart) {
            const now = new Date().toLocaleTimeString();
            if (fraudChart.data.labels.length > 20) {
                fraudChart.data.labels.shift();
                fraudChart.data.datasets[0].data.shift();
            }
            fraudChart.data.labels.push(now);
            fraudChart.data.datasets[0].data.push(data.fraudsDetected || 0);
            fraudChart.update('none');
        }

        // Add new nav links if not already present
        addNavLinks();

    } catch (err) {
        console.error('Dashboard sync error:', err);
        document.getElementById('total-transactions').innerText = 'Flask offline';
    }
}

function addNavLinks() {
    const nav = document.querySelector('nav ul');
    if (!nav) return;
    const links = [
        { href: '/analytics', label: 'Analytics' },
        { href: '/model-stats', label: 'Model Performance' },
        { href: '/shap', label: 'SHAP Explainer' },
        { href: '/cases', label: 'Case Review' }
    ];
    links.forEach(link => {
        if (!document.querySelector(`[data-nav="${link.href}"]`)) {
            const li = document.createElement('li');
            li.setAttribute('data-nav', link.href);
            li.onclick = () => location.href = link.href;
            li.className = 'flex items-center gap-3 text-slate-500 hover:text-slate-200 p-4 rounded-2xl transition cursor-pointer hover:bg-white/5';
            li.textContent = link.label;
            nav.appendChild(li);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    updateDashboard();
    setInterval(updateDashboard, 3000);
});