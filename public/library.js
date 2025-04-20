// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase Configuration
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
const db = getFirestore(app);

// Function to create a new library
async function createLibrary(userId, libraryName, labels = []) {
    try {
        const librariesRef = collection(db, "users", userId, "libraries");
        const newLibrary = {
            name: libraryName,
            labels: labels,
            games: [],
            createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(librariesRef, newLibrary);
        return docRef.id;
    } catch (error) {
        console.error("Error creating library:", error);
        throw error;
    }
}

// Function to add a game to a library
async function addGameToLibrary(userId, libraryId, gameData) {
    try {
        const libraryRef = doc(db, "users", userId, "libraries", libraryId);
        await updateDoc(libraryRef, {
            games: arrayUnion(gameData)
        });
    } catch (error) {
        console.error("Error adding game to library:", error);
        throw error;
    }
}

// Function to remove a game from a library
async function removeGameFromLibrary(userId, libraryId, gameId) {
    try {
        const libraryRef = doc(db, "users", userId, "libraries", libraryId);
        const libraryDoc = await getDoc(libraryRef);
        if (libraryDoc.exists()) {
            const games = libraryDoc.data().games;
            const updatedGames = games.filter(game => game.id !== gameId);
            await updateDoc(libraryRef, {
                games: updatedGames
            });
        }
    } catch (error) {
        console.error("Error removing game from library:", error);
        throw error;
    }
}

// Function to get all libraries for a user
async function getUserLibraries(userId) {
    try {
        const librariesRef = collection(db, "users", userId, "libraries");
        const querySnapshot = await getDocs(librariesRef);
        const libraries = [];
        querySnapshot.forEach((doc) => {
            libraries.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return libraries;
    } catch (error) {
        console.error("Error getting user libraries:", error);
        throw error;
    }
}

// Function to display libraries in the UI
function displayLibraries(libraries) {
    const librariesContainer = document.getElementById('libraries-container');
    librariesContainer.innerHTML = '';

    if (libraries.length === 0) {
        librariesContainer.innerHTML = '<p class="empty-library">No libraries created yet. Create your first library!</p>';
        return;
    }

    libraries.forEach(library => {
        const libraryCard = document.createElement('div');
        libraryCard.className = 'library-card';
        libraryCard.innerHTML = `
            <h3>${library.name}</h3>
            <div class="library-labels">
                ${library.labels.map(label => `<span class="label">${label}</span>`).join('')}
            </div>
            <div class="library-games">
                ${library.games.length > 0 
                    ? library.games.map(game => `
                        <div class="game-card">
                            <img src="${game.image}" alt="${game.title}">
                            <h4>${game.title}</h4>
                        </div>
                    `).join('')
                    : '<p class="empty-library">No games in this library</p>'
                }
            </div>
        `;
        librariesContainer.appendChild(libraryCard);
    });
}

// Initialize library management when the page loads
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const libraries = await getUserLibraries(user.uid);
                displayLibraries(libraries);
            } catch (error) {
                console.error("Error loading libraries:", error);
            }
        } else {
            window.location.href = "index.html";
        }
    });
}); 