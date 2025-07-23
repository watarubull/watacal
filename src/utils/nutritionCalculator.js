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

// 歩数から消費カロリー計算（METs方式）
export const calculateWalkingCalories = (steps, weight) => {
	// 歩数から時間を算出
	// 一般的な歩幅: 約70cm、歩行速度: 約4km/h（普通の速度）と仮定
	const strideLength = 0.7; // メートル
	const walkingSpeed = 4; // km/h
	const distance = (steps * strideLength) / 1000; // km
	const timeInHours = distance / walkingSpeed; // 時間

	// METs値: 普通の速度の歩行（4〜5km/h）= 3.0
	const mets = 3.0;

	// 消費カロリー計算: METs × 体重（kg）× 時間（h）× 1.05
	const calories = mets * weight * timeInHours * 1.05;
	return Math.round(calories);
};

// 筋トレ時間から消費カロリー計算（METs方式）
export const calculateStrengthCalories = (minutes, weight) => {
	// 分から時間に変換
	const timeInHours = minutes / 60;

	// METs値: 中負荷の筋トレ（マシンやダンベル）= 4.5
	const mets = 4.5;

	// 消費カロリー計算: METs × 体重（kg）× 時間（h）× 1.05
	const calories = mets * weight * timeInHours * 1.05;
	return Math.round(calories);
};
