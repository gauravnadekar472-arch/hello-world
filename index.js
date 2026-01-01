// ================= CONFIG (SAFE) =================
const CHAT_API_URL = "/api/chat";
const IMAGE_API_URL = "/api/image";

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

// ================= CHECK LOGIN =================
let userProfile;

try {
  const storedUser = localStorage.getItem("chatAIUser");
  userProfile = storedUser ? JSON.parse(storedUser) : null;
} catch (e) {
  console.error("Corrupted user data");
  localStorage.removeItem("chatAIUser");
  userProfile = null;
}

if (!userProfile || (!userProfile.email && !userProfile.phone)) {
  // not logged in → go to login
  window.location.replace("login.html");
}

// ================= USER CHAT STORAGE KEY =================
const USER_KEY = userProfile.email || userProfile.phone;
const CHAT_STORAGE_KEY = "chats_" + USER_KEY;

// ================= STATE =================
let chats = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
let currentChatId = null;

// ================= DRAWER =================
menuBtn.onclick = () => drawer.classList.toggle("show");
document.addEventListener("click", e => {
  if (!drawer.contains(e.target) && !menuBtn.contains(e.target)) drawer.classList.remove("show");
});

// ================= IMAGE PROMPT =================
function isImagePrompt(text) {
  return /(image|generate|draw|photo|picture)/i.test(text);
}

// ================= CHAT FUNCTIONS =================
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

  chats
    .filter(c => c.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach(chat => {
      const li = document.createElement("li");
      li.textContent = chat.title;
      li.style.position = "relative";

      // 3-dot menu for chat
      const menu = document.createElement("span");
      menu.textContent = "⋮";
      menu.style.cursor = "pointer";
      menu.style.position = "absolute";
      menu.style.right = "5px";
      menu.onclick = e => {
        e.stopPropagation();
        showChatMenu(chat, li);
      };
      li.appendChild(menu);

      li.onclick = () => loadChat(chat.id);
      chatHistory.appendChild(li);
    });

  // ---------------- ADD PROJECT BUTTON ----------------
  if (!document.getElementById("addProjectBtn")) {
    const projectBtn = document.createElement("button");
    projectBtn.id = "addProjectBtn";
    projectBtn.textContent = "＋ Add Project";
    projectBtn.onclick = () => {
      const projectName = prompt("Enter Project Name:");
      if (!projectName) return;
      createNewChat(projectName);
      alert("Project added!");
    };
    chatHistory.parentElement.appendChild(projectBtn);
  }
}

// ================= CHAT MENU (3-DOTS) =================
function showChatMenu(chat, li) {
  const menuDiv = document.createElement("div");
  menuDiv.className = "chat-menu";
  menuDiv.style.position = "absolute";
  menuDiv.style.background = "#111";
  menuDiv.style.color = "#0ef8e0ff";
  menuDiv.style.padding = "5px";
  menuDiv.style.borderRadius = "5px";
  menuDiv.style.top = li.offsetTop + li.offsetHeight + "px";
  menuDiv.style.left = li.offsetLeft + "px";
  menuDiv.style.zIndex = "50";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete Chat";
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    chats = chats.filter(c => c.id !== chat.id);
    saveChats();
    renderChatList();
    if (currentChatId === chat.id) chatArea.innerHTML = "";
    menuDiv.remove();
  };

  const pinBtn = document.createElement("button");
  pinBtn.textContent = "Pin Chat";
  pinBtn.onclick = (e) => {
    e.stopPropagation();
    alert("Chat pinned!");
    menuDiv.remove();
  };

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Chat";
  saveBtn.onclick = (e) => {
    e.stopPropagation();
    alert("Chat saved!");
    menuDiv.remove();
  };

  menuDiv.appendChild(deleteBtn);
  menuDiv.appendChild(pinBtn);
  menuDiv.appendChild(saveBtn);
  document.body.appendChild(menuDiv);

  document.addEventListener("click", function closeMenu(ev) {
    if (!menuDiv.contains(ev.target)) {
      menuDiv.remove();
      document.removeEventListener("click", closeMenu);
    }
  });
}

// ================= LOAD CHAT =================
function loadChat(id) {
  currentChatId = id;
  chatArea.innerHTML = "";
  const chat = chats.find(c => c.id === id);
  chat.messages.forEach(m => {
    if (m.image) addImageMessage(m.image, m);
    else if (m.file) addFileMessage(m.file, m);
    else addMessage(m.text, m.type, m);
  });
  drawer.classList.remove("show");
}

