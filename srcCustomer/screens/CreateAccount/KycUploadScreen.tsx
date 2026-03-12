import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import DocumentPicker, {
//   DocumentPickerResponse,
// } from 'react-native-document-picker';
import { registrationStyles } from './styles';
import { DocumentStatus } from './types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RegistrationLayout from './components/RegistrationLayout';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useToast } from '../../components/ToastContext';
import { registerKYCDocuments } from '../../api/auth/authApi';

export const KYCUploadsScreen = ({route}:any) => {
        const { params } = route;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const styles = registrationStyles;
  const { showToast } = useToast();

  // Get data from previous steps via params
const secretToken = params.secret_token || "f5bae64b6534144bb874c49cce0af9dbbb86f17dec71ca3ef370cf2c114a88a5"

  const phoneNumber = params.phone_number || '1233405554'

  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([
    {
      id: '1',
      name: 'Trade License Copy',
      type: 'trade_license',
      status: 'pending',
      file: null as DocumentPickerResponse | null,
    },
    {
      id: '2',
      name: 'VAT Certificate',
      type: 'vat_certificate',
      status: 'pending',
      file: null as DocumentPickerResponse | null,
    },
    {
      id: '3',
      name: 'Passport Copy (Owner)',
      type: 'passport_owner',
      status: 'pending',
      file: null as DocumentPickerResponse | null,
    },
  ]);

  const handleDocumentPick = async (docId: string) => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });

      setDocuments(docs =>
        docs.map(d =>
          d.id === docId
            ? { ...d, file: res, status: 'uploaded' as DocumentStatus }
            : d,
        ),
      );
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        showToast('Error selecting document', 'error');
      }
    }
  };

  const handleSubmit = async () => {
    // const uploadedDocs = documents.filter(d => d.file !== null);

    // if (uploadedDocs.length < 1) {
    //   showToast('Please upload at least one document', 'error');
    //   return;
    // }

    // setLoading(true);
    // const formData = new FormData();

    // // Required Fields
    // formData.append('secret_token', secretToken);
    // formData.append('phone_number', phoneNumber);

    // // Map documents to the required indexed array format:
    // // other_documents[index][document_name]
    // uploadedDocs.forEach((doc, index) => {
    //   formData.append(`other_documents[${index}][document_name]`, doc.name);
    //   formData.append(`other_documents[${index}][file]`, {
    //     uri: doc.file.uri,
    //     type: doc.file.type,
    //     name: doc.file.name,
    //   } as any);
    // });

    try {
    //   await registerKYCDocuments(formData);
    //   showToast('Documents uploaded successfully', 'success');
      navigation.navigate('FinancialInfo', {
        secret_token: params.secret_token,
        phone_number: params.phone_number,
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Upload failed';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProgressStep = (status: DocumentStatus) => {
    if (status === 'pending') return 0;
    if (status === 'uploaded') return 1;
    if (status === 'review') return 2;
    if (status === 'approved') return 3;
    if (status === 'revoked') return 2;
    return 0;
  };

  return (
    <RegistrationLayout
      currentStep={3}
      onContinue={handleSubmit}
      onCancel={() => navigation.goBack()}
    >
      <Text style={styles.title}>Document Upload</Text>
      <Text style={styles.subtitle}>
        Upload clear copies of your valid trade license and VAT certificate.
      </Text>

      {documents.map(doc => {
        const step = getProgressStep(doc.status);
        const hasFile = !!doc.file;

        return (
          <View
            key={doc.id}
            style={[
              styles.docCard,
              doc.status === 'revoked' && styles.docCardError,
            ]}
          >
            <View style={styles.docHeader}>
              <View style={styles.docIconBox}>
                <Icon xml={SVG_ICONS.fileIcon} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={[styles.docStatus, getStatusStyle(doc.status)]}>
                  {hasFile ? doc.file.name : 'Not Uploaded'}
                </Text>
              </View>
            </View>

            {/* Progress Stepper Visual */}
            <View style={styles.progressBar}>
              {['Uploaded', 'Review', 'Approved'].map((label, i) => (
                <React.Fragment key={label}>
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        step >= i + 1 && styles.progressDotActive,
                      ]}
                    >
                      <Text style={styles.progressNum}>
                        {step >= i + 1 ? '✓' : i + 1}
                      </Text>
                    </View>
                    <Text style={styles.progressLabel}>{label}</Text>
                  </View>
                  {i < 2 && <View style={styles.progressLine} />}
                </React.Fragment>
              ))}
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={hasFile ? styles.reuploadButton : styles.uploadButton}
              onPress={() => handleDocumentPick(doc.id)}
            >
              <Icon
                xml={SVG_ICONS.cloudUpload}
                size={20}
                color={hasFile ? '#FCA5A5' : '#9CA3AF'}
              />
              <Text style={hasFile ? styles.reuploadText : styles.uploadText}>
                {hasFile ? 'Change Document' : 'Click to upload'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </RegistrationLayout>
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'uploaded':
      return { color: '#4CAF50' };
    case 'review':
      return { color: '#3B82F6' };
    case 'revoked':
      return { color: '#EF4444' };
    default:
      return { color: '#6B7280' };
  }
};
