import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import "./WeeklySummary.css";

const WeeklySummary = ({ isOpen, onClose }) => {
	const [weeklyData, setWeeklyData] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			loadWeeklyData();
		}
	}, [isOpen]);

	const loadWeeklyData = async () => {
		setLoading(true);
		try {
			const today = new Date();
			const weeklyData = [];

			// 前日までの7日間のデータを取得
			for (let i = 7; i >= 1; i--) {
				const date = subDays(today, i);
				const dateStr = format(date, "yyyy-MM-dd");

				const mealsRef = collection(db, "meals");
				const q = query(mealsRef, where("date", "==", dateStr));
				const querySnapshot = await getDocs(q);

				let dayNutrition = {
					calories: 0,
					protein: 0,
					fat: 0,
					carbohydrate: 0,
					mealCount: 0,
				};

				querySnapshot.forEach((doc) => {
					const meal = doc.data();
					dayNutrition.calories += meal.calories || 0;
					dayNutrition.protein += meal.protein || 0;
					dayNutrition.fat += meal.fat || 0;
					dayNutrition.carbohydrate += meal.carbohydrate || 0;
					dayNutrition.mealCount++;
				});

				weeklyData.push({
					date: dateStr,
					displayDate: format(date, "M/d"),
					dayOfWeek: format(date, "E", { locale: ja }),
					...dayNutrition,
				});
			}

			setWeeklyData(weeklyData);
		} catch (error) {
			console.error("Error loading weekly data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getProgressColor = (percentage) => {
		if (percentage >= 100) return "var(--colorRed)";
		if (percentage >= 80) return "var(--colorOrange)";
		return "var(--colorGreen)";
	};

	const getMaxValue = (data, key) => {
		return Math.max(...data.map((day) => day[key]), 1);
	};

	if (!isOpen) return null;

	return (
		<div className="weekly-summary-content">
			{loading ? (
				<div className="loading">読み込み中...</div>
			) : (
				<div className="weekly-charts">
					{/* カロリーグラフ */}
					<div className="chart-section">
						<h4>カロリー摂取量</h4>
						<div className="chart-container">
							{weeklyData.map((day, index) => {
								const maxCalories = getMaxValue(weeklyData, "calories");
								const percentage = (day.calories / maxCalories) * 100;

								return (
									<div key={index} className="chart-bar">
										<div className="bar-label">
											<span className="day-name">{day.dayOfWeek}</span>
											<span className="day-date">{day.displayDate}</span>
										</div>
										<div className="bar-container">
											<div
												className="bar-fill"
												style={{
													height: `${percentage}%`,
													backgroundColor: getProgressColor(percentage),
												}}
											></div>
										</div>
										<div className="bar-value">{day.calories} kcal</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* 週間統計 */}
					<div className="weekly-stats">
						<h4>週間統計</h4>
						<div className="stats-grid">
							<div className="stat-item">
								<span className="stat-label">平均カロリー</span>
								<span className="stat-value">
									{(() => {
										const recordedDays = weeklyData.filter(
											(day) => day.mealCount > 0
										);
										if (recordedDays.length === 0) return "0";
										return Math.round(
											recordedDays.reduce((sum, day) => sum + day.calories, 0) /
												recordedDays.length
										);
									})()}{" "}
									kcal
								</span>
							</div>
							<div className="stat-item">
								<span className="stat-label">平均タンパク質</span>
								<span className="stat-value">
									{(() => {
										const recordedDays = weeklyData.filter(
											(day) => day.mealCount > 0
										);
										if (recordedDays.length === 0) return "0.0";
										return (
											recordedDays.reduce((sum, day) => sum + day.protein, 0) /
											recordedDays.length
										).toFixed(1);
									})()}
									g
								</span>
							</div>
							<div className="stat-item">
								<span className="stat-label">記録日数</span>
								<span className="stat-value">
									{weeklyData.filter((day) => day.mealCount > 0).length}日
								</span>
							</div>
						</div>
					</div>

					{/* PFCグラフ */}
					<div className="chart-section">
						<h4>PFC摂取量</h4>
						<div className="pfc-chart">
							{weeklyData.map((day, index) => (
								<div key={index} className="pfc-day">
									<div className="pfc-day-header">
										<span className="day-name">{day.dayOfWeek}</span>
										<span className="day-date">{day.displayDate}</span>
									</div>
									<div className="pfc-bars">
										<div className="pfc-bar">
											<span className="pfc-label">P</span>
											<div
												className="pfc-bar-fill"
												style={{ width: `${(day.protein / 100) * 100}%` }}
											></div>
											<span className="pfc-value">
												{day.protein.toFixed(1)}g
											</span>
										</div>
										<div className="pfc-bar">
											<span className="pfc-label">F</span>
											<div
												className="pfc-bar-fill"
												style={{ width: `${(day.fat / 50) * 100}%` }}
											></div>
											<span className="pfc-value">{day.fat.toFixed(1)}g</span>
										</div>
										<div className="pfc-bar">
											<span className="pfc-label">C</span>
											<div
												className="pfc-bar-fill"
												style={{
													width: `${(day.carbohydrate / 200) * 100}%`,
												}}
											></div>
											<span className="pfc-value">
												{day.carbohydrate.toFixed(1)}g
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default WeeklySummary;
