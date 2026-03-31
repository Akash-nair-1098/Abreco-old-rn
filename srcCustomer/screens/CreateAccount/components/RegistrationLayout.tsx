import React from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { makeStyles } from '../styles';
import StepIndicator from './StepIndicator';
import Icon from '../../../../Icon';
import { SVG_ICONS } from '../../../assets/icons/svg';
import { useTheme } from '../../../../ThemeContext';

interface RegistrationLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  onContinue: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  continueText?: string;
  rejectedSteps?: number[];
}

const RegistrationLayout: React.FC<RegistrationLayoutProps> = ({
  children,
  currentStep,
  onContinue,
  onCancel,
  isLoading = false,
  continueText = 'Continue',
  rejectedSteps = [],
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon xml={SVG_ICONS.loginBox} />
        </View>
        <Text style={styles.headerTitle}>Customer Registration</Text>
      </View>

      <StepIndicator currentStep={currentStep} rejectedSteps={rejectedSteps} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isLoading}>
          <Text style={styles.cancelText}>{currentStep !== 1 ? 'Back' : 'Cancel'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, isLoading && { opacity: 0.7 }]}
          onPress={onContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.continueText}>{continueText}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationLayout;