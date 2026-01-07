// 1. DATA
const brothers = [
    { name: "Omar", streak: 5, misses: 0, progress: 0 },
    { name: "Dave", streak: 2, misses: 1, progress: 0 },
    { name: "Sam", streak: 0, misses: 3, progress: 0 }, // Triggers Roast
    { name: "Leo", streak: 12, misses: 0, progress: 0 }
];

const tasks = [
    { id: 1, title: "Morning Prayer", pillar: "Spiritual" },
    { id: 2, title: "Read 10 Pages", pillar: "Intellectual" },
    { id: 3, title: "Cold Shower", pillar: "Character" },
    { id: 4, title: "No Sugar", pillar: "Character" }
];

// 2. INITIALIZE
function init() {
    renderLeaderboard();
    renderTasks();
    checkShameEngine();
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboard');
    container.innerHTML = brothers.map(b => `
        <div class="brother-card ${b.misses >= 3 ? 'slacker' : ''}">
            <h4>${b.name}</h4>
            <p>Streak: ${b.streak}d</p>
            <p style="color: ${b.misses >= 3 ? '#ef4444' : '#22c55e'}">
                ${b.misses >= 3 ? '🔴 SLACKING' : '🟢 ACTIVE'}
            </p>
        </div>
    `).join('');
}

function renderTasks() {
    tasks.forEach(task => {
        const pillarDiv = document.getElementById(`${task.pillar.toLowerCase()}Tasks`);
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `
            <input type="checkbox" onchange="updateProgress('${task.pillar}')">
            <label>${task.title}</label>
        `;
        pillarDiv.appendChild(div);
    });
}

// 3. SHAME ENGINE LOGIC
function checkShameEngine() {
    const feed = document.getElementById('feed');
    brothers.forEach(b => {
        if (b.misses >= 3) {
            const roast = document.createElement('div');
            roast.className = 'roast-msg';
            roast.innerHTML = `⚠️ SYSTEM: Are you the one to come, ${b.name}, or should we wait for another? You've missed 3 days.`;
            feed.appendChild(roast);
        }
    });
}

function updateProgress(pillar) {
    // In the real app, this sends data to Firebase
    console.log(`Progress updated for ${pillar}`);
}

init();
