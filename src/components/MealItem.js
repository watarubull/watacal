import React from "react";
import "./MealItem.css";

const MealItem = ({ meal, onEdit, onDelete }) => {
	return (
		<div className="meal-item">
			<div className="meal-content">
				<div className="meal-main">
					<div className="meal-header">
						<span className="meal-name">{meal.foodName}</span>
						<span className="meal-amount">{meal.amount}g</span>
					</div>
					<div className="meal-nutrition">
						<span className="nutrition-calories">{meal.calories} kcal</span>
						<div className="nutrition-pfc">
							<span className="pfc-items">P: {meal.protein.toFixed(1)}g</span>
							<span className="pfc-items">F: {meal.fat.toFixed(1)}g</span>
							<span className="pfc-items">
								C: {meal.carbohydrate.toFixed(1)}g
							</span>
						</div>
					</div>
				</div>

				{/* アクションボタン */}
				<div className="meal-actions">
					<button className="btn btn-small btn-secondary" onClick={onEdit}>
						編集
					</button>
					<button className="btn btn-small btn-danger" onClick={onDelete}>
						削除
					</button>
				</div>
			</div>
		</div>
	);
};

export default MealItem;
