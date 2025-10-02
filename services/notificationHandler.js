// utils/notificationService.js - FIXED FOR DEV BUILD
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../services/intercepter';
// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications
 */
export async function registerForPushNotificationsAsync() {
  let token;

  console.log('📱 Starting push notification registration...');

  // Setup notification channel for Android
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('chat-messages', {
        name: 'Chat Messages',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
      console.log('✅ Android notification channel created');
    } catch (error) {
      console.error('❌ Error creating notification channel:', error);
    }
  }

  // Check if running on physical device
  if (!Device.isDevice) {
    console.warn('⚠️ Must use physical device for Push Notifications');
    alert('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Request permissions
    console.log('🔐 Requesting notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    console.log('Current permission status:', existingStatus);
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('New permission status:', status);
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push notification permissions!');
      console.warn('⚠️ Push notification permissions not granted');
      return null;
    }

    console.log('✅ Notification permissions granted');

    // Get the Expo Push Token
    console.log('🔑 Getting Expo Push Token...');
    
    // Get projectId from Constants
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                     Constants.manifest?.extra?.eas?.projectId ||
                     Constants.manifest2?.extra?.expoClient?.extra?.eas?.projectId;
    
    console.log('Project ID:', projectId);
    console.log('Constants.expoConfig:', Constants.expoConfig?.extra);
    
    if (!projectId) {
      console.error('❌ No project ID found in app.json!');
      console.error('Add this to app.json:');
      console.error(JSON.stringify({
        "extra": {
          "eas": {
            "projectId": "your-project-id"
          }
        }
      }, null, 2));
      
      alert('Missing Expo Project ID! Check console for instructions.');
      return null;
    }

    // Get token with project ID
    token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    
    console.log('✅ Expo Push Token received:', token.data);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('expoPushToken', token.data);
    
    return token.data;

  } catch (error) {
    console.error('❌ Error getting push token:', error);
    console.error('Error details:', error.message);
    
    // For EAS builds, just log the error - don't show alerts
    // The error will be handled gracefully and won't block login
    return null;
  }
}

/**
 * Send token to backend
 */
export async function savePushTokenToBackend(pushToken, ) {
  try {
    console.log('📤 Saving push token to backend...');
    
    const authToken = await AsyncStorage.getItem('authToken');
    const device = Platform.OS;

    if (!authToken) {
      console.warn('⚠️ No auth token found, skipping push token registration');
      return null;
    }

    // Get API URL from parameter or AsyncStorage
    const API_URL = process.env.EXPO_PUBLIC_API_URL

    console.log('Backend URL:', API_URL);
    console.log('Push Token:', pushToken);

    const response = await api.post(
      `${API_URL}/api/push/register-token`,
      { pushToken, device },
   
    );

    console.log('✅ Push token saved to backend:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error saving push token to backend:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    // Don't throw - let app continue even if backend fails
    return null;
  }
}

/**
 * Remove token on logout
 */
export async function removePushTokenFromBackend(pushToken) {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    const API_URL = apiUrl || process.env.EXPO_PUBLIC_API_URL

    if (!authToken || !pushToken) {
      console.warn('⚠️ Missing auth token or push token');
      return;
    }

    await api.delete(
      `${API_URL}/api/push/remove-token`,
      {
        data: { pushToken },
       
        timeout: 5000,
      }
    );

    console.log('✅ Push token removed from backend');
    await AsyncStorage.removeItem('expoPushToken');

  } catch (error) {
    console.error('❌ Error removing push token:', error.response?.data || error.message);
  }
}

/**
 * Initialize push notifications (call on app start after login)
 */
export async function initializePushNotifications() {
  try {
    console.log('📱 Initializing push notifications...');
    
    // Register for new token
    const token = await registerForPushNotificationsAsync();
    
    if (token) {
      console.log('✅ Push token obtained:', token);
      
      // Save to backend
      const result = await savePushTokenToBackend(token);
      
      if (result) {
        console.log('✅ Push notifications fully initialized');
      } else {
        console.warn('⚠️ Token registered locally but backend save failed');
      }
      
      return token;
    } else {
      console.warn('⚠️ Failed to get push token');
    }

    return null;

  } catch (error) {
    console.error('❌ Push notification initialization failed:', error);
    return null;
  }
}

/**
 * Clear badge count
 */
export async function clearBadgeCount() {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge:', error);
  }
}

/**
 * Dismiss all notifications
 */
export async function dismissAllNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error dismissing notifications:', error);
  }
}

/**
 * Schedule local test notification
 */
export async function sendTestNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test from Steya! 📬",
        body: 'Your push notifications are working perfectly!',
        data: { type: 'test' },
      },
      trigger: { seconds: 2 },
    });
    console.log('✅ Test notification scheduled');
  } catch (error) {
    console.error('❌ Error scheduling test notification:', error);
  }
}

export default {
  registerForPushNotificationsAsync,
  savePushTokenToBackend,
  removePushTokenFromBackend,
  initializePushNotifications,
  clearBadgeCount,
  dismissAllNotifications,
  sendTestNotification,
};