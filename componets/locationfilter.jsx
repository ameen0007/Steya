import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FilterModal from '../componets/modalfilter';
import { useSelector } from 'react-redux';

export const LocationHeader = ({ 
  setActiveFilter, 
  activeFilter, 
  onApplyFilters, 
  appliedFilters // Receives from parent
}) => {
  const user = useSelector((state) => state.user.userData);
  const filters = ['All', 'Shared Rooms', 'PG/Hostels', 'Rental Property'];
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const isScrollable = contentWidth > scrollViewWidth;
  
  const [showModal, setShowModal] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const locationData = useSelector((state) => state.location.locationData);

  const handleLocationPress = () => {
    console.log("--------in in press");
    router.push('/locationScreen');
  };

  const getFilterIcon = (filterName) => {
    switch(filterName) {
      case 'Shared Rooms': return 'people';
      case 'PG/Hostels': return 'business-sharp';
      case 'Rental Property': return 'home-city'; 
    }
  };

  // Updated handleApplyFilters function
  const handleApplyFilters = useCallback((filters) => {
    const activeCount = Object.values(filters).filter(filter => filter.selected).length;
    setActiveFiltersCount(activeCount);
    
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  }, [onApplyFilters]);

  // Fixed handlechangeFilter function
  const handlechangeFilter = useCallback((filter) => {
    if (setActiveFilter) {
      setActiveFilter(filter);
    }
  }, [setActiveFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.leftContainer} onPress={handleLocationPress}>
          <View style={styles.topRow}>
            <FontAwesome5 name="location-arrow" size={18} color="#7A5AF8" />
            <Text style={styles.locatingText}>Nearby rooms in...</Text>
          </View>
          <Text style={styles.addressText} numberOfLines={1}>
            {locationData.name}...
          </Text>
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => router.push('/favoritePage')} style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color="#403f41" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.scrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
            onContentSizeChange={(w) => setContentWidth(w)}
            onLayout={(e) => setScrollViewWidth(e.nativeEvent.layout.width)}
          >
            {filters.map((filter) => {
              const iconName = getFilterIcon(filter);
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterPill,
                    activeFilter === filter ? styles.selectedFilter : styles.unselectedFilter,
                  ]}
                  onPress={() => handlechangeFilter(filter)}
                >
                  <View style={styles.filterContent}>
                    {iconName && (
                      filter === 'Shared Rooms' ? (
                        <Ionicons 
                          name={iconName} 
                          size={16} 
                          color={activeFilter === filter ? '#fff' : '#7A5AF8'} 
                          style={styles.filterIcon}
                        />
                      ) : filter === 'Rental Property' ? (
                        <MaterialCommunityIcons 
                          name={iconName}
                          size={16}
                          color={activeFilter === filter ? '#fff' : '#6ED5D0'}
                          style={styles.filterIcon}
                        />
                      ) : (
                        <Ionicons 
                          name={iconName} 
                          size={16} 
                          color={activeFilter === filter ? '#fff' : '#FF6B6B'} 
                          style={styles.filterIcon}
                        />
                      )
                    )}
                    <Text style={[
                      styles.filterText,
                      activeFilter === filter ? styles.selectedFilterText : styles.unselectedFilterText,
                    ]}>
                      {filter}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {isScrollable && (
            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientOverlay}
              pointerEvents="none"
            />
          )}
        </View>

        {activeFilter !== 'All' && 
          <View style={styles.filtermainbox}>
            <View style={styles.filterbox}>
              <TouchableOpacity onPress={() => setShowModal(true)} style={styles.filterButton}>
                <View style={styles.insidemain}>
                  <View style={styles.filtericons}>
                    <Ionicons name="funnel" size={16} color="#fff" />
                  </View>
                  {activeFiltersCount > 0 && (
                    <Text style={styles.badgeText}>{activeFiltersCount}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        }
        
        <FilterModal 
          visible={showModal}
          onClose={() => setShowModal(false)}
          activeFilter={activeFilter}
          onApplyFilters={handleApplyFilters}
          appliedFilters={appliedFilters}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  leftContainer: {
    flex: 1,
    marginRight: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locatingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  scrollWrapper: {
    flex: 1,
    position: 'relative',
  },
  filtersScrollContent: {
    paddingRight: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  selectedFilter: {
    backgroundColor: '#7A5AF8',
    borderColor: '#7A5AF8',
  },
  unselectedFilter: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFilterText: {
    color: '#fff',
  },
  unselectedFilterText: {
    color: '#374151',
  },
  gradientOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  filtermainbox: {
    marginLeft: 8,
  },
  filterbox: {
    position: 'relative',
  },
  filterButton: {
    padding: 0,
  },
  insidemain: {
    position: 'relative',
  },
  filtericons: {
    backgroundColor: '#7A5AF8',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    textAlign: 'center',
    overflow: 'hidden',
  },
});