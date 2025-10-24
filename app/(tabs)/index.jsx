import React, { useState, useEffect, useCallback, useRef } from "react";
import { FlatList, View, Text, RefreshControl, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LocationHeader } from "../../componets/locationfilter";
import SharedCard from "../../componets/sharecard";
import PGCard from "../../componets/pgcard";
import FlatCard from "../../componets/flatcard";
import { SkeletonList } from "../../componets/loading";
import SafeWrapper from "../../services/Safewrapper";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import api from "../../services/intercepter";
import { showToast } from "@/services/ToastService";
import { StatusBar } from "expo-status-bar";
import { setUnreadStatus } from "../Redux/unreadSlice";

// ✅ UPDATE CHECK IMPORTS
import CustomUpdateDialog from '../../componets/CustomUpdateDialog';
import { triggerPlayStoreUpdate } from '../../services/updateService';
import * as Application from 'expo-application';

const filterMap = {
  All: "all",
  "Shared Rooms": "shared",
  "PG/Hostels": "pg_hostel",
  "Rental Property": "flat_home",
};

const HomeScreen = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const locationData = useSelector((state) => state.location.locationData);
  const user = useSelector((state) => state.user.userData);
  
  const [activeFilter, setActiveFilter] = useState("All");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [skip, setSkip] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const dispatch = useDispatch();
  
  // ✅ UPDATE DIALOG STATES
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateType, setUpdateType] = useState('flexible');
  const [latestVersion, setLatestVersion] = useState('1.0.0');
  
  const limit = 15;
  const userLat = locationData?.lat;
  const userLng = locationData?.lng;

  // Refs to prevent multiple API calls
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // ✅ CHECK FOR UPDATES ON APP OPEN
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Wait 3 seconds after HomeScreen loads
        setTimeout(async () => {
          const currentVersion = Application.nativeApplicationVersion || '1.0.0';
          console.log('📱 Current app version:', currentVersion);
          
          try {
            // Send current version to backend
            const response = await axios.get(`${apiUrl}/api/app-version`, {
              params: {
                currentVersion: currentVersion
              }
            });
            
            if (response.data.success && response.data.hasUpdate) {
              console.log("🔔 Update available from backend!");
              console.log('📦 Latest version:', response.data.latestVersion);
              
             
              setLatestVersion(response.data.latestVersion);
              setUpdateType(response.data.updateType || 'flexible');
              setShowUpdateDialog(true);
            } else {
              console.log("✅ App is up to date!");
            }
          } catch (apiError) {
            console.log('⚠️ Backend API not available:', apiError.message);
          
          }
        }, 3000);
      } catch (error) {
        console.log('Update check error:', error);
      }
    };

    checkForUpdates();
  }, [apiUrl]);

  // ✅ HANDLE UPDATE ACTIONS
  const handleUpdateNow = async () => {
    setShowUpdateDialog(false);
    // Trigger actual Play Store update
    await triggerPlayStoreUpdate(updateType);
  };

  const handleUpdateLater = () => {
    setShowUpdateDialog(false);
  };

  // Calculate approximate road distance
  const calculateRoadDistance = (straightLineDistance) => {
    const roadDistance = straightLineDistance * 1.4;
    return Math.round(roadDistance);
  };

  // Check if room is favorited
  const checkIfFavorited = async (roomId) => {
    try {
      if (!user?._id) return false;
      
      const response = await api.get(`${apiUrl}/api/check/${roomId}`);
      return response.data.isFavorited;
    } catch (error) {
      console.error('Error checking favorite status for room', roomId, error);
      return false;
    }
  };

  useEffect(() => {
    // Check for unread messages when app starts
    const checkUnreadMessages = async () => {
      if (!user?._id) return;
      
      try {
        console.log('🔍 Checking for unread messages on app start...');

        const response = await api.get(`${apiUrl}/api/chat/chatrooms`);
        
        const roomsData = response.data?.chatrooms || [];
        
        let unreadCount = 0;
        
        roomsData.forEach((room) => {
          if (room && room.status === 'active' && room.hasMessages) {
            const isFromOtherUser = room.lastMessageSender && 
                                   room.lastMessageSender._id.toString() !== user._id.toString();
            
            const hasUserReadIt = room.readBy?.some(readByUser => 
              readByUser?.toString() === user._id.toString()
            );
            
            const isUnread = isFromOtherUser && !hasUserReadIt;
            
            if (isUnread) {
              unreadCount++;
            }
          }
        });
        
        console.log('🎯 App start - Unread messages found:', unreadCount);
        
        dispatch(setUnreadStatus({ 
          hasUnread: unreadCount > 0, 
          count: unreadCount 
        }));
        
      } catch (error) {
        console.log('❌ Error checking unread messages:', error);
      }
    };

    checkUnreadMessages();
  }, [user?._id, dispatch]);

  // Check favorites for all rooms
  const checkAllFavorites = async (roomList) => {
    if (!user?._id || !roomList.length) return;
    
    try {
      const favoritesMap = {};
      const promises = roomList.map(async (room) => {
        const isFavorited = await checkIfFavorited(room._id);
        favoritesMap[room._id] = isFavorited;
      });
      
      await Promise.all(promises);
      setFavorites(prev => ({ ...prev, ...favoritesMap }));
    } catch (error) {
      console.error('Error checking all favorites:', error);
    }
  };

  // Toggle favorite from HomeScreen
  const toggleFavorite = async (roomId) => {
    if (!user?._id){ 
      showToast("Please log in to favorite properties");
      return false;
    }
       
    try {
      const response = await api.post(`${apiUrl}/api/toggle`, {
        roomId: roomId
      });

      if (response.data.success) {
        setFavorites(prev => ({
          ...prev,
          [roomId]: response.data.isFavorited
        }));
        
        return response.data.isFavorited;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast("Failed to toggle favorite");
    }
  };

  // Fetch rooms with simple pagination
  const fetchRooms = useCallback(async (reset = false) => {
    if (isFetchingRef.current) {
      console.log('⏸️ Already fetching, skipping duplicate call');
      return;
    }

    if (!userLat || !userLng) {
      console.log('📍 Waiting for location data...');
      return;
    }

    isFetchingRef.current = true;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    console.log('🔍 Starting fetch:', {
      reset,
      activeFilter,
      skip: reset ? 0 : skip,
      filterCount: Object.keys(appliedFilters).length
    });

    try {
      if (reset) {
        console.log('🔄 Resetting data...');
        setRooms([]);
        setInitialLoading(true);
        setSkip(0);
        setHasMore(true);
        setLoading(true);
        setNetworkError(false);
      } else {
        setLoading(true);
      }

      const categoryParam = filterMap[activeFilter] === "all" ? undefined : filterMap[activeFilter];

      const params = {
        category: categoryParam,
        lat: userLat,
        lng: userLng,
        limit,
        skip: reset ? 0 : skip,
      };

      if (Object.keys(appliedFilters).length > 0 && activeFilter !== "All") {
        params.filters = JSON.stringify(appliedFilters);
      }

      console.log(`📤 Fetching rooms:`, params);
      
      const res = await axios.get(`${apiUrl}/api/getrooms`, { 
        params,
        signal: abortControllerRef.current.signal
      });

      if (res.data.success) {
        const newRooms = res.data.rooms.map(room => ({
          ...room,
          approximateDistance: calculateRoadDistance(room.distance)
        }));
        
        console.log(`✅ Received ${newRooms.length} rooms`);

        setRooms(prev => {
          const updatedRooms = reset ? newRooms : [...prev, ...newRooms];
          const uniqueRooms = updatedRooms.filter((v, i, a) => 
            a.findIndex(t => t._id === v._id) === i
          );
          
          return uniqueRooms;
        });

        if (!reset) {
          setSkip(prev => prev + newRooms.length);
        } else {
          setSkip(newRooms.length);
        }

        setHasMore(newRooms.length === limit);

        if (newRooms.length > 0) {
          checkAllFavorites(newRooms);
        }
        
        setNetworkError(false);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('🚫 Request cancelled');
        return;
      }
      console.error("❌ Fetch error:", err);
      
      if (!err.response && err.message === 'Network Error') {
        setNetworkError(true);
        showToast('No internet connection');
      } else {
        setNetworkError(false);
        showToast('Failed to fetch rooms');
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [userLat, userLng, activeFilter, appliedFilters, skip, apiUrl, user]);

  const handleApplyFilters = useCallback((filters) => {
    console.log('🎯 Applying filters:', filters);
    setAppliedFilters(filters);
  }, []);

  const handleFilterChange = useCallback((filter) => {
    console.log('🔄 Filter changed to:', filter);
    setActiveFilter(filter);
    setAppliedFilters({});
  }, []);

  const handleRefresh = useCallback(() => {
    console.log('🔃 Pull to refresh triggered');
    setRefreshing(true);
    fetchRooms(true);
  }, [fetchRooms]);

  useEffect(() => {
    if (!userLat || !userLng) {
      return;
    }

    console.log('🎬 Effect triggered - scheduling fetch');
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      isFetchingRef.current = false;
    }

    fetchTimeoutRef.current = setTimeout(() => {
      fetchRooms(true);
    }, 400);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isFetchingRef.current = false;
    };
  }, [activeFilter, JSON.stringify(appliedFilters), userLat, userLng]);

  const renderItem = ({ item }) => {
    const isFavorited = favorites[item._id] || false;
    
    const cardProps = {
      data: item,
      activeFilter: activeFilter,
      isFavorited: isFavorited,
      onToggleFavorite: toggleFavorite,
    };
    
    if (item.category === "shared") 
      return <SharedCard {...cardProps} />;
    if (item.category === "pg_hostel") 
      return <PGCard {...cardProps} />;
    if (item.category === "flat_home") 
      return <FlatCard {...cardProps} />;
    return null;
  };

  const handleEndReached = () => {
    if (!loading && hasMore && !refreshing && !isFetchingRef.current) {
      console.log('📜 End reached - loading more');
      fetchRooms(false);
    }
  };

  const getSkeletonType = () => {
    const category = filterMap[activeFilter];
    if (category === "all") return "shared";
    return category;
  };

  const EmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateContent}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="home-outline" size={48} color="#7A5AF8" />
          </View>
          
          <Text style={styles.emptyStateTitle}>No Properties Found</Text>
          <Text style={styles.emptyStateSubtitle}>
            We couldn't find any properties within 50 km of your location
          </Text>
          
          <View style={styles.emptyActionContainer}>
            <View style={styles.emptyActionItem}>
              <Ionicons name="options-outline" size={20} color="#6B7280" />
              <Text style={styles.emptyActionText}>Try adjusting filters</Text>
            </View>
            <View style={styles.emptyActionItem}>
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <Text style={styles.emptyActionText}>Change location</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const NetworkErrorState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateContent}>
          <View style={[styles.emptyIconCircle, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
          </View>
          
          <Text style={styles.emptyStateTitle}>Connection Lost</Text>
          <Text style={styles.emptyStateSubtitle}>
            Please check your internet connection and try again
          </Text>
          
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setNetworkError(false);
              handleRefresh();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || initialLoading) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#7A5AF8" />
        <Text style={styles.footerText}>Loading more properties...</Text>
      </View>
    );
  };

  return (
    <SafeWrapper>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <LocationHeader 
          setActiveFilter={handleFilterChange} 
          activeFilter={activeFilter} 
          onApplyFilters={handleApplyFilters}
          appliedFilters={appliedFilters}
        />
        
        {initialLoading ? (
          <SkeletonList type={getSkeletonType()} count={5} />
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#7A5AF8"]}
                tintColor="#7A5AF8"
              />
            }
            ListEmptyComponent={networkError ? NetworkErrorState : EmptyState}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* ✅ BEAUTIFUL CUSTOM UPDATE DIALOG */}
        <CustomUpdateDialog
          visible={showUpdateDialog}
          version={latestVersion}
          updateType={updateType}
          features={[
            '🎨 Beautiful new UI design',
            '🚀 Faster performance',
            '🐛 Bug fixes and improvements',
            '✨ New features you\'ll love',
          ]}
          onUpdate={handleUpdateNow}
          onLater={handleUpdateLater}
        />
      </View>
    </SafeWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 340,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyActionContainer: {
    width: '100%',
    gap: 12,
  },
  emptyActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 12,
  },
  emptyActionText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7A5AF8',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  retryButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default HomeScreen;