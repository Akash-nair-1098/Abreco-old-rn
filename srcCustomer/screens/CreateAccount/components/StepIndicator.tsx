import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { registrationStyles } from '../styles';

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {

    const styles= registrationStyles;
  const steps = [
    { number: 1, label: 'BUSINESS', sublabel: 'DETAILS' },
    { number: 2, label: 'ADD', sublabel: 'CONTACTS' },
    { number: 3, label: 'KYC', sublabel: 'UPLOADS' },
    { number: 4, label: 'FINANCIAL', sublabel: 'INFO' },
    { number: 5, label: 'REVIEW &', sublabel: 'SUBMIT' },
  ];

  return (
    <View style={styles.stepContainer}>
      {steps.map(step => (
        <View key={step.number} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep === step.number && styles.stepActive,
              currentStep > step.number && styles.stepCompleted,
            ]}
          >
            {currentStep > step.number ? (
              <Text style={styles.checkmark}>✓</Text>
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  currentStep === step.number && styles.stepNumberActive,
                ]}
              >
                {step.number}
              </Text>
            )}
          </View>
          <Text
            style={[
              styles.stepLabel,
              currentStep === step.number && styles.stepLabelActive,
            ]}
          >
            {step.label}
          </Text>
          <Text
            style={[
              styles.stepSublabel,
              currentStep === step.number && styles.stepSublabelActive,
            ]}
          >
            {step.sublabel}
          </Text>
        </View>
      ))}
    </View>
  );
};



export default StepIndicator;