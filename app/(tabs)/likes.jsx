import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,

 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
const { width, height } = Dimensions.get('window');

export default function MyAds() {
  // Sample data for different ad types
  const [ads, setAds] = useState([
    {
      _id: "1",
      category: "shared",
      title: "Spacious Shared Room for Bachelors near Infopark, Kochi.",
      description: "Well-ventilated, fully furnished shared room available for male bachelors near Infopark. Includes high-speed Wi-Fi, washing machine, refrigerator, and 24x7 water supply. Gated building with CCTV security. Just 5 mins walk to bus stop and shops. Peaceful neighborhood, ideal for IT professionals.",
      images: [
        "https://images.squarespace-cdn.com/content/v1/56dfd5cc9f7266ed7f04b64d/1585743751085-N2317B7K3I2YBZHPHENO/image-asset.jpeg",
        "https://images.squarespace-cdn.com/content/v1/56dfd5cc9f7266ed7f04b64d/1585743749675-UQS61BCNTIARPMQNRA4Y/image-asset.jpeg",
        "https://images.nobroker.in/images/8a9f8503904a58bb01904a66d1f80339/8a9f8503904a58bb01904a66d1f80339_70592_500210_medium.jpg"
      ],
      location: {
        district: "Ernakulam",
        fullAddress: "Kakkanad, Kochi",
        state: "Kerala",
        latitude: 9.9675,
        longitude: 76.2999
      },
      contactPhone: "+91-9999999999",
      showPhonePublic: true,
      monthlyRent: 4000,
      roommatesWanted: 1,
      genderPreference: "male",
      habitPreferences: ["Non-Smoker", "Fitness Focused", "Clean & Organized", "Respects Privacy"],
      purpose: ["Any Purpose"],
      createdAt: "2025-05-01T08:00:00.000Z",
      postedBy: {
        name: "Arjun R",
        profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    },
    {
      _id: "4",
      category: "pg_hostel",
      title: "Green Nest Ladies PG – Near Lulu Mall, Edappally",
      description: "Premium ladies-only PG just 5 minutes from Lulu Mall and Edappally Metro Station. Fully furnished AC/non-AC rooms with attached bathrooms, high-speed Wi-Fi, and 24/7 security. Rent includes 3 vegetarian meals, laundry, and housekeeping. Ideal for female students and working professionals. Rent starts at ₹7,500/month.",
      images: [
        "https://content3.jdmagicbox.com/comp/ernakulam/q4/0484px484.x484.210104164018.f1q4/catalogue/flamingos-ladies-hostel-cochin-special-economic-zone-ernakulam-hostels-lg1cd6ac74.jpg",
        "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_auto,w_600/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1663822622/Website/CMS-Uploads/c6hdh58d28xmmver5f3d.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_kAL3obhSyNxk2i2TBLdak9Z7eadNGl7ev4IOl0-dSXd6eLidTq_BSmJUycAQObq5-w8&usqp=CAU"
      ],
      AvailableSpace: "6",
      location: {
        fullAddress: "Calicut Beach, Kozhikode",
        district: "Kozhikode",
        state: "Kerala",
        latitude: 11.2588,
        longitude: 75.7804
      },
      priceRange: { min: 6000, max: 8000 },
      pgGenderCategory: "ladies",
      roomTypesAvailable: ["single", "double"],
      mealsProvided: ["breakfast", "dinner"],
      amenities: ["wifi", "ac", "hot_water"],
      rules: ["no_pet", "No Alcohol", "No Smoking Inside", "Respect Privacy"],
      createdAt: "2025-04-29T14:00:00.000Z",
      contactPhone: "+91 9876543210",
      showPhonePublic: true,
      postedBy: {
        name: "Zainal Nizar",
        profileImage: "https://randomuser.me/api/portraits/men/61.jpg"
      }
    },
    {
      _id: "6",
      category: "flat_home",
      title: "2BHK Fully Furnished Flat near Kakkanad – Family-Friendly",
      description: "Spacious and well-lit 2BHK flat available for rent in a peaceful residential area near Kakkanad, Kochi. Ideal for small families or working couples. The apartment is fully furnished with sofa, dining table, double beds, wardrobes, fridge, washing machine, and modular kitchen. Located in a gated society with 24/7 security, lift, power backup, and covered parking.",
      images: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ0Jj-ej-IUUuFOUC28LXmhYfXrL3HttWa0g&s",
        "https://5.imimg.com/data5/SELLER/Default/2024/1/375486950/CM/VQ/OZ/10335204/furnished-rental-house-for-1-month-in-athirampuzha-near-caritas-hospital.jpeg",
        "https://4.imimg.com/data4/CT/HX/ANDROID-58662519/product-500x500.jpeg"
      ],
      location: {
        fullAddress: "Panampilly Nagar, Kochi",
        district: "Ernakulam",
        state: "Kerala",
        latitude: 9.9561,
        longitude: 76.2998
      },
      propertyType: "flat",
      furnishedStatus: "furnished",
      securityDeposit: 15000,
      squareFeet: 950,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      floorNumber: 2,
      totalFloors: 5,
      tenantPreference: "family",
      parking: "four_wheeler",
      createdAt: "2025-04-28T17:20:00.000Z",
      contactPhone: "+91 9876543210",
      showPhonePublic: true,
      postedBy: {
        name: "Rishan Jose",
        profileImage: "https://randomuser.me/api/portraits/men/57.jpg"
      },
      monthlyRent: 12000
    }
  ]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'shared':
        return 'people';
      case 'pg_hostel':
        return 'business';
      case 'flat_home':
        return 'home';
      default:
        return 'location';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'shared':
        return 'Shared Room';
      case 'pg_hostel':
        return 'PG/Hostel';
      case 'flat_home':
        return 'Flat/Home';
      default:
        return 'Property';
    }
  };

  const getCategoryGradient = (category) => {
    switch (category) {
      case 'shared':
        return ['#7A5AF8', '#9B7DF7'];
      case 'pg_hostel':
        return ['#FF6B6B', '#FF8E8E'];
      case 'flat_home':
        return ['#4ECDC4', '#6ED5D0'];
      default:
        return ['#7A5AF8', '#9B7DF7'];
    }
  };

  const handleEdit = (adId) => {
    Alert.alert('Edit Ad', `Edit functionality for ad ${adId} would be implemented here.`);
  };

  const handleDelete = (adId) => {
    Alert.alert(
      'Delete Ad',
      'Are you sure you want to delete this ad?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAds(ads.filter(ad => ad._id !== adId));
          }
        }
      ]
    );
  };

  const handlePromote = (adId) => {
    Alert.alert('Promote Ad', `Promote functionality for ad ${adId} would be implemented here.`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

const StickyHeader = () => {
  return (
    ads.length === 3 && (
      <View style={styles.stickyHeaderContainer}>
        <LinearGradient
          colors={['#7A5AF8', '#9B7DF7', '#B998F5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.stickyHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.stickyHeaderTitle}>My Ads</Text>
              <View style={styles.listingBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.listingCount}>
                  {ads.length} Active Listings
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="add-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    )
  );
};


  if (ads.length <0 ) {
    return (
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
          <Text style={styles.emptyTitle}>No Ads Posted Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by posting your first rental property or shared accommodation to reach potential tenants
          </Text>
          <TouchableOpacity style={styles.createAdButton}>
            <LinearGradient
              colors={['#7A5AF8', '#9B7DF7']}
              style={styles.createAdButtonGradient}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.createAdButtonText}>Post Your First Ad</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <StatusBar style="dark" />
      <StickyHeader />
      
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ads.map((ad, index) => (
          <View key={ad._id} style={[styles.adCard, { marginTop: index === 0 ? 20 : 16 }]}>
            <View style={styles.adHeader}>
              <LinearGradient
                colors={getCategoryGradient(ad.category)}
                style={styles.categoryTag}
              >
                <Ionicons
                  name={getCategoryIcon(ad.category)}
                  size={14}
                  color="white"
                />
                <Text style={styles.categoryText}>
                  {getCategoryLabel(ad.category)}
                </Text>
              </LinearGradient>
              
              <View style={styles.adActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(ad._id)}
                >
                  <Ionicons name="create-outline" size={18} color="#7A5AF8" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(ad._id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.imageContainer}>
              <Image source={{ uri: ad.images[0] }} style={styles.adImage} />
              <View style={styles.imageOverlay}>
                <View style={styles.statusBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.adContent}>
              <Text style={styles.adTitle} numberOfLines={2}>
                {ad.title}
              </Text>
              
              <View style={styles.locationRow}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location-outline" size={16} color="#7A5AF8" />
                </View>
                <Text style={styles.locationText} numberOfLines={1}>
                  {ad.location.fullAddress}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    ₹{ad.monthlyRent || ad.priceRange?.min || 'Contact'}
                  </Text>
                  <Text style={styles.priceLabel}>/month</Text>
                </View>
                {ad.roommatesWanted && (
                  <View style={styles.roommatesTag}>
                    <Text style={styles.roommatesText}>
                      {ad.roommatesWanted} needed
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#999" />
                  <Text style={styles.dateText}>
                    {formatDate(ad.createdAt)}
                  </Text>
                </View>
                
                <View style={styles.viewsContainer}>
                  <Ionicons name="eye-outline" size={14} color="#999" />
                  <Text style={styles.viewsText}>124 views</Text>
                </View>
              </View>
            </View>

            <View style={styles.adFooter}>
              <TouchableOpacity
                style={styles.promoteButton}
                onPress={() => handlePromote(ad._id)}
              >
                <LinearGradient
                  colors={['#FFE082', '#FFB74D']}
                  style={styles.promoteButtonGradient}
                >
                  <Ionicons name="trending-up" size={16} color="#F57C00" />
                  <Text style={styles.promoteButtonText}>Boost Ad</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={16} color="#7A5AF8" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.statsButton}>
                <Ionicons name="analytics-outline" size={16} color="#666" />
                <Text style={styles.statsButtonText}>Stats</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addNewButton}>
          <LinearGradient
            colors={['#7A5AF8', '#9B7DF7']}
            style={styles.addNewButtonGradient}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addNewButtonText}>Post New Ad</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  stickyHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  stickyHeader: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 20,
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
  },
  headerLeft: {
    flex: 1,
  },
  stickyHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  listingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  listingCount: {
    fontSize: 14,
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 12,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 120,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  adCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 0,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  imageContainer: {
    position: 'relative',
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  adImage: {
    width: '100%',
    height: 220,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  adContent: {
    padding: 20,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7A5AF8',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  roommatesTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roommatesText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    fontWeight: '500',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    fontWeight: '500',
  },
  adFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 8,
  },
  promoteButton: {
    flex: 1,
  },
  promoteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  promoteButtonText: {
    color: '#F57C00',
    fontWeight: '700',
    fontSize: 14,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F0F0FF',
    borderRadius: 12,
    gap: 6,
  },
  shareButtonText: {
    color: '#7A5AF8',
    fontWeight: '600',
    fontSize: 14,
  },
  statsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    gap: 6,
  },
  statsButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  addNewButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addNewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  addNewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  createAdButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  createAdButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  createAdButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});