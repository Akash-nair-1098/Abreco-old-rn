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
import { useTheme } from '../../../ThemeContext'; // Import your theme hook

const FREE_DELIVERY_THRESHOLD = 1000;

const CartScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

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
  } = useCartStore();

  const { showToast } = useToast();
  const [promoInput, setPromoInput] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchCart();
    }, []),
  );

  // Calculations
  const tot = parseFloat(itemTotal);
  const DELIVERY_FEE = parseFloat(shipping);
  const vat = tot * 0.05;
  const grandTotal = tot > 0 ? tot + DELIVERY_FEE + vat : 0;
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - tot);
  const progressPercent = Math.min(1, tot / FREE_DELIVERY_THRESHOLD);

  const handleQtyChange = async (id: string, delta: number) => {
    console.log('id is', id);
    
    try {
      await updateQty(id, delta);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update quantity';
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

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      await applyPromoCode(promoInput);
      setPromoInput('');
      showToast('Promo applied!');
    } catch (error: any) {
      showToast(error?.response?.data?.detail || 'Invalid Code');
    }
  };

  const handleRemovePromo = async () => {
    try {
      await applyPromoCode('');
      showToast('Promo removed');
    } catch (error: any) {
      showToast('Failed to remove promo');
    }
  };

  if (loading) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          {t('updating_cart')}
        </Text>
      </View>
    );
  }

  // Header Component for reuse
  const renderHeader = (count: number) => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Icon xml={SVG_ICONS.backIcon} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {t('cart')} ({count})
      </Text>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {renderHeader(0)}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCenter}>
            <Icon
              xml={SVG_ICONS.productsBag}
              size={80}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>{t('cart_empty')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.startShopping}>{t('start_shopping')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  console.log('item is', items);
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {renderHeader(items.length)}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {remainingForFree > 0
                ? `Add AED ${remainingForFree.toFixed(2)} for Free Delivery`
                : 'You unlocked Free Delivery!'}
            </Text>
            <Icon xml={SVG_ICONS.truckIcon} size={16} color="white" />
          </View>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Cart Items */}
        {items.map((item: any) => (
          <View key={item.id} style={styles.itemCard}>
            <Image
              source={{ uri: item.product_image }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item?.product_name}
                </Text>
                <TouchableOpacity onPress={() => handleRemove(item.id)}>
                  <Icon
                    xml={SVG_ICONS.deleteIcon}
                    size={16}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>
                  AED {parseFloat(item?.unit_price).toFixed(2)}
                </Text>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    onPress={() => handleQtyChange(item.id, item.quantity - 1)}
                  >
                    <Icon
                      xml={SVG_ICONS.minusIcon}
                      size={16}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => handleQtyChange(item.id, item.quantity + 1)}
                  >
                    <Icon
                      xml={SVG_ICONS.plusIcon}
                      size={16}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Instructions */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Icon
              xml={SVG_ICONS.descriptionIcon}
              size={16}
              color={colors.primary}
            />
            <Text style={styles.inputTitle}>{t('order_instructions')}</Text>
          </View>
          <TextInput
            placeholder="e.g., Deliver to rear entrance..."
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
        </View>

        {/* Promo Code */}
        {/* {promoCode && promoCode.trim() !== '' ? (
          <View style={[styles.inputCard, styles.promoAppliedRow]}>
            <View style={styles.promoInfo}>
              <Icon
                xml={SVG_ICONS.promoTagIcon}
                size={16}
                color={colors.success}
              />
              <Text style={styles.appliedPromoText}>{promoCode}</Text>
              <View style={styles.appliedBadge}>
                <Text style={styles.appliedBadgeText}>{t('applied')}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRemovePromo}>
              <Text style={styles.removeText}>{t('remove')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.inputCard, styles.promoRow]}>
            <Icon
              xml={SVG_ICONS.promoTagIcon}
              size={14}
              color={colors.textMuted}
            />
            <TextInput
              placeholder="Promo Code"
              placeholderTextColor={colors.textMuted}
              style={[styles.textInput, { flex: 1, marginTop: 0 }]}
              value={promoInput}
              onChangeText={setPromoInput}
              autoCapitalize="characters"
            />
            <TouchableOpacity onPress={handleApplyPromo}>
              <Text style={styles.applyText}>{t('apply')}</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* Billing Section */}
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
            <Text style={styles.billLabel}>VAT (5%)</Text>
            <Text style={styles.billValue}>AED {vat.toFixed(2)}</Text>
          </View>
          <View style={styles.dashedDivider} />
          <View style={styles.billRow}>
            <Text style={styles.grandTotalLabel}>{t('grand_total')}</Text>
            <Text style={styles.grandTotalValue}>
              AED {grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
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

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      gap: 15,
    },
    headerTitle: { color: colors.text, fontSize: 24, fontWeight: 'bold' },
    backBtn: { padding: 5 },
    scrollContent: { padding: 16 },

    // Progress
    progressCard: {
      backgroundColor: colors.isDark ? colors.surfaceVariant : colors.primary,
      padding: 16,
      borderRadius: 16,
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    progressText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    progressBarBg: {
      height: 6,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 3,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: 'white',
      borderRadius: 3,
    },

    // Items
    itemCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    itemName: { color: colors.text, fontSize: 16, fontWeight: '600' },
    itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemPrice: { color: colors.primary, fontSize: 18, fontWeight: 'bold' },
    qtyControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 4,
      paddingHorizontal: 8,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    qtyText: { color: colors.text, fontWeight: 'bold' },

    // Inputs
    inputCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    inputTitle: { color: colors.text, fontWeight: 'bold' },
    textInput: { color: colors.text, marginTop: 10, fontSize: 14 },
    promoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    applyText: { color: colors.primary, fontWeight: 'bold' },

    // Applied Promo
    promoAppliedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: `${colors.success}15`,
      borderColor: colors.success,
      borderWidth: 1,
      padding: 14,
    },
    promoInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    appliedPromoText: { color: colors.text, fontWeight: 'bold', fontSize: 14 },
    appliedBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    appliedBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    removeText: { color: colors.danger, fontWeight: 'bold' },

    // Bill
    billCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    billHeader: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    billRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    billLabel: { color: colors.textMuted },
    billValue: { color: colors.text, fontWeight: 'bold' },
    dashedDivider: {
      height: 1,
      borderTopWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      marginVertical: 10,
    },
    grandTotalLabel: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    grandTotalValue: { color: colors.danger, fontSize: 20, fontWeight: 'bold' },

    // Empty State
    emptyContainer: { flex: 1, justifyContent: 'center' },
    emptyCenter: { alignItems: 'center', marginTop: -100 },
    emptyText: { color: colors.textMuted, fontSize: 18, marginTop: 20 },
    startShopping: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
    },

    // Footer
    checkoutFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    checkoutBtn: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 16,
      alignItems: 'center',
    },
    checkoutBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    fullScreenLoader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background,
      opacity: 0.95,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });

export default CartScreen;
