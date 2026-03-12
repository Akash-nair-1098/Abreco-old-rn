import { useState } from "react";
import { BusinessDetails } from "./types";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { registrationStyles } from "./styles";
import CustomInput from "./components/CustomInput";
import CustomPicker from "./components/CustomPicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "../../../Icon";
import { SVG_ICONS } from "../../assets/icons/svg";
import RegistrationLayout from "./components/RegistrationLayout";
import { registerBusinessInfo } from "../../api/auth/authApi";
import { BusinessInfoPayload } from "../../api/auth/auth.type";
import { useToast } from "../../components/ToastContext";

const BUSINESS_TYPES = [
  { id: 'Restaurant', name: 'Restaurant' },
  { id: 'Hotel', name: 'Hotel' },
  { id: 'Catering', name: 'Catering' },
  { id: 'Retail', name: 'Retail' },
  { id: 'Other', name: 'Other' },
];


export const BusinessDetailsScreen = ({route }:any) => {
const {params} = route

    const navigation = useNavigation<NativeStackNavigationProp<any>>();
  // secret_token: 'd8fbacebb4c4b147810d71b7f23163b51db44b619d3502d04221eda6d98b81d8';
    console.log('secreat token', route.params);
  const [formData, setFormData] = useState<any>({
    companyName: '',
    businessType: '',
    aboutBusiness: '',
    tradeLicenseNo: '',
    vatTrn: '',
    officePhone: '',
    registeredAddresses: [{ id: '1', label: 'Main Office', fullAddress: '' }],
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
   const styles = registrationStyles;

  const { showToast } = useToast();
  const secretToken =
    params?.secret_token ||
    'f5bae64b6534144bb874c49cce0af9dbbb86f17dec71ca3ef370cf2c114a88a5';

  const phoneNumber = params?.phone_number || '1233405554';

  const validate = (): boolean => {
    const newErrors: any = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Required';
    if (!formData.tradeLicenseNo.trim()) newErrors.tradeLicenseNo = 'Required';
    if (!formData.vatTrn.trim()) newErrors.vatTrn = 'Required';
    else if (!/^\d{15}$/.test(formData.vatTrn))
      newErrors.vatTrn = 'Must be 15 digits';
    if (!formData.officePhone.trim()) newErrors.officePhone = 'Required';
    if (!formData.registeredAddresses[0].fullAddress.trim())
      newErrors.address = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleBusinessSubmit = async () => {
    if (!validate()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const payload: BusinessInfoPayload = {
      secret_token: params.secret_token,
      //secret_token: 'f5bae64b6534144bb874c49cce0af9dbbb86f17dec71ca3ef370cf2c114a88a5',

      phone_number: params.phone_number,
      company_name: formData.companyName,
      business_type: formData.businessType,
      about_business: formData.aboutBusiness,
      trade_license_number: formData.tradeLicenseNo,
      vat_trn: formData.vatTrn,
      office_phone_number: formData.officePhone,
      addresses: formData.registeredAddresses,
    };

    setLoading(true);
    try {
      const result = await registerBusinessInfo(payload);

      showToast('Business details registered!', 'success');

      // Navigate to the next step or dashboard
      navigation.navigate('AddContacts', {
        secret_token: secretToken,
        phone_number: phoneNumber,
      });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || 'Failed to register business info';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleAddAddress = () => {
    const newAddress = {
      id: Date.now().toString(), // Unique ID for key
      label: '',
      fullAddress: '',
    };
    setFormData({
      ...formData,
      registeredAddresses: [...formData.registeredAddresses, newAddress],
    });
  };

  const removeAddress = (id: string) => {
    if (formData.registeredAddresses.length > 1) {
      setFormData({
        ...formData,
        registeredAddresses: formData.registeredAddresses.filter(a => a.id !== id),
      });
    }
  };

  const updateAddress = (id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      registeredAddresses: formData.registeredAddresses.map(addr =>
        addr.id === id ? { ...addr, [field]: value } : addr,
      ),
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <RegistrationLayout
        currentStep={1}
        onContinue={() => handleBusinessSubmit()}
        onCancel={() => navigation.goBack()}
      >
        <Text style={styles.title}>Business Information</Text>
        <Text style={styles.subtitle}>
          Please provide your official company details as per your trade
          license.
        </Text>

        <CustomInput
          label="Owner Name"
          placeholder="Owner full name"
          value={formData.companyName}
          onChangeText={text => setFormData({ ...formData, companyName: text })}
          error={errors.companyName}
          icon={SVG_ICONS.branchIcon}
        />

        <CustomPicker
          label="Business Type"
          value={formData.businessType}
          options={BUSINESS_TYPES}
          onChange={item => setFormData({ ...formData, businessType: item.id })}
          leftIcon={SVG_ICONS.suitecase}
          error={errors.businessType}
        />

        <CustomInput
          label="About Business"
          placeholder="Tell us briefly about your business operations..."
          value={formData.aboutBusiness}
          onChangeText={text =>
            setFormData({ ...formData, aboutBusiness: text })
          }
          multiline
        />

        <CustomInput
          label="Trade License No."
          placeholder="e.g. CN-1234567"
          value={formData.tradeLicenseNo}
          onChangeText={text =>
            setFormData({ ...formData, tradeLicenseNo: text })
          }
          error={errors.tradeLicenseNo}
          icon={SVG_ICONS.fileIcon}
        />

        <CustomInput
          label="VAT TRN"
          placeholder="15-digit TRN"
          value={formData.vatTrn}
          onChangeText={text => setFormData({ ...formData, vatTrn: text })}
          error={errors.vatTrn}
          keyboardType="numeric"
          maxLength={15}
          icon={SVG_ICONS.fileIcon}
        />

        <CustomInput
          label="Office Phone"
          placeholder="+971 4 000 0000"
          value={formData.officePhone}
          onChangeText={text => setFormData({ ...formData, officePhone: text })}
          error={errors.officePhone}
          keyboardType="phone-pad"
          icon={SVG_ICONS.phoneIcon}
        />

        <View style={styles.addressHeader}>
          <Text style={styles.inputLabel}>Registered Addresses</Text>
          <TouchableOpacity onPress={handleAddAddress}>
            <Text style={styles.addButton}>+ Add Address</Text>
          </TouchableOpacity>
        </View>

        {formData.registeredAddresses.map((addr, index) => (
          <View key={addr.id} style={styles.card}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text
                style={[styles.inputLabel, { fontSize: 12, color: '#667085' }]}
              >
                Address #{index + 1}
              </Text>
              {index > 0 && (
                <TouchableOpacity onPress={() => removeAddress(addr.id)}>
                  <Icon xml={SVG_ICONS.deleteIcon} color="#F04438" size={18} />
                </TouchableOpacity>
              )}
            </View>

            <CustomInput
              label="Address Label"
              placeholder="e.g. Warehouse or Branch"
              value={addr.label}
              onChangeText={text => updateAddress(addr.id, 'label', text)}
            />
            <CustomInput
              label="Full Address Details"
              placeholder="Building, Street, Area..."
              value={addr.fullAddress}
              onChangeText={text => updateAddress(addr.id, 'fullAddress', text)}
              error={errors.address}
            />
          </View>
        ))}
      </RegistrationLayout>
    </KeyboardAvoidingView>
  );
};