// ================= UI MESSAGES =================
function addMessage(text, type, msgObj = null) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;

  if (type === "ai") {
    const copy = document.createElement("span");
    copy.className = "copy";
    copy.innerText = "Copy";
    copy.onclick = () => navigator.clipboard.writeText(text);
    div.appendChild(copy);

    const speak = document.createElement("span");
    speak.className = "copy";
    speak.style.right = "50px";
    speak.innerText = "🔊";
    speak.onclick = () => speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    div.appendChild(speak);
  }

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addImageMessage(imgUrl, msgObj = null) {
  const div = document.createElement("div");
  div.className = "msg ai";

  const img = document.createElement("img");
  img.src = imgUrl;
  img.style.maxWidth = "100%";
  img.style.borderRadius = "12px";
  div.appendChild(img);

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addFileMessage(file, msgObj = null) {
  const div = document.createElement("div");
  div.className = "msg ai";

  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = file.name;
  link.innerText = file.name;
  div.appendChild(link);

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ================= THINKING =================
function showThinking() {
  removeThinking(); // agar pehle se ho to hata de

  const div = document.createElement("div");
  div.className = "msg ai thinking";
  div.id = "thinking";

  // 🔥 DOT ANIMATION STRUCTURE
  div.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function removeThinking() {
  const t = document.getElementById("thinking");
  if (t) t.remove();
}

// ================= IMAGE GENERATION =================

/**
 * Generate an image from a prompt and save to chat
 * @param {string} prompt - Image description
 * @param {object} chat - Current chat object
 */
async function generateImage(prompt, chat) {
  showThinking();
  try {
    const res = await fetch(IMAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024"
      })
    });

    const data = await res.json();

    if (!data || !data.data || !data.data[0] || !data.data[0].url) {
      throw new Error("Invalid response from Image API: " + JSON.stringify(data));
    }

    const imgUrl = data.data[0].url;
    removeThinking();
    addImageMessage(imgUrl);

    chat.messages.push({ type: "ai", image: imgUrl });
    saveChats();
  } catch (err) {
    console.error("Image generation error:", err);
    removeThinking();
    addMessage("Image generation failed", "ai");
  }
}

// ================= SEND MESSAGE (Updated for Image) =================
sendBtn.onclick = async () => {
  const text = userInput.value.trim();
  if (!text && !pendingFile) return;

  if (!currentChatId) createNewChat();
  const chat = chats.find(c => c.id === currentChatId);

  // Handle text message
  if (text && !text.startsWith("📎")) {
    addMessage(text, "user");
    chat.messages.push({ text, type: "user" });

    // Update chat title if new chat
    if (chat.title === "New Chat") {
      chat.title = text.slice(0, 20);
      renderChatList();
    }

    // Image prompt check
    if (isImagePrompt(text)) {
      await generateImage(text, chat);
      userInput.value = "";
      return;
    }

    // Text API call
    showThinking();
    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: text }]
        })
      });

      const data = await res.json();
      const reply = data.choices[0].message.content;

      removeThinking();
      addMessage(reply, "ai", { text: reply, type: "ai" });
      chat.messages.push({ text: reply, type: "ai" });
      saveChats();
    } catch {
      removeThinking();
      addMessage("Error: AI not responding", "ai");
    }
  }

  // Handle pending file
  if (pendingFile) {
    addFileMessage(pendingFile, { type: "user", file: pendingFile });
    chat.messages.push({ type: "user", file: pendingFile });
    saveChats();

    showThinking();
    setTimeout(() => {
      removeThinking();
      const reply = `Received file "${pendingFile.name}" and processed.`;
      addMessage(reply, "ai", { type: "ai", text: reply });
      chat.messages.push({ text: reply, type: "ai" });
      saveChats();
      pendingFile = null;
    }, 1000);
  }

  userInput.value = ""; // clear input after sending
};

// ================= SEARCH =================
searchChats.oninput = e => renderChatList(e.target.value);

