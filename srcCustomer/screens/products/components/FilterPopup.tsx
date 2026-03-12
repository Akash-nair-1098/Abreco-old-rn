import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../../../ThemeContext';


const FILTER_MAPPING = [
  { label: 'On Sale', key: 'on_sale' },
  { label: 'Best Sellers', key: 'best_seller' },
  { label: 'New Arrivals', key: 'new_arrivals' },
  { label: 'Express Delivery', key: 'express_delivery' },
];

const FilterPopup = ({ visible, onClose, onApply, initialValues }: any) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const [popular, setPopular] = useState<any>(
    initialValues?.popular_filters || {},
  );
  const [minPrice, setMinPrice] = useState(
    initialValues?.price_range?.min?.toString() || '',
  );
  const [maxPrice, setMaxPrice] = useState(
    initialValues?.price_range?.max?.toString() || '',
  );

  useEffect(() => {
    if (visible) {
      setPopular(initialValues?.popular_filters || {});
      setMinPrice(initialValues?.price_range?.min?.toString() || '');
      setMaxPrice(initialValues?.price_range?.max?.toString() || '');
    }
  }, [visible, initialValues]);

  const toggleFilter = (key: string) => {
    setPopular((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApply = () => {
    onApply({
      popular_filters: popular,
      price_range: {
        min: minPrice ? parseFloat(minPrice) : undefined,
        max: maxPrice ? parseFloat(maxPrice) : undefined,
      },
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              <View style={styles.dragHandle} />

              <Text style={styles.title}>POPULAR FILTERS</Text>

              {FILTER_MAPPING.map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.checkboxRow}
                  onPress={() => toggleFilter(item.key)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      popular[item.key] && styles.checked,
                    ]}
                  >
                    {popular[item.key] && (
                      <View style={styles.checkmarkInner} />
                    )}
                  </View>
                  <Text style={styles.filterLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.title, { marginTop: 20 }]}>PRICE (AED)</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  returnKeyType="done"
                />
                <Text style={styles.hyphen}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}
              >
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    content: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 25,
      paddingBottom: Platform.OS === 'ios' ? 40 : 25,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    title: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 20,
      letterSpacing: 0.5,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 18,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    checked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmarkInner: {
      width: 10,
      height: 10,
      backgroundColor: 'white',
      borderRadius: 2,
    },
    filterLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
      gap: 12,
    },
    priceInput: {
      flex: 1,
      height: 54,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
    },
    hyphen: {
      color: colors.textMuted,
      fontSize: 20,
    },
    applyButton: {
      backgroundColor: colors.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    applyText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });

export default FilterPopup;
