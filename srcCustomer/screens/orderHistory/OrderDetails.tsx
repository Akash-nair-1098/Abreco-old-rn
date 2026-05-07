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
  Modal,
  Linking,
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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
      // console.log('order----', data);
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

  const toMoney = (value: any) => {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num.toFixed(2) : '0.00';
  };

  const parseUrls = (rawValue: any) => {
    const urls: string[] = [];

    const addCandidate = (candidate: any) => {
      if (!candidate) return;
      if (Array.isArray(candidate)) {
        candidate.forEach(addCandidate);
        return;
      }
      if (typeof candidate !== 'string') return;

      const value = candidate.trim();
      if (!value) return;

      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          addCandidate(parsed);
          return;
        } catch {
          // Fall through to split handling.
        }
      }

      value
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .forEach(url => urls.push(url));
    };

    addCandidate(rawValue);

    return [...new Set(urls)];
  };

  const invoiceUrls = parseUrls(order?.invoice_url);
  const receiptUrls = parseUrls(order?.receipt_url);

  const handleOpenDocument = async (url: string, type: 'invoice' | 'receipt') => {
    const cleanUrl = (url || '').trim().replace(/^"+|"+$/g, '');
    if (!cleanUrl) {
      Alert.alert(
        t('error'),
        type === 'invoice'
          ? t('invoice_not_available', 'Invoice is not available')
          : t('receipt_not_available', 'Receipt is not available'),
      );
      return;
    }

    try {
      // canOpenURL can incorrectly return false for some valid https/pdf links on Android.
      await Linking.openURL(encodeURI(cleanUrl));
    } catch {
      Alert.alert(
        t('error'),
        type === 'invoice'
          ? t('unable_open_invoice_link', 'Unable to open invoice link')
          : t('unable_open_receipt_link', 'Unable to open receipt link'),
        [
          {text: t('cancel', 'Cancel'), style: 'cancel'},
          {
            text: t('open_in_browser', 'Open in Browser'),
            onPress: () => {
              Linking.openURL(cleanUrl).catch(() => {
                Alert.alert(
                  t('error'),
                  type === 'invoice'
                    ? t('unable_open_invoice_link', 'Unable to open invoice link')
                    : t('unable_open_receipt_link', 'Unable to open receipt link'),
                );
              });
            },
          },
        ],
      );
    }
  };

  const handleInvoicePress = () => {
    if (!invoiceUrls.length) {
      Alert.alert(t('error'), t('invoice_not_available', 'Invoice is not available'));
      return;
    }
    if (invoiceUrls.length === 1) {
      handleOpenDocument(invoiceUrls[0], 'invoice');
      return;
    }
    setShowInvoiceModal(true);
  };

  const handleReceiptPress = () => {
    if (!receiptUrls.length) {
      Alert.alert(t('error'), t('receipt_not_available', 'Receipt is not available'));
      return;
    }
    if (receiptUrls.length === 1) {
      handleOpenDocument(receiptUrls[0], 'receipt');
      return;
    }
    setShowReceiptModal(true);
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
      <View style={styles.calculationCard}>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>
            {t('subtotal', 'Subtotal')}
          </Text>
          <Text style={styles.calculationValue}>
            {t('aed')} {toMoney(order?.subtotal)}
          </Text>
        </View>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>{t('tax', 'Tax')}</Text>
          <Text style={styles.calculationValue}>
            {t('aed')} {toMoney(order?.tax_amount)}
          </Text>
        </View>
        {order?.shipping_amount != 0 && (
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>
              {t('shipping', 'Shipping')}
            </Text>
            <Text style={styles.calculationValue}>
              {t('aed')} {toMoney(order?.shipping_amount)}
            </Text>
          </View>
        )}
        {order?.discount_amount != 0 && (
          <View style={styles.calculationRow}>
            <Text style={styles.calculationLabel}>
              {t('discount', 'Discount')}
            </Text>
            <Text style={styles.calculationValue}>
              {t('aed')} {toMoney(order?.discount_amount)}
            </Text>
          </View>
        )}
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>
            {t('invoiced_quantity', 'Invoiced Quantity')}
          </Text>
          <Text style={styles.calculationValue}>
            {order?.invoiced_qty ?? 0}
          </Text>
        </View>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>
            {t('invoiced_amount', 'Invoiced Amount')}
          </Text>
          <Text style={styles.calculationValue}>
            {t('aed')} {toMoney(order?.invoiced_amount)}
          </Text>
        </View>
        <View style={styles.totalDivider} />
        <View style={styles.calculationRow}>
          <Text style={styles.orderTotalLabel}>
            {t('order_total', 'Order Total')}
          </Text>
          <Text style={styles.orderTotalValue}>
            {t('aed')} {toMoney(order?.total_amount)}
          </Text>
        </View>
      </View>

      <View style={styles.paymentCard}>
        <View style={{flex: 1}}>
          <Text style={styles.paymentLabel}>{t('payment_method')}</Text>
          <Text style={styles.paymentValue}>
            {order.payment_method_display}
          </Text>
          <Text style={[styles.paymentStatus, {color: statusColor}]}>
            {order.payment_status_display}
          </Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={styles.paymentLabel}>{t('total_amount')}</Text>
          <Text style={[styles.totalPrice, {color: statusColor}]}>
            {t('aed')} {parseFloat(order.total_amount).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {receiptUrls.length > 0 && (
          <TouchableOpacity
            style={styles.helpButton}
            onPress={handleReceiptPress}>
            <Icon
              xml={
                SVG_ICONS.downloadIcon || SVG_ICONS.fileIcon || SVG_ICONS.infoIcon
              }
              size={20}
              color={colors.text}
            />
            <Text style={styles.buttonTextSecondary}>
              {receiptUrls.length > 1
                ? t('view_receipts', 'View Receipts')
                : t('view_receipt', 'View Receipt')}
            </Text>
          </TouchableOpacity>
        )}

        {invoiceUrls.length > 0 && (
          <TouchableOpacity
            style={styles.helpButton}
            onPress={handleInvoicePress}>
            <Icon
              xml={
                SVG_ICONS.downloadIcon || SVG_ICONS.fileIcon || SVG_ICONS.infoIcon
              }
              size={20}
              color={colors.text}
            />
            <Text style={styles.buttonTextSecondary}>
              {invoiceUrls.length > 1
                ? t('view_invoices', 'View Invoices')
                : t('view_invoice', 'View Invoice')}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() =>
            NavigationService.navigate(
              'OrderTrackingScreen' as never,
              {
                orderId: orderId,
              } as never,
            )
          }
          style={styles.reorderButton}>
          <Icon xml={SVG_ICONS.locationPin} size={20} color="white" />
          <Text style={styles.buttonTextPrimary}>{t('track_order')}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showInvoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInvoiceModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t('select_invoice', 'Select Invoice')}
            </Text>
            {invoiceUrls.map((url, index) => (
              <TouchableOpacity
                key={`${url}-${index}`}
                style={styles.invoiceRow}
                onPress={() => {
                  setShowInvoiceModal(false);
                  handleOpenDocument(url, 'invoice');
                }}>
                <Text style={styles.invoiceRowText}>
                  {t('invoice', 'Invoice')} {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowInvoiceModal(false)}>
              <Text style={styles.modalCloseText}>{t('close', 'Close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showReceiptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReceiptModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t('select_receipt', 'Select Receipt')}
            </Text>
            {receiptUrls.map((url, index) => (
              <TouchableOpacity
                key={`${url}-${index}`}
                style={styles.invoiceRow}
                onPress={() => {
                  setShowReceiptModal(false);
                  handleOpenDocument(url, 'receipt');
                }}>
                <Text style={styles.invoiceRowText}>
                  {t('receipt', 'Receipt')} {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowReceiptModal(false)}>
              <Text style={styles.modalCloseText}>{t('close', 'Close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    calculationCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    calculationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    calculationLabel: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '500',
    },
    calculationValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    totalDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 6,
    },
    orderTotalLabel: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    orderTotalValue: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
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
      paddingHorizontal: 16,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      gap: 10,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
    },
    invoiceRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.background,
    },
    invoiceRowText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    modalCloseButton: {
      marginTop: 8,
      alignSelf: 'flex-end',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    modalCloseText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: '700',
    },
  });

export default OrderDetails;
