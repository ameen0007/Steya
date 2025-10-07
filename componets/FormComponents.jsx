import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import CustomAlert from '../componets/CustomAlert '
// Input Field Component
export const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  multiline = false,
  keyboardType = 'default',
  required = false,
  maxLength,
}) => {
  // set initial height — 150 if description, else 40
  const isDescription = label?.toLowerCase().includes('description');
  const [inputHeight, setInputHeight] = useState(isDescription ? 150 : 40);

  useEffect(() => {
    // reset initial height when label changes (optional)
    setInputHeight(isDescription ? 150 : 40);
  }, [label]);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TextInput
        style={[
          styles.textInput,
          multiline && styles.multilineInput,
          multiline && { height: Math.max(isDescription ? 150 : 40, inputHeight) },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onContentSizeChange={(e) =>
          setInputHeight(e.nativeEvent.contentSize.height)
        }
      />

      {maxLength && (
        <Text style={styles.charCount}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

// Selection Button Component
export const SelectionButton = ({ 
  options, 
  selectedValue, 
  onSelect, 
  label, 
  required = false,
  multiSelect = false 
}) => {
  const handleSelect = (value) => {
    if (multiSelect) {
      const currentValues = selectedValue || [];
      if (currentValues.includes(value)) {
        onSelect(currentValues.filter(item => item !== value));
      } else {
        onSelect([...currentValues, value]);
      }
    } else {
      onSelect(value);
    }
  };

  const isSelected = (value) => {
    if (multiSelect) {
      return selectedValue?.includes(value) || false;
    }
    return selectedValue === value;
  };

  return (
    <View style={styles.selectionContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              isSelected(option.value) && styles.selectedOption
            ]}
            onPress={() => handleSelect(option.value)}
          >
            <Text style={[
              styles.optionText,
              isSelected(option.value) && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

 export const PhoneInputField = ({ 
  label, 
  value, 
  onChangeText, 
  required = false,
  error = ''
}) => {
  const handlePhoneChange = (text) => {
    // Remove any non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Limit to 10 digits
    if (numericValue.length <= 10) {
      onChangeText(numericValue);
    }
  };

  const isValid = value.length === 10;
  const showError = value.length > 0 && !isValid;

  return (
  <View style={styles.container}>
  <Text style={styles.label}>
    {label} {required && <Text style={styles.required}>*</Text>}
  </Text>
  
  <View style={[
    styles.inputContainer2,
    showError && styles.inputContainerError
  ]}>
    <Text style={styles.prefixText}>🇮🇳  +91</Text>
    
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={handlePhoneChange}
      placeholder="9876543210"
      keyboardType="phone-pad"
      maxLength={10}
      placeholderTextColor="#999"
    />
    
    <Text style={[
      styles.counterText,
      value.length === 10 && styles.counterComplete
    ]}>
      {value.length}/10
    </Text>
  </View>

  {showError && (
    <Text style={styles.errorText}>
      Phone number must be exactly 10 digits
    </Text>
  )}

  {/* {isValid && (
    <Text style={styles.successText}>
      ✓ Valid phone number
    </Text>
  )} */}
</View>
  );
};

// Number Picker Component
export const NumberPicker = ({ 
  label, 
  value, 
  onValueChange, 
  min = 0, 
  max = 10, 
  required = false 
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.numberPickerContainer}>
        <TouchableOpacity
          style={[
            styles.numberButton,
            value <= min && styles.disabledButton
          ]}
          onPress={() => value > min && onValueChange(value - 1)}
          disabled={value <= min}
        >
          <Text style={[
            styles.numberButtonText,
            value <= min && styles.disabledButtonText
          ]}>-</Text>
        </TouchableOpacity>
        
        <View style={styles.numberDisplay}>
          <Text style={styles.numberText}>{value}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.numberButton,
            value >= max && styles.disabledButton
          ]}
          onPress={() => value < max && onValueChange(value + 1)}
          disabled={value >= max}
        >
          <Text style={[
            styles.numberButtonText,
            value >= max && styles.disabledButtonText
          ]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Price Range Component
export const PriceRangeInput = ({ 
  label, 
  minValue, 
  maxValue, 
  onMinChange, 
  onMaxChange, 
  required = false 
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.priceRangeContainer}>
        <View style={styles.priceInputContainer}>
          <Text style={styles.priceLabel}>Min</Text>
          <TextInput
            style={styles.priceInput}
            value={minValue?.toString() || ''}
            onChangeText={(text) => onMinChange(parseInt(text) || 0)}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999999"
          />
        </View>
        
        <Text style={styles.priceSeparator}>to</Text>
        
        <View style={styles.priceInputContainer}>
          <Text style={styles.priceLabel}>Max</Text>
          <TextInput
            style={styles.priceInput}
            value={maxValue?.toString() || ''}
            onChangeText={(text) => onMaxChange(parseInt(text) || 0)}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#999999"
          />
        </View>
      </View>
    </View>
  );
};

// Location Section Component
export const LocationSection = ({ 
 
  onLocationChange, 
  required = false 
}) => {
const locationData = useSelector(state => state.location.locationData);
const [localLocation, setLocalLocation] = useState(locationData);

// Sync only if Redux changed and user hasn't typed something
useEffect(() => {
  setLocalLocation(locationData);
}, [locationData]);

  const [loading, setLoading] = useState(false);






  const handleChangeLocation = () => {
   router.push({
  pathname: "/locationScreen",
  params: { returnTo: "/sharedroomform" ,fromForm: "true"}
});
    
  };

  const displayLocation = localLocation?.name 
  console.log(displayLocation, "display location details--");
  
  return (
    <View style={styles.locationContainer}>
      <Text style={styles.inputLabel}>
        Location {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      {loading ? (
        <View style={styles.locationCard}>
          <Text style={styles.loadingText}>Loading location...</Text>
        </View>
      ) : displayLocation ? (
        <View style={styles.locationCard}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationDetails}>
              <Text style={styles.locationAddress}>
                {displayLocation}
              </Text>
            
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.changeLocationButton}
            onPress={handleChangeLocation}
          >
            <Text style={styles.changeLocationText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addLocationButton}
          onPress={handleChangeLocation}
        >
          <Text style={styles.addLocationIcon}>📍</Text>
          <Text style={styles.addLocationText}>Add Location</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Image Upload Component
// export const ImageUploadSection = ({ 
//   images, 
//   onImagesChange, 
//   maxImages = 5, 
//   required = false,
//   isEdit = false
// }) => {
  
//   const requestCameraPermission = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
//     if (status !== 'granted') {
//       Alert.alert(
//         'Camera Permission Required',
//         'Please allow camera access to take photos.',
//         [{ text: 'OK' }]
//       );
//       return false;
//     }
//     return true;
//   };

//   const requestGalleryPermission = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
//     if (status !== 'granted') {
//       Alert.alert(
//         'Photo Library Permission Required',
//         'Please allow photo library access to choose images.',
//         [{ text: 'OK' }]
//       );
//       return false;
//     }
//     return true;
//   };


















  

//   const handleTakePhoto = async () => {
//     if (!images || images.length >= maxImages) {
//       Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
//       return;
//     }

//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) return;

//     try {
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ['images'],
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.8,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const newImages = [...(images || []), result.assets[0].uri];
//         onImagesChange(newImages);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to take photo. Please try again.');
//     }
//   };

//   const handleChooseFromGallery = async () => {
//     if (!images || images.length >= maxImages) {
//       Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
//       return;
//     }

//     const hasPermission = await requestGalleryPermission();
//     if (!hasPermission) return;

//     const remainingSlots = maxImages - (images?.length || 0);

//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ['images'],
//         allowsEditing: false,
//         quality: 0.8,
//         allowsMultipleSelection: true,
//         selectionLimit: remainingSlots,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const newImageUris = result.assets.map(asset => asset.uri);
//         const updatedImages = [...(images || []), ...newImageUris];
//         onImagesChange(updatedImages);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to select images. Please try again.');
//     }
//   };

//   // ✅ SIMPLE REMOVE FUNCTION - No extra props needed
//   const handleRemoveImage = (index) => {
//     const newImages = images.filter((_, i) => i !== index);
//     onImagesChange(newImages);
//   };

//   const canAddMore = !images || images.length < maxImages;

//   return (
//     <View style={styles.imageContainer}>
//       <Text style={styles.inputLabel}>
//         Property Images {required && <Text style={styles.required}>*</Text>}
//       </Text>
//       <Text style={styles.imageSubtext}>
//         Add up to {maxImages} photos to showcase your property
//         {isEdit && " - Remove images by tapping the × button"}
//       </Text>

//       <View style={styles.disclaimerContainer}>
//         <Ionicons name="information-circle" size={18} color="#7A5AF8" />
//         <Text style={styles.disclaimerText}>
//           First image will be used as thumbnail
//         </Text>
//       </View>

//       {/* Image Previews */}
//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false} 
//         style={styles.imageScrollView}
//       >
//         {images?.map((imageUri, index) => (
//           <View key={index} style={styles.imagePreview}>
//             <Image source={{ uri: imageUri }} style={styles.previewImage} />
//             {index === 0 && (
//               <View style={styles.thumbnailBadge}>
//                 <Text style={styles.thumbnailBadgeText}>Main</Text>
//               </View>
//             )}
//             <TouchableOpacity
//               style={styles.removeImageButton}
//               onPress={() => handleRemoveImage(index)}
//             >
//               <Text style={styles.removeImageText}>×</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </ScrollView>

//       {/* Action Buttons */}
//       {canAddMore && (
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity 
//             style={styles.actionButton} 
//             onPress={handleTakePhoto}
//           >
//             <Ionicons name="camera" size={20} color="#7A5AF8" />
//             <Text style={styles.buttonText}>Take Photo</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={styles.actionButton} 
//             onPress={handleChooseFromGallery}
//           >
//             <Ionicons name="images" size={20} color="#7A5AF8" />
//             <Text style={styles.buttonText}>Choose from Gallery</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {!canAddMore && (
//         <Text style={styles.limitText}>
//           Maximum {maxImages} images reached
//         </Text>
//       )}
//     </View>
//   );
// };

export const ImageUploadSection = ({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  required = false,
  isEdit = false
}) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: []
  });
  
  // Track permission denials
  const [cameraDenialCount, setCameraDenialCount] = useState(0);
  const [galleryDenialCount, setGalleryDenialCount] = useState(0);

  const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      setCameraDenialCount(prev => prev + 1);
      
      if (cameraDenialCount >= 0) {
        // Second denial - show modal with settings option
        showAlert(
          'Camera Permission Required',
          'Camera access is required to take photos. Please enable it in settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setCameraDenialCount(0)
            },
            {
              text: 'Go to Settings',
              onPress: openAppSettings
            }
          ]
        );
      } else {
        // First denial - show regular prompt
        showAlert(
          'Camera Permission Required',
          'Please allow camera access to take photos.',
          [{ 
            text: 'OK',
            onPress: () => {} 
          }]
        );
      }
      return false;
    }
    
    // Reset counter if permission granted
    setCameraDenialCount(0);
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      setGalleryDenialCount(prev => prev + 1);
      
      if (galleryDenialCount >= 1) {
        // Second denial - show modal with settings option
        showAlert(
          'Photo Library Permission Required',
          'Photo library access is required to choose images. Please enable it in settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setGalleryDenialCount(0)
            },
            {
              text: 'Go to Settings',
              onPress: openAppSettings
            }
          ]
        );
      } else {
        // First denial - show regular prompt
        showAlert(
          'Photo Library Permission Required',
          'Please allow photo library access to choose images.',
          [{ 
            text: 'OK',
            onPress: () => {} 
          }]
        );
      }
      return false;
    }
    
    // Reset counter if permission granted
    setGalleryDenialCount(0);
    return true;
  };

  const handleTakePhoto = async () => {
    if (!images || images.length >= maxImages) {
      showAlert(
        'Limit Reached', 
        `You can only upload up to ${maxImages} images.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const newImages = [...(images || []), result.assets[0].uri];
        onImagesChange(newImages);
      }
    } catch (error) {
      showAlert(
        'Error', 
        'Failed to take photo. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleChooseFromGallery = async () => {
    if (!images || images.length >= maxImages) {
      showAlert(
        'Limit Reached', 
        `You can only upload up to ${maxImages} images.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const remainingSlots = maxImages - (images?.length || 0);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUris = result.assets.map(asset => asset.uri);
        const updatedImages = [...(images || []), ...newImageUris];
        onImagesChange(updatedImages);
      }
    } catch (error) {
      showAlert(
        'Error', 
        'Failed to select images. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // ✅ SIMPLE REMOVE FUNCTION - No extra props needed
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = !images || images.length < maxImages;

  return (
    <View style={styles.imageContainer}>
      <Text style={styles.inputLabel}>
        Property Images {required && <Text style={styles.required}>*</Text>}
      </Text>
      <Text style={styles.imageSubtext}>
        Add up to {maxImages} photos to showcase your property
        {isEdit && " - Remove images by tapping the × button"}
      </Text>

      <View style={styles.disclaimerContainer}>
        <Ionicons name="information-circle" size={18} color="#7A5AF8" />
        <Text style={styles.disclaimerText}>
          First image will be used as thumbnail
        </Text>
      </View>

      {/* Image Previews */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.imageScrollView}
      >
        {images?.map((imageUri, index) => (
          <View key={index} style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            {index === 0 && (
              <View style={styles.thumbnailBadge}>
                <Text style={styles.thumbnailBadgeText}>Main</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      {canAddMore && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleTakePhoto}
          >
            <Ionicons name="camera" size={20} color="#7A5AF8" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleChooseFromGallery}
          >
            <Ionicons name="images" size={20} color="#7A5AF8" />
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {!canAddMore && (
        <Text style={styles.limitText}>
          Maximum {maxImages} images reached
        </Text>
      )}

      {/* Custom Alert Modal */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
container: {
  marginBottom: 20,

},
label: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1a1a1a',
  marginBottom: 8,
},
required: {
  color: '#FF4D4F',
},
inputContainer2: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1.5,
  borderColor: '#E0E0E0',
  borderRadius: 12,
 
  paddingHorizontal: 14,
  paddingVertical: 4,
},
inputContainerError: {
  borderColor: '#FF4D4F',
},
prefixText: {
  fontSize: 16,
  fontWeight: '500',
  // color: '#7A5AF8',
  marginRight: 5,
  marginLeft: 1,
},
input: {
  flex: 1,
  paddingVertical: 12,
  fontSize: 16,
  color: '#1a1a1a',
},
counterText: {
  fontSize: 12,
  color: '#999',
  fontWeight: '500',
  marginLeft: 8,
},
counterComplete: {
  color: '#52C41A',
  fontWeight: '600',
},
errorText: {
  fontSize: 13,
  color: '#FF4D4F',
  marginTop: 6,
},
successText: {
  fontSize: 13,
  color: '#52C41A',
  marginTop: 6,
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
   textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
    fontSize: 16,
    color: '#000',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  disclaimerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  // backgroundColor: '#F3F0FF',
  // paddingVertical: 10,
  // paddingHorizontal: 12,
  borderRadius: 8,
  marginBottom: 12,
  gap: 8,
},
disclaimerText: {
  flex: 1,
  fontSize: 13,
  color: '#7A5AF8',
  lineHeight: 18,
},
thumbnailBadge: {
  position: 'absolute',
  top: 8,
  left: 8,
  backgroundColor: '#7A5AF8',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 4,
},
thumbnailBadgeText: {
  color: '#FFFFFF',
  fontSize: 11,
  fontWeight: '600',
},

  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  selectionContainer: {
    marginBottom: 24,
  
  },
  optionsContainer: {
flexWrap: 'wrap',
    flexDirection: 'row',
   
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#7A5AF8',
    borderColor: '#7A5AF8',
  },
  optionText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  numberPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  numberButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7A5AF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  numberButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#999999',
  },
  numberDisplay: {
    width: 60,
    height: 44,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  numberText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
  locationContainer: {
    marginBottom: 24,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationDetails: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  locationSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  changeLocationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#7A5AF8',
    borderRadius: 20,
  },
  changeLocationText: {
    fontSize: 14,
    color: '#7A5AF8',
    fontWeight: '500',
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  addLocationIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  addLocationText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  imageContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  required: {
    color: '#E74C3C',
  },
  imageSubtext: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  imageScrollView: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imagePreview: {
    marginTop: 8,
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginRight: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // backgroundColor: '#FAFAFA',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#7A5AF8',
    fontWeight: '500',
  },
  limitText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
});