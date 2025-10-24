import { showUpdatePopup } from 'react-native-rn-in-app-update';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

/**
 * Check if update is available (doesn't show dialog)
 * Returns update info so you can show your own custom dialog first
 */
export const checkIfUpdateAvailable = async () => {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    // This is a workaround to check without showing dialog
    // We'll catch the error and know update is available
    const currentVersion = Application.nativeApplicationVersion;
    
    return {
      updateAvailable: true, // You'd need to check your backend or Play Store API
      currentVersion: currentVersion,
      latestVersion: '1.0.1', // Get this from your backend
    };
  } catch (error) {
    console.log('Update check:', error.message);
    return null;
  }
};

/**
 * Show the system update dialog (after user clicks Update on your custom dialog)
 */
export const triggerPlayStoreUpdate = async (updateType = 'flexible') => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await showUpdatePopup(updateType);
    console.log('Play Store update triggered');
  } catch (error) {
    console.log('Update error:', error.message);
  }
};

/**
 * Check and show flexible (optional) update
 */
export const checkForAppUpdate = async () => {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    await showUpdatePopup('flexible');
    console.log('Flexible update check completed');
    return true;
  } catch (error) {
    console.log('Update check (expected in dev):', error.message);
    return null;
  }
};

/**
 * Show flexible (optional) update
 */
export const startFlexibleUpdate = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await showUpdatePopup('flexible');
    console.log('Flexible update shown');
  } catch (error) {
    console.log('Flexible update error:', error.message);
  }
};

/**
 * Show immediate (mandatory) update
 */
export const startImmediateUpdate = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await showUpdatePopup('immediate');
    console.log('Immediate update shown');
  } catch (error) {
    console.log('Immediate update error:', error.message);
  }
};

/**
 * Smart update with custom dialog support
 * Returns update info to show custom dialog
 */
export const handleSmartUpdate = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    // For now, just show Play Store dialog
    // You can enhance this to check first and return info for custom dialog
    await showUpdatePopup('flexible');
    console.log('Update check completed');
    return true;
  } catch (error) {
    console.log('Update check (expected in dev):', error.message);
    return false;
  }
};