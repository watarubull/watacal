import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import {
	calculateBMR,
	calculateTDEE,
	calculateTargetCalories,
	calculatePFC,
} from "../utils/nutritionCalculator";
import "../styles/variables.css";
import "./UserSettings.css";

const UserSettings = () => {
	const [userData, setUserData] = useState({
		height: "",
		weight: "",
		age: "",
		gender: "male",
		activityLevel: "medium",
		weightLossGoal: "moderate",
	});

	const [targets, setTargets] = useState({
		calories: 0,
		protein: 0,
		fat: 0,
		carbohydrate: 0,
	});

	const [showModal, setShowModal] = useState(false);
	const [isDataLoaded, setIsDataLoaded] = useState(false);

	useEffect(() => {
		loadUserData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadUserData = async () => {
		try {
			const docRef = doc(db, "users", "default");
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				const data = docSnap.data();
				if (data.userData) {
					setUserData(data.userData);
					setIsDataLoaded(true);
				}
				if (data.targets) {
					setTargets(data.targets);
				}
			} else {
				// データが存在しない場合はモーダルを表示
				setShowModal(true);
			}
		} catch (error) {
			console.error("Error loading user data:", error);
			setShowModal(true);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUserData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const calculateTargets = () => {
		if (!userData.height || !userData.weight || !userData.age) {
			return null;
		}

		const bmr = calculateBMR(
			parseFloat(userData.weight),
			parseFloat(userData.height),
			parseInt(userData.age),
			userData.gender
		);

		const tdee = calculateTDEE(bmr, userData.activityLevel);
		const targetCalories = calculateTargetCalories(
			tdee,
			userData.weightLossGoal
		);
		const pfc = calculatePFC(
			targetCalories,
			parseFloat(userData.weight),
			userData.activityLevel,
			parseInt(userData.age),
			userData.gender
		);

		return {
			calories: Math.round(targetCalories),
			...pfc,
		};
	};

	const handleSaveSettings = async () => {
		if (!userData.height || !userData.weight || !userData.age) {
			alert("身長、体重、年齢を入力してください");
			return;
		}

		const newTargets = calculateTargets();
		if (!newTargets) {
			alert("目標値の計算に失敗しました");
			return;
		}

		try {
			console.log("Saving settings:", { userData, targets: newTargets });
			const docRef = doc(db, "users", "default");
			await setDoc(docRef, {
				userData,
				targets: newTargets,
				updatedAt: new Date(),
			});
			console.log("Settings saved successfully");

			setTargets(newTargets);
			setIsDataLoaded(true);
			setShowModal(false);
			alert("設定を保存しました");
		} catch (error) {
			console.error("Error saving settings:", error);
			console.error("Error details:", {
				code: error.code,
				message: error.message,
				stack: error.stack,
			});
			alert(`設定の保存に失敗しました: ${error.message}`);
		}
	};

	const handleEditSettings = () => {
		setShowModal(true);
	};

	const getActivityLevelText = (level) => {
		const levels = {
			low: "低（座りがち、デスクワーク中心）",
			medium: "中（通勤・歩行多め・週1〜3運動）",
			high: "高（肉体労働・毎日運動）",
		};
		return levels[level] || level;
	};

	const getWeightLossGoalText = (goal) => {
		const goals = {
			aggressive: "がっつり（20%減）",
			moderate: "そこそこ（15%減）",
			gentle: "ゆっくり（10%減）",
		};
		return goals[goal] || goal;
	};

	return (
		<div className="user-settings">
			<h2>ユーザー設定</h2>

			{isDataLoaded ? (
				// 登録済みデータの表示
				<div className="settings-display">
					<div className="user-info-card">
						<h3>基本情報</h3>
						<div className="info-grid">
							<div className="info-item">
								<span className="info-label">身長</span>
								<span className="info-value">{userData.height} cm</span>
							</div>
							<div className="info-item">
								<span className="info-label">体重</span>
								<span className="info-value">{userData.weight} kg</span>
							</div>
							<div className="info-item">
								<span className="info-label">年齢</span>
								<span className="info-value">{userData.age} 歳</span>
							</div>
							<div className="info-item">
								<span className="info-label">性別</span>
								<span className="info-value">
									{userData.gender === "male" ? "男性" : "女性"}
								</span>
							</div>
							<div className="info-item">
								<span className="info-label">運動強度</span>
								<span className="info-value">
									{getActivityLevelText(userData.activityLevel)}
								</span>
							</div>
							<div className="info-item">
								<span className="info-label">減量目標</span>
								<span className="info-value">
									{getWeightLossGoalText(userData.weightLossGoal)}
								</span>
							</div>
						</div>
						<button
							onClick={handleEditSettings}
							className="btn btn-primary edit-btn"
						>
							設定を編集
						</button>
					</div>

					{targets.calories > 0 && (
						<div className="targets-display">
							<h3>1日の目標摂取量</h3>
							<div className="targets-grid">
								<div className="target-item">
									<span className="target-label">カロリー</span>
									<span className="target-value">{targets.calories} kcal</span>
								</div>
								<div className="target-item">
									<span className="target-label">タンパク質</span>
									<span className="target-value">{targets.protein} g</span>
								</div>
								<div className="target-item">
									<span className="target-label">脂質</span>
									<span className="target-value">{targets.fat} g</span>
								</div>
								<div className="target-item">
									<span className="target-label">炭水化物</span>
									<span className="target-value">{targets.carbohydrate} g</span>
								</div>
							</div>
						</div>
					)}
				</div>
			) : (
				// データ未登録時の表示
				<div className="no-data">
					<p>ユーザー情報が登録されていません</p>
					<button
						onClick={() => setShowModal(true)}
						className="btn btn-primary"
					>
						設定を登録
					</button>
				</div>
			)}

			{/* 設定モーダル */}
			{showModal && (
				<div className="settings-modal">
					<div className="modal-content">
						<h3>{isDataLoaded ? "設定を編集" : "ユーザー設定"}</h3>

						<div className="settings-form">
							<div className="form-group">
								<label>身長 (cm)</label>
								<input
									type="number"
									name="height"
									value={userData.height}
									onChange={handleInputChange}
									placeholder="170"
								/>
							</div>

							<div className="form-group">
								<label>体重 (kg)</label>
								<input
									type="number"
									name="weight"
									value={userData.weight}
									onChange={handleInputChange}
									placeholder="60"
								/>
							</div>

							<div className="form-group">
								<label>年齢</label>
								<input
									type="number"
									name="age"
									value={userData.age}
									onChange={handleInputChange}
									placeholder="30"
								/>
							</div>

							<div className="form-group">
								<label>性別</label>
								<select
									name="gender"
									value={userData.gender}
									onChange={handleInputChange}
								>
									<option value="male">男性</option>
									<option value="female">女性</option>
								</select>
							</div>

							<div className="form-group">
								<label>運動強度</label>
								<select
									name="activityLevel"
									value={userData.activityLevel}
									onChange={handleInputChange}
								>
									<option value="low">低（座りがち、デスクワーク中心）</option>
									<option value="medium">
										中（通勤・歩行多め・週1〜3運動）
									</option>
									<option value="high">高（肉体労働・毎日運動）</option>
								</select>
							</div>

							<div className="form-group">
								<label>減量目標</label>
								<select
									name="weightLossGoal"
									value={userData.weightLossGoal}
									onChange={handleInputChange}
								>
									<option value="aggressive">がっつり（20%減）</option>
									<option value="moderate">そこそこ（15%減）</option>
									<option value="gentle">ゆっくり（10%減）</option>
								</select>
							</div>

							{/* リアルタイム計算プレビュー */}
							{userData.height && userData.weight && userData.age && (
								<div className="calculation-preview">
									<h4>計算結果プレビュー</h4>
									{(() => {
										const previewTargets = calculateTargets();
										return previewTargets ? (
											<div className="preview-targets">
												<div className="preview-item">
													<span>目標カロリー</span>
													<span>{previewTargets.calories} kcal</span>
												</div>
												<div className="preview-item">
													<span>タンパク質</span>
													<span>{previewTargets.protein} g</span>
												</div>
												<div className="preview-item">
													<span>脂質</span>
													<span>{previewTargets.fat} g</span>
												</div>
												<div className="preview-item">
													<span>炭水化物</span>
													<span>{previewTargets.carbohydrate} g</span>
												</div>
											</div>
										) : (
											<p className="preview-error">計算できません</p>
										);
									})()}
								</div>
							)}

							<div className="modal-buttons">
								<button
									onClick={() => setShowModal(false)}
									className="btn btn-secondary"
								>
									キャンセル
								</button>
								<button
									onClick={handleSaveSettings}
									className="btn btn-success"
								>
									{isDataLoaded ? "更新" : "保存"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserSettings;
