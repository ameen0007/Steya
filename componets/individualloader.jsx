import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonLoader = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const AnimatedBox = ({ style }) => (
    <Animated.View style={[styles.skeleton, style, { opacity }]} />
  );

  return (
    <View style={styles.container}>
      {/* Header with back button and favorite */}
      <View style={styles.header}>
        <AnimatedBox style={styles.backButton} />
        <AnimatedBox style={styles.favoriteButton} />
      </View>

      {/* Image Carousel */}
      <AnimatedBox style={styles.imageCarousel} />
      

      {/* Price Section */}
      <View style={styles.section}>
        <AnimatedBox style={styles.price} />
      </View>

      {/* Title Section */}
      <View style={styles.section}>
        <AnimatedBox style={styles.title} />
        <AnimatedBox style={styles.subtitle} />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <AnimatedBox style={styles.descLine} />
        <AnimatedBox style={styles.descLine} />
        <AnimatedBox style={styles.descLine} />
        <AnimatedBox style={[styles.descLine, { width: '80%' }]} />
      </View>

      {/* Room Details Header */}
      <View style={styles.section}>
        <AnimatedBox style={styles.sectionHeader} />
      </View>

      {/* Detail Cards Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailCard}>
          <AnimatedBox style={styles.icon} />
          <AnimatedBox style={styles.detailLabel} />
          <AnimatedBox style={styles.detailValue} />
        </View>
        <View style={styles.detailCard}>
          <AnimatedBox style={styles.icon} />
          <AnimatedBox style={styles.detailLabel} />
          <AnimatedBox style={styles.detailValue} />
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailCard}>
          <AnimatedBox style={styles.icon} />
          <AnimatedBox style={styles.detailLabel} />
          <AnimatedBox style={styles.detailValue} />
        </View>
        <View style={styles.detailCard}>
          <AnimatedBox style={styles.icon} />
          <AnimatedBox style={styles.detailLabel} />
          <AnimatedBox style={styles.detailValue} />
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <AnimatedBox style={styles.button} />
        <AnimatedBox style={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skeleton: {
    backgroundColor: '#a9b7c2',
    borderRadius: 4,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  imageCarousel: {
    width: width,
    height: 250,
    borderRadius: 0,
  },
  imageIndicator: {
    position: 'absolute',
    top: 220,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  indicatorText: {
    width: 30,
    height: 16,
    borderRadius: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  price: {
    width: 120,
    height: 24,
    borderRadius: 4,
  },
  title: {
    width: '90%',
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitle: {
    width: '60%',
    height: 16,
    borderRadius: 4,
  },
  descLine: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  sectionHeader: {
    width: 100,
    height: 20,
    borderRadius: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  detailCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  detailLabel: {
    width: 60,
    height: 12,
    borderRadius: 4,
    marginBottom: 4,
  },
  detailValue: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E1E9EE',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
  },
});

export default SkeletonLoader;