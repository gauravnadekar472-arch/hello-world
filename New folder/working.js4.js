// ===== ELEMENTS =====
const chatArea = document.getElementById("chatArea");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const emptyState = document.getElementById("emptyState");
const newChatBtn = document.getElementById("newChat");

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

// ===== SEND MESSAGE =====
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // hide empty state
  if (!emptyState.classList.contains("hidden")) {
    emptyState.classList.add("hidden");
  }

  // 🔥 FIX: use .msg (not .message)
  const msg = document.createElement("div");
  msg.className = "msg user";
  msg.innerText = text;

  chatArea.appendChild(msg);

  input.value = "";
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ===== EVENTS =====


// ===== INIT =====
window.addEventListener("load", () => {
  renderEmptyState();
});