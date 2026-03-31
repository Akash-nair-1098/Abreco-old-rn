import { StyleSheet } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { SCREEN_WIDTH } from '../../utilities/dimensions';

export const loginScreenStyles = (
  insets: EdgeInsets,
  colors: any,
  isDark: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:"#FC0808",
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: insets.bottom + 20,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: insets.top + 20,
      marginBottom: 20,
      backgroundColor:'#000000',
    width:150,
    height:150,
    alignSelf:'center',
    borderRadius:40
    },
    logo: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    card: {
      width: '100%',
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : colors.surface,
      borderRadius: 28,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      // iOS Shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 10,
      // Android Shadow
      elevation: isDark ? 0 : 6,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    label: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#0F172A' : colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      height: 56,
    },
    errorBorder: {
      borderColor: '#EF4444',
    },
    iconPrefix: {
      paddingHorizontal: 15,
    },
    textInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    eyeIcon: {
      paddingHorizontal: 15,
    },
    errorText: {
      color: '#EF4444',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    buttonWrapper: {
      marginTop: 32,
    },
    gradientBtn: {
      borderRadius: 14,
      height: 56,
    },
    innerBtn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:"#FC0808",
      borderRadius: 14,
      height: 56,
    },
    btnText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
    },
    newText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    linkText: {
      color: colors.primary,
      fontWeight: 'bold',
      textDecorationLine: 'underline',
      fontSize: 14,
    },
    copyright: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 32,
      opacity: 0.6,
    },
  });
