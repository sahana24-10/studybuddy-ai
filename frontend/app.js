// --- ⚙️ MASTER LIFECYCLE MANAGEMENT ---
let chartInstances = {}; // Track active chart objects to prevent memory leaks

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide iconography styling globally
    lucide.createIcons();

    const menuItems = document.querySelectorAll(".menu-item");
    const sections = document.querySelectorAll(".view-section");

    // SPA Tab Navigation Menu Matrix Setup
    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            
            sections.forEach(sec => sec.classList.add("hidden"));
            const targetID = item.getAttribute("data-target");
            const activeSection = document.getElementById(targetID);
            activeSection.classList.remove("hidden");

            // Dynamic Chart Rendering: Initialize charts ONLY when their container is unhidden
            if (targetID === "dashboard-page") {
                renderDashboardCharts();
            } else if (targetID === "analytics-page") {
                renderAnalyticsCharts();
            }
        });
    });

    // Fire up non-visual background engine systems safely on load
    initPomodoroTimer();
    initTasksEngine();
    initNotesEngine();
    initAIAssistantEngine();
    initCalendarEngine();

    // Initial load view chart mount
    renderDashboardCharts();
});

// --- 📊 DASHBOARD SPECIFIC VISUALIZATIONS ---
function renderDashboardCharts() {
    const weeklyCtx = document.getElementById('dashWeeklyChart');
    const taskCtx = document.getElementById('dashTaskChart');

    if (!weeklyCtx || !taskCtx) return;

    // Clean up old instances if they exist to prevent canvas corruption
    if (chartInstances.dashWeekly) chartInstances.dashWeekly.destroy();
    if (chartInstances.dashTask) chartInstances.dashTask.destroy();

    chartInstances.dashWeekly = new Chart(weeklyCtx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Hours',
                data: [2, 3.5, 1.5, 4, 0, 5, 3],
                backgroundColor: '#ffe375', 
                borderRadius: 4
            }]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { beginAtZero: true, grid: { color: 'rgba(154, 146, 171, 0.05)' }, ticks: { color: '#9a92ab' } },
                x: { grid: { display: false }, ticks: { color: '#9a92ab' } }
            } 
        }
    });

    chartInstances.dashTask = new Chart(taskCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Done', 'Pending'],
            datasets: [{
                data: [14, 4],
                backgroundColor: ['#ff9ebb', '#282236'], 
                borderWidth: 0
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } } 
        }
    });
}

// --- 📊 ANALYTICS VIEW SPECIFIC VISUALIZATIONS ---
function renderAnalyticsCharts() {
    const subjectCtx = document.getElementById('analyticsSubjectChart');
    const energyCtx = document.getElementById('analyticsEnergyChart');

    if (!subjectCtx || !energyCtx) return;

    // Clean up old instances to ensure seamless fresh structural draw
    if (chartInstances.analyticsSubject) chartInstances.analyticsSubject.destroy();
    if (chartInstances.analyticsEnergy) chartInstances.analyticsEnergy.destroy();

    chartInstances.analyticsSubject = new Chart(subjectCtx.getContext('2d'), {
        type: 'polarArea',
        data: {
            labels: ['Circuits', 'Physics', 'Backend', 'Math'],
            datasets: [{
                data: [8, 5, 11, 4],
                backgroundColor: [
                    'rgba(255, 158, 187, 0.7)', 
                    'rgba(255, 227, 117, 0.7)', 
                    'rgba(163, 230, 53, 0.7)', 
                    'rgba(147, 197, 253, 0.7)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#9a92ab', font: { size: 11 } } } },
            scales: { r: { grid: { color: 'rgba(154, 146, 171, 0.1)' }, angleLines: { color: 'rgba(154, 146, 171, 0.1)' }, ticks: { display: false } } }
        }
    });

    chartInstances.analyticsEnergy = new Chart(energyCtx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
            datasets: [{
                label: 'Focus State',
                data: [40, 85, 50, 30, 90, 65],
                borderColor: '#ff9ebb',
                backgroundColor: 'rgba(255, 158, 187, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(154, 146, 171, 0.05)' }, ticks: { color: '#9a92ab' } },
                x: { grid: { display: false }, ticks: { color: '#9a92ab' } }
            }
        }
    });
}

// --- ⏱️ MINIMALIST POMODORO STATE ENGINE ---
let timerInterval = null;
let timeRemaining = 25 * 60;
let isTimerRunning = false;
let sessionCount = 0;

function initPomodoroTimer() {
    const startBtn = document.getElementById("pomo-start-btn");
    const pauseBtn = document.getElementById("pomo-pause-btn");
    const resetBtn = document.getElementById("pomo-reset-btn");
    
    if (!startBtn) return; 

    startBtn.addEventListener("click", () => {
        if (!isTimerRunning) {
            isTimerRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            timerInterval = setInterval(() => {
                timeRemaining--;
                updateTimerDisplay();
                
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    handleTimerCompletion();
                }
            }, 1000);
        }
    });

    pauseBtn.addEventListener("click", () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    });

    resetBtn.addEventListener("click", () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeRemaining = 25 * 60;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        updateTimerDisplay();
        document.getElementById("timer-mode-label").innerText = "Focus State";
    });
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById("timer-countdown").innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function handleTimerCompletion() {
    isTimerRunning = false;
    timeRemaining = 25 * 60; 
    sessionCount++;
    alert("Focus interval cleared successfully. Take a short break.");
    document.getElementById("pomo-session-count").innerText = `${sessionCount} Sessions logged today`;
    document.getElementById("dash-pomo").innerText = `${sessionCount} Completed`;
    document.getElementById("pomo-start-btn").disabled = false;
    document.getElementById("pomo-pause-btn").disabled = true;
    updateTimerDisplay();
}

