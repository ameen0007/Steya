import React, { useState, useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  TextInput,
  ActivityIndicator,
  AppState,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { showToast } from '../services/ToastService';
import api from '../services/intercepter';
import { useSelector } from 'react-redux';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const DonationButton = ({ amount: defaultAmount, onSuccess, visible = false, onClose }) => {
  const [showModal, setShowModal] = useState(visible);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount || 50);
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const user = useSelector((state) => state.user.userData);

  const MIN_AMOUNT = 10;
  const MAX_AMOUNT = 50000;
  const quickAmounts = [50, 100, 200, 500];

  useEffect(() => {
    setShowModal(visible);
  }, [visible]);

  useEffect(() => {
    if (paymentStatus === 'success') {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [paymentStatus]);

  // Listen for app state changes (when user returns from payment)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && pendingOrderId && !verifying) {
        verifyPaymentWithRetry(pendingOrderId);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [pendingOrderId, verifying]);

  const handleDirectPay = async () => {
    try {
      setLoading(true);
      
      const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;
      
      // ✅ Validate amount
      if (!finalAmount || finalAmount < MIN_AMOUNT) {
        setAmountError(`Minimum amount is ₹${MIN_AMOUNT}`);
        setLoading(false);
        return;
      }

      if (finalAmount > MAX_AMOUNT) {
        setAmountError(`Maximum ₹${MAX_AMOUNT.toLocaleString('en-IN')}`);
        setLoading(false);
        return;
      }

      setAmountError('');
      setPaymentStatus(null);

      const response = await api.post(`${apiUrl}/api/payment/create-order`, {
        amount: finalAmount,
      });

      if (response.data.success) {
        const { orderId, amount, keyId } = response.data;
        
        setPendingOrderId(orderId);
        setLoading(false);
        handleClose();
        
        // ✅ Razorpay Checkout - Completely empty prefill to skip ALL prompts
        const options = {
          description: 'Support Steya',
        
          currency: 'INR',
          key: keyId,
          amount: amount,
          order_id: orderId,
          name: 'Steya',
  //        prefill: {
  //   email: 'donation@steya.com',    // Fixed dummy email
  //   contact: '8848683518',          // Fixed dummy number
  //   name: 'Steya Supporter'
  // },
          theme: { color: '#7A5AF8' },
        };

        RazorpayCheckout.open(options)
          .then((data) => {
            verifyPaymentWithRetry(orderId);
          })
          .catch((error) => {
            setPendingOrderId(null);
            if (error.code === 2) {
              showToast('Payment cancelled');
            } else {
              setPaymentStatus('failed');
            }
          });
        
      } else {
        setLoading(false);
        showToast('Failed to create order');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      showToast('Payment failed. Please try again.');
    }
  };

  const verifyPaymentWithRetry = async (orderId, retryCount = 0) => {
    try {
      setVerifying(true);

      const verifyResponse = await api.post(`${apiUrl}/api/payment/verify`, {
        orderId: orderId,
      });

      if (verifyResponse.data.isSuccess) {
        // Payment SUCCESS! 🎉
        setPaymentStatus('success');
        setPendingOrderId(null);
        setVerifying(false);
        
        setTimeout(() => {
          if (onSuccess) onSuccess();
          setPaymentStatus(null);
          scaleAnim.setValue(0);
          rotateAnim.setValue(0);
        }, 3000);
        
      } else if (verifyResponse.data.isFailed) {
        // Payment FAILED
        setPaymentStatus('failed');
        setPendingOrderId(null);
        setVerifying(false);
        
      } else if (verifyResponse.data.isPending) {
        // Still pending - retry
        if (retryCount < 8) { // Reduced retries from 10 to 8
          setTimeout(() => {
            verifyPaymentWithRetry(orderId, retryCount + 1);
          }, 2000);
        } else {
          setVerifying(false);
          setPendingOrderId(null);
          showToast('Payment verification taking longer than expected');
        }
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      
      if (retryCount < 3) { // Reduced retries from 5 to 3
        setTimeout(() => {
          verifyPaymentWithRetry(orderId, retryCount + 1);
        }, 3000);
      } else {
        setVerifying(false);
        setPendingOrderId(null);
        showToast('Unable to verify payment');
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setCustomAmount('');
    setSelectedAmount(defaultAmount || 50);
    setAmountError('');
    if (onClose) onClose();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Support Steya 💜</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              Your support helps keep Steya free for everyone!
            </Text>

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

            <View style={styles.trustBox}>
              <View style={styles.trustItem}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.trustText}>Secured by Razorpay</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="flash" size={16} color="#10B981" />
                <Text style={styles.trustText}>Instant</Text>
              </View>
            </View>

            {/* <View style={styles.instructionBox}>
              <Ionicons name="information-circle" size={16} color="#7A5AF8" />
              <Text style={styles.instructionText}>
                Pay using UPI/Card/Wallet → Auto-verified instantly!
              </Text>
            </View> */}

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
                  <Ionicons name="card" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    Donate ₹{customAmount || selectedAmount || 0}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Verification Modal */}
      <Modal
        visible={verifying}
        transparent
        animationType="fade"
      >
        <View style={styles.verifyOverlay}>
          <View style={styles.verifyContent}>
            <ActivityIndicator size="large" color="#7A5AF8" />
            <Text style={styles.verifyText}>Verifying Payment...</Text>
            <Text style={styles.verifySubText}>Please wait</Text>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={paymentStatus === 'success'}
        transparent
        animationType="fade"
      >
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <Animated.View
              style={[
                styles.successCircle,
                {
                  transform: [
                    { scale: scaleAnim },
                    { rotate: rotate },
                  ],
                },
              ]}
            >
              <Ionicons name="checkmark" size={60} color="#FFFFFF" />
            </Animated.View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successMessage}>
              🎉 Thank you for supporting Steya! 💜
            </Text>
            <Text style={styles.successSubtext}>
              Your contribution helps keep Steya free for everyone
            </Text>
           
          </View>
        </View>
      </Modal>

      {/* Failed Modal */}
      <Modal
        visible={paymentStatus === 'failed'}
        transparent
        animationType="fade"
      >
        <View style={styles.failedOverlay}>
          <View style={styles.failedContent}>
            <View style={styles.failedCircle}>
              <Ionicons name="close" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.failedTitle}>Payment Failed</Text>
            <Text style={styles.failedMessage}>
              No amount was deducted from your account.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setPaymentStatus(null);
                setShowModal(true);
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeFailedButton}
              onPress={() => setPaymentStatus(null)}
            >
              <Text style={styles.closeFailedText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#000' },
  description: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 10 },
  quickAmounts: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  amountChip: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', alignItems: 'center' },
  amountChipSelected: { borderColor: '#7A5AF8', backgroundColor: '#F3F0FF' },
  amountChipText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  amountChipTextSelected: { color: '#7A5AF8' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 2, borderColor: '#E5E7EB', paddingHorizontal: 16, marginBottom: 20 },
  rupeeSymbol: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, fontWeight: '600', color: '#000' },
  selectedAmountBox: { backgroundColor: '#F3F0FF', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  selectedAmountLabel: { fontSize: 12, color: '#6B21A8', marginBottom: 4 },
  selectedAmountValue: { fontSize: 32, fontWeight: '700', color: '#7A5AF8' },
  amountError: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  amountErrorText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  trustBox: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#ECFDF5', padding: 12, borderRadius: 10, marginBottom: 12 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { fontSize: 11, color: '#047857', fontWeight: '500' },
  instructionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F0FF', padding: 12, borderRadius: 10, marginBottom: 16, gap: 8 },
  instructionText: { flex: 1, fontSize: 12, color: '#6B21A8', lineHeight: 16 },
  primaryButton: { backgroundColor: '#7A5AF8', paddingVertical: 14, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  primaryButtonDisabled: { backgroundColor: '#D1D5DB' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cancelButton: { paddingVertical: 10, alignItems: 'center' },
  cancelText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  
  verifyOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
  verifyContent: { backgroundColor: '#FFFFFF', padding: 40, borderRadius: 20, alignItems: 'center', minWidth: 220 },
  verifyText: { fontSize: 18, fontWeight: '600', color: '#000', marginTop: 16 },
  verifySubText: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  
  successOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
  successContent: { backgroundColor: '#FFFFFF', padding: 40, borderRadius: 24, alignItems: 'center', width: '85%', maxWidth: 400 },
  successCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  successTitle: { fontSize: 28, fontWeight: '700', color: '#000', marginBottom: 8 },
  successMessage: { fontSize: 18, color: '#6B7280', textAlign: 'center', marginBottom: 8, lineHeight: 24 },
  successSubtext: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  successAmount: { fontSize: 22, fontWeight: '700', color: '#7A5AF8', marginTop: 8, backgroundColor: '#F3F0FF', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 12 },
  
  failedOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
  failedContent: { backgroundColor: '#FFFFFF', padding: 40, borderRadius: 24, alignItems: 'center', width: '85%', maxWidth: 400 },
  failedCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  failedTitle: { fontSize: 26, fontWeight: '700', color: '#000', marginBottom: 8 },
  failedMessage: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  retryButton: { backgroundColor: '#7A5AF8', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginBottom: 12, width: '100%' },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  closeFailedButton: { paddingVertical: 10 },
  closeFailedText: { color: '#6B7280', fontSize: 15, fontWeight: '500' },
});