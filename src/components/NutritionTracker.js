import React, { useState, useEffect } from "react";
import {
	doc,
	getDoc,
	collection,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
	searchFood,
	calculateNutritionFromAPI,
	calculateCustomNutrition,
} from "../services/foodApi";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { searchCustomFoods } from "../data/customFoodDatabase";
import CustomFoodManager from "./CustomFoodManager";
import MealItem from "./MealItem";
import "./NutritionTracker.css";

const NutritionTracker = () => {
	const [targets, setTargets] = useState({
		calories: 0,
		protein: 0,
		fat: 0,
		carbohydrate: 0,
	});

	const [todayNutrition, setTodayNutrition] = useState({
		calories: 0,
		protein: 0,
		fat: 0,
		carbohydrate: 0,
	});

	const [meals, setMeals] = useState([]);
	const [showAddForm, setShowAddForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [selectedFood, setSelectedFood] = useState(null);
	const [foodAmount, setFoodAmount] = useState("");
	const [editingMeal, setEditingMeal] = useState(null);
	const [showEditForm, setShowEditForm] = useState(false);
	const [showCustomFoodManager, setShowCustomFoodManager] = useState(false);
	const [selectedDate, setSelectedDate] = useState(
		format(new Date(), "yyyy-MM-dd")
	);

	useEffect(() => {
		loadTargets();
		loadMealsForDate(selectedDate);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedDate]);

	const loadMealsForDate = async (date) => {
		try {
			const mealsRef = collection(db, "meals");
			const q = query(mealsRef, where("date", "==", date));
			const querySnapshot = await getDocs(q);

			const mealsData = [];
			let totalNutrition = {
				calories: 0,
				protein: 0,
				fat: 0,
				carbohydrate: 0,
			};

			querySnapshot.forEach((doc) => {
				const meal = { id: doc.id, ...doc.data() };
				mealsData.push(meal);
				totalNutrition.calories += meal.calories || 0;
				totalNutrition.protein += meal.protein || 0;
				totalNutrition.fat += meal.fat || 0;
				totalNutrition.carbohydrate += meal.carbohydrate || 0;
			});

			setMeals(mealsData);
			setTodayNutrition(totalNutrition);
		} catch (error) {
			console.error("Error loading meals:", error);
		}
	};

	const loadTargets = async () => {
		try {
			const docRef = doc(db, "users", "default");
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				setTargets(data.targets || targets);
			}
		} catch (error) {
			console.error("Error loading targets:", error);
		}
	};

	const handleSearch = async (query) => {
		setSearchQuery(query);
		if (query.length > 0) {
			console.log("Searching for:", query);

			// API、ローカルDB、カスタムDBから検索
			const apiResults = await searchFood(query);
			const customResults = await searchCustomFoods(query);

			// カスタム食材にフラグを追加
			const customResultsWithFlag = customResults.map((food) => ({
				...food,
				isCustom: true,
			}));

			// 結果を統合（カスタム食材を優先）
			const allResults = [...customResultsWithFlag, ...apiResults];
			console.log("Search results:", allResults);
			setSearchResults(allResults);
		} else {
			setSearchResults([]);
		}
	};

	const handleFoodSelect = (food) => {
		console.log("Food selected:", food);
		setSelectedFood(food);
		setSearchQuery(food.name);
		setSearchResults([]);
	};

	const handleAddMeal = async () => {
		console.log("handleAddMeal called", { selectedFood, foodAmount });

		if (!selectedFood) {
			alert("食材を選択してください");
			return;
		}

		if (!foodAmount || parseFloat(foodAmount) <= 0) {
			alert("量を入力してください");
			return;
		}

		let nutrition;
		console.log("Selected food for calculation:", selectedFood);
		if (selectedFood.isCustom) {
			console.log("Calculating custom nutrition for:", selectedFood);
			nutrition = calculateCustomNutrition(
				selectedFood,
				parseFloat(foodAmount)
			);
		} else {
			console.log("Calculating API nutrition for:", selectedFood);
			nutrition = calculateNutritionFromAPI(
				selectedFood,
				parseFloat(foodAmount)
			);
		}
		console.log("Calculated nutrition:", nutrition);

		if (!nutrition) {
			alert("栄養成分の計算に失敗しました");
			return;
		}

		try {
			const mealData = {
				foodName: selectedFood.name,
				amount: parseFloat(foodAmount),
				...nutrition,
				date: selectedDate, // 選択された日付を使用
				createdAt: new Date(),
			};

			await addDoc(collection(db, "meals"), mealData);

			// フォームをリセット
			setSelectedFood(null);
			setFoodAmount("");
			setSearchQuery("");
			setSearchResults([]);
			setShowAddForm(false);

			// 選択された日付の食事を再読み込み
			loadMealsForDate(selectedDate);
		} catch (error) {
			console.error("Error adding meal:", error);
			alert("食事の追加に失敗しました");
		}
	};

	const handleEditMeal = async () => {
		if (!selectedFood) {
			alert("食材を選択してください");
			return;
		}

		if (!foodAmount || parseFloat(foodAmount) <= 0) {
			alert("量を入力してください");
			return;
		}

		let nutrition;
		console.log("Selected food for edit calculation:", selectedFood);
		if (selectedFood.isCustom) {
			console.log("Calculating custom nutrition for edit:", selectedFood);
			nutrition = calculateCustomNutrition(
				selectedFood,
				parseFloat(foodAmount)
			);
		} else {
			console.log("Calculating API nutrition for edit:", selectedFood);
			nutrition = calculateNutritionFromAPI(
				selectedFood,
				parseFloat(foodAmount)
			);
		}

		if (!nutrition) {
			alert("栄養成分の計算に失敗しました");
			return;
		}

		try {
			const mealRef = doc(db, "meals", editingMeal.id);
			await updateDoc(mealRef, {
				foodName: selectedFood.name,
				amount: parseFloat(foodAmount),
				...nutrition,
				updatedAt: new Date(),
			});

			// フォームをリセット
			setSelectedFood(null);
			setFoodAmount("");
			setSearchQuery("");
			setSearchResults([]);
			setShowEditForm(false);
			setEditingMeal(null);

			// 選択された日付の食事を再読み込み
			loadMealsForDate(selectedDate);
			alert("食事を更新しました");
		} catch (error) {
			console.error("Error updating meal:", error);
			alert("食事の更新に失敗しました");
		}
	};

	const handleDeleteMeal = async (mealId) => {
		// eslint-disable-next-line no-restricted-globals
		if (!confirm("この食事を削除しますか？")) {
			return;
		}

		try {
			await deleteDoc(doc(db, "meals", mealId));
			loadMealsForDate(selectedDate);
			alert("食事を削除しました");
		} catch (error) {
			console.error("Error deleting meal:", error);
			alert("食事の削除に失敗しました");
		}
	};

	const handleStartEdit = (meal) => {
		setEditingMeal(meal);
		console.log("Editing meal:", meal);

		// 食事データから食材オブジェクトを再構築
		const foodObject = {
			name: meal.foodName,
			// 100gあたりの栄養素を計算
			calories: Math.round((meal.calories / meal.amount) * 100),
			protein: Math.round((meal.protein / meal.amount) * 100 * 10) / 10,
			fat: Math.round((meal.fat / meal.amount) * 100 * 10) / 10,
			carbohydrate:
				Math.round((meal.carbohydrate / meal.amount) * 100 * 10) / 10,
			// カスタム食材かどうかを判定（APIデータにはper100gがある）
			isCustom: !meal.per100g,
		};

		console.log("Reconstructed food object:", foodObject);
		setSelectedFood(foodObject);
		setFoodAmount(meal.amount.toString());
		setSearchQuery(meal.foodName);
		setShowEditForm(true);
		setShowAddForm(false);
	};

	const handleCustomFoodSelect = (food) => {
		console.log("Custom food selected:", food);
		setSelectedFood(food);
		setFoodAmount("");
		setSearchQuery(food.name);
		setSearchResults([]);
		setShowCustomFoodManager(false);
	};

	const getProgressPercentage = (current, target) => {
		if (target === 0) return 0;
		return Math.min((current / target) * 100, 100);
	};

	const getProgressColor = (percentage) => {
		if (percentage >= 100) return "var(--colorRed)";
		if (percentage >= 80) return "var(--colorOrange)";
		return "var(--colorGreen)";
	};

	return (
		<div className="nutrition-tracker">
			<h2>栄養摂取記録</h2>
			<div className="date-navigation">
				<button
					className="date-nav-arrow"
					onClick={() => {
						const prevDate = new Date(selectedDate);
						prevDate.setDate(prevDate.getDate() - 1);
						setSelectedDate(format(prevDate, "yyyy-MM-dd"));
					}}
				>
					＜
				</button>

				<input
					type="date"
					value={selectedDate}
					onChange={(e) => setSelectedDate(e.target.value)}
					className="date-input"
				/>

				<button
					className="date-nav-arrow"
					onClick={() => {
						const nextDate = new Date(selectedDate);
						nextDate.setDate(nextDate.getDate() + 1);
						setSelectedDate(format(nextDate, "yyyy-MM-dd"));
					}}
				>
					＞
				</button>
			</div>

			{/* 目標と現在の摂取量 */}
			<div className="nutrition-summary">
				<div className="summary-card">
					<h3>カロリー</h3>
					<div className="progress-container">
						<div className="progress-bar">
							<div
								className="progress-fill"
								style={{
									width: `${getProgressPercentage(
										todayNutrition.calories,
										targets.calories
									)}%`,
									backgroundColor: getProgressColor(
										getProgressPercentage(
											todayNutrition.calories,
											targets.calories
										)
									),
								}}
							></div>
						</div>
						<div className="progress-text">
							{todayNutrition.calories} / {targets.calories} kcal
						</div>
					</div>
				</div>

				<div className="pfc-grid">
					<div className="pfc-item">
						<div className="wrap">
							<span className="pfc-label">タンパク質</span>
							<span className="pfc-value">
								{todayNutrition.protein.toFixed(1)}g /{" "}
								{targets.protein.toFixed(1)}g
							</span>
						</div>
						<div className="pfc-progress">
							<div
								className="pfc-progress-fill"
								style={{
									width: `${getProgressPercentage(
										todayNutrition.protein,
										targets.protein
									)}%`,
									backgroundColor: getProgressColor(
										getProgressPercentage(
											todayNutrition.protein,
											targets.protein
										)
									),
								}}
							></div>
						</div>
					</div>

					<div className="pfc-item">
						<div className="wrap">
							<span className="pfc-label">脂質</span>
							<span className="pfc-value">
								{todayNutrition.fat.toFixed(1)}g / {targets.fat.toFixed(1)}g
							</span>
						</div>
						<div className="pfc-progress">
							<div
								className="pfc-progress-fill"
								style={{
									width: `${getProgressPercentage(
										todayNutrition.fat,
										targets.fat
									)}%`,
									backgroundColor: getProgressColor(
										getProgressPercentage(todayNutrition.fat, targets.fat)
									),
								}}
							></div>
						</div>
					</div>

					<div className="pfc-item">
						<div className="wrap">
							<span className="pfc-label">炭水化物</span>
							<span className="pfc-value">
								{todayNutrition.carbohydrate.toFixed(1)}g /{" "}
								{targets.carbohydrate.toFixed(1)}g
							</span>
						</div>
						<div className="pfc-progress">
							<div
								className="pfc-progress-fill"
								style={{
									width: `${getProgressPercentage(
										todayNutrition.carbohydrate,
										targets.carbohydrate
									)}%`,
									backgroundColor: getProgressColor(
										getProgressPercentage(
											todayNutrition.carbohydrate,
											targets.carbohydrate
										)
									),
								}}
							></div>
						</div>
					</div>
				</div>
			</div>

			{/* 食事追加ボタン */}
			<button
				className="btn btn-primary add-meal-btn"
				onClick={() => setShowAddForm(true)}
			>
				＋ 食事を追加
			</button>

			{/* 食事追加フォーム */}
			{showAddForm && (
				<div className="add-meal-modal">
					<div className="modal-content">
						<h3>食事を追加</h3>

						<div className="form-group">
							<label className="form-label">食材を検索</label>
							<div className="search-container">
								<input
									type="text"
									className="form-control"
									value={searchQuery}
									onChange={(e) => handleSearch(e.target.value)}
									placeholder="食材名を入力..."
								/>
								<button
									type="button"
									className="btn btn-secondary custom-food-btn"
									onClick={() => setShowCustomFoodManager(true)}
									title="カスタム食材管理"
								>
									カスタム
								</button>
							</div>
							{searchResults.length > 0 && (
								<div className="search-results">
									{searchResults.map((food, index) => (
										<div
											key={index}
											className="search-result-item"
											onClick={() => handleFoodSelect(food)}
										>
											<div className="food-info">
												<span className="food-name">
													{food.name}
													{food.isCustom && (
														<span className="custom-badge">カスタム</span>
													)}
												</span>
												<span className="food-calories">
													{food.calories} kcal/100g
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="form-group">
							<label className="form-label">量 (g)</label>
							<input
								type="number"
								className="form-control"
								value={foodAmount}
								onChange={(e) => setFoodAmount(e.target.value)}
								placeholder="100"
							/>
						</div>

						{selectedFood && foodAmount && (
							<div className="nutrition-preview">
								<h4>栄養成分（{foodAmount}g）</h4>
								<div className="nutrition-preview-grid">
									<div className="preview-item">
										<span>カロリー</span>
										<span>
											{(() => {
												const nutrition = selectedFood.isCustom
													? calculateCustomNutrition(
															selectedFood,
															parseFloat(foodAmount)
													  )
													: calculateNutritionFromAPI(
															selectedFood,
															parseFloat(foodAmount)
													  );
												return nutrition?.calories || 0;
											})()}{" "}
											kcal
										</span>
									</div>
									<div className="preview-item">
										<span>タンパク質</span>
										<span>
											{(() => {
												const nutrition = selectedFood.isCustom
													? calculateCustomNutrition(
															selectedFood,
															parseFloat(foodAmount)
													  )
													: calculateNutritionFromAPI(
															selectedFood,
															parseFloat(foodAmount)
													  );
												return (nutrition?.protein || 0).toFixed(1);
											})()}
											g
										</span>
									</div>
									<div className="preview-item">
										<span>脂質</span>
										<span>
											{(() => {
												const nutrition = selectedFood.isCustom
													? calculateCustomNutrition(
															selectedFood,
															parseFloat(foodAmount)
													  )
													: calculateNutritionFromAPI(
															selectedFood,
															parseFloat(foodAmount)
													  );
												return (nutrition?.fat || 0).toFixed(1);
											})()}
											g
										</span>
									</div>
									<div className="preview-item">
										<span>炭水化物</span>
										<span>
											{(() => {
												const nutrition = selectedFood.isCustom
													? calculateCustomNutrition(
															selectedFood,
															parseFloat(foodAmount)
													  )
													: calculateNutritionFromAPI(
															selectedFood,
															parseFloat(foodAmount)
													  );
												return (nutrition?.carbohydrate || 0).toFixed(1);
											})()}
											g
										</span>
									</div>
								</div>
							</div>
						)}

						<div className="modal-buttons">
							<button
								className="btn btn-secondary"
								onClick={() => {
									setSelectedFood(null);
									setFoodAmount("");
									setSearchQuery("");
									setSearchResults([]);
									setShowAddForm(false);
								}}
							>
								キャンセル
							</button>
							<button className="btn btn-success" onClick={handleAddMeal}>
								追加
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 食事編集フォーム */}
			{showEditForm && (
				<div className="add-meal-modal">
					<div className="modal-content">
						<h3>食事を編集</h3>

						<div className="form-group">
							<label className="form-label">食材を検索</label>
							<div className="search-container">
								<input
									type="text"
									className="form-control"
									value={searchQuery}
									onChange={(e) => handleSearch(e.target.value)}
									placeholder="食材名を入力..."
								/>
								<button
									type="button"
									className="btn btn-secondary custom-food-btn"
									onClick={() => setShowCustomFoodManager(true)}
									title="カスタム食材管理"
								>
									カスタム
								</button>
							</div>
							{searchResults.length > 0 && (
								<div className="search-results">
									{searchResults.map((food, index) => (
										<div
											key={index}
											className="search-result-item"
											onClick={() => handleFoodSelect(food)}
										>
											<div className="food-info">
												<span className="food-name">
													{food.name}
													{food.isCustom && (
														<span className="custom-badge">カスタム</span>
													)}
												</span>
												<span className="food-calories">
													{food.calories} kcal/100g
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="form-group">
							<label className="form-label">量 (g)</label>
							<input
								type="number"
								className="form-control"
								value={foodAmount}
								onChange={(e) => setFoodAmount(e.target.value)}
								placeholder="100"
							/>
						</div>

						{selectedFood && foodAmount && (
							<div className="nutrition-preview">
								<h4>栄養成分（{foodAmount}g）</h4>
								<div className="nutrition-preview-grid">
									<div className="preview-item">
										<span>カロリー</span>
										<span>
											{(() => {
												const nutrition = selectedFood.isCustom
													? calculateCustomNutrition(
															selectedFood,
															parseFloat(foodAmount)
													  )
													: calculateNutritionFromAPI(
															selectedFood,
															parseFloat(foodAmount)
													  );
												return nutrition?.calories || 0;
											})()}{" "}
											kcal
										</span>
									</div>
									<div className="preview-item">
										<span>タンパク質</span>
										<span>
											{(() => {
												const nutrition = selectedFood.isCustom
													? calculateCustomNutrition(
															selectedFood,
															parseFloat(foodAmount)
													  )
													: calculateNutritionFromAPI(
															selectedFood,
															parseFloat(foodAmount)
													  );
												return (nutrition?.protein || 0).toFixed(1);
											})()}
											g
										</span>
									</div>
									<div className="preview-item">
										<span>脂質</span>
										<span>
											{(() => {
												const nutrition = selectedFood.isCustom
													? calculateCustomNutrition(
															selectedFood,
															parseFloat(foodAmount)
													  )
													: calculateNutritionFromAPI(
															selectedFood,
															parseFloat(foodAmount)
													  );
												return (nutrition?.fat || 0).toFixed(1);
											})()}
											g
										</span>
									</div>
									<div className="preview-item">
										<span>炭水化物</span>
										<span>
											{(() => {
												const nutrition = selectedFood.isCustom
													? calculateCustomNutrition(
															selectedFood,
															parseFloat(foodAmount)
													  )
													: calculateNutritionFromAPI(
															selectedFood,
															parseFloat(foodAmount)
													  );
												return (nutrition?.carbohydrate || 0).toFixed(1);
											})()}
											g
										</span>
									</div>
								</div>
							</div>
						)}

						<div className="modal-buttons">
							<button
								className="btn btn-secondary"
								onClick={() => {
									setSelectedFood(null);
									setFoodAmount("");
									setSearchQuery("");
									setSearchResults([]);
									setShowEditForm(false);
									setEditingMeal(null);
								}}
							>
								キャンセル
							</button>
							<button className="btn btn-success" onClick={handleEditMeal}>
								更新
							</button>
						</div>
					</div>
				</div>
			)}

			{/* カスタム食材管理 */}
			<CustomFoodManager
				isOpen={showCustomFoodManager}
				onClose={() => setShowCustomFoodManager(false)}
				onFoodSelect={handleCustomFoodSelect}
			/>

			{/* 食事リスト */}
			<div className="meals-list">
				<h3>
					{format(new Date(selectedDate), "M月d日", { locale: ja })}の食事
				</h3>
				{meals.length === 0 ? (
					<p className="no-meals">まだ食事が記録されていません</p>
				) : (
					meals.map((meal) => (
						<MealItem
							key={meal.id}
							meal={meal}
							onEdit={() => handleStartEdit(meal)}
							onDelete={() => handleDeleteMeal(meal.id)}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default NutritionTracker;
