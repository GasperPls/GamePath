//FIREBASE_TOKEN = 1//06SKAfH_LCTMMCgYIARAAGAYSNwF-L9IrUb4hsebITDTbmkexMLUM9toITx_yUo9oUs8eMv_ijisbUatLsGWtS7FY4vJo2zb0qFg

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2FcmDPTGkDRUg5a64YQWr_NNdquwCXZU",
  authDomain: "gamepath-1.firebaseapp.com",
  databaseURL: "https://gamepath-1-default-rtdb.firebaseio.com",
  projectId: "gamepath-1",
  storageBucket: "gamepath-1.firebasestorage.app",
  messagingSenderId: "662366695392",
  appId: "1:662366695392:web:afc686c6808ff2606c0585",
  measurementId: "G-RGJCZMG3N1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Registration Form
const register = document.querySelector('#regForm');
if(register) {
  register.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = regForm['regEmail'].value;
    const password = regForm['regPassword'].value;
    //const repass = regForm['regRepassword'].value;
   
    createUserWithEmailAndPassword(auth, email, password).then(cred => {
        regForm.reset();
        location.href = "/test.html"
    });}
)};

// Status tracker of user
onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("user logged in: ", user);
    } else {
      console.log("user logged out");
    }
  });

  // Login Form
const loginForm = document.querySelector('#myForm');
if(loginForm) {
  // Add an event listener for when the login form has been submitted
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get user inputs
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;


    //Function that signs in users
    signInWithEmailAndPassword(auth, email, password).then(cred => {
      //Reset Form and then send the user to Home
      loginForm.reset();
      location.href = "/test.html";
    })
    .catch((error) => {
      loginForm.reset();
      alert("Incorrect username or password.");
    });
  });
}

// Logging out
const logout = document.querySelector("#logout");
if(logout) {
  logout.addEventListener('click', (e) => {
    e.preventDefault();
 
    auth.signOut().then(() => {
      location.href = "/index.html";
    });
  });
}