import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

// Theme & Styles
import { makeStyles } from './styles';
import { useTheme } from '../../../ThemeContext';

// Components & Assets
import StepIndicator from './components/StepIndicator';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import {
  fetchSavedRegistrationData,
  submitCustomerInfo,
} from '../../api/auth/authApi';
import { useToast } from '../../components/ToastContext';
import { getApiErrorMessage } from '../../utilities/apiErrorMessage';

export const ReviewSubmitScreen = ({ route }: any) => {
  const { params } = route;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { showToast } = useToast();
  
  // Theme Integration
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const themedLocalStyles = makeLocalStyles(colors, isDark);
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');


    useEffect(() => {
      loadSavedData(1);
    }, []);

    const loadSavedData = async (step: number) => {
        try {
          if (params?.user_id) {
            const response = await fetchSavedRegistrationData(params.user_id);
            const data = response?.results?.data;
            console.log('saved dta ais', data)
    
            setApplicationId(data?.application_id);
            if (step === 2) {
              setSubmitted(true);
            }
          }
        } catch {
         console.log('error occured')
        } finally {
          // setFetchingData(false);
        }
      };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await submitCustomerInfo({
        secret_token: params?.secret_token ?? '',
        user_id: params?.user_id ?? '',
      }).then((data) => {
        // console.log('data is', data)
        loadSavedData(2);
      });
      // const id = data?.id ?? data?.application_id ?? '';
      // if (id) setApplicationId(String(id));
    } catch (error: any) {
      showToast(
        getApiErrorMessage(error, 'Submission failed. Please try again.'),
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  // --- SUBMITTED STATE UI ---
  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, themedLocalStyles.successBg]}>
        <View style={themedLocalStyles.successContent}>
          <View style={themedLocalStyles.greenCircle}>
            <Text style={themedLocalStyles.checkMark}>✓</Text>
          </View>

          <Text style={themedLocalStyles.successTitle}>Registration Submitted!</Text>
          
          <Text style={themedLocalStyles.successSubtext}>
            Your application has been received successfully. Our compliance team will review your documents within 24-48 hours.
          </Text>

          <View style={themedLocalStyles.idCard}>
            <Text style={themedLocalStyles.idLabel}>APPLICATION ID</Text>
            <Text style={themedLocalStyles.idValue}>{applicationId}</Text>
          </View>

          <TouchableOpacity 
            style={themedLocalStyles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={themedLocalStyles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- INITIAL REVIEW STATE UI ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section with Stepper */}
      <View style={themedLocalStyles.headerSection}>
        <View style={themedLocalStyles.headerTop}>
          <View style={themedLocalStyles.headerIconBox}>
            <Icon xml={SVG_ICONS.loginBox} size={20} color={colors.text} />
          </View>
          <Text style={themedLocalStyles.headerTitle}>Customer Registration</Text>
        </View>
        <StepIndicator currentStep={5} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Review & Submit</Text>
        <Text style={styles.subtitle}>
          Please review all information before submitting.
        </Text>
        
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleFinalSubmit}
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

// Local Style Factory
const makeLocalStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  headerSection: {
    backgroundColor: colors.background,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  successBg: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    width: '90%',
    alignItems: 'center',
  },
  greenCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkMark: {
    fontSize: 40,
    color: '#22C55E',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
  },
  successSubtext: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  idCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 40,
  },
  idLabel: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  idValue: {
    fontSize: 26,
    color: colors.text,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: colors.text, // White in dark mode, Black in light mode
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  loginText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});