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
} from 'react-native';
import FormHeader from './FormHeader';
import ProgressBar from './ProgressBar';
import {
  InputField,
  SelectionButton,
  NumberPicker,
  LocationSection,
  ImageUploadSection,
} from './FormComponents';
import SafeWrapper from '../services/Safewrapper';
import { Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';


const SharedRoomForm = () => {

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
  });

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

  const phoneVisibilityOptions = [
    { label: 'Show', value: false },
    { label: 'Hide', value: true },
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

  const handleSubmit = () => {
    console.log('Shared Room Form Data:', formData);
    Alert.alert('Success', 'Your shared room listing has been submitted for review!');
  };

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
              onImagesChange={(value) => updateFormData('images', value)}
              maxImages={5}
              required
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
            <InputField
              label="Contact Phone"
              value={formData.contactPhone}
              onChangeText={(value) => updateFormData('contactPhone', value)}
              placeholder="+91 9876543210"
              keyboardType="phone-pad"
              required
            />

            <SelectionButton
              label="Phone Number Visibility"
              options={phoneVisibilityOptions}
              selectedValue={formData.showPhonePublic}
              onSelect={(value) => updateFormData('showPhonePublic', value)}
              required
            />

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
            </View>
          </View>
        );

      default:
        return null;
    }
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

  return (
    <SafeWrapper>
  
    <View style={styles.container}>
      <FormHeader title="Shared Room Listing" />
      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        stepTitle={getStepTitle()} 
      />
     <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 30} // Adjust based on header height
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
            {currentStep === totalSteps ? 'Submit Listing' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    </SafeWrapper>
  );
};

// File: PGHostelForm.js

const PGHostelForm = () => {
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
  });

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
    { label: 'All Meals', value: 'all_meals' },
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

  const handleSubmit = () => {
    console.log('PG/Hostel Form Data:', formData);
    Alert.alert('Success', 'Your PG/Hostel listing has been submitted for review!');
  };

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

            <InputField
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
            </View>
          </View>
        );

      default:
        return null;
    }
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

  return (
       <SafeWrapper>
    <View style={styles.container}>
      <FormHeader title="PG/Hostel Listing" />
      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        stepTitle={getStepTitle()} 
      />
 <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 30} // Adjust based on header height
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
            {currentStep === totalSteps ? 'Submit Listing' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeWrapper>
  );
};

// File: FlatHomeForm.js

const FlatHomeForm = () => {
 
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

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
  });

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

  const handleSubmit = () => {
    console.log('Flat/Home Form Data:', formData);
    Alert.alert('Success', 'Your property listing has been submitted for review!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <InputField
              label="Property Title"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="e.g., 2BHK Fully Furnished Flat near Kakkanad"
              required
              maxLength={100}
            />

            <InputField
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe your property, location advantages, and amenities..."
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
              maxImages={10}
              required
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

            <InputField
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
                { label: 'Show ', value: false },
                { label: 'Hide ', value: true },
              ]}
              selectedValue={formData.showPhonePublic}
              onSelect={(value) => updateFormData('showPhonePublic', value)}
              required
            />

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
            </View>
          </View>
        );

      default:
        return null;
    }
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

  return (
    <SafeWrapper>
    <View style={styles.container}>
      <FormHeader title="Property Listing" />
      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        stepTitle={getStepTitle()} 
      />
<KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 30} // Adjust based on header height
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
            {currentStep === totalSteps ? 'Submit Listing' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
    </SafeWrapper>
  );
};

// Common Styles for all forms
const styles = StyleSheet.create({
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
    gap :20// Ensure the container takes full width
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