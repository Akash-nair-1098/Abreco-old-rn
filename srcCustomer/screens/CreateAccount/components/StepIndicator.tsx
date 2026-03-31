import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles } from '../styles';
import { useTheme } from '../../../../ThemeContext';

interface StepIndicatorProps {
  currentStep: number;
  rejectedSteps?: number[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, rejectedSteps = [] }) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const steps = [
    { number: 1, label: 'BUSINESS', sublabel: 'DETAILS' },
    { number: 2, label: 'ADD', sublabel: 'CONTACTS' },
    { number: 3, label: 'KYC', sublabel: 'UPLOADS' },
    { number: 4, label: 'FINANCIAL', sublabel: 'INFO' },
    { number: 5, label: 'REVIEW &', sublabel: 'SUBMIT' },
  ];

  return (
    <View style={styles.stepContainer}>
      {steps.map(step => {
        const isRejected = rejectedSteps.includes(step.number);
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number && !isRejected;

        return (
          <View key={step.number} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                isActive && styles.stepActive,
                isCompleted && styles.stepCompleted,
                isRejected && styles.stepRejected,
              ]}
            >
              {isRejected ? (
                <Text style={styles.stepRejectedIcon}>✕</Text>
              ) : isCompleted ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={[styles.stepNumber, isActive && styles.stepNumberActive]}>
                  {step.number}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                isActive && styles.stepLabelActive,
                isRejected && styles.stepLabelRejected,
              ]}
            >
              {step.label}
            </Text>
            <Text
              style={[
                styles.stepSublabel,
                isActive && styles.stepSublabelActive,
                isRejected && styles.stepSublabelRejected,
              ]}
            >
              {step.sublabel}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default StepIndicator;