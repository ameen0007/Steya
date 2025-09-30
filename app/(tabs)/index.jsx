import React, { useState, useEffect } from "react";
import { FlatList, View } from "react-native";
import { LocationHeader } from "../../componets/locationfilter";
import SharedCard from "../../componets/sharecard";
import PGCard from "../../componets/pgcard";
import FlatCard from "../../componets/flatcard";
import { SkeletonList } from "../../componets/loading"; // Import skeleton
import SafeWrapper from "../../services/Safewrapper";
import axios from "axios";
import { useSelector } from "react-redux";

const filterMap = {
  All: "all",
  "Shared Rooms": "shared",
  "PG/Hostels": "pg_hostel",
  "Rental Property": "flat_home",
};

const HomeScreen = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const locationData = useSelector((state) => state.location.locationData);
  const [activeFilter, setActiveFilter] = useState("All");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

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

  const fetchRooms = async (reset = false) => {
    if (loading || !userLat || !userLng) return;
    setLoading(true);

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

      const res = await axios.get(`${apiUrl}/api/getrooms`, {
        params: {
          category: categoryParam,
          lat: userLat,
          lng: userLng,
          limit,
          min: bucket.min,
          max: bucket.max,
        },
      });

      if (res.data.success) {
        const newRooms = res.data.rooms;

        setRooms(prev => {
          const combined = reset ? newRooms : [...prev, ...newRooms];
          const unique = combined.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);

          if (newRooms.length === 0 && bucketIndex < radiusBuckets.length - 1) {
            setCurrentBucket(bucketIndex + 1);
          }

          setHasMore(newRooms.length === limit);
          return unique;
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(true);
  }, [activeFilter, userLat, userLng]);

  const renderItem = ({ item }) => {
    if (item.category === "shared") return <SharedCard data={item} activeFilter={activeFilter} />;
    if (item.category === "pg_hostel") return <PGCard data={item} activeFilter={activeFilter} />;
    if (item.category === "flat_home") return <FlatCard data={item} activeFilter={activeFilter} />;
    return null;
  };

  const handleEndReached = () => {
    if (!loading && hasMore) fetchRooms();
  };

  // Get skeleton type based on active filter
  const getSkeletonType = () => {
    const category = filterMap[activeFilter];
    if (category === "all") return "shared"; // default for all
    return category;
  };

  return (
    <SafeWrapper>
      <View style={{ flex: 1 }}>
        <LocationHeader setActiveFilter={setActiveFilter} activeFilter={activeFilter} />
        
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
            refreshing={loading && !initialLoading}
            onRefresh={() => fetchRooms(true)}
          />
        )}
      </View>
    </SafeWrapper>
  );
};

export default HomeScreen;