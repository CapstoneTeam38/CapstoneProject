let fraudChart;

// ---------------------------
// Risk Level Logic
// ---------------------------
function getRiskLevel(score) {
    if (score >= 70) {
        return { label: "HIGH RISK", color: "#ef4444" };   // red
    } else if (score >= 30) {
        return { label: "MEDIUM RISK", color: "#f59e0b" }; // amber
    } else {
        return { label: "LOW RISK", color: "#10b981" };    // emerald
    }
}

// ---------------------------
// Initialize Chart
// ---------------------------
function initChart() {
    const canvas = document.getElementById('fraudChart');
    const ctx = canvas.getContext('2d');

    // Create a tall gradient for a deeper look
    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, 'rgba(217, 70, 239, 0.4)'); // Magenta-ish
    gradient.addColorStop(1, 'rgba(217, 70, 239, 0)');

    fraudChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Live Fraud Risk (%)',
                data: [],
                borderColor: '#d946ef',
                borderWidth: 4,      // Thicker line for "Big" look
                tension: 0.4,       // Smooth bezier curves
                fill: true,
                backgroundColor: gradient,
                pointRadius: 0,      // Hide points for a cleaner line
                pointHoverRadius: 6,
                pointHitRadius: 30,
                pointBackgroundColor: '#d946ef'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Essential to fill the 500px height
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e1e2e',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => ` Risk: ${context.parsed.y}%`
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 12, family: 'Plus Jakarta Sans' },
                        stepSize: 20,
                        callback: (value) => value + '%'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// ---------------------------
// Update Dashboard Data
// ---------------------------
async function updateDashboard() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        // Update Counter Stats
        document.getElementById('total-transactions').innerText = data.totalTransactions.toLocaleString();
        document.getElementById('frauds-detected').innerText = data.fraudsDetected.toLocaleString();

        // Update Risk Indicators
        const riskScore = data.globalRiskScore || 0;
        const riskInfo = getRiskLevel(riskScore);

        const riskElement = document.getElementById('risk-score');
        const riskBar = document.getElementById('risk-bar');
        const riskLabel = document.getElementById('risk-label');

        if (riskElement) {
            riskElement.innerText = `${riskScore}%`;
            riskElement.style.color = riskInfo.color;
        }

        if (riskBar) {
            riskBar.style.width = `${riskScore}%`;
            riskBar.style.backgroundColor = riskInfo.color;
            riskBar.style.boxShadow = `0 0 15px ${riskInfo.color}66`; // Glow effect
        }

        if (riskLabel) {
            riskLabel.innerText = riskInfo.label;
            riskLabel.style.color = riskInfo.color;
        }

        // Sync Chart Data
        // Inside updateDashboard()
if (fraudChart && data.chartLabels?.length > 0) {
    // This ensures every value is capped between 0 and 100
    const cappedValues = data.chartValues.map(val => Math.min(100, Math.max(0, val)));
    
    fraudChart.data.labels = data.chartLabels;
    fraudChart.data.datasets[0].data = cappedValues;
    fraudChart.update('none');
}

    } catch (err) {
        console.error('Dashboard sync error:', err);
    }
}

// ---------------------------
// Execution
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    updateDashboard();

    // Refresh every 3 seconds for a responsive feel
    setInterval(updateDashboard, 3000);
});