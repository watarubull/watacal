import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { format, subDays, addDays, startOfWeek, endOfWeek } from "date-fns";
import { ja } from "date-fns/locale";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import WeeklySummary from "./WeeklySummary";
import DailyReports from "./DailyReports";
import "./Reports.css";

const Reports = () => {
	const [selectedPeriod, setSelectedPeriod] = useState("week");
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("reports"); // 'reports', 'weekly', 'daily'
	const [selectedMetric, setSelectedMetric] = useState("weight");

	const periods = [
		{ value: "week", label: "1週間" },
		{ value: "month", label: "1ヶ月" },
		{ value: "3months", label: "3ヶ月" },
		{ value: "6months", label: "6ヶ月" },
		{ value: "year", label: "1年" },
	];

	const metrics = [
		{
			value: "calories",
			label: "摂取カロリー",
			unit: "kcal",
			color: "var(--colorYellow)",
		},
		{ value: "weight", label: "体重", unit: "kg", color: "var(--colorGreen)" },
	];

	useEffect(() => {
		if (activeTab === "reports") {
			loadChartData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPeriod, activeTab]);

	const getTimeSpan = (period) => {
		switch (period) {
			case "week":
			case "month":
				return "daily"; // 1日単位
			case "3months":
				return "weekly"; // 1週間単位
			case "6months":
				return "biweekly"; // 2週間単位
			case "year":
				return "monthly"; // 4週間単位
			default:
				return "daily";
		}
	};

	const groupDataByTimeSpan = (data, timeSpan) => {
		if (timeSpan === "daily") {
			return data;
		}

		const groupedData = [];
		const sortedData = [...data].sort(
			(a, b) => new Date(a.date) - new Date(b.date)
		);

		if (timeSpan === "weekly") {
			// 週ごとにグループ化
			let currentWeekData = [];
			let currentWeekStart = null;

			sortedData.forEach((item) => {
				const itemDate = new Date(item.date);
				const weekStart = startOfWeek(itemDate, { weekStartsOn: 1 }); // 月曜日開始

				if (
					!currentWeekStart ||
					weekStart.getTime() !== currentWeekStart.getTime()
				) {
					if (currentWeekData.length > 0) {
						groupedData.push(
							aggregateWeekData(currentWeekData, currentWeekStart)
						);
					}
					currentWeekData = [item];
					currentWeekStart = weekStart;
				} else {
					currentWeekData.push(item);
				}
			});

			if (currentWeekData.length > 0) {
				groupedData.push(aggregateWeekData(currentWeekData, currentWeekStart));
			}
		} else if (timeSpan === "biweekly") {
			// 2週間ごとにグループ化
			for (let i = 0; i < sortedData.length; i += 14) {
				const biweeklyData = sortedData.slice(i, i + 14);
				if (biweeklyData.length > 0) {
					groupedData.push(aggregatePeriodData(biweeklyData, "2週間"));
				}
			}
		} else if (timeSpan === "monthly") {
			// 4週間ごとにグループ化
			for (let i = 0; i < sortedData.length; i += 28) {
				const monthlyData = sortedData.slice(i, i + 28);
				if (monthlyData.length > 0) {
					groupedData.push(aggregatePeriodData(monthlyData, "4週間"));
				}
			}
		}

		return groupedData;
	};

	const aggregateWeekData = (weekData, weekStart) => {
		const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
		const totalCalories = weekData.reduce(
			(sum, item) => sum + (item.calories || 0),
			0
		);
		const avgWeight = calculateAverage(
			weekData.map((item) => item.weight).filter((w) => w !== null)
		);
		const avgScore = calculateAverage(
			weekData.map((item) => item.score).filter((s) => s > 0)
		);

		return {
			date: format(weekStart, "M/d") + "-" + format(weekEnd, "M/d"),
			calories: Math.round(totalCalories / weekData.length),
			weight: avgWeight ? parseFloat(avgWeight.toFixed(1)) : null,
			score: avgScore ? Math.round(avgScore) : null,
		};
	};

	const aggregatePeriodData = (periodData, label) => {
		const totalCalories = periodData.reduce(
			(sum, item) => sum + (item.calories || 0),
			0
		);
		const avgWeight = calculateAverage(
			periodData.map((item) => item.weight).filter((w) => w !== null)
		);
		const avgScore = calculateAverage(
			periodData.map((item) => item.score).filter((s) => s > 0)
		);

		return {
			date: format(new Date(periodData[0].date), "M/d") + " ～",
			calories: Math.round(totalCalories / periodData.length),
			weight: avgWeight ? parseFloat(avgWeight.toFixed(1)) : null,
			score: avgScore ? Math.round(avgScore) : null,
		};
	};

	const calculateAverage = (values) => {
		if (values.length === 0) return null;
		return values.reduce((sum, val) => sum + val, 0) / values.length;
	};

	const loadChartData = async () => {
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
				orderBy("date", "asc")
			);
			const mealsSnapshot = await getDocs(mealsQuery);

			// 運動データを取得
			const exercisesRef = collection(db, "exercises");
			const exercisesQuery = query(
				exercisesRef,
				where("date", ">=", startDateStr),
				where("date", "<=", endDateStr),
				orderBy("date", "asc")
			);
			const exercisesSnapshot = await getDocs(exercisesQuery);

			// 体重データを取得
			const weightsRef = collection(db, "weights");
			const weightsQuery = query(
				weightsRef,
				where("date", ">=", startDateStr),
				where("date", "<=", endDateStr),
				orderBy("date", "asc")
			);
			const weightsSnapshot = await getDocs(weightsQuery);

			// データを日付ごとに整理
			const dataByDate = {};

			// 期間内のすべての日付を初期化
			let currentDate = new Date(startDate);
			while (currentDate <= endDate) {
				const dateStr = format(currentDate, "yyyy-MM-dd");
				dataByDate[dateStr] = {
					date: dateStr,
					calories: 0,
					weight: null,
					score: 0,
				};
				currentDate = addDays(currentDate, 1);
			}

			// 食事データを処理
			mealsSnapshot.forEach((doc) => {
				const meal = doc.data();
				const date = meal.date;
				if (dataByDate[date]) {
					dataByDate[date].calories += meal.calories || 0;
				}
			});

			// 運動データを処理（スコア計算に使用）
			const exerciseByDate = {};
			exercisesSnapshot.forEach((doc) => {
				const exercise = doc.data();
				const date = exercise.date;
				if (!exerciseByDate[date]) {
					exerciseByDate[date] = { calories: 0 };
				}
				exerciseByDate[date].calories += exercise.calories || 0;
			});

			// 体重データを処理
			weightsSnapshot.forEach((doc) => {
				const weight = doc.data();
				const date = weight.date;
				if (dataByDate[date]) {
					dataByDate[date].weight = weight.weight;
				}
			});

			// スコア計算
			Object.keys(dataByDate).forEach((date) => {
				const dayData = dataByDate[date];
				const exercise = exerciseByDate[date] || { calories: 0 };
				dayData.score = calculateScore(
					{ calories: dayData.calories, protein: 0, fat: 0, carbohydrate: 0 },
					exercise
				);
			});

			// 配列に変換してソート
			const chartDataArray = Object.values(dataByDate).map((item) => ({
				...item,
				date: format(new Date(item.date), "M/d"),
			}));

			// 期間に応じてデータをグループ化
			const timeSpan = getTimeSpan(selectedPeriod);
			const groupedChartData = groupDataByTimeSpan(chartDataArray, timeSpan);

			setChartData(groupedChartData);
		} catch (error) {
			console.error("Error loading chart data:", error);
		} finally {
			setLoading(false);
		}
	};

	const calculateScore = (nutrition, exercise) => {
		let score = 0;

		// カロリー摂取（1500-2500kcalを理想とする）
		if (nutrition.calories >= 1500 && nutrition.calories <= 2500) {
			score += 50;
		} else if (nutrition.calories >= 1200 && nutrition.calories <= 3000) {
			score += 30;
		} else {
			score += 10;
		}

		// 運動（300kcal以上を理想とする）
		if (exercise.calories >= 300) {
			score += 50;
		} else if (exercise.calories >= 150) {
			score += 30;
		} else {
			score += 10;
		}

		return Math.min(score, 100);
	};

	const handleDateSelect = (date) => {
		console.log("Selected date:", date);
	};

	const getSelectedMetricInfo = () => {
		return metrics.find((m) => m.value === selectedMetric);
	};

	const getWeightAxisDomain = () => {
		if (selectedMetric !== "weight") return undefined;

		// 体重データから最小値・最大値を取得
		const weightValues = chartData
			.map((item) => item.weight)
			.filter(
				(weight) => weight !== null && weight !== undefined && !isNaN(weight)
			);

		if (weightValues.length === 0) {
			// データがない場合はデフォルトの範囲
			return [50, 90];
		}

		const minWeight = Math.min(...weightValues);
		const maxWeight = Math.max(...weightValues);

		// プラスマイナス1kgの範囲で設定
		return [
			Math.max(minWeight - 1, 0), // 最小値は0以上
			maxWeight + 1,
		];
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
					className={`tab-btn ${activeTab === "daily" ? "active" : ""}`}
					onClick={() => setActiveTab("daily")}
				>
					日別レポート
				</button>
			</div>

			{/* タブコンテンツ */}
			{activeTab === "reports" && (
				<div className="period-reports">
					{/* 期間と表示項目の選択 */}
					<div className="selectors-row">
						<select
							className="form-control selector-item"
							value={selectedPeriod}
							onChange={(e) => setSelectedPeriod(e.target.value)}
						>
							{periods.map((period) => (
								<option key={period.value} value={period.value}>
									{period.label}
								</option>
							))}
						</select>

						<select
							className="form-control selector-item"
							value={selectedMetric}
							onChange={(e) => setSelectedMetric(e.target.value)}
						>
							{metrics.map((metric) => (
								<option key={metric.value} value={metric.value}>
									{metric.label}
								</option>
							))}
						</select>
					</div>

					{loading ? (
						<div className="loading">データを読み込み中...</div>
					) : (
						<div className="period-chart-container">
							<ResponsiveContainer width="100%" height={400}>
								<LineChart data={chartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis domain={getWeightAxisDomain()} />
									<Tooltip />
									<Legend />

									<Line
										type="monotone"
										dataKey={selectedMetric}
										stroke={getSelectedMetricInfo().color}
										strokeWidth={3}
										name={`${getSelectedMetricInfo().label} (${
											getSelectedMetricInfo().unit
										})`}
										connectNulls={selectedMetric !== "weight"}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</div>
			)}

			{activeTab === "weekly" && (
				<WeeklySummary
					isOpen={true}
					onClose={() => {}} // レポートページ内では閉じない
				/>
			)}

			{activeTab === "daily" && <DailyReports />}
		</div>
	);
};

export default Reports;
