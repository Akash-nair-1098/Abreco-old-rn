import { StyleSheet } from 'react-native';

/**
 * Returns themed styles for the product listing and card components.
 * @param colors - The color object from your ThemeContext
 * @param isDark - Boolean flag for dark mode specific logic
 */
export const getProductListingStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface, // Dynamic surface color
      borderRadius: 24,
      marginHorizontal: 8, // Adjusted for 2-column layout consistency
      marginBottom: 16,
      padding: 12,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      // Subtle shadow for light mode
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 4,
      elevation: isDark ? 0 : 3,
    },
    imageContainer: {
      height: 180,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: isDark ? colors.border : '#f3f4f6',
    },
    image: { width: '100%', height: '100%' },
    discountBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
    favBtn: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: isDark ? colors.background : 'white',
      padding: 6,
      borderRadius: 20,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    content: { marginTop: 12 },
    title: {
      fontSize: 16, // Adjusted for 2-column fit
      fontWeight: 'bold',
      color: colors.text,
    },
    categoryText: {
      color: colors.textMuted || '#64748B',
      fontSize: 13,
      textTransform: 'capitalize',
    },
    stockSection: { marginTop: 10 },
    progressBarBg: {
      height: 6,
      backgroundColor: isDark ? '#334155' : '#e2e8f0',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarFill: { height: '100%' },
    stockLabel: {
      fontSize: 12,
      marginTop: 4,
      color: colors.textMuted,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    price: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    oldPrice: {
      color: colors.textMuted,
      textDecorationLine: 'line-through',
      fontSize: 12,
    },
    buttonRow: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 10,
    },
    addBtn: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      gap: 3,
    },
    buyBtn: {
      flex: 1,
      height: 40,
      backgroundColor: colors.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },

    // Header & Filter Styles
    header: { padding: 16 },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.text,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    pillText: { color: colors.text, fontSize: 12 },

    // Quantity Selector
    quantitySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 12,
      height: 40,
      flex: 1,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : colors.background,
    },
    qtyBtn: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qtyText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },

    // Empty State
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100,
      paddingHorizontal: 40,
    },
    emptyIconBox: {
      width: 80,
      height: 80,
      backgroundColor: colors.surface,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
