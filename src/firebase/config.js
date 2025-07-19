import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyAulI7iFOTnCUyamkWyTzKcFYTQAviiljM",
	authDomain: "kpfc-manager.firebaseapp.com",
	projectId: "kpfc-manager",
	storageBucket: "kpfc-manager.firebasestorage.app",
	messagingSenderId: "262360198405",
	appId: "1:262360198405:web:25f2f4604ff0c7977c9b6c",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
