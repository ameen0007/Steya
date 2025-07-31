import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ currentStep, totalSteps, stepTitle }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.stepInfo}>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.stepTitle}>{stepTitle}</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stepInfo: {
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#7A5AF8',
    fontWeight: '600',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7A5AF8',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7A5AF8',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});

export default ProgressBar;