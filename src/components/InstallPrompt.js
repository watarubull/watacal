import React, { useState, useEffect } from "react";
import "./InstallPrompt.css";

const InstallPrompt = () => {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [showInstallPrompt, setShowInstallPrompt] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e) => {
			// Prevent Chrome 67 and earlier from automatically showing the prompt
			e.preventDefault();
			// Stash the event so it can be triggered later
			setDeferredPrompt(e);
			setShowInstallPrompt(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt
			);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		// Show the install prompt
		deferredPrompt.prompt();

		// Wait for the user to respond to the prompt
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === "accepted") {
			console.log("User accepted the install prompt");
		} else {
			console.log("User dismissed the install prompt");
		}

		setDeferredPrompt(null);
		setShowInstallPrompt(false);
	};

	const handleDismiss = () => {
		setShowInstallPrompt(false);
	};

	if (!showInstallPrompt) return null;

	return (
		<div className="install-prompt">
			<div className="install-prompt-content">
				<div className="install-prompt-icon">📱</div>
				<div className="install-prompt-text">
					<h3>アプリをインストール</h3>
					<p>ホーム画面に追加して、より快適にご利用いただけます</p>
				</div>
				<div className="install-prompt-buttons">
					<button
						className="btn btn-primary install-btn"
						onClick={handleInstallClick}
					>
						インストール
					</button>
					<button
						className="btn btn-secondary dismiss-btn"
						onClick={handleDismiss}
					>
						後で
					</button>
				</div>
			</div>
		</div>
	);
};

export default InstallPrompt;
