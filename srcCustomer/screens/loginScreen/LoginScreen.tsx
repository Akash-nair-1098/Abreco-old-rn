import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../ThemeContext';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useAuthStore } from '../../store/useAuthStore';
import { login } from '../../api/auth/authApi';
import { useTranslation } from 'react-i18next';
import i18n from '../../utilities/i18n';
import { loginScreenStyles } from './styles';
import { useToast } from '../../components/ToastContext';

const LoginScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = loginScreenStyles(insets, colors, isDark);
 const {t} = useTranslation(undefined, {i18n});
  const { showToast } = useToast()

  const [customerId, setCustomerId] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    customerId?: string;
    customerCode?: string;
  }>({});

  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async () => {
    setErrors({});
    if (!customerId || !customerCode) {
      setErrors({
        customerId: !customerId ? 'Email/ID is required' : undefined,
        customerCode: !customerCode ? 'Password is required' : undefined,
      });
      return;
    }

    setLoading(true);
    try {
      const data = await login({
        username: customerId,
        password: customerCode,
        language: 'English',
      });

      if (data?.access) {
        setAuth(data.refresh, data.access, data.has_password_changed);
      } else {
        if (data.rejected) {
          navigation.navigate('BusinessDetails', {
            user_id: data.user_id,
            secret_token: data.secret_token,
            phone_number: data.phone_number,
            isRejected: true,
          });
        } else {
          // NEW LOGIC: If not rejected and no token, it means it's pending review
          navigation.navigate('RegistrationStatus', {
            user_id: data.user_id,
          });
        }
      }
    } catch (error: any) {
      showToast(error?.message ?? 'Login Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={
                isDark
                  ? require('../../assets/images/logoWhite.png')
                  : require('../../assets/images/logoWhite.png') 
              }
              style={styles.logo}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{t('welcome')}</Text>
            <Text style={styles.subtitle}>{t('signin_desc')}</Text>

            <Text style={styles.label}>Customer Email</Text>
            <View
              style={[
                styles.inputContainer,
                errors.customerId ? styles.errorBorder : null,
              ]}
            >
              <View style={styles.iconPrefix}>
                <Icon
                  xml={SVG_ICONS.userIcon}
                  size={20}
                  color={colors.textMuted}
                />
              </View>
              <TextInput
                autoCapitalize="none"
                style={styles.textInput}
                placeholder="e.g. john@example.com"
                placeholderTextColor={colors.textMuted}
                value={customerId}
                onChangeText={text => setCustomerId(text)}
              />
            </View>
            {errors.customerId && (
              <Text style={styles.errorText}>{errors.customerId}</Text>
            )}

            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                errors.customerCode ? styles.errorBorder : null,
              ]}
            >
              <View style={styles.iconPrefix}>
                <Icon
                  xml={SVG_ICONS.lockIcon}
                  size={20}
                  color={colors.textMuted}
                />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                value={customerCode}
                secureTextEntry={!showPassword}
                onChangeText={text => setCustomerCode(text)}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {/* <Icon
                  xml={showPassword ? SVG_ICONS.eyeIcon : SVG_ICONS.eyeOffIcon}
                  size={20}
                  color={colors.textMuted}
                /> */}
              </TouchableOpacity>
            </View>
            {errors.customerCode && (
              <Text style={styles.errorText}>{errors.customerCode}</Text>
            )}

            <View style={styles.buttonWrapper}>
              {/* <LinearGradient
                colors={['#C62828', "#C62828"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.gradientBtn}
              > */}
                <TouchableOpacity
                  style={styles.innerBtn}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              {/* </LinearGradient> */}
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.newText}>New user? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateAccount')}
              >
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.copyright}>
              © 2026 Abreco Group. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;