import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { makeStyles } from './styles';
import { DropdownOption } from '../../components/DropDown';
import { useToast } from '../../components/ToastContext';
import { registerContactInfo, fetchSavedRegistrationData } from '../../api/auth/authApi';
import { COUNTRY_CODES } from '../../utilities/Strings';
import { SVG_ICONS } from '../../assets/icons/svg';
import RegistrationLayout from './components/RegistrationLayout';
import CustomInput from './components/CustomInput';
import CustomPicker from './components/CustomPicker';
import Dropdown from '../../components/DropDown';
import { useTheme } from '../../../ThemeContext';
import Icon from '../../../Icon';
import { getApiErrorMessage } from '../../utilities/apiErrorMessage';

const ROLE_OPTIONS: DropdownOption[] = [
  { id: 'Manager', name: 'Manager' },
  { id: 'Procurement', name: 'Procurement' },
  { id: 'Finance', name: 'Finance' },
  { id: 'Catering', name: 'Catering' },
];

const stripCountryCode = (phone: string, cc: string) =>
  phone ? phone.replace(new RegExp(`^\\+?${cc}`), '').trim() : '';

export const AddContactsScreen = ({ route }: any) => {
  const { params } = route;
  const { showToast } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const themedLocalStyles = makeLocalStyles(colors);

  const isRejectedFlow: boolean = params?.isRejected || false;

  const countryOptions = COUNTRY_CODES.map(country => ({
    id: country.code,
    name: `${country.flag} +${country.code}`,
  }));

  const [contacts, setContacts] = useState<any[]>([]);
  const [initialContacts, setInitialContacts] = useState<string>(''); 
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [rejectedSteps, setRejectedSteps] = useState<number[]>([]);
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, string>>({});

  // Logic: If step 2 is in rejectedSteps, allow full editing
  const isContactEditable = (): boolean => {
    if (!isRejectedFlow) return true;
    return rejectedSteps.includes(2);
  };

  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    setFetchingData(true);
    try {
      if (params?.user_id) {
        const response = await fetchSavedRegistrationData(params.user_id);
        const data = response?.results?.data;

        if (data) {
          if (data.rejected_steps?.length) setRejectedSteps(data.rejected_steps);

          if (data.contacts?.length > 0) {
            const prefilled = data.contacts.map((c: any) => ({
              id: c.id?.toString(),
              fullName: c.full_name || '',
              designation: c.designation || '',
              ph_cc: '971',
              mobileNumber: stripCountryCode(c.phone_number, '971'),
              whatsapp_cc: '971',
              whatsappNumber: stripCountryCode(c.whatsapp_number, '971'),
              emailAddress: c.email || '',
              isNew: false // Existing contact from DB
            }));
            setContacts(prefilled);
            setInitialContacts(JSON.stringify(prefilled));
            return;
          }
        }
      }
    } catch (e) {
      // console.log("Error loading saved contacts", e);
    } finally {
      setFetchingData(false);
    }

    const defaultContact = [{
      id: 'temp-1',
      fullName: '',
      designation: '',
      ph_cc: '971',
      mobileNumber: '',
      whatsapp_cc: '971',
      whatsappNumber: '',
      emailAddress: '',
      isNew: true
    }];
    setContacts(defaultContact);
    setInitialContacts(JSON.stringify(defaultContact));
  };

  const validate = (): boolean => {
    const newErrors: any = {};
    contacts.forEach((contact, idx) => {
      if (!contact.fullName.trim()) newErrors[`${idx}_name`] = 'Required';
      if (!contact.designation) newErrors[`${idx}_designation`] = 'Required';
      if (!contact.mobileNumber.trim()) newErrors[`${idx}_mobile`] = 'Required';
      if (!contact.emailAddress.trim()) {
        newErrors[`${idx}_email`] = 'Required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.emailAddress)) {
        newErrors[`${idx}_email`] = 'Invalid email';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateContact = (id: string, field: string, value: any) => {
    setContacts(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addContact = () => {
    setContacts(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        fullName: '',
        designation: '',
        ph_cc: '971',
        mobileNumber: '',
        whatsapp_cc: '971',
        whatsappNumber: '',
        emailAddress: '',
        isNew: true
      },
    ]);
  };

  const navigateNext = () => {
    navigation.navigate('KycUploads', {
      secret_token: params?.secret_token,
      phone_number: params?.phone_number,
      user_id: params.user_id,
      isRejected: isRejectedFlow,
    });
  };

  const handleSubmit = async () => {
    if (!isContactEditable()) {
      navigateNext();
      return;
    }

    if (!validate()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (initialContacts === JSON.stringify(contacts)) {
      navigateNext();
      return;
    }

    setLoading(true);

    const apiContacts = contacts.map(c => {
      const contactObj: any = {
        full_name: c.fullName,
        designation: c.designation,
        phone_number: c.mobileNumber ? `+${c.ph_cc}${c.mobileNumber.replace(/\s/g, '')}` : '',
        whatsapp_number: c.whatsappNumber ? `+${c.whatsapp_cc}${c.whatsappNumber.replace(/\s/g, '')}` : '',
        email: c.emailAddress,
      };

      // Only pass ID if it's an existing contact (not temp- or isNew)
      if (!c.isNew) {
        contactObj.id = c.id;
      }

      return contactObj;
    });

    const payload = {
      secret_token: params?.secret_token,
      user_id: params.user_id,
      phone_number: params?.phone_number,
      contacts: apiContacts,
    };

    try {
      await registerContactInfo(payload);
      showToast('Contacts saved successfully', 'success');
      navigateNext();
    } catch (error: any) {
      showToast(getApiErrorMessage(error, 'Failed to save contacts'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.subtitle, { marginTop: 12 }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const contactEditable = isContactEditable();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <RegistrationLayout
          currentStep={2}
          onContinue={handleSubmit}
          onCancel={() => navigation.goBack()}
          isLoading={loading}
          rejectedSteps={rejectedSteps}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.addressHeader}>
              <View>
                <Text style={styles.title}>Additional Contacts</Text>
                <Text style={styles.subtitle}>Add key stakeholders for this account.</Text>
              </View>
              {contactEditable && (
                <TouchableOpacity onPress={addContact}>
                  <Text style={styles.addButton}>+ Add Contact</Text>
                </TouchableOpacity>
              )}
            </View>

            {isRejectedFlow && rejectedSteps.includes(2) && (
              <View style={styles.rejectionBanner}>
                <Text style={styles.rejectionBannerText}>
                  ⚠ Step rejected. Please update the contact information.
                </Text>
              </View>
            )}

            {contacts.map((contact, idx) => (
              <View key={contact.id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.cardTitle}>Contact #{idx + 1}</Text>
                  {isRejectedFlow && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: contactEditable
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(74,222,128,0.15)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: contactEditable ? '#EF4444' : '#4ADE80' },
                        ]}
                      >
                        {contactEditable ? 'Rejected' : 'Pending'}
                      </Text>
                    </View>
                  )}
                  {idx > 0 && contactEditable && (
                    <TouchableOpacity
                      onPress={() =>
                        setContacts(p => p.filter(c => c.id !== contact.id))
                      }
                    >
                      <Icon xml={SVG_ICONS.deleteIcon} color="#F04438" size={18} />
                    </TouchableOpacity>
                  )}
                </View>

                <CustomInput
                  label="Full Name"
                  placeholder="e.g. Jane Doe"
                  value={contact.fullName}
                  onChangeText={text => updateContact(contact.id, 'fullName', text)}
                  error={errors[`${idx}_name`]}
                  disabled={!contactEditable}
                />

                <CustomPicker
                  label="Designation / Role"
                  value={contact.designation}
                  options={ROLE_OPTIONS}
                  onChange={selected => updateContact(contact.id, 'designation', selected.id)}
                  error={errors[`${idx}_designation`]}
                  disabled={!contactEditable}
                />

                <Text style={themedLocalStyles.label}>Mobile Number</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors[`${idx}_mobile`] && { borderColor: '#EF4444' },
                    { marginBottom: 20 },
                    !contactEditable && {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      opacity: 0.7,
                    },
                  ]}
                >
                  <Dropdown
                    options={countryOptions}
                    value={contact.ph_cc}
                    onChange={contactEditable ? selected => updateContact(contact.id, 'ph_cc', selected.id) : () => {}}
                    rightIcon={contactEditable ? SVG_ICONS.arrowDown : undefined}
                    dropDownStyles={themedLocalStyles.countryDropDown}
                    optionStyles={{ color: colors.text }}
                    placeholder="Code"
                    disabled={!contactEditable}
                  />
                  <TextInput
                    style={themedLocalStyles.textInput}
                    placeholder="50 123 4567"
                    placeholderTextColor={colors.textMuted}
                    value={contact.mobileNumber}
                    onChangeText={text => updateContact(contact.id, 'mobileNumber', text)}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={contactEditable}
                  />
                </View>

                <Text style={themedLocalStyles.label}>WhatsApp Number</Text>
                <View
                  style={[
                    styles.inputContainer,
                    { marginBottom: 20 },
                    !contactEditable && {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      opacity: 0.7,
                    },
                  ]}
                >
                  <Dropdown
                    options={countryOptions}
                    value={contact.whatsapp_cc}
                    onChange={contactEditable ? selected => updateContact(contact.id, 'whatsapp_cc', selected.id) : () => {}}
                    rightIcon={contactEditable ? SVG_ICONS.arrowDown : undefined}
                    dropDownStyles={themedLocalStyles.countryDropDown}
                    optionStyles={{ color: colors.text }}
                    placeholder="Code"
                    disabled={!contactEditable}
                  />
                  <TextInput
                    style={themedLocalStyles.textInput}
                    placeholder="50 123 4567"
                    placeholderTextColor={colors.textMuted}
                    value={contact.whatsappNumber}
                    onChangeText={text => updateContact(contact.id, 'whatsappNumber', text)}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={contactEditable}
                  />
                </View>

                <CustomInput
                  label="Email Address"
                  placeholder="email@company.com"
                  value={contact.emailAddress}
                  onChangeText={text => updateContact(contact.id, 'emailAddress', text)}
                  error={errors[`${idx}_email`]}
                  keyboardType="email-address"
                  disabled={!contactEditable}
                />
              </View>
            ))}
          </ScrollView>
        </RegistrationLayout>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const makeLocalStyles = (colors: any) =>
  StyleSheet.create({
    label: {
      color: colors.textMuted,
      fontSize: 14,
      marginBottom: 8,
      marginTop: 12,
    },
    countryDropDown: {
      width: 100,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      height: '100%',
    },
    textInput: {
      flex: 1,
      height: 50,
      color: colors.text,
      fontSize: 15,
      paddingHorizontal: 15,
      fontFamily: 'System',
      textAlignVertical: 'center',
    },
  });

export default AddContactsScreen;