import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { makeStyles } from './styles';
import CustomInput from './components/CustomInput';
import CustomPicker from './components/CustomPicker';
import RegistrationLayout from './components/RegistrationLayout';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import {
  registerBusinessInfo,
  getRegisterChoiceList,
  fetchSavedRegistrationData,
} from '../../api/auth/authApi';
import AddressPlacesField from '../../components/AddressPlacesField';
import {
  getCurrentCoordinates,
  requestLocationPermission,
} from '../../utilities/locationHelper';
import { geocodeAddressLine } from '../../utilities/googlePlaces';
import { BusinessInfoPayload } from '../../api/auth/auth.type';
import { useToast } from '../../components/ToastContext';
import { useTheme } from '../../../ThemeContext';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { getApiErrorMessage } from '../../utilities/apiErrorMessage';

export const BusinessDetailsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { params } = route;
  const { showToast } = useToast();

  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const isRejectedFlow: boolean = params?.isRejected || false;

  const [businessTypes, setBusinessTypes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const [showIosPicker, setShowIosPicker] = useState<string | null>(null);
  const [rejectedSteps, setRejectedSteps] = useState<number[]>([]);
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<any>({
    companyName: '',
    businessType: '',
    aboutBusiness: '',
    tradeLicenseNo: '',
    tradeLicenseExpiry: '',
    vatTrn: '',
    vatExpiry: '',
    officePhone: '',
    registeredAddresses: [
      {
        id: 'temp-1',
        location_name: 'Main Office',
        address: '',
        phone_number: '',
        address_status: 'Pending',
        latitude: '',
        longitude: '',
        isNew: true,
      },
    ],
  });

  const [initialFormData, setInitialFormData] = useState<string>('');

  // If the flow is rejected, we make the whole form editable as requested
  const isFormEditable = (): boolean => {
    if (!isRejectedFlow) return true;
    return rejectedSteps.includes(1); 
  };

  useEffect(() => {
    const init = async () => {
      setFetchingData(true);
      await Promise.all([loadChoices(), loadSavedData()]);
      setFetchingData(false);
    };
    init();
  }, []);

  const loadChoices = async () => {
    try {
      const response = await getRegisterChoiceList();
      const types = response.results.data.business_types.map((item: any) => ({
        id: item.value,
        name: item.label,
      }));
      setBusinessTypes(types);
    } catch {
      showToast('Failed to load business types', 'error');
    }
  };

  const loadSavedData = async () => {
    if (!params?.user_id) return;
    try {
      const response = await fetchSavedRegistrationData(params.user_id);
      const data = response?.results?.data;
      if (!data) return;

      const allAddresses =
        data.addresses?.length > 0
          ? data.addresses.map((addr: any) => ({
              id: addr.id?.toString(),
              location_name: addr.location_name || '',
              address: addr.address || '',
              phone_number: addr.phone_number || '',
              address_status: addr.address_status || 'Pending',
              latitude:
                addr.latitude != null && addr.latitude !== ''
                  ? String(addr.latitude)
                  : '',
              longitude:
                addr.longitude != null && addr.longitude !== ''
                  ? String(addr.longitude)
                  : '',
              isNew: false,
            }))
          : [
              {
                id: 'temp-1',
                location_name: 'Main Office',
                address: '',
                phone_number: '',
                address_status: 'Pending',
                latitude: '',
                longitude: '',
                isNew: true,
              },
            ];

      const savedState = {
        companyName: data.first_name || '',
        businessType: data.business_type || '',
        aboutBusiness: data.about_business || '',
        tradeLicenseNo: data.trade_license_number || '',
        tradeLicenseExpiry: data.trade_licence_expiry || '',
        vatTrn: data.vat_trn || '',
        vatExpiry: data.vat_certificate_expiry || '',
        officePhone: data.office_phone_number || '',
        registeredAddresses: allAddresses,
      };

      setFormData(savedState);
      setInitialFormData(JSON.stringify(savedState));

      if (data.rejected_steps?.length) {
        setRejectedSteps(data.rejected_steps);
      }
    } catch {
      setInitialFormData(JSON.stringify(formData));
    }
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleDatePress = (field: 'tradeLicenseExpiry' | 'vatExpiry') => {
    if (!isFormEditable()) return;
    if (Platform.OS === 'android') {
      try {
        DateTimePickerAndroid.open({
          value: formData[field] ? new Date(formData[field]) : new Date(),
          onChange: (event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              setFormData((prev: any) => ({ ...prev, [field]: formatDate(selectedDate) }));
            }
          },
          mode: 'date',
        });
      } catch {
        Alert.alert('Error', 'Could not open Date Picker.');
      }
    } else {
      setShowIosPicker(field);
    }
  };

  const validate = (): boolean => {
    const newErrors: any = {};
    if (!formData.companyName?.trim()) newErrors.companyName = 'Required';
    if (!formData?.businessType) newErrors.businessType = 'Required';
    if ((formData?.aboutBusiness?.trim().length ?? 0) < 10)
      newErrors.aboutBusiness = 'Min 10 characters';
    if (!formData?.tradeLicenseNo?.trim()) newErrors.tradeLicenseNo = 'Required';
    if (formData.vatTrn.length !== 15) newErrors.vatTrn = 'Must be 15 digits';
    if (formData.officePhone.length > 10) newErrors.officePhone = 'Max 10 characters';
    if (!formData.registeredAddresses[0]?.address?.trim()) newErrors.address = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigateNext = () => {
    navigation.navigate('AddContacts', {
      secret_token: params.secret_token,
      user_id: params.user_id,
      phone_number: params.phone_number,
      isRejected: isRejectedFlow,
    });
  };

  const handleBusinessSubmit = async () => {
    if (!validate()) {
      Alert.alert('Error', 'Please correct the errors before continuing');
      return;
    }

    if (initialFormData === JSON.stringify(formData)) {
      navigateNext();
      return;
    }

    setLoading(true);
    try {
      const resolvedAddresses = await Promise.all(
        formData.registeredAddresses.map(async (row: any) => {
          let lat = row.latitude?.toString().trim() ?? '';
          let lng = row.longitude?.toString().trim() ?? '';
          if ((!lat || !lng) && row.address?.trim()) {
            const geo = await geocodeAddressLine(row.address);
            if (geo) {
              lat = geo.lat;
              lng = geo.lng;
            }
          }
          return { ...row, latitude: lat, longitude: lng };
        }),
      );

      const payload: BusinessInfoPayload = {
        secret_token: params.secret_token,
        user_id: params.user_id,
        phone_number: params.phone_number,
        first_name: formData.companyName,
        business_type: formData.businessType,
        about_business: formData.aboutBusiness,
        trade_license_number: formData.tradeLicenseNo,
        trade_license_expiry: formData.tradeLicenseExpiry,
        vat_trn: formData.vatTrn,
        vat_expiry: formData.vatExpiry,
        office_phone_number: formData.officePhone,
        addresses: resolvedAddresses.map(
          ({
            id,
            location_name,
            address,
            phone_number,
            isNew,
            latitude,
            longitude,
          }: any) => {
            const addrObj: any = { location_name, address, phone_number };
            if (latitude) addrObj.latitude = String(latitude);
            if (longitude) addrObj.longitude = String(longitude);
            if (!isNew) {
              addrObj.id = id;
            }
            return addrObj;
          },
        ),
      };

      await registerBusinessInfo(payload);
      setFormData((prev: any) => ({ ...prev, registeredAddresses: resolvedAddresses }));
      showToast('Business details saved!', 'success');
      navigateNext();
    } catch (e: any) {
      showToast(getApiErrorMessage(e, 'Failed to save'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = (id: string, field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      registeredAddresses: prev.registeredAddresses.map((addr: any) =>
        addr.id === id ? { ...addr, [field]: value } : addr,
      ),
    }));
  };

  const setAddressFromPlace = (
    addrId: string,
    address: string,
    lat: string,
    lng: string,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      registeredAddresses: prev.registeredAddresses.map((addr: any) =>
        addr.id === addrId
          ? {
              ...addr,
              address,
              latitude: lat || '',
              longitude: lng || '',
            }
          : addr,
      ),
    }));
  };

  const [locatingId, setLocatingId] = useState<string | null>(null);

  const handleUseLocationForAddress = async (addrId: string) => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      showToast('Please enable location to use this option.', 'error');
      return;
    }
    setLocatingId(addrId);
    try {
      const location: any = await getCurrentCoordinates();
      const lat = location.latitude.toString();
      const lng = location.longitude.toString();
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const json = await response.json();
      const addressName =
        json.results?.[0]?.formatted_address ?? `${lat}, ${lng}`;
      setAddressFromPlace(addrId, addressName, lat, lng);
    } catch {
      showToast('Could not fetch location.', 'error');
    } finally {
      setLocatingId(null);
    }
  };

  if (fetchingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.subtitle, { marginTop: 12 }]}>Loading...</Text>
      </View>
    );
  }

  const bizEditable = isFormEditable();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <RegistrationLayout
        currentStep={1}
        onContinue={handleBusinessSubmit}
        onCancel={() => navigation.goBack()}
        isLoading={loading}
        rejectedSteps={rejectedSteps}
      >
        <Text style={styles.title}>Business Information</Text>

        {isRejectedFlow && rejectedSteps.includes(1) && (
          <View style={styles.rejectionBanner}>
            <Text style={styles.rejectionBannerText}>
              ⚠ Step rejected. Please update the information below.
            </Text>
          </View>
        )}

        <CustomInput
          label="Owner Name"
          placeholder="Enter owner name"
          value={formData.companyName}
          onChangeText={text => setFormData((p: any) => ({ ...p, companyName: text }))}
          error={errors.companyName}
          icon={SVG_ICONS.branchIcon}
          disabled={!bizEditable}
        />

        <CustomPicker
          label="Business Type"
          value={formData.businessType}
          options={businessTypes}
          onChange={item => setFormData((p: any) => ({ ...p, businessType: item.id }))}
          leftIcon={SVG_ICONS.suitecase}
          error={errors.businessType}
          disabled={!bizEditable}
        />

        <CustomInput
          label="About Business"
          placeholder="Describe operations (min 10 chars)"
          value={formData.aboutBusiness}
          onChangeText={text => setFormData((p: any) => ({ ...p, aboutBusiness: text }))}
          error={errors.aboutBusiness}
          multiline
          disabled={!bizEditable}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <CustomInput
              label="Trade License No."
              placeholder="e.g. TL-000"
              maxLength={20}
              value={formData.tradeLicenseNo}
              onChangeText={text => setFormData((p: any) => ({ ...p, tradeLicenseNo: text }))}
              error={errors.tradeLicenseNo}
              disabled={!bizEditable}
            />
          </View>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => handleDatePress('tradeLicenseExpiry')}
            disabled={!bizEditable}
          >
            <View pointerEvents="none">
              <CustomInput
                label="Expiry Date"
                onChangeText={() => {}}
                placeholder="Select Date"
                value={formData.tradeLicenseExpiry}
                icon={SVG_ICONS.calenderIcon}
                disabled={!bizEditable}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <CustomInput
              label="VAT TRN"
              placeholder="15 digits"
              value={formData.vatTrn}
              onChangeText={text => setFormData((p: any) => ({ ...p, vatTrn: text }))}
              error={errors.vatTrn}
              keyboardType="numeric"
              maxLength={15}
              disabled={!bizEditable}
            />
          </View>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => handleDatePress('vatExpiry')}
            disabled={!bizEditable}
          >
            <View pointerEvents="none">
              <CustomInput
                label="VAT Expiry"
                onChangeText={() => {}}
                placeholder="Select Date"
                value={formData.vatExpiry}
                icon={SVG_ICONS.calenderIcon}
                disabled={!bizEditable}
              />
            </View>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'ios' && showIosPicker && (
          <DateTimePicker
            value={formData[showIosPicker] ? new Date(formData[showIosPicker]) : new Date()}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              setShowIosPicker(null);
              if (date)
                setFormData((p: any) => ({ ...p, [showIosPicker!]: formatDate(date) }));
            }}
          />
        )}

        <CustomInput
          label="Office Phone"
          placeholder="10 digits"
          value={formData.officePhone}
          onChangeText={text => setFormData((p: any) => ({ ...p, officePhone: text }))}
          error={errors.officePhone}
          keyboardType="phone-pad"
          // maxLength={10}
          disabled={!bizEditable}
        />

        <View style={styles.addressHeader}>
          <Text style={styles.inputLabel}>Registered Addresses</Text>
          {bizEditable && (
            <TouchableOpacity
              onPress={() =>
                setFormData((p: any) => ({
                  ...p,
                  registeredAddresses: [
                    ...p.registeredAddresses,
                    {
                      id: `temp-${Date.now()}`,
                      location_name: '',
                      address: '',
                      phone_number: '',
                      address_status: 'Pending',
                      latitude: '',
                      longitude: '',
                      isNew: true,
                    },
                  ],
                }))
              }
            >
              <Text style={styles.addButton}>+ Add Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {formData.registeredAddresses.map((addr: any, index: number) => {
          return (
            <View key={addr.id} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.inputLabel}>Address #{index + 1}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {isRejectedFlow && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            addr.address_status?.toLowerCase() === 'rejected'
                              ? 'rgba(239,68,68,0.15)'
                              : 'rgba(74,222,128,0.15)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color:
                              addr.address_status?.toLowerCase() === 'rejected'
                                ? '#EF4444'
                                : '#4ADE80',
                          },
                        ]}
                      >
                        {addr.address_status || 'Pending'}
                      </Text>
                    </View>
                  )}
                  {index > 0 && bizEditable && (
                    <TouchableOpacity
                      onPress={() =>
                        setFormData((p: any) => ({
                          ...p,
                          registeredAddresses: p.registeredAddresses.filter(
                            (a: any) => a.id !== addr.id,
                          ),
                        }))
                      }
                    >
                      <Icon xml={SVG_ICONS.deleteIcon} color="#F04438" size={18} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <CustomInput
                label="Address Label"
                placeholder="Warehouse, Branch, etc."
                value={addr.location_name}
                onChangeText={text => updateAddress(addr.id, 'location_name', text)}
                disabled={!bizEditable}
              />
              <AddressPlacesField
                label="Full Address"
                value={addr.address}
                onChangeText={text => {
                  updateAddress(addr.id, 'address', text);
                  updateAddress(addr.id, 'latitude', '');
                  updateAddress(addr.id, 'longitude', '');
                }}
                onPlaceResolved={(a, lat, lng) =>
                  setAddressFromPlace(addr.id, a, lat, lng)
                }
                error={index === 0 ? errors.address : null}
                disabled={!bizEditable}
              />
              <TouchableOpacity
                style={styles.addressLocationBtn}
                onPress={() => handleUseLocationForAddress(addr.id)}
                disabled={!bizEditable || locatingId === addr.id}>
                {locatingId === addr.id ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Icon xml={SVG_ICONS.locationPin} size={16} color={colors.primary} />
                    <Text style={styles.addressLocationBtnText}>
                      Use current location
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <CustomInput
                label="Phone Number"
                placeholder="Enter Phone Number"
                value={addr.phone_number}
                onChangeText={text => updateAddress(addr.id, 'phone_number', text)}
                disabled={!bizEditable}
              />
            </View>
          );
        })}
      </RegistrationLayout>
    </KeyboardAvoidingView>
  );
};

export default BusinessDetailsScreen;