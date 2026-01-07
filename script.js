// script.js
const firebaseConfig = {  apiKey: "AIzaSyCu03ePMFx9mDgbCdT9LWcoPOg2SGQIBEU",
    authDomain: "growthbydesign-2a6d0.firebaseapp.com",
    projectId: "growthbydesign-2a6d0",
    storageBucket: "growthbydesign-2a6d0.firebasestorage.app",
    messagingSenderId: "807311473882",
    appId: "1:807311473882:web:49300d2d84355eb4cbb9e3",
    measurementId: "G-FH1R6YERFB" };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// --- VIEW NAVIGATION ---
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    lucide.createIcons();
}

function toggleAuth() {
    document.getElementById('authWrapper').classList.toggle('toggled');
}

// --- AUTH LOGIC ---
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'flex';
        initUserStream(user.uid);
    } else {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('appSection').style.display = 'none';
    }
});

// --- CORE DATA STREAMS ---
function initUserStream(uid) {
    // Listen for Tasks
    db.collection("tasks").where("userId", "==", uid).onSnapshot(snap => {
        const tasks = snap.docs.map(d => ({id: d.id, ...d.data()}));
        renderTaskList(tasks);
        updateProgressUI(tasks, uid);
    });

    // Listen for Leaderboard
    db.collection("users").onSnapshot(snap => {
        const users = snap.docs.map(d => d.data());
        document.getElementById('miniLeaderboard').innerHTML = users.map(u => `
            <div style="margin-bottom:10px">${u.name}: ${u.progress}%</div>
        `).join('');
    });
}

function updateProgressUI(tasks, uid) {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pct = total ? Math.round((done/total)*100) : 0;
    
    document.getElementById('myProgressFill').style.width = pct + '%';
    document.getElementById('progressText').innerText = pct + '% Complete';
    document.getElementById('myProgressHeader')?.innerText = pct + '%'; // If exists
    
    db.collection("users").doc(uid).set({ progress: pct }, {merge: true});
}

function renderTaskList(tasks) {
    const list = document.getElementById('masterTaskList');
    list.innerHTML = tasks.map(t => `
        <div class="task-row">
            <div style="display:flex; gap:15px; align-items:center;">
                <input type="checkbox" ${t.done ? 'checked' : ''} onclick="toggleDone('${t.id}', ${t.done})">
                <span>${t.title} <small style="color:var(--muted)">(${t.pillar})</small></span>
            </div>
            <i data-lucide="trash-2" class="btn-delete" onclick="deleteTask('${t.id}')"></i>
        </div>
    `).join('');
    lucide.createIcons();
}

// --- DATABASE ACTIONS ---
// --- Updated Add Task ---
async function addTask() {
    const title = document.getElementById('taskInput').value;
    const pillar = document.getElementById('pillarInput').value;
    const priority = document.getElementById('priorityInput').value; // New
    if(!title) return;

    await db.collection("tasks").add({
        userId: auth.currentUser.uid,
        title, 
        pillar, 
        priority, // New
        done: false, 
        createdAt: new Date()
    });
    
    document.getElementById('taskInput').value = '';
}

// --- Updated Rendering ---
function renderTaskList(tasks) {
    const list = document.getElementById('masterTaskList');
    list.innerHTML = tasks.map(t => {
        // Determine Flag Color Class
        const flagClass = `flag-${t.priority || 'normal'}`;
        
        return `
        <div class="task-row" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; align-items: center;">
            <div style="display:flex; gap:15px; align-items:center;">
                <input type="checkbox" ${t.done ? 'checked' : ''} onclick="toggleDone('${t.id}', ${t.done})">
                <span style="${t.done ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${t.title}</span>
            </div>
            
            <div><span class="pillar-pill">${t.pillar}</span></div>
            
            <div class="flag ${flagClass}">
                <i data-lucide="flag" size="14" fill="currentColor"></i>
                ${t.priority ? t.priority.toUpperCase() : 'NORMAL'}
            </div>

            <i data-lucide="trash-2" class="btn-delete" onclick="deleteTask('${t.id}')"></i>
        </div>
    `}).join('');
    lucide.createIcons();
}

async function deleteTask(id) {
    if(confirm("Abandon this discipline?")) {
        await db.collection("tasks").doc(id).delete();
    }
}

async function toggleDone(id, status) {
    await db.collection("tasks").doc(id).update({ done: !status });
}

function handleLogout() {
    auth.signOut();
}

// Login/Signup Event Listeners... (Connect the buttons to auth.signInWithEmailAndPassword etc)
