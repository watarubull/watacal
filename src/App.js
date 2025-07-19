import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "./styles/variables.css";
import UserSettings from "./components/UserSettings";
import NutritionTracker from "./components/NutritionTracker";
import ExerciseTracker from "./components/ExerciseTracker";
import WeightTracker from "./components/WeightTracker";
import Reports from "./components/Reports";
import Navigation from "./components/Navigation";
import { registerServiceWorker } from "./components/ServiceWorkerRegistration";

function App() {
	useEffect(() => {
		registerServiceWorker();
	}, []);

	return (
		<Router>
			<div className="App">
				<Navigation />
				<main className="main-content">
					<Routes>
						<Route path="/" element={<NutritionTracker />} />
						<Route path="/settings" element={<UserSettings />} />
						<Route path="/exercise" element={<ExerciseTracker />} />
						<Route path="/weight" element={<WeightTracker />} />
						<Route path="/reports" element={<Reports />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
