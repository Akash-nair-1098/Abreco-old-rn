import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera } from 'react-native-camera-kit';
import { useTranslation } from 'react-i18next';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';
import { globalSearchProducts } from '../api/products/productsApi';
import { useTheme } from '../../ThemeContext';
import { useToast } from '../components/ToastContext';

export const BarcodeSearchScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [isSearching, setIsSearching] = useState(false);
  const isHandlingScanRef = useRef(false);

  const onReadCode = async (event: any) => {
    const scannedCode = event?.nativeEvent?.codeStringValue?.trim();
    if (!scannedCode || isHandlingScanRef.current) {
      return;
    }

    isHandlingScanRef.current = true;
    setIsSearching(true);

    try {
      const results = await globalSearchProducts(scannedCode);
      navigation.replace('VoiceSearchScreen', {
        results: results || [],
        term: scannedCode,
        isGlobalSearch: false,
      });
    } catch (error) {
      showToast(t('failed_add_item'), 'error');
      isHandlingScanRef.current = false;
      setIsSearching(false);
    }
  };

  const handleBackToTabs = () => {
    // BarcodeSearchScreen sits inside SearchStack (hidden tab screen).
    // We want back to always return to the normal bottom tabs, not to VoiceSearchScreen.
    const parent = navigation.getParent?.();
    const tabParent = parent?.getParent?.() ?? parent;
    if (tabParent?.navigate) {
      tabParent.navigate('Home');
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        scanBarcode
        onReadCode={onReadCode}
        showFrame
        laserColor={colors.primary}
        frameColor={colors.primary}
      />

      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={handleBackToTabs}
      >
        <Icon xml={SVG_ICONS.backIcon} color="#FFFFFF" size={20} />
      </TouchableOpacity>

      <View style={[styles.helpTextWrapper, { top: insets.top + 60 }]}>
        <Text style={styles.helpText}>{t('search_placeholder')}</Text>
      </View>

      {isSearching && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#FFFFFF" size="large" />
          <Text style={styles.loadingText}>{t('searching')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  helpText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
