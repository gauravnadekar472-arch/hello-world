const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const responseEl = document.getElementById("response");

// Replace with your Render backend URL
const BACKEND_URL = "https://eagleai-3w3t.onrender.com";

sendBtn.addEventListener("click", async () => {
  const message = userInput.value;
  if (!message) return;

  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    })
  });

  const data = await res.json();
  responseEl.textContent = JSON.stringify(data, null, 2);
});
