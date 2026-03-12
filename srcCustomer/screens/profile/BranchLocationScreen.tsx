import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useAddressStore } from '../../store/useAddressStore';
import AddressBottomSheet from '../checkoutScreen/components/AddressBottomsheet';
import LoadingScreen from '../../components/LoadingScreen';
import * as NavigationService from '../../navigation/NavigationService';
import { useTheme } from '../../../ThemeContext'; // Import your theme hook

const BranchLocationScreen = () => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [view, setView] = useState<'list' | 'add'>('list');
  const {
    addresses,
    loading,
    fetchAddresses,
    selectedAddress,
    setSelectedAddress,
  } = useAddressStore();
  const [isSheetVisible, setSheetVisible] = useState(false);

  // Form State
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  React.useEffect(() => {
    fetchAddresses();
  }, []);

  const deleteBranch = (id: string) => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to remove this branch?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Logic to delete branch via store
          },
        },
      ],
    );
  };

  const renderBranchItem = ({ item }: { item: any }) => (
    <View style={styles.branchCard}>
      <View style={styles.branchIconContainer}>
        <Icon xml={SVG_ICONS.branchIcon} size={24} color={colors.primary} />
      </View>
      <View style={styles.branchInfo}>
        <Text style={styles.branchName}>{item?.location_name}</Text>
        <Text style={styles.branchAddress}>{item?.address}</Text>
        {selectedAddress?.id === item.id && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default for Delivery</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => deleteBranch(item.id)}
        style={styles.deleteBtn}
      >
        <Icon xml={SVG_ICONS.deleteIcon} size={22} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => NavigationService.goBack()}
            >
              <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {view === 'list' ? 'Address Book' : 'Add New Location'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <FlatList
            data={addresses}
            keyExtractor={item => item.id}
            renderItem={renderBranchItem}
            contentContainerStyle={styles.listPadding}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addBtnDashed}
                onPress={() => setSheetVisible(true)}
              >
                <Icon
                  xml={SVG_ICONS.addIcon}
                  size={24}
                  color={colors.textMuted}
                />
                <Text style={styles.addBtnText}>Add New Location</Text>
              </TouchableOpacity>
            }
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      <AddressBottomSheet
        visible={isSheetVisible}
        onClose={() => setSheetVisible(false)}
        onSelect={addr => {
          setSelectedAddress(addr);
          setSheetVisible(false);
        }}
        isBranchScreen={true}
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 20,
      backgroundColor: colors.background,
    },
    backBtn: {
      width: 40,
      height: 40,
      backgroundColor: colors.surface,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerTitle: { color: colors.text, fontSize: 24, fontWeight: 'bold' },

    // List View Styles
    listPadding: { padding: 16 },
    branchCard: {
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    branchIconContainer: {
      width: 52,
      height: 52,
      backgroundColor: `${colors.primary}15`,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    branchInfo: { flex: 1 },
    branchName: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    branchAddress: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 4,
      lineHeight: 20,
    },
    deleteBtn: { padding: 4 },
    defaultBadge: {
      backgroundColor: `${colors.success}15`,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginTop: 12,
      borderWidth: 1,
      borderColor: `${colors.success}30`,
    },
    defaultText: {
      color: colors.success,
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    addBtnDashed: {
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: 22,
      padding: 24,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      backgroundColor: colors.surface,
    },
    addBtnText: {
      color: colors.text,
      fontSize: 17,
      fontWeight: 'bold',
      marginLeft: 10,
    },

    // Form View Styles (Retained for future use)
    formContainer: { padding: 16, paddingBottom: 40 },
    inputGroup: { marginBottom: 24 },
    inputLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 12,
      letterSpacing: 1,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 18,
      color: colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveBtn: {
      flex: 1.5,
      height: 64,
      backgroundColor: colors.primary,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
    },
    saveBtnText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  });

export default BranchLocationScreen;
