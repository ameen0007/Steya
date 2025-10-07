// ✅ Module-level variable (not a React hook)
let logoutInProgress = false;

// Call this when starting logout navigation
export const startLogoutNavigation = () => {
  logoutInProgress = true;
};

// Call this after logout navigation completes
export const endLogoutNavigation = () => {
  logoutInProgress = false;
};

// Check if logout is in progress
export const isLoggingOut = () => logoutInProgress;
