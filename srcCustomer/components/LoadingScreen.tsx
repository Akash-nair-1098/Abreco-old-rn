import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../ThemeContext';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message }: LoadingScreenProps) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
};

// --- Themed Styles Factory ---

const makeStyles = (colors: any) =>
  StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      // Uses the background color defined in your ThemeContext
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      // Uses muted text color to keep the focus on the loader
      color: colors.textMuted,
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  });

export default LoadingScreen;
