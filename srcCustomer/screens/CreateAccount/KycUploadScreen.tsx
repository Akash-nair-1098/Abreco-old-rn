import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import DocumentPicker, { types } from 'react-native-document-picker';
import FileViewer from 'react-native-file-viewer'; // To open/preview files
import * as RNFS from 'react-native-fs'; // To handle file paths for preview
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import RegistrationLayout from './components/RegistrationLayout';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useToast } from '../../components/ToastContext';
import { registerKYCDocuments, fetchSavedRegistrationData } from '../../api/auth/authApi';
import { useTheme } from '../../../ThemeContext';
import { getApiErrorMessage } from '../../utilities/apiErrorMessage';

export const KYCUploadsScreen = ({ route }: any) => {
  const { params } = route;
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { showToast } = useToast();

  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const isRejectedFlow: boolean = params?.isRejected || false;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [extraDocName, setExtraDocName] = useState('');
  const [rejectedSteps, setRejectedSteps] = useState<number[]>([]);
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, string>>({});

  const [documents, setDocuments] = useState<any[]>([
    { id: 'trade_license', name: 'Trade License Copy', status: 'pending', file: null, existingUrl: null },
    { id: 'vat_certificate', name: 'VAT Certificate', status: 'pending', file: null, existingUrl: null },
    { id: 'passport', name: 'Passport Copy (Owner)', status: 'pending', file: null, existingUrl: null },
  ]);

  const [otherDocs, setOtherDocs] = useState<any[]>([]);
  const [initialStateSnapshot, setInitialStateSnapshot] = useState<string>('');

  // If Step 3 is rejected, we make all document fields editable
  const isDocEditable = (): boolean => {
    if (!isRejectedFlow) return true;
    return rejectedSteps.includes(3);
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

          let currentDocs = [...documents];
          if (data.business_documents?.length > 0) {
            const bizDoc = data.business_documents[0];
            currentDocs = [
              {
                id: 'trade_license',
                name: 'Trade License Copy',
                status: bizDoc.trade_licence_status?.toLowerCase() === 'uploaded' ? 'uploaded' : 'pending',
                file: null,
                existingUrl: bizDoc.trade_license || null,
                docStatus: bizDoc.trade_licence_status || 'Pending',
                rejectReason: bizDoc.trade_licence_reject_reason || null,
              },
              {
                id: 'vat_certificate',
                name: 'VAT Certificate',
                status: bizDoc.vat_certificate_status?.toLowerCase() === 'uploaded' ? 'uploaded' : 'pending',
                file: null,
                existingUrl: bizDoc.vat_certificate || null,
                docStatus: bizDoc.vat_certificate_status || 'Pending',
                rejectReason: bizDoc.vat_certificate_reject_reason || null,
              },
              {
                id: 'passport',
                name: 'Passport Copy (Owner)',
                status: bizDoc.passport_status?.toLowerCase() === 'uploaded' ? 'uploaded' : 'pending',
                file: null,
                existingUrl: bizDoc.passport || null,
                docStatus: bizDoc.passport_status || 'Pending',
                rejectReason: bizDoc.passport_reject_reason || null,
              },
            ];
            setDocuments(currentDocs);
          }

          let currentOther = [];
          if (data.other_documents?.length > 0) {
            currentOther = data.other_documents.map((d: any) => ({
              id: d.id?.toString(),
              name: d.document_name || 'Other Document',
              status: d.document_status?.toLowerCase() === 'uploaded' ? 'uploaded' : 'pending',
              file: null,
              existingUrl: d.document || null,
              docStatus: d.document_status || 'Pending',
              rejectReason: d.reject_reason || null,
            }));
            setOtherDocs(currentOther);
          }
          setInitialStateSnapshot(JSON.stringify({ docs: currentDocs, other: currentOther }));
        }
      }
    } catch {
      setInitialStateSnapshot(JSON.stringify({ docs: documents, other: [] }));
    } finally {
      setFetchingData(false);
    }
  };

  const handleDocumentPick = async (id: string, isOther: boolean = false) => {
    try {
      const res = await DocumentPicker.pickSingle({ type: [types.pdf, types.images] });
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (res.size && res.size > MAX_FILE_SIZE) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      const updateFn = (prev: any[]) =>
        prev.map(d => (d.id === id ? { ...d, file: res, status: 'uploaded' } : d));

      if (isOther) setOtherDocs(updateFn);
      else setDocuments(updateFn);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) showToast('Selection error', 'error');
    }
  };

  const extFromFile = (file: any) => {
    const name: string = file?.name || '';
    if (name.includes('.')) {
      const ext = name.split('.').pop();
      if (ext && /^[a-zA-Z0-9]+$/.test(ext)) return ext.toLowerCase();
    }
    const mime = (file?.type || '').split(';')[0];
    const map: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/heic': 'heic',
      'image/webp': 'webp',
    };
    return map[mime] || 'bin';
  };

  const handlePreview = async (urlOrFile: any) => {
    try {
      if (typeof urlOrFile === 'string') {
        const s = urlOrFile.trim();
        if (/^https?:\/\//i.test(s)) {
          const ok = await Linking.canOpenURL(s);
          if (ok) await Linking.openURL(s);
          else await FileViewer.open(s, { showOpenWithDialog: true });
          return;
        }
        await FileViewer.open(s, { showOpenWithDialog: true });
        return;
      }

      if (urlOrFile?.uri) {
        const uri = urlOrFile.uri as string;
        const ext = extFromFile(urlOrFile);
        const safeBase = `preview_${Date.now()}`;
        const localPath = `${RNFS.CachesDirectoryPath}/${safeBase}.${ext}`;

        if (Platform.OS === 'android' && uri.startsWith('content://')) {
          const b64 = await RNFS.readFile(uri, 'base64');
          await RNFS.writeFile(localPath, b64, 'base64');
        } else {
          const from = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
          try {
            await RNFS.copyFile(from, localPath);
          } catch {
            const b64 = await RNFS.readFile(uri, 'base64');
            await RNFS.writeFile(localPath, b64, 'base64');
          }
        }

        await FileViewer.open(localPath, {
          showOpenWithDialog: true,
          displayName: urlOrFile.name || `document.${ext}`,
        });
      }
    } catch (e) {
      Alert.alert(
        'Preview Error',
        'Could not open the document. Try opening it from your files app, or install a PDF/image viewer.',
      );
    }
  };

  const addExtraDocument = () => {
    if (!extraDocName.trim()) {
      showToast('Enter document name first', 'error');
      return;
    }
    setOtherDocs(prev => [
      ...prev,
      { 
        id: `extra-${Date.now()}`, 
        name: extraDocName, 
        status: 'pending', 
        file: null, 
        existingUrl: null,
        isNew: true 
      },
    ]);
    setExtraDocName('');
  };

  const removeDoc = (id: string, isOther: boolean) => {
    if (isOther) {
      setOtherDocs(prev => prev.filter(d => d.id !== id));
    } else {
      setDocuments(prev =>
        prev.map(d => (d.id === id ? { ...d, file: null, status: d.existingUrl ? 'uploaded' : 'pending' } : d)),
      );
    }
  };

  const navigateNext = () => {
    navigation.navigate('FinancialInfo', {
      secret_token: params?.secret_token,
      phone_number: params?.phone_number,
      user_id: params?.user_id,
      isRejected: isRejectedFlow,
    });
  };

  const handleSubmit = async () => {
    const currentSnapshot = JSON.stringify({ docs: documents, other: otherDocs });
    const hasNewUploads = [...documents, ...otherDocs].some(d => d.file !== null);
    
    if (!hasNewUploads && currentSnapshot === initialStateSnapshot) {
      navigateNext();
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('secret_token', params?.secret_token || '');
    formData.append('phone_number', params?.phone_number || '');
    formData.append('user_id', params?.user_id || '');

    documents.forEach(doc => {
      if (doc.file) {
        formData.append(doc.id, { 
          uri: doc.file.uri, 
          type: doc.file.type, 
          name: doc.file.name 
        } as any);
      }
    });

    otherDocs.filter(d => d.file).forEach((doc, index) => {
      formData.append(`other_documents[${index}][document_name]`, doc.name);
      formData.append(`other_documents[${index}][document]`, { 
        uri: doc.file.uri, 
        type: doc.file.type, 
        name: doc.file.name 
      } as any);
      // Pass ID if updating existing "other" doc
      if (!doc.isNew) {
        formData.append(`other_documents[${index}][id]`, doc.id);
      }
    });

    try {
      await registerKYCDocuments(formData);
      showToast('KYC Submitted Successfully', 'success');
      navigateNext();
    } catch (error: any) {
      showToast(getApiErrorMessage(error, 'Upload failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderDocCard = (doc: any, isOther: boolean = false) => {
    const hasNewFile = !!doc.file;
    const hasExisting = !!doc.existingUrl;
    const editable = isDocEditable();
    const docStatusLabel = doc.docStatus || '';
    const steps = ['Uploaded', 'Review', 'First Level Approved', 'Approved'];
    
    // Determine stepper progress
    let currentStep = -1;
    if (docStatusLabel.toLowerCase() === 'uploaded') currentStep = 0;
    if (docStatusLabel.toLowerCase() === 'review') currentStep = 1;
    if (docStatusLabel.toLowerCase() === 'approved') currentStep = 3;

    return (
      <View key={doc.id} style={styles.docCard}>
        <View style={styles.docHeader}>
          <View style={styles.docIconBox}>
            <Icon xml={SVG_ICONS.fileIcon} color={colors.text} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.docName}>{doc.name}</Text>
            <Text style={styles.docStatusSub}>
              {hasNewFile ? 'New file selected' : hasExisting ? 'Previously uploaded' : 'Pending Upload'}
            </Text>
          </View>
          {docStatusLabel ? (
            <View style={[styles.statusBadgeInline, { backgroundColor: docStatusLabel.toLowerCase() === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)' }]}>
              <Text style={[styles.statusBadgeInlineText, { color: docStatusLabel.toLowerCase() === 'rejected' ? '#EF4444' : '#4ADE80' }]}>
                {docStatusLabel}
              </Text>
            </View>
          ) : null}
        </View>

        {doc.rejectReason && (
          <View style={styles.rejectReasonBox}>
            <Text style={styles.rejectReasonText}>Reason: {doc.rejectReason}</Text>
          </View>
        )}

        <View style={styles.stepperContainer}>
          {steps.map((label, index) => (
            <React.Fragment key={label}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, currentStep >= index && styles.stepCircleActive]}>
                  {currentStep >= index ? <Text style={styles.stepCheck}>✓</Text> : <Text style={styles.stepNumber}>{index + 1}</Text>}
                </View>
                <Text style={[styles.stepLabel, currentStep >= index && styles.stepLabelActive]}>{label}</Text>
              </View>
              {index < 3 && <View style={[styles.stepLine, currentStep > index && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        {(hasNewFile || hasExisting) ? (
          <View style={styles.filePreviewBar}>
            <Icon xml={SVG_ICONS.fileIcon} size={18} color={colors.textMuted} />
            <Text style={styles.fileName} numberOfLines={1}>
              {hasNewFile ? doc.file.name : doc.existingUrl.split('/').pop()}
            </Text>
            <View style={styles.fileActions}>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => handlePreview(hasNewFile ? doc.file : doc.existingUrl)}
              >
                <Text style={styles.previewText}>Preview</Text>
              </TouchableOpacity>
              {editable && (
                <TouchableOpacity onPress={() => removeDoc(doc.id, isOther)}>
                  <Icon xml={SVG_ICONS.deleteIcon} size={18} color="#F87171" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : !editable ? (
          <View style={[styles.uploadArea, { opacity: 0.4 }]}>
            <Icon xml={SVG_ICONS.cloudUpload} size={30} color={colors.textMuted} />
            <Text style={styles.uploadAreaText}>No upload required</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadArea} onPress={() => handleDocumentPick(doc.id, isOther)}>
            <Icon xml={SVG_ICONS.cloudUpload} size={30} color={colors.textMuted} />
            <Text style={styles.uploadAreaText}>Click to upload</Text>
          </TouchableOpacity>
        )}

        {editable && (hasNewFile || hasExisting) && (
          <TouchableOpacity onPress={() => handleDocumentPick(doc.id, isOther)}>
            <Text style={styles.changeFileText}>{hasNewFile ? 'Change selected file' : 'Re-upload file'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <RegistrationLayout
      currentStep={3}
      onContinue={handleSubmit}
      onCancel={() => navigation.goBack()}
      isLoading={loading}
      rejectedSteps={rejectedSteps}
    >
      <Text style={styles.title}>KYC Documents</Text>
      <Text style={styles.subtitle}>Upload clear copies of your business registration documents.</Text>

      {isRejectedFlow && rejectedSteps.includes(3) && (
        <View style={[styles.rejectionBanner, { marginTop: 10 }]}>
          <Text style={styles.rejectionBannerText}>⚠ Documents were rejected. You can now re-upload any field.</Text>
        </View>
      )}

      {isDocEditable() && (
        <View style={styles.addDocRow}>
          <TextInput
            style={styles.addDocInput}
            placeholder="Add other document (e.g. Power of Attorney)"
            placeholderTextColor={colors.textMuted}
            value={extraDocName}
            onChangeText={setExtraDocName}
          />
          <TouchableOpacity style={styles.addButton} onPress={addExtraDocument}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {documents.map(doc => renderDocCard(doc))}
        {otherDocs.map(doc => renderDocCard(doc, true))}
      </ScrollView>
    </RegistrationLayout>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    title: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    subtitle: { color: colors.textMuted, fontSize: 14, marginBottom: 15 },
    rejectionBanner: { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
    rejectionBannerText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
    addDocRow: { flexDirection: 'row', gap: 10, marginBottom: 20, marginTop: 10 },
    addDocInput: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 15, color: colors.text, borderWidth: 1, borderColor: colors.border, height: 50 },
    addButton: { backgroundColor: colors.text, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
    addButtonText: { color: colors.background, fontWeight: 'bold' },
    docCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: colors.border },
    docHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    docIconBox: { width: 44, height: 44, backgroundColor: colors.border, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    docName: { color: colors.text, fontWeight: 'bold', fontSize: 15 },
    docStatusSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    statusBadgeInline: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusBadgeInlineText: { fontSize: 11, fontWeight: '600' },
    rejectReasonBox: { backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 8, padding: 10, marginBottom: 12 },
    rejectReasonText: { color: '#EF4444', fontSize: 12 },
    stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 5 },
    stepItem: { alignItems: 'center', width: 65 },
    stepCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, zIndex: 2 },
    stepCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    stepCheck: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
    stepNumber: { color: colors.textMuted, fontSize: 12, fontWeight: 'bold' },
    stepLabel: { fontSize: 9, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 11 },
    stepLabelActive: { color: colors.text },
    stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: -20, marginTop: -18, zIndex: 1 },
    stepLineActive: { backgroundColor: colors.primary },
    uploadArea: { borderStyle: 'dashed', borderWidth: 2, borderColor: colors.border, borderRadius: 12, paddingVertical: 30, alignItems: 'center', gap: 8, backgroundColor: isDark ? 'rgba(30, 42, 63, 0.2)' : 'rgba(0, 0, 0, 0.02)' },
    uploadAreaText: { color: colors.textMuted, fontSize: 14, fontWeight: '500' },
    filePreviewBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 14, borderRadius: 12, gap: 10, borderWidth: 1, borderColor: colors.border },
    fileName: { color: colors.text, fontSize: 12, flex: 1 },
    fileActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    actionBtn: { backgroundColor: 'rgba(248, 113, 113, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    previewText: { color: '#F87171', fontSize: 12, fontWeight: '600' },
    changeFileText: { color: colors.textMuted, textAlign: 'center', marginTop: 12, textDecorationLine: 'underline', fontSize: 13 },
  });

export default KYCUploadsScreen;