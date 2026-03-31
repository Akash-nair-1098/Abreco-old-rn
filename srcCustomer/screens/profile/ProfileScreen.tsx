import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this is installed
import { useTranslation } from 'react-i18next';
import * as NavigationService from '../../navigation/NavigationService';
import { SVG_ICONS } from '../../assets/icons/svg';
import Icon from '../../../Icon';
import { useAuthStore } from '../../store/useAuthStore';
import { deleteAccountApi } from '../../api/auth/authApi';
import { useToast } from '../../components/ToastContext';
import i18n from '../../utilities/i18n';
import { useTheme } from '../../../ThemeContext';
import { getProfileDetails } from '../../api/products/productsApi';

const { width } = Dimensions.get('window');
const GRID_PADDING = 20;
const GRID_GAP = 12;
const STAT_CARD_WIDTH = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'es', label: 'Español' },
  { code: 'zh-CN', label: '中文' },
];

const THEMES = [
  { id: 'system', label: 'System', icon: SVG_ICONS.suitecase },
  { id: 'light', label: 'Light', icon: SVG_ICONS.suitecase },
  { id: 'dark', label: 'Dark', icon: SVG_ICONS.suitecase },
];

const ProfileScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const styles = makeStyles(colors, isDark);
  const [profileData, setProfileData] = useState<any>();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => {
    getProfileData();
  }, []);

  const getProfileData = async () => {
    try {
      const result = await getProfileDetails();
      setProfileData(result);
    } catch (error) {
      console.error('Profile fetch failed', error);
    }
  };

  const toggleLangDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLangOpen(!isLangOpen);
    if (isThemeOpen) setIsThemeOpen(false);
  };

  const toggleThemeDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsThemeOpen(!isThemeOpen);
    if (isLangOpen) setIsLangOpen(false);
  };

  const changeLanguage = async (code: string) => {
    try {
      await i18n.changeLanguage(code);
      await AsyncStorage.setItem('user-language', code); // Persistence Layer
      toggleLangDropdown();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('profile.sign_out'), t('profile.sign_out_confirm'), [
      { text: t('profile.cancel'), style: 'cancel' },
      {
        text: t('profile.sign_out'),
        style: 'destructive',
        onPress: () => useAuthStore.getState().logout(),
      },
    ]);
  };

  const processDeletion = async () => {
    try {
      await deleteAccountApi();
      useAuthStore.getState().logout();
      Alert.alert(t('profile.success'), t('profile.delete_success'));
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to delete account', 'error');
    }
  };

  const handleDelete = () => {
    Alert.alert(t('profile.delete_acc'), t('profile.delete_confirm'), [
      { text: t('profile.cancel'), style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: processDeletion },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.logoContainer}>
            <Icon xml={SVG_ICONS.forknife} size={40} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.businessName}>{profileData?.company_name || 'Loading...'}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>{t('profile.verified')}</Text>
            </View>
            <View style={styles.idRow}>
              <Icon xml={SVG_ICONS.suitecase} size={13} color={colors.textMuted} />
              <Text style={styles.businessId}>{profileData?.erp_customer_id}</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label={t('profile.wallet')}
            value={profileData?.wallet ?? 'Coming soon!'}
            icon={SVG_ICONS.wallet}
            showHistory
            t={t}
            styles={styles}
            colors={colors}
          />
          <StatCard
            label={t('profile.total_limit')}
            value={profileData?.erp_credit_limit || '0'}
            icon={SVG_ICONS.card}
            styles={styles}
            colors={colors}
          />
          <StatCard
            label={t('profile.used_credit')}
            value={profileData?.used_credit || '0'}
            icon={SVG_ICONS.percent}
            progress={0.4}
            styles={styles}
            colors={colors}
          />
          <StatCard
            label={t('profile.credit_days')}
            value={profileData?.erp_credit_days || '0'}
            icon={SVG_ICONS.timer}
            subValue="Next Due: 15 Oct"
            styles={styles}
            colors={colors}
          />
        </View>

        {/* Menu List */}
        <View style={styles.menuList}>
          {/* Theme Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={toggleThemeDropdown}>
              <View style={styles.menuIconContainer}>
                <Icon xml={SVG_ICONS.branchesBuilding} color={colors.text} />
              </View>
              <Text style={styles.menuLabel}>{t('app_theme')}</Text>
              <Text style={styles.activeLangText}>
                {t(themeMode.charAt(0).toUpperCase() + themeMode.slice(1))}
              </Text>
              <View style={{ transform: [{ rotate: isThemeOpen ? '90deg' : '0deg' }] }}>
                <Icon xml={SVG_ICONS.rightArrow} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
            {isThemeOpen && (
              <View style={styles.langList}>
                {THEMES.map(theme => (
                  <TouchableOpacity
                    key={theme.id}
                    style={styles.langOption}
                    onPress={() => {
                      setThemeMode(theme.id as 'system' | 'light' | 'dark');
                      toggleThemeDropdown();
                    }}
                  >
                    <Text style={[styles.langText, themeMode === theme.id && styles.activeLangLabel]}>
                      {t(theme.label)}
                    </Text>
                    {themeMode === theme.id && <View style={styles.activeDot} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Language Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={toggleLangDropdown}>
              <View style={styles.menuIconContainer}>
                <Icon xml={SVG_ICONS.languageIcon || SVG_ICONS.forknife} color={colors.text} />
              </View>
              <Text style={styles.menuLabel}>{t('profile.change_lang')}</Text>
              <Text style={styles.activeLangText}>
                {LANGUAGES.find(l => l.code === i18n.language)?.label}
              </Text>
              <View style={{ transform: [{ rotate: isLangOpen ? '90deg' : '0deg' }] }}>
                <Icon xml={SVG_ICONS.rightArrow} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
            {isLangOpen && (
              <View style={styles.langList}>
                {LANGUAGES.map(lang => (
                  <TouchableOpacity key={lang.code} style={styles.langOption} onPress={() => changeLanguage(lang.code)}>
                    <Text style={[styles.langText, i18n.language === lang.code && styles.activeLangLabel]}>
                      {lang.label}
                    </Text>
                    {i18n.language === lang.code && <View style={styles.activeDot} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <MenuItem icon={SVG_ICONS.branchesBuilding} label={t('profile.branches')} onPress={() => NavigationService.navigate('BranchLocationScreen')} styles={styles} colors={colors} />
          <MenuItem icon={SVG_ICONS.transactionHistory} label={t('profile.transactions')} onPress={() => NavigationService.navigate('TransactionScreen')} styles={styles} colors={colors} />
          <MenuItem icon={SVG_ICONS.invoiceDollar} label={t('profile.invoices')} onPress={() => NavigationService.navigate('InvoiceScreen')} styles={styles} colors={colors} />
          <MenuItem icon={SVG_ICONS.fileIcon} label={t('profile.privacy')} onPress={() => NavigationService.navigate('LegalDocScreen', { docType: 'privacy_policy' })} styles={styles} colors={colors} />
          <MenuItem icon={SVG_ICONS.fileIcon} label={t('profile.terms')} onPress={() => NavigationService.navigate('LegalDocScreen', { docType: 'customer_terms' })} styles={styles} colors={colors} />

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Icon xml={SVG_ICONS.deleteIcon} color="#F43F5E" />
            <Text style={styles.signOutText}>{t('profile.delete_acc')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Icon xml={SVG_ICONS.signOut} color="#F43F5E" />
          <Text style={styles.signOutText}>{t('profile.sign_out')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ label, value, icon, showHistory, progress, subValue, onPress, t, styles, colors }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <Icon xml={icon} size={15} color={colors.textMuted} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    {showHistory && (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.viewHistory}>{t('profile.view_history')} {'>'}</Text>
      </TouchableOpacity>
    )}
    {progress !== undefined && (
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
    )}
    {subValue && <Text style={styles.statSub}>{subValue}</Text>}
  </View>
);

const MenuItem = ({ icon, label, onPress, showBadge, styles, colors }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Icon xml={icon} color={colors.text} />
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    {showBadge && <View style={styles.redDot} />}
    <Icon xml={SVG_ICONS.rightArrow} color={colors.textMuted} />
  </TouchableOpacity>
);

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: GRID_PADDING },
    headerCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    logoContainer: {
      width: 70,
      height: 70,
      borderRadius: 20,
      backgroundColor: isDark ? colors.background : '#F1F5F9',
      borderWidth: 2,
      borderColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    headerInfo: { flex: 1 },
    businessName: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    verifiedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
    verifiedText: { color: '#10B981', fontSize: 10, fontWeight: '800' },
    idRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    businessId: { color: colors.textMuted, fontSize: 12, marginLeft: 6 },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GRID_GAP,
      marginBottom: 20,
    },
    statCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 14,
      width: STAT_CARD_WIDTH,
      minHeight: 110,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    statLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '800', marginLeft: 6, textTransform: 'uppercase' },
    statValue: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    viewHistory: { color: colors.primary, fontSize: 11, fontWeight: '600', marginTop: 8 },
    statSub: { color: colors.textMuted, fontSize: 10, marginTop: 6 },
    progressBarBg: { height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 12 },
    progressBarFill: { height: '100%', backgroundColor: '#F43F5E', borderRadius: 2 },
    menuList: { gap: 12, marginBottom: 20 },
    dropdownContainer: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: isDark ? 1 : 0, borderColor: colors.border },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 14, borderRadius: 16 },
    menuIconContainer: { width: 40, height: 40, backgroundColor: isDark ? colors.background : '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    menuLabel: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
    activeLangText: { color: colors.primary, fontSize: 14, marginRight: 10 },
    langList: { paddingBottom: 10, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: colors.border },
    langOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    langText: { color: colors.textMuted, fontSize: 15 },
    activeLangLabel: { color: colors.primary, fontWeight: 'bold' },
    activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
    redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F43F5E', marginRight: 10 },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(244, 63, 94, 0.05)' : '#FFF1F2', borderWidth: 1, borderColor: 'rgba(244, 63, 94, 0.2)', padding: 16, borderRadius: 16, marginTop: 10 },
    signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16, marginBottom: 40, borderWidth: isDark ? 1 : 0, borderColor: colors.border },
    signOutText: { color: '#F43F5E', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  });

export default ProfileScreen;