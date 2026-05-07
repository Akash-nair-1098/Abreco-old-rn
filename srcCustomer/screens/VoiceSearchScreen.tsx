import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import ProductCardComponent from '../components/ProductCardComponent';
import {globalSearchProducts} from '../api/products/productsApi';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next'; // Added
import Icon from '../../Icon';
import {SVG_ICONS} from '../assets/icons/svg';
import {useTheme} from '../../ThemeContext';

export const VoiceSearchScreen = ({route}: any) => {
  const {results: initialResults, term, isGlobalSearch} = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {t} = useTranslation(); // Translation Hook
  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors, isDark);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialResults || []);

  useEffect(() => {
    if (isGlobalSearch) {
      performSearch();
    } else {
      setData(initialResults || []);
    }
  }, [term, isGlobalSearch, initialResults]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await globalSearchProducts(term);
      setData(response || []);
      console.log('response is', response);
    } catch (error) {
      console.error('Global search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        // {
        //   paddingTop: insets.top,
        //   paddingBottom: insets.bottom,
        // },
      ]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}>
          <Icon xml={SVG_ICONS.backIcon || ''} size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {`${t('results_for')} ${term.toUpperCase()} `}
          </Text>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{alignSelf: 'flex-start', marginTop: 2}}
            />
          ) : (
            <Text style={styles.count}>
              {`${t('items_found')} ${data.length}`}
            </Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.empty, {marginTop: 10}]}>{t('searching')}</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => <ProductCardComponent item={item} />}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.column}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('no_products_found')}</Text>
          }
        />
      )}
    </View>
  );
};

// --- Themed Styles ---
const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 10,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    headerTitleContainer: {flex: 1},
    title: {color: colors.text, fontSize: 18, fontWeight: 'bold'},
    count: {color: colors.textMuted, fontSize: 13, marginTop: 2},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    list: {paddingBottom: 20, paddingHorizontal: 12, paddingTop: 10},
    column: {justifyContent: 'space-between'},
    empty: {color: colors.textMuted, textAlign: 'center', marginTop: 50},
  });
