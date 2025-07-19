// 文部科学省の食品成分表をベースにした拡張データベース
export const foodDatabase = {
	// 穀類
	白米: { calories: 168, protein: 2.6, fat: 0.3, carbohydrate: 37.1 },
	玄米: { calories: 165, protein: 2.8, fat: 1.0, carbohydrate: 35.6 },
	麦ご飯: { calories: 155, protein: 3.2, fat: 0.5, carbohydrate: 33.8 },
	食パン: { calories: 264, protein: 9.3, fat: 3.8, carbohydrate: 47.7 },
	うどん: { calories: 105, protein: 2.5, fat: 0.1, carbohydrate: 21.4 },
	そば: { calories: 132, protein: 4.8, fat: 0.5, carbohydrate: 26.0 },
	パスタ: { calories: 131, protein: 4.8, fat: 0.9, carbohydrate: 25.1 },
	コーンフレーク: { calories: 380, protein: 8.0, fat: 0.4, carbohydrate: 84.0 },
	オートミール: { calories: 389, protein: 16.9, fat: 6.9, carbohydrate: 66.3 },

	// 肉類
	鶏むね肉: { calories: 191, protein: 22.3, fat: 10.8, carbohydrate: 0.1 },
	鶏もも肉: { calories: 253, protein: 18.8, fat: 18.8, carbohydrate: 0.1 },
	豚ロース: { calories: 263, protein: 19.3, fat: 19.2, carbohydrate: 0.1 },
	豚ヒレ: { calories: 115, protein: 22.8, fat: 2.2, carbohydrate: 0.1 },
	牛もも肉: { calories: 209, protein: 21.2, fat: 12.1, carbohydrate: 0.1 },
	牛ロース: { calories: 318, protein: 19.1, fat: 26.1, carbohydrate: 0.1 },
	牛ヒレ: { calories: 133, protein: 22.7, fat: 4.4, carbohydrate: 0.1 },
	豚バラ肉: { calories: 395, protein: 14.4, fat: 35.4, carbohydrate: 0.1 },
	ソーセージ: { calories: 321, protein: 12.8, fat: 28.5, carbohydrate: 2.1 },
	ハム: { calories: 196, protein: 22.6, fat: 10.8, carbohydrate: 0.1 },

	// 魚類
	鮭: { calories: 204, protein: 22.3, fat: 12.5, carbohydrate: 0.1 },
	マグロ: { calories: 144, protein: 26.4, fat: 4.8, carbohydrate: 0.1 },
	サバ: { calories: 247, protein: 20.7, fat: 16.8, carbohydrate: 0.1 },
	アジ: { calories: 126, protein: 20.7, fat: 4.9, carbohydrate: 0.1 },
	イワシ: { calories: 217, protein: 19.8, fat: 14.2, carbohydrate: 0.1 },
	カツオ: { calories: 114, protein: 25.8, fat: 1.4, carbohydrate: 0.1 },
	ブリ: { calories: 257, protein: 21.4, fat: 17.6, carbohydrate: 0.1 },
	タラ: { calories: 77, protein: 17.6, fat: 0.4, carbohydrate: 0.1 },
	エビ: { calories: 99, protein: 20.1, fat: 1.1, carbohydrate: 0.1 },
	イカ: { calories: 88, protein: 18.1, fat: 1.2, carbohydrate: 0.1 },

	// 卵・乳製品
	卵: { calories: 151, protein: 12.3, fat: 10.3, carbohydrate: 0.3 },
	牛乳: { calories: 67, protein: 3.3, fat: 3.8, carbohydrate: 4.8 },
	ヨーグルト: { calories: 62, protein: 3.6, fat: 3.0, carbohydrate: 4.9 },
	チーズ: { calories: 380, protein: 25.7, fat: 30.0, carbohydrate: 2.9 },
	プロセスチーズ: {
		calories: 339,
		protein: 22.7,
		fat: 26.0,
		carbohydrate: 2.4,
	},
	カッテージチーズ: {
		calories: 105,
		protein: 12.5,
		fat: 4.3,
		carbohydrate: 3.4,
	},
	生クリーム: { calories: 433, protein: 2.5, fat: 47.0, carbohydrate: 3.1 },
	バター: { calories: 745, protein: 0.9, fat: 81.0, carbohydrate: 0.1 },

	// 野菜類
	ブロッコリー: { calories: 33, protein: 4.3, fat: 0.5, carbohydrate: 5.2 },
	キャベツ: { calories: 23, protein: 1.3, fat: 0.2, carbohydrate: 5.2 },
	トマト: { calories: 19, protein: 0.7, fat: 0.1, carbohydrate: 4.7 },
	にんじん: { calories: 39, protein: 0.9, fat: 0.1, carbohydrate: 9.3 },
	ほうれん草: { calories: 20, protein: 2.2, fat: 0.4, carbohydrate: 3.1 },
	レタス: { calories: 12, protein: 0.9, fat: 0.1, carbohydrate: 2.8 },
	きゅうり: { calories: 14, protein: 0.9, fat: 0.1, carbohydrate: 3.0 },
	なす: { calories: 22, protein: 1.1, fat: 0.1, carbohydrate: 5.1 },
	ピーマン: { calories: 22, protein: 0.9, fat: 0.2, carbohydrate: 5.1 },
	玉ねぎ: { calories: 37, protein: 1.0, fat: 0.1, carbohydrate: 8.8 },
	じゃがいも: { calories: 76, protein: 1.6, fat: 0.1, carbohydrate: 17.6 },
	さつまいも: { calories: 132, protein: 1.2, fat: 0.2, carbohydrate: 31.5 },
	かぼちゃ: { calories: 91, protein: 1.9, fat: 0.3, carbohydrate: 20.6 },
	白菜: { calories: 14, protein: 0.8, fat: 0.1, carbohydrate: 3.2 },
	小松菜: { calories: 14, protein: 1.5, fat: 0.2, carbohydrate: 2.8 },
	生姜: { calories: 20, protein: 0.9, fat: 0.1, carbohydrate: 4.5 },
	みょうが: { calories: 12, protein: 1.0, fat: 0.1, carbohydrate: 2.6 },

	// 果物
	りんご: { calories: 54, protein: 0.2, fat: 0.1, carbohydrate: 14.1 },
	バナナ: { calories: 86, protein: 1.1, fat: 0.2, carbohydrate: 22.5 },
	みかん: { calories: 45, protein: 0.8, fat: 0.1, carbohydrate: 11.9 },
	オレンジ: { calories: 39, protein: 0.8, fat: 0.1, carbohydrate: 9.8 },
	ぶどう: { calories: 59, protein: 0.4, fat: 0.1, carbohydrate: 15.7 },
	いちご: { calories: 34, protein: 0.9, fat: 0.1, carbohydrate: 8.5 },
	キウイ: { calories: 53, protein: 1.0, fat: 0.3, carbohydrate: 13.3 },
	パイナップル: { calories: 51, protein: 0.5, fat: 0.1, carbohydrate: 13.1 },
	メロン: { calories: 42, protein: 0.9, fat: 0.1, carbohydrate: 10.4 },
	スイカ: { calories: 37, protein: 0.6, fat: 0.1, carbohydrate: 9.5 },

	// 豆類・ナッツ
	豆腐: { calories: 72, protein: 6.6, fat: 4.2, carbohydrate: 1.6 },
	納豆: { calories: 200, protein: 16.5, fat: 10.0, carbohydrate: 12.1 },
	味噌: { calories: 192, protein: 12.5, fat: 6.0, carbohydrate: 25.1 },
	枝豆: { calories: 135, protein: 11.7, fat: 6.2, carbohydrate: 8.8 },
	アーモンド: { calories: 598, protein: 18.6, fat: 54.2, carbohydrate: 19.7 },
	ピーナッツ: { calories: 562, protein: 25.4, fat: 49.0, carbohydrate: 18.8 },
	くるみ: { calories: 674, protein: 14.6, fat: 64.5, carbohydrate: 11.7 },
	カシューナッツ: {
		calories: 553,
		protein: 18.2,
		fat: 43.8,
		carbohydrate: 30.2,
	},

	// 調味料
	サラダ油: { calories: 921, protein: 0, fat: 100, carbohydrate: 0 },
	オリーブオイル: { calories: 884, protein: 0, fat: 100, carbohydrate: 0 },
	マヨネーズ: { calories: 703, protein: 1.0, fat: 75.3, carbohydrate: 2.6 },
	ケチャップ: { calories: 102, protein: 1.2, fat: 0.1, carbohydrate: 25.3 },
	醤油: { calories: 60, protein: 7.4, fat: 0, carbohydrate: 7.4 },
	塩: { calories: 0, protein: 0, fat: 0, carbohydrate: 0 },
	砂糖: { calories: 384, protein: 0, fat: 0, carbohydrate: 100 },
	はちみつ: { calories: 294, protein: 0.3, fat: 0, carbohydrate: 79.7 },
	みりん: { calories: 241, protein: 0.1, fat: 0, carbohydrate: 54.2 },
	酢: { calories: 4, protein: 0, fat: 0, carbohydrate: 1.0 },

	// その他
	海苔: { calories: 188, protein: 41.4, fat: 3.7, carbohydrate: 44.3 },
	わかめ: { calories: 16, protein: 1.9, fat: 0.2, carbohydrate: 5.8 },
	しめじ: { calories: 18, protein: 2.0, fat: 0.3, carbohydrate: 6.5 },
	しいたけ: { calories: 18, protein: 3.0, fat: 0.4, carbohydrate: 4.9 },
	えのきたけ: { calories: 22, protein: 2.7, fat: 0.2, carbohydrate: 7.6 },
	まいたけ: { calories: 16, protein: 2.0, fat: 0.5, carbohydrate: 4.9 },
	しらたき: { calories: 6, protein: 0.2, fat: 0, carbohydrate: 3.0 },
	こんにゃく: { calories: 5, protein: 0.1, fat: 0, carbohydrate: 2.3 },
	春雨: { calories: 342, protein: 0.1, fat: 0, carbohydrate: 85.0 },
	葛粉: { calories: 340, protein: 0.1, fat: 0, carbohydrate: 85.0 },
};

// 食材検索関数
export const searchFood = (query) => {
	const results = [];
	const searchTerm = query.toLowerCase();

	Object.keys(foodDatabase).forEach((foodName) => {
		if (foodName.toLowerCase().includes(searchTerm)) {
			results.push({
				name: foodName,
				...foodDatabase[foodName],
			});
		}
	});

	return results;
};

// 栄養成分計算関数
export const calculateNutrition = (foodName, grams) => {
	const food = foodDatabase[foodName];
	if (!food) return null;

	const ratio = grams / 100; // 100gあたりの値なので比率を計算

	return {
		calories: Math.round(food.calories * ratio),
		protein: Math.round(food.protein * ratio * 10) / 10,
		fat: Math.round(food.fat * ratio * 10) / 10,
		carbohydrate: Math.round(food.carbohydrate * ratio * 10) / 10,
	};
};
