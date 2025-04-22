//FIREBASE_TOKEN = 1//06SKAfH_LCTMMCgYIARAAGAYSNwF-L9IrUb4hsebITDTbmkexMLUM9toITx_yUo9oUs8eMv_ijisbUatLsGWtS7FY4vJo2zb0qFg

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
const db = getFirestore(app)

async function registerUser(email, password, username) {
  const auth = getAuth();
  const db = getFirestore();
  
  try {
    // 1. Create the user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 2. Save additional user data to Firestore
    const userDocRef = doc(db, "users", user.uid);
    
    await setDoc(userDocRef, {
      email: email,
      username: username,
      createdAt: new Date(),
      lastLogin: new Date()
    });
    
    registerForm.reset();
    location.href = "profile-setup.html"
    
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
}

// Registration Form
const register = document.querySelector('#registerForm');
if(register) {
  register.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = registerForm['regEmail'].value;
    const password = registerForm['regPassword'].value;
    const username = registerForm['regUsername'].value;
   
    registerUser(email, password, username);
  }
)};

// Login Form
const loginForm = document.querySelector('#loginForm');
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
      location.href = "user-library.html";
    })
    .catch((error) => {
      loginForm.reset();
      alert("Incorrect username or password.");
    });
  });
}

// Status tracker of user
onAuthStateChanged(auth, async (user) => {  // Add async here
  if (user) {
    console.log("user logged in: ", user);
    
    // Profile section - only if on profile page
    const profile = document.querySelector('.profile-info');
    if(profile) {
      try {
        // Get the user document from Firestore
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Update the username display
          document.getElementById('username').textContent = userData.username;
        } else {
          console.log("No user data found in Firestore");
          document.getElementById('username').textContent = "New User";
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        document.getElementById('username').textContent = "User";
      }
    }
    
    // Load user libraries when logged in
    loadUserLibraries(user.uid);
  } else {
    console.log("user logged out");
    // Clear or reset profile display if needed
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      usernameElement.textContent = "[username]";
    }
  }
});

// Logging out
const logout = document.querySelector("#logout");
if(logout) {
  logout.addEventListener('click', (e) => {
    console.log("I reach here :D");
    e.preventDefault();
 
    auth.signOut().then(() => {
      location.href = "index.html";
    });
  });
}



// Load libraries for corresponding logged in user
async function loadUserLibraries(userId) {
  try {
      const librariesRef = collection(db, 'users', userId, 'libraries');
      const unsubscribe = onSnapshot(librariesRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
              if (change.type === "added" || change.type === "modified") {
                  const libraryData = change.doc.data();
                  renderLibrary(change.doc.id, libraryData);
              }
              if (change.type === "removed") {
                  // Remove the library from the UI
                  const libraryElement = document.getElementById(change.doc.id);
                  if (libraryElement) {
                      libraryElement.remove();
                  }
              }
          });
      });
      return unsubscribe;
  } catch (error) {
      console.error("Error loading libraries:", error);
  }
}

function renderLibrary(libraryId, libraryData) {
  let libraryElement = document.getElementById(libraryId);
  
  if (!libraryElement) {
      libraryElement = document.createElement('div');
      libraryElement.className = 'library';
      libraryElement.id = libraryId;
      //libraryElement.style.backgroundColor = 'blue';
    //libraryElement.style.display = 'flex';

      
      libraryElement.innerHTML = `
          <div class="library-header">
              <h3 class="library-name">${libraryData.name}</h3>
              <div class="library-actions">
                  <button class="edit-library">Edit</button>
                  <button class="add-game">Add Game</button>
                  <button class="delete-library">Delete</button>
              </div>
          </div>
          <div class="library-labels">Labels: 
              ${libraryData.labels.map(label => `<span class="label">${label}, </span>`).join('')}
          </div>
          <div class="games-container"></div>
      `;

      
      const libCont = document.getElementById('libraries-container');
      if(libCont) {
        libCont.appendChild(libraryElement);
        setupLibraryEvents(libraryElement);  
      }
  } else {
      libraryElement.querySelector('.library-name').textContent = libraryData.name;
      libraryElement.querySelector('.library-labels').innerHTML = 
          libraryData.labels.map(label => `<span class="label">${label}, </span>`);
  }
}

