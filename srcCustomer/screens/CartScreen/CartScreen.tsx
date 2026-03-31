import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import * as NavigationService from '../../navigation/NavigationService';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useCartStore } from '../../store/useCartStore';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from '../../components/ToastContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ThemeContext';

const FREE_DELIVERY_THRESHOLD = 1000;

const CartScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const {
    items,
    itemTotal,
    shipping,
    tax,
    loading,
    fetchCart,
    updateQty,
    removeItem,
    applyPromoCode,
    promoCode,
    billTotal
  } = useCartStore();

  const { showToast } = useToast();
  const [promoInput, setPromoInput] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, []),
  );

  const tot = parseFloat(itemTotal);
  const DELIVERY_FEE = parseFloat(shipping);
  const vat = parseFloat(tax);
  const grandTotal = parseFloat(billTotal);
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - tot);
  const progressPercent = Math.min(1, tot / FREE_DELIVERY_THRESHOLD);

  const handleQtyChange = async (id: string, delta: number) => {
    try {
      if (delta < 1) return; // Prevent negative/zero qty through this handler
      await updateQty(id, delta);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update';
      showToast(errorMsg, 'error');
    }
  };

  const handleRemove = (id: string) => {
    try {
      removeItem(id);
    } catch (error: any) {
      showToast(error?.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>{t('updating_cart')}</Text>
      </View>
    );
  }

  const renderHeader = (count: number) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Icon xml={SVG_ICONS.backIcon} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('cart')} ({count})</Text>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {renderHeader(0)}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCenter}>
            <Icon xml={SVG_ICONS.productsBag} size={80} color={colors.textMuted} />
            <Text style={styles.emptyText}>{t('cart_empty')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.startShopping}>{t('start_shopping')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderHeader(items.length)}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Progress Bar */}
        {/* <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {remainingForFree > 0
                ? `${t('add')} AED ${remainingForFree.toFixed(2)} ${t('for_free_delivery')}`
                : t('free_delivery_unlocked')}
            </Text>
            <Icon xml={SVG_ICONS.truckIcon} size={16} color="white" />
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }]} />
          </View>
        </View> */}

        {/* Cart Items */}
        {items.map((item: any) => (
          <View key={item.id} style={styles.itemCard}>
            <Image source={{ uri: item.product_image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item?.product_name}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleRemove(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.deleteBtn}
                >
                  <Icon xml={SVG_ICONS.deleteIcon} size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>
                  AED {parseFloat(item?.total_price).toFixed(2)}
                </Text>
                <View style={styles.qtyControl}>
                  <TouchableOpacity onPress={() => handleQtyChange(item.id, item.quantity - 1)}>
                    <Icon xml={SVG_ICONS.minusIcon} size={14} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleQtyChange(item.id, item.quantity + 1)}>
                    <Icon xml={SVG_ICONS.plusIcon} size={14} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Instructions */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Icon xml={SVG_ICONS.descriptionIcon} size={16} color={colors.primary} />
            <Text style={styles.inputTitle}>{t('order_instructions')}</Text>
          </View>
          <TextInput
            placeholder={t('delivery_instruction_placeholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
            multiline
          />
        </View>

        {/* Bill Section */}
        <View style={styles.billCard}>
          <Text style={styles.billHeader}>{t('bill_details')}</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('item_total')}</Text>
            <Text style={styles.billValue}>AED {tot.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('delivery_fee')}</Text>
            <Text style={styles.billValue}>AED {DELIVERY_FEE.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t('vat')} (5%)</Text>
            <Text style={styles.billValue}>AED {vat.toFixed(2)}</Text>
          </View>
          <View style={styles.dashedDivider} />
          <View style={styles.billRow}>
            <Text style={styles.grandTotalLabel}>{t('grand_total')}</Text>
            <Text style={styles.grandTotalValue}>AED {grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <View style={styles.checkoutFooter}>
        <TouchableOpacity
          onPress={() => NavigationService.navigate('Checkout', { grandTotal })}
          style={styles.checkoutBtn}
        >
          <Text style={styles.checkoutBtnText}>
            {t('checkout')} AED {grandTotal.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,paddingVertical:10, gap: 12 },
    headerTitle: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
    backBtn: { padding: 4 },
    scrollContent: { padding: 16, paddingBottom: 120 },

    // Progress Section
    progressCard: {
      backgroundColor: isDark ? colors.surfaceVariant : colors.primary,
      padding: 14,
      borderRadius: 12,
      marginBottom: 16,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressText: { color: 'white', fontWeight: '700', fontSize: 13, flex: 1, marginRight: 8 },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
    progressBarFill: { height: '100%', backgroundColor: 'white', borderRadius: 3 },

    // Item Cards (Responsive Logic)
    itemCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    itemImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: colors.background },
    itemDetails: { flex: 1, marginLeft: 10, justifyContent: 'center' },
    itemHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      marginBottom: 8 
    },
    itemName: { 
      color: colors.text, 
      fontSize: 15, 
      fontWeight: '600', 
      flex: 1, // Ensures name takes available space and doesn't push delete btn
      marginRight: 10 
    },
    deleteBtn: { padding: 2 },
    itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap', // Allows wrapping on extremely narrow screens
      gap: 5
    },
    itemPrice: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
    qtyControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 6,
      paddingVertical: 4,
      paddingHorizontal: 8,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    qtyText: { color: colors.text, fontWeight: 'bold', fontSize: 14, minWidth: 20, textAlign: 'center' },

    // Instructions
    inputCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    inputTitle: { color: colors.text, fontWeight: 'bold', fontSize: 14 },
    textInput: { color: colors.text, marginTop: 8, fontSize: 13, textAlignVertical: 'top' },

    // Billing
    billCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    billHeader: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    billLabel: { color: colors.textMuted, fontSize: 14 },
    billValue: { color: colors.text, fontWeight: '600', fontSize: 14 },
    dashedDivider: { height: 1, borderTopWidth: 1, borderColor: colors.border, borderStyle: 'dashed', marginVertical: 8 },
    grandTotalLabel: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    grandTotalValue: { color: colors.danger, fontSize: 18, fontWeight: 'bold' },

    // Empty State
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyCenter: { alignItems: 'center', paddingBottom: 50 },
    emptyText: { color: colors.textMuted, fontSize: 16, marginTop: 16 },
    startShopping: { color: colors.primary, fontSize: 16, fontWeight: 'bold', marginTop: 8 },

    // Footer
    checkoutFooter: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      padding: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    checkoutBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
    checkoutBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    fullScreenLoader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });

export default CartScreen;