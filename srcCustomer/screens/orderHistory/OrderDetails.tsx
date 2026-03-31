import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { fetchOrderDetail } from '../../api/products/productsApi';
import * as NavigationService from '../../navigation/NavigationService';
import i18n from '../../utilities/i18n';

const OrderDetails = ({ navigation, route }: any) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const { t } = useTranslation();

  const orderId = route.params?.params?.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
    } catch (error) {
      Alert.alert(t('error'), t('failed_load_details'));
      NavigationService.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'delivered':
        return colors.success;
      case 'pending':
        return '#F59E0B'; 
      case 'cancelled':
        return colors.danger;
      default:
        return colors.primary;
    }
  };

  if (loading || !order) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statusColor = getStatusColor(order.status);

  const renderHeader = () => (
    <View style={styles.statusCard}>
      <View
        style={[
          styles.statusIconCircle,
          { backgroundColor: `${statusColor}20` },
        ]}
      >
        <Icon
          xml={
            order.status === 'confirmed' || order.status === 'delivered'
              ? SVG_ICONS.successIcon
              : order.status === 'cancelled'
              ? SVG_ICONS.closeIcon
              : SVG_ICONS.infoIcon
          }
          color={statusColor}
          size={32}
        />
      </View>
      <Text style={styles.statusTitle}>
        {order?.status_display?.toUpperCase()}
      </Text>
      <Text style={styles.orderIdSub}>{t('order_id_prefix')} #{order.order_number}</Text>
      <Text style={styles.dateSub}>
        {new Date(order.created_at).toLocaleString(i18n.language, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <View style={styles.paymentCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.paymentLabel}>{t('payment_method')}</Text>
          <Text style={styles.paymentValue}>
            {order.payment_method_display}
          </Text>
          <Text style={[styles.paymentStatus, { color: statusColor }]}>
            {order.payment_status_display}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.paymentLabel}>{t('total_amount')}</Text>
          <Text style={[styles.totalPrice, { color: statusColor }]}>
            {t('aed')} {parseFloat(order.total_amount).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.helpButton}>
          <Icon xml={SVG_ICONS.infoIcon} size={20} color={colors.text} />
          <Text style={styles.buttonTextSecondary}>{t('help')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            NavigationService.navigate('OrderTrackingScreen', {
              orderId: orderId,
            })
          }
          style={styles.reorderButton}
        >
          <Icon xml={SVG_ICONS.locationPin} size={20} color="white" />
          <Text style={styles.buttonTextPrimary}>{t('track_order')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => navigation.goBack()}
      >
        <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        <Text style={styles.backText}>{t('order_details')}</Text>
      </TouchableOpacity>

      <FlatList
        data={order.items}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <>
            {renderHeader()}
            <Text style={styles.sectionHeader}>
              {t('items_ordered')} ({order.items.length})
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>{item.quantity}x</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product_name}
              </Text>
              <Text style={styles.skuText}>{item.variant_sku}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {t('aed')} {parseFloat(item.total_price).toFixed(2)}
            </Text>
          </View>
        )}
        ListFooterComponent={renderFooter()}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};


const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollPadding: {
      padding: 16,
    },
    // Top Status Card
    statusCard: {
      backgroundColor: colors.surface,
      borderRadius: 30,
      padding: 30,
      alignItems: 'center',
      marginBottom: 30,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    statusTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 8,
    },
    orderIdSub: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: '500',
    },
    dateSub: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 4,
      opacity: 0.8,
    },
    // List Section
    sectionHeader: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 12,
      letterSpacing: 1,
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    qtyBadge: {
      backgroundColor: isDark ? 'rgba(148, 163, 184, 0.2)' : colors.background,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginRight: 12,
      borderWidth: isDark ? 0 : 1,
      borderColor: colors.border,
    },
    qtyText: {
      color: colors.text,
      fontWeight: '800',
      fontSize: 14,
    },
    itemName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
      flex: 1,
    },
    itemPrice: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    // Footer Payment Card
    footerContainer: {
      marginTop: 12,
    },
    paymentCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    paymentLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    paymentValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    totalPrice: {
      fontSize: 20,
      fontWeight: '800',
    },
    // Action Buttons
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    helpButton: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    reorderButton: {
      flex: 2,
      flexDirection: 'row',
      backgroundColor: colors.primary,
      borderRadius: 16,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    buttonTextPrimary: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
    },
    buttonTextSecondary: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backText: {
      fontSize: 18,
      fontWeight: '700',
      marginLeft: 10,
      color: colors.text,
    },
    skuText: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    paymentStatus: {
      fontSize: 12,
      fontWeight: '700',
      marginTop: 4,
      textTransform: 'capitalize',
    },
  });

export default OrderDetails;
