// app/profile/[userId].jsx
import { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SafeWrapper from '../../services/Safewrapper';

const { width } = Dimensions.get('window');
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const UserProfilePage = () => {
  const { id } = useLocalSearchParams();
  const userId = id;
  const router = useRouter();
  const currentUser = useSelector((state) => state.user.userData);
  
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollY = new Animated.Value(0);

  // Fetch user profile details
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/users/${userId}`);
        setUserProfile(response.data.user);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await axios.get(`${apiUrl}/api/users/${userId}/posts`);
        setUserPosts(response.data.posts);
      } catch (err) {
        console.error('Error fetching user posts:', err);
      } finally {
        setPostsLoading(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  const handleBackPress = () => {
    router.back();
  };

  const handlePostPress = (id, category) => {
    const routes = {
      pg_hostel: '/pg-hostel/[id]',
      shared: '/shared/[id]',
      flat_home: '/RentalHomes/[id]',
    };

    const path = routes[category];
    if (path) router.push({ pathname: path, params: { id } });
  };

  const renderPostCard = ({ item, index }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => handlePostPress(item._id, item.category)}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.images?.[0]?.originalUrl || item.thumbnail?.url }}
          style={styles.postImage}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {item.category === 'pg_hostel' ? 'PG/Hostel' : 
             item.category === 'shared' ? 'Shared' : 'Flat/Home'}
          </Text>
        </View>
      </View>
      
      <View style={styles.postDetails}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#7A5AF8" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location?.fullAddress}
          </Text>
        </View>

        <View style={styles.postFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₹{item.monthlyRent || item.priceRange?.min}</Text>
            <Text style={styles.perMonth}>/mo</Text>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={12} color="#999" />
              <Text style={styles.metaText}>{item.views || 0}</Text>
            </View>
            
            <View style={styles.metaDot} />
            
            <Text style={styles.postDate}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A5AF8" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeWrapper>
    );
  }

  if (error || !userProfile) {
    return (
      <SafeWrapper>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Feather name="alert-circle" size={48} color="#FF6B6B" />
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error || 'User not found'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBackPress}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeWrapper>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <>
      <StatusBar style="dark" />
      <SafeWrapper>
        <View style={styles.container}>
          {/* Animated Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
              <Feather name="arrow-left" size={22} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{userProfile.name}</Text>
            <View style={{ width: 40 }} />
          </Animated.View>

          <Animated.ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {/* Hero Profile Section */}
            <LinearGradient
              colors={['#F8F7FF', '#FFFFFF']}
              style={styles.heroSection}
            >
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Feather name="arrow-left" size={22} color="#333" />
              </TouchableOpacity>

              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: userProfile.picture }}
                  style={styles.profileImage}
                />
              </View>

              <Text style={styles.userName}>{userProfile.name}</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="home-city" size={20} color="#7A5AF8" />
                  <Text style={styles.statValue}>{userPosts.length}</Text>
                  <Text style={styles.statLabel}>Active Listings</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statCard}>
                  <Ionicons name="calendar-outline" size={20} color="#7A5AF8" />
                  <Text style={styles.statValue}>
                    {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.statLabel}>Member Since</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Posts Section */}
            <View style={styles.postsSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Property Listings</Text>
                  <Text style={styles.sectionSubtitle}>
                    {userPosts.length} {userPosts.length === 1 ? 'listing' : 'listings'} available
                  </Text>
                </View>
              </View>
              
              {postsLoading ? (
                <View style={styles.postsLoadingContainer}>
                  <ActivityIndicator size="large" color="#7A5AF8" />
                  <Text style={styles.loadingSubtext}>Loading listings...</Text>
                </View>
              ) : userPosts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <MaterialCommunityIcons name="home-search-outline" size={64} color="#E0E0E0" />
                  </View>
                  <Text style={styles.emptyTitle}>No Listings Yet</Text>
                  <Text style={styles.emptyText}>
                    This user hasn't posted any properties yet
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={userPosts}
                  renderItem={renderPostCard}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.postsList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            <View style={styles.bottomPadding} />
          </Animated.ScrollView>
        </View>
      </SafeWrapper>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#7A5AF8',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#7A5AF8',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  postsSection: {
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  postsLoadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  postsList: {
    paddingBottom: 16,
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: 130,
    height: 130,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(122, 90, 248, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  postDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    marginLeft: 4,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7A5AF8',
  },
  perMonth: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 3,
    fontWeight: '500',
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CCC',
    marginHorizontal: 6,
  },
  postDate: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});

export default UserProfilePage;