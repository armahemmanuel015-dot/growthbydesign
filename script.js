const ctx = document.getElementById('performanceChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Brotherhood Average',
            data: [65, 78, 90, 85, 92, 88, 95], // Example group data
            borderColor: '#7f56d9', // Monday.com Purple
            backgroundColor: 'rgba(127, 86, 217, 0.1)',
            fill: true,
            tension: 0.4 // Makes the lines smooth/professional
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, max: 100, grid: { display: false } },
            x: { grid: { display: false } }
        }
    }
});
