import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Pressable,
  Vibration,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {useTranslation} from 'react-i18next';
import {useTheme} from '../../ThemeContext';
import Icon from '../../Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {useCartStore} from '../store/useCartStore';
import {useSearchStore} from '../store/useSearchStore';
import {useToast} from './ToastContext';
import * as NavigationService from '../navigation/NavigationService';
import {getVoiceLocaleForAppLanguage} from '../utilities/voiceLocale';
import {startVoiceRecording, stopVoiceRecording} from '../utilities/audioRecord';
import {transcribeWithGemini} from '../utilities/geminiTranscribe';
import {runVoiceSearchFromTranscript} from '../utilities/voiceSearchFromTranscript';

export const VoiceSearchFloatingUI = () => {
  const {t, i18n} = useTranslation();
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const addToCart = useCartStore(state => state.addItem);
  const {setSearchText} = useSearchStore();
  const {showToast} = useToast();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const latestTranscript = useRef('');
  const hasProcessed = useRef(false);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  // Cloud transcription via Google Gemini (multilingual); no on-device STT.

  const cleanup = async () => {
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    setIsListening(false);
    hasProcessed.current = false;
    pulseAnim.setValue(1);
    setTranscript('');
    latestTranscript.current = '';
  };

  const startListening = async () => {
    if (isProcessing) return;

    try {
      await cleanup();

      const locale = getVoiceLocaleForAppLanguage(i18n.language);
      console.log('🎤 Starting with locale:', locale);

      Vibration.vibrate(50);

      // Button press animation
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 4,
        useNativeDriver: true,
      }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.6,
            duration: 550,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      setIsListening(true);
      setTranscript(t('voice_listening') || 'Listening...');

      const started = await startVoiceRecording();
      if (!started.ok) throw new Error(started.error);
    } catch (err: any) {
      // console.error(err);
      Alert.alert(
        'Voice Error',
        err?.message ||
          'Could not start recording. Allow microphone access and try again.',
      );
      cleanup();
    }
  };

  const handlePressOut = async () => {
    Animated.spring(scaleAnim, {toValue: 1, useNativeDriver: true}).start();
    pulseAnim.stopAnimation();

    try {
      const stopped = await stopVoiceRecording();
      if (!stopped.ok) throw new Error(stopped.error);

      setIsProcessing(true);
      setTranscript(t('searching') || 'Searching...');

      const locale = getVoiceLocaleForAppLanguage(i18n.language);
      const res = await transcribeWithGemini({
        audioFilePath: stopped.filePath,
        languageHint: locale,
      });
      // console.log('🎤 res is', res);
      if (!res.ok) throw new Error(res.error);

      await runVoiceSearchFromTranscript(res.text, {
        setSearchText,
        showToast,
        t,
        enableAddToCartIntent: true,
        addToCart,
        onResults: (term, results) =>
          (NavigationService.navigate as (n: string, p?: object) => void)(
            'SearchStack',
            {
              screen: 'VoiceSearchScreen',
              params: {results, term, isGlobalSearch: true},
            },
          ),
      });
    } catch (e: any) {
      // console.log('🎤 e is', e);
      if (__DEV__) console.log('Voice transcribe error:', e);
      // Prefer the real error message so iOS issues aren't masked by translation strings.
      showToast(e?.message || t('voice_error_message') || 'Voice recognition failed', 'error');
    } finally {
      setIsProcessing(false);
      cleanup();
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {(isListening || transcript) && (
        <View style={styles.floatingTranscript}>
          <View style={styles.recIndicator} />
          <Text style={styles.transcriptText} numberOfLines={2}>
            {transcript}
          </Text>
        </View>
      )}

      <View style={styles.buttonWrapper}>
        {isListening && (
          <Animated.View
            style={[styles.pulseRing, {transform: [{scale: pulseAnim}]}]}
          />
        )}
        <Animated.View style={{transform: [{scale: scaleAnim}]}}>
          <Pressable
            onPressIn={startListening}
            onPressOut={handlePressOut}
            disabled={isProcessing}
            style={({pressed}) => [
              styles.fab,
              {
                backgroundColor: isProcessing
                  ? colors.textMuted
                  : colors.primary,
              },
              pressed && {opacity: 0.8},
            ]}>
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

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 110,
      right: 25,
      alignItems: 'center',
      zIndex: 1000,
    },
    buttonWrapper: {justifyContent: 'center', alignItems: 'center'},
    fab: {
      width: 68,
      height: 68,
      borderRadius: 34,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.35,
      shadowRadius: 6,
    },
    pulseRing: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: colors.primary,
      opacity: 0.25,
    },
    floatingTranscript: {
      position: 'absolute',
      bottom: 85,
      right: 0,
      width: 260,
      backgroundColor: colors.surface,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#F43F5E',
      marginRight: 10,
    },
    transcriptText: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
    },
  });
