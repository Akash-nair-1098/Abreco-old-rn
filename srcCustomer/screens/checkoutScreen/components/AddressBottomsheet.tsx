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
  ScrollView,
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
import { GOOGLE_MAPS_API_KEY } from '@env';

const AddressBottomSheet = ({
  visible,
  onClose,
  onSelect,
  isBranchScreen = false,
}: any) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  

  const [view, setView] = useState<'list' | 'add'>('list');
  const [isLocating, setIsLocating] = useState(false);
  const { addresses, addAddress, loading, fetchAddresses } = useAddressStore();
  const { showToast } = useToast();

  // Form State
  const [label, setLabel] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [detectedLocationName, setDetectedLocationName] = useState('');

  // Validation State
  const [errors, setErrors] = useState<{ label?: string; address?: string; location?: string }>({});

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
    setErrors(prev => ({ ...prev, location: undefined }));
    
    try {
      const location: any = await getCurrentCoordinates();
      const lat = location.latitude.toString();
      const lng = location.longitude.toString();
      
      setCoords({ lat, lng });
      // Note: Replace YOUR_API_KEY with your actual Google Maps API Key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const json = await response.json();
      // console.log('json is', json)

      if (json.results && json.results.length > 0) {
        const addressName = json.results[0].formatted_address;
        setDetectedLocationName(addressName);
        if (!fullAddress) setFullAddress(addressName);
      }
    } catch (error) {
      console.error(error);
      showToast('Could not fetch location.', 'error');
    } finally {
      setIsLocating(false);
    }
  };

  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!label.trim()) {
      newErrors.label = 'Location label is required';
      valid = false;
    }
    if (!fullAddress.trim()) {
      newErrors.address = 'Please provide full address details';
      valid = false;
    }
    if (!coords) {
      newErrors.location = 'Location coordinates are mandatory for delivery';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const newAddressFromServer = await addAddress(
        label,
        fullAddress,
        coords!.lat,
        coords!.lng
      );
      showToast('Address saved successfully', 'success');
      onSelect(newAddressFromServer);
      resetForm();
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Could not save address.';
      showToast(msg, 'error');
    }
  };

  const resetForm = () => {
    setLabel('');
    setFullAddress('');
    setCoords(null);
    setDetectedLocationName('');
    setErrors({});
    setView('list');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      {loading && !isBranchScreen ? (
        <View style={[styles.overlay, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {view === 'list' ? 'Select Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => { resetForm(); onClose(); }}>
                <View style={styles.closeCircle}>
                  <Icon xml={SVG_ICONS.close} size={20} color={colors.text} />
                </View>
              </TouchableOpacity>
            </View>

            {view === 'list' && !isBranchScreen ? (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={addresses}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.addrItem} onPress={() => onSelect(item)}>
                    <View style={styles.addrIcon}>
                      <Icon xml={SVG_ICONS.branchesBuilding} size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addrName}>{item.location_name}</Text>
                      <Text style={styles.addrStreet}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListFooterComponent={
                  <TouchableOpacity style={styles.addNewBtn} onPress={() => setView('add')}>
                    <Icon xml={SVG_ICONS.addIcon} size={22} color={colors.primary} />
                    <Text style={styles.addNewText}>Add New Address</Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                  <View style={styles.infoBox}>
                    <Icon xml={SVG_ICONS.infoCircle} size={18} color={colors.primary} />
                    <Text style={styles.infoBoxText}>
                      Please add this address from the place where you want the product to be delivered.
                    </Text>
                  </View>

                  <Text style={styles.inputLabel}>LOCATION LABEL</Text>
                  <TextInput
                    style={[styles.input, errors.label && styles.inputError]}
                    placeholder="E.g., Home, Shop, Branch 2"
                    placeholderTextColor={colors.textMuted}
                    value={label}
                    onChangeText={(val) => {
                        setLabel(val);
                        if(val) setErrors(p => ({...p, label: undefined}));
                    }}
                  />
                  {errors.label && <Text style={styles.errorText}>{errors.label}</Text>}

                  <Text style={styles.inputLabel}>FULL ADDRESS</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, errors.address && styles.inputError]}
                    placeholder="House No, Street, Landmark..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={4}
                    value={fullAddress}
                    onChangeText={(val) => {
                        setFullAddress(val);
                        if(val) setErrors(p => ({...p, address: undefined}));
                    }}
                  />
                  {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleFetchLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Icon xml={SVG_ICONS.locationPin} size={16} color={colors.primary} />
                        <Text style={styles.locationButtonText}>Use Current Location</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  {errors.location && <Text style={[styles.errorText, {marginTop: -5, marginBottom: 10}]}>{errors.location}</Text>}

                  {/* READ-ONLY GPS DISPLAY */}
                  <Text style={styles.inputLabel}>GPS DETECTED LOCATION (READ-ONLY)</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={detectedLocationName || 'Location not fetched yet'}
                    editable={false}
                    multiline
                    placeholderTextColor={colors.textMuted}
                  />

                  <View style={styles.formButtons}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setView('list')}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                      <Text style={styles.saveBtnText}>Save Address</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      maxHeight: SCREEN_HEIGHT * 0.9,
    },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sheetTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
    closeCircle: { backgroundColor: colors.background, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    addrItem: { flexDirection: 'row', padding: 18, backgroundColor: colors.background, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    addrIcon: { padding: 10, backgroundColor: colors.surface, borderRadius: 12, marginRight: 14, borderWidth: 1, borderColor: colors.border },
    addrName: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
    addrStreet: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
    addNewBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.primary, marginTop: 8 },
    addNewText: { color: colors.text, marginLeft: 10, fontWeight: '700', fontSize: 16 },
    formContainer: { marginTop: 10 },
    infoBox: { backgroundColor: colors.primary + '15', padding: 12, borderRadius: 12, flexDirection: 'row', gap: 10, marginBottom: 20, alignItems: 'center' },
    infoBoxText: { color: colors.primary, fontSize: 13, fontWeight: '600', flex: 1 },
    inputLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginBottom: 8, letterSpacing: 0.5 },
    input: { backgroundColor: colors.background, borderRadius: 16, padding: 16, color: colors.text, fontSize: 16, marginBottom: 5, borderWidth: 1, borderColor: colors.border },
    inputError: { borderColor: '#FF5252' },
    errorText: { color: '#FF5252', fontSize: 12, marginBottom: 15, fontWeight: '600' },
    disabledInput: { backgroundColor: colors.surface, opacity: 0.7, color: colors.textMuted },
    textArea: { height: 100, textAlignVertical: 'top' },
    locationButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 6 },
    locationButtonText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
    formButtons: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: Platform.OS === 'ios' ? 40 : 20 },
    cancelBtn: { flex: 1, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    saveBtn: { flex: 1.5, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary },
    cancelBtnText: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  });

export default AddressBottomSheet;