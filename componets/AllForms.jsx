import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import FormHeader from './FormHeader';
import ProgressBar from './ProgressBar';
import {
  InputField,
  SelectionButton,
  NumberPicker,
  LocationSection,
  ImageUploadSection,
  PhoneInputField,
} from './FormComponents';
import SafeWrapper from '../services/Safewrapper';
import { Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import axios from 'axios';

import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from "expo-file-system";
import api from '../services/intercepter';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

const apiUrl = process.env.EXPO_PUBLIC_API_URL



import { router, useLocalSearchParams } from 'expo-router';

const SharedRoomForm = () => {
  // ✅ Get route parameters
  const params = useLocalSearchParams();
  const roomId = params.roomId;
  const isEdit = params.isEdit === "true";



  const locationData = useSelector((state) => state.location.locationData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: null,
    images: [],
    monthlyRent: '',
    roommatesWanted: 1,
    genderPreference: '',
    habitPreferences: [],
    purpose: [],
    contactPhone: '',
    showPhonePublic: true,
    category: 'shared',
  });

  // ✅ Fetch room data for editing
  useEffect(() => {
    if (isEdit && roomId) {
      fetchRoomData();
    }
  }, [isEdit, roomId]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching room data for: ${roomId}`);

      const response = await api.get(`/api/singleroom/${roomId}`);
      const room = response.data.room;

      // Transform API data to form data
      setFormData({
        title: room.title || '',
        description: room.description || '',
        location: room.location || null,
        images: room.images?.map(img => img.originalUrl) || [],
        monthlyRent: room.monthlyRent?.toString() || '',
        roommatesWanted: room.roommatesWanted || 1,
        genderPreference: room.genderPreference || '',
        habitPreferences: room.habitPreferences || [],
        purpose: room.purpose || [],
        contactPhone: room.contactPhone || '',
        showPhonePublic: room.showPhonePublic ?? true,
        category: room.category || 'shared',
      });

      console.log('✅ Room data loaded successfully');

    } catch (error) {
      console.error('Error fetching room data:', error);
      Alert.alert('Error', 'Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  // Rest of your existing state and options remain the same...
  const genderOptions = [
    { label: 'Male Only', value: 'male' },
    { label: 'Female Only', value: 'female' },
    { label: 'Any Gender', value: 'any' },
  ];

  const habitOptions = [
    { label: 'Non-Smoker', value: 'Non-Smoker' },
    { label: 'Non-Alcoholic', value: 'Non-Alcoholic' },
    { label: 'Early Riser', value: 'Early Riser' },
    { label: 'Night Owl', value: 'Night Owl' },
    { label: 'Fitness Focused', value: 'Fitness Focused' },
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Pet Friendly', value: 'Pet Friendly' },
    { label: 'Quiet Person', value: 'Quiet Person' },
  ];

  const purposeOptions = [
    { label: 'Working Professional', value: 'Working Professional' },
    { label: 'Student', value: 'Student' },
    { label: 'Job Seeker', value: 'Job Seeker' },
    { label: 'Freelancer', value: 'Freelancer' },
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ✅ SIMPLIFIED SUBMIT FUNCTION - Handles both create and update
const handleSubmit = async () => {
  try {
    console.log(locationData, "location--------");

    // 1️⃣ Validate required fields
    const errors = [];
    if (!formData.images || formData.images.length === 0) errors.push("Please select at least one image.");
    if (!formData.title?.trim()) errors.push("Title is required.");
    if (!formData.description?.trim()) errors.push("Description is required.");
    if (!formData.monthlyRent || isNaN(formData.monthlyRent)) errors.push("Monthly rent is required and must be a number.");
    if (!formData.roommatesWanted || isNaN(formData.roommatesWanted)) errors.push("Roommates wanted is required and must be a number.");
    if (!formData.contactPhone?.trim()) errors.push("Contact phone is required.");
    if (!formData.category?.trim()) errors.push("Category is required.");
    if (formData.purpose && !Array.isArray(formData.purpose)) errors.push("Please select at least one purpose.");
    if (formData.habitPreferences && !Array.isArray(formData.habitPreferences)) errors.push("Please select at least one habit preference.");

    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return;
    }

    // 2️⃣ Separate existing and new images
    const existingImages = formData.images.filter(img => img.startsWith('http'));
    const newImageUris = formData.images.filter(img => !img.startsWith('http'));
    
    console.log(`📸 Images - Existing: ${existingImages.length}, New: ${newImageUris.length}, Total: ${formData.images.length}`);

    // 3️⃣ Compress ONLY NEW images
    const timestamp = Date.now();
    const compressedImages = [];

    for (let i = 0; i < newImageUris.length; i++) {
      const img = newImageUris[i];
      
      let context = ImageManipulator.manipulate(img);
      context.resize({ width: 1280 });
      let result = await context.renderAsync();
      let manip = await result.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

      const info = await FileSystem.getInfoAsync(manip.uri);
      if (info.size > 1000000) {
        const context2 = ImageManipulator.manipulate(manip.uri);
        const result2 = await context2.renderAsync();
        manip = await result2.saveAsync({ compress: 0.5, format: SaveFormat.JPEG });
      }

      // ✅ FIRST IMAGE THUMBNAIL - Only create thumbnail for first new image
      if (i === 0 && existingImages.length === 0) {
        const thumbContext = ImageManipulator.manipulate(manip.uri);
        thumbContext.resize({ width: 300 });
        const thumbResult = await thumbContext.renderAsync();
        const thumb = await thumbResult.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
        manip.thumbnail = thumb.uri;
      }

      compressedImages.push(manip);
    }

    // 4️⃣ Prepare FormData
    const uploadData = new FormData();

    // ✅ CRITICAL: Send existing images that should be kept (only for edit mode)
    if (isEdit && existingImages.length > 0) {
      uploadData.append("existingImages", JSON.stringify(existingImages));
      console.log('📤 Sending existing images to keep:', existingImages.length);
    }

    // Append normal fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "images" || key === "location") return;
      if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
        uploadData.append(key, JSON.stringify(value));
      } else {
        uploadData.append(key, String(value));
      }
    });

    // Append location
    if (locationData?.lat && locationData?.lng && locationData?.name) {
      const geoLocation = {
        type: "Point",
        coordinates: [locationData.lng, locationData.lat],
        fullAddress: locationData.name,
      };
      uploadData.append("location", JSON.stringify(geoLocation));
    }

    // Append NEW images
    compressedImages.forEach((img, i) => {
      uploadData.append("images", {
        uri: img.uri,
        name: `property_${timestamp}_${i}.jpg`,
        type: "image/jpeg",
      });
    });

    // ✅ Append thumbnail if it's the first image and we have new images
    if (compressedImages[0]?.thumbnail && existingImages.length === 0) {
      uploadData.append("thumbnail", {
        uri: compressedImages[0].thumbnail,
        name: `thumbnail_${timestamp}.jpg`,
        type: "image/jpeg",
      });
    }

    // 5️⃣ Make API call
    let res;
    if (isEdit && roomId) {
      console.log("🔄 Updating room...", roomId);
      console.log("📤 Uploading:", {
        existingImages: existingImages.length,
        newImages: compressedImages.length,
        totalImages: formData.images.length
      });
      
      res = await api.put(`${apiUrl}/api/update/${roomId}`, uploadData, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
    } else {
      console.log("🆕 Creating new room...");
      res = await api.post(`${apiUrl}/api/rooms`, uploadData, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
    }

    console.log("✅ Success:", res.data);
    Alert.alert(
      "Success", 
      isEdit ? "Your room listing has been updated!" : "Your room listing has been submitted!"
    );
    
    router.back();

  } catch (err) {
    console.error("❌ Operation failed:", err);
    let errorMessage = `Something went wrong while ${isEdit ? 'updating' : 'submitting'} your listing.`;
    if (err.code === 'NETWORK_ERROR') {
      errorMessage = "Network connection failed. Please check your internet connection.";
    } else if (err.response?.status) {
      errorMessage = `Server error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`;
    }
    Alert.alert("Error", errorMessage);
  }
};

  // ✅ SIMPLE IMAGE REMOVAL - Just remove from local state
  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  // Your existing renderStepContent function stays the same
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <InputField
              label="Listing Title"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="e.g., Shared Room near Infopark "
              required
              maxLength={100}
               multiline 
            />

            <InputField
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe your room, amenities, and what makes it special..."
              multiline
              required
              maxLength={500}
            />

            <LocationSection
              locationData={formData.location}
              onLocationChange={(value) => updateFormData('location', value)}
              required
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <ImageUploadSection
              images={formData.images}
              onImagesChange={(value) => updateFormData('images', value)} // Simple update
              maxImages={5}
              required
              isEdit={isEdit}
            />

            <InputField
              label="Monthly Rent (₹)"
              value={formData.monthlyRent}
              onChangeText={(value) => updateFormData('monthlyRent', value)}
              placeholder="5000"
              keyboardType="numeric"
              required
            />

            <NumberPicker
              label="Number of Roommates Wanted"
              value={formData.roommatesWanted}
              onValueChange={(value) => updateFormData('roommatesWanted', value)}
              min={1}
              max={5}
              required
            />
          </View>
        );

      // ... rest of your steps remain the same
      case 3:
        return (
          <View style={styles.stepContainer}>
            <SelectionButton
              label="Gender Preference"
              options={genderOptions}
              selectedValue={formData.genderPreference}
              onSelect={(value) => updateFormData('genderPreference', value)}
              required
            />

            <SelectionButton
              label="Preferred Habits"
              options={habitOptions}
              selectedValue={formData.habitPreferences}
              onSelect={(value) => updateFormData('habitPreferences', value)}
              multiSelect
            />

            <SelectionButton
              label="Suitable For"
              options={purposeOptions}
              selectedValue={formData.purpose}
              onSelect={(value) => updateFormData('purpose', value)}
              multiSelect
              required
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <PhoneInputField
              label="Contact Phone"
              value={formData.contactPhone}
              onChangeText={(value) => updateFormData('contactPhone', value)}
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              required
            />

            <SelectionButton
              label="Phone Number Visibility"
              options={[
                { label: 'Show ', value: true },
                { label: 'Hide ', value: false },
              ]}
              selectedValue={formData.showPhonePublic}
              onSelect={(value) => updateFormData('showPhonePublic', value)}
              required
            />

            {formData.showPhonePublic === true && formData.contactPhone.length === 10 && (
              <View style={styles.visibilityDisclaimer}>
                <Ionicons name="information-circle" size={16} color="#7A5AF8" />
                <Text style={styles.disclaimerTextShow}>
                  This number will be public
                </Text>
              </View>
            )}

            {formData.showPhonePublic === false && formData.contactPhone.length === 10 && (
              <View style={styles.visibilityDisclaimerHide}>
                <Ionicons name="information-circle" size={16} color="#7A5AF8" />
                <Text style={styles.disclaimerTextHide}>
                  Users must message to see it
                </Text>
              </View>
            )}

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>📋 Listing Summary</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Title:</Text>
                <Text style={styles.summaryValue}>{formData.title || 'Not set'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Monthly Rent:</Text>
                <Text style={styles.summaryValue}>₹{formData.monthlyRent || 0}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Roommates Wanted:</Text>
                <Text style={styles.summaryValue}>{formData.roommatesWanted}</Text>
              </View>
              {isEdit && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Mode:</Text>
                  <Text style={styles.summaryValue}>Editing Existing Listing</Text>
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // Update the header title based on mode
  const getHeaderTitle = () => {
    return isEdit ? "Edit Shared Room" : "Shared Room Listing";
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Basic Information';
      case 2: return 'Photos & Pricing';
      case 3: return 'Preferences';
      case 4: return 'Contact & Review';
      default: return '';
    }
  };

  if (loading) {
    return (
      <SafeWrapper>
        <View style={styles.loadingContainer}>
          <Text>Loading room data...</Text>
        </View>
      </SafeWrapper>
    );
  }

  return (
    <SafeWrapper>
      <View style={styles.container}>
        <FormHeader title={getHeaderTitle()} />
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle={getStepTitle()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 30}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderStepContent()}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, currentStep === 1 && styles.fullWidthButton]}
            onPress={currentStep === totalSteps ? handleSubmit : handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === totalSteps ? (isEdit ? 'Update Listing' : 'Submit Listing') : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeWrapper>
  );
};


const PGHostelForm = () => {
  // ✅ Get route parameters
  const params = useLocalSearchParams();
  const roomId = params.roomId;
  const isEdit = params.isEdit === "true";

  const locationData = useSelector((state) => state.location.locationData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: null,
    images: [],
    availableSpace: '',
    priceRange: { min: 0, max: 0 },
    pgGenderCategory: '',
    roomTypesAvailable: [],
    mealsProvided: [],
    amenities: [],
    rules: [],
    contactPhone: '',
    showPhonePublic: true,
    category: 'pg_hostel',
  });

  // ✅ Fetch room data for editing
  useEffect(() => {
    if (isEdit && roomId) {
      fetchRoomData();
    }
  }, [isEdit, roomId]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching PG/Hostel data for: ${roomId}`);

      const response = await api.get(`/api/singleroom/${roomId}`);
      const room = response.data.room;

      // Transform API data to form data
      setFormData({
        title: room.title || '',
        description: room.description || '',
        location: room.location || null,
        images: room.images?.map(img => img.originalUrl) || [],
        availableSpace: room.availableSpace?.toString() || '',
        priceRange: room.priceRange || { min: 0, max: 0 },
        pgGenderCategory: room.pgGenderCategory || '',
        roomTypesAvailable: room.roomTypesAvailable || [],
        mealsProvided: room.mealsProvided || [],
        amenities: room.amenities || [],
        rules: room.rules || [],
        contactPhone: room.contactPhone || '',
        showPhonePublic: room.showPhonePublic ?? true,
        category: room.category || 'pg_hostel',
      });

      console.log('✅ PG/Hostel data loaded successfully');

    } catch (error) {
      console.error('Error fetching PG/Hostel data:', error);
      Alert.alert('Error', 'Failed to load PG/Hostel data');
    } finally {
      setLoading(false);
    }
  };

  // Your existing options remain the same...
  const genderCategoryOptions = [
    { label: 'Gents Only', value: 'gents' },
    { label: 'Ladies Only', value: 'ladies' },
    { label: 'Co-ed (Both)', value: 'coed' },
  ];

  const roomTypeOptions = [
    { label: 'Single Sharing', value: 'single' },
    { label: 'Double Sharing', value: 'double' },
    { label: 'Triple Sharing', value: 'triple' },
    { label: 'Dormitory', value: 'dormitory' },
  ];

  const mealOptions = [
    { label: 'Breakfast', value: 'breakfast' },
    { label: 'Lunch', value: 'lunch' },
    { label: 'Dinner', value: 'dinner' },
  ];

  const amenityOptions = [
    { label: 'Wi-Fi', value: 'wifi' },
    { label: 'Hot Water', value: 'hot_water' },
    { label: 'Laundry', value: 'laundry' },
    { label: 'AC Rooms', value: 'ac' },
    { label: 'TV/Entertainment', value: 'tv' },
    { label: 'Study Room', value: 'study_room' },
    { label: 'Gym', value: 'gym' },
    { label: 'Parking', value: 'parking' },
  ];

  const ruleOptions = [
    { label: 'No Smoking', value: 'no_smoking' },
    { label: 'No Alcohol', value: 'no_alcohol' },
    { label: 'No Pets', value: 'no_pet' },
    { label: 'No Loud Music', value: 'no_loud_music' },
    { label: 'No Opposite Gender Visitors', value: 'no_opposite_gender' },
    { label: 'Curfew Timings', value: 'curfew' },
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ✅ UPDATED SUBMIT FUNCTION - Handles both create and update
const handleSubmit = async () => {
  try {
    console.log(locationData, "location--------");

    // 1️⃣ Validate required fields
    const errors = [];

    if (!formData.images || formData.images.length === 0)
      errors.push("Please select at least one image.");

    if (!formData.title?.trim())
      errors.push("Title is required.");

    if (!formData.description?.trim())
      errors.push("Description is required.");

    if (!formData.availableSpace || isNaN(formData.availableSpace))
      errors.push("Available space is required and must be a number.");

    if (!formData.contactPhone?.trim())
      errors.push("Contact phone is required.");

    if (!formData.pgGenderCategory?.trim())
      errors.push("Gender category is required.");

    if (formData.roomTypesAvailable && !Array.isArray(formData.roomTypesAvailable))
      errors.push("Please select at least one room type.");

    // ✅ Price range validation
    const minPrice = parseFloat(formData.priceRange?.min);
    const maxPrice = parseFloat(formData.priceRange?.max);

    if (isNaN(minPrice) || isNaN(maxPrice))
      errors.push("Price range min and max must be numbers.");
    else if (minPrice < 0 || maxPrice < 0)
      errors.push("Price range values cannot be negative.");
    else if (minPrice > maxPrice)
      errors.push("Price range min cannot be greater than max.");

    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return;
    }

    // 2️⃣ Separate existing and new images
    const existingImages = formData.images.filter(img => img.startsWith('http'));
    const newImageUris = formData.images.filter(img => !img.startsWith('http'));
    
    console.log(`📸 Images - Existing: ${existingImages.length}, New: ${newImageUris.length}, Total: ${formData.images.length}`);

    // 3️⃣ Compress ONLY NEW images
    const timestamp = Date.now();
    const compressedImages = [];

    for (let i = 0; i < newImageUris.length; i++) {
      const img = newImageUris[i];

      let context = ImageManipulator.manipulate(img);
      context.resize({ width: 1280 });
      let result = await context.renderAsync();
      let manip = await result.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

      const info = await FileSystem.getInfoAsync(manip.uri);
      if (info.size > 1000000) {
        const context2 = ImageManipulator.manipulate(manip.uri);
        const result2 = await context2.renderAsync();
        manip = await result2.saveAsync({ compress: 0.5, format: SaveFormat.JPEG });
      }

      // ✅ FIRST IMAGE THUMBNAIL - Only create thumbnail for first new image
      if (i === 0 && existingImages.length === 0) {
        const thumbContext = ImageManipulator.manipulate(manip.uri);
        thumbContext.resize({ width: 300 });
        const thumbResult = await thumbContext.renderAsync();
        const thumb = await thumbResult.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
        manip.thumbnail = thumb.uri;
      }

      compressedImages.push(manip);
    }

    // 4️⃣ Prepare FormData
    const uploadData = new FormData();

    // ✅ Send existing images that should be kept (only for edit mode)
    if (isEdit && existingImages.length > 0) {
      uploadData.append("existingImages", JSON.stringify(existingImages));
      console.log('📤 Sending existing images to keep:', existingImages.length);
    }

    // Append normal fields (EXCLUDING images and location)
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "images" || key === "location") return;

      // ✅ FIX: Handle mealsProvided separately to prevent nested string arrays
      if (key === "mealsProvided") {
        uploadData.append(key, JSON.stringify(value || []));
      } else if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
        uploadData.append(key, JSON.stringify(value));
      } else {
        uploadData.append(key, String(value));
      }
    });

    // Append location ONLY if we have valid locationData
    if (locationData?.lat && locationData?.lng && locationData?.name) {
      const geoLocation = {
        type: "Point",
        coordinates: [locationData.lng, locationData.lat],
        fullAddress: locationData.name,
      };
      uploadData.append("location", JSON.stringify(geoLocation));
    }

    // Append NEW images
    compressedImages.forEach((img, i) => {
      uploadData.append("images", {
        uri: img.uri,
        name: `property_${timestamp}_${i}.jpg`,
        type: "image/jpeg",
      });
    });

    // ✅ Append thumbnail if it's the first image and we have new images
    if (compressedImages[0]?.thumbnail && existingImages.length === 0) {
      uploadData.append("thumbnail", {
        uri: compressedImages[0].thumbnail,
        name: `thumbnail_${timestamp}.jpg`,
        type: "image/jpeg",
      });
    }

    // 5️⃣ Make API call - CREATE or UPDATE
    let res;
    if (isEdit && roomId) {
      console.log("🔄 Updating PG/Hostel...", roomId);
      res = await api.put(`${apiUrl}/api/update/${roomId}`, uploadData, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
    } else {
      console.log("🆕 Creating new PG/Hostel...", uploadData);
      res = await api.post(`${apiUrl}/api/rooms`, uploadData, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
    }

    console.log("✅ Success:", res.data);
    Alert.alert(
      "Success",
      isEdit ? "Your PG/Hostel listing has been updated!" : "Your PG/Hostel listing has been submitted!"
    );

    // Navigate back
    router.back();

  } catch (err) {
    console.error("❌ Operation failed:", err);
    let errorMessage = `Something went wrong while ${isEdit ? 'updating' : 'submitting'} your listing.`;
    if (err.code === 'NETWORK_ERROR') {
      errorMessage = "Network connection failed. Please check your internet connection.";
    } else if (err.response?.status) {
      errorMessage = `Server error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`;
    }
    Alert.alert("Error", errorMessage);
  }
};


  // ✅ SIMPLE IMAGE REMOVAL - Just remove from local state
  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  // Your existing renderStepContent function with minor updates
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <InputField
              label="PG/Hostel Name"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="e.g., Tech Stay Gents Hostel - Opposite Infopark"
              required
                multiline
              maxLength={100}
            />

            <InputField
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe your PG/Hostel, facilities, and nearby locations..."
              multiline
              required
              maxLength={500}
            />

            <LocationSection
              locationData={formData.location}
              onLocationChange={(value) => updateFormData('location', value)}
              required
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <ImageUploadSection
              images={formData.images}
              onImagesChange={(value) => updateFormData('images', value)}
              maxImages={8}
              required
              isEdit={isEdit}
            />

            <InputField
              label="Available Space (Number of beds/rooms)"
              value={formData.availableSpace}
              onChangeText={(value) => updateFormData('availableSpace', value)}
              placeholder="6"
              keyboardType="numeric"
              required
            />

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Price Range (₹/month) <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.priceRangeContainer}>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={formData.priceRange.min?.toString() || ''}
                    onChangeText={(text) => updateFormData('priceRange', {
                      ...formData.priceRange,
                      min: parseInt(text) || 0
                    })}
                    placeholder="5000"
                    keyboardType="numeric"
                    placeholderTextColor="#999999"
                  />
                </View>

                <Text style={styles.priceSeparator}>to</Text>

                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={formData.priceRange.max?.toString() || ''}
                    onChangeText={(text) => updateFormData('priceRange', {
                      ...formData.priceRange,
                      max: parseInt(text) || 0
                    })}
                    placeholder="7000"
                    keyboardType="numeric"
                    placeholderTextColor="#999999"
                  />
                </View>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <SelectionButton
              label="Gender Category"
              options={genderCategoryOptions}
              selectedValue={formData.pgGenderCategory}
              onSelect={(value) => updateFormData('pgGenderCategory', value)}
              required
            />

            <SelectionButton
              label="Room Types Available"
              options={roomTypeOptions}
              selectedValue={formData.roomTypesAvailable}
              onSelect={(value) => updateFormData('roomTypesAvailable', value)}
              multiSelect
              required
            />

            <SelectionButton
              label="Meals Provided"
              options={mealOptions}
              selectedValue={formData.mealsProvided}
              onSelect={(value) => updateFormData('mealsProvided', value)}
              multiSelect
            />

            <SelectionButton
              label="Amenities"
              options={amenityOptions}
              selectedValue={formData.amenities}
              onSelect={(value) => updateFormData('amenities', value)}
              multiSelect
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <SelectionButton
              label="House Rules"
              options={ruleOptions}
              selectedValue={formData.rules}
              onSelect={(value) => updateFormData('rules', value)}
              multiSelect
            />

            <PhoneInputField
              label="Contact Phone"
              value={formData.contactPhone}
              onChangeText={(value) => updateFormData('contactPhone', value)}
              keyboardType="phone-pad"
              required
            />

            <SelectionButton
              label="Phone Number Visibility"
              options={[
                { label: 'Show ', value: true },
                { label: 'Hide ', value: false },
              ]}
              selectedValue={formData.showPhonePublic}
              onSelect={(value) => updateFormData('showPhonePublic', value)}
              required
            />

            {formData.showPhonePublic === true && formData.contactPhone.length === 10 && (
              <View style={styles.visibilityDisclaimer}>
                <Ionicons name="information-circle" size={16} color="#7A5AF8" />
                <Text style={styles.disclaimerTextShow}>
                  This number will be public
                </Text>
              </View>
            )}

            {formData.showPhonePublic === false && formData.contactPhone.length === 10 && (
              <View style={styles.visibilityDisclaimerHide}>
                <Ionicons name="information-circle" size={16} color="#7A5AF8" />
                <Text style={styles.disclaimerTextHide}>
                  Users must message to see it
                </Text>
              </View>
            )}

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>📋 Listing Summary</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>PG Name:</Text>
                <Text style={styles.summaryValue}>{formData.title || 'Not set'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Price Range:</Text>
                <Text style={styles.summaryValue}>
                  ₹{formData.priceRange.min} - ₹{formData.priceRange.max}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Available Space:</Text>
                <Text style={styles.summaryValue}>{formData.availableSpace || 0}</Text>
              </View>
              {isEdit && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Mode:</Text>
                  <Text style={styles.summaryValue}>Editing Existing Listing</Text>
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // Update the header title based on mode
  const getHeaderTitle = () => {
    return isEdit ? "Edit PG/Hostel" : "PG/Hostel Listing";
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Basic Information';
      case 2: return 'Photos & Pricing';
      case 3: return 'Facilities & Services';
      case 4: return 'Rules & Contact';
      default: return '';
    }
  };

  if (loading) {
    return (
      <SafeWrapper>
        <View style={styles.loadingContainer}>
          <Text>Loading PG/Hostel data...</Text>
        </View>
      </SafeWrapper>
    );
  }

  return (
    <SafeWrapper>
      <View style={styles.container}>
        <FormHeader title={getHeaderTitle()} />
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle={getStepTitle()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 30}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderStepContent()}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, currentStep === 1 && styles.fullWidthButton]}
            onPress={currentStep === totalSteps ? handleSubmit : handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === totalSteps ? (isEdit ? 'Update Listing' : 'Submit Listing') : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeWrapper>
  );
};

