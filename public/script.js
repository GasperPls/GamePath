//FIREBASE_TOKEN = 1//06SKAfH_LCTMMCgYIARAAGAYSNwF-L9IrUb4hsebITDTbmkexMLUM9toITx_yUo9oUs8eMv_ijisbUatLsGWtS7FY4vJo2zb0qFg

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGEING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/*async function fetchGameByName() {
    const gameName = document.getElementById('gameName').value;

    // Step 1: Get the access token
    try {
        const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token?client_id=22f80p3n02dqsog5amvtefpcuc9elr&client_secret=gpgnzckluwi05693yhnnmjtzndd39p&grant_type=client_credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            document.getElementById('response').innerText = 'Failed to retrieve access token.';
            return;
        }

        // Step 2: Use the access token to search for the game by name
        const gameResponse = await fetch(`https://api.twitch.tv/helix/search/categories?query=${encodeURIComponent(gameName)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Client-Id': clientId
            }
        });

        const gameData = await gameResponse.json();

        if (gameData.data && gameData.data.length > 0) {
            const gameInfo = gameData.data[0];
            const resultText = `Game Name: ${gameInfo.name}\nID: ${gameInfo.id}`;
            document.getElementById('response').innerText = resultText;
        } else {
            document.getElementById('response').innerText = 'No game found with the given name.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('response').innerText = 'Error: ' + error;
    }
}
*/


////_________________________ TESTING LOGIN FUNCTIONS + CREDENTIALS _________________________////
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
