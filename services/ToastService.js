let toastRef = null;

// Set the reference to the toast provider
export const setToastRef = (ref) => {
  toastRef = ref;
};

// Reusable function to show toast
export const showToast = (message, duration = 3000) => {
  if (!toastRef) return;

  toastRef.show(message, {
    type: "custom",
    placement: "center",
    duration,
    animationType: "slide-in",
    style: {
      backgroundColor: "#ece6f2",
      borderRadius: 22,
      paddingVertical: 25,
      paddingHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 9 },
      shadowOpacity: 0.55,
      shadowRadius: 12,
      elevation: 8,
    },
    textStyle: {
      color: "#000",
      fontSize: 15,
      textAlign: "center",
    },
  });
};