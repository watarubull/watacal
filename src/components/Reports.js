import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { format, subDays } from "date-fns";
import { ja } from "date-fns/locale";
import WeeklySummary from "./WeeklySummary";
import MealHistory from "./MealHistory";
import "./Reports.css";

const Reports = () => {
	const [selectedPeriod, setSelectedPeriod] = useState("week");
	const [reportData, setReportData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("reports"); // 'reports', 'weekly', 'history'

	const periods = [
		{ value: "week", label: "1週間" },
		{ value: "month", label: "1ヶ月" },
		{ value: "3months", label: "3ヶ月" },
		{ value: "6months", label: "半年" },
		{ value: "year", label: "1年" },
	];

	useEffect(() => {
		loadReportData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPeriod]);

	const loadReportData = async () => {
		setLoading(true);
		try {
			const endDate = new Date();
			let startDate;

			switch (selectedPeriod) {
				case "week":
					startDate = subDays(endDate, 7);
					break;
				case "month":
					startDate = subDays(endDate, 30);
					break;
				case "3months":
					startDate = subDays(endDate, 90);
					break;
				case "6months":
					startDate = subDays(endDate, 180);
					break;
				case "year":
					startDate = subDays(endDate, 365);
					break;
				default:
					startDate = subDays(endDate, 7);
			}

			const startDateStr = format(startDate, "yyyy-MM-dd");
			const endDateStr = format(endDate, "yyyy-MM-dd");

			// 食事データを取得
			const mealsRef = collection(db, "meals");
			const mealsQuery = query(
				mealsRef,
				where("date", ">=", startDateStr),
				where("date", "<=", endDateStr),
				orderBy("date", "desc")
			);
			const mealsSnapshot = await getDocs(mealsQuery);

			// 運動データを取得
			const exercisesRef = collection(db, "exercises");
			const exercisesQuery = query(
				exercisesRef,
				where("date", ">=", startDateStr),
				where("date", "<=", endDateStr),
				orderBy("date", "desc")
			);
			const exercisesSnapshot = await getDocs(exercisesQuery);

			// 体重データを取得
			const weightsRef = collection(db, "weights");
			const weightsQuery = query(
				weightsRef,
				where("date", ">=", startDateStr),
				where("date", "<=", endDateStr),
				orderBy("date", "desc")
			);
			const weightsSnapshot = await getDocs(weightsQuery);

			// データを日付ごとに整理
			const dataByDate = {};

			// 食事データを処理
			mealsSnapshot.forEach((doc) => {
				const meal = doc.data();
				const date = meal.date;
				if (!dataByDate[date]) {
					dataByDate[date] = {
						date,
						nutrition: { calories: 0, protein: 0, fat: 0, carbohydrate: 0 },
						exercise: { calories: 0 },
						weight: null,
					};
				}
				dataByDate[date].nutrition.calories += meal.calories || 0;
				dataByDate[date].nutrition.protein += meal.protein || 0;
				dataByDate[date].nutrition.fat += meal.fat || 0;
				dataByDate[date].nutrition.carbohydrate += meal.carbohydrate || 0;
			});

			// 運動データを処理
			exercisesSnapshot.forEach((doc) => {
				const exercise = doc.data();
				const date = exercise.date;
				if (!dataByDate[date]) {
					dataByDate[date] = {
						date,
						nutrition: { calories: 0, protein: 0, fat: 0, carbohydrate: 0 },
						exercise: { calories: 0 },
						weight: null,
					};
				}
				dataByDate[date].exercise.calories += exercise.calories || 0;
			});

			// 体重データを処理
			weightsSnapshot.forEach((doc) => {
				const weight = doc.data();
				const date = weight.date;
				if (!dataByDate[date]) {
					dataByDate[date] = {
						date,
						nutrition: { calories: 0, protein: 0, fat: 0, carbohydrate: 0 },
						exercise: { calories: 0 },
						weight: null,
					};
				}
				dataByDate[date].weight = weight.weight;
			});

			// 配列に変換して日付順にソート
			const sortedData = Object.values(dataByDate).sort(
				(a, b) => new Date(b.date) - new Date(a.date)
			);

			setReportData(sortedData);
		} catch (error) {
			console.error("Error loading report data:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateScore = (nutrition, exercise) => {
		// 簡単なスコア計算（実際の目標値に基づいて調整が必要）
		let score = 0;

		// カロリー摂取（1500-2500kcalを理想とする）
		if (nutrition.calories >= 1500 && nutrition.calories <= 2500) {
			score += 25;
		} else if (nutrition.calories >= 1200 && nutrition.calories <= 3000) {
			score += 15;
		} else {
			score += 5;
		}

		// 運動（300kcal以上を理想とする）
		if (exercise.calories >= 300) {
			score += 25;
		} else if (exercise.calories >= 150) {
			score += 15;
		} else {
			score += 5;
		}

		// タンパク質（60g以上を理想とする）
		if (nutrition.protein >= 60) {
			score += 25;
		} else if (nutrition.protein >= 40) {
			score += 15;
		} else {
			score += 5;
		}

		// バランス（脂質と炭水化物のバランス）
		const totalCarbs = nutrition.carbohydrate * 4;
		const totalFat = nutrition.fat * 9;
		const totalCalories = nutrition.calories;

		if (totalCalories > 0) {
			const carbRatio = totalCarbs / totalCalories;
			const fatRatio = totalFat / totalCalories;

			if (
				carbRatio >= 0.4 &&
				carbRatio <= 0.7 &&
				fatRatio >= 0.2 &&
				fatRatio <= 0.35
			) {
				score += 25;
			} else if (
				carbRatio >= 0.3 &&
				carbRatio <= 0.8 &&
				fatRatio >= 0.15 &&
				fatRatio <= 0.4
			) {
				score += 15;
			} else {
				score += 5;
			}
		}

		return Math.min(score, 100);
	};

	const getScoreColor = (score) => {
		if (score >= 80) return "var(--colorGreen)";
		if (score >= 60) return "var(--colorYellow)";
		return "var(--colorRed)";
	};

	const getAverageWeight = () => {
		const weights = reportData
			.filter((d) => d.weight !== null)
			.map((d) => d.weight);
		if (weights.length === 0) return null;
		return (
			weights.reduce((sum, weight) => sum + weight, 0) / weights.length
		).toFixed(1);
	};

	const getWeightChange = () => {
		const weights = reportData
			.filter((d) => d.weight !== null)
			.map((d) => d.weight);
		if (weights.length < 2) return null;

		const change = weights[weights.length - 1] - weights[0];
		return {
			value: Math.abs(change),
			isIncrease: change > 0,
			isDecrease: change < 0,
		};
	};

	const averageWeight = getAverageWeight();
	const weightChange = getWeightChange();

	const handleDateSelect = (date) => {
		// 日付選択時の処理（必要に応じて実装）
		console.log("Selected date:", date);
	};

	return (
		<div className="reports">
			<h2>レポート</h2>

			{/* タブナビゲーション */}
			<div className="tab-navigation">
				<button
					className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
					onClick={() => setActiveTab("reports")}
				>
					期間レポート
				</button>
				<button
					className={`tab-btn ${activeTab === "weekly" ? "active" : ""}`}
					onClick={() => setActiveTab("weekly")}
				>
					週間サマリー
				</button>
				<button
					className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
					onClick={() => setActiveTab("history")}
				>
					食事履歴
				</button>
			</div>

			{/* タブコンテンツ */}
			{activeTab === "reports" && (
				<>
					{/* 期間選択 */}
					<div className="period-selector">
						<label className="form-label">期間を選択</label>
						<select
							className="form-control"
							value={selectedPeriod}
							onChange={(e) => setSelectedPeriod(e.target.value)}
						>
							{periods.map((period) => (
								<option key={period.value} value={period.value}>
									{period.label}
								</option>
							))}
						</select>
					</div>

					{loading ? (
						<div className="loading">データを読み込み中...</div>
					) : (
						<>
							{/* サマリー */}
							<div className="report-summary">
								<div className="summary-card">
									<h3>期間サマリー</h3>
									<div className="summary-stats">
										<div className="stat-item">
											<span className="stat-label">記録日数</span>
											<span className="stat-value">{reportData.length} 日</span>
										</div>
										{averageWeight && (
											<div className="stat-item">
												<span className="stat-label">平均体重</span>
												<span className="stat-value">{averageWeight} kg</span>
											</div>
										)}
										{weightChange && (
											<div className="stat-item">
												<span className="stat-label">体重変化</span>
												<span
													className={`stat-value ${
														weightChange.isIncrease ? "increase" : "decrease"
													}`}
												>
													{weightChange.isIncrease ? "+" : "-"}
													{weightChange.value.toFixed(1)} kg
												</span>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* 日別レポート */}
							<div className="daily-reports">
								<h3>日別レポート</h3>
								{reportData.length === 0 ? (
									<p className="no-data">この期間のデータがありません</p>
								) : (
									<div className="reports-list">
										{reportData.map((dayData) => {
											const score = calculateScore(
												dayData.nutrition,
												dayData.exercise
											);
											return (
												<div key={dayData.date} className="report-item">
													<div className="report-header">
														<span className="report-date">
															{format(new Date(dayData.date), "M/d", {
																locale: ja,
															})}
														</span>
														<div className="report-score">
															<span
																className="score-value"
																style={{ color: getScoreColor(score) }}
															>
																{score}
															</span>
															<span className="score-unit">点</span>
														</div>
													</div>

													<div className="report-details">
														<div className="detail-item">
															<span className="detail-label">摂取カロリー</span>
															<span className="detail-value">
																{dayData.nutrition.calories} kcal
															</span>
														</div>
														<div className="detail-item">
															<span className="detail-label">消費カロリー</span>
															<span className="detail-value">
																{dayData.exercise.calories} kcal
															</span>
														</div>
														<div className="detail-item">
															<span className="detail-label">タンパク質</span>
															<span className="detail-value">
																{dayData.nutrition.protein}g
															</span>
														</div>
														{dayData.weight && (
															<div className="detail-item">
																<span className="detail-label">体重</span>
																<span className="detail-value">
																	{dayData.weight} kg
																</span>
															</div>
														)}
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</>
					)}
				</>
			)}

			{activeTab === "weekly" && (
				<WeeklySummary
					isOpen={true}
					onClose={() => {}} // レポートページ内では閉じない
				/>
			)}

			{activeTab === "history" && (
				<MealHistory
					isOpen={true}
					onClose={() => {}} // レポートページ内では閉じない
					onDateSelect={handleDateSelect}
				/>
			)}
		</div>
	);
};

export default Reports;
