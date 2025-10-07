import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useSelector } from 'react-redux';
import api from '../services/intercepter';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const DonationButton = ({ 
  amount = 100, 
  currency = 'INR', 
  description = 'Donation to support Steya',
  onSuccess,
  onError 
}) => {
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.userData);

  const handleDonation = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create order on backend
      const orderResponse = await api.post(
        `${API_URL}/api/create-order`,
        { amount: amount * 100, currency },
      );

      const orderData = orderResponse.data;

      if (!orderData.success) throw new Error(orderData.message || 'Failed to create order');

      // 2️⃣ Open Razorpay Checkout
      const options = {
        description,
        image: '',
        currency,
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        name: 'Steya',
        order_id: orderData.order.id,
        prefill: {
          email: user?.email || 'user@example.com',
          contact: user?.phone || '8848683518',
          name: user?.name || user?.username || 'Steya User',
        },
        theme: { color: '#7A5AF8' },
        notes: { platform: 'steya-app', userId: user?._id || 'anonymous' }
      };

      const paymentData = await RazorpayCheckout.open(options);
      console.log('Payment Success:', paymentData);

      // 3️⃣ Send paymentId, orderId, AND signature to backend
      await verifyPayment(
        paymentData.razorpay_payment_id,
        paymentData.razorpay_order_id,
        paymentData.razorpay_signature
      );

      if (onSuccess) onSuccess(paymentData);
      Alert.alert('Success', 'Thank you for your donation! 🥰');

    } catch (error) {
      console.log('Payment Error:', error);
      if (error.code !== 2) {
        Alert.alert('Payment Failed', error.description || 'Payment was not completed. Please try again.');
      }
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId, orderId, signature) => {
    try {
      const response = await api.post(
        `${API_URL}/api/verify-payment`,
        { paymentId, orderId, signature } // <-- include signature
      );

      const verificationData = response.data;
      if (!verificationData.success) throw new Error('Payment verification failed');

      console.log('Payment verified successfully');
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  };

  return (
    <TouchableOpacity
      style={styles.donateButton}
      onPress={handleDonation}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.donateButtonText}>Support Steya with ₹{amount} </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  donateButton: {
    backgroundColor: '#7A5AF8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  donateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DonationButton;
