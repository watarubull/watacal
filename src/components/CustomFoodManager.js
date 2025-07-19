import React, { useState, useEffect } from "react";
import {
	getCustomFoods,
	addCustomFood,
	updateCustomFood,
	deleteCustomFood,
} from "../data/customFoodDatabase";
import "./CustomFoodManager.css";

const CustomFoodManager = ({ isOpen, onClose, onFoodSelect }) => {
	const [customFoods, setCustomFoods] = useState([]);
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingFood, setEditingFood] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		calories: "",
		protein: "",
		fat: "",
		carbohydrate: "",
		description: "",
	});

	useEffect(() => {
		if (isOpen) {
			loadCustomFoods();
		}
	}, [isOpen]);

	const loadCustomFoods = async () => {
		try {
			const foods = await getCustomFoods();
			setCustomFoods(foods);
		} catch (error) {
			console.error("Error loading custom foods:", error);
			alert("カスタム食材の読み込みに失敗しました");
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// バリデーション
		if (!formData.name.trim()) {
			alert("食材名を入力してください");
			return;
		}

		if (
			!formData.calories ||
			!formData.protein ||
			!formData.fat ||
			!formData.carbohydrate
		) {
			alert("栄養成分を全て入力してください");
			return;
		}

		const foodData = {
			name: formData.name.trim(),
			calories: parseFloat(formData.calories),
			protein: parseFloat(formData.protein),
			fat: parseFloat(formData.fat),
			carbohydrate: parseFloat(formData.carbohydrate),
			description: formData.description.trim(),
		};

		try {
			if (editingFood) {
				// 編集
				await updateCustomFood(editingFood.id, foodData);
				setEditingFood(null);
				alert("食材を更新しました");
			} else {
				// 新規追加
				await addCustomFood(foodData);
				alert("食材を追加しました");
			}

			// フォームをリセット
			setFormData({
				name: "",
				calories: "",
				protein: "",
				fat: "",
				carbohydrate: "",
				description: "",
			});
			setShowAddForm(false);
			await loadCustomFoods();
		} catch (error) {
			console.error("Error saving custom food:", error);
			alert("食材の保存に失敗しました");
		}
	};

	const handleEdit = (food) => {
		setEditingFood(food);
		setFormData({
			name: food.name,
			calories: food.calories.toString(),
			protein: food.protein.toString(),
			fat: food.fat.toString(),
			carbohydrate: food.carbohydrate.toString(),
			description: food.description || "",
		});
		setShowAddForm(true);
	};

	const handleDelete = async (foodId) => {
		// eslint-disable-next-line no-restricted-globals
		if (confirm("このカスタム食材を削除しますか？")) {
			try {
				await deleteCustomFood(foodId);
				await loadCustomFoods();
				alert("食材を削除しました");
			} catch (error) {
				console.error("Error deleting custom food:", error);
				alert("食材の削除に失敗しました");
			}
		}
	};

	const handleCancel = () => {
		setFormData({
			name: "",
			calories: "",
			protein: "",
			fat: "",
			carbohydrate: "",
			description: "",
		});
		setEditingFood(null);
		setShowAddForm(false);
	};

	const handleSelectFood = (food) => {
		if (onFoodSelect) {
			onFoodSelect(food);
		}
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="custom-food-modal">
			<div className="modal-content">
				<div className="modal-header">
					<h3>カスタム食材管理</h3>
					<button className="close-btn" onClick={onClose}>
						×
					</button>
				</div>

				<div className="modal-body">
					{!showAddForm ? (
						<>
							<div className="add-food-section">
								<button
									className="btn btn-primary add-food-btn"
									onClick={() => setShowAddForm(true)}
								>
									+ 新しい食材を追加
								</button>
							</div>

							<div className="custom-foods-list">
								<h4>登録済みカスタム食材</h4>
								{customFoods.length === 0 ? (
									<p className="no-foods">カスタム食材がありません</p>
								) : (
									customFoods.map((food) => (
										<div key={food.id} className="custom-food-item">
											<div className="food-info">
												<span className="food-name">{food.name}</span>
												<span className="food-calories">
													{food.calories} kcal/100g
												</span>
												<span className="food-nutrition">
													P: {food.protein}g F: {food.fat}g C:{" "}
													{food.carbohydrate}g
												</span>
												{food.description && (
													<span className="food-description">
														{food.description}
													</span>
												)}
											</div>
											<div className="food-actions">
												<button
													className="btn btn-small btn-secondary"
													onClick={() => handleSelectFood(food)}
												>
													選択
												</button>
												<button
													className="btn btn-small btn-secondary"
													onClick={() => handleEdit(food)}
												>
													編集
												</button>
												<button
													className="btn btn-small btn-danger"
													onClick={() => handleDelete(food.id)}
												>
													削除
												</button>
											</div>
										</div>
									))
								)}
							</div>
						</>
					) : (
						<form onSubmit={handleSubmit} className="add-food-form">
							<h4>{editingFood ? "食材を編集" : "新しい食材を追加"}</h4>

							<div className="form-group">
								<label>食材名 *</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									placeholder="例: 水切りヨーグルト"
									required
								/>
							</div>

							<div className="nutrition-inputs">
								<div className="form-group">
									<label>カロリー (kcal/100g) *</label>
									<input
										type="number"
										name="calories"
										value={formData.calories}
										onChange={handleInputChange}
										placeholder="例: 60"
										step="0.1"
										required
									/>
								</div>

								<div className="form-group">
									<label>タンパク質 (g/100g) *</label>
									<input
										type="number"
										name="protein"
										value={formData.protein}
										onChange={handleInputChange}
										placeholder="例: 10.0"
										step="0.1"
										required
									/>
								</div>

								<div className="form-group">
									<label>脂質 (g/100g) *</label>
									<input
										type="number"
										name="fat"
										value={formData.fat}
										onChange={handleInputChange}
										placeholder="例: 0.5"
										step="0.1"
										required
									/>
								</div>

								<div className="form-group">
									<label>炭水化物 (g/100g) *</label>
									<input
										type="number"
										name="carbohydrate"
										value={formData.carbohydrate}
										onChange={handleInputChange}
										placeholder="例: 3.5"
										step="0.1"
										required
									/>
								</div>
							</div>

							<div className="form-group">
								<label>メモ（任意）</label>
								<textarea
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									placeholder="例: ギリシャヨーグルトの代用品として使用"
									rows="3"
								/>
							</div>

							<div className="form-buttons">
								<button
									type="button"
									className="btn btn-secondary"
									onClick={handleCancel}
								>
									キャンセル
								</button>
								<button type="submit" className="btn btn-primary">
									{editingFood ? "更新" : "追加"}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
};

export default CustomFoodManager;
