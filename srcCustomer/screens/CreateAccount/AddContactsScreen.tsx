import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { registrationStyles } from './styles';
import { DropdownOption } from '../../components/DropDown';
import { useToast } from '../../components/ToastContext';
import { registerContactInfo } from '../../api/auth/authApi';
import { COUNTRY_CODES } from '../../utilities/Strings';
import { SVG_ICONS } from '../../assets/icons/svg';
import RegistrationLayout from './components/RegistrationLayout';
import CustomInput from './components/CustomInput';
import CustomPicker from './components/CustomPicker';
import Dropdown from '../../components/DropDown';

const ROLE_OPTIONS: DropdownOption[] = [
  { id: 'Owner', name: 'Owner' },
  { id: 'Partner', name: 'Partner' },
  { id: 'Director', name: 'Director' },
  { id: 'Manager', name: 'Manager' },
];

export const AddContactsScreen = ({ route }: any) => {
  const { params } = route;
  const { showToast } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const styles = registrationStyles;

  const countryOptions = COUNTRY_CODES.map(country => ({
    id: country.code,
    name: `${country.flag} +${country.code}`,
  }));

  const [contacts, setContacts] = useState<any[]>([
    {
      id: '1',
      fullName: '',
      designation: '',
      ph_cc: '971',
      mobileNumber: '',
      whatsapp_cc: '971',
      whatsappNumber: '',
      emailAddress: '',
    },
  ]);

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

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
    setContacts(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        id: Date.now().toString(),
        fullName: '',
        designation: '',
        ph_cc: '971',
        mobileNumber: '',
        whatsapp_cc: '971',
        whatsappNumber: '',
        emailAddress: '',
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);

    // Concatenate country code with phone numbers for API
    const apiContacts = contacts.map(c => {
      const cleanPhone = c.mobileNumber.replace(/\s/g, '');
      const cleanWhatsapp = c.whatsappNumber.replace(/\s/g, '');

      return {
        full_name: c.fullName,
        designation: c.designation,
        // Combining CC and Number into one string
        phone_number: cleanPhone ? `+${c.ph_cc}${cleanPhone}` : '',
        whatsapp_number: cleanWhatsapp
          ? `+${c.whatsapp_cc}${cleanWhatsapp}`
          : '',
        email: c.emailAddress,
      };
    });

    const payload = {
      secret_token: params?.secret_token,
      phone_number: params?.phone_number,
      contacts: apiContacts,
    };

    try {
      await registerContactInfo(payload);
      showToast('Contacts registered successfully', 'success');
      navigation.navigate('KycUploads', {
        secret_token: params?.secret_token,
        phone_number: params?.phone_number,
      });
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Failed to save contacts',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1222' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <RegistrationLayout
          currentStep={2}
          onContinue={handleSubmit}
          onCancel={() => navigation.goBack()}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View style={styles.addressHeader}>
              <View>
                <Text style={styles.title}>Additional Contacts</Text>
                <Text style={styles.subtitle}>
                  Add key stakeholders for this account.
                </Text>
              </View>
              <TouchableOpacity onPress={addContact}>
                <Text style={styles.addButton}>+ Add Contact</Text>
              </TouchableOpacity>
            </View>

            {contacts.map((contact, idx) => (
              <View key={contact.id} style={styles.card}>
                <Text style={styles.cardTitle}>Contact #{idx + 1}</Text>

                <CustomInput
                  label="Full Name"
                  placeholder="e.g. Jane Doe"
                  value={contact.fullName}
                  onChangeText={text =>
                    updateContact(contact.id, 'fullName', text)
                  }
                  error={errors[`${idx}_name`]}
                />

                <CustomPicker
                  label="Designation / Role"
                  value={contact.designation}
                  options={ROLE_OPTIONS}
                  onChange={selected =>
                    updateContact(contact.id, 'designation', selected.id)
                  }
                  error={errors[`${idx}_designation`]}
                />

                {/* Mobile Number with Country Selector */}
                <Text style={localStyles.label}>Mobile Number</Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors[`${idx}_mobile`] && { borderColor: '#EF4444' },
                    { marginBottom: 20 },
                  ]}
                >
                  <Dropdown
                    options={countryOptions}
                    value={contact.ph_cc}
                    onChange={selected =>
                      updateContact(contact.id, 'ph_cc', selected.id)
                    }
                    rightIcon={SVG_ICONS.arrowDown}
                    dropDownStyles={localStyles.countryDropDown}
                    optionStyles={{ color: 'white' }}
                    placeholder="Code"
                  />
                  <TextInput
                    style={localStyles.textInput}
                    placeholder="50 123 4567"
                    placeholderTextColor="#475569"
                    value={contact.mobileNumber}
                    onChangeText={text =>
                      updateContact(contact.id, 'mobileNumber', text)
                    }
                    keyboardType="phone-pad"
                  />
                </View>

                {/* WhatsApp Number with Country Selector */}
                <Text style={localStyles.label}>WhatsApp Number</Text>
                <View style={[styles.inputContainer, { marginBottom: 20 }]}>
                  <Dropdown
                    options={countryOptions}
                    value={contact.whatsapp_cc}
                    onChange={selected =>
                      updateContact(contact.id, 'whatsapp_cc', selected.id)
                    }
                    rightIcon={SVG_ICONS.arrowDown}
                    dropDownStyles={localStyles.countryDropDown}
                    optionStyles={{ color: 'white' }}
                    placeholder="Code"
                  />
                  <TextInput
                    style={localStyles.textInput}
                    placeholder="50 123 4567"
                    placeholderTextColor="#475569"
                    value={contact.whatsappNumber}
                    onChangeText={text =>
                      updateContact(contact.id, 'whatsappNumber', text)
                    }
                    keyboardType="phone-pad"
                  />
                </View>

                <CustomInput
                  label="Email Address"
                  placeholder="email@company.com"
                  value={contact.emailAddress}
                  onChangeText={text =>
                    updateContact(contact.id, 'emailAddress', text)
                  }
                  error={errors[`${idx}_email`]}
                  keyboardType="email-address"
                />
              </View>
            ))}
          </ScrollView>
        </RegistrationLayout>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  label: {
    color: '#CBD5E1',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  countryDropDown: {
    width: 100,
    borderRightWidth: 1,
    borderRightColor: '#334155',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    height: '100%',
  },
  textInput: {
    flex: 1, 
    height: 50, 
    color: '#FFFFFF', 
    fontSize: 15,
    paddingHorizontal: 15, 
    fontFamily: 'System',
    textAlignVertical: 'center',
  },
  
});
