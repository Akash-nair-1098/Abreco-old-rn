import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { registrationStyles } from '../styles';
import StepIndicator from './StepIndicator';
import Icon from '../../../../Icon';
import { SVG_ICONS } from '../../../assets/icons/svg';

interface RegistrationLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  onContinue: () => void;
  onCancel?: () => void;
  loading?: boolean;
  continueText?: string;
}

const RegistrationLayout: React.FC<RegistrationLayoutProps> = ({
  children,
  currentStep,
  onContinue,
  onCancel,
  loading = false,
  continueText = 'Continue',
}) => {
  const styles = registrationStyles;

  return (
    <SafeAreaView style={styles.container}>
      {/* --- COMMON HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon xml={SVG_ICONS.loginBox} />
        </View>
        <Text style={styles.headerTitle}>Customer Registration</Text>
      </View>

      {/* --- COMMON STEP INDICATOR --- */}
      <StepIndicator currentStep={currentStep} />

      {/* --- DYNAMIC FORM CONTENT --- */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {children}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- COMMON FOOTER --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>
            {currentStep !== 1 ? 'Back' : 'Cancel'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={onContinue}
          disabled={loading}
        >
          {loading ? (
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
