import { useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

export default function ProtectedRoute({ children }) {
  const user = useSelector(state => state.user.userData);

  useFocusEffect(
    useCallback(() => {
      const checkAccess = async () => {
        const isLoggingOut = await AsyncStorage.getItem("isLoggingOut");
        if (!user && isLoggingOut !== "true") {
          router.replace("/login");
        }
      };
      checkAccess();
    }, [user])
  );

  if (!user) return null;
  return children;
}
