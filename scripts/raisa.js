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
  // Add "booting" class for blue glow animation on the logo
  document.body.classList.add("booting");

  // Step 1: Print the system header
  await typeSequence("R.A.I.S.A. DATABASE INTERFACE");

  // Step 2: Start the dynamic "INITIALIZING CONNECTION..." animation
  terminal.textContent += "\nINITIALIZING CONNECTION";
  let dotCount = 0;
  let isRunning = true;

  // Animate dots every 500 ms (cycles . → .. → ... → .)
  const dotInterval = setInterval(() => {
    if (!isRunning) return;
    dotCount = (dotCount + 1) % 4;
    const dots = ".".repeat(dotCount);
    const lines = terminal.textContent.split("\n");
    lines[lines.length - 1] = "INITIALIZING CONNECTION" + dots;
    terminal.textContent = lines.join("\n");
  }, 500);

  // Step 3: Random delay between 5–15 seconds
  const randomDelay = Math.floor(Math.random() * 10000) + 5000;
  await new Promise(resolve => setTimeout(resolve, randomDelay));

  // Step 4: Stop animation and print next line
  isRunning = false;
  clearInterval(dotInterval);

  await typeSequence("\nAUTHENTICATION SEQUENCE READY.");

  // Step 5: Display login form and status
  loginForm.style.display = "flex";
  statusBox.textContent = "Ready. Please authenticate.";

  // Remove blue glow animation once system is ready
  document.body.classList.remove("booting");
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

  // First, type the whole message
  typeSequence(`Access token verified for ${user.email}\nRedirecting to query interface...`)
    .then(() => {
      // After typing finishes, wait 2s, then show the query interface
      setTimeout(() => {
        terminal.innerHTML = `
          <span class='access-granted'>QUERY INTERFACE:</span><br><br>
          <input id='query' placeholder='Search SCP file...'
            style='width:90%;padding:8px;border-radius:6px;border:none;
            background:rgba(255,255,255,0.08);color:#9be3ff;'>
        `;
        document.getElementById('query').focus();
      }, 2000);
    });
}


/* ------------------- NEW: LOCKDOWN SYSTEM ------------------- */
function siteLockdown() {
  // Prevent double lockdown activation
  if (locked) return;
  locked = true;
  loginForm.style.display = "none";
  statusBox.innerHTML = `<span class='locked'>LOCKDOWN INITIATED — MTF units notified.</span>`;

  // Create full-screen overlay
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
  overlay.style.color = "#ff3333";
  overlay.style.fontFamily = "ui-monospace, monospace";
  overlay.style.zIndex = "9999";
  overlay.style.animation = "screenFlash 0.8s ease-in-out infinite alternate";

// SCP logo (large, light grey)
const logo = document.createElement("img");
logo.src = "https://static.wikia.nocookie.net/scp-containment-breach/images/3/3d/SCP_Foundation_Logo.png";
logo.alt = "SCP Foundation Logo";
logo.style.width = "200px";
logo.style.height = "200px";
logo.style.filter = "grayscale(100%) brightness(150%) contrast(80%) drop-shadow(0 0 10px rgba(200,200,200,0.3))";
logo.style.opacity = "0.8";
logo.style.marginTop = "20px";
logo.style.marginBottom = "20px";


  // Top + bottom hazard stripes
  const stripeTop = document.createElement("div");
  const stripeBottom = document.createElement("div");
  [stripeTop, stripeBottom].forEach(stripe => {
    stripe.style.width = "100%";
    stripe.style.height = "50px";
    stripe.style.backgroundImage = "repeating-linear-gradient(45deg, #ffcc00 0 20px, black 20px 40px)";
    stripe.style.backgroundSize = "80px 80px";
    stripe.style.animation = "stripeMove 2s linear infinite";
  });
  stripeTop.style.borderBottom = "3px solid #ff0000";
  stripeBottom.style.borderTop = "3px solid #ff0000";

  // Warning box
  const warningBox = document.createElement("div");
  warningBox.style.background = "rgba(0,0,0,0.85)";
  warningBox.style.border = "3px solid #ff3333";
  warningBox.style.boxShadow = "0 0 40px #ff000080";
  warningBox.style.padding = "40px 80px";
  warningBox.style.textAlign = "center";
  warningBox.style.borderRadius = "12px";
  warningBox.style.animation = "pulseWarning 1.2s infinite";
  warningBox.innerHTML = `
    <div style="font-size:40px; color:#ff3333; font-weight:bold; margin-bottom:15px;">
      SYSTEM LOCKDOWN
    </div>
    <div style="color:#ffcc00; font-size:22px; margin-bottom:20px;">
      MTF UNIT GAMMA-5 ("Red Herrings") NOTIFIED
    </div>
    <div style="color:#cccccc; font-size:18px;">
      All actions have been logged.<br>Local terminal access revoked.<br><br>
      <span style="font-size:14px; color:#888;">R.A.I.S.A. Terminal #004 | Foundation Secure Network</span>
    </div>
  `;

  // Assemble overlay
  overlay.appendChild(logo);
  overlay.appendChild(stripeTop);
  overlay.appendChild(warningBox);
  overlay.appendChild(stripeBottom);
  document.body.appendChild(overlay);

  // Add keyframe animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulseWarning {
      0%, 100% { box-shadow: 0 0 40px #ff000080; }
      50% { box-shadow: 0 0 80px #ff0000; }
    }
    @keyframes screenFlash {
      0% { background-color: black; }
      100% { background-color: #1a0000; }
    }
    @keyframes stripeMove {
      from { background-position: 0 0; }
      to { background-position: 80px 0; }
    }
    @keyframes logoFadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 0.85; transform: scale(1); }
}
  `;
  document.head.appendChild(style);

  // Begin infinite quiet alarm beep
  infiniteBeep();

  // ❌ No redirect — true lockdown
  console.warn("R.A.I.S.A. lockdown: terminal sealed. No redirect executed.");
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
