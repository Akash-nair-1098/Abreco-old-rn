import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { getLegalDocs } from '../../api/auth/authApi';
import { useTheme } from '../../../ThemeContext';
import { WebView } from 'react-native-webview';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../../Icon';

const LegalDocScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const themedStyles = makeStyles(colors);

  const { docType } = route.params || { docType: 'privacy_policy' };

  const [loading, setLoading] = useState(true);
  const [docContent, setDocContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const headings: Record<string, string> = {
    customer_terms: 'Terms & Conditions',
    vendor_terms: 'Vendor Terms',
    privacy_policy: 'Privacy Policy',
  };

  useEffect(() => {
    fetchDocs();
  }, [docType]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await getLegalDocs();
      setDocContent(data[docType]);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={themedStyles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={themedStyles.backBtn}
      >
        <Icon xml={SVG_ICONS.backIcon} color={colors.text} size={24} />
      </TouchableOpacity>
      <Text style={themedStyles.headerTitle}>
        {headings[docType] || 'Legal Document'}
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );

  if (loading) {
    return (
      <View style={themedStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container}>
      {renderHeader()}

      {error || !docContent ? (
        <View style={themedStyles.center}>
          <Text style={{ color: colors.text }}>Failed to load document.</Text>
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          backgroundColor={colors.background}
          source={{
            html: `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { 
                    font-family: -apple-system, sans-serif; 
                    padding: 20px; 
                    line-height: 1.6; 
                    color: ${colors.text}; 
                    background-color: ${colors.background};
                  }
                  h2 { 
                    color: ${colors.primary}; 
                    margin-top: 10px; 
                    border-bottom: 1px solid ${colors.border}; 
                    padding-bottom: 10px; 
                    font-size: 22px;
                  }
                  p { 
                    margin-bottom: 15px; 
                    white-space: pre-wrap; 
                    font-size: 15px; 
                    color: ${colors.textMuted};
                  }
                </style>
              </head>
              <body>
                <h2>${headings[docType]}</h2>
                <p>${docContent}</p>
              </body>
            </html>`,
          }}
          style={themedStyles.webview}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

// Dynamic Stylesheet based on theme colors
const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      height: 56,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    backBtn: {
      padding: 10,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    webview: {
      flex: 1,
      backgroundColor: colors.background,
      opacity: 0.99,
    },
  });

export default LegalDocScreen;
