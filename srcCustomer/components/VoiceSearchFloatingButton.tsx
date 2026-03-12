import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../ThemeContext';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';
import { globalSearchProducts } from '../api/products/productsApi';
import { useCartStore } from '../store/useCartStore';
import { useToast } from './ToastContext';
import * as NavigationService from '../navigation/NavigationService';

const { width } = Dimensions.get('window');

export const VoiceSearchFloatingUI = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const addToCart = useCartStore(state => state.addItem);
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Voice listeners
    Voice.onSpeechStart = () => console.log('Speech Started');
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = e => {
      if (e.value) setTranscript(e.value[0]);
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.log('Voice Error:', e);
      stopListening();
    };

    return () => {
      // Cleanup on unmount
      Voice.destroy().then(Voice.removeAllListeners);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value[0]) {
      const text = e.value[0];
      setTranscript(text);

      // We wait a brief moment for the user to finish before processing intent
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        handleVoiceIntent(text);
      }, 800);
    }
  };

  const startListening = async () => {
    try {
      setTranscript('');
      setIsVisible(true);
      setIsProcessing(false);

      // Force language based on i18next (e.g., 'en-US', 'hi-IN', 'ar-SA')
      const currentLang = i18n.language || 'en-US';
      await Voice.start(currentLang);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } catch (e) {
      console.error('Start Voice Error:', e);
      setIsVisible(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      pulseAnim.setValue(1);
      setIsVisible(false);
      setIsProcessing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoiceIntent = async (text: string) => {
    if (isProcessing) return;

    // Get multi-language triggers from i18n
    const triggers = (t('voice_add_triggers', {
      returnObjects: true,
    }) as string[]) || ['add', 'buy'];

    const lowerText = text.toLowerCase();
    const isAddIntent = triggers.some(trigger =>
      lowerText.includes(trigger.toLowerCase()),
    );

    setIsProcessing(true);

    try {
      // Clean up the search term (remove the triggers from the text)
      let searchTerm = lowerText;
      if (isAddIntent) {
        triggers.forEach(tr => {
          const regex = new RegExp(`\\b${tr.toLowerCase()}\\b`, 'gi');
          searchTerm = searchTerm.replace(regex, '');
        });
      }
      searchTerm = searchTerm.trim();

      if (!searchTerm) {
        setIsProcessing(false);
        return;
      }

      const results = await globalSearchProducts(searchTerm);

      if (isAddIntent && results?.length === 1) {
        // Direct successful "Add to Cart"
        const product = results[0];
        await addToCart(product, 1);
        showToast(
          t('added_to_cart_success', { item: product.name || product.title }),
          'success',
        );
        await stopListening();
      } else {
        // Fallback: Navigate to search screen with results
        NavigationService.navigate('SearchStack', {
          screen: 'VoiceSearchScreen',
          params: {
            results: results || [],
            term: searchTerm,
            isGlobalSearch: false,
          },
        });
        await stopListening();
      }
    } catch (err) {
      console.error('Voice Intent Error:', err);
      showToast(t('voice_error_message'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={startListening}
        activeOpacity={0.8}
      >
        <Icon xml={SVG_ICONS.micIcon} size={28} color="white" />
      </TouchableOpacity>

      <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={styles.statusTitle}>
              {isProcessing ? t('voice_processing') : t('voice_listening')}
            </Text>

            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptText}>
                {transcript || t('voice_placeholder')}
              </Text>
            </View>

            <View style={styles.animationBox}>
              {isProcessing ? (
                <ActivityIndicator color={colors.primary} size="large" />
              ) : (
                <Animated.View
                  style={[
                    styles.pulseCircle,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              )}
            </View>

            <TouchableOpacity
              onPress={stopListening}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// --- Themed Styles Factory ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 100,
      right: 20,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 9999,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      alignItems: 'center',
      minHeight: 350,
    },
    handle: {
      width: 40,
      height: 5,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginBottom: 20,
    },
    statusTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 15,
    },
    transcriptContainer: {
      width: '100%',
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    transcriptText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 28,
    },
    animationBox: {
      height: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pulseCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    closeButton: {
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 30,
    },
    closeButtonText: {
      fontSize: 16,
      color: colors.textMuted,
      fontWeight: '600',
    },
  });