// File: FlatHomeForm.js

const FlatHomeForm = () => {
  // ✅ Get route parameters
  const params = useLocalSearchParams();
  const roomId = params.roomId;
  const isEdit = params.isEdit === "true";

  const locationData = useSelector((state) => state.location.locationData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: null,
    images: [],
    propertyType: '',
    furnishedStatus: '',
    monthlyRent: '',
    securityDeposit: '',
    squareFeet: '',
    bedrooms: 1,
    bathrooms: 1,
    balconies: 0,
    floorNumber: 1,
    totalFloors: 1,
    tenantPreference: '',
    parking: '',
    contactPhone: '',
    showPhonePublic: true,
    category: 'flat_home',
  });

  // ✅ Fetch room data for editing
  useEffect(() => {
    if (isEdit && roomId) {
      fetchRoomData();
    }
  }, [isEdit, roomId]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching Flat/Home data for: ${roomId}`);

      const response = await api.get(`/api/singleroom/${roomId}`);
      const room = response.data.room;

      // Transform API data to form data
      setFormData({
        title: room.title || '',
        description: room.description || '',
        location: room.location || null,
        images: room.images?.map(img => img.originalUrl) || [],
        propertyType: room.propertyType || '',
        furnishedStatus: room.furnishedStatus || '',
        monthlyRent: room.monthlyRent?.toString() || '',
        securityDeposit: room.securityDeposit?.toString() || '',
        squareFeet: room.squareFeet?.toString() || '',
        bedrooms: room.bedrooms || 1,
        bathrooms: room.bathrooms || 1,
        balconies: room.balconies || 0,
        floorNumber: room.floorNumber || 1,
        totalFloors: room.totalFloors || 1,
        tenantPreference: room.tenantPreference || '',
        parking: room.parking || '',
        contactPhone: room.contactPhone || '',
        showPhonePublic: room.showPhonePublic ?? true,
        category: room.category || 'flat_home',
      });

      console.log('✅ Flat/Home data loaded successfully');

    } catch (error) {
      console.error('Error fetching Flat/Home data:', error);
      Alert.alert('Error', 'Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  // Your existing options remain the same...
  const propertyTypeOptions = [
    { label: 'Apartment/Flat', value: 'flat' },
    { label: 'Independent House', value: 'house' },
    { label: 'Villa', value: 'villa' },
    { label: 'Duplex', value: 'duplex' },
  ];

  const furnishedOptions = [
    { label: 'Fully Furnished', value: 'furnished' },
    { label: 'Semi Furnished', value: 'semi_furnished' },
    { label: 'Unfurnished', value: 'unfurnished' },
  ];

  const tenantOptions = [
    { label: 'Family Only', value: 'family' },
    { label: 'Working Professionals', value: 'professionals' },
    { label: 'Students', value: 'students' },
    { label: 'Any', value: 'any' },
  ];

  const parkingOptions = [
    { label: 'Two Wheeler', value: 'two_wheeler' },
    { label: 'Four Wheeler', value: 'four_wheeler' },
    { label: 'Both', value: 'both' },
    { label: 'No Parking', value: 'none' },
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ✅ UPDATED SUBMIT FUNCTION - Handles both create and update
const handleSubmit = async () => {
  try {
    console.log(locationData, "location--------");

    // 1️⃣ Validate required fields
    const errors = [];
    if (!formData.images || formData.images.length === 0) errors.push("Please select at least one image.");
    if (!formData.title?.trim()) errors.push("Title is required.");
    if (!formData.description?.trim()) errors.push("Description is required.");
    if (!formData.monthlyRent || isNaN(formData.monthlyRent)) errors.push("Monthly rent is required and must be a number.");
    if (!formData.securityDeposit || isNaN(formData.securityDeposit)) errors.push("Security deposit is required and must be a number.");
    if (!formData.contactPhone?.trim()) errors.push("Contact phone is required.");
    if (!formData.propertyType?.trim()) errors.push("Property type is required.");
    if (!formData.furnishedStatus?.trim()) errors.push("Furnished status is required.");

    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n"));
      return;
    }

    // 2️⃣ Separate existing and new images
    const existingImages = formData.images.filter(img => img.startsWith('http'));
    const newImageUris = formData.images.filter(img => !img.startsWith('http'));
    
    console.log(`📸 Images - Existing: ${existingImages.length}, New: ${newImageUris.length}, Total: ${formData.images.length}`);

    // 3️⃣ Compress ONLY NEW images
    const timestamp = Date.now();
    const compressedImages = [];

    for (let i = 0; i < newImageUris.length; i++) {
      const img = newImageUris[i];

      let context = ImageManipulator.manipulate(img);
      context.resize({ width: 1280 });
      let result = await context.renderAsync();
      let manip = await result.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });

      const info = await FileSystem.getInfoAsync(manip.uri);
      if (info.size > 1000000) {
        const context2 = ImageManipulator.manipulate(manip.uri);
        const result2 = await context2.renderAsync();
        manip = await result2.saveAsync({ compress: 0.5, format: SaveFormat.JPEG });
      }

      // ✅ FIRST IMAGE THUMBNAIL - Only create thumbnail for first new image
      if (i === 0 && existingImages.length === 0) {
        const thumbContext = ImageManipulator.manipulate(manip.uri);
        thumbContext.resize({ width: 300 });
        const thumbResult = await thumbContext.renderAsync();
        const thumb = await thumbResult.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
        manip.thumbnail = thumb.uri;
      }

      compressedImages.push(manip);
    }

    // 4️⃣ Prepare FormData
    const uploadData = new FormData();

    // ✅ CRITICAL: Send existing images that should be kept (only for edit mode)
    if (isEdit && existingImages.length > 0) {
      uploadData.append("existingImages", JSON.stringify(existingImages));
      console.log('📤 Sending existing images to keep:', existingImages.length);
    }

    // Append normal fields (EXCLUDING images and location)
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "images" || key === "location") return;
      if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
        uploadData.append(key, JSON.stringify(value));
      } else {
        uploadData.append(key, String(value));
      }
    });

    // Append location ONLY if we have valid locationData
    if (locationData?.lat && locationData?.lng && locationData?.name) {
      const geoLocation = {
        type: "Point",
        coordinates: [locationData.lng, locationData.lat],
        fullAddress: locationData.name,
      };
      uploadData.append("location", JSON.stringify(geoLocation));
    }

    // Append NEW images
    compressedImages.forEach((img, i) => {
      uploadData.append("images", {
        uri: img.uri,
        name: `property_${timestamp}_${i}.jpg`,
        type: "image/jpeg",
      });
    });

    // ✅ Append thumbnail if it's the first image and we have new images
    if (compressedImages[0]?.thumbnail && existingImages.length === 0) {
      uploadData.append("thumbnail", {
        uri: compressedImages[0].thumbnail,
        name: `thumbnail_${timestamp}.jpg`,
        type: "image/jpeg",
      });
    }

    // 5️⃣ Make API call - CREATE or UPDATE
    let res;
    if (isEdit && roomId) {
      // UPDATE request
      console.log("🔄 Updating property...", roomId);
      console.log("📤 Uploading:", {
        existingImages: existingImages.length,
        newImages: compressedImages.length,
        totalImages: formData.images.length
      });
      
      res = await api.put(`${apiUrl}/api/update/${roomId}`, uploadData, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
    } else {
      // CREATE request
      console.log("🆕 Creating new property...");
      res = await api.post(`${apiUrl}/api/rooms`, uploadData, {
        timeout: 60000,
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      });
    }

    console.log("✅ Success:", res.data);
    Alert.alert(
      "Success",
      isEdit ? "Your property listing has been updated!" : "Your property listing has been submitted!"
    );

    // Navigate back
    router.back();

  } catch (err) {
    console.error("❌ Operation failed:", err);
    let errorMessage = `Something went wrong while ${isEdit ? 'updating' : 'submitting'} your listing.`;
    if (err.code === 'NETWORK_ERROR') {
      errorMessage = "Network connection failed. Please check your internet connection.";
    } else if (err.response?.status) {
      errorMessage = `Server error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`;
    }
    Alert.alert("Error", errorMessage);
  }
};

  // ✅ SIMPLE IMAGE REMOVAL - Just remove from local state
  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData('images', newImages);
  };

  // Your existing renderStepContent function with minor updates
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
      <InputField
  label="Property Title"
  value={formData.title}
   multiline
  onChangeText={(value) => updateFormData('title', value)}
  placeholder="e.g., 2BHK Fully Furnished Flat near Kakkanad"
  required
  maxLength={100}

/>

<InputField
  label="Description"
  value={formData.description}
  multiline
  onChangeText={(value) => updateFormData('description', value)}
  placeholder="Describe your property, location advantages, and amenities..."
  required
  maxLength={500}
/>
            <LocationSection
              locationData={formData.location}
              onLocationChange={(value) => updateFormData('location', value)}
              required
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <ImageUploadSection
              images={formData.images}
              onImagesChange={(value) => updateFormData('images', value)}
              maxImages={10}
              required
              isEdit={isEdit}
            />

            <SelectionButton
              label="Property Type"
              options={propertyTypeOptions}
              selectedValue={formData.propertyType}
              onSelect={(value) => updateFormData('propertyType', value)}
              required
            />

            <SelectionButton
              label="Furnished Status"
              options={furnishedOptions}
              selectedValue={formData.furnishedStatus}
              onSelect={(value) => updateFormData('furnishedStatus', value)}
              required
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <InputField
              label="Monthly Rent (₹)"
              value={formData.monthlyRent}
              onChangeText={(value) => updateFormData('monthlyRent', value)}
              placeholder="12000"
              keyboardType="numeric"
              required
            />

            <InputField
              label="Security Deposit (₹)"
              value={formData.securityDeposit}
              onChangeText={(value) => updateFormData('securityDeposit', value)}
              placeholder="15000"
              keyboardType="numeric"
            />

            <InputField
              label="Area (Square Feet)"
              value={formData.squareFeet}
              onChangeText={(value) => updateFormData('squareFeet', value)}
              placeholder="950"
              keyboardType="numeric"
            />

            <View style={styles.roomDetailsContainer}>
              <ScrollView horizontal>
                <View style={styles.horizontalContainer}>
                  <NumberPicker
                    label="Bedrooms"
                    value={formData.bedrooms}
                    onValueChange={(value) => updateFormData('bedrooms', value)}
                    min={1}
                    max={10}
                    required
                  />
                  <View style={styles.separator} />
                  <NumberPicker
                    label="Bathrooms"
                    value={formData.bathrooms}
                    onValueChange={(value) => updateFormData('bathrooms', value)}
                    min={1}
                    max={10}
                    required
                  />
                  <View style={styles.separator} />
                  <NumberPicker
                    label="Balconies"
                    value={formData.balconies}
                    onValueChange={(value) => updateFormData('balconies', value)}
                    min={0}
                    max={5}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.floorContainer}>
              <ScrollView horizontal>
                <View style={styles.horizontalContainer}>
                  <NumberPicker
                    label="Floor Number"
                    value={formData.floorNumber}
                    onValueChange={(value) => updateFormData('floorNumber', value)}
                    min={1}
                    max={50}
                  />
                  <View style={styles.separator} />
                  <NumberPicker
                    label="Total Floors"
                    value={formData.totalFloors}
                    onValueChange={(value) => updateFormData('totalFloors', value)}
                    min={1}
                    max={50}
                  />
                </View>
              </ScrollView>
            </View>

            <SelectionButton
              label="Tenant Preference"
              options={tenantOptions}
              selectedValue={formData.tenantPreference}
              onSelect={(value) => updateFormData('tenantPreference', value)}
              required
            />

            <SelectionButton
              label="Parking Available"
              options={parkingOptions}
              selectedValue={formData.parking}
              onSelect={(value) => updateFormData('parking', value)}
              required
            />

            <PhoneInputField
              label="Contact Phone"
              value={formData.contactPhone}
              onChangeText={(value) => updateFormData('contactPhone', value)}
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              required
            />

            <SelectionButton
              label="Phone Number Visibility"
              options={[
                { label: 'Hide ', value: false },
                { label: 'Show ', value: true },
              ]}
              selectedValue={formData.showPhonePublic}
              onSelect={(value) => updateFormData('showPhonePublic', value)}
              required
            />

            {formData.showPhonePublic === true && formData.contactPhone.length === 10 && (
              <View style={styles.visibilityDisclaimer}>
                <Ionicons name="information-circle" size={16} color="#7A5AF8" />
                <Text style={styles.disclaimerTextShow}>
                  This number will be public
                </Text>
              </View>
            )}

            {formData.showPhonePublic === false && formData.contactPhone.length === 10 && (
              <View style={styles.visibilityDisclaimerHide}>
                <Ionicons name="information-circle" size={16} color="#7A5AF8" />
                <Text style={styles.disclaimerTextHide}>
                  Users must message to see it
                </Text>
              </View>
            )}

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>📋 Listing Summary</Text>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Property:</Text>
                <Text style={styles.summaryValue}>{formData.title || 'Not set'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Monthly Rent:</Text>
                <Text style={styles.summaryValue}>₹{formData.monthlyRent || 0}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Configuration:</Text>
                <Text style={styles.summaryValue}>
                  {formData.bedrooms}BHK, {formData.bathrooms} Bath
                </Text>
              </View>
              {isEdit && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Mode:</Text>
                  <Text style={styles.summaryValue}>Editing Existing Listing</Text>
                </View>
              )}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // Update the header title based on mode
  const getHeaderTitle = () => {
    return isEdit ? "Edit Property" : "Property Listing";
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Basic Information';
      case 2: return 'Photos & Property Type';
      case 3: return 'Pricing & Specifications';
      case 4: return 'Additional Details';
      default: return '';
    }
  };

  if (loading) {
    return (
      <SafeWrapper>
        <View style={styles.loadingContainer}>
          <Text>Loading property data...</Text>
        </View>
      </SafeWrapper>
    );
  }

  return (
    <SafeWrapper>
      <View style={styles.container}>
        <FormHeader title={getHeaderTitle()} />
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle={getStepTitle()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 30}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderStepContent()}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, currentStep === 1 && styles.fullWidthButton]}
            onPress={currentStep === totalSteps ? handleSubmit : handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === totalSteps ? (isEdit ? 'Update Listing' : 'Submit Listing') : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeWrapper>
  );
};

// Common Styles for all forms
const styles = StyleSheet.create({
  visibilityDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F0FF',
    borderLeftWidth: 3,
    borderLeftColor: '#7A5AF8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 20,
    gap: 10,
  },
  disclaimerTextShow: {
    flex: 1,
    fontSize: 13,
    // color: '#389E0D',
    lineHeight: 18,
  },
  visibilityDisclaimerHide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F0FF',
    borderLeftWidth: 3,
    borderLeftColor: '#7A5AF8',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 20,
    gap: 10,
  },
  disclaimerTextHide: {
    flex: 1,
    fontSize: 13,
    // color: '#7A5AF8',
    lineHeight: 18,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100, // Space for keyboard and buttons
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {

    paddingTop: 20,
    paddingBottom: 20,
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 20// Ensure the container takes full width
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#ccc',
    marginVertical: 'auto',
    height: 30, // Adjust height as needed
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7A5AF8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  fullWidthButton: {
    flex: 2,
  },
  summaryContainer: {
    backgroundColor: '#F8F8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8E3FF',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7A5AF8',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3FF',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#E74C3C',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  priceSeparator: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 16,
    marginTop: 20,
  },
  roomDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  floorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
});

export { SharedRoomForm, PGHostelForm, FlatHomeForm };