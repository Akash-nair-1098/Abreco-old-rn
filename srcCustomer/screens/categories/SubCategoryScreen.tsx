import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../../ThemeContext';
import SubCategoryCard from '../../components/SubCategoryComponent';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';

const SubCategoryScreen = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [subCategories, setSubCategories] = useState<any>([]);

  // Title from previous navigation
  const categoryTitle = route.params?.title || 'Collections';
  // console.log('params is', route.params)

  useEffect(() => {
    if (route.params?.subCategories) {
      setSubCategories(route.params.subCategories);
    }
  }, [route.params]);

  const handlePress = (item: any) => {
    navigation.navigate('CategoryProductListing', {
      params: {
        mainCategoryId: route.params.categoryId,
        categoryId: item.id,
        title: item.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backIconWrapper}>
          <Icon xml={SVG_ICONS.backIcon} color={colors.text} size={20} />
        </View>
        <Text style={styles.backText}>Back to Collections</Text>
      </TouchableOpacity>

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>{categoryTitle}</Text>
        <Text style={styles.subTitle}>Explore sub-categories</Text>
      </View>

      {/* Grid List */}
      <FlatList
        data={subCategories}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SubCategoryCard item={item} onPress={() => handlePress(item)} />
        )}
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    backIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    backText: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 10,
      color: colors.text,
    },
    header: {
      paddingHorizontal: 16,
      marginVertical: 24,
    },
    mainTitle: {
      fontSize: 34,
      fontWeight: '900',
      color: colors.text,
    },
    subTitle: {
      fontSize: 18,
      marginTop: 4,
      color: colors.textMuted,
    },
    listContent: {
      paddingHorizontal: 12,
      paddingBottom: 20,
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
  });

export default SubCategoryScreen;
