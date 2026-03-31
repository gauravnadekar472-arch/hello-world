// ================= LOGIN CHECK =================
let userProfile;
try {
  const stored = localStorage.getItem("chatAIUser");
  userProfile = stored ? JSON.parse(stored) : null;
} catch (e) {
  localStorage.removeItem("chatAIUser");
  userProfile = null;
}
if (!userProfile || (!userProfile.email && !userProfile.phone)) {
  window.location.replace("login.html");
}