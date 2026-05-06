import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar,
  ActivityIndicator,
  Linking,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import * as NavigationService from '../../navigation/NavigationService';
import { useTheme } from '../../../ThemeContext';
import { getInvoices } from '../../api/products/productsApi';

// --- Types ---
type TabType = '' | 'pending' | 'paid';
type TimeFilter = 'this_month' | 'last_month' | '';

interface Invoice {
  id: string;
  invoice_number: string;
  order_ref: string;
  date: string;
  due_date: string;
  amount: string;
  status: string;
  pdf_url: string;
}

const TABS: {id: TabType; icon: string; label: string}[] = [
  {id: '', icon: SVG_ICONS.fileIcon, label: 'All'},
  {id: 'pending', icon: SVG_ICONS.dollarIcon, label: 'Pending'},
  {id: 'paid', icon: SVG_ICONS.financeHistory, label: 'Paid'},
];

const InvoicesScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  // Filter States
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('');
  
  // Data States
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (pageNum: number, isInitial = false) => {
      if (loading) return;
      setLoading(true);

      try {
        const response = await getInvoices(pageNum, activeTab, timeFilter);
        const { data, total_pages } = response.results;

        setTotalPages(total_pages);
        setInvoices((prev) => (isInitial ? data : [...prev, ...data]));
      } catch (error) {
        Alert.alert('Error', 'Could not load invoices.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, timeFilter]
  );

  // Trigger fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchData(1, true);
  }, [activeTab, timeFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchData(1, true);
  };

  const loadMore = () => {
    // Only load more if we aren't loading and current page is less than total
    if (!loading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, false);
    }
  };

  const handleDownload = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open invoice link');
    }
  };

  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    const isPaid = item.status === 'PAID';
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedInvoice(item)}
        style={styles.invoiceCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Icon xml={SVG_ICONS.fileIcon} size={22} color={colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.orderTitle}>{item.invoice_number}</Text>
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.cardAmount}>AED {item.amount}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isPaid ? `${colors.success}15` : `${colors.danger}15` }]}>
              <Text style={[styles.statusText, { color: isPaid ? colors.success : colors.danger }]}>{item.status}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  // Helper Components
const FilterChip = ({ label, active, onPress }: any) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}
    >
      <Text style={{ color: active ? 'white' : colors.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
};

const DetailItem = ({ label, value }: any) => {
    const { colors } = useTheme();
    return (
        <View style={styles.detailRow}>
            <Text style={{ color: colors.textMuted }}>{label}</Text>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>{value}</Text>
        </View>
    );
};

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => NavigationService.goBack()}>
          <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Invoices</Text>
        <View style={{ width: 45 }} />
      </View>

      {/* Time Filters */}
      <View style={styles.timeFilterRow}>
        <FilterChip 
          label="This Month" 
          active={timeFilter === 'this_month'} 
          onPress={() => setTimeFilter(timeFilter === 'this_month' ? '' : 'this_month')} 
        />
        <FilterChip 
          label="Last Month" 
          active={timeFilter === 'last_month'} 
          onPress={() => setTimeFilter(timeFilter === 'last_month' ? '' : 'last_month')} 
        />
      </View>

      {/* Status Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tabItem, activeTab === tab.id && styles.activeTabItem]}
          >
            <View style={[styles.tabIconBg, activeTab === tab.id && styles.activeIconBg]}>
              <Icon xml={tab.icon as any} size={22} color={activeTab === tab.id ? 'white' : colors.textMuted} />
            </View>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoiceCard}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={loading && page > 1 ? <ActivityIndicator color={colors.primary} style={{ margin: 20 }} /> : <View style={{ height: 100 }} />}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No records found</Text> : null}
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedInvoice} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Invoice Details</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <Icon xml={SVG_ICONS.close} size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
                <DetailItem label="Invoice Number" value={selectedInvoice?.invoice_number} />
                <DetailItem label="Order Reference" value={selectedInvoice?.order_ref} />
                <DetailItem label="Date" value={selectedInvoice?.date} />
                <DetailItem label="Amount" value={`AED ${selectedInvoice?.amount}`} />
            </View>

            <TouchableOpacity 
              style={styles.downloadBtn} 
              onPress={() => selectedInvoice && handleDownload(selectedInvoice.pdf_url)}
            >
              <Icon xml={SVG_ICONS.downloadIcon} size={20} color="white" />
              <Text style={styles.downloadText}>Download Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    navTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    timeFilterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
    tabItem: { alignItems: 'center', width: '28%' },
    tabIconBg: { width: 50, height: 50, borderRadius: 15, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 5, borderWidth: 1, borderColor: colors.border },
    activeIconBg: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabLabel: { color: colors.textMuted, fontSize: 11, fontWeight: 'bold' },
    activeTabLabel: { color: colors.text },
    listContent: { padding: 16 },
    invoiceCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconCircle: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
    cardInfo: { flex: 1, marginLeft: 12 },
    orderTitle: { color: colors.text, fontSize: 14, fontWeight: 'bold' },
    cardDate: { color: colors.textMuted, fontSize: 12 },
    amountContainer: { alignItems: 'flex-end' },
    cardAmount: { color: colors.text, fontSize: 14, fontWeight: 'bold' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginTop: 4 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    popupContainer: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
    popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    popupTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    modalBody: { gap: 15, marginBottom: 30 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    downloadBtn: { backgroundColor: colors.primary, height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    downloadText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    emptyText: { textAlign: 'center', marginTop: 50, color: colors.textMuted },
  });

export default InvoicesScreen;