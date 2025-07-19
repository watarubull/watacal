// 文部科学省の食品成分表APIを使用した食材検索サービス
const MEIBU_API_BASE_URL = "https://fooddb.mext.go.jp/api/v1";

// 食材検索API（文部科学省データベース）
export const searchFoodFromAPI = async (query) => {
	try {
		// 文部科学省の食品成分表APIを使用
		const response = await fetch(
			`${MEIBU_API_BASE_URL}/search?keyword=${encodeURIComponent(
				query
			)}&lang=ja`
		);

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}

		const data = await response.json();

		// 結果を整形
		const foods =
			data.foods?.map((food) => {
				return {
					id: food.food_code,
					name: food.food_name,
					calories: food.energy_kcal || 0,
					protein: food.protein || 0,
					fat: food.fat || 0,
					carbohydrate: food.carbohydrate || 0,
					// 100gあたりの値
					per100g: {
						calories: Math.round(food.energy_kcal || 0),
						protein: Math.round((food.protein || 0) * 10) / 10,
						fat: Math.round((food.fat || 0) * 10) / 10,
						carbohydrate: Math.round((food.carbohydrate || 0) * 10) / 10,
					},
				};
			}) || [];

		return foods;
	} catch (error) {
		console.error("Error searching food from API:", error);
		return [];
	}
};

// 栄養成分計算（APIデータ用）
export const calculateNutritionFromAPI = (food, grams) => {
	if (!food) return null;

	// カスタム食材の場合
	if (food.isCustom) {
		return calculateCustomNutrition(food, grams);
	}

	// APIデータの場合
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
	if (
		!food ||
		!food.calories ||
		!food.protein ||
		!food.fat ||
		!food.carbohydrate
	) {
		return null;
	}

	const ratio = grams / 100;

	return {
		calories: Math.round(food.calories * ratio),
		protein: Math.round(food.protein * ratio * 10) / 10,
		fat: Math.round(food.fat * ratio * 10) / 10,
		carbohydrate: Math.round(food.carbohydrate * ratio * 10) / 10,
	};
};

// フォールバック用のローカル検索（既存のfoodDatabaseを使用）
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

// 統合検索関数（API + ローカル）
export const searchFood = async (query) => {
	if (!query || query.length < 2) return [];

	try {
		console.log("API search for:", query);
		// まずAPIで検索
		const apiResults = await searchFoodFromAPI(query);
		console.log("API results:", apiResults);

		if (apiResults.length > 0) {
			console.log("Using API results");
			return apiResults;
		}

		console.log("No API results, using local search");
		// APIで結果がない場合はローカル検索
		return searchFoodLocal(query);
	} catch (error) {
		console.error("Error in searchFood:", error);
		// エラー時はローカル検索にフォールバック
		return searchFoodLocal(query);
	}
};
