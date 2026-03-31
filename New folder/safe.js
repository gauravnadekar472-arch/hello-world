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

// ================= FIX 1: MENU ANIMATION =================
menuBtn.onclick = () => {
  menuBtn.classList.toggle("active"); // ☰ → ❌
  drawer.classList.toggle("show");
};

document.addEventListener("click", e => {
  if (!drawer.contains(e.target) && !menuBtn.contains(e.target)) {
    drawer.classList.remove("show");
    menuBtn.classList.remove("active");
  }
});

// ================= STOP CONTROL =================
let controller = null;
let isGenerating = false;

// ================= LOGIN =================
let userProfile;
try {
  const stored = localStorage.getItem("chatAIUser");
  userProfile = stored ? JSON.parse(stored) : null;
} catch {
  localStorage.removeItem("chatAIUser");
}

if (!userProfile) window.location.replace("login.html");

// ================= CHAT STORAGE =================
const USER_KEY = userProfile.email || userProfile.phone;
const CHAT_STORAGE_KEY = "chats_" + USER_KEY;
let chats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
let currentChatId = null;

// ================= CHAT =================
function createNewChat(title = "New Chat") {
  currentChatId = Date.now();
  chats.push({ id: currentChatId, title, messages: [] });
  saveChats();
  renderChatList();
  chatArea.innerHTML = "";
}
newChatBtn.onclick = () => createNewChat();

function saveChats() {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
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

// ================= LOAD CHAT =================
function loadChat(id) {
  currentChatId = id;
  chatArea.innerHTML = "";

  const chat = chats.find(c => c.id === id);
  if (!chat) return;

  chat.messages.forEach(m => {
    if (m.text) addMessage(m.text, m.type);
  });

  drawer.classList.remove("show");
  menuBtn.classList.remove("active");
}

// ================= MESSAGE UI =================
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
  div.className = "msg ai thinking";
  div.id = "thinking";
  div.innerText = "Typing...";
  chatArea.appendChild(div);
}

function removeThinking() {
  const t = document.getElementById("thinking");
  if (t) t.remove();
}

// ================= SEND BUTTON =================
function setSendButton(state) {
  if (state === "send") sendBtn.innerHTML = "➤";
  else sendBtn.innerHTML = "⏸";
}

// ================= SEND =================
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
  setSendButton("stop");
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

  } catch {
    removeThinking();
    addMessage("Server error", "ai");
  }

  isGenerating = false;
  setSendButton("send");
}

// ================= ATTACH FIX =================
// HTML me input nahi tha → create hidden input
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

// ================= VOICE FIX =================
let recording = false;

voiceBtn.onclick = () => {
  recording = !recording;

  if (recording) {
    voiceBtn.classList.add("active"); // CSS animation
  } else {
    voiceBtn.classList.remove("active");
  }
};

// ================= PROFILE =================
profileBtn.onclick = () => {
  alert("Profile feature working ✅");
};

// ================= EVENTS =================
sendBtn.onclick = () => {
  if (isGenerating) return;
  sendMessage();
};

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