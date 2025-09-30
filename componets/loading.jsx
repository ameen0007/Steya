import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

// Smooth skeleton shimmer component - with pulsing animation
const SkeletonShimmer = ({ width, height, borderRadius = 8, style }) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

// Shared Room Skeleton
export const SharedCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <SkeletonShimmer width="100%" height={200} borderRadius={12} />
      
      <View style={styles.cardContent}>
        {/* Title */}
        <SkeletonShimmer width="70%" height={18} style={{ marginBottom: 10 }} />
        
        {/* Subtitle */}
        <SkeletonShimmer width="50%" height={14} style={{ marginBottom: 16 }} />
        
        {/* Details row */}
        <View style={styles.detailsRow}>
          <SkeletonShimmer width={70} height={14} />
          <SkeletonShimmer width={70} height={14} />
          <SkeletonShimmer width={70} height={14} />
        </View>
        
        {/* Price */}
        <SkeletonShimmer width="35%" height={20} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
};

// PG/Hostel Skeleton
export const PGCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <SkeletonShimmer width="100%" height={200} borderRadius={12} />
      
      <View style={styles.cardContent}>
        {/* Title */}
        <SkeletonShimmer width="75%" height={18} style={{ marginBottom: 10 }} />
        
        {/* Location */}
        <SkeletonShimmer width="55%" height={14} style={{ marginBottom: 16 }} />
        
        {/* Amenities */}
        <View style={styles.amenitiesRow}>
          <SkeletonShimmer width={65} height={28} borderRadius={14} />
          <SkeletonShimmer width={65} height={28} borderRadius={14} />
          <SkeletonShimmer width={65} height={28} borderRadius={14} />
        </View>
        
        {/* Price */}
        <SkeletonShimmer width="40%" height={20} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
};

// Flat/Home Skeleton
export const FlatCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <SkeletonShimmer width="100%" height={200} borderRadius={12} />
      
      <View style={styles.cardContent}>
        {/* Title */}
        <SkeletonShimmer width="80%" height={18} style={{ marginBottom: 10 }} />
        
        {/* Location */}
        <SkeletonShimmer width="60%" height={14} style={{ marginBottom: 16 }} />
        
        {/* Property details */}
        <View style={styles.propertyDetailsRow}>
          <SkeletonShimmer width={60} height={14} />
          <SkeletonShimmer width={60} height={14} />
          <SkeletonShimmer width={60} height={14} />
        </View>
        
        {/* Price range */}
        <SkeletonShimmer width="45%" height={20} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
};

// Generic skeleton loader for list
export const SkeletonList = ({ type = 'shared', count = 3 }) => {
  const SkeletonComponent = 
    type === 'shared' ? SharedCardSkeleton :
    type === 'pg_hostel' ? PGCardSkeleton :
    type === 'flat_home' ? FlatCardSkeleton :
    SharedCardSkeleton;

  return (
    <View style={{ padding: 5 }}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#a9b7c2',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  propertyDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});

export default SkeletonList;