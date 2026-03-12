import { StyleSheet, Platform } from 'react-native';

export const TextInputComponentStyle = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    textInput: {
      flex: 1,
      height: '100%',
      fontSize: 14,
      paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    InputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      borderRadius: 12, // More modern rounded corners
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      marginBottom: 12,
      // Subtle background for dark mode depth
      backgroundColor: colors.surface,
    },
    leftIcon: {
      marginRight: 10,
    },
    rightIcon: {
      marginLeft: 10,
    },
    disabledInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
      borderColor: colors.border,
      opacity: 0.8,
    },
  });
