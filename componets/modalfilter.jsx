import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Dimensions
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const filters = {
  shared: [
    { key: 'showPhonePublic', label: 'Posts With Visible Phone Number' },
    { key: 'monthlyRent', label: 'Monthly Rent (₹)', type: 'range', min: 0, max: 10000, step: 500 },
    { key: 'roommatesWanted', label: 'Roommates Wanted', type: 'range', min: 1, max: 10, step: 1 },
    { 
      key: 'genderPreference', 
      label: 'Gender Preference', 
      options: ['Male', 'Female', 'Any'] 
    },
    { 
      key: 'habitPreferences', 
      label: 'Habits', 
      options: ['No Smoking', 'Fitness', 'Early Bird'] 
    },
    { 
      key: 'purpose', 
      label: 'Purpose', 
      options: ['Study', 'Job', 'Vacation'] 
    },
  ],
  pg: [
    // { key: 'AvailableSpace', label: 'Available Space' },
    { key: 'priceRange', label: 'Price Range (₹)', type: 'range', min: 0, max: 30000, step: 500 },
    { 
      key: 'pgGenderCategory', 
      label: 'Gender Category', 
      options: ['Ladies', 'Gents', 'Co'] 
    },
    { 
      key: 'roomTypesAvailable', 
      label: 'Room Types', 
      options: ['Single', 'Double'] 
    },
    { 
      key: 'mealsProvided', 
      label: 'Facilities', 
      options: ['Wi-Fi', 'Hot Water', 'Laundry'] 
    },
    { 
      key: 'rules', 
      label: 'Rules', 
      options: ['No Smoking', 'No Visitors', 'Quiet Hours'] 
    },
  ],
  rental: [
 { 
    key: 'propertyType', 
    label: 'Property Type', 
    options: ['Flats', 'Apartment', 'Houses'] 
  },
  { 
    key: 'furnishedStatus', 
    label: 'Furnishing', 
    options: ['Furnished', 'Semi-furnished', 'Unfurnished'] 
  },
  {
    key: 'preferredTenant',
    label: 'Preferred Tenant',
    options: ['Only Family', 'Any']
  },

  // 📐 Size & Layout
  { 
    key: 'squareFeet', 
    label: 'Square Feet', 
    type: 'range', 
    min: 100, 
    max: 5000, 
    step: 100 
  },
  { 
    key: 'bedrooms', 
    label: 'Bedrooms', 
    type: 'range', 
    min: 1, 
    max: 5, 
    step: 1 
  },
  { 
    key: 'bathrooms', 
    label: 'Bathrooms', 
    type: 'range', 
    min: 1, 
    max: 5, 
    step: 1 
  },

  // 💰 Cost Filters
  { 
    key: 'securityDeposit', 
    label: 'Security Deposit (₹)', 
    type: 'range', 
    min: 0, 
    max: 200000, 
    step: 5000 
  },
  { 
    key: 'monthlyRent', 
    label: 'Monthly Rent (₹)', 
    type: 'range', 
    min: 5000, 
    max: 100000, 
    step: 1000 
  },

 
]

};

// Map activeFilter values to filter keys
const filterCategoryMap = {
  'Shared Rooms': 'shared',
  'PG/Hostels': 'pg',
  'Rental Property': 'rental'
};

