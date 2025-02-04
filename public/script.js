// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2FcmDPTGkDRUg5a64YQWr_NNdquwCXZU",
  authDomain: "gamepath-1.firebaseapp.com",
  projectId: "gamepath-1",
  storageBucket: "gamepath-1.firebasestorage.app",
  messagingSenderId: "662366695392",
  appId: "1:662366695392:web:afc686c6808ff2606c0585",
  measurementId: "G-RGJCZMG3N1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ User Registration Handling
const registerForm = document.querySelector('#regForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMessage = document.getElementById('registerError');

    // Password validation pattern
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      errorMessage.textContent = "Password must have 8+ characters, 1 symbol, 1 capital letter, and 1 number.";
      return;
    }

    if (password !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match!";
      return;
    }

    try {
      // Create user in Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful! You can now log in.");
      registerForm.reset();
      window.location.href = "index.html"; // Redirect to login page
    } catch (error) {
      errorMessage.textContent = "Error: " + error.message;
    }
  });
}

// ✅ User Login Handling
const loginForm = document.querySelector('#myForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const loginError = document.getElementById("loginError");

    try {
      // Authenticate user in Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      loginForm.reset();
      window.location.href = "home.html"; // Redirect to Home page
    } catch (error) {
      loginError.textContent = "Incorrect username or password.";
      loginForm.reset();
    }
  });
}

// ✅ User Logout Handling
const logoutButton = document.querySelector("#logout");
if (logoutButton) {
  logoutButton.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      await signOut(auth);
      alert("Logged out successfully.");
      window.location.href = "index.html"; // Redirect to Login
    } catch (error) {
      console.error("Logout Error:", error);
    }
  });
}

// ✅ Track User Authentication State
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user);
  } else {
    console.log("User logged out");
  }
});
