import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { showInfoToast, showToast } from '../services/ToastService';

export const DonationButton = ({ amount: defaultAmount, onSuccess, visible = false, onClose }) => {
  const [showModal, setShowModal] = useState(visible);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount || 50);
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState('');

  // Sync with parent visibility prop
  useEffect(() => {
    setShowModal(visible);
  }, [visible]);

  // Your UPI Details
  const UPI_ID = 'ameencrews-1@okicici';
  const PAYEE_NAME = 'Steya';
  
  // Donation limits
  const MIN_AMOUNT = 10;
  const MAX_AMOUNT = 50000;
  
  // Predefined amounts (changed default from 100 to 50)
  const quickAmounts = [50, 100, 200, 500];

  // UPI Apps with real icons
  const upiApps = [
    { name: 'Google Pay', icon: 'google', iconType: 'font-awesome', color: '#4285F4' },
    { name: 'PhonePe', icon: 'cellphone', iconType: 'material-community', color: '#5F259F' },
    { name: 'Paytm', icon: 'rupee', iconType: 'font-awesome', color: '#002E6E' },
    { name: 'BHIM', icon: 'bank', iconType: 'material-community', color: '#3B82F6' },
  ];

  const handleDirectPay = async () => {
    try {
      setLoading(true);
      
      const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;
      
      // Validate amount
      if (!finalAmount || finalAmount < MIN_AMOUNT) {
        setAmountError(`Please enter at least ₹${MIN_AMOUNT} to continue`);
        setLoading(false);
        return;
      }

      if (finalAmount > MAX_AMOUNT) {
        setAmountError(`Maximum donation amount is ₹${MAX_AMOUNT.toLocaleString('en-IN')}`);
        setLoading(false);
        return;
      }

      setAmountError('');

      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${finalAmount}&cu=INR&tn=Support Steya`;
      
      const supported = await Linking.canOpenURL(upiUrl);
      
      // For emulator/testing - simulate success
      if (__DEV__ && !supported) {
        console.log('Development mode: Simulating payment success');
        
        setTimeout(() => {
          Alert.alert(
            'DEV MODE: Thank You! 💜',
            'This would open UPI app on real device',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Simulate Payment', 
                onPress: () => {
                  handleClose();
                  setTimeout(() => {
                    showToast('Thank you for supporting Steya! 🙏');
                    if (onSuccess) onSuccess();
                  }, 300);
                }
              }
            ]
          );
        }, 500);
        
        setLoading(false);
        return;
      }
      
      if (supported) {
        await Linking.openURL(upiUrl);
        handleClose();
        setTimeout(() => {
          showToast('Thank you for supporting Steya! 🙏');
          if (onSuccess) onSuccess();
        }, 300);
      } else {
        showToast('Please install a UPI app (Google Pay, PhonePe, Paytm)');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showToast('Could not open UPI app');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUPI = async () => {
    await Clipboard.setStringAsync(UPI_ID);
    showToast('UPI ID copied! Paste in any UPI app');
  };

  const handleClose = () => {
    setShowModal(false);
    setCustomAmount('');
    setSelectedAmount(defaultAmount || 50);
    setAmountError('');
    if (onClose) onClose();
  };

  // Helper function to render UPI app icons
  const renderUpiAppIcon = (app) => {
    const { icon, iconType, color, name } = app;
    
    switch (iconType) {
      case 'material-community':
        return <MaterialCommunityIcons name={icon} size={20} color={color} />;
      case 'font-awesome':
        return <FontAwesome name={icon} size={18} color={color} />;
      case 'font-awesome5':
        return <FontAwesome5 name={icon} size={18} color={color} />;
      default:
        return <Ionicons name={icon} size={18} color={color} />;
    }
  };

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Support Steya 💜</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Your support helps keep Steya free for everyone!
          </Text>

          {/* Quick Amount Selection */}
          <Text style={styles.sectionLabel}>Choose Amount</Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.amountChip,
                  selectedAmount === amt && !customAmount && styles.amountChipSelected
                ]}
                onPress={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                  setAmountError('');
                }}
              >
                <Text
                  style={[
                    styles.amountChipText,
                    selectedAmount === amt && !customAmount && styles.amountChipTextSelected
                  ]}
                >
                  ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount Input */}
          <Text style={styles.sectionLabel}>Or Enter Custom Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={customAmount}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9]/g, '');
                setCustomAmount(sanitized);
                if (text) setSelectedAmount(null);
                
                // Clear error if amount becomes valid
                const amount = parseInt(sanitized);
                if (amount >= MIN_AMOUNT && amount <= MAX_AMOUNT) {
                  setAmountError('');
                } else if (amount > MAX_AMOUNT) {
                  setAmountError(`Maximum ₹${MAX_AMOUNT.toLocaleString('en-IN')}`);
                }
              }}
              maxLength={6}
            />
          </View>

          {/* Display Selected Amount */}
          <View style={styles.selectedAmountBox}>
            <Text style={styles.selectedAmountLabel}>Donation Amount</Text>
            <Text style={styles.selectedAmountValue}>
              ₹{customAmount || selectedAmount || 0}
            </Text>
            {amountError ? (
              <View style={styles.amountError}>
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                <Text style={styles.amountErrorText}>{amountError}</Text>
              </View>
            ) : null}
          </View>

          {/* Trust Indicators */}
          <View style={styles.trustBox}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.trustText}>Secure</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="flash" size={16} color="#10B981" />
              <Text style={styles.trustText}>Instant</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="people" size={16} color="#10B981" />
              <Text style={styles.trustText}>Trusted</Text>
            </View>
          </View>

          {/* UPI Apps Info with Real Icons */}
          <View style={styles.upiAppsBox}>
            <Text style={styles.upiAppsLabel}>Works with all UPI apps:</Text>
            <View style={styles.upiAppsList}>
              {upiApps.map((app, index) => (
                <View key={app.name} style={styles.upiAppItem}>
                  {renderUpiAppIcon(app)}
                  <Text style={styles.upiAppName}>{app.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Primary Button - Direct Pay */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!customAmount && !selectedAmount) && styles.primaryButtonDisabled
            ]}
            onPress={handleDirectPay}
            disabled={(!customAmount && !selectedAmount) || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="heart" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  Donate  ₹{customAmount || selectedAmount || 0}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Secondary Button - Copy UPI */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCopyUPI}
          >
            <Ionicons name="copy-outline" size={18} color="#7A5AF8" />
            <Text style={styles.secondaryButtonText}>
              Copy UPI ID ({UPI_ID})
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
          >
            <Text style={styles.cancelText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  amountChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  amountChipSelected: {
    borderColor: '#7A5AF8',
    backgroundColor: '#F3F0FF',
  },
  amountChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  amountChipTextSelected: {
    color: '#7A5AF8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  selectedAmountBox: {
    backgroundColor: '#F3F0FF',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedAmountLabel: {
    fontSize: 12,
    color: '#6B21A8',
    marginBottom: 4,
  },
  selectedAmountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7A5AF8',
  },
  amountError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  amountErrorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  trustBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '500',
  },
  upiAppsBox: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  upiAppsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  upiAppsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upiAppItem: {
    alignItems: 'center',
    gap: 4,
  },
  upiAppName: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#7A5AF8',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F0FF',
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#7A5AF8',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});