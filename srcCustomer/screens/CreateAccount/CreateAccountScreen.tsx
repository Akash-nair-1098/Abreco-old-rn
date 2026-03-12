import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../../ThemeContext';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useToast } from '../../components/ToastContext';
import { registerCustomer, sendOtpApi } from '../../api/auth/authApi';
import { SCREEN_HEIGHT } from '../../utilities/dimensions';
import { RegisterPayload } from '../../api/auth/auth.type';
import { COUNTRY_CODES } from '../../utilities/Strings';
import Dropdown from '../../components/DropDown';

const CreateAccountScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  // Loading States
  const [loading, setLoading] = useState(false);
  const [sendotpLoading, setSendOtpLoading] = useState(false);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+971');

  // Status Statesx
  const [otpVisible, setOtpVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<any>({});

  const countryOptions = COUNTRY_CODES.map(country => ({
    id: country.code,
    name: `${country.flag} +${country.code}`,
  }));

  // Validation Logic
  const validateForm = () => {
    let newErrors: any = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.includes('@')) newErrors.email = 'Valid email is required';
    if (mobile.length < 8) newErrors.mobile = 'Enter a valid mobile number';
    if (otpVisible && otp.length !== 6) newErrors.otp = '6-digit OTP required';
    if (password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!agreed) newErrors.agreed = 'Please agree to terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Send OTP
  const handleSendOTP = async () => {
    if (mobile.length < 8) {
      setErrors({ ...errors, mobile: 'Enter a valid mobile number' });
      return;
    }

    setSendOtpLoading(true);
    try {
      await sendOtpApi({
        ph_cc: selectedCountryCode,
        phone_number: mobile,
      });
      showToast('OTP sent successfully!', 'success');
      setOtpVisible(true);
      setCountdown(60);
      setErrors({ ...errors, mobile: null }); // Clear mobile error
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setSendOtpLoading(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: RegisterPayload = {
        company_name: fullName,
        email: email,
        ph_cc: selectedCountryCode,
        phone_number: mobile,
        otp: otp,
        password: password,
        confirm_password: confirmPassword,
        is_terms_and_condition_agreed: agreed,
      };

      const result = await registerCustomer(payload);
      showToast('Account Created!', 'success');

      navigation.navigate('BusinessDetails', {
        secret_token: result.secret_token,
        phone_number: mobile,
      });
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Registration failed',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to clear errors when user types
  const onFieldChange = (field: string, value: any, setter: Function) => {
    setter(value);
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0B1222' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Step 1: Basic Information</Text>

            {/* Full Name */}
            <Text style={styles.label}>Company Name</Text>
            <View
              style={[
                styles.inputContainer,
                errors.fullName && styles.inputError,
              ]}
            >
              <View style={styles.iconPrefix}>
                <Icon xml={SVG_ICONS.userIcon} size={20} color="#94A3B8" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. John Doe"
                placeholderTextColor="#475569"
                value={fullName}
                onChangeText={v => onFieldChange('fullName', v, setFullName)}
              />
            </View>
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}

            {/* Email Address */}
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[styles.inputContainer, errors.email && styles.inputError]}
            >
              <View style={styles.iconPrefix}>
                <Icon xml={SVG_ICONS.mailIcon} size={20} color="#94A3B8" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="email@example.com"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={v => onFieldChange('email', v, setEmail)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Mobile Number */}
            <Text style={styles.label}>Mobile Number</Text>
            <View
              style={[
                styles.inputContainer,
                errors.mobile && styles.inputError,
              ]}
            >
              <Dropdown
                options={countryOptions}
                value={selectedCountryCode}
                onChange={s => setSelectedCountryCode(s.id)}
                rightIcon={SVG_ICONS.arrowDown}
                dropDownStyles={styles.countryDrop}
                optionStyles={{ color: 'white' }}
                placeholder="Code"
              />
              <TextInput
                style={[styles.textInput, { paddingLeft: 10 }]}
                placeholder="Mobile Number"
                placeholderTextColor="#475569"
                value={mobile}
                onChangeText={v => onFieldChange('mobile', v, setMobile)}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                onPress={handleSendOTP}
                disabled={countdown > 0}
              >
                <Text style={styles.verifyText}>
                  {sendotpLoading ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    'Send OTP'
                  )}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.mobile && (
              <Text style={styles.errorText}>{errors.mobile}</Text>
            )}

            {/* OTP Section */}
            {otpVisible && (
              <>
                <Text style={styles.label}>Enter OTP</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.otp && styles.inputError,
                  ]}
                >
                  <View style={styles.iconPrefix}>
                    <Icon
                      xml={SVG_ICONS.verifyIcon}
                      size={20}
                      color="#94A3B8"
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="123456"
                    placeholderTextColor="#475569"
                    value={otp}
                    onChangeText={v => onFieldChange('otp', v, setOtp)}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                {errors.otp && (
                  <Text style={styles.errorText}>{errors.otp}</Text>
                )}
              </>
            )}

            {/* Passwords */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.password && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••"
                    placeholderTextColor="#475569"
                    value={password}
                    onChangeText={v =>
                      onFieldChange('password', v, setPassword)
                    }
                    secureTextEntry
                  />
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Confirm</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••"
                    placeholderTextColor="#475569"
                    value={confirmPassword}
                    onChangeText={v =>
                      onFieldChange('confirmPassword', v, setConfirmPassword)
                    }
                    secureTextEntry
                  />
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            </View>

            {/* Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => onFieldChange('agreed', !agreed, setAgreed)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  agreed && {
                    backgroundColor: '#3B82F6',
                    borderColor: '#3B82F6',
                  },
                  errors.agreed && { borderColor: '#EF4444' },
                ]}
              >
                {agreed && (
                  <Icon
                    xml={`<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                    size={12}
                    color="white"
                  />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the{' '}
                <Text
                  onPress={() => {
                    navigation.navigate('LegalDocScreen', {
                      docType: 'customer_terms',
                    });
                  }}
                  style={styles.link}
                >
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text
                  onPress={() => {
                    navigation.navigate('LegalDocScreen', {
                      docType: 'privacy_policy',
                    });
                  }}
                  style={styles.link}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </TouchableOpacity>
            {errors.agreed && (
              <Text style={styles.errorText}>{errors.agreed}</Text>
            )}

            <TouchableOpacity
              onPress={handleRegister}
              style={[styles.btnWrapper, !agreed && { opacity: 0.7 }]}
            >
              <LinearGradient
                colors={['#EF4444', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnText}>Create & Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: SCREEN_HEIGHT * 0.05,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#94A3B8', fontSize: 14, marginTop: 4, marginBottom: 24 },
  label: { color: '#CBD5E1', fontSize: 14, marginBottom: 8, marginTop: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    height: 50,
  },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  iconPrefix: { paddingLeft: 12 },
  textInput: { flex: 1, color: 'white', fontSize: 15,marginLeft:10 },
  verifyText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    paddingRight: 15,
    fontSize: 13,
  },
  countryDrop: 
    {
      width: 100,
      borderRightWidth: 1,
      borderRightColor: '#334155',
      backgroundColor: 'transparent',
      borderWidth: 0,
      height: '100%',
    },
  row: { flexDirection: 'row', marginTop: 12 },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: { color: '#94A3B8', fontSize: 14, flex: 1 },
  link: { color: '#3B82F6', fontWeight: '600' },
  btnWrapper: { marginTop: 32 },
  gradientBtn: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default CreateAccountScreen;
