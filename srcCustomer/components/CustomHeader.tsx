import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Modal,
  FlatList,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import Icon from '../../Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import AddressBottomSheet from '../screens/checkoutScreen/components/AddressBottomsheet';
import {useAddressStore} from '../store/useAddressStore';
import {useSearchStore} from '../store/useSearchStore';
import {useTheme} from '../../ThemeContext';

import i18n from '../utilities/i18n';
import {globalSearchProducts} from '../api/products/productsApi';
import {getVoiceLocaleForAppLanguage} from '../utilities/voiceLocale';
import {startVoiceRecording, stopVoiceRecording} from '../utilities/audioRecord';
import {transcribeWithGemini} from '../utilities/geminiTranscribe';
import {runVoiceSearchFromTranscript} from '../utilities/voiceSearchFromTranscript';
import {useCartStore} from '../store/useCartStore';
import {useToast} from './ToastContext';

const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'ar', label: 'العربية'},
  {code: 'hi', label: 'हिन्दी'},
  {code: 'ml', label: 'മലയാളം'},
  {code: 'es', label: 'Español'},
  {code: 'zh-CN', label: '中文'},
];

const CustomHeader = ({hideSearchBar = false}: {hideSearchBar?: boolean}) => {
  const {t} = useTranslation();
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {setSelectedAddress, selectedAddress} = useAddressStore();
  const {searchText, setSearchText} = useSearchStore();
  const addToCart = useCartStore(state => state.addItem);
  const {showToast} = useToast();

  const [isSheetVisible, setSheetVisible] = useState(false);
  const [isLangSheetVisible, setLangSheetVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localInput, setLocalInput] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const styles = headerStyles(colors, isDark);

  const hasSearchedRef = useRef(false);
  const latestTranscriptRef = useRef('');

  const cleanupVoice = useCallback(async () => {
    setIsListening(false);
    hasSearchedRef.current = false;
    latestTranscriptRef.current = '';
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  useEffect(() => {
    setLocalInput(searchText);
  }, [searchText]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  useFocusEffect(
    useCallback(() => {
      return () => cleanupVoice();
    }, [cleanupVoice]),
  );

  const handleMicPressIn = async () => {
    if (isProcessing || isListening) return;
    try {
      await cleanupVoice();
      setIsListening(true);
      setLocalInput('');
      hasSearchedRef.current = false;

      const started = await startVoiceRecording();
      if (!started.ok) throw new Error(started.error);
    } catch (err: any) {
      showToast(err?.message || t('voice_error_message'), 'error');
      cleanupVoice();
    }
  };

  const handleMicPressOut = async () => {
    if (isProcessing || !isListening) return;
    setIsProcessing(true);
    try {
      const stopped = await stopVoiceRecording();
      if (!stopped.ok) throw new Error(stopped.error);

      const locale = getVoiceLocaleForAppLanguage(i18n.language);
      const res = await transcribeWithGemini({
        audioFilePath: stopped.filePath,
        languageHint: locale,
      });
      if (!res.ok) throw new Error(res.error);

      await handleVoiceSearchComplete(res.text);
    } catch (err: any) {
      showToast(err?.message || t('voice_error_message'), 'error');
    } finally {
      setIsProcessing(false);
      cleanupVoice();
    }
  };

  const handleVoiceSearchComplete = async (text: string) => {
    try {
      await runVoiceSearchFromTranscript(text, {
        setSearchText,
        showToast,
        t,
        enableAddToCartIntent: true,
        addToCart,
        onResults: (term, results) => {
          setLocalInput(term);
          navigation.navigate('SearchStack', {
            screen: 'VoiceSearchScreen',
            params: {
              results: results || [],
              term,
              isGlobalSearch: true,
            },
          });
        },
      });
    } finally {
      cleanupVoice();
    }
  };

  const handleSearchSubmit = async () => {
    const finalQuery = localInput.trim();
    if (!finalQuery || hideSearchBar) return;

    setSearchText(finalQuery);
    try {
      const results = await globalSearchProducts(finalQuery);
      navigation.navigate('SearchStack', {
        screen: 'VoiceSearchScreen',
        params: {
          results: results || [],
          term: finalQuery,
          isGlobalSearch: true,
        },
      });
    } catch {
      navigation.navigate('SearchStack', {
        screen: 'VoiceSearchScreen',
        params: {results: [], term: finalQuery, isGlobalSearch: true},
      });
    }
  };

  const clearSearch = () => {
    setLocalInput('');
    setSearchText('');
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLangSheetVisible(false);
  };

  return (
    <View style={[styles.headerContainer, {paddingTop: insets.top + 10}]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          style={styles.locationContainer}>
          <View style={styles.iconCircle}>
            <Icon
              xml={SVG_ICONS.locationPin}
              color={colors.primary}
              size={18}
            />
          </View>
          <View style={{marginLeft: 8}}>
            <Text style={styles.deliverLabel}>{t('deliver_to')}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.locationText} numberOfLines={1}>
                {selectedAddress?.location_name || t('select_location')}
              </Text>
              <Icon xml={SVG_ICONS.arrowDown} color={colors.text} size={12} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => setLangSheetVisible(true)}
            style={styles.iconButton}>
            <Icon xml={SVG_ICONS.languageIcon} color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('WishlistScreen')}
            style={styles.iconButton}>
            <Icon xml={SVG_ICONS.heart} color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CartStack')}
            style={styles.iconButton}>
            <Icon xml={SVG_ICONS.cart} color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon xml={SVG_ICONS.notification} color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {!hideSearchBar && (
        <View style={styles.searchSection}>
          <Icon xml={SVG_ICONS.searchLens} color={colors.textMuted} size={18} />

          <TextInput
            style={styles.input}
            placeholder={
              isListening
                ? t('voice_listening', {defaultValue: t('listening')})
                : t('search_placeholder')
            }
            placeholderTextColor={
              isListening ? colors.primary : colors.textMuted
            }
            value={localInput}
            onChangeText={setLocalInput}
            editable={!isListening}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
          />

          {localInput.length > 0 && !isListening && (
            <Pressable style={{paddingHorizontal: 8}} onPress={clearSearch}>
              <Icon
                xml={SVG_ICONS.closeIcon}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          )}

          <TouchableOpacity
            style={styles.searchActionButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('SearchStack', {
                screen: 'BarcodeSearchScreen',
              })
            }>
            <Icon
              xml={SVG_ICONS.barcodeScan}
              color={colors.textMuted}
              size={18}
            />
          </TouchableOpacity>

          <Pressable
            onPressIn={handleMicPressIn}
            onPressOut={handleMicPressOut}
            disabled={isProcessing}
            style={styles.micButton}>
            {isListening && (
              <Animated.View
                style={[styles.pulseCircle, {transform: [{scale: pulseAnim}]}]}
              />
            )}
            <Icon
              xml={SVG_ICONS.micIcon}
              color={isListening ? colors.primary : colors.textMuted}
              size={22}
            />
          </Pressable>
        </View>
      )}

      {/* Language Selection Modal */}
      <Modal
        visible={isLangSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangSheetVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLangSheetVisible(false)}>
          <View style={styles.langSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('select_language')}</Text>
            </View>
            <FlatList
              data={LANGUAGES}
              keyExtractor={item => item.code}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    i18n.language === item.code && styles.activeLangItem,
                  ]}
                  onPress={() => changeLanguage(item.code)}>
                  <Text
                    style={[
                      styles.langLabel,
                      i18n.language === item.code && styles.activeLangLabel,
                    ]}>
                    {item.label}
                  </Text>
                  {i18n.language === item.code && (
                    <Icon
                      xml={SVG_ICONS.successIcon}
                      color={colors.primary}
                      size={20}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      <AddressBottomSheet
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={(addr: any) => {
          setSelectedAddress(addr);
          setSheetVisible(false);
        }}
      />
    </View>
  );
};

const headerStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingBottom: 15,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    locationContainer: {flexDirection: 'row', alignItems: 'center', flex: 1},
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    deliverLabel: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    locationText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      maxWidth: 120,
      marginRight: 4,
    },
    actionButtons: {flexDirection: 'row', gap: 8},
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchSection: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      marginLeft: 10,
      height: '100%',
    },
    searchActionButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    micButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    pulseCircle: {
      position: 'absolute',
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary,
      opacity: 0.3,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    langSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 40,
      maxHeight: '50%',
    },
    sheetHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    sheetTitle: {fontSize: 18, fontWeight: 'bold', color: colors.text},
    langItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border,
    },
    activeLangItem: {backgroundColor: `${colors.primary}10`},
    langLabel: {fontSize: 16, color: colors.text},
    activeLangLabel: {color: colors.primary, fontWeight: 'bold'},
  });

export default CustomHeader;
