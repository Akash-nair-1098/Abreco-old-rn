import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface BannerData {
  title: string;
  subtitle: string;
  offerTag: string;
  image: string; // URL string from API
  buttonColor?: string;
  id:string;
}

const BannerItem = ({ item }: { item: BannerData }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = makeStyles(colors, isDark);

  // 2. Initialize Navigation
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handlePress = () => {
    // Navigating to the Tab first ("Products"), then the Stack Screen ("ProductListing")
    navigation.navigate('Products', {
      screen: 'ProductListing',
      params: { 
        offerId: item.id,
      },
    });
  };

  return (
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.container}
      imageStyle={{ borderRadius: 12 }}
    >
      {/* Dynamic Overlay to ensure text readability regardless of image brightness */}
      <View style={styles.overlay}>
        {/* Offer Tag */}
        {item.offerTag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.offerTag}</Text>
          </View>
        )}

        {/* Text Content */}
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>

        {/* Action Button */}
        <TouchableOpacity
        onPress={handlePress}
          style={[
            styles.button,
            { backgroundColor: item.buttonColor || colors.primary },
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {t('shop_now', { defaultValue: 'Shop Now' })}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// --- Themed Styles Factory ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      height: 200,
      width: '100%',
      overflow: 'hidden',
    },
    overlay: {
      flex: 1,
      // Slightly darker overlay in Light Mode to protect white text contrast
      backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)',
      padding: 24,
      justifyContent: 'center',
    },
    tag: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 8,
    },
    tagText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    title: {
      color: '#FFFFFF',
      fontSize: 32,
      fontWeight: '900',
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
    },
    button: {
      alignSelf: 'flex-start',
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 14,
      // Elevation/Shadow to make the button pop from the background image
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

export default BannerItem;
