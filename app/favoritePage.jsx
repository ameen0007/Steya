import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';

// Import your existing card components
import SharedCard from '../componets/sharecard';
import PGCard from '../componets/pgcard';
import FlatCard from '../componets/flatcard';
import SafeWrapper from '../services/Safewrapper';
import api from '../services/intercepter';
import { showToast } from '../services/ToastService';
import ProtectedRoute from './protectedroute';

const { width, height } = Dimensions.get('window');

const FavoritesScreen = () => {
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const user = useSelector((state) => state.user.userData);
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's favorites
  const fetchFavorites = async () => {
    console.log(apiUrl,'apiUrl-----------');
         if (!user?._id) {
   
     
      return; 
    }
    try {
      setError(null);
      const response = await api.get(`${apiUrl}/api/my-favorites`);
      console.log('Favorites response:', response.data.favorites);
      if (response.data.success) {
        const favoritesData = response.data.favorites || [];
        
        // Extract rooms from favorites and add favoriteId for removal
        const roomsWithFavoriteId = favoritesData.map(fav => ({
          ...fav,
          favoriteId: fav._id,
          isFavorited: true // Always true since these are favorites
        }));
        
        setFavorites(roomsWithFavoriteId);
      } else {
        setError('Failed to load favorites');
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (roomId, favoriteId) => {
         if (!user?._id) {
      // console.log("⚠️ User not logged in, skipping favorite check");
      return; // <-- must be inside braces
    }
    try {
      const response = await api.delete(`${apiUrl}/api/remove`, {
        data: { roomId }
      });

      if (response.data.success) {
        // Remove from local state
        setFavorites(prev => prev.filter(item => item._id !== roomId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      showToast("Failed to remove from favorites")
    }
  };

  // Toggle favorite (for consistency with HomeScreen)
  const toggleFavorite = async (roomId) => {
    await removeFromFavorites(roomId);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
  };

  const retryFetch = async () => {
    setLoading(true);
    setError(null);
    await fetchFavorites();
  };

  // Render appropriate card based on category
  const renderItem = ({ item }) => {
    const cardProps = {
      data: item,
      activeFilter: 'All',
      isFavorited: true,
      onToggleFavorite: toggleFavorite
    };

    console.log(item,"item.category-----------");

    let cardComponent;
    switch (item.category) {
      case 'shared':
        cardComponent = <SharedCard {...cardProps} />;
        break;
      case 'pg_hostel':
        cardComponent = <PGCard {...cardProps} />;
        break;
      case 'flat_home':
        cardComponent = <FlatCard {...cardProps} />;
        break;
    }

    return (
      <View style={styles.cardWrapper}>
        {cardComponent}
      </View>
    );
  };

  // Classy Empty State
  const EmptyFavorites = () => (
    <ProtectedRoute>
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.emptyIconBackground}>
          <Ionicons name="heart-outline" size={70} color="#7A5AF8" />
        </View>
      </View>
      
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Rooms you love will appear here. Start exploring to find your perfect match.
      </Text>
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/')}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.exploreButtonText}>Browse Rooms</Text>
      </TouchableOpacity>
    </View>
    </ProtectedRoute>
  );

  // Classy Loading State
  if (loading) {
    return (
          <ProtectedRoute>
      <SafeWrapper>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingIcon}>
              <Ionicons name="heart" size={50} color="#7A5AF8" />
              <ActivityIndicator size="large" color="#7A5AF8" style={styles.loadingSpinner} />
            </View>
            <Text style={styles.loadingTitle}>Loading Favorites</Text>
            <Text style={styles.loadingSubtitle}>Getting your saved rooms ready</Text>
          </View>
        </View>
      </SafeWrapper>
      </ProtectedRoute>
    );
  }

  // Classy Error State
  if (error && !loading) {
    return (
      <ProtectedRoute>
      <SafeWrapper>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <View style={styles.errorIcon}>
              <Ionicons name="warning" size={50} color="#FF4757" />
            </View>
            <Text style={styles.errorTitle}>Unable to Load</Text>
            <Text style={styles.errorSubtitle}>
              We encountered an issue loading your favorites.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={retryFetch}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeWrapper>
      </ProtectedRoute>
    );
  }

  return (
     <ProtectedRoute>
    <SafeWrapper>
      <StatusBar style="dark" />
      
      {/* Classy Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#7A5AF8', '#8E6AFB']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Favorites</Text>
              <Text style={styles.headerSubtitle}>
                {favorites.length} {favorites.length === 1 ? 'saved room' : 'saved rooms'}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statsBadge}>
                <Text style={styles.statsText}>{favorites.length}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Favorites List */}
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => `fav-${item._id}`}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7A5AF8"
            colors={['#7A5AF8']}
          />
        }
        ListEmptyComponent={EmptyFavorites}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeWrapper>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Classy Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIcon: {
    position: 'relative',
    marginBottom: 30,
  },
  loadingSpinner: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
  },
  loadingTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Classy Error Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    marginBottom: 25,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#7A5AF8',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  // Classy Header Styles
  headerContainer: {
    backgroundColor: '#7A5AF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
  },
  headerGradient: {
  
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
  },
  statsContainer: {
    padding: 4,
  },
  statsBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  // List Styles
  listContent: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 8,
    minHeight: height - 180,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardWrapper: {
    marginBottom: 12,
  },
  separator: {
    height: 8,
  },
  // Classy Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIconContainer: {
    marginBottom: 30,
  },
  emptyIconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9E5FF',
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: '#7A5AF8',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
});

export default FavoritesScreen;