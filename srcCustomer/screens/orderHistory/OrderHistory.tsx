import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../../ThemeContext';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { fetchOrdersList } from '../../api/products/productsApi';
import { useToast } from '../../components/ToastContext';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as NavigationService from '../../navigation/NavigationService';
import { useSearchStore } from '../../store/useSearchStore';

const CATEGORIES = ['All', 'Delivered', 'Ordered', 'Cancelled', 'Pending'];

const OrderHistoryScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const searchText = useSearchStore(state => state.searchText);
  const isFocused = useIsFocused();

  // Helper using Theme colors
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#F59E0B'; // Amber
      case 'confirmed':
      case 'delivered':
        return colors.success;
      case 'cancelled':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const loadOrders = async () => {
    try {
      let filter: any = activeTab !== 'All' ? activeTab.toLowerCase() : '';
      const data = await fetchOrdersList(filter);
      setOrders(data);
    } catch (error) {
      showToast('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused && searchText.trim().length > 0) {
      NavigationService.navigate('SearchStack', {
        screen: 'VoiceSearchScreen',
        params: { results: [], term: searchText, isGlobalSearch: true },
      });
    }
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrders();
    }, [activeTab]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderOrderItem = ({ item }: any) => {
    const statusColor = getStatusColor(item.status);

    return (
      <Pressable
        onPress={() =>
          NavigationService.navigate('OrderDetails', { params: item })
        }
        style={styles.card}
      >
        <View
          style={[styles.statusSideBar, { backgroundColor: statusColor }]}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconIdGroup}>
              <View style={styles.iconWrapper}>
                <Icon xml={SVG_ICONS.boxIcon} color={statusColor} size={20} />
              </View>
              <View>
                <Text style={styles.orderIdText}>
                  Order #{item.order_number.split('-').pop()}
                </Text>
                <Text style={styles.dateText}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status_display.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardFooter}>
            <View style={styles.itemThumbnails}>
              <View style={styles.circleThumb} />
              {item.items_count > 1 && (
                <View style={[styles.circleThumb, styles.overlappingThumb]}>
                  <Text style={styles.overlapText}>
                    +{item.items_count - 1}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.itemCountText}>
                {item.items_count} {item.items_count === 1 ? 'Item' : 'Items'}
              </Text>
              <Text style={styles.priceText}>
                AED {parseFloat(item.total_amount).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={{ flexGrow: 0 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topTabContainer}
        >
          {CATEGORIES.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab && styles.activeTabButtonText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 10,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topTabContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 10,
    },
    tabButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      height: 40,
      justifyContent: 'center',
    },
    activeTabButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabButtonText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    activeTabButtonText: {
      color: '#FFF',
    },
    listPadding: {
      padding: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      flexDirection: 'row',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      // Shadow for light mode
      elevation: isDark ? 0 : 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statusSideBar: {
      width: 4,
      height: '100%',
    },
    cardContent: {
      flex: 1,
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    iconIdGroup: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    iconWrapper: {
      backgroundColor: colors.background,
      padding: 8,
      borderRadius: 10,
    },
    orderIdText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    dateText: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    statusBadge: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '800',
    },
    divider: {
      height: 1,
      marginVertical: 12,
      borderStyle: 'dashed',
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemThumbnails: {
      flexDirection: 'row',
    },
    circleThumb: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? colors.surfaceVariant : '#E2E8F0',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    overlappingThumb: {
      marginLeft: -10,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlapText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '700',
    },
    itemCountText: {
      color: colors.textMuted,
      fontSize: 11,
      marginBottom: 2,
    },
    priceText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 50,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
    },
  });

export default OrderHistoryScreen;
