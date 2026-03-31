import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';

import { makeStyles } from './styles';
import CustomInput from './components/CustomInput';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RegistrationLayout from './components/RegistrationLayout';
import { useToast } from '../../components/ToastContext';
import { BankDetails } from './types';
import { BankInfoPayload } from '../../api/auth/auth.type';
import { registerBankDetails, fetchSavedRegistrationData } from '../../api/auth/authApi';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useTheme } from '../../../ThemeContext';

export const FinancialInfoScreen = ({ route }: any) => {
  const { params } = route;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { showToast } = useToast();

  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const themedLocalStyles = makeLocalStyles(colors);

  const isRejectedFlow: boolean = params?.isRejected || false;

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    ibanNumber: '',
    beneficiaryName: '',
  });

  // Track initial state for change detection
  const [initialBankDetails, setInitialBankDetails] = useState<string>('');
  
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [rejectedSteps, setRejectedSteps] = useState<number[]>([]);
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState();

  const isBankEditable = (): boolean => {
    if (!isRejectedFlow) return true;
    return fieldStatuses?.bank_status?.toLowerCase() === 'rejected';
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

        setApplicationId(data?.application_id);
        if (data) {
          const statuses =
            data.addresses?.[0]?.statuses ||
            data.contacts?.[0]?.statuses ||
            data.business_documents?.[0]?.statuses ||
            {};
          setFieldStatuses(statuses);
          if (data.rejected_steps?.length) setRejectedSteps(data.rejected_steps);

          if (data.bank_details) {
            const bd = data.bank_details;
            const prefilled = {
              bankName: bd.bank_name || '',
              ibanNumber: bd.iban_number ? formatIBAN(bd.iban_number) : '',
              beneficiaryName: bd.beneficiary_name || '',
            };
            setBankDetails(prefilled);
            setInitialBankDetails(JSON.stringify(prefilled));
          } else {
            setInitialBankDetails(JSON.stringify(bankDetails));
          }
        }
      }
    } catch {
      setInitialBankDetails(JSON.stringify(bankDetails));
    } finally {
      setFetchingData(false);
    }
  };

  const formatIBAN = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').toUpperCase();
    if (!cleaned.length) return '';
    const parts = cleaned.match(/.{1,4}/g);
    return parts ? parts.join(' ') : cleaned;
  };

  const validate = (): boolean => {
    const newErrors: any = {};
    const hasBank = bankDetails.bankName.trim();
    const hasIban = bankDetails.ibanNumber.trim();
    const hasBeneficiary = bankDetails.beneficiaryName.trim();

    if (!hasBank && !hasIban && !hasBeneficiary) return true;

    if (!hasBank) newErrors.bankName = 'Bank Name is required';

    const cleanIBAN = bankDetails.ibanNumber.replace(/\s/g, '');
    if (!hasIban) {
      newErrors.ibanNumber = 'IBAN is required';
    } else if (cleanIBAN.length < 23) {
      newErrors.ibanNumber = 'Invalid UAE IBAN format (23 characters required)';
    }

    if (!hasBeneficiary) newErrors.beneficiaryName = 'Beneficiary Name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigateNext = () => {
    navigation.navigate('ReviewScreen', {
      secret_token: params?.secret_token,
      phone_number: params?.phone_number,
      user_id: params?.user_id,
      isRejected: isRejectedFlow,
      applicationId: applicationId,
    });
  };

  const handleSubmit = async () => {
    if (!isBankEditable()) {
      navigateNext();
      return;
    }

    if (!validate()) return;

    // Check if data has changed
    if (initialBankDetails === JSON.stringify(bankDetails)) {
      navigateNext();
      return;
    }

    const isFormEmpty =
      !bankDetails.bankName.trim() &&
      !bankDetails.ibanNumber.trim() &&
      !bankDetails.beneficiaryName.trim();

    if (isFormEmpty) {
      navigateNext();
      return;
    }

    setLoading(true);

    const payload: BankInfoPayload = {
      secret_token: params?.secret_token || '',
      user_id: params?.user_id || '',
      phone_number: params?.phone_number || '',
      bank_name: bankDetails.bankName,
      iban_number: bankDetails.ibanNumber.replace(/\s/g, ''),
      beneficiary_name: bankDetails.beneficiaryName,
    };

    try {
      await registerBankDetails(payload);
      showToast('Bank details saved successfully', 'success');
      navigateNext();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save bank details', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <RegistrationLayout
        currentStep={4}
        onContinue={() => {}}
        onCancel={() => navigation.goBack()}
        continueText="Continue/Skip"
        isLoading={true}
        rejectedSteps={[]}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.subtitle, { marginTop: 12 }]}>Loading...</Text>
        </View>
      </RegistrationLayout>
    );
  }

  const bankEditable = isBankEditable();

  return (
    <RegistrationLayout
      currentStep={4}
      onContinue={handleSubmit}
      onCancel={() => navigation.goBack()}
      continueText="Continue/Skip"
      isLoading={loading}
      rejectedSteps={rejectedSteps}
    >
      <Text style={styles.title}>Bank Details</Text>
      <Text style={styles.subtitle}>
        Provide bank details for refunds and financial transactions. (Optional)
      </Text>

      {isRejectedFlow && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: bankEditable ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: bankEditable ? '#EF4444' : '#4ADE80',
              }}
            >
              Bank Status: {fieldStatuses?.bank_status || 'Pending'}
            </Text>
          </View>
        </View>
      )}

      <View style={themedLocalStyles.inputGroup}>
        <CustomInput
          label="Bank Name"
          placeholder="e.g. Emirates NBD"
          value={bankDetails.bankName}
          onChangeText={text => {
            setBankDetails(p => ({ ...p, bankName: text }));
            if (errors.bankName) setErrors((e: any) => ({ ...e, bankName: null }));
          }}
          error={errors.bankName}
          icon={SVG_ICONS.branchIcon}
          disabled={!bankEditable}
        />
      </View>

      <View style={themedLocalStyles.inputGroup}>
        <CustomInput
          label="IBAN Number"
          placeholder="AE00 0000 0000 0000 0000 000"
          value={bankDetails.ibanNumber}
          onChangeText={text => {
            setBankDetails(p => ({ ...p, ibanNumber: formatIBAN(text) }));
            if (errors.ibanNumber) setErrors((e: any) => ({ ...e, ibanNumber: null }));
          }}
          error={errors.ibanNumber}
          icon={SVG_ICONS.card}
          maxLength={28}
          disabled={!bankEditable}
        />
      </View>

      <View style={themedLocalStyles.inputGroup}>
        <CustomInput
          label="Beneficiary Name"
          placeholder="Same as Trade License Name"
          value={bankDetails.beneficiaryName}
          onChangeText={text => {
            setBankDetails(p => ({ ...p, beneficiaryName: text }));
            if (errors.beneficiaryName) setErrors((e: any) => ({ ...e, beneficiaryName: null }));
          }}
          error={errors.beneficiaryName}
          icon={SVG_ICONS.userIcon}
          disabled={!bankEditable}
        />
      </View>
    </RegistrationLayout>
  );
};

const makeLocalStyles = (colors: any) =>
  StyleSheet.create({
    inputGroup: { marginBottom: 20 },
  });