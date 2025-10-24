import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Share,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import SafeWrapper from '../../services/Safewrapper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { clearUserData } from '../Redux/userSlice';
import ProtectedRoute from '../protectedroute';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removePushTokenFromBackend } from '../../services/notificationHandler';
import { StatusBar } from 'expo-status-bar';
import { BeautifulLoader } from '../../componets/beatifullLoader';
import { DonationButton } from '../../componets/DonationButton';
import api from '../../services/intercepter';
import { showToast } from '../../services/ToastService';
import CustomAlert from '../../componets/CustomAlert ';
import * as Application from 'expo-application';

const ProfilePage = () => {
  GoogleSignin.configure({
    webClientId: "593177901144-ttbib4ng7ff5trbq1csuhhec9m8ddmi5.apps.googleusercontent.com",
    offlineAccess: true,
  });

  const user = useSelector((state) => state.user.userData);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [bugDescription, setBugDescription] = useState('');
  const dispatch = useDispatch();
  const [showDonation, setShowDonation] = useState(false);
  
  // Alert states
  const [showRateAlert, setShowRateAlert] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showThankYouAlert, setShowThankYouAlert] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const handleRateApp = () => {
    setShowRateAlert(true);
  };

  const handlePrivacyPolicy = () => {
    const privacyUrl = 'https://steya-landing.vercel.app/PrivacyPolicy';
    Linking.openURL(privacyUrl);
  };

  const handleBugReport = () => {
    setShowBugReportModal(true);
  };

  const submitBugReport = async () => {
    if (!bugDescription.trim()) {
      return;
    }
    setLoading1(true);
    try {
      const response = await api.post('/api/bug/submit', { description: bugDescription });

      if (response.data.success) {
        setShowBugReportModal(false);
        setBugDescription('');
        showToast("Your bug report has been submitted.");
        setLoading1(false);
      } else {
        setLoading1(false);
        showToast('Failed to submit bug report');
      }
    } catch (error) {
      setLoading1(false);
      console.error('Bug submission failed:', error);
      showToast('Failed to submit bug report.');
    }
  };

  const handleSupportSteya = () => {
    setShowDonation(true);
  };

  const handleShareProfile = async () => {
    try {
      const profileName = user?.name || `${user?.data?.user?.givenName || ''} ${user?.data?.user?.familyName || ''}`.trim() || 'User Name';
      const profileEmail = user?.email || '';
      const message = `Check out my profile!\nName: ${profileName}\nEmail: ${profileEmail}`;
      await Share.share({ message });
    } catch (error) {
      console.log('Error sharing profile:', error.message);
    }
  };

  const menuItems = [
    {
      section: 'My Content',
      items: [
        {
          icon: 'list-outline',
          iconType: 'Ionicons',
          title: 'My Ads',
          hasNotification: true,
          onPress: () => router.push('/(tabs)/likes'),
        },
        {
          icon: 'heart-outline',
          iconType: 'Ionicons',
          title: 'My Wishlist',
          hasNotification: false,
          onPress: () => router.push('/favoritePage'),
        },
      ],
    },
    {
      section: 'Support & Feedback',
      items: [
        {
          icon: 'heart',
          iconType: 'Ionicons',
          title: 'Support Steya',
          hasNotification: false,
          onPress: handleSupportSteya,
        },
        {
          icon: 'star-outline',
          iconType: 'Ionicons',
          title: 'Rate Steya',
          hasNotification: false,
          onPress: handleRateApp,
        },
        {
          icon: 'bug-outline',
          iconType: 'Ionicons',
          title: 'Report a Bug',
          hasNotification: false,
          onPress: handleBugReport,
        },
        {
          icon: 'shield-checkmark-outline',
          iconType: 'Ionicons',
          title: 'Privacy Policy',
          hasNotification: false,
          onPress: handlePrivacyPolicy,
        },
      ],
    },
  ];

  const performLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem("isLoggingOut", "true");

      const pushToken = await AsyncStorage.getItem('expoPushToken');
      if (pushToken) await removePushTokenFromBackend(pushToken);

      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("expoPushToken");

      dispatch(clearUserData());
      await GoogleSignin.signOut();

      await AsyncStorage.removeItem("isLoggingOut");
      router.replace("/(tabs)");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Logout error:", error);
      await AsyncStorage.removeItem("isLoggingOut");
      await AsyncStorage.removeItem("authToken");
      router.replace("/(tabs)");
    }
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const renderIcon = (iconName, iconType, color, size = 24) => {
    const IconComponent = iconType === 'Ionicons' ? Ionicons :
      iconType === 'MaterialIcons' ? MaterialIcons : Feather;
    return <IconComponent name={iconName} size={size} color={color} />;
  };

  const renderMenuItem = (item, isLast = false) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuItem, isLast && styles.lastMenuItem]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          {renderIcon(item.icon, item.iconType, '#7A5AF8')}
        </View>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderVersionInfo = () => {
    const version = Application.nativeApplicationVersion || '1.0.0';
    
    return (
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          v{version}
        </Text>
      </View>
    );
  };

  return (
    <ProtectedRoute>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <BeautifulLoader />
        </View>
      ) : (
        <SafeWrapper style={styles.container}>
          <StatusBar style="dark" />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={handleShareProfile}
              >
                <Ionicons name="share-outline" size={23} color="#7A5AF8" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Profile Section - Beautiful Vertical Centered Layout */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {user?.picture ? (
                  <Image
                    source={{ uri: user?.picture }}
                    style={styles.profileImagePhoto}
                  />
                ) : (
                  <View style={styles.profileImage}>
                    <Text style={styles.profileImageText}>
                      {getInitials(user?.data?.user?.name || user?.data?.user?.givenName)}
                    </Text>
                  </View>
                )}
                <View style={styles.verificationBadge}>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.name || `${user?.data?.user?.givenName || ''} ${user?.data?.user?.familyName || ''}`.trim() || 'User Name'}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email || 'email@example.com'}
                </Text>
                {user?.data?.user?.phone && (
                  <Text style={styles.profilePhone}>
                    {user.data.user.phone}
                  </Text>
                )}
              </View>
            </View>

            {/* Menu Sections */}
            {menuItems.map((section, sectionIndex) => (
              <View key={section.section} style={styles.menuSection}>
                <Text style={styles.sectionTitle}>{section.section}</Text>
                <View style={styles.menuContainer}>
                  {section.items.map((item, itemIndex) =>
                    renderMenuItem(item, itemIndex === section.items.length - 1)
                  )}
                </View>
              </View>
            ))}

            {/* Logout Button */}
            <View style={styles.menuSection}>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                      <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Version Info - Compact */}
            {renderVersionInfo()}

            <View  />
          </ScrollView>

          {/* Donation Button */}
          <DonationButton
            amount={50}
            visible={showDonation}
            onClose={() => setShowDonation(false)}
            onSuccess={() => {
              setShowDonation(false);
              setShowThankYouAlert(true);
            }}
          />

          {/* Bug Report Modal */}
          <Modal
            visible={showBugReportModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowBugReportModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Report a Bug 🐛</Text>
                  <TouchableOpacity onPress={() => setShowBugReportModal(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDescription}>
                  Help us improve Steya by reporting any bugs or issues you encounter.
                </Text>

                <TextInput
                  style={styles.bugInput}
                  placeholder="Describe the bug you encountered..."
                  multiline
                  numberOfLines={6}
                  value={bugDescription}
                  onChangeText={setBugDescription}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.supportButton, !bugDescription.trim() && styles.supportButtonDisabled]}
                  onPress={submitBugReport}
                  disabled={!bugDescription.trim()}
                >
                  {loading1 ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.supportButtonText}>Submit Report</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Custom Alerts */}
          <CustomAlert
            visible={showRateAlert}
            title="Rate Steya"
            message="Love using Steya? Please take a moment to rate us!"
            buttons={[
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => { },
              },
              {
                text: 'Rate Now',
                onPress: () => {
                  const playStoreUrl = 'market://details?id=com.ameen007.Steya';
                  Linking.openURL(playStoreUrl).catch(() => {
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.ameen007.Steya');
                  });
                },
              },
            ]}
            onClose={() => setShowRateAlert(false)}
          />

          <CustomAlert
            visible={showLogoutAlert}
            title="Logout"
            message="Are you sure you want to logout from your account?"
            buttons={[
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => { },
              },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: performLogout,
              },
            ]}
            onClose={() => setShowLogoutAlert(false)}
          />
        </SafeWrapper>
      )}
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  // ✨ NEW - Beautiful Vertical Centered Profile Section
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#7A5AF8',
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7A5AF8',
  },
  profileImagePhoto: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#7A5AF8',
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7A5AF8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  profilePhone: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 16,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  logoutIconContainer: {
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  modalDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  bugInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 150,
  },
  supportButton: {
    backgroundColor: '#7A5AF8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  supportButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // ✨ NEW - Compact Version Info Styles
  versionContainer: {
    alignItems: 'center',
    // paddingVertical: 12,
    // marginTop: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },
});

export default ProfilePage;