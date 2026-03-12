import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { registrationStyles } from './styles';
import StepIndicator from './components/StepIndicator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';

export const ReviewSubmitScreen = () => {
       const navigation = useNavigation<NativeStackNavigationProp<any>>();
      const styles = registrationStyles;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  const handleSubmit = async () => {
    Alert.alert('Submit Registration', 'Are you sure you want to submit?', [
      { text: 'Cancel' },
      {
        text: 'Submit',
        onPress: async () => {
        //   setLoading(true);
        //   const result = await apiService.submitRegistration({});
        //   setLoading(false);
        //   if (result.success) {
        //     setApplicationId('#REG-2025-882');
        //     setSubmitted(true);
        //   } else {
        //     Alert.alert('Error', result.error);
        //   }
        },
      },
    ]);
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Icon xml={SVG_ICONS.loginBox} />
          </View>
          <Text style={styles.headerTitle}>Customer Registration</Text>
        </View>

        <StepIndicator currentStep={5} />

        <View style={styles.successContainer}>
          <View style={styles.successIconLarge}>
            <Text style={styles.successCheckLarge}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Registration Submitted!</Text>
          <Text style={styles.successMessage}>
            Your application ID is{' '}
            <Text style={styles.appId}>{applicationId}</Text>. Our compliance
            team will review your documents within 24-48 hours.
          </Text>

          <View style={styles.infoBoxBlue}>
            <Text style={styles.infoIconBlue}>ℹ️</Text>
            <Text style={styles.infoTextBlue}>
              You can still log in to track your status, but ordering will be
              enabled after approval.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, { flex: 1, marginRight: 0 }]}
          >
            <Text style={styles.continueText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>📋</Text>
        </View>
        <Text style={styles.headerTitle}>Customer Registration</Text>
      </View>

      <StepIndicator currentStep={5} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Review & Submit</Text>
        <Text style={styles.subtitle}>
          Please review all information before submitting.
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text style={styles.cancelText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.continueText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
