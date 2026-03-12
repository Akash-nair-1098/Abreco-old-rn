import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';
import AddressBottomSheet from '../screens/checkoutScreen/components/AddressBottomsheet';
import { useAddressStore } from '../store/useAddressStore';
import { useSearchStore } from '../store/useSearchStore';
import { useTheme } from '../../ThemeContext';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice';
import { useToast } from './ToastContext';
import i18n from '../utilities/i18n';

const CustomHeader = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localTranscriptRef = useRef('');

  const [isSheetVisible, setSheetVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [localInput, setLocalInput] = useState('');

  const { setSelectedAddress, selectedAddress } = useAddressStore();
  const { searchText, setSearchText } = useSearchStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const styles = headerStyles(colors, isDark);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation for Pulse effect
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
  }, [isListening]);

  const stopAndCleanupVoice = async () => {
    if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    try {
      await Voice.stop();
      await Voice.destroy();
    } catch (e) {
      console.log('Stop Error:', e);
    } finally {
      setIsListening(false);
    }
  };

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      localTranscriptRef.current = '';
      setLocalInput('');
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = setTimeout(() => {
        stopAndCleanupVoice();
      }, 15000);
    };

    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        const newText = e.value[0];
        setLocalInput(newText);
        localTranscriptRef.current = newText;
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          handleSearchSubmit(localTranscriptRef.current);
          stopAndCleanupVoice();
        }, 2500);
      }
    };

    Voice.onSpeechError = e => {
      console.log('Voice Error:', e);
      stopAndCleanupVoice();
    };

    return () => {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const toggleVoiceSearch = async () => {
    try {
      if (isListening) {
        await stopAndCleanupVoice();
      } else {
        await Voice.destroy();
        setLocalInput('');
        setSearchText('');
        setIsListening(true);

        const localeMap: any = {
          en: 'en-US',
          ar: 'ar-SA',
          hi: 'hi-IN',
          ml: 'ml-IN',
          es: 'es-ES',
          'zh-CN': 'zh-CN',
        };
        const currentLocale = localeMap[i18n.language] || 'en-US';
        await Voice.start(currentLocale);
      }
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSearchSubmit = (textToSearch?: string) => {
    const finalQuery = textToSearch || localInput;
    if (finalQuery.trim().length === 0) return;
    setSearchText(finalQuery);
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          style={styles.locationContainer}
        >
          <View style={styles.iconCircle}>
            <Icon
              xml={SVG_ICONS.locationPin}
              color={colors.primary}
              size={18}
            />
          </View>
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.deliverLabel}>{t('deliver_to')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.locationText} numberOfLines={1}>
                {selectedAddress?.location_name || t('select_location')}
              </Text>
              <Icon xml={SVG_ICONS.arrowDown} color={colors.text} size={12} />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('WishlistScreen')}
            style={styles.iconButton}
          >
            <Icon xml={SVG_ICONS.heart} color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CartStack')}
            style={styles.iconButton}
          >
            <Icon xml={SVG_ICONS.cart} color={colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon xml={SVG_ICONS.notification} color={colors.text} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <Icon xml={SVG_ICONS.searchLens} color={colors.textMuted} size={18} />
        <TextInput
          style={styles.input}
          placeholder={isListening ? t('listening') : t('search_placeholder')}
          placeholderTextColor={isListening ? colors.primary : colors.textMuted}
          value={localInput}
          onChangeText={setLocalInput}
          editable={!isListening}
          returnKeyType="search"
          onSubmitEditing={() => handleSearchSubmit()}
        />

        {localInput.length > 0 && !isListening && (
          <Pressable
            style={{ paddingHorizontal: 8 }}
            onPress={() => {
              setLocalInput('');
              setSearchText('');
            }}
          >
            <Icon
              xml={SVG_ICONS.closeIcon}
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        )}

        <TouchableOpacity onPress={toggleVoiceSearch} style={styles.micButton}>
          {isListening && (
            <Animated.View
              style={[
                styles.pulseCircle,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [0.5, 0],
                  }),
                },
              ]}
            />
          )}
          <Icon
            xml={SVG_ICONS.micIcon}
            color={isListening ? colors.primary : colors.textMuted}
            size={22}
          />
        </TouchableOpacity>
      </View>

      <AddressBottomSheet
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={addr => {
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
    locationContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
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
      maxWidth: 150,
      marginRight: 4,
    },
    actionButtons: { flexDirection: 'row', gap: 10 },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
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
      borderWidth: isDark ? 0 : 1, // Add border for light mode depth
      borderColor: colors.border,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 15,
      marginLeft: 10,
      height: '100%',
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
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
    },
  });

export default CustomHeader;
