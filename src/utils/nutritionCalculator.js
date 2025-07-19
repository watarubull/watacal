// 基礎代謝計算（正確なハリス・ベネディクト式）
export const calculateBMR = (weight, height, age, gender) => {
	if (gender === "male") {
		return 66.47 + 13.75 * weight + 5.003 * height - 6.755 * age;
	} else {
		// 女性用の計算式（447.593 + 9.247*weight + 3.098*height - 4.33*age）
		return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
	}
};

// 運動強度による消費カロリー計算（より実用的な係数）
export const calculateTDEE = (bmr, activityLevel) => {
	const activityMultipliers = {
		low: 1.2, // 低（座りがち、デスクワーク中心）
		medium: 1.55, // 中（通勤・歩行多め・週1〜3運動）
		high: 1.75, // 高（肉体労働・毎日運動）
	};
	return bmr * activityMultipliers[activityLevel];
};

// 減量目標による摂取カロリー計算（15-20%減）
export const calculateTargetCalories = (tdee, weightLossGoal) => {
	const deficits = {
		aggressive: 0.8, // がっつり（20%減）
		moderate: 0.85, // そこそこ（15%減）
		gentle: 0.9, // ゆっくり（10%減）
	};
	return tdee * deficits[weightLossGoal];
};

// より正確なPFC比率計算
export const calculatePFC = (
	targetCalories,
	weight,
	activityLevel,
	age,
	gender
) => {
	// タンパク質計算（体重ベース）
	let proteinPerKg;

	// 活動レベルによる調整
	if (activityLevel === "high") {
		proteinPerKg = 2.2; // 高活動（肉体労働・毎日運動）
	} else if (activityLevel === "medium") {
		proteinPerKg = 1.8; // 中程度の運動
	} else {
		proteinPerKg = 1.2; // 低活動
	}

	const protein = Math.round(weight * proteinPerKg);

	// 脂質計算（総カロリーの25%）
	const fatPercentage = 0.25;
	const fat = Math.round((targetCalories * fatPercentage) / 9);

	// 炭水化物計算（残りのカロリー）
	const proteinCalories = protein * 4;
	const fatCalories = fat * 9;
	const carbCalories = targetCalories - proteinCalories - fatCalories;
	const carbohydrate = Math.round(carbCalories / 4);

	return {
		protein,
		fat,
		carbohydrate,
	};
};

// 歩数から消費カロリー計算
export const calculateWalkingCalories = (steps, weight) => {
	// 1歩あたり約0.04kcal（体重60kgの場合）
	const caloriesPerStep = (weight / 60) * 0.04;
	return Math.round(steps * caloriesPerStep);
};

// 筋トレ時間から消費カロリー計算
export const calculateStrengthCalories = (minutes, weight) => {
	// 筋トレは1分あたり約6-8kcal（体重60kgの場合）
	const caloriesPerMinute = (weight / 60) * 7;
	return Math.round(minutes * caloriesPerMinute);
};
