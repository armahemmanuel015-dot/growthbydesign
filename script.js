// 1. Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCu03ePMFx9mDgbCdT9LWcoPOg2SGQIBEU",
    authDomain: "growthbydesign-2a6d0.firebaseapp.com",
    projectId: "growthbydesign-2a6d0",
    storageBucket: "growthbydesign-2a6d0.firebasestorage.app",
    messagingSenderId: "807311473882",
    appId: "1:807311473882:web:49300d2d84355eb4cbb9e3"
};

// 2. Initialize
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// --- 3. AUTHENTICATION LOGIC ---

// Toggle between Login and Signup UI
window.toggleAuth = function() {
    document.getElementById('authWrapper').classList.toggle('toggled');
};

// Handle Signup
document.getElementById('signUpBtn').addEventListener('click', async () => {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;

    try {
        const cred = await auth.createUserWithEmailAndPassword(email, pass);
        // Create user profile in Firestore
        await db.collection('users').doc(cred.user.uid).set({
            name: name,
            email: email,
            progress: 0,
            joinedAt: new Date()
        });
        console.log("Covenant Signed.");
    } catch (err) {
        alert(err.message);
    }
});

// Handle Login
document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    try {
        await auth.signInWithEmailAndPassword(email, pass);
        console.log("Entered the Design.");
    } catch (err) {
        alert("Invalid credentials. Try again.");
    }
});

// Handle Logout
window.handleLogout = function() {
    auth.signOut();
};

// Auth State Observer (Switches screens)
// Auth Guard & Redirection
// Auth Guard Logic
firebase.auth().onAuthStateChanged(user => {
    const path = window.location.pathname;
    const isAuthPage = path.includes("index.html") || path.endsWith("/");

    if (user) {
        if (isAuthPage) window.location.href = "dashboard.html";
        // Initialize App
        document.getElementById('userNameDisplay').innerText = user.displayName || "Brother";
        initData(user.uid);
    } else {
        if (!isAuthPage) window.location.href = "index.html";
    }
});

// Production Theme Persistence
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('gbd-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

if (localStorage.getItem('gbd-theme') === 'light') document.body.classList.add('light-mode');

// Auth Toggle (Sliding animation)
window.toggleAuth = function() {
    document.getElementById('authWrapper').classList.toggle('signup-active');
};
// --- 4. APP LOGIC ---

function initUserApp(uid) {
    // Listen for current user's tasks
    db.collection("tasks").where("userId", "==", uid)
      .onSnapshot(snap => {
          const tasks = snap.docs.map(d => ({id: d.id, ...d.data()}));
          runRecurrenceEngine(tasks); // Reset daily tasks if needed
          renderTaskList(tasks);
          updateProgressUI(tasks, uid);
      });

    // Listen for Brotherhood Leaderboard
    db.collection("users").onSnapshot(snap => {
        const users = snap.docs.map(d => d.data());
        const board = document.getElementById('miniLeaderboard');
        board.innerHTML = users.map(u => `
            <div style="margin-bottom:12px">
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
                    <span>${u.name}</span><span>${u.progress}%</span>
                </div>
                <div class="progress-container" style="height:6px; margin:0;"><div class="progress-fill" style="width:${u.progress}%"></div></div>
            </div>
        `).join('');
    });
}

// Reset Daily Tasks Logic
async function runRecurrenceEngine(tasks) {
    const today = new Date().toDateString();
    for (let t of tasks) {
        if (t.frequency === 'daily' && t.done) {
            const lastReset = t.lastCompleted?.toDate().toDateString();
            if (lastReset !== today) {
                await db.collection("tasks").doc(t.id).update({ done: false });
            }
        }
    }
}

window.addTask = async function() {
    const title = document.getElementById('taskInput').value;
    const freq = document.getElementById('frequencyInput').value;
    const pillar = document.getElementById('pillarInput').value;
    const priority = document.getElementById('priorityInput').value;

    if (!title) return;

    await db.collection("tasks").add({
        userId: auth.currentUser.uid,
        title, frequency: freq, pillar, priority,
        done: false,
        createdAt: new Date()
    });
    document.getElementById('taskInput').value = '';
};

window.toggleDone = async function(id, status) {
    await db.collection("tasks").doc(id).update({ 
        done: !status,
        lastCompleted: !status ? new Date() : null 
    });
};

window.deleteTask = async function(id) {
    if(confirm("Delete this discipline?")) await db.collection("tasks").doc(id).delete();
};

function renderTaskList(tasks) {
    const list = document.getElementById('masterTaskList');
    list.innerHTML = tasks.map(t => `
        <div class="task-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; align-items: center;">
            <div style="display:flex; gap:12px; align-items:center;">
                <input type="checkbox" ${t.done ? 'checked' : ''} onclick="toggleDone('${t.id}', ${t.done})">
                <div style="${t.done ? 'text-decoration:line-through; opacity:0.5' : ''}">
                    ${t.title}
                    <div style="font-size:9px; color:var(--accent); text-transform:uppercase;">${t.frequency}</div>
                </div>
            </div>
            <div><span class="pillar-pill">${t.pillar}</span></div>
            <div class="flag flag-${t.priority}">
                <i data-lucide="flag" size="12" fill="currentColor"></i> ${t.priority.toUpperCase()}
            </div>
            <i data-lucide="trash-2" class="btn-delete" onclick="deleteTask('${t.id}')"></i>
        </div>
    `).join('');
    lucide.createIcons();
}

function updateProgressUI(tasks, uid) {
    const pct = tasks.length ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;
    document.getElementById('myProgressFill').style.width = pct + '%';
    document.getElementById('progressText').innerText = pct + '% Complete';
    db.collection("users").doc(uid).update({ progress: pct });
}

window.showView = function(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    event.currentTarget.classList.add('active');
    lucide.createIcons();
};
