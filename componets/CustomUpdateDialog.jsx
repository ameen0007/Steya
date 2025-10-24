import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CustomUpdateDialog = ({
  visible,
  onUpdate,
  onLater,
  version = '1.0.1',
  updateType = 'flexible', // 'flexible' or 'immediate'
  features = [], // Array of new features
}) => {
  const isMandatory = updateType === 'immediate';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={isMandatory ? null : onLater}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon/Illustration */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#7A5AF8', '#9D7FFA']}
              style={styles.iconGradient}
            >
              <Ionicons name="rocket" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isMandatory ? 'Update Required' : 'Update Available'}
          </Text>

          {/* Version */}
          <Text style={styles.version}>Version {version}</Text>

          {/* Description */}
          <Text style={styles.description}>
            {isMandatory
              ? 'This update is required to continue using Steya. We\'ve made important improvements for a better experience.'
              : 'We\'ve added some exciting new features and improvements to make your experience even better!'}
          </Text>

          {/* Features List */}
          {features.length > 0 && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What's New:</Text>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#7A5AF8" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Update Button */}
            <TouchableOpacity
              style={styles.updateButton}
              onPress={onUpdate}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7A5AF8', '#9D7FFA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.updateButtonGradient}
              >
                <Text style={styles.updateButtonText}>
                  {isMandatory ? 'Update Now' : 'Update'}
                </Text>
                <Ionicons name="download" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Later Button (only for flexible) */}
            {!isMandatory && (
              <TouchableOpacity
                style={styles.laterButton}
                onPress={onLater}
                activeOpacity={0.7}
              >
                <Text style={styles.laterButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Mandatory Update Notice */}
          {isMandatory && (
            <Text style={styles.mandatoryNotice}>
              ⚠️ This update is required to continue
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: width - 60,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7A5AF8',
    marginBottom: 16,
    backgroundColor: '#F8F9FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: '#F8F9FE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  buttonsContainer: {
    width: '100%',
  },
  updateButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#7A5AF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  laterButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '600',
  },
  mandatoryNotice: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CustomUpdateDialog;