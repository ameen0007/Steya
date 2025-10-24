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
import { useRouter } from 'expo-router';
import SafeWrapper from '../services/Safewrapper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const CategorySelectionScreen = () => {
  const router = useRouter();

  const categories = [
    {
      id: 'shared',
      title: 'Shared Room',
      subtitle: 'Perfect for roommates and shared living',
      route: '/sharedroomform',
      gradient: ['#9C7FFB', '#7A5AF8'],
      iconColor: '#7A5AF8',
      icon: 'people',
    },
    {
      id: 'pg_hostel',
      title: 'PG / Hostel',
      subtitle: 'Ideal for students and professionals',
      route: '/pghostelform',
      gradient: ['#FF8787', '#FF6B6B'],
      iconColor: '#FF6B6B',
      icon: 'business-sharp',
    },
    {
      id: 'flat_home',
      title: 'Flat / Home',
      subtitle: 'Complete properties for comfortable living',
      route: '/homeform',
      gradient: ['#8EEDE7', '#6ED5D0'],
      iconColor: '#6ED5D0',
      icon: 'home-city',
    },
  ];

  const handleCategorySelect = (category) => {
    router.push(category.route); 
  };

  const getCategoryIcon = (category) => {
    const iconColor = category.iconColor;
    if (category.id === 'flat_home') {
      return <MaterialCommunityIcons name={category.icon} size={26} color={iconColor} />;
    }
    return <Ionicons name={category.icon} size={26} color={iconColor} />;
  };

  return (
    <SafeWrapper>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()} 
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Post Your Room</Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Enhanced Heading */}
          <View style={styles.headingContainer}>
            <View style={styles.iconBadge}>
              <Ionicons name="home" size={22} color="#7A5AF8" />
            </View>
            <Text style={styles.mainHeading}>What type of place{'\n'}are you listing?</Text>
            <Text style={styles.subText}>
              Choose a category below to get started
            </Text>
          </View>

          {/* Enhanced Category Cards */}
          <View style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { marginTop: index === 0 ? 0 : 14 }
                ]}
                onPress={() => handleCategorySelect(category)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={category.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardOverlay} />
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      {getCategoryIcon(category)}
                    </View>
                    
                    <View style={styles.textContainer}>
                      <Text style={styles.categoryTitle}>{category.title}</Text>
                      <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                    </View>
                    
                    <View style={styles.arrowContainer}>
                      <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
                    </View>
                  </View>
                  
                  {/* Decorative circles */}
                  <View style={styles.decorativeCircle1} />
                  <View style={styles.decorativeCircle2} />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Info */}
          <View style={styles.bottomInfo}>
            <Ionicons name="information-circle-outline" size={20} color="#999999" />
            <Text style={styles.bottomText}>
              You can edit all details after selecting a category
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </SafeWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headingContainer: {
    marginTop: 24,
    marginBottom: 28,
    alignItems: 'center',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  categoriesContainer: {
    flex: 1,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardGradient: {
    padding: 24,
    paddingVertical: 26,
    position: 'relative',
    overflow: 'hidden',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  categorySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  arrowContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: -25,
    right: -25,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -12,
    left: -12,
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  bottomText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default CategorySelectionScreen;