// Set up event listeners for a library
function setupLibraryEvents(libraryElement) {
  const editBtn = libraryElement.querySelector('.edit-library');
  const addGameBtn = libraryElement.querySelector('.add-game');
  const gamesContainer = libraryElement.querySelector('.games-container');
  const deleteBtn = libraryElement.querySelector('.delete-library');

  editBtn.addEventListener('click', function() {
      enterEditMode(libraryElement);
  });
  
  addGameBtn.addEventListener('click', function() {
      // Implement your game card creation logic here
      const gameCard = createGameCard();
      gamesContainer.appendChild(gameCard);
  });
  
  deleteBtn.addEventListener('click', async function() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to delete libraries");
        return;
    }
    
    if (confirm("Are you sure you want to delete this library?")) {
        try {
            const libraryRef = doc(db, 'users', user.uid, 'libraries', libraryElement.id);
            await deleteDoc(libraryRef);
            // The onSnapshot listener in loadUserLibraries will handle the UI update
        } catch (error) {
            console.error("Error deleting library:", error);
            alert("Failed to delete library. Please try again.");
        }
    }
  });
}

// Enter edit mode for a library
let currentLibraryId = null;
let isEditMode = false;
function enterEditMode(libraryElement) {
  isEditMode = true;
  currentLibraryId = libraryElement.id;
  modalTitle.textContent = 'Edit Library';
  
  // Populate form with existing data
  document.getElementById('library-name').value = libraryElement.querySelector('.library-name').textContent;
  //document.getElementById('library-labels').value = libraryElement.querySelector('.library-labels').textContent;

  
  const labels = JSON.parse(libraryElement.dataset.labels || '[]');
  labelsContainer.innerHTML = '<label>Labels: </label>';
  
  labels.forEach(label => {
      const labelInput = document.createElement('div');
      labelInput.className = 'label-input';
      labelInput.innerHTML = `
          <input type="text" class="label-name" value="${label}">
          <button type="button" class="remove-label">×</button>
      `;
      labelsContainer.appendChild(labelInput);
  });
  
  modal.style.display = 'block';
}

// DOM elements
const createLibraryBtn = document.getElementById('create-library-btn');
//const librariesContainer = document.getElementById('libraries-container');
const modal = document.getElementById('library-modal');
const closeBtn = document.querySelector('.close');
const libraryForm = document.getElementById('library-form');
const addLabelBtn = document.getElementById('add-label');
const labelsContainer = document.getElementById('labels-container');
const modalTitle = document.getElementById('modal-title');

// Open modal for creating a new library
if(createLibraryBtn) { 
  createLibraryBtn.addEventListener('click', function() {
    isEditMode = false;
    modalTitle.textContent = 'Create New Library';
    libraryForm.reset();
    labelsContainer.innerHTML = `
        <label>Labels:</label>
        <div class="label-input">
            <input type="text" class="label-name" placeholder="Label name">
            <button type="button" class="remove-label">×</button>
        </div>
    `;
    modal.style.display = 'block';
  });
}

// Close modal
if(closeBtn){
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });
}

// Add another label field
if(addLabelBtn) {
  addLabelBtn.addEventListener('click', function() {
    const labelInput = document.createElement('div');
    labelInput.className = 'label-input';
    labelInput.innerHTML = `
        <input type="text" class="label-name" placeholder="Label name">
        <button type="button" class="remove-label">×</button>
    `;
    labelsContainer.appendChild(labelInput);
  });
}

// Remove label field
if(labelsContainer) {
  labelsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-label')) {
        if (document.querySelectorAll('.label-input').length > 1) {
            e.target.parentElement.remove();
        }
    }
  });
}

// Handle form submission
if(libraryForm) {
  libraryForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const libraryName = document.getElementById('library-name').value;
    const labelInputs = document.querySelectorAll('.label-name');
    const labels = Array.from(labelInputs).map(input => input.value.trim()).filter(label => label);
    
    // Get the current logged-in user
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to save libraries!");
      return;
    }
  
    // Prepare library data
    const libraryData = {
      name: libraryName,
      labels: labels,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  
    if (isEditMode) {
      // Update existing library in Firestore
      try {
        const libraryRef = doc(db, 'users', user.uid, 'libraries', currentLibraryId);
        await updateDoc(libraryRef, {
          name: libraryName,
          labels: labels,
          updatedAt: new Date().toISOString()
        });
        console.log("Library updated in Firestore!");
      } catch (error) {
        console.error("Error updating library:", error);
      }
    } else {
      // Create new library in Firestore
      const libraryId = 'library-' + Date.now(); // Unique ID
      await saveLibraryToFirestore(user.uid, libraryId, libraryData); // <-- CALL HERE
    }
  
    modal.style.display = 'none'; // Close modal
  });
}

// Save library
async function saveLibraryToFirestore(userId, libraryId, libraryData) {
  try {
    const libraryRef = doc(db, 'users', userId, 'libraries', libraryId);
    await setDoc(libraryRef, libraryData);
    //console.log("Library saved successfully!"); | Debugging
  } catch (error) {
    //console.error("Error saving library: ", error); || Debugging
  }
}