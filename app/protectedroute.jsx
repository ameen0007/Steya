// components/ProtectedRoute.js
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.user.userData);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  console.log("ENTERING THE PROTECTED ROUTE");

  // 1️⃣ Read logout flag from AsyncStorage
  useEffect(() => {
    const checkLogoutFlag = async () => {
      const flag = await AsyncStorage.getItem("isLoggingOut");
      setIsLoggingOut(flag === "true");
    };
    checkLogoutFlag();
  }, []);

  // 2️⃣ Redirect logic
  useEffect(() => {
    if (!isChecking) return;

    const checkAuth = () => {
      if (!user && !isLoggingOut) {
        console.log("🔒 No user found, redirecting to login");
        router.replace({ pathname: "/login", params: { from: "protected" } });
      } else {
        console.log("🔒 User authenticated or logging out, showing content---home");
      }
      setIsChecking(false);
    };

    // Small delay to ensure proper navigation
    const timeoutId = setTimeout(checkAuth, 50);
    return () => clearTimeout(timeoutId);
  }, [user, isLoggingOut]);

  // 3️⃣ Show loading while checking
  if (isChecking || (!user && isLoggingOut)) {
    console.log("🔒 Still checking authentication...");
    return null;
  }

  // 4️⃣ If no user after checking (should not happen), render nothing
  if (!user) {
    console.log("🔒 No user, returning null");
    return null;
  }

  console.log("🔒 Rendering protected content");
  return children;
}
