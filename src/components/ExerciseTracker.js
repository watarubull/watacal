import React, { useState, useEffect } from "react";
import {
	collection,
	addDoc,
	query,
	where,
	getDocs,
	doc,
	getDoc,
	updateDoc,
	deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
	calculateWalkingCalories,
	calculateStrengthCalories,
} from "../utils/nutritionCalculator";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import "./ExerciseTracker.css";

const ExerciseTracker = () => {
	const [userData, setUserData] = useState({ weight: 60 });
	const [todayExercise, setTodayExercise] = useState({
		walking: { steps: 0, calories: 0 },
		strength: { minutes: 0, calories: 0 },
	});
	const [exercises, setExercises] = useState([]);
	const [showAddForm, setShowAddForm] = useState(false);
	const [showEditForm, setShowEditForm] = useState(false);
	const [editingExercise, setEditingExercise] = useState(null);
	const [exerciseType, setExerciseType] = useState("walking");
	const [exerciseValue, setExerciseValue] = useState("");
	const [selectedDate, setSelectedDate] = useState(
		format(new Date(), "yyyy-MM-dd")
	);

	useEffect(() => {
		loadUserData();
		loadTodayExercises();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		loadTodayExercises();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedDate]);

	const loadUserData = async () => {
		try {
			const docRef = doc(db, "users", "default");
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				setUserData(data.userData || userData);
			}
		} catch (error) {
			console.error("Error loading user data:", error);
		}
	};

	const loadTodayExercises = async () => {
		try {
			const exercisesRef = collection(db, "exercises");
			const q = query(exercisesRef, where("date", "==", selectedDate));
			const querySnapshot = await getDocs(q);

			const exercisesData = [];
			let totalWalking = { steps: 0, calories: 0 };
			let totalStrength = { minutes: 0, calories: 0 };

			querySnapshot.forEach((doc) => {
				const exercise = { id: doc.id, ...doc.data() };
				exercisesData.push(exercise);

				if (exercise.type === "walking") {
					totalWalking.steps += exercise.steps || 0;
					totalWalking.calories += exercise.calories || 0;
				} else if (exercise.type === "strength") {
					totalStrength.minutes += exercise.minutes || 0;
					totalStrength.calories += exercise.calories || 0;
				}
			});

			setExercises(exercisesData);
			setTodayExercise({
				walking: totalWalking,
				strength: totalStrength,
			});
		} catch (error) {
			console.error("Error loading exercises:", error);
		}
	};

	const handleAddExercise = async () => {
		if (!exerciseValue) {
			alert("値を入力してください");
			return;
		}

		let calories = 0;
		if (exerciseType === "walking") {
			calories = calculateWalkingCalories(
				parseInt(exerciseValue),
				userData.weight
			);
		} else {
			calories = calculateStrengthCalories(
				parseInt(exerciseValue),
				userData.weight
			);
		}

		try {
			const exerciseData = {
				type: exerciseType,
				[exerciseType === "walking" ? "steps" : "minutes"]:
					parseInt(exerciseValue),
				calories: calories,
				date: selectedDate,
				createdAt: new Date(),
			};

			await addDoc(collection(db, "exercises"), exerciseData);

			// フォームをリセット
			setExerciseValue("");
			setShowAddForm(false);

			// 今日の運動を再読み込み
			loadTodayExercises();
		} catch (error) {
			console.error("Error adding exercise:", error);
			alert("運動の追加に失敗しました");
		}
	};

	const getTotalCalories = () => {
		return todayExercise.walking.calories + todayExercise.strength.calories;
	};

	const handleStartEdit = (exercise) => {
		setEditingExercise(exercise);
		setExerciseType(exercise.type);
		setExerciseValue(
			exercise.type === "walking"
				? exercise.steps.toString()
				: exercise.minutes.toString()
		);
		setShowEditForm(true);
		setShowAddForm(false);
	};

	const handleEditExercise = async () => {
		if (!exerciseValue) {
			alert("値を入力してください");
			return;
		}

		let calories = 0;
		if (exerciseType === "walking") {
			calories = calculateWalkingCalories(
				parseInt(exerciseValue),
				userData.weight
			);
		} else {
			calories = calculateStrengthCalories(
				parseInt(exerciseValue),
				userData.weight
			);
		}

		try {
			const exerciseRef = doc(db, "exercises", editingExercise.id);
			await updateDoc(exerciseRef, {
				type: exerciseType,
				[exerciseType === "walking" ? "steps" : "minutes"]:
					parseInt(exerciseValue),
				calories: calories,
				updatedAt: new Date(),
			});

			// フォームをリセット
			setExerciseValue("");
			setShowEditForm(false);
			setEditingExercise(null);

			// 今日の運動を再読み込み
			loadTodayExercises();
			alert("運動を更新しました");
		} catch (error) {
			console.error("Error updating exercise:", error);
			alert("運動の更新に失敗しました");
		}
	};

	const handleDeleteExercise = async (exerciseId) => {
		// eslint-disable-next-line no-restricted-globals
		if (!confirm("この運動記録を削除しますか？")) {
			return;
		}

		try {
			await deleteDoc(doc(db, "exercises", exerciseId));
			loadTodayExercises();
			alert("運動記録を削除しました");
		} catch (error) {
			console.error("Error deleting exercise:", error);
			alert("運動記録の削除に失敗しました");
		}
	};

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
		<div className="exercise-tracker">
			<h2>運動記録</h2>

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

			<p className="date-display">
				{format(new Date(selectedDate), "M月d日 (E)", { locale: ja })}
			</p>

			{/* 運動サマリー */}
			<div className="exercise-summary">
				<div className="summary-card">
					<h3>総消費カロリー</h3>
					<div className="total-calories">
						<span className="calories-value">{getTotalCalories()}</span>
						<span className="calories-unit">kcal</span>
					</div>
				</div>

				<div className="exercise-types">
					<div className="exercise-type-card">
						<div className="exercise-type-header">
							<span className="exercise-icon">🚶</span>
							<span className="exercise-title">歩行</span>
						</div>
						<div className="exercise-stats">
							<div className="stat-item">
								<span className="stat-label">歩数</span>
								<span className="stat-value">
									{todayExercise.walking.steps.toLocaleString()} 歩
								</span>
							</div>
							<div className="stat-item">
								<span className="stat-label">消費カロリー</span>
								<span className="stat-value">
									{todayExercise.walking.calories} kcal
								</span>
							</div>
						</div>
					</div>

					<div className="exercise-type-card">
						<div className="exercise-type-header">
							<span className="exercise-icon">💪</span>
							<span className="exercise-title">筋トレ</span>
						</div>
						<div className="exercise-stats">
							<div className="stat-item">
								<span className="stat-label">時間</span>
								<span className="stat-value">
									{todayExercise.strength.minutes} 分
								</span>
							</div>
							<div className="stat-item">
								<span className="stat-label">消費カロリー</span>
								<span className="stat-value">
									{todayExercise.strength.calories} kcal
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 運動追加ボタン */}
			<button
				className="btn btn-primary add-exercise-btn"
				onClick={() => setShowAddForm(true)}
			>
				＋ 運動を記録
			</button>

			{/* 運動追加フォーム */}
			{showAddForm && (
				<div className="add-exercise-modal">
					<div className="modal-content">
						<h3>運動を記録</h3>

						<div className="form-group">
							<label className="form-label">運動の種類</label>
							<select
								className="form-control"
								value={exerciseType}
								onChange={(e) => setExerciseType(e.target.value)}
							>
								<option value="walking">歩行</option>
								<option value="strength">筋トレ</option>
							</select>
						</div>

						<div className="form-group">
							<label className="form-label">
								{exerciseType === "walking" ? "歩数" : "時間 (分)"}
							</label>
							<input
								type="number"
								className="form-control"
								value={exerciseValue}
								onChange={(e) => setExerciseValue(e.target.value)}
								placeholder={exerciseType === "walking" ? "8000" : "30"}
							/>
						</div>

						{exerciseValue && (
							<div className="calories-preview">
								<h4>推定消費カロリー</h4>
								<div className="calories-preview-value">
									{exerciseType === "walking"
										? calculateWalkingCalories(
												parseInt(exerciseValue),
												userData.weight
										  )
										: calculateStrengthCalories(
												parseInt(exerciseValue),
												userData.weight
										  )}{" "}
									kcal
								</div>
							</div>
						)}

						<div className="modal-buttons">
							<button
								className="btn btn-secondary"
								onClick={() => setShowAddForm(false)}
							>
								キャンセル
							</button>
							<button className="btn btn-success" onClick={handleAddExercise}>
								記録
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 運動編集フォーム */}
			{showEditForm && (
				<div className="add-exercise-modal">
					<div className="modal-content">
						<h3>運動を編集</h3>

						<div className="form-group">
							<label className="form-label">運動の種類</label>
							<select
								className="form-control"
								value={exerciseType}
								onChange={(e) => setExerciseType(e.target.value)}
							>
								<option value="walking">歩行</option>
								<option value="strength">筋トレ</option>
							</select>
						</div>

						<div className="form-group">
							<label className="form-label">
								{exerciseType === "walking" ? "歩数" : "時間 (分)"}
							</label>
							<input
								type="number"
								className="form-control"
								value={exerciseValue}
								onChange={(e) => setExerciseValue(e.target.value)}
								placeholder={exerciseType === "walking" ? "8000" : "30"}
							/>
						</div>

						{exerciseValue && (
							<div className="calories-preview">
								<h4>推定消費カロリー</h4>
								<div className="calories-preview-value">
									{exerciseType === "walking"
										? calculateWalkingCalories(
												parseInt(exerciseValue),
												userData.weight
										  )
										: calculateStrengthCalories(
												parseInt(exerciseValue),
												userData.weight
										  )}{" "}
									kcal
								</div>
							</div>
						)}

						<div className="modal-buttons">
							<button
								className="btn btn-secondary"
								onClick={() => {
									setShowEditForm(false);
									setEditingExercise(null);
									setExerciseValue("");
								}}
							>
								キャンセル
							</button>
							<button className="btn btn-success" onClick={handleEditExercise}>
								更新
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 運動リスト */}
			<div className="exercises-list">
				<h3>運動記録</h3>
				{exercises.length === 0 ? (
					<p className="no-exercises">まだ運動が記録されていません</p>
				) : (
					exercises.map((exercise) => (
						<div key={exercise.id} className="exercise-item">
							<div className="exercise-content">
								<div className="exercise-main">
									<div className="exercise-header">
										<span className="exercise-type">
											{exercise.type === "walking" ? "🚶 歩行" : "💪 筋トレ"}
										</span>
										<span className="exercise-value">
											{exercise.type === "walking"
												? `${exercise.steps.toLocaleString()} 歩`
												: `${exercise.minutes} 分`}
										</span>
									</div>
									<div className="exercise-calories">
										{exercise.calories} kcal
									</div>
								</div>

								<div className="exercise-actions">
									<button
										className="btn btn-small btn-secondary"
										onClick={() => handleStartEdit(exercise)}
									>
										編集
									</button>
									<button
										className="btn btn-small btn-danger"
										onClick={() => handleDeleteExercise(exercise.id)}
									>
										削除
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default ExerciseTracker;
