// firebase.js
// Echte Firebase-Initialisierung mit Firestore (über CDN-Module)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let db = null;

export function initFirebase() {
  const firebaseConfig = {
  apiKey: "AIzaSyCSKmZe4RK5wUW2aQ6nU899aP7WUnXKs2E",
  authDomain: "haelok-a96bb.firebaseapp.com",
  projectId: "haelok-a96bb",
  storageBucket: "haelok-a96bb.firebasestorage.app",
  messagingSenderId: "756111132502",
  appId: "1:756111132502:web:a51cd94842cadad46ff8f7",
  measurementId: "G-MK4YKSBDC2"
};

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase initialisiert");
}

// Ergebnis in Firestore speichern
export async function saveResultToFirestore(result) {
  if (!db) {
    console.warn("Firestore noch nicht initialisiert");
    return;
  }
  await addDoc(collection(db, "results"), result);
}

// Feedback in Firestore speichern
export async function saveFeedbackToFirestore(feedback) {
  if (!db) {
    console.warn("Firestore noch nicht initialisiert");
    return;
  }
  await addDoc(collection(db, "feedback"), feedback);
}

// Optional: später Tests aus Firestore laden (jetzt noch nicht genutzt)
export async function loadTestsFromFirestore() {
  // hier könntest du später Tests laden
  return null;
}
