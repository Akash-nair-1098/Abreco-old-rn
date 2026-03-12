import React, { useState } from 'react';
import { Text } from 'react-native';
import { registrationStyles } from './styles';
import CustomInput from './components/CustomInput';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RegistrationLayout from './components/RegistrationLayout';
import { useToast } from '../../components/ToastContext';
import { BankDetails } from './types';
import { BankInfoPayload } from '../../api/auth/auth.type';
import { registerBankDetails } from '../../api/auth/authApi';

export const FinancialInfoScreen = ({route}:any) => {
         const { params } = route;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const styles = registrationStyles;
  const { showToast } = useToast();

  // Retrieve tokens from previous steps
const secretToken =
  params.secret_token ||
  'f5bae64b6534144bb874c49cce0af9dbbb86f17dec71ca3ef370cf2c114a88a5';

const phoneNumber = params.phone_number || '1233405554';

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    ibanNumber: '',
    beneficiaryName: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: any = {};
    if (!bankDetails.bankName.trim()) newErrors.bankName = 'Required';

    // Simple check for existence; the regex you have is specifically for UAE
    if (!bankDetails.ibanNumber.trim()) {
      newErrors.ibanNumber = 'Required';
    } 
    // else if (!/^AE\d{21}$/.test(bankDetails.ibanNumber.replace(/\s/g, ''))) {
    //   // UAE IBANs are 23 chars (AE + 21 digits)
    //   newErrors.ibanNumber = 'Invalid UAE IBAN format';
    // }

    if (!bankDetails.beneficiaryName.trim())
      newErrors.beneficiaryName = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('sub,it called');
    
    if (!validate()) {
      showToast('Please check the highlighted fields', 'error');
      return;
    }

    setLoading(true);

    const payload: BankInfoPayload = {
      secret_token: secretToken,
      phone_number: phoneNumber,
      bank_name: bankDetails.bankName,
      iban_number: bankDetails.ibanNumber.replace(/\s/g, ''), // Clean spaces for API
      beneficiary_name: bankDetails.beneficiaryName,
    };

    console.log('details id', payload);
    
    try {
      await registerBankDetails(payload);
      showToast('Bank details saved successfully', 'success');

      // Pass the tokens to the final review screen
      navigation.navigate('ReviewScreen', {
        secret_token: secretToken,
        phone_number: phoneNumber,
      });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || 'Failed to save bank details';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationLayout
      currentStep={4}
      onContinue={handleSubmit}
      onCancel={() => navigation.goBack()}
    //   isLoading={loading}
    >
      <Text style={styles.title}>Bank Details</Text>
      <Text style={styles.subtitle}>
        Provide bank details for refunds and financial transactions.
      </Text>

      <CustomInput
        label="Bank Name"
        placeholder="e.g. Emirates NBD"
        value={bankDetails.bankName}
        onChangeText={text =>
          setBankDetails({ ...bankDetails, bankName: text })
        }
        error={errors.bankName}
        icon="🏦"
      />

      <CustomInput
        label="IBAN Number"
        placeholder="AE00 0000 0000 0000 0000 000"
        value={bankDetails.ibanNumber}
        onChangeText={text =>
          setBankDetails({ ...bankDetails, ibanNumber: text })
        }
        error={errors.ibanNumber}
        icon="💳"
        // autoCapitalize="characters"
      />

      <CustomInput
        label="Beneficiary Name"
        placeholder="Same as Trade License Name"
        value={bankDetails.beneficiaryName}
        onChangeText={text =>
          setBankDetails({ ...bankDetails, beneficiaryName: text })
        }
        error={errors.beneficiaryName}
        icon="👤"
      />
    </RegistrationLayout>
  );
};
