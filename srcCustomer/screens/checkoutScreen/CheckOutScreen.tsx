import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  TextInput,
} from 'react-native';
import AddressBottomSheet from './components/AddressBottomsheet';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useToast } from '../../components/ToastContext';
import { useCartStore } from '../../store/useCartStore';
import { useAddressStore } from '../../store/useAddressStore';
import * as NavigationService from '../../navigation/NavigationService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';

const CheckoutScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const { grandTotal } = route.params || { grandTotal: 0 };
  const [deliveryType, setDeliveryType] = useState<'express' | 'normal'>(
    'express',
  );
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const { placeOrder, loading } = useCartStore();
  const { setSelectedAddress, selectedAddress } = useAddressStore();
  const { showToast } = useToast();

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'error');
      return;
    }

    try {
      const result = await placeOrder(selectedAddress.id, paymentMethod);
      showToast('Order placed successfully!', 'success');
console.log('order resp is', result);

      // navigation.reset({
      //   index: 0,
      //   routes: [
      //     {
      //       name: 'OrderTrackingScreen',
      //       params: { orderId: result.results.data.id },
      //     },
      //   ],
      // });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Something went wrong';
      showToast(errorMessage, 'error');
    }
  };

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
        disabled && { opacity: 0.5, backgroundColor: colors.surfaceVariant },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: disabled ? colors.border : `${color}20` },
        ]}
      >
        <Icon
          xml={icon}
          size={20}
          color={disabled ? colors.textMuted : color}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[styles.paymentTitle, disabled && { color: colors.textMuted }]}
        >
          {title}
        </Text>
        <Text
          style={[styles.paymentSub, disabled && { color: colors.textMuted }]}
        >
          {disabled ? 'Currently Unavailable' : sub}
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => NavigationService.goBack()}
          style={styles.backBtn}
        >
          <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('checkout')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address Section */}
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
              onPress={() => setSheetVisible(true)}
            >
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

        {/* Delivery Time Section */}
        {/* <Text style={styles.outsideLabel}>{t('delivery_time')}</Text>
        <View style={styles.deliveryRow}>
          <TouchableOpacity
            style={[
              styles.deliveryBox,
              deliveryType === 'express' && styles.activeBox,
            ]}
            onPress={() => setDeliveryType('express')}
          >
            <Icon
              xml={SVG_ICONS.flashIcon}
              size={24}
              color={
                deliveryType === 'express' ? colors.primary : colors.textMuted
              }
            />
            <Text
              style={[
                styles.deliveryTitle,
                deliveryType === 'express' && styles.activeText,
              ]}
            >
              {t('express')}
            </Text>
            <Text style={styles.deliverySub}>45 mins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deliveryBox,
              deliveryType === 'normal' && styles.activeBox,
            ]}
            onPress={() => setDeliveryType('normal')}
          >
            <Icon
              xml={SVG_ICONS.timer}
              size={24}
              color={
                deliveryType === 'normal' ? colors.primary : colors.textMuted
              }
            />
            <Text
              style={[
                styles.deliveryTitle,
                deliveryType === 'normal' && styles.activeText,
              ]}
            >
              {t('Normal')}
            </Text> */}
            {/* <Text style={styles.deliverySub}>{t('choose_time')}</Text> */}
          {/* </TouchableOpacity>
        </View> */}

        {/* Payment Method */}
        <Text style={styles.outsideLabel}>{t('payment_method')}</Text>
        <View style={styles.paymentContainer}>
          <PaymentOption
            icon={SVG_ICONS.suitecase}
            title="Credit Limit Pay"
            sub=""
            selected={paymentMethod === 'credit'}
            onPress={() => setPaymentMethod('credit')}
            color={colors.success || '#10B981'}
          />
          <PaymentOption
            icon={SVG_ICONS.wallet}
            title={t('credit_debit_card', {defaultValue: 'Credit/Debit Card'})}
            sub={t('pay_securely', {defaultValue: 'Pay securely using card'})}
            selected={paymentMethod === 'online_card'}
            onPress={() => setPaymentMethod('online_card')}
            color={colors.primary}
          />
          {paymentMethod === 'online_card' ? (
            <View style={styles.cardDetailsContainer}>
              <Text style={styles.cardDetailsTitle}>
                {t('card_details', {defaultValue: 'Card Details'})}
              </Text>

              <TextInput
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder={t('card_number', {defaultValue: 'Card Number'})}
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={styles.cardInput}
              />

              <TextInput
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder={t('cardholder_name', {defaultValue: 'Cardholder Name'})}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                style={styles.cardInput}
              />

              <View style={styles.cardRow}>
                <TextInput
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  placeholder={t('expiry_mm_yy', {defaultValue: 'MM/YY'})}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  style={[styles.cardInput, styles.cardHalfInput]}
                />
                <TextInput
                  value={cardCvv}
                  onChangeText={setCardCvv}
                  placeholder={t('cvv', {defaultValue: 'CVV'})}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  secureTextEntry
                  style={[styles.cardInput, styles.cardHalfInput]}
                />
              </View>
            </View>
          ) : null}
          <PaymentOption
            disabled
            icon={SVG_ICONS.wallet}
            title="HorecaHub Wallet"
            sub="Balance: AED 450.00"
            selected={paymentMethod === 'wallet'}
            onPress={() => setPaymentMethod('wallet')}
          />
          <PaymentOption
            icon={SVG_ICONS.cashIcon}
            title="Cash on Delivery"
            sub="Pay when received"
            selected={paymentMethod === 'cod'}
            onPress={() => setPaymentMethod('cod')}
          />
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.placeOrderText}>
              {t('place_order')} — AED {parseFloat(grandTotal).toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

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
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,paddingVertical:10,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    headerTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
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
    scrollContent: { padding: 16, paddingBottom: 40 },

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
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: 'bold' },
    changeText: { color: colors.primary, fontWeight: '700' },

    addAddressPlaceholder: {
      alignItems: 'center',
      paddingVertical: 24,
      borderStyle: 'dashed',
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: `${colors.primary}05`,
    },
    addAddressText: {
      color: colors.textMuted,
      marginTop: 10,
      fontWeight: '600',
    },

    addressInfoRow: { flexDirection: 'row', alignItems: 'center' },
    addressIconBox: {
      backgroundColor: `${colors.primary}15`,
      padding: 12,
      borderRadius: 12,
      marginRight: 16,
    },
    addressTextContent: { flex: 1 },
    addressName: { color: colors.text, fontSize: 16, fontWeight: '700' },
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
    deliveryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    deliveryBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    activeBox: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}08`,
    },
    deliveryTitle: {
      color: colors.textMuted,
      fontSize: 15,
      fontWeight: '700',
      marginTop: 10,
    },
    deliverySub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    activeText: { color: colors.text },

    paymentContainer: { gap: 12, marginBottom: 20 },
    paymentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconCircle: { padding: 10, borderRadius: 12, marginRight: 16 },
    paymentTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
    paymentSub: { color: colors.textMuted, fontSize: 13, marginTop: 1 },

    cardDetailsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 6,
    },
    cardDetailsTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
    cardInput: {
      height: 50,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: 14,
      color: colors.text,
      fontSize: 16,
      marginBottom: 12,
    },
    cardRow: { flexDirection: 'row', gap: 12 },
    cardHalfInput: { flex: 1, marginBottom: 0 },

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
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    placeOrderText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  });

export default CheckoutScreen;
