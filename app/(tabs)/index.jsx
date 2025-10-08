import React, { useState, useEffect, useCallback } from "react";
import { FlatList, View, Text, RefreshControl } from "react-native";
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

  const limit = 15;
  const userLat = locationData?.lat;
  const userLng = locationData?.lng;

  const radiusBuckets = [
    { min: 0, max: 5000 },
    { min: 5000, max: 10000 },
    { min: 10000, max: 15000 },
    { min: 15000, max: 25000 },
    { min: 25000, max: 40000 }
  ];

  const [currentBucket, setCurrentBucket] = useState(0);

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
      showToast('Error', error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const fetchRooms = async (reset = false) => {
    if (loading || !userLat || !userLng) return;
    
    setLoading(true);
    
    console.log('🔍 Fetching rooms with:', {
      activeFilter,
      category: filterMap[activeFilter],
      filters: Object.keys(appliedFilters).length,
      userLat,
      userLng,
      currentBucket
    });

    try {
      let bucketIndex = currentBucket;
      if (reset) {
        setRooms([]);
        setInitialLoading(true);
        bucketIndex = 0;
        setCurrentBucket(0);
        setHasMore(true);
      }

      const categoryParam = filterMap[activeFilter] === "all" ? undefined : filterMap[activeFilter];
      const bucket = radiusBuckets[bucketIndex];

      // Prepare params
      const params = {
        category: categoryParam,
        lat: userLat,
        lng: userLng,
        limit,
        min: bucket.min,
        max: bucket.max,
      };

      // Add filters if any are applied and we're not on "All"
      if (Object.keys(appliedFilters).length > 0 && activeFilter !== "All") {
        params.filters = JSON.stringify(appliedFilters);
      }

      console.log('📤 API Params:', params);
      const res = await axios.get(`${apiUrl}/api/getrooms`, { params });

      if (res.data.success) {
        const newRooms = res.data.rooms;
        console.log(`✅ Found ${newRooms.length} rooms in category: ${activeFilter}`);

        setRooms(prev => {
          if (reset) {
            return newRooms;
          } else {
            const combined = [...prev, ...newRooms];
            // Remove duplicates
            const unique = combined.filter((v, i, a) => 
              a.findIndex(t => t._id === v._id) === i
            );
            return unique;
          }
        });

        // Update bucket and hasMore logic
        if (newRooms.length === 0 && bucketIndex < radiusBuckets.length - 1) {
          console.log('🔄 Moving to next radius bucket');
          setCurrentBucket(bucketIndex + 1);
          setHasMore(true);
        } else {
          setHasMore(newRooms.length === limit && bucketIndex < radiusBuckets.length - 1);
        }

        // Check favorites for new rooms
        if (newRooms.length > 0) {
          checkAllFavorites(newRooms);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showToast('Error', 'Failed to fetch rooms');
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  // Handle filter application from FilterModal
  const handleApplyFilters = useCallback((filters) => {
    console.log('🔄 Applying individual filters:', filters);
    setAppliedFilters(filters);
    // Don't call fetchRooms here - it will be triggered by useEffect
  }, []);

  // Reset filters when changing main filter
  const handleFilterChange = useCallback((filter) => {
    console.log('🔄 Changing main filter to:', filter);
    setActiveFilter(filter);
    setAppliedFilters({});
    // Don't call fetchRooms here - it will be triggered by useEffect
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms(true);
  }, [userLat, userLng, activeFilter, appliedFilters]);

  // Single useEffect to handle all data fetching
  useEffect(() => {
    if (userLat && userLng) {
      console.log('🔄 Triggering fetch due to state change:', {
        activeFilter,
        appliedFilters: Object.keys(appliedFilters).length,
        userLat,
        userLng
      });
      
      const timeoutId = setTimeout(() => {
        fetchRooms(true);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeFilter, appliedFilters, userLat, userLng]);

  const renderItem = ({ item }) => {
    const isFavorited = favorites[item._id] || false;
    
    if (item.category === "shared") 
      return (
        <SharedCard 
          data={item} 
          activeFilter={activeFilter}
          isFavorited={isFavorited}
          onToggleFavorite={toggleFavorite}
        />
      );
    if (item.category === "pg_hostel") 
      return (
        <PGCard 
          data={item} 
          activeFilter={activeFilter}
          isFavorited={isFavorited}
          onToggleFavorite={toggleFavorite}
        />
      );
    if (item.category === "flat_home") 
      return (
        <FlatCard 
          data={item} 
          activeFilter={activeFilter}
          isFavorited={isFavorited}
          onToggleFavorite={toggleFavorite}
        />
      );
    return null;
  };

  const handleEndReached = () => {
    if (!loading && hasMore && !refreshing) {
      console.log('📜 Reached end, loading more...');
      fetchRooms(false);
    }
  };

  // Get skeleton type based on active filter
  const getSkeletonType = () => {
    const category = filterMap[activeFilter];
    if (category === "all") return "shared";
    return category;
  };

  return (
    <SafeWrapper>
      <View style={{ flex: 1 }}>
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
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 5 }}
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
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text>No rooms found. Try adjusting your filters or search radius.</Text>
              </View>
            }
            ListFooterComponent={
              loading && !initialLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text>Loading more rooms...</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeWrapper>
  );
};

export default HomeScreen;