// 食材検索サービス（ローカルデータベースを使用）

// ローカル検索（既存のfoodDatabaseを使用）
export const searchFoodLocal = (query) => {
	const results = [];
	const searchTerm = query.toLowerCase();

	// 既存のfoodDatabaseから検索
	const { foodDatabase } = require("../data/foodDatabase");

	Object.keys(foodDatabase).forEach((foodName) => {
		if (foodName.toLowerCase().includes(searchTerm)) {
			results.push({
				id: foodName,
				name: foodName,
				...foodDatabase[foodName],
				per100g: foodDatabase[foodName],
			});
		}
	});

	return results;
};

// 栄養成分計算（ローカルデータ用）
export const calculateNutritionFromLocal = (food, grams) => {
	if (!food) return null;

	// カスタム食材の場合
	if (food.isCustom) {
		return calculateCustomNutrition(food, grams);
	}

	// ローカルデータの場合
	if (!food.per100g) return null;

	const ratio = grams / 100;

	return {
		calories: Math.round(food.per100g.calories * ratio),
		protein: Math.round(food.per100g.protein * ratio * 10) / 10,
		fat: Math.round(food.per100g.fat * ratio * 10) / 10,
		carbohydrate: Math.round(food.per100g.carbohydrate * ratio * 10) / 10,
	};
};

// カスタム食材用の栄養成分計算
export const calculateCustomNutrition = (food, grams) => {
	console.log("calculateCustomNutrition called with:", { food, grams });

	if (!food) {
		console.log("calculateCustomNutrition: food is null or undefined");
		return null;
	}

	// 不足している栄養素フィールドを0として扱う（0の場合も考慮）
	const calories =
		food.calories !== undefined && food.calories !== null ? food.calories : 0;
	const protein =
		food.protein !== undefined && food.protein !== null ? food.protein : 0;
	const fat = food.fat !== undefined && food.fat !== null ? food.fat : 0;
	const carbohydrate =
		food.carbohydrate !== undefined && food.carbohydrate !== null
			? food.carbohydrate
			: 0;

	console.log("Nutrition values:", { calories, protein, fat, carbohydrate });

	const ratio = grams / 100;
	const result = {
		calories: Math.round(calories * ratio),
		protein: Math.round(protein * ratio * 10) / 10,
		fat: Math.round(fat * ratio * 10) / 10,
		carbohydrate: Math.round(carbohydrate * ratio * 10) / 10,
	};

	console.log("calculateCustomNutrition result:", result);
	return result;
};

// 統合検索関数（ローカルのみ）
export const searchFood = async (query) => {
	if (!query || query.length < 2) return [];

	console.log("Local search for:", query);
	const results = searchFoodLocal(query);
	console.log("Local search results:", results);
	return results;
};

// 下位互換性のためのエイリアス
export const calculateNutritionFromAPI = calculateNutritionFromLocal;
