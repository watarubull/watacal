// Service Worker登録
export const registerServiceWorker = () => {
	// 開発時は既存のService Workerを削除
	if (process.env.NODE_ENV !== "production" && "serviceWorker" in navigator) {
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			registrations.forEach((registration) => {
				registration.unregister();
				console.log("Service Worker unregistered:", registration);
			});
		});
		console.log("Service Worker disabled in development mode");
		return;
	}

	// 本番環境でのみService Workerを登録
	if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					console.log("SW registered: ", registration);
				})
				.catch((registrationError) => {
					console.log("SW registration failed: ", registrationError);
				});
		});
	}
};
