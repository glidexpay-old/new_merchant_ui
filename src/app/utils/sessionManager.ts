

// Start a session timer and auto-logout when expired
export function startSessionTimer(sessionExpiryDate: string) {
  const expiryTime = new Date(sessionExpiryDate).getTime();
  const currentTime = Date.now();
  const timeRemaining = expiryTime - currentTime;

  // Save expiry in localStorage for global checks
  if (typeof window !== "undefined") {
    localStorage.setItem("sessionExpiryDate", sessionExpiryDate);
  }

  const logoutAndRedirect = async () => {
    const { store } = await import("../redux/store");
    const { logoutAdmin } = await import("../redux/slices/adminSlice");
    store.dispatch(logoutAdmin());
    if (typeof window !== "undefined") {
      localStorage.removeItem("userData");
      localStorage.removeItem("sessionExpiryDate");
      window.location.href = "/login";
    }
  };

  if (timeRemaining > 0) {
    setTimeout(() => {
      logoutAndRedirect();
    }, timeRemaining);
  } else {
    logoutAndRedirect();
  }
}



// Call this on app load to check expiry and auto-logout if needed
export function checkSessionExpiry() {
  if (typeof window === "undefined") return;
  const expiry = localStorage.getItem("sessionExpiryDate");
  if (!expiry) return;
  const expiryTime = new Date(expiry).getTime();
  const currentTime = Date.now();
  if (currentTime >= expiryTime) {
    // Use dynamic import to avoid circular dependency
    (async () => {
      const { store } = await import("../redux/store");
      const { logoutAdmin } = await import("../redux/slices/adminSlice");
      store.dispatch(logoutAdmin());
      localStorage.removeItem("userData");
      localStorage.removeItem("sessionExpiryDate");
      window.location.href = "/login";
    })();
  } else {
    // Set timer for remaining time
    startSessionTimer(expiry);
  }
}
