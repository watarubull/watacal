// カスタム食材データベース
// Firebase Firestoreを使用してユーザーが独自に追加した食材を管理

import {
	collection,
	addDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const getCustomFoods = async () => {
	try {
		const customFoodsRef = collection(db, "customFoods");
		const querySnapshot = await getDocs(customFoodsRef);

		const customFoods = [];
		querySnapshot.forEach((doc) => {
			customFoods.push({
				id: doc.id,
				...doc.data(),
				isCustom: true,
			});
		});

		return customFoods;
	} catch (error) {
		console.error("Error getting custom foods:", error);
		return [];
	}
};

export const addCustomFood = async (food) => {
	try {
		const newFood = {
			...food,
			createdAt: new Date(),
			isCustom: true,
		};

		const docRef = await addDoc(collection(db, "customFoods"), newFood);
		return {
			id: docRef.id,
			...newFood,
		};
	} catch (error) {
		console.error("Error adding custom food:", error);
		throw error;
	}
};

export const updateCustomFood = async (id, updatedFood) => {
	try {
		const foodRef = doc(db, "customFoods", id);
		await updateDoc(foodRef, {
			...updatedFood,
			updatedAt: new Date(),
		});

		return {
			id,
			...updatedFood,
			updatedAt: new Date(),
		};
	} catch (error) {
		console.error("Error updating custom food:", error);
		throw error;
	}
};

export const deleteCustomFood = async (id) => {
	try {
		await deleteDoc(doc(db, "customFoods", id));
	} catch (error) {
		console.error("Error deleting custom food:", error);
		throw error;
	}
};

export const searchCustomFoods = async (query) => {
	try {
		const customFoods = await getCustomFoods();
		return customFoods.filter((food) =>
			food.name.toLowerCase().includes(query.toLowerCase())
		);
	} catch (error) {
		console.error("Error searching custom foods:", error);
		return [];
	}
};