// ================= PROFILE =================
profileBtn.onclick = (e) => {
  e.stopPropagation();

  // agar user login hi nahi hai
  const userProfile = JSON.parse(localStorage.getItem("chatAIUser"));
  if (!userProfile) {
    alert("User not logged in");
    window.location.href = "login.html";
    return;
  }

  let popup = document.getElementById("profilePopup");

  // toggle behaviour
  if (popup) {
    popup.remove();
    return;
  }

  // create popup
  popup = document.createElement("div");
  popup.id = "profilePopup";
  popup.style.position = "fixed";
  popup.style.top = "60px";
  popup.style.right = "15px";

  popup.innerHTML = `
    <p><strong>Name:</strong> ${userProfile.name || "User"}</p>
    <p><strong>Email:</strong> ${userProfile.email || "Not provided"}</p>
    <p><strong>Phone:</strong> ${userProfile.phone || userProfile.mobile || "Not provided"}</p>
    <button id="logoutBtn">Logout</button>
  `;

  document.body.appendChild(popup);

  // logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("chatAIUser");
    window.location.href = "login.html";
  };

  // click outside to close
  const closeProfile = (event) => {
    if (!popup.contains(event.target) && event.target !== profileBtn) {
      popup.remove();
      document.removeEventListener("click", closeProfile);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", closeProfile);
  }, 0);
};


// ================= STATE FOR FILE =================
let pendingFile = null;

// ================= FILE UPLOAD =================
attachBtn.onclick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // Store file temporarily, don't send yet
    pendingFile = file;
    userInput.value = `📎 ${file.name}`; // optional visual indicator
  };
  input.click();
};

// ================= SEND MESSAGE (Updated for File) =================
sendBtn.onclick = async () => {
  const text = userInput.value.trim();
  if (!text && !pendingFile) return;

  if (!currentChatId) createNewChat();
  const chat = chats.find(c => c.id === currentChatId);

  // Handle text message
  if (text && !text.startsWith("📎")) {
    addMessage(text, "user");
    chat.messages.push({ text, type: "user" });

    // Update chat title if new chat
    if (chat.title === "New Chat") {
      chat.title = text.slice(0, 20);
      renderChatList();
    }

    // Image prompt check
    if (isImagePrompt(text)) {
      await generateImage(text, chat);
      userInput.value = "";
      return;
    }

    // Text API call
    showThinking();
    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: text }]
        })
      });

      const data = await res.json();
      const reply = data.choices[0].message.content;

      removeThinking();
      addMessage(reply, "ai", { text: reply, type: "ai" });
      chat.messages.push({ text: reply, type: "ai" });
      saveChats();
    } catch {
      removeThinking();
      addMessage("Error: AI not responding", "ai");
    }
  }

  // Handle pending file
  if (pendingFile) {
    addFileMessage(pendingFile, { type: "user", file: pendingFile });
    chat.messages.push({ type: "user", file: pendingFile });
    saveChats();

    // AI response placeholder
    showThinking();
    setTimeout(() => {
      removeThinking();
      const reply = `Received file "${pendingFile.name}" and processed.`;
      addMessage(reply, "ai", { type: "ai", text: reply });
      chat.messages.push({ text: reply, type: "ai" });
      saveChats();
      pendingFile = null;
    }, 1000);
  }

  userInput.value = ""; // clear input after sending
};


// ================= VOICE MESSAGE (Updated with Start/Stop) =================
let mediaRecorder = null;
let audioChunks = [];
let recording = false;

voiceBtn.onclick = async () => {
  if (recording) {
    // Stop recording
    mediaRecorder.stop();
    recording = false;
    voiceBtn.textContent = "🎙️"; // Reset button icon
    return;
  }

  if (!navigator.mediaDevices) return alert("Voice recording not supported.");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  recording = true;
  voiceBtn.textContent = "⏹️"; // Change button to Stop icon

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const file = new File([blob], "voice_message.webm");

    if (!currentChatId) createNewChat();
    const chat = chats.find(c => c.id === currentChatId);

    addFileMessage(file, { type: "user", file });
    chat.messages.push({ type: "user", file });
    saveChats();

    // Simulate AI response
    showThinking();
    setTimeout(() => {
      removeThinking();
      const reply = "AI received your voice message and converted to text: [Voice content]";
      addMessage(reply, "ai", { type: "ai", text: reply });
      chat.messages.push({ text: reply, type: "ai" });
      saveChats();
    }, 1500);
  };

  mediaRecorder.start();
};


// ================= INIT =================
renderChatList();