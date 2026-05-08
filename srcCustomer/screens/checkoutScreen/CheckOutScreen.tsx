import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Modal,
} from 'react-native';
import {WebView} from 'react-native-webview'; 
import AddressBottomSheet from './components/AddressBottomsheet';
import Icon from '../../../Icon';
import {useToast} from '../../components/ToastContext';
import {useCartStore} from '../../store/useCartStore';
import {useAddressStore} from '../../store/useAddressStore';
import * as NavigationService from '../../navigation/NavigationService';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../../ThemeContext';
import {initiatePayment} from './../../api/products/productsApi';
import {SVG_ICONS} from './../../assets/icons/svg';

const CheckoutScreen = ({navigation, route}: any) => {
  const {t} = useTranslation();
  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors);

  const {grandTotal} = route.params || {grandTotal: 0};
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [isPaymentOpening, setIsPaymentOpening] = useState(false);

  // WebView States
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  const hasHandledPaymentResultRef = useRef(false);

  const {placeOrder, loading} = useCartStore();
  const {setSelectedAddress, selectedAddress} = useAddressStore();
  const {showToast} = useToast();

  const resetPaymentWebViewState = useCallback(() => {
    hasHandledPaymentResultRef.current = false;
    setPaymentUrl('');
    setShowWebView(false);
    setIsPaymentOpening(false);
  }, []);

  const parsePaymentResultFromUrl = useCallback((url: string) => {
    const u = (url || '').toLowerCase();
    if (!u) return {status: 'unknown' as const};

    // Common redirect patterns (merchant-configured return URLs vary).
    const successSignals = [
      'success',
      'captured',
      'paid',
      'approved',
      'payment-success',
      'order-success',
      'thank-you',
    ];
    const failureSignals = ['fail', 'failed', 'cancel', 'canceled', 'declined', 'rejected', 'error'];

    const hasSuccess = successSignals.some(s => u.includes(s));
    const hasFailure = failureSignals.some(s => u.includes(s));

    if (hasSuccess && !hasFailure) return {status: 'success' as const};
    if (hasFailure && !hasSuccess) return {status: 'failure' as const};

    // Query param based signals, e.g. ?status=CAPTURED / ?result=success
    try {
      const parsed = new URL(url);
      const status = (parsed.searchParams.get('status') || parsed.searchParams.get('state') || '')
        .toLowerCase()
        .trim();
      const result = (parsed.searchParams.get('result') || '').toLowerCase().trim();
      const outcome = (parsed.searchParams.get('outcome') || '').toLowerCase().trim();

      const joined = [status, result, outcome].filter(Boolean).join(' ');
      if (joined.includes('captured') || joined.includes('success') || joined.includes('paid') || joined.includes('approved')) {
        return {status: 'success' as const};
      }
      if (joined.includes('fail') || joined.includes('cancel') || joined.includes('declin') || joined.includes('reject') || joined.includes('error')) {
        return {status: 'failure' as const};
      }
    } catch {
      // ignore URL parsing failures
    }

    return {status: 'unknown' as const};
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast(t('please_select_delivery_address'), 'error');
      return;
    }

    try {
      setIsPaymentOpening(true);
      const result = await placeOrder(selectedAddress.id, paymentMethod);
      const orderId = result.results?.data?.id;
      setCurrentOrderId(orderId);

      if (paymentMethod === 'online_card' && orderId) {
        try {
          const paymentResponse = await initiatePayment(orderId);
          const url = paymentResponse.results?.data?.payment_url;

          if (url) {
            hasHandledPaymentResultRef.current = false;
            setPaymentUrl(url);
            setShowWebView(true);
            return; // Don't proceed to toast yet, wait for WebView
          }
        } catch (payError) {
          showToast(t('failed_to_initiate_payment'), 'error');
          setIsPaymentOpening(false);
          return;
        }
      }

      // Default COD / Credit Limit success flow
      showToast(t('order_placed_successfully'), 'success');
      navigation.reset({
        index: 0,
        routes: [{name: 'OrderTrackingScreen', params: {orderId}}],
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || t('something_went_wrong');
      showToast(errorMessage, 'error');
      setIsPaymentOpening(false);
    }
  };

  const handlePaymentResult = useCallback(
    (status: 'success' | 'failure') => {
      if (hasHandledPaymentResultRef.current) return;
      hasHandledPaymentResultRef.current = true;

      if (status === 'success') {
        resetPaymentWebViewState();
        showToast(t('payment_successful'), 'success');
        navigation.reset({
          index: 0,
          routes: [{name: 'OrderTrackingScreen', params: {orderId: currentOrderId}}],
        });
        return;
      }

      resetPaymentWebViewState();
      showToast(t('payment_failed_or_cancelled'), 'error');
    },
    [currentOrderId, navigation, resetPaymentWebViewState, showToast],
  );

  const onNavigationStateChange = useCallback(
    (navState: any) => {
      const url = navState?.url || '';
      const result = parsePaymentResultFromUrl(url);
      if (result.status === 'success') handlePaymentResult('success');
      if (result.status === 'failure') handlePaymentResult('failure');
    },
    [handlePaymentResult, parsePaymentResultFromUrl],
  );

  const onShouldStartLoadWithRequest = useCallback(
    (req: any) => {
      const url = req?.url || '';
      const result = parsePaymentResultFromUrl(url);
      if (result.status === 'success') {
        handlePaymentResult('success');
        return false;
      }
      if (result.status === 'failure') {
        handlePaymentResult('failure');
        return false;
      }
      return true;
    },
    [handlePaymentResult, parsePaymentResultFromUrl],
  );

  const PaymentOption = ({
    icon,
    title,
    sub,
    selected,
    onPress,
    color = colors.primary,
    disabled = false,
  }: any) => (
    <TouchableOpacity
      disabled={disabled}
      style={[
        styles.paymentItem,
        selected && {
          borderColor: color,
          borderWidth: 1.5,
          backgroundColor: `${color}10`,
        },
        disabled && {opacity: 0.5, backgroundColor: colors.surfaceVariant},
      ]}
      onPress={onPress}>
      <View
        style={[
          styles.iconCircle,
          {backgroundColor: disabled ? colors.border : `${color}20`},
        ]}>
        <Icon
          xml={icon}
          size={20}
          color={disabled ? colors.textMuted : color}
        />
      </View>
      <View style={{flex: 1}}>
        <Text
          style={[styles.paymentTitle, disabled && {color: colors.textMuted}]}>
          {title}
        </Text>
        <Text
          style={[styles.paymentSub, disabled && {color: colors.textMuted}]}>
          {disabled ? t('currently_unavailable') : sub}
        </Text>
      </View>
      {selected && !disabled && (
        <Icon xml={SVG_ICONS.selectionTickIcon} size={20} color={color} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => NavigationService.goBack()}
          style={styles.backBtn}>
          <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('checkout')}</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('delivery_address')}</Text>
            {selectedAddress && (
              <TouchableOpacity onPress={() => setSheetVisible(true)}>
                <Text style={styles.changeText}>{t('change')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {!selectedAddress ? (
            <TouchableOpacity
              style={styles.addAddressPlaceholder}
              onPress={() => setSheetVisible(true)}>
              <Icon
                xml={SVG_ICONS.locationPin}
                size={32}
                color={colors.primary}
              />
              <Text style={styles.addAddressText}>
                {t('add_delivery_address')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addressInfoRow}>
              <View style={styles.addressIconBox}>
                <Icon
                  xml={SVG_ICONS.branchesBuilding}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.addressTextContent}>
                <Text style={styles.addressName}>
                  {selectedAddress.location_name}
                </Text>
                <Text style={styles.addressSub} numberOfLines={2}>
                  {selectedAddress.address}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.outsideLabel}>{t('payment_method')}</Text>
        <View style={styles.paymentContainer}>
          <PaymentOption
            icon={SVG_ICONS.suitecase}
            title={t('credit_limit_pay')}
            selected={paymentMethod === 'credit'}
            onPress={() => setPaymentMethod('credit')}
            color={colors.success || '#10B981'}
            disabled={loading || isPaymentOpening || showWebView}
          />
          <PaymentOption
            icon={SVG_ICONS.wallet}
            title={t('credit_debit_card')}
            sub={t('pay_securely')}
            selected={paymentMethod === 'online_card'}
            onPress={() => setPaymentMethod('online_card')}
            color={colors.primary}
            disabled={loading || isPaymentOpening || showWebView}
          />
          <PaymentOption
            disabled
            icon={SVG_ICONS.wallet}
            title={t('horecahub_wallet')}
            sub={t('wallet_balance', {amount: 'AED 450.00'})}
            selected={paymentMethod === 'wallet'}
            onPress={() => setPaymentMethod('wallet')}
          />
          <PaymentOption
            icon={SVG_ICONS.cashIcon}
            title={t('cash_on_delivery')}
            sub={t('pay_when_received')}
            selected={paymentMethod === 'cod'}
            onPress={() => setPaymentMethod('cod')}
            disabled={loading || isPaymentOpening || showWebView}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={loading || isPaymentOpening || showWebView}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.placeOrderText}>
              {t('place_order')} — AED {parseFloat(grandTotal).toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment WebView Modal */}
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => resetPaymentWebViewState()}>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => resetPaymentWebViewState()}
              style={styles.backBtn}>
              <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('secure_payment')}</Text>
            <View style={{width: 40}} />
          </View>
          <WebView
            source={{uri: paymentUrl}}
            onNavigationStateChange={onNavigationStateChange}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            startInLoadingState
            renderLoading={() => (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loader}
              />
            )}
          />
        </SafeAreaView>
      </Modal>

      <AddressBottomSheet
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={(addr: any) => {
          setSelectedAddress(addr);
          setSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    headerTitle: {color: colors.text, fontSize: 20, fontWeight: 'bold'},
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    scrollContent: {padding: 16, paddingBottom: 40},
    sectionCard: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 18,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    sectionTitle: {color: colors.text, fontSize: 17, fontWeight: 'bold'},
    changeText: {color: colors.primary, fontWeight: '700'},
    addAddressPlaceholder: {
      alignItems: 'center',
      paddingVertical: 24,
      borderStyle: 'dashed',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: `${colors.primary}05`,
    },
    addAddressText: {color: colors.textMuted, marginTop: 10, fontWeight: '600'},
    addressInfoRow: {flexDirection: 'row', alignItems: 'center'},
    addressIconBox: {
      backgroundColor: `${colors.primary}15`,
      padding: 12,
      borderRadius: 12,
      marginRight: 16,
    },
    addressTextContent: {flex: 1},
    addressName: {color: colors.text, fontSize: 16, fontWeight: '700'},
    addressSub: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: 2,
      lineHeight: 18,
    },
    outsideLabel: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
      marginLeft: 4,
    },
    paymentContainer: {gap: 12, marginBottom: 20},
    paymentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconCircle: {padding: 10, borderRadius: 12, marginRight: 16},
    paymentTitle: {color: colors.text, fontSize: 16, fontWeight: '700'},
    paymentSub: {color: colors.textMuted, fontSize: 13, marginTop: 1},
    footer: {
      padding: 20,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    placeOrderBtn: {
      backgroundColor: colors.primary,
      borderRadius: 18,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    placeOrderText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
    loader: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -25,
      marginTop: -25,
    },
  });

export default CheckoutScreen;
