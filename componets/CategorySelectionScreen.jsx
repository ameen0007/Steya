import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,

} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Changed from react-navigation
import SafeWrapper from '../services/Safewrapper';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
const CategorySelectionScreen = () => {
  const router = useRouter(); // Use Expo Router instead of React Navigation

  const categories = [
    {
      id: 'shared',
      title: 'Shared Room',
      subtitle: 'Perfect for roommates.',
      route: '/sharedroomform', // Updated route path
      gradient: ['#7A5AF8', '#9C7FFB'],
    },
    {
      id: 'pg_hostel',
      title: 'PG / Hostel',
      subtitle: 'For students or professionals.',
     
      route: '/pghostelform', // Updated route path
      gradient: ['#7A5AF8', '#8B67F7'],
    },
    {
      id: 'flat_home',
      title: 'Flat / Home',
      subtitle: 'Entire properties for rent.',
      route: '/homeform', // Updated route path
      gradient: ['#7A5AF8', '#A187FC'],
    },
  ];

  const handleCategorySelect = (category) => {
  
   
  
    router.push(category.route); 
   
  };

  const getCategoryIcon = (categoryId) => {
  switch (categoryId) {
    case 'shared':
      return <Ionicons name="people" size={24} color="white" />;
    case 'pg_hostel':
      return < Ionicons name="business-sharp" size={24} color="white" />;
    case 'flat_home':
      return <MaterialCommunityIcons name="home-city" size={24} color="white" />;
    default:
      return null;
  }
};

  return (
    <SafeWrapper>
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()} 
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Room</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Heading */}
        <View style={styles.headingContainer}>
          <Text style={styles.mainHeading}> What type of place are you listing?</Text>
          <Text style={styles.subText}>
            We'll customize the form based on your choice to make it easier for you.
          </Text>
        </View>

        {/* Category Cards */}
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { marginTop: index === 0 ? 0 : 16 }
              ]}
              onPress={() => handleCategorySelect(category)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={category.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    
                         {getCategoryIcon(category.id)}
                    
                   
                  </View>
                  
                  <View style={styles.textContainer}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                  </View>
                  
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
    </SafeWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#333333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headingContainer: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },
  subText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    flex: 1,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#7A5AF8',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CategorySelectionScreen;