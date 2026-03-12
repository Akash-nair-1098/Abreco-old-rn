import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
// import DocumentPicker from 'react-native-document-picker';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { useToast } from '../../components/ToastContext';

const MultiStepRegistration = ({ navigation }: any) => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- STATE WITH DYNAMIC ARRAYS ---
  const [business, setBusiness] = useState({
    name: '',
    license: '',
    trn: '',
    phone: '',
  });
  const [addresses, setAddresses] = useState([
    { label: 'Main Office', value: '' },
  ]);
  const [contacts, setContacts] = useState([
    { name: '', role: '', mobile: '', email: '' },
  ]);
  const [docs, setDocs] = useState([
    { name: 'Trade License', file: null, mandatory: true },
    { name: 'VAT Certificate', file: null, mandatory: true },
  ]);
  const [financial, setFinancial] = useState({ bank: '', iban: '' });

  // --- DYNAMIC HELPERS ---
  const addAddress = () =>
    setAddresses([...addresses, { label: '', value: '' }]);
  const removeAddress = (index: number) =>
    setAddresses(addresses.filter((_, i) => i !== index));

  const addCustomDoc = () =>
    setDocs([...docs, { name: '', file: null, mandatory: false }]);

  const pickDocument = async (index: number) => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      const newDocs = [...docs];
      newDocs[index].file = res;
      setDocs(newDocs);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) console.log(err);
    }
  };

  const handleNext = () => (step < 5 ? setStep(step + 1) : handleSubmit());

  const handleSubmit = async () => {
    setLoading(true);
    // Call submitFullRegistration(state) here
    setTimeout(() => {
      setLoading(false);
      setStep(6); // Success screen
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Step Indicator */}
      <View style={styles.stepHeader}>
        {[1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={[styles.stepDot, step >= i && styles.activeDot]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* STEP 1: BUSINESS & ADDRESSES */}
        {step === 1 && (
          <View>
            <Text style={styles.title}>Business Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={business.name}
              onChangeText={v => setBusiness({ ...business, name: v })}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.subTitle}>Business Addresses</Text>
              <TouchableOpacity onPress={addAddress}>
                <Text style={styles.addBtn}>+ Add Address</Text>
              </TouchableOpacity>
            </View>

            {addresses.map((item, idx) => (
              <View key={idx} style={styles.dynamicCard}>
                <TextInput
                  style={styles.miniInput}
                  placeholder="Label (e.g. Branch 1)"
                  value={item.label}
                  onChangeText={v => {
                    let arr = [...addresses];
                    arr[idx].label = v;
                    setAddresses(arr);
                  }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Address"
                  value={item.value}
                  onChangeText={v => {
                    let arr = [...addresses];
                    arr[idx].value = v;
                    setAddresses(arr);
                  }}
                />
                {addresses.length > 1 && (
                  <TouchableOpacity onPress={() => removeAddress(idx)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* STEP 3: KYC & CUSTOM DOCUMENTS */}
        {step === 3 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.title}>KYC Documents</Text>
              <TouchableOpacity onPress={addCustomDoc}>
                <Text style={styles.addBtn}>+ Add Other Doc</Text>
              </TouchableOpacity>
            </View>

            {docs.map((doc, idx) => (
              <View key={idx} style={styles.uploadCard}>
                {doc.mandatory ? (
                  <Text style={styles.docName}>{doc.name}</Text>
                ) : (
                  <TextInput
                    style={styles.miniInput}
                    placeholder="Document Name (e.g. Tenancy)"
                    value={doc.name}
                    onChangeText={v => {
                      let d = [...docs];
                      d[idx].name = v;
                      setDocs(d);
                    }}
                  />
                )}
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={() => pickDocument(idx)}
                >
                  {doc.file ? (
                    <Text style={styles.fileName}>✅ {doc.file.name}</Text>
                  ) : (
                    <Text style={styles.uploadPlaceholder}>
                      Upload File (PDF/JPG)
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* STEP 6: SUCCESS (Based on screenshot) */}
        {step === 6 && (
          <View style={styles.successBox}>
            <Icon xml={SVG_ICONS.checkLarge} size={60} color="#10b981" />
            <Text style={styles.title}>Submission Received</Text>
            <Text style={styles.subText}>
              Your registration is under review. We will notify you via email
              shortly.
            </Text>
            <TouchableOpacity
              style={styles.finishBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.btnText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      {step < 6 && (
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnText}>
                {step === 5 ? 'Submit' : 'Next Step'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1222' },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e293b',
  },
  activeDot: { backgroundColor: '#3b82f6', width: 25 },
  scrollContent: { padding: 20 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subTitle: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  addBtn: { color: '#3b82f6', fontWeight: 'bold' },
  input: {
    backgroundColor: '#1e293b',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  miniInput: {
    color: '#3b82f6',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 14,
  },
  dynamicCard: {
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  removeText: { color: '#ef4444', textAlign: 'right', fontSize: 12 },
  uploadCard: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  docName: { color: 'white', fontWeight: 'bold', marginBottom: 10 },
  uploadBox: {
    height: 60,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: { color: '#94a3b8', fontSize: 12 },
  fileName: { color: '#10b981', fontWeight: 'bold' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  nextBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: { color: 'white', fontWeight: 'bold' },
  backText: { color: '#94a3b8', marginTop: 12 },
  successBox: { alignItems: 'center', marginTop: 50 },
  subText: { color: '#94a3b8', textAlign: 'center', marginTop: 10 },
  finishBtn: {
    backgroundColor: '#ef4444',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
});

export default MultiStepRegistration;
