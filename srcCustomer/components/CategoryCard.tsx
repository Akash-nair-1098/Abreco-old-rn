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
  useFullBackground?: boolean;
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
  useFullBackground = false,
}: CategoryCardProps) => {
  const { t } = useTranslation(); // Defined t here
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark, useFullBackground);

  const contentColor = useFullBackground ? 'white' : (titleColor || colors.text);
  const subtitleColor = useFullBackground ? 'rgba(255,255,255,0.8)' : colors.textMuted;

  const CardWrapper = useFullBackground ? LinearGradient : View;

  return (
    <TouchableOpacity
    activeOpacity={0.8}
    onPress={onChange}
  >
    <CardWrapper
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, !useFullBackground && { backgroundColor: colors.surface }]}
    >
      <View style={styles.header}>
        {/* If full background is on, the icon container becomes transparent or slightly shaded */}
        <View style={[
          styles.iconContainer, 
          !useFullBackground && { backgroundColor: gradientColors[0] } // Fallback if no LinearGradient on icon
        ]}>
           {!useFullBackground ? (
              <LinearGradient
                colors={gradientColors}
                style={StyleSheet.absoluteFill}
                borderRadius={20}
              />
           ) : null}
          <Icon xml={iconName as any} size={28} color="white" />
        </View>

        {showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text
          style={[styles.title, { color: contentColor }]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {count !== undefined && (
          <View style={styles.subtitleRow}>
            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              {count} {t('collections', { defaultValue: 'collections' })}
            </Text>
            <Icon
              xml={SVG_ICONS.rightArrow}
              size={12}
              color={subtitleColor}
            />
          </View>
        )}
      </View>
    </CardWrapper>
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