// --- 📋 AESTHETIC TASK MANAGEMENT ENGINE ---
let localTasks = [
    { id: 1, title: "Calibrate engineering framework core modules", priority: "high", completed: true },
    { id: 2, title: "Review tomorrow's systemic design objectives", priority: "medium", completed: false }
];

function initTasksEngine() {
    const taskForm = document.getElementById("task-form");
    if (!taskForm) return;

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const titleInput = document.getElementById("task-title-input");
        const priorityInput = document.getElementById("task-priority");
        
        localTasks.push({
            id: Date.now(),
            title: titleInput.value,
            priority: priorityInput.value,
            completed: false
        });
        
        titleInput.value = "";
        renderTasks();
        updateDashboardTaskCounter();
    });

    renderTasks();
    updateDashboardTaskCounter();
}

function renderTasks() {
    const taskList = document.getElementById("task-list");
    if (!taskList) return;
    taskList.innerHTML = "";

    localTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-left-block">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskCompletion(${task.id})">
                <span class="task-text">${task.title}</span>
            </div>
            <button class="task-delete-btn" onclick="deleteTask(${task.id})">
                <i data-lucide="x" style="width:18px;height:18px;"></i>
            </button>
        `;
        taskList.appendChild(li);
    });
    lucide.createIcons();
}

window.toggleTaskCompletion = function(id) {
    localTasks = localTasks.map(task => {
        if (task.id === id) task.completed = !task.completed;
        return task;
    });
    renderTasks();
    updateDashboardTaskCounter();
};

window.deleteTask = function(id) {
    localTasks = localTasks.filter(task => task.id !== id);
    renderTasks();
    updateDashboardTaskCounter();
};

function updateDashboardTaskCounter() {
    const counterEl = document.getElementById("dash-tasks-count");
    if (!counterEl) return;
    counterEl.innerText = `${localTasks.filter(t => !t.completed).length} Remaining`;
}

// --- 📝 AESTHETIC KNOWLEDGE VAULT ENGINE ---
let localNotes = [
    { id: 1, title: "Nodal Analysis Rule", tag: "Circuits", content: "Sum of currents leaving a node must equal zero. V=IR.", image: "" },
    { id: 2, title: "Class 10 Light Formulas", tag: "Physics", content: "Mirror Formula: 1/f = 1/v + 1/u\nLens Formula: 1/f = 1/v - 1/u", image: "" }
];
let activePastedImageBase64 = ""; 

function initNotesEngine() {
    const noteForm = document.getElementById("note-form");
    const noteFormContainer = document.getElementById("note-form-container");
    const searchInput = document.getElementById("note-search-input");
    const clearImgBtn = document.getElementById("clear-pasted-img-btn");
    
    if (!noteForm) return;

    noteFormContainer.addEventListener("paste", (e) => {
        const clipboardItems = e.clipboardData.items;
        for (let i = 0; i < clipboardItems.length; i++) {
            if (clipboardItems[i].type.indexOf("image") !== -1) {
                const fileObject = clipboardItems[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(event) {
                    activePastedImageBase64 = event.target.result;
                    document.getElementById("form-img-preview").src = activePastedImageBase64;
                    document.getElementById("form-img-preview-container").classList.remove("hidden");
                };
                reader.readAsDataURL(fileObject);
                break;
            }
        }
    });

    if (clearImgBtn) {
        clearImgBtn.addEventListener("click", () => {
            activePastedImageBase64 = "";
            document.getElementById("form-img-preview").src = "";
            document.getElementById("form-img-preview-container").classList.add("hidden");
        });
    }

    noteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const titleEl = document.getElementById("note-title");
        const tagEl = document.getElementById("note-tag");
        const contentEl = document.getElementById("note-content");
        
        localNotes.push({
            id: Date.now(),
            title: titleEl.value,
            tag: tagEl.value,
            content: contentEl.value,
            image: activePastedImageBase64 
        });
        
        titleEl.value = ""; tagEl.value = ""; contentEl.value = ""; activePastedImageBase64 = "";
        document.getElementById("form-img-preview-container").classList.add("hidden");
        renderNotes(localNotes);
    });

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = localNotes.filter(note => 
                note.title.toLowerCase().includes(query) || note.tag.toLowerCase().includes(query)
            );
            renderNotes(filtered);
        });
    }
    renderNotes(localNotes);
}

function renderNotes(notesArray) {
    const notesGrid = document.getElementById("notes-grid-deck");
    if (!notesGrid) return;
    notesGrid.innerHTML = "";

    notesArray.forEach(note => {
        const div = document.createElement("div");
        div.className = "note-card";
        const imageElementHTML = note.image ? `<img src="${note.image}" class="note-card-attachment" alt="Formulas snippet">` : "";
        div.innerHTML = `
            <div class="note-card-header">
                <span class="note-card-title">${note.title}</span>
                <button class="task-delete-btn" onclick="deleteNote(${note.id})"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
            </div>
            <div class="note-card-content">${note.content}</div>
            ${imageElementHTML}
            <div class="note-card-footer"><span class="note-tag-badge">${note.tag}</span></div>
        `;
        notesGrid.appendChild(div);
    });
    lucide.createIcons();
}

window.deleteNote = function(id) {
    localNotes = localNotes.filter(note => note.id !== id);
    renderNotes(localNotes);
};

// --- 📅 INTERACTIVE CALENDAR MATRIX ENGINE ---
let currentDisplayDate = new Date(2026, 5, 23); 
let scheduledEvents = [
    { date: "2026-06-24", title: "Review Nodal Circuit Equations" },
    { date: "2026-06-28", title: "Class 10 Light Formula Revision" }
];

function initCalendarEngine() {
    const prevBtn = document.getElementById("cal-prev-btn");
    const nextBtn = document.getElementById("cal-next-btn");
    const eventForm = document.getElementById("calendar-event-form");

    if (!prevBtn) return;

    prevBtn.addEventListener("click", () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        renderCalendarStructure();
    });

    nextBtn.addEventListener("click", () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        renderCalendarStructure();
    });

    eventForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const titleIn = document.getElementById("event-title-input");
        const dateIn = document.getElementById("event-date-input");

        scheduledEvents.push({ date: dateIn.value, title: titleIn.value });
        titleIn.value = ""; dateIn.value = "";
        renderCalendarStructure();
    });

    renderCalendarStructure();
}

function renderCalendarStructure() {
    const monthYearLabel = document.getElementById("calendar-month-year-label");
    const daysGrid = document.getElementById("calendar-days-grid");
    const agendaList = document.getElementById("calendar-agenda-list");

    if (!daysGrid) return;

    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    monthYearLabel.innerText = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    daysGrid.innerHTML = "";
    agendaList.innerHTML = "";

    for (let i = 0; i < firstDayIndex; i++) {
        const spacer = document.createElement("div");
        spacer.style.padding = "10px";
        daysGrid.appendChild(spacer);
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
        const cell = document.createElement("div");
        cell.style.padding = "10px";
        cell.style.borderRadius = "6px";
        cell.style.backgroundColor = "rgba(255,255,255,0.02)";
        cell.style.color = "#9a92ab";
        cell.innerText = day;

        const dayString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const hasEvent = scheduledEvents.some(ev => ev.date === dayString);
        
        if (hasEvent) {
            cell.style.border = "1px solid #ff9ebb";
            cell.style.color = "#ff9ebb";
            cell.style.fontWeight = "bold";
        }
        if (day === 23 && month === 5 && year === 2026) {
            cell.style.backgroundColor = "#ff9ebb";
            cell.style.color = "#191423";
            cell.style.fontWeight = "bold";
        }
        daysGrid.appendChild(cell);
    }

    const sortedEvents = [...scheduledEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedEvents.forEach(ev => {
        const li = document.createElement("li");
        li.style.padding = "8px";
        li.style.backgroundColor = "rgba(255,255,255,0.02)";
        li.style.borderRadius = "6px";
        li.style.borderLeft = "3px solid #ff9ebb";
        li.style.fontSize = "13px";
        
        const localizedDateStr = new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        li.innerHTML = `<div style="color:#e0dbec;">${ev.title}</div><div style="font-size:11px; color:#9a92ab; margin-top:2px;">${localizedDateStr}</div>`;
        agendaList.appendChild(li);
    });
    lucide.createIcons();
}

// --- ✨ INTERACTIVE AI COMPANION SUITE ENGINE ---
function initAIAssistantEngine() {
    const chatForm = document.getElementById("chat-input-dock");
    if (!chatForm) return;

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const messageInput = document.getElementById("chat-user-message");
        const userText = messageInput.value.trim();
        if (!userText) return;

        appendChatBubble(userText, "user-client", "You");
        messageInput.value = ""; 

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText })
            });

            if (!response.ok) throw new Error("Handshake failed.");
            const data = await response.json();
            appendChatBubble(data.reply, "system-ai", "StudyBuddy AI");
        } catch (error) {
            appendChatBubble("⚠️ Connection failed. Is backend active?", "system-ai", "System Status");
        }
    });
}

function appendChatBubble(text, senderClass, labelTitle) {
    const chatStreamLog = document.getElementById("chat-stream-log");
    if (!chatStreamLog) return;

    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${senderClass}`;
    bubble.innerHTML = `<div class="msg-meta">${labelTitle} • Just Now</div><div class="msg-body">${text}</div>`;
    chatStreamLog.appendChild(bubble);
    chatStreamLog.scrollTop = chatStreamLog.scrollHeight;
}