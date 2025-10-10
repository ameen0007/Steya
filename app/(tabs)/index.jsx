import React, { useState, useEffect, useCallback, useRef } from "react";
import { FlatList, View, Text, RefreshControl, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LocationHeader } from "../../componets/locationfilter";
import SharedCard from "../../componets/sharecard";
import PGCard from "../../componets/pgcard";
import FlatCard from "../../componets/flatcard";
import { SkeletonList } from "../../componets/loading";
import SafeWrapper from "../../services/Safewrapper";
import axios from "axios";
import { useSelector } from "react-redux";
import api from "../../services/intercepter";
import { showToast } from "@/services/ToastService";

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

  const limit = 15;
  const userLat = locationData?.lat;
  const userLng = locationData?.lng;

  // Refs to prevent multiple API calls
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Calculate approximate road distance (straight-line * 1.4 for road distance)
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
      showToast(error.response?.data?.message || "Failed to toggle favorite");
    }
  };

  // Fetch rooms with simple pagination
  const fetchRooms = useCallback(async (reset = false) => {
    // Check if already fetching
    if (isFetchingRef.current) {
      console.log('⏸️ Already fetching, skipping duplicate call');
      return;
    }

    if (!userLat || !userLng) {
      console.log('📍 Waiting for location data...');
      return;
    }

    // Set fetching flag IMMEDIATELY
    isFetchingRef.current = true;

    // Cancel any existing request
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

        // Update skip for next fetch
        if (!reset) {
          setSkip(prev => prev + newRooms.length);
        } else {
          setSkip(newRooms.length);
        }

        // Check if there are more rooms
        setHasMore(newRooms.length === limit);

        if (newRooms.length > 0) {
          checkAllFavorites(newRooms);
        }
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('🚫 Request cancelled');
        return;
      }
      console.error("❌ Fetch error:", err);
      showToast('Failed to fetch rooms');
    } finally {
      // Always reset fetching flag
      isFetchingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [userLat, userLng, activeFilter, appliedFilters, skip, apiUrl, user]);

  // Handle filter application from FilterModal
  const handleApplyFilters = useCallback((filters) => {
    console.log('🎯 Applying filters:', filters);
    setAppliedFilters(filters);
  }, []);

  // Reset filters when changing main filter
  const handleFilterChange = useCallback((filter) => {
    console.log('🔄 Filter changed to:', filter);
    setActiveFilter(filter);
    setAppliedFilters({});
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    console.log('🔃 Pull to refresh triggered');
    setRefreshing(true);
    fetchRooms(true);
  }, [fetchRooms]);

  // Effect to handle data fetching
  useEffect(() => {
    if (!userLat || !userLng) {
      return;
    }

    console.log('🎬 Effect triggered - scheduling fetch');
    
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      isFetchingRef.current = false;
    }

    // Debounce with timeout
    fetchTimeoutRef.current = setTimeout(() => {
      fetchRooms(true);
    }, 400);

    // Cleanup function
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

  // Get skeleton type based on active filter
  const getSkeletonType = () => {
    const category = filterMap[activeFilter];
    if (category === "all") return "shared";
    return category;
  };

  // Beautiful empty state with creative messages
  const EmptyState = () => {
    const messages = [
      {
        emoji: "🔍",
        title: "Ooooh! Nothing Here Yet",
        subtitle: "We're working hard to bring properties to your area",
        tip: "It looks like there are no rooms within 45 km of your location"
      },
      {
        emoji: "🌟",
        title: "Be the First!",
        subtitle: "You're exploring uncharted territory",
        tip: "No properties found within 45 km - try expanding your search area"
      }
    ];

    // Pick a random message for variety
    const message = messages[Math.floor(Math.random() * messages.length)];

    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateContent}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyStateIcon}>{message.emoji}</Text>
            <View style={styles.shimmerEffect} />
          </View>
          
          <Text style={styles.emptyStateTitle}>{message.title}</Text>
          <Text style={styles.emptyStateSubtitle}>{message.subtitle}</Text>
          
          <View style={styles.emptyStateDivider} />
          
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{message.tip}</Text>
          </View>

          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>What you can do:</Text>
            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionBullet}>✨</Text>
              <Text style={styles.suggestionText}>Try clearing your filters</Text>
            </View>
            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionBullet}>🔄</Text>
              <Text style={styles.suggestionText}>Switch to a different category</Text>
            </View>
            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionBullet}>📍</Text>
              <Text style={styles.suggestionText}>Change your search location</Text>
            </View>
            <View style={styles.suggestionItem}>
              <Text style={styles.suggestionBullet}>⏰</Text>
              <Text style={styles.suggestionText}>Check back later for new listings</Text>
            </View>
          </View>

          <View style={styles.workingIndicator}>
            <View style={styles.pulseCircle} />
            <Text style={styles.workingText}>We're actively working on it!</Text>
          </View>
        </View>
      </View>
    );
  };

  // Footer loader
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

  // Disclaimer banner component
  const DisclaimerBanner = () => (
    <View style={styles.disclaimerBanner}>
      <Ionicons name="information-circle" size={18} color="#3B82F6" style={styles.disclaimerIcon} />
      <Text style={styles.disclaimerText}>
    Distance may be a little different from actual
      </Text>
    </View>
  );

  return (
    <SafeWrapper>
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
            ListHeaderComponent={rooms.length > 0 ? DisclaimerBanner : null}
            ListEmptyComponent={EmptyState}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  // Enhanced Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  emptyStateIcon: {
    fontSize: 72,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
  },
  emptyStateTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyStateDivider: {
    width: 80,
    height: 4,
    backgroundColor: '#7A5AF8',
    borderRadius: 2,
    marginBottom: 24,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    width: '100%',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 18,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 4,
  },
  suggestionBullet: {
    fontSize: 18,
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontWeight: '500',
  },
  workingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7A5AF8',
    marginRight: 10,
  },
  workingText: {
    fontSize: 13,
    color: '#4F46E5',
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
  // Disclaimer Banner Styles
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 7,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    
    borderLeftColor: '#3B82F6',
  },
  disclaimerIcon: {
    marginRight: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;