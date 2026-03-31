import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Pressable,
  Vibration,
  ActivityIndicator,
  Platform,
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
import { useSearchStore } from '../store/useSearchStore'; 
import { useToast } from './ToastContext';
import * as NavigationService from '../navigation/NavigationService';

export const VoiceSearchFloatingUI = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const addToCart = useCartStore(state => state.addItem);
  const { setSearchText } = useSearchStore(); 
  const { showToast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const latestTranscript = useRef('');
  const isStarting = useRef(false); // New lock to prevent double-starts

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      isStarting.current = false;
    };
    
    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.log('Voice Error:', e);
      setTranscript('');
      latestTranscript.current = '';
      forceCleanup();
    };

    Voice.onSpeechPartialResults = (e) => {
      if (e.value && e.value[0]) {
        setTranscript(e.value[0]);
        latestTranscript.current = e.value[0];
      }
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value[0]) {
        setTranscript(e.value[0]);
        latestTranscript.current = e.value[0];
      }
    };

    return () => {
      forceCleanup();
      Voice.removeAllListeners();
    };
  }, []);

  const forceCleanup = async () => {
    try {
      setIsListening(false);
      isStarting.current = false;
      pulseAnim.setValue(1);
      await Voice.stop();
      await Voice.destroy();
    } catch (e) {
      // Silently fail if already destroyed
    }
  };

  const handlePressIn = async () => {
    if (isStarting.current || isProcessing) return;
    
    isStarting.current = true;
    setTranscript('');
    latestTranscript.current = '';

    try {
      // Critical: Ensure old instance is dead before starting new
      await Voice.destroy(); 
      
      Vibration.vibrate(50); 
      
      Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true, friction: 4 }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();

      const localeMap: { [key: string]: string } = {
        en: 'en-US', ar: 'ar-SA', ml: 'ml-IN', hi: 'hi-IN', es: 'es-ES', zh: 'zh-CN',
      };
      
      // Small delay helps native modules reset audio focus
      setTimeout(async () => {
        try {
            await Voice.start(localeMap[i18n.language] || 'en-US');
        } catch (err) {
            forceCleanup();
        }
      }, 50);

    } catch (e) {
      forceCleanup();
    }
  };

  const handlePressOut = async () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);

    try {
      // Stop immediately on release
      await Voice.stop();
      
      // Delay processing slightly to ensure 'onSpeechResults' has time to fire
      setTimeout(() => {
        const finalResult = latestTranscript.current;
        setIsListening(false);
        isStarting.current = false;
        
        if (finalResult) {
          processVoiceCommand(finalResult);
        }
      }, 400); 
    } catch (e) {
      forceCleanup();
    }
  };

  const processVoiceCommand = async (text: string) => {
    if (isProcessing || !text) return;
    setIsProcessing(true);
    
    const lowerText = text.toLowerCase();
    const triggers = (t('voice_add_triggers', { returnObjects: true }) as string[]) || [
        'add', 'cart', 'जोड़ें', 'add to cart', 'ചേർക്കുക', 'añadir', 'اضف', '添加'
    ];
    
    const isAddIntent = triggers.some(trigger => lowerText.includes(trigger.toLowerCase()));

    try {
      let searchTerm = lowerText;
      if (isAddIntent) {
        triggers.forEach(tr => {
          const regex = new RegExp(`${tr.toLowerCase()}`, 'gi');
          searchTerm = searchTerm.replace(regex, '');
        });
      }
      searchTerm = searchTerm.trim();
      
      if (!searchTerm) {
        setIsProcessing(false);
        return;
      }

      const results = await globalSearchProducts(searchTerm);

      if (isAddIntent && results && results.length > 0) {
        const product = results[0];
        await addToCart(product, 1);
        showToast(t('added_to_cart_success', { item: product.name || product.title }), 'success');
      } else if (results && results.length > 0) {
        setSearchText(searchTerm);

        NavigationService.navigate('SearchStack', {
          screen: 'VoiceSearchScreen',
          params: { 
            results: results, 
            term: searchTerm, 
            isGlobalSearch: true 
          },
        });
      } else {
        showToast(t('no_products_found'), 'warning');
      }
    } catch (err) {
      showToast(t('voice_error_message'), 'error');
    } finally {
      setIsProcessing(false);
      setTranscript('');
      latestTranscript.current = '';
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {(isListening || transcript !== '') && (
        <View style={styles.floatingTranscript}>
          <View style={styles.recIndicator} />
          <Text style={styles.transcriptText} numberOfLines={2}>
            {transcript || t('voice_listening')}
          </Text>
        </View>
      )}

      <View style={styles.buttonWrapper}>
        {isListening && (
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
        )}
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.fab,
              { backgroundColor: isProcessing ? colors.textMuted : colors.primary },
              pressed && { opacity: 0.8 }
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Icon xml={SVG_ICONS.micIcon} size={28} color="white" />
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { position: 'absolute', bottom: 110, right: 25, alignItems: 'center', zIndex: 1000 },
    buttonWrapper: { justifyContent: 'center', alignItems: 'center' },
    fab: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 6 },
    pulseRing: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: colors.primary, opacity: 0.25 },
    floatingTranscript: { position: 'absolute', bottom: 85, right: 0, width: 260, backgroundColor: colors.surface, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', elevation: 6, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
    recIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F43F5E', marginRight: 10 },
    transcriptText: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600', textAlign: 'left' },
  });