// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyBhKGp6t4c8IDyKMiGZCBQc0n62NofPBDA",
  authDomain: "quronai-f674f.firebaseapp.com",
  projectId: "quronai-f674f",
  storageBucket: "quronai-f674f.firebasestorage.app",
  messagingSenderId: "659872862710",
  appId: "1:659872862710:web:ce9991a11ab9a4682cf7d7",
  measurementId: "G-H8Z1CFRJJT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ================= ELEMENTS =================
const loginForm = document.getElementById("loginForm");
const mobileInput = document.getElementById("mobile");
const googleLoginBtn = document.getElementById("googleLogin");

// ================= CHECK ALREADY LOGIN =================
auth.onAuthStateChanged(user => {
  if (user) {
    // Save user info to localStorage if missing
    const existingProfile = JSON.parse(localStorage.getItem("chatAIUser"));
    if (!existingProfile) {
      localStorage.setItem("chatAIUser", JSON.stringify({
        name: user.displayName || "User",
        email: user.email || "",
        phone: user.phoneNumber || ""
      }));
    }
    // Redirect to home page
    window.location.href = "index.html";
  }
});

// ================= PHONE LOGIN =================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const phoneNumber = mobileInput.value.trim();
  if (!phoneNumber) {
    alert("Enter mobile number");
    return;
  }

  try {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      { size: "invisible" }
    );

    const confirmationResult =
      await auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier);

    const otp = prompt("Enter OTP");
    if (!otp) return;

    await confirmationResult.confirm(otp);

    alert("Phone login successful!");
    // Save minimal info to localStorage
    localStorage.setItem("chatAIUser", JSON.stringify({
      name: "User",
      phone: phoneNumber
    }));

    window.location.href = "index.html";

  } catch (err) {
    alert(err.message);
  }
});

// ================= GOOGLE LOGIN =================
googleLoginBtn.onclick = () => {
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      const user = result.user;
      // Save Google user info to localStorage
      localStorage.setItem("chatAIUser", JSON.stringify({
        name: user.displayName,
        email: user.email,
        phone: user.phoneNumber || ""
      }));
      alert("Google login successful!");
      window.location.href = "index.html";
    })
    .catch(err => alert(err.message));
};
