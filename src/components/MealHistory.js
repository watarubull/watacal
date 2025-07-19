import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import "./MealHistory.css";

const MealHistory = ({ isOpen, onClose, onDateSelect }) => {
	const [meals, setMeals] = useState([]);
	const [loading, setLoading] = useState(false);
	const [filterDays, setFilterDays] = useState(30); // デフォルト30日
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (isOpen) {
			loadMealHistory();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, filterDays]);

	const loadMealHistory = async () => {
		setLoading(true);
		try {
			const endDate = new Date();
			const startDate = subDays(endDate, filterDays);

			const mealsRef = collection(db, "meals");
			const q = query(
				mealsRef,
				where("date", ">=", format(startDate, "yyyy-MM-dd")),
				where("date", "<=", format(endDate, "yyyy-MM-dd")),
				orderBy("date", "desc")
			);

			const querySnapshot = await getDocs(q);
			const mealsData = [];

			querySnapshot.forEach((doc) => {
				const meal = { id: doc.id, ...doc.data() };
				mealsData.push(meal);
			});

			setMeals(mealsData);
		} catch (error) {
			console.error("Error loading meal history:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDateClick = (date) => {
		if (onDateSelect) {
			onDateSelect(date);
		}
		onClose();
	};

	const filteredMeals = meals.filter((meal) =>
		meal.foodName.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const groupedMeals = filteredMeals.reduce((groups, meal) => {
		const date = meal.date;
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(meal);
		return groups;
	}, {});

	const getTotalNutrition = (meals) => {
		return meals.reduce(
			(total, meal) => ({
				calories: total.calories + (meal.calories || 0),
				protein: total.protein + (meal.protein || 0),
				fat: total.fat + (meal.fat || 0),
				carbohydrate: total.carbohydrate + (meal.carbohydrate || 0),
			}),
			{ calories: 0, protein: 0, fat: 0, carbohydrate: 0 }
		);
	};

	if (!isOpen) return null;

	return (
		<div className="meal-history-content">
			<div className="modal-content">
				<div className="modal-header">
					<h3>食事履歴</h3>
					<button className="close-btn" onClick={onClose}>
						×
					</button>
				</div>

				<div className="modal-body">
					{/* フィルター */}
					<div className="history-filters">
						<div className="filter-group">
							<label>期間:</label>
							<select
								value={filterDays}
								onChange={(e) => setFilterDays(parseInt(e.target.value))}
								className="filter-select"
							>
								<option value={7}>過去7日間</option>
								<option value={14}>過去14日間</option>
								<option value={30}>過去30日間</option>
								<option value={90}>過去90日間</option>
							</select>
						</div>

						<div className="filter-group">
							<label>検索:</label>
							<input
								type="text"
								placeholder="食材名で検索..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="search-input"
							/>
						</div>
					</div>

					{loading ? (
						<div className="loading">読み込み中...</div>
					) : (
						<div className="history-content">
							{Object.keys(groupedMeals).length === 0 ? (
								<div className="no-history">
									<p>指定された期間の食事記録がありません</p>
								</div>
							) : (
								<div className="history-list">
									{Object.entries(groupedMeals)
										.sort(([a], [b]) => b.localeCompare(a)) // 日付降順
										.map(([date, dayMeals]) => {
											const total = getTotalNutrition(dayMeals);
											const displayDate = format(new Date(date), "M月d日 (E)", {
												locale: ja,
											});

											return (
												<div key={date} className="history-day">
													<div className="day-header">
														<button
															className="date-link"
															onClick={() => handleDateClick(date)}
														>
															{displayDate}
														</button>
														<span className="meal-count">
															{dayMeals.length}食
														</span>
													</div>

													<div className="day-nutrition">
														<span className="nutrition-item">
															{total.calories} kcal
														</span>
														<span className="nutrition-item">
															P: {total.protein.toFixed(1)}g
														</span>
														<span className="nutrition-item">
															F: {total.fat.toFixed(1)}g
														</span>
														<span className="nutrition-item">
															C: {total.carbohydrate.toFixed(1)}g
														</span>
													</div>

													<div className="day-meals">
														{dayMeals.map((meal) => (
															<div key={meal.id} className="history-meal">
																<span className="meal-name">
																	{meal.foodName}
																</span>
																<span className="meal-amount">
																	{meal.amount}g
																</span>
																<span className="meal-calories">
																	{meal.calories} kcal
																</span>
															</div>
														))}
													</div>
												</div>
											);
										})}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MealHistory;
