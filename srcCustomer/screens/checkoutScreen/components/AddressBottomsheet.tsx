import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from '../../../../Icon';
import { SVG_ICONS } from '../../../assets/icons/svg';
import {
  getCurrentCoordinates,
  requestLocationPermission,
} from '../../../utilities/locationHelper';
import { useToast } from '../../../components/ToastContext';
import { useAddressStore } from '../../../store/useAddressStore';
import { SCREEN_HEIGHT } from '../../../utilities/dimensions';
import { useTheme } from '../../../../ThemeContext';

const AddressBottomSheet = ({
  visible,
  onClose,
  onSelect,
  isBranchScreen = false,
}: any) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [view, setView] = useState<'list' | 'add'>('list');
  const [isLocating, setIsLocating] = useState(false);
  const { addresses, addAddress, loading, fetchAddresses } = useAddressStore();
  const { showToast } = useToast();

  // Form State
  const [label, setLabel] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  useEffect(() => {
    if (visible && !isBranchScreen) {
      fetchAddresses();
    }
  }, [visible]);

  const handleFetchLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      showToast('Permission Denied, Please enable location settings.', 'error');
      return;
    }

    setIsLocating(true);
    try {
      const coords: any = await getCurrentCoordinates();
      // Note: In production, use your actual Google Key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=YOUR_API_KEY`,
      );
      const json = await response.json();

      if (json.results && json.results.length > 0) {
        setFullAddress(json.results[0].formatted_address);
      }
    } catch (error) {
      console.error(error);
      showToast('Could not fetch location.', 'error');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSave = async () => {
    if (!label.trim() || !fullAddress.trim()) {
      showToast('Please fill in all fields');
      return;
    }

    try {
      const newAddressFromServer = await addAddress(label, fullAddress);
      showToast('Address saved successfully');
      onSelect(newAddressFromServer);
      resetForm();
      onClose();
    } catch (error: any) {
      const msg =
        error.response?.data?.detail || 'Could not save address. Try again.';
      showToast(msg);
    }
  };

  const resetForm = () => {
    setLabel('');
    setFullAddress('');
    setView('list');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      {loading && !isBranchScreen ? (
        <View style={[styles.overlay, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 10 }}>
            Loading Address...
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {view === 'list' ? 'Select Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              >
                <View style={styles.closeCircle}>
                  <Icon xml={SVG_ICONS.close} size={20} color={colors.text} />
                </View>
              </TouchableOpacity>
            </View>

            {view === 'list' && !isBranchScreen ? (
              /* ADDRESS LIST VIEW */
              <FlatList
                showsVerticalScrollIndicator={false}
                data={addresses}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.addrItem}
                    onPress={() => onSelect(item)}
                  >
                    <View style={styles.addrIcon}>
                      <Icon
                        xml={SVG_ICONS.branchesBuilding}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addrName}>{item.location_name}</Text>
                      <Text style={styles.addrStreet}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListFooterComponent={
                  <TouchableOpacity
                    style={styles.addNewBtn}
                    onPress={() => setView('add')}
                  >
                    <Icon
                      xml={SVG_ICONS.addIcon}
                      size={22}
                      color={colors.primary}
                    />
                    <Text style={styles.addNewText}>Add New Address</Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              /* ADD ADDRESS FORM VIEW */
              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>
                  LOCATION LABEL (E.G., BRANCH 2)
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter label"
                  placeholderTextColor={colors.textMuted}
                  value={label}
                  onChangeText={setLabel}
                />

                <Text style={styles.inputLabel}>FULL ADDRESS</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter street, building, area..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={fullAddress}
                  onChangeText={setFullAddress}
                />

                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={handleFetchLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Icon
                        xml={SVG_ICONS.locationPin}
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.locationButtonText}>
                        Use Current Location
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setView('list')}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Save Address</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background + 'B3', // 70% opacity
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      minHeight: 400,
      maxHeight: SCREEN_HEIGHT * 0.8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    sheetTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
    closeCircle: {
      backgroundColor: colors.background,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },

    // List Styles
    addrItem: {
      flexDirection: 'row',
      padding: 18,
      backgroundColor: colors.background,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addrIcon: {
      padding: 10,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginRight: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addrName: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    addrStreet: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
    addNewBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 18,
      borderRadius: 20,
      borderStyle: 'dashed',
      borderWidth: 1.5,
      borderColor: colors.primary,
      marginTop: 8,
    },
    addNewText: {
      color: colors.text,
      marginLeft: 10,
      fontWeight: '700',
      fontSize: 16,
    },

    // Form Styles
    formContainer: { marginTop: 10 },
    inputLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 10,
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      color: colors.text,
      fontSize: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 120,
      textAlignVertical: 'top',
    },
    formButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 10,
      marginBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    cancelBtn: {
      flex: 1,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveBtn: {
      flex: 1.5,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    cancelBtnText: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 6,
      marginTop: -15,
      marginBottom: 15,
    },
    locationButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  });

export default AddressBottomSheet;
