import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';
import { useTheme } from '../../ThemeContext';
import { useTranslation } from 'react-i18next'; // Added this

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface CategoryCardProps {
  title: string;
  count?: number;
  iconName: string;
  gradientColors: string[];
  showBadge?: boolean;
  badgeText?: string;
  titleColor?: string;
  onChange?: () => void;
}

const CategoryCard = ({
  title,
  count,
  iconName,
  gradientColors,
  showBadge,
  badgeText = 'TOP',
  titleColor,
  onChange,
}: CategoryCardProps) => {
  const { t } = useTranslation(); // Defined t here
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onChange}
    >
      <View style={styles.header}>
        <LinearGradient
          colors={gradientColors}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Icon xml={iconName as any} size={28} color="white" />
        </LinearGradient>

        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text
          style={[styles.title, { color: titleColor || colors.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {count !== undefined && (
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>
              {count} {t('collections', { defaultValue: 'collections' })}
            </Text>
            <Icon
              xml={SVG_ICONS.rightArrow}
              size={12}
              color={colors.textMuted}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// --- Themed Styles Factory ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      borderRadius: 32,
      padding: 16,
      width: CARD_WIDTH,
      height: 180,
      justifyContent: 'space-between',
      marginBottom: 16,
      backgroundColor: colors.surface,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0 : 0.06,
          shadowRadius: 10,
        },
        android: {
          elevation: isDark ? 0 : 3,
        },
      }),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 54,
      height: 54,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badge: {
      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    badgeText: {
      color: isDark ? '#34D399' : '#065F46',
      fontSize: 10,
      fontWeight: 'bold',
    },
    footer: {
      marginTop: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 13,
    },
  });

export default CategoryCard;