const FilterModal = ({ visible, onClose, activeFilter, onApplyFilters, appliedFilters }) => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const filterKey = filterCategoryMap[activeFilter];
  const filterOptions = filters[filterKey] || [];

  const prevFilterKeyRef = useRef(filterKey);
  const initializedRef = useRef(false);

  // When modal opens, load saved filters or reset if category changed

  useEffect(() => {
    if (visible) {
      if (prevFilterKeyRef.current !== filterKey) {
        // Category changed, reset filters
        initializeFilters();
        prevFilterKeyRef.current = filterKey;
        initializedRef.current = true;
      } else if (appliedFilters && Object.keys(appliedFilters).length > 0) {
        // Use previously applied filters
        setSelectedFilters(appliedFilters);
        initializedRef.current = true;
      } else if (!initializedRef.current) {
        // First time opening, initialize default state
        initializeFilters();
        initializedRef.current = true;
      }
      // If it's the same category and we've initialized before, 
      // keep the current state (don't reset)
    }
  }, [visible, filterKey, appliedFilters]);

  const initializeFilters = () => {
    const initialState = {};
    filterOptions.forEach(filter => {
      if (filter.type === 'range') {
        initialState[filter.key] = {
          min: filter.min,
          max: filter.max,
          selected: false,
          currentMin: filter.min,
          currentMax: filter.max
        };
      } else if (filter.options) {
        initialState[filter.key] = {
          options: filter.options.map(opt => ({ label: opt, selected: false })),
          selected: false
        };
      } else {
        initialState[filter.key] = {
          value: false,
          selected: false
        };
      }
    });
    setSelectedFilters(initialState);

  };

  const activeCount = useMemo(() => {
    return Object.values(selectedFilters).filter(filter => filter.selected).length;
  }, [selectedFilters]);

  const handleToggleOption = (filterKey, optionIndex) => {
    setSelectedFilters(prev => {
      const updatedFilter = { ...prev[filterKey] };
      updatedFilter.options[optionIndex].selected = !updatedFilter.options[optionIndex].selected;
      updatedFilter.selected = updatedFilter.options.some(opt => opt.selected);
      return {
        ...prev,
        [filterKey]: updatedFilter
      };
    });
  };

  const handleToggleSwitch = (filterKey) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        value: !prev[filterKey].value,
        selected: !prev[filterKey].value
      }
    }));
  };

  const handleMinRangeChange = (filterKey, value) => {
    setSelectedFilters(prev => {
      const validMin = Math.min(value, prev[filterKey].currentMax);
      return {
        ...prev,
        [filterKey]: {
          ...prev[filterKey],
          currentMin: validMin,
          selected: true
        }
      };
    });
  };

  const handleMaxRangeChange = (filterKey, value) => {
    setSelectedFilters(prev => {
      const validMax = Math.max(value, prev[filterKey].currentMin);
      return {
        ...prev,
        [filterKey]: {
          ...prev[filterKey],
          currentMax: validMax,
          selected: true
        }
      };
    });
  };

  
  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onClose();
  };

  const handleReset = () => {
    initializeFilters();
     onApplyFilters({});
  };

  const renderFilterItem = (filter) => {
    if (!selectedFilters[filter.key]) return null;

    if (!filter.type && !filter.options) {
      return (
    
 
        <View key={filter.key} style={styles.filterItems}>
          <Text style={styles.filterLabel}>{filter.label}</Text>
          <Switch
            value={selectedFilters[filter.key].value}
            onValueChange={() => handleToggleSwitch(filter.key)}
            trackColor={{ false: "#d9d9d9", true: "#7A5AF8" }}
            thumbColor={selectedFilters[filter.key].value ? "#fff" : "#f4f3f4"}
          />
        </View>
        
              
      );
    }

    if (filter.options) {
      return (
        <View key={filter.key} style={styles.filterItem}>
          <Text style={styles.filterLabel}>{filter.label}</Text>
          <View style={styles.optionsContainer}>
            {selectedFilters[filter.key].options.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.optionPill,
                  option.selected && styles.selectedPill
                ]}
                onPress={() => handleToggleOption(filter.key, index)}
              >
                <Text style={[
                  styles.optionText,
                  option.selected && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (filter.type === 'range') {
      const rangeData = selectedFilters[filter.key];
      return (
        <View key={filter.key} style={styles.filterItem}>
          <Text style={styles.filterLabel}>{filter.label}</Text>
          <View style={styles.rangeContainer}>
            <Text style={styles.rangeValue}>
              {rangeData.currentMin} - {rangeData.currentMax}
            </Text>
            <MultiSlider
              values={[rangeData.currentMin, rangeData.currentMax]}
              min={filter.min}
              max={filter.max}
              step={filter.step}
              onValuesChangeFinish={(values) => {
                const [minVal, maxVal] = values;
                setSelectedFilters(prev => ({
                  ...prev,
                  [filter.key]: {
                    ...prev[filter.key],
                    currentMin: minVal,
                    currentMax: maxVal,
                    selected: true
                  }
                }));
              }}
              selectedStyle={{ backgroundColor: '#7A5AF8' }}
              unselectedStyle={{ backgroundColor: '#d9d9d9' }}
              markerStyle={{ backgroundColor: '#7A5AF8' }}
            />
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar style="dark" translucent  />
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filter Options</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersScrollView}>
            {filterOptions.map(renderFilterItem)}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                Apply {activeCount > 0 ? `(${activeCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

  const maincolor = '#7A5AF8'

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  resetButton: {
    padding: 4,
  },
  resetText: {
    color: maincolor,
    fontWeight: '600',
  },
  filtersScrollView: {
    flex: 1,
    marginTop: 16,
  },
  filterItem: {
    marginBottom: 24,

  },
    filterItems: {
    marginBottom: 24,
 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPill: {
    backgroundColor: maincolor,
  },
  optionText: {
    color: '#000',
    fontSize: 14,
  },
  selectedOptionText: {
    color: '#fff',
  },
  rangeContainer: {
    marginTop: 8,
     alignItems: 'center'
  },
  rangeValue: {
 
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  sliderContainer: {
    marginTop: 8,
  
  },
  slider: {
    width: '100%',
    height: 40,
      alignItems: 'center',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: maincolor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilterModal;