import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../ThemeContext';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import { fetchRegistrationStatus } from '../../api/auth/authApi'; 
import { useNavigation } from '@react-navigation/native';

const STEPS = [
  { id: 1, label: 'Uploaded' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'First Level Approved' },
  { id: 4, label: 'Approved' },
];

const RegistrationStatusScreen = ({ route }: any) => {
  const { user_id } = route.params;
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);

  const loadData = async () => {
    try {
      const response = await fetchRegistrationStatus(user_id);
      setStatusData(response?.results?.data);
    } catch (error) {
      // console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStepProgress = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'uploaded') return 2; 
    if (s === 'review') return 2;
    if (s === 'first level approved') return 3;
    if (s === 'approved') return 4;
    return 1;
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#0A0E17' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Back Button Header */}
      <View style={styles.headerNav}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)' }]} 
          onPress={() => navigation.goBack()}
        >
          <Icon xml={SVG_ICONS.backIcon} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.infoCircle}>
           <Icon xml={SVG_ICONS.timer} size={20} color="#6366f1" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Under Review</Text>
          <Text style={styles.headerSub}>Your account is currently under review by our administration team. You will be notified once approved.</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <Text style={styles.sectionTitle}>Registration Status</Text>
        
        {/* Registration Status Grid */}
        <View style={styles.statusGrid}>
          <View style={styles.statusBox}>
             <Text style={styles.statusLabel}>Business Information</Text>
             <View style={styles.badgePending}><Text style={styles.badgeText}>Pending</Text></View>
          </View>
          <View style={styles.statusBox}>
             <Text style={styles.statusLabel}>Contacts</Text>
             <View style={styles.badgePending}><Text style={styles.badgeText}>Pending</Text></View>
          </View>
        </View>

        {/* Uploaded Documents Card */}
        <View style={styles.docsCard}>
            <Text style={styles.docsTitle}>Uploaded Documents</Text>
            <Text style={styles.docsSub}>Review the copies of your trade license and VAT certificate submitted during registration.</Text>

            {/* Render Document Items */}
            {[
                { label: 'Trade License Copy', status: statusData?.trade_licence_status },
                { label: 'VAT Certificate', status: statusData?.vat_certificate_status },
                { label: 'Passport Copy (Owner)', status: statusData?.passport_status },
                ...(statusData?.other_documents || []).map((d: any) => ({ label: d.document_name, status: d.document_status }))
            ].map((doc, index) => (
                <View key={index} style={styles.docItem}>
                    <View style={styles.docHeader}>
                        <Icon xml={SVG_ICONS.fileIcon} size={20} color="#94a3b8" />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.docName}>{doc.label}</Text>
                            <Text style={styles.docStatusText}>{doc.status}</Text>
                        </View>
                    </View>

                    {/* Stepper logic */}
                    <View style={styles.stepperContainer}>
                        {STEPS.map((step, idx) => {
                            const currentProgress = getStepProgress(doc.status);
                            const isActive = currentProgress >= step.id;
                            return (
                                <React.Fragment key={step.id}>
                                    <View style={styles.stepWrapper}>
                                        <View style={[styles.stepCircle, isActive && styles.activeCircle]}>
                                            {isActive ? <Text style={styles.checkText}>✓</Text> : <Text style={styles.stepNum}>{step.id}</Text>}
                                        </View>
                                        <Text style={[styles.stepLabel, isActive && styles.activeLabel]}>{step.label}</Text>
                                    </View>
                                    {idx < STEPS.length - 1 && (
                                        <View style={[styles.stepLine, currentProgress > step.id && styles.activeLine]} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </View>

                    <View style={styles.uploadedFooter}>
                         <Icon xml={SVG_ICONS.selectionTickIcon} size={14} color="#6366f1" />
                         <Text style={styles.footerText}>{doc.label} - Uploaded</Text>
                    </View>
                </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerNav: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBanner: { flexDirection: 'row', backgroundColor: '#161B29', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  infoCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E2538', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 18 },
  scrollContent: { padding: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  statusGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statusBox: { width: '48%', backgroundColor: '#161B29', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#232D3F' },
  statusLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 10 },
  badgePending: { backgroundColor: 'rgba(245, 158, 11, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#f59e0b', fontSize: 12, fontWeight: 'bold' },
  docsCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1F2937' },
  docsTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  docsSub: { color: '#94a3b8', fontSize: 12, marginTop: 5, marginBottom: 20 },
  docItem: { backgroundColor: '#161B29', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#232D3F' },
  docHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  docName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  docStatusText: { color: '#64748b', fontSize: 11, marginTop: 2 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 10 },
  stepWrapper: { alignItems: 'center', zIndex: 2 },
  stepCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  activeCircle: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  stepNum: { color: '#64748b', fontSize: 10 },
  stepLabel: { fontSize: 8, color: '#64748b', marginTop: 5, textAlign: 'center', width: 50 },
  activeLabel: { color: '#22c55e' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#374151', marginTop: -15, marginHorizontal: -15 },
  activeLine: { backgroundColor: '#22c55e' },
  uploadedFooter: { backgroundColor: '#1E2538', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  footerText: { color: '#94a3b8', fontSize: 11, marginLeft: 8 },
});

export default RegistrationStatusScreen;