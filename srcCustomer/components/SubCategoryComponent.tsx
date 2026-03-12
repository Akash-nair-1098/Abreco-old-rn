import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../ThemeContext';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Adjusted for gap/padding

interface SubCategory {
  id: string;
  name: string;
  icon?: string; // Can be an emoji string or a URL
}

interface Props {
  item: SubCategory;
  onPress: (item: SubCategory) => void;
}

const SubCategoryCard = ({ item, onPress }: Props) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  // Determine if the icon is an emoji or we should use a fallback SVG
  const isEmoji = item.icon && item.icon.length <= 2;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Icon Container */}
      <View style={styles.iconBox}>
        {isEmoji ? (
          <Text style={styles.emojiIcon}>{item.icon}</Text>
        ) : (
          <Icon
            xml={SVG_ICONS.forknife}
            size={24}
            color={isDark ? colors.primary : colors.text}
          />
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Circular Chevron Button */}
        <View style={styles.chevronCircle}>
          <Icon xml={SVG_ICONS.rightArrow} size={12} color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Themed Styles Factory ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      height: 140,
      borderRadius: 28, // Slightly softer radius for modern look
      padding: 16,
      justifyContent: 'space-between',
      marginBottom: 12,
      backgroundColor: colors.surface,
      // Add border for dark mode depth
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      // Add shadow for light mode lift
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 8,
        },
        android: {
          elevation: isDark ? 0 : 2,
        },
      }),
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? colors.background : colors.border, // Using border color as a soft neutral bg in light mode
    },
    emojiIcon: {
      fontSize: 24,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 4,
    },
    name: {
      fontSize: 15,
      fontWeight: '700',
      flex: 1,
      color: colors.text,
      lineHeight: 20,
    },
    chevronCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    },
  });

export default SubCategoryCard;
