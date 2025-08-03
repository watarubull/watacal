import React, { useState, useEffect } from "react";
import {
	collection,
	addDoc,
	query,
	where,
	getDocs,
	orderBy,
	limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import "./WeightTracker.css";

const WeightTracker = () => {
	const [todayWeight, setTodayWeight] = useState(null);
	const [weightHistory, setWeightHistory] = useState([]);
	const [showAddForm, setShowAddForm] = useState(false);
	const [weightInput, setWeightInput] = useState("");
	const [selectedDate, setSelectedDate] = useState(
		format(new Date(), "yyyy-MM-dd")
	);

	useEffect(() => {
		loadTodayWeight();
		loadWeightHistory();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		loadTodayWeight();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedDate]);

	const loadTodayWeight = async () => {
		try {
			const weightsRef = collection(db, "weights");
			const q = query(weightsRef, where("date", "==", selectedDate));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const weightData = querySnapshot.docs[0].data();
				setTodayWeight(weightData.weight);
			} else {
				setTodayWeight(null);
			}
		} catch (error) {
			console.error("Error loading today weight:", error);
		}
	};

	const loadWeightHistory = async () => {
		try {
			const weightsRef = collection(db, "weights");
			const q = query(weightsRef, orderBy("date", "desc"), limit(30));
			const querySnapshot = await getDocs(q);

			const historyData = [];
			querySnapshot.forEach((doc) => {
				const weight = { id: doc.id, ...doc.data() };
				historyData.push(weight);
			});

			setWeightHistory(historyData);
		} catch (error) {
			console.error("Error loading weight history:", error);
		}
	};

	const handleAddWeight = async () => {
		if (!weightInput) {
			alert("体重を入力してください");
			return;
		}

		const weight = parseFloat(weightInput);
		if (isNaN(weight) || weight <= 0) {
			alert("有効な体重を入力してください");
			return;
		}

		try {
			const weightData = {
				weight: weight,
				date: selectedDate,
				createdAt: new Date(),
			};

			await addDoc(collection(db, "weights"), weightData);

			// フォームをリセット
			setWeightInput("");
			setShowAddForm(false);

			// データを再読み込み
			loadTodayWeight();
			loadWeightHistory();
		} catch (error) {
			console.error("Error adding weight:", error);
			alert("体重の記録に失敗しました");
		}
	};

	const getWeightChange = () => {
		if (weightHistory.length < 2) return null;

		const latest = weightHistory[0];
		const previous = weightHistory[1];

		const change = latest.weight - previous.weight;
		return {
			value: Math.abs(change),
			isIncrease: change > 0,
			isDecrease: change < 0,
		};
	};

	const weightChange = getWeightChange();

	const handleDateChange = (newDate) => {
		setSelectedDate(newDate);
	};

	const goToPreviousDay = () => {
		const currentDate = new Date(selectedDate);
		currentDate.setDate(currentDate.getDate() - 1);
		setSelectedDate(format(currentDate, "yyyy-MM-dd"));
	};

	const goToNextDay = () => {
		const currentDate = new Date(selectedDate);
		currentDate.setDate(currentDate.getDate() + 1);
		setSelectedDate(format(currentDate, "yyyy-MM-dd"));
	};

	return (
		<div className="weight-tracker">
			<h2>体重記録</h2>

			{/* 日付選択 */}
			<div className="date-navigation">
				<button className="date-nav-arrow" onClick={goToPreviousDay}>
					＜
				</button>

				<input
					type="date"
					value={selectedDate}
					onChange={(e) => handleDateChange(e.target.value)}
					className="date-input"
				/>

				<button className="date-nav-arrow" onClick={goToNextDay}>
					＞
				</button>
			</div>

			{/* 今日の体重 */}
			<div className="today-weight">
				<div className="weight-card">
					<h3>今日の体重</h3>
					{todayWeight ? (
						<div className="weight-display">
							<span className="weight-value">{todayWeight}</span>
							<span className="weight-unit">kg</span>
						</div>
					) : (
						<div className="no-weight">
							<p>まだ記録されていません</p>
							<button
								className="btn btn-primary"
								onClick={() => setShowAddForm(true)}
							>
								体重を記録
							</button>
						</div>
					)}
				</div>

				{/* 体重変化 */}
				{weightChange && (
					<div className="weight-change">
						<h4>前回との変化</h4>
						<div
							className={`change-value ${
								weightChange.isIncrease ? "increase" : "decrease"
							}`}
						>
							{weightChange.isIncrease ? "+" : "-"}
							{weightChange.value.toFixed(1)} kg
						</div>
					</div>
				)}
			</div>

			{/* 体重追加ボタン */}
			{todayWeight && (
				<button
					className="btn btn-primary add-weight-btn"
					onClick={() => setShowAddForm(true)}
				>
					＋ 体重を記録
				</button>
			)}

			{/* 体重追加フォーム */}
			{showAddForm && (
				<div className="add-weight-modal">
					<div className="modal-content">
						<h3>体重を記録</h3>

						<div className="form-group">
							<label className="form-label">体重 (kg)</label>
							<input
								type="number"
								step="0.1"
								className="form-control"
								value={weightInput}
								onChange={(e) => setWeightInput(e.target.value)}
								placeholder="60.0"
								autoFocus
							/>
						</div>

						<div className="modal-buttons">
							<button
								className="btn btn-secondary"
								onClick={() => setShowAddForm(false)}
							>
								キャンセル
							</button>
							<button className="btn btn-success" onClick={handleAddWeight}>
								記録
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 体重履歴 */}
			<div className="weight-history">
				<h3>体重履歴</h3>
				{weightHistory.length === 0 ? (
					<p className="no-history">まだ記録がありません</p>
				) : (
					<div className="history-list">
						{weightHistory.map((weight) => (
							<div key={weight.id} className="history-item">
								<div className="history-date">
									{format(new Date(weight.date), "M/d", { locale: ja })}
								</div>
								<div className="history-weight">{weight.weight} kg</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default WeightTracker;
