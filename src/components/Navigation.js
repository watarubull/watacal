import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
	const location = useLocation();

	const navItems = [
		{ path: "/", label: "食事", icon: "🍽️" },
		{ path: "/exercise", label: "運動", icon: "🏃" },
		{ path: "/weight", label: "体重", icon: "⚖️" },
		{ path: "/reports", label: "レポート", icon: "📊" },
		{ path: "/settings", label: "設定", icon: "⚙️" },
	];

	return (
		<nav className="navigation">
			<div className="nav-container">
				{navItems.map((item) => (
					<Link
						key={item.path}
						to={item.path}
						className={`nav-item ${
							location.pathname === item.path ? "active" : ""
						}`}
					>
						<span className="nav-icon">{item.icon}</span>
						<span className="nav-label">{item.label}</span>
					</Link>
				))}
			</div>
		</nav>
	);
};

export default Navigation;
