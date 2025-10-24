let toastRef = null;

// Set the reference to the toast provider
export const setToastRef = (ref) => {
  toastRef = ref;
};

// Reusable function to show toast with smooth premium animations
export const showToast = (message, duration = 2000) => {
  if (!toastRef) return;

  toastRef.show(message, {
    type: "custom",
    placement: "center",
    duration,
    animationType: "zoom-in",
    style: {
      backgroundColor: "#fff",
      borderRadius: 22,
      paddingVertical: 12,
      paddingHorizontal: 22,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
    textStyle: {
      color: "#000",
      fontSize: 15,
      textAlign: "center",
      fontWeight: "500",
    },
  });
};

// Success toast variant
export const showSuccessToast = (message, duration = 2000) => {
  if (!toastRef) return;

  toastRef.show(message, {
    type: "custom",
    placement: "center",
    duration,
    animationType: "zoom-in",
    style: {
      backgroundColor: "#fff",
      borderRadius: 22,
      paddingVertical: 12,
      paddingHorizontal: 22,
      shadowColor: "#10B981",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
      borderWidth: 2,
      borderColor: "#10B981",
    },
    textStyle: {
      color: "#10B981",
      fontSize: 15,
      textAlign: "center",
      fontWeight: "600",
    },
  });
};

// Error toast variant
export const showErrorToast = (message, duration = 2500) => {
  if (!toastRef) return;

  toastRef.show(message, {
    type: "custom",
    placement: "center",
    duration,
    animationType: "zoom-in",
    style: {
      backgroundColor: "#fff",
      borderRadius: 22,
      paddingVertical: 12,
      paddingHorizontal: 22,
      shadowColor: "#EF4444",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
      borderWidth: 2,
      borderColor: "#EF4444",
    },
    textStyle: {
      color: "#EF4444",
      fontSize: 15,
      textAlign: "center",
      fontWeight: "600",
    },
  });
};

// Info toast variant
export const showInfoToast = (message, duration = 2000) => {

  if (!toastRef) return;


  toastRef.show(message, {
    type: "custom",
    placement: "center",
    duration,
    animationType: "zoom-in",
    style: {
      backgroundColor: "#fff",
      borderRadius: 22,
      paddingVertical: 12,
      paddingHorizontal: 22,
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
      borderWidth: 2,
      borderColor: "#3B82F6",
      
    },
    textStyle: {
      color: "#3B82F6",
      fontSize: 15,
      textAlign: "center",
      fontWeight: "600",
    },
  });
};

// Warning toast variant
export const showWarningToast = (message, duration = 2000) => {
  if (!toastRef) return;

  toastRef.show(message, {
    type: "custom",
    placement: "center",
    duration,
    animationType: "zoom-in",
    style: {
      backgroundColor: "#fff",
      borderRadius: 22,
      paddingVertical: 12,
      paddingHorizontal: 22,
      shadowColor: "#F59E0B",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
      borderWidth: 2,
      borderColor: "#F59E0B",
      
    },
    textStyle: {
      color: "#F59E0B",
      fontSize: 15,
      textAlign: "center",
      fontWeight: "600",
    },
  });
};