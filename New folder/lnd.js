// ================= CONFIG =================
const CHAT_API_URL = "https://trial1-5-evpm.onrender.com";
const IMAGE_API_URL = "https://trial1-5-evpm.onrender.com";
// ================= ELEMENTS =================
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const newChatBtn = document.getElementById("newChat");
const chatArea = document.getElementById("chatArea");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const searchChats = document.getElementById("searchChats");
const chatHistory = document.getElementById("chatHistory");
const profileBtn = document.getElementById("profileBtn");
const attachBtn = document.getElementById("attachBtn");
const voiceBtn = document.getElementById("voiceBtn");

// ================= STOP / PAUSE CONTROL =================
let isGenerating = false;

// ================= LOGIN CHECK =================
let userProfile = JSON.parse(localStorage.getItem("chatAIUser"));

if (!userProfile) {
  window.location.href = "login.html";
}

// ================= CHAT STORAGE =================
const USER_KEY = userProfile.email || userProfile.phone;
const CHAT_STORAGE_KEY = "chats_" + USER_KEY;

let chats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
let currentChatId = null;

// ================= DRAWER =================
menuBtn.onclick = () => {
  menuBtn.classList.toggle("active");
  drawer.classList.toggle("show");
};

document.addEventListener("click", e => {
  if (!drawer.contains(e.target) && !menuBtn.contains(e.target)) {
    drawer.classList.remove("show");
    menuBtn.classList.remove("active");
  }
});

// ================= CHAT FUNCTIONS =================
function createNewChat(title = "New Chat") {
  currentChatId = Date.now();
  chats.push({ id: currentChatId, title, messages: [] });
  saveChats();
  renderChatList();
  chatArea.innerHTML = "";
  renderEmptyState();
}

newChatBtn.onclick = () => createNewChat();

function saveChats() {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
}

function loadChat(id) {
  currentChatId = id;
  chatArea.innerHTML = "";

  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  chat.messages.forEach(m => addMessage(m.text, m.type));

  drawer.classList.remove("show");
}

// ================= RENDER CHAT LIST =================
function renderChatList(filter = "") {
  chatHistory.innerHTML = "";

  chats.forEach(chat => {
    if (filter && !chat.title.toLowerCase().includes(filter.toLowerCase())) return;

    const li = document.createElement("li");
    li.textContent = chat.title;
    li.onclick = () => loadChat(chat.id);

    chatHistory.appendChild(li);
  });
}

// ================= UI MESSAGES =================
function addMessage(text, type = "ai") {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ================= THINKING =================
function showThinking() {
  const div = document.createElement("div");
  div.id = "thinking";
  div.className = "msg ai";
  div.innerText = "Typing...";
  chatArea.appendChild(div);
}

function removeThinking() {
  const t = document.getElementById("thinking");
  if (t) t.remove();
}

// ================= IMAGE PROMPT CHECK =================
function isImagePrompt(text) {
  const words = ["image", "photo", "draw", "picture"];
  return words.some(w => text.toLowerCase().includes(w));
}

// ================= SEND MESSAGE =================
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isGenerating) return;

  if (!currentChatId) createNewChat();

  const chat = chats.find(c => c.id === currentChatId);

  addMessage(text, "user");
  chat.messages.push({ text, type: "user" });
  saveChats();

  userInput.value = "";

  isGenerating = true;
  showThinking();

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    removeThinking();

    const reply = data.reply || "No response";
    addMessage(reply, "ai");

    chat.messages.push({ text: reply, type: "ai" });
    saveChats();

  } catch (err) {
    removeThinking();
    addMessage("Server error", "ai");
  }

  isGenerating = false;
}

// ================= IMAGE GENERATION =================
function sendImage(prompt) {
  addMessage("🖼 Image feature coming soon...", "ai");
}

// ================= FILE UPLOAD =================
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

attachBtn.onclick = () => fileInput.click();

fileInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  addMessage("📎 " + file.name, "user");
};

// ================= VOICE RECORDING =================
let recording = false;

voiceBtn.onclick = () => {
  recording = !recording;
  voiceBtn.classList.toggle("active");
};

// ================= PROFILE =================
profileBtn.onclick = e => {
  e.stopPropagation();
  const profile = JSON.parse(localStorage.getItem("chatAIUser"));
  if (!profile) { alert("User not logged in"); window.location.href = "login.html"; return; }

  let popup = document.getElementById("profilePopup");
  if (popup) { popup.remove(); return; }

  popup = document.createElement("div");
  popup.id = "profilePopup";
  popup.style.cssText = "position:fixed;top:60px;right:15px;background:#111;color:#0ef8e0ff;padding:15px;border-radius:8px;z-index:100;min-width:200px;box-shadow:0 0 10px #0ef8e0ff";
  popup.innerHTML = `
    <p><strong>Name:</strong> ${profile.name || "User"}</p>
    <p><strong>Email:</strong> ${profile.email || "Not provided"}</p>
    <p><strong>Phone:</strong> ${profile.phone || profile.mobile || "Not provided"}</p>
    <button id="logoutBtn" style="margin-top:10px;padding:5px 10px;border:none;border-radius:5px;cursor:pointer;background:#0ef8e0ff;color:#111;">Logout</button>
  `;
  document.body.appendChild(popup);

  document.getElementById("logoutBtn").onclick = () => { localStorage.removeItem("chatAIUser"); window.location.href = "login.html"; };

  setTimeout(() => {
    const closeProfile = e => { if (!popup.contains(e.target) && e.target !== profileBtn) { popup.remove(); document.removeEventListener("click", closeProfile); } };
    document.addEventListener("click", closeProfile);
  }, 0);
};

// ================= EVENTS =================
sendBtn.onclick = sendMessage;

userInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

searchChats.addEventListener("input", e => {
  renderChatList(e.target.value);
});

// ================= INIT =================
renderChatList();
renderEmptyState();


// ===== PROMPTS =====
const prompts = [
  "Where should we begin?",
  "What’s on your mind today?",
  "What’s on the agenda today?",
  "How can I help you today?",
  "Ask me anything...",
  "Let’s build something amazing.",
  "Need help with code or ideas?",
  "Start a conversation...",
  "What are you working on?",
  "Tell me your idea..."
];

// ===== RANDOM SINGLE PROMPT =====
function getRandomPrompt() {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// ===== RENDER EMPTY STATE (ONLY ONE) =====
function renderEmptyState() {
  emptyState.innerHTML = "";

  const text = getRandomPrompt();

  const p = document.createElement("p");
  p.innerText = text;

  // click = auto send
  p.style.cursor = "pointer";
  p.onclick = () => {
    input.value = text;
    sendMessage();
  };

  emptyState.appendChild(p);
}