import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import SafeWrapper from '../../services/Safewrapper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { clearLocationData } from '../Redux/LocationSlice';
import { clearUserData } from '../Redux/userSlice';
import ProtectedRoute from '../protectedroute';
import AsyncStorage from '@react-native-async-storage/async-storage';



const ProfilePage = () => {
  GoogleSignin.configure({
  webClientId: "593177901144-ttbib4ng7ff5trbq1csuhhec9m8ddmi5.apps.googleusercontent.com",
  offlineAccess: true,
});
  const user = useSelector((state) => state.user.userData);

      const dispatch = useDispatch();
  
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
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
          onPress: () => router.push('/my-ads'),
        },
        {
          icon: 'heart-outline',
          iconType: 'Ionicons',
          title: 'My Wishlist',
          hasNotification: false,
          onPress: () => router.push('/wishlist'),
        },
      ],
    },
    {
      section: 'Account',
      items: [
        {
          icon: 'person-outline',
          iconType: 'Ionicons',
          title: 'Personal Information',
          hasNotification: false,
          onPress: () => router.push('/personal-info'),
        },
        {
          icon: 'notifications-outline',
          iconType: 'Ionicons',
          title: 'Notifications',
          hasNotification: true,
          onPress: () => router.push('/notifications'),
        },
        {
          icon: 'shield-checkmark-outline',
          iconType: 'Ionicons',
          title: 'Security',
          hasNotification: false,
          onPress: () => router.push('/security'),
        },
      ],
    },
  ];


 
  

const handleLogout = async () => {
  try {
   
    console.log("🔹 Setting isLoggingOut flag to true");
    await AsyncStorage.setItem("isLoggingOut", "true");
  
    // Verify it's set
    const checkFlag = await AsyncStorage.getItem("isLoggingOut");
    console.log("🔹 isLoggingOut after set:", checkFlag); // should print "true"



    console.log("🔹 Navigating to home (/(tabs))");
    router.replace("(tabs)");
    
    
     
   
    console.log("🔹 Clearing Redux user data");
    dispatch(clearUserData());

    console.log("🔹 Signing out Google");
    await GoogleSignin.signOut();

    console.log("🔹 Removing isLoggingOut flag");
    await AsyncStorage.removeItem("isLoggingOut");

    // Verify it's removed
    const removedFlag = await AsyncStorage.getItem("isLoggingOut");
    console.log("🔹 isLoggingOut after remove:", removedFlag); // should print null

    console.log("✅ Logout completed, user at home");
     
  } catch (error) {
    console.error("❌ Logout error:", error);
    await AsyncStorage.removeItem("isLoggingOut");
    router.replace("(tabs)");
  }
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
        {item.hasNotification && <View style={styles.notificationDot} />}
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ProtectedRoute>
    <SafeWrapper style={styles.container}>
      <StatusBar barStyle="dark-content" translucent  />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="create-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.data?.user?.photo ? (
              <Image 
                source={{ uri: user.data.user.photo }} 
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
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.data?.user?.name || `${user?.data?.user?.givenName || ''} ${user?.data?.user?.familyName || ''}`.trim() || 'User Name'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.data?.user?.email || 'email@example.com'}
            </Text>
            {user?.data?.user?.phone && (
              <Text style={styles.profilePhone}>
                {user.data.user.phone}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => {
              // Add share functionality here
              console.log('Share profile');
            }}
          >
            <Ionicons name="share-outline" size={20} color="#7A5AF8" />
          </TouchableOpacity>
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
      </ScrollView>
    </SafeWrapper>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7A5AF8',
  },
  profileImageText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#7A5AF8',
  },
  profileImagePhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#7A5AF8',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7A5AF8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  shareButton: {
    padding: 8,
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
});

export default ProfilePage;