import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Share,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import api from '../../services/intercepter';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import CustomAlert from '../../componets/CustomAlert ';
import { BeautifulLoader } from '../../componets/beatifullLoader';
import ProtectedRoute from '../protectedroute';

const { width, height } = Dimensions.get('window');
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function MyAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const user = useSelector((state) => state.user.userData);

  // Alert states
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRenewAlert, setShowRenewAlert] = useState(false);
  const [renewingAdId, setRenewingAdId] = useState(null);

  useEffect(() => {
    fetchMyAds();
  }, [page]);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (page !== 1) {
      setPage(1);
    } else {
      fetchMyAds();
    }
  }, [statusFilter, categoryFilter]);

  const fetchMyAds = async () => {
    if (!user?._id) {
      router.push('/login');
      return;
    }
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: 'all', // Always fetch all ads
        category: categoryFilter !== 'all' ? categoryFilter : undefined
      };

      const response = await api.get(`${apiUrl}/api/posts/my-posts`, { params });
      
      if (response.data.success) {
        console.log('====================================');
        console.log(response.data, "data in my ads");
        console.log('====================================');
        setAds(response.data.posts);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      setErrorMessage('Failed to load your ads');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchMyAds();
  };

  const toggleActiveStatus = async (adId, currentStatus) => {
    try {
      setLoading(true);
      // Update UI optimistically
      setAds(ads.map(ad => 
        ad._id === adId ? { ...ad, isActive: !currentStatus } : ad
      ));

      const response = await api.patch(`${apiUrl}/api/posts/my-posts/${adId}/toggle-status`);
      
      if (!response.data.success) {
        // Revert on failure
        setAds(ads.map(ad => 
          ad._id === adId ? { ...ad, isActive: currentStatus } : ad
        ));
        setErrorMessage('Failed to update ad status');
        setShowErrorAlert(true);
         setLoading(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error toggling status:', error);
      // Revert on error
      setAds(ads.map(ad => 
        ad._id === adId ? { ...ad, isActive: currentStatus } : ad
      ));
      setErrorMessage('Failed to update ad status');
      setShowErrorAlert(true);
      setLoading(false);
    }
  };

  const handleEdit = (roomId, category) => {
    const categoryRoutes = {
      'shared': '/sharedroomform',
      'pg_hostel': '/pghostelform', 
      'flat_home': '/homeform'
    };

    const formRoute = categoryRoutes[category];
    
    if (!formRoute) {
      setErrorMessage('Invalid category type');
      setShowErrorAlert(true);
      return;
    }

    router.push({
      pathname: formRoute,
      params: { 
        roomId: roomId,
        isEdit: "true",
        category: category
      }
    });
  };

  const handleSold = (adId) => {
    setSelectedAdId(adId);
    setShowDeleteAlert(true);
  };

  const performSold = async () => {
     setLoading(true);
    try {
      await api.delete(`${apiUrl}/api/posts/my-posts/${selectedAdId}`);
      setAds(ads.filter(ad => ad._id !== selectedAdId));
      setShowSuccessAlert(true);
       setLoading(false);
    } catch (error) {
      console.error('Error marking as sold:', error);
      setErrorMessage('Failed to mark ad as sold. Please try again.');
      setShowErrorAlert(true);
       setLoading(false);
    }
  };

  const handleRenew = (adId) => {
    setRenewingAdId(adId);
    setShowRenewAlert(true);
  };

  const performRenew = async () => {
    setLoading(true);
    try {
      const response = await api.patch(`${apiUrl}/api/posts/my-posts/${renewingAdId}/renew`);
      
      if (response.data.success) {
        // Refresh the ads list to get updated data
        await fetchMyAds();
        setErrorMessage('Ad renewed successfully for 30 days!');
        setShowSuccessAlert(true);
      } else {
        setErrorMessage('Failed to renew ad. Please try again.');
        setShowErrorAlert(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error renewing ad:', error);
      setErrorMessage('Failed to renew ad. Please try again.');
      setShowErrorAlert(true);
      setLoading(false);
    }
  };

  const handleShare = async (ad) => {
    try {
      // Construct a shareable message
      const shareMessage = `Check out this property: ${ad.title}\n\nLocation: ${ad.location?.fullAddress}\nRent: ₹${ad.monthlyRent || ad.priceRange?.min || 'Contact'}/month\n\nCategory: ${getCategoryLabel(ad.category)}`;
      
      // You can add a deep link URL here if you have one
      // const shareUrl = `https://yourapp.com/property/${ad._id}`;
      // const fullMessage = `${shareMessage}\n\nView details: ${shareUrl}`;

      const result = await Share.share({
        message: shareMessage,
        // url: shareUrl, // For iOS
        title: ad.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared successfully
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      setErrorMessage('Failed to share ad. Please try again.');
      setShowErrorAlert(true);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'shared': return 'people';
      case 'pg_hostel': return 'business';
      case 'flat_home': return 'home';
      default: return 'location';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'shared': return 'Shared Room';
      case 'pg_hostel': return 'PG/Hostel';
      case 'flat_home': return 'Flat/Home';
      default: return 'Property';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return now > expiry;
  };

  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return 0;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const calculateDaysSinceExpiry = (expiryDate) => {
    if (!expiryDate) return 0;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysPassed = Math.floor((now - expiry) / (1000 * 60 * 60 * 24));
    return daysPassed;
  };

  const getFilteredAds = () => {
    if (statusFilter === 'expired') {
      return ads.filter(ad => isExpired(ad.expiryDate));
    } else if (statusFilter === 'active') {
      return ads.filter(ad => ad.isActive && !isExpired(ad.expiryDate));
    } else if (statusFilter === 'inactive') {
      return ads.filter(ad => !ad.isActive && !isExpired(ad.expiryDate));
    } else if (statusFilter === 'all') {
      // Show all non-expired ads
      return ads.filter(ad => !isExpired(ad.expiryDate));
    }
    return ads;
  };

  const getFilterCounts = () => {
    const allAds = ads.filter(ad => !isExpired(ad.expiryDate));
    const activeAds = ads.filter(ad => ad.isActive && !isExpired(ad.expiryDate));
    const inactiveAds = ads.filter(ad => !ad.isActive && !isExpired(ad.expiryDate));
    const expiredAds = ads.filter(ad => isExpired(ad.expiryDate));

    return {
      all: allAds.length,
      active: activeAds.length,
      inactive: inactiveAds.length,
      expired: expiredAds.length
    };
  };

  const FilterChip = ({ label, value, active, count }) => (
    <ProtectedRoute>
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={() => setStatusFilter(value)}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
    </ProtectedRoute>
  );

  const StickyHeader = () => {
    const counts = getFilterCounts();
    
    return (
     <ProtectedRoute>
    <View style={styles.stickyHeaderContainer}>
      <LinearGradient
        colors={['#7A5AF8', '#9B7DF7', '#B998F5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stickyHeader}
      >
        <View style={styles.headerContent}>
          <Text style={styles.stickyHeaderTitle}>My Ads</Text>
        </View>

        <View style={styles.filterContainer}>
          <FilterChip label="All" value="all" active={statusFilter === 'all'} count={counts.all} />
          <FilterChip label="Active" value="active" active={statusFilter === 'active'} count={counts.active} />
          <FilterChip label="Paused" value="inactive" active={statusFilter === 'inactive'} count={counts.inactive} />
          <FilterChip label="Expired" value="expired" active={statusFilter === 'expired'} count={counts.expired} />
        </View>
      </LinearGradient>
    </View>
    </ProtectedRoute>
  )};

  const filteredAds = getFilteredAds();

  if (loading && !refreshing) {
    return (
      <ProtectedRoute>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
               <BeautifulLoader/>
     
             </View>
             </ProtectedRoute>
    );
  }

  if (filteredAds.length === 0) {
    const getEmptyMessage = () => {
      switch(statusFilter) {
        case 'active':
          return {
            title: 'No Active Ads',
            subtitle: 'You don\'t have any active ads at the moment.'
          };
        case 'inactive':
          return {
            title: 'No Paused Ads',
            subtitle: 'All your ads are currently active.'
          };
        case 'expired':
          return {
            title: 'No Expired Ads',
            subtitle: 'Great! All your ads are up to date.'
          };
        default:
          return {
            title: 'No Ads Yet',
            subtitle: 'Start posting to reach potential tenants.'
          };
      }
    };

    const message = getEmptyMessage();

    return (
       <ProtectedRoute>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <StickyHeader />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <LinearGradient
              colors={['#7A5AF8', '#9B7DF7']}
              style={styles.emptyIconGradient}
            >
              <Ionicons name="document-text-outline" size={50} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>{message.title}</Text>
          <Text style={styles.emptySubtitle}>{message.subtitle}</Text>
        </View>
      </View>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
    <View style={styles.container}>
      <StatusBar style="dark" />
      <StickyHeader />
      
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7A5AF8']} />
        }
      >
        {filteredAds.map((ad, index) => {
          const expired = isExpired(ad.expiryDate);
          const daysLeft = calculateDaysLeft(ad.expiryDate);
          const daysSinceExpiry = calculateDaysSinceExpiry(ad.expiryDate);
          const isExpiringSoon = daysLeft <= 7 && !expired;
          
          return (
            <View key={ad._id} style={[
              styles.adCard, 
              { marginTop: index === 0 ? 20 : 16 },
              expired && styles.expiredCard
            ]}>
              {/* Expired Badge */}
              {expired && (
                <View style={styles.expiredBanner}>
                  <Ionicons name="time-outline" size={16} color="white" />
                  <Text style={styles.expiredBannerText}>
                    EXPIRED - {daysSinceExpiry} day{daysSinceExpiry !== 1 ? 's' : ''} ago
                  </Text>
                </View>
              )}

              {/* Card Header with Status Toggle */}
              <View style={styles.adHeader}>
                <View style={styles.categoryTag}>
                  <Ionicons
                    name={getCategoryIcon(ad.category)}
                    size={14}
                    color={expired ? "#999" : "#7A5AF8"}
                  />
                  <Text style={[styles.categoryText, expired && styles.expiredText]}>
                    {getCategoryLabel(ad.category)}
                  </Text>
                </View>
                
                {!expired && (
                  <View style={styles.statusToggleContainer}>
                    <Text style={[styles.statusLabel, !ad.isActive && styles.statusLabelInactive]}>
                      {ad.isActive ? 'Pause' : 'Resume'}
                    </Text>
                    <Switch
                      value={ad.isActive}
                      onValueChange={() => toggleActiveStatus(ad._id, ad.isActive)}
                      trackColor={{ false: '#E0E0E0', true: '#B998F5' }}
                      thumbColor={ad.isActive ? '#7A5AF8' : '#f4f3f4'}
                      ios_backgroundColor="#E0E0E0"
                    />
                  </View>
                )}
              </View>

              {/* Image with Overlay Stats */}
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: ad.images?.[0]?.thumbnailUrl || ad.images?.[0]?.originalUrl }} 
                  style={[styles.adImage, expired && styles.expiredImage]} 
                />
                
                {/* Expiry Badge */}
                {!expired && (
                  <View style={[styles.expiryBadge, isExpiringSoon && styles.expiryBadgeWarning]}>
                    <Ionicons 
                      name={isExpiringSoon ? "warning" : "time-outline"} 
                      size={12} 
                      color={isExpiringSoon ? "#FF6B6B" : "white"} 
                    />
                    <Text style={[styles.expiryText, isExpiringSoon && styles.expiryTextWarning]}>
                      {daysLeft} days left
                    </Text>
                  </View>
                )}

                {/* Views & Favorites Overlay */}
                <View style={styles.statsOverlay}>
                  <View style={styles.statItem}>
                    <Ionicons name="eye-outline" size={14} color="white" />
                    <Text style={styles.statText}>{ad.views || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="heart-outline" size={14} color="white" />
                    <Text style={styles.statText}>{ad.favorites.length || 0}</Text>
                  </View>
                </View>
              </View>

              {/* Expired Warning Message */}
              {expired && (
                <View style={styles.expiredWarning}>
                  <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
                  <Text style={styles.expiredWarningText}>
                    Renew within 30 days or this post will be permanently deleted
                  </Text>
                </View>
              )}

              {/* Ad Content */}
              <View style={styles.adContent}>
                <Text style={[styles.adTitle, expired && styles.expiredText]} numberOfLines={2}>
                  {ad.title}
                </Text>
                
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={16} color={expired ? "#999" : "#7A5AF8"} />
                  <Text style={[styles.locationText, expired && styles.expiredText]} numberOfLines={1}>
                    {ad.location?.fullAddress}
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.priceText, expired && styles.expiredText]}>
                      ₹{ad.monthlyRent || ad.priceRange?.min || 'Contact'}
                    </Text>
                    <Text style={[styles.priceLabel, expired && styles.expiredText]}>/month</Text>
                  </View>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={12} color="#999" />
                    <Text style={styles.dateText}>{formatDate(ad.createdAt)}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.adFooter}>
                {expired ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.renewBtn]}
                      onPress={() => handleRenew(ad._id)}
                    >
                      <Ionicons name="refresh" size={16} color="white" />
                      <Text style={styles.renewBtnText}>Renew</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleSold(ad._id)}
                    >
                      <Feather name="check-circle" size={16} color="#FF6B6B" />
                      <Text style={[styles.actionBtnText, { color: '#FF6B6B' }]}>Mark Sold</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleEdit(ad._id, ad.category)} 
                    >
                      <Feather name="edit-2" size={16} color="#7A5AF8" />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionBtn}
                      onPress={() => handleShare(ad)}
                    >
                      <Feather name="share-2" size={16} color="#2196F3" />
                      <Text style={[styles.actionBtnText, { color: '#2196F3' }]}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleSold(ad._id)}
                    >
                      <Feather name="check-circle" size={16} color="#FF6B6B" />
                      <Text style={[styles.actionBtnText, { color: '#FF6B6B' }]}>Sold</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          );
        })}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Custom Alerts */}
      <CustomAlert
        visible={showDeleteAlert}
        title="Mark as Sold"
        message="Are you sure you want to mark this property as sold? The post will be permanently deleted and cannot be recovered."
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Confirm Sold',
            style: 'destructive',
            onPress: performSold,
          },
        ]}
        onClose={() => setShowDeleteAlert(false)}
      />

      <CustomAlert
        visible={showRenewAlert}
        title="Renew Ad"
        message="Renewing this ad will extend its visibility for another 30 days. Do you want to continue?"
        buttons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {},
          },
          {
            text: 'Renew',
            onPress: performRenew,
          },
        ]}
        onClose={() => setShowRenewAlert(false)}
      />

      <CustomAlert
        visible={showSuccessAlert}
        title="Success"
        message={errorMessage || "Operation completed successfully."}
        buttons={[
          {
            text: 'OK',
            onPress: () => {},
          },
        ]}
        onClose={() => setShowSuccessAlert(false)}
      />

      <CustomAlert
        visible={showErrorAlert}
        title="Error"
        message={errorMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => {},
          },
        ]}
        onClose={() => setShowErrorAlert(false)}
      />
    </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7A5AF8',
    fontWeight: '500',
  },
  stickyHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  stickyHeader: {
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stickyHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: 'white',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  filterChipTextActive: {
    color: '#7A5AF8',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 180,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  adCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  expiredCard: {
    opacity: 0.8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  expiredBanner: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  expiredBannerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0FF',
    gap: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#7A5AF8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statusLabelInactive: {
    color: '#FF9800',
  },
  imageContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  adImage: {
    width: '100%',
    height: 200,
  },
  expiredImage: {
    opacity: 0.4,
  },
  expiryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  expiryBadgeWarning: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  expiryText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  expiryTextWarning: {
    color: '#FF6B6B',
  },
  statsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  expiredWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    gap: 8,
  },
  expiredWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  adContent: {
    paddingHorizontal: 16,
    fontSize: 11,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7A5AF8',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  expiredText: {
    color: '#999',
  },
  adFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A5AF8',
  },
  renewBtn: {
    backgroundColor: '#7A5AF8',
  },
  renewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  bottomSpacing: {
    height: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIconContainer: {
    marginBottom: 30,
  },
  emptyIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});