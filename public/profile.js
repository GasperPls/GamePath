// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase Configuration (use the same credentials from `script.js`)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGEING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to load user profile data
const loadUserProfile = async (userId) => {
    const userDoc = doc(db, "users", userId); // Reference to Firestore document
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById("username").textContent = userData.username;
        document.getElementById("email").textContent = userData.email;
        document.getElementById("genres").textContent = userData.favoriteGenres.join(", ");
        document.getElementById("platform").textContent = userData.platform.join(", ");
    } else {
        console.log("No user data found!");
    }
};

// Check if the user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserProfile(user.uid); // Load profile data for the logged-in user
    } else {
        alert("You must be logged in to view your profile!");
        window.location.href = "index.html"; // Redirect to home if not logged in
    }
});

// Function to edit profile (future feature)
function editProfile() {
    alert("Edit Profile functionality coming soon!");
}
