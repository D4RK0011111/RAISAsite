/* ------------------- CONFIG ------------------- */
const USERS = [
  { email: "anikaweiss@foundation.id", name: "Dr. Anika Weiss", clearance: 4, passcode: "moonlight" },
  { email: "m.holt@foundation.id", name: "Agent Mara Holt", clearance: 3, passcode: "sentinel" },
  { email: "e.tanaka@foundation.id", name: "Researcher Eli Tanaka", clearance: 2, passcode: "glassdoor" }
];
const MAX_ATTEMPTS = 3;

/* ------------------- DOM REFS ------------------- */
const terminal = document.getElementById("terminal");
const loginForm = document.getElementById("login");
const statusBox = document.getElementById("status");

let attemptsLeft = MAX_ATTEMPTS;
let locked = false;

/* ------------------- ANIMATION ------------------- */
async function typeSequence(text) {
  terminal.textContent = "";
  for (let c of text) {
    terminal.textContent += c;
    await new Promise(r => setTimeout(r, 40));
    if (c.trim()) beep(600, 0.03);
  }
}

function beep(freq = 440, dur = 0.1, vol = 0.02) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, dur * 1000);
  } catch (e) {}
}

/* ------------------- LOGIN LOGIC ------------------- */
async function init() {
  await typeSequence("R.A.I.S.A. DATABASE INTERFACE\nINITIALIZING CONNECTION...\nAUTHENTICATION SEQUENCE READY.");
  loginForm.style.display = "flex";
  statusBox.textContent = "Ready. Please authenticate.";
}

loginForm.addEventListener("submit", e => {
  e.preventDefault();
  if (locked) return;
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("passcode").value.trim();
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user && user.passcode === pass) {
    grantAccess(user);
  } else {
    failAccess();
  }
});

function continuousAlarm() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "square";
  o.frequency.value = 300;
  g.gain.value = 0.02;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  setTimeout(() => { o.stop(); ctx.close(); }, 2000);
}

function failAccess() {
  attemptsLeft--;
  continuousAlarm();
  if (attemptsLeft > 0) {
    statusBox.classList.add("warn");
    statusBox.textContent = `Invalid credentials. ${attemptsLeft} attempt(s) left before lockdown.`;
  } else {
    siteLockdown();
  }
}

function grantAccess(user) {
  statusBox.classList.remove("warn");
  statusBox.innerHTML = `<span class='access-granted'>ACCESS GRANTED — Welcome, ${user.name} (Clearance Lvl ${user.clearance}).</span>`;
  beep(900, 0.15);
  loginForm.style.display = "none";
  setTimeout(() => {
    typeSequence(`Access token verified for ${user.email}\nRedirecting to query interface...`);
    setTimeout(() => {
      terminal.innerHTML = `<span class='access-granted'>QUERY INTERFACE:</span><br><br><input id='query' placeholder='Search SCP file...' style='width:90%;padding:8px;border-radius:6px;border:none;background:rgba(255,255,255,0.08);color:#9be3ff;'>`;
      document.getElementById('query').focus();
    }, 2000);
  }, 1000);
}

/* ------------------- NEW: LOCKDOWN SYSTEM ------------------- */
function siteLockdown() {
  locked = true;
  loginForm.style.display = "none";
  statusBox.innerHTML = `<span class='locked'>LOCKDOWN INITIATED — MTF units notified.</span>`;

  // Add full-screen shutdown overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "black";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.gap = "20px";
  overlay.style.color = "#ff3333";
  overlay.style.fontFamily = "ui-monospace, monospace";
  overlay.style.fontWeight = "bold";
  overlay.style.fontSize = "28px";
  overlay.style.letterSpacing = "2px";
  overlay.innerHTML = `
    <div>SHUT DOWN</div>
    <div>MTF UNIT GAMMA-5 NOTIFIED</div>
    <div>ACTIONS LOGGED</div>
  `;
  document.body.appendChild(overlay);

  // Start infinite soft looping beep–beep
  infiniteBeep();

  // Redirect after a few seconds (YouTube as placeholder)
  setTimeout(() => {
    window.location.href = "https://www.youtube.com/";
  }, 7000); // waits 7 seconds before redirect
}


function infiniteBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const g = ctx.createGain();
  g.gain.value = 0.008; // quiet volume
  g.connect(ctx.destination);

  function playBeep() {
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.value = 600;
    o.connect(g);
    o.start();
    setTimeout(() => { o.stop(); }, 200);
  }

  // beep–pause–beep loop
  function loop() {
    playBeep();
    setTimeout(playBeep, 600);
    setTimeout(loop, 1600);
  }

  loop();
}

init();
