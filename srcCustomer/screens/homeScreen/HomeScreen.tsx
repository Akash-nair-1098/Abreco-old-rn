import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import PromoCarousel from '../../components/carousel/PromoCarousel';
import ProductCardComponent from '../../components/ProductCardComponent';
import { useSearchStore } from '../../store/useSearchStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../components/ToastContext';
import { useTheme } from '../../../ThemeContext'; // Integrated Theme

import {
  getFeaturedProducts,
  getTodaysDeals,
  getHeroBanners,
  getExclusiveOffers,
} from '../../api/products/productsApi';
import { setNewPassword } from '../../api/auth/authApi';

const CustomerHomeScreen = () => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);
  const { showToast } = useToast();

  const searchText = useSearchStore(state => state.searchText);
  const { hasPasswordChanged, setAuth, refreshToken, accessToken } =
    useAuthStore();
  const isFocused = useIsFocused();

  // Data States
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [todaysDeals, setTodaysDeals] = useState<any[]>([]);
  const [exclusiveOffers, setExclusiveOffers] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Password Modal States
  const [newPassword, setNewPasswordInput] = useState('');
  const [confirmPassword, setConfirmPasswordInput] = useState('');
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validations = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    special: /[@$!%*?&#]/.test(newPassword),
  };

  useEffect(() => {
    if (isFocused && hasPasswordChanged === false) {
      setShowPwdModal(true);
    }
  }, [isFocused, hasPasswordChanged]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, featuredRes, dealsRes, exclusiveRes] =
          await Promise.all([
            getHeroBanners().catch(() => []),
            getFeaturedProducts().catch(() => []),
            getTodaysDeals().catch(() => []),
            getExclusiveOffers().catch(() => []),
          ]);

        setHeroBanners(
          (bannersRes || []).map((b: any) => ({
            title: b.title || 'Special Offer',
            subtitle: b.subtitle || '',
            offerTag: b.discount_text || '',
            image:
              b.background_image_url || 'https://via.placeholder.com/800x400',
            buttonColor: colors.primary, // Use theme primary color
          })),
        );

        setFeaturedProducts(featuredRes || []);
        setTodaysDeals(dealsRes || []);
        setExclusiveOffers(exclusiveRes || []);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchData();
  }, [isFocused]);

  // console.log('featured is', featuredProducts);
  // console.log('todays deals is', todaysDeals);
  // console.log('exclusive offers is', exclusiveOffers);
  

  const handleUpdatePassword = async () => {
    setLocalError(null);
    if (!newPassword || !confirmPassword) {
      setLocalError(t('please_fill_all_fields'));
      return;
    }

    const allValid = Object.values(validations).every(v => v);
    if (!allValid) {
      setLocalError(t('please_fix_password_requirements'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError(t('passwords_do_not_match'));
      return;
    }

    setIsSubmittingPwd(true);
    try {
      await setNewPassword({
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });

      setAuth(refreshToken!, accessToken!, true);
      setShowPwdModal(false);
      setTimeout(
        () => showToast(t('password_updated_success'), 'success'),
        600,
      );
    } catch (error: any) {
      setLocalError(
        error?.response?.data?.message || t('failed_to_update_password'),
      );
    } finally {
      setIsSubmittingPwd(false);
    }
  };

  const Requirement = ({ met, label }: { met: boolean; label: string }) => (
    <View style={styles.reqRow}>
      <View
        style={[
          styles.bullet,
          {
            backgroundColor: met ? colors.success || '#22C55E' : colors.border,
          },
        ]}
      />
      <Text
        style={[
          styles.reqText,
          { color: met ? colors.text : colors.textMuted },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (isInitialLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <PromoCarousel data={heroBanners.length > 0 ? heroBanners : []} />

        <View style={styles.sectionContainer}>
          {featuredProducts.length > 0 && (
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>{t('featured_products')}</Text>
              <FlatList
                data={featuredProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                // keyExtractor={item => item?.id?.toString()}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => <ProductCardComponent item={item} />}
              />
            </View>
          )}

          {todaysDeals.length > 0 && (
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>{t('daily_deals')}</Text>
              <FlatList
                data={todaysDeals}
                horizontal
                showsHorizontalScrollIndicator={false}
                // keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => <ProductCardComponent item={item} />}
              />
            </View>
          )}

          {exclusiveOffers.length > 0 && (
            <View style={styles.sectionWrapper}>
              <Text style={styles.sectionTitle}>{t('exclusive_offers')}</Text>
              <FlatList
                data={exclusiveOffers}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listPadding}
                renderItem={({ item }) => <ProductCardComponent item={item} />}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Password Modal */}
      <Modal visible={showPwdModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('update_password')}</Text>
            <Text style={styles.modalSub}>{t('set_your_new_password')}</Text>

            {localError && (
              <View style={styles.errorContainer}>
                <Text style={styles.localErrorText}>{localError}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder={t('new_password')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              onChangeText={val => {
                setNewPasswordInput(val);
                setLocalError(null);
              }}
            />

            <View style={styles.reqContainer}>
              <Requirement
                met={validations.length}
                label={t('password_min_length')}
              />
              <Requirement
                met={validations.upper}
                label={t('password_uppercase')}
              />
              <Requirement
                met={validations.lower}
                label={t('password_lowercase')}
              />
              <Requirement
                met={validations.special}
                label={t('password_special')}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder={t('confirm_password')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              onChangeText={val => {
                setConfirmPasswordInput(val);
                setLocalError(null);
              }}
            />

            <TouchableOpacity
              style={[
                styles.btn,
                (isSubmittingPwd ||
                  !Object.values(validations).every(v => v)) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleUpdatePassword}
              disabled={isSubmittingPwd}
            >
              {isSubmittingPwd ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnText}>{t('confirm')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    sectionContainer: {
      paddingVertical: 10,
    },
    sectionWrapper: {
      marginBottom: 24,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: 'bold',
      marginLeft: 16,
      marginBottom: 12,
    },
    listPadding: {
      paddingHorizontal: 12,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 25,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
    modalSub: { color: colors.textMuted, fontSize: 14, marginBottom: 15 },
    errorContainer: {
      backgroundColor: 'rgba(248, 113, 113, 0.1)',
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
    },
    localErrorText: {
      color: '#F87171',
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 16,
      color: colors.text,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reqContainer: { marginBottom: 15, paddingHorizontal: 5 },
    reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    bullet: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    reqText: { fontSize: 12 },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      padding: 18,
      alignItems: 'center',
      marginTop: 10,
    },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  });

export default CustomerHomeScreen;
