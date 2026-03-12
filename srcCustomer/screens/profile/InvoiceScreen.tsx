import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import * as NavigationService from '../../navigation/NavigationService';
import { useTheme } from '../../../ThemeContext';

// --- Types & Mock Data ---
type TabType = 'All' | 'Pending' | 'Generated';

interface Invoice {
  id: string;
  orderNumber: string;
  date: string;
  amount: number;
  status: 'Pending' | 'Generated' | 'Unpaid';
  method: string;
  txnId: string;
}

const INVOICE_DATA: Invoice[] = [
  {
    id: '1',
    orderNumber: '#839201',
    date: '12 Oct 2023, 10:45 AM',
    amount: 135.0,
    status: 'Generated',
    method: 'Wallet',
    txnId: 'TXN-99203102',
  },
  {
    id: '2',
    orderNumber: '#839190',
    date: '15 Oct 2023, 11:20 AM',
    amount: 250.0,
    status: 'Unpaid',
    method: 'Credit Limit',
    txnId: 'TXN-99203105',
  },
  {
    id: '3',
    orderNumber: '#839185',
    date: '18 Oct 2023, 09:00 AM',
    amount: 410.5,
    status: 'Generated',
    method: 'Bank Transfer',
    txnId: 'TXN-99203110',
  },
  {
    id: '4',
    orderNumber: '#839180',
    date: '20 Oct 2023, 02:15 PM',
    amount: 95.0,
    status: 'Unpaid',
    method: 'Wallet',
    txnId: 'TXN-99203115',
  },
  {
    id: '5',
    orderNumber: '#839175',
    date: '21 Oct 2023, 04:30 PM',
    amount: 120.0,
    status: 'Pending',
    method: 'System',
    txnId: 'TXN-99203120',
  },
];

const TABS: { id: TabType; icon: string; label: string }[] = [
  { id: 'All', icon: SVG_ICONS.fileIcon, label: 'All' },
  { id: 'Pending', icon: SVG_ICONS.dollarIcon, label: 'Pending' },
  { id: 'Generated', icon: SVG_ICONS.financeHistory, label: 'Generated' },
];

const InvoicesScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredInvoices = useMemo(() => {
    if (activeTab === 'All') return INVOICE_DATA;
    return INVOICE_DATA.filter(item => item.status === activeTab);
  }, [activeTab]);

  const totalSelectedAmount = useMemo(() => {
    return INVOICE_DATA.filter(item => selectedIds.has(item.id)).reduce(
      (sum, item) => sum + item.amount,
      0,
    );
  }, [selectedIds]);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    const isUnpaid = item.status === 'Unpaid' || item.status === 'Pending';
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          isUnpaid ? toggleSelection(item.id) : setSelectedInvoice(item)
        }
        style={[styles.invoiceCard, isSelected && styles.selectedCard]}
      >
        <View style={styles.cardHeader}>
          {isUnpaid && (
            <View
              style={[styles.checkbox, isSelected && styles.checkboxActive]}
            >
              {isSelected && (
                <Icon
                  xml={SVG_ICONS.selectionTickIcon}
                  size={16}
                  color="white"
                />
              )}
            </View>
          )}

          <View style={styles.iconCircle}>
            <Icon xml={SVG_ICONS.fileIcon} size={22} color={colors.primary} />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.orderTitle}>Order {item.orderNumber}</Text>
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.cardAmount}>AED {item.amount.toFixed(2)}</Text>
            <View
              style={[
                styles.miniBadge,
                {
                  backgroundColor:
                    item.status === 'Generated'
                      ? `${colors.success}20`
                      : `${colors.danger}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.miniBadgeText,
                  {
                    color:
                      item.status === 'Generated'
                        ? colors.success
                        : colors.danger,
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={() => setSelectedInvoice(item)}
        >
          <Text style={styles.viewDetailsText}>View Statement</Text>
          <Icon xml={SVG_ICONS.arrowRight} size={18} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Custom Nav Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => NavigationService.goBack()}
        >
          <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Statements</Text>
        <View style={{ width: 45 }} />
      </View>

      {/* Icon Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.tabItem,
              activeTab === tab.id && styles.activeTabItem,
            ]}
          >
            <View
              style={[
                styles.tabIconBg,
                activeTab === tab.id && styles.activeIconBg,
              ]}
            >
              <Icon
                xml={tab.icon as any}
                size={22}
                color={activeTab === tab.id ? 'white' : colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredInvoices}
        keyExtractor={item => item.id}
        renderItem={renderInvoiceCard}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: selectedIds.size > 0 ? 120 : 20 },
        ]}
      />

      {/* --- BOTTOM PAYMENT BAR --- */}
      {selectedIds.size > 0 && (
        <View
          style={[styles.paymentBar, { paddingBottom: insets.bottom + 15 }]}
        >
          <View>
            <Text style={styles.selectedCount}>
              {selectedIds.size} Items Selected
            </Text>
            <Text style={styles.totalPayAmount}>
              AED {totalSelectedAmount.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity style={styles.payNowBtn}>
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- INVOICE DETAIL MODAL --- */}
      <Modal visible={!!selectedInvoice} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Invoice Detail</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <Icon xml={SVG_ICONS.close} size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.statusDisplay}>
              <View
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor:
                      selectedInvoice?.status === 'Generated'
                        ? colors.success
                        : colors.danger,
                  },
                ]}
              >
                <Icon
                  xml={
                    selectedInvoice?.status === 'Generated'
                      ? SVG_ICONS.selectionTickIcon
                      : SVG_ICONS.close
                  }
                  size={32}
                  color="white"
                />
              </View>
              <Text style={styles.statusAmount}>
                AED {selectedInvoice?.amount.toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.statusSub,
                  {
                    color:
                      selectedInvoice?.status === 'Generated'
                        ? colors.success
                        : colors.danger,
                  },
                ]}
              >
                {selectedInvoice?.status === 'Generated'
                  ? 'Statement Generated'
                  : 'Pending Payment'}
              </Text>
            </View>
            <View style={styles.detailTable}>
              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>Order No</Text>
                <Text style={styles.rowValue}>
                  {selectedInvoice?.orderNumber}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>Date</Text>
                <Text style={styles.rowValue}>{selectedInvoice?.date}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.rowLabel}>Method</Text>
                <Text style={styles.rowValue}>{selectedInvoice?.method}</Text>
              </View>
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.rowLabel}>TXN ID</Text>
                <Text style={styles.rowValue}>{selectedInvoice?.txnId}</Text>
              </View>
            </View>
            <View style={styles.popupFooter}>
              <TouchableOpacity style={styles.downloadBtn}>
                <Icon xml={SVG_ICONS.downloadIcon} size={20} color="white" />
                <Text style={styles.btnText}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn}>
                <Icon
                  xml={SVG_ICONS.shareIcon}
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.btnText, { color: colors.primary }]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    navBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    backBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    navTitle: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 15,
    },
    tabItem: { alignItems: 'center', width: '28%' },
    tabIconBg: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeIconBg: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabLabel: { color: colors.textMuted, fontSize: 12, fontWeight: 'bold' },
    activeTabLabel: { color: colors.text },
    listContainer: { padding: 16 },
    invoiceCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedCard: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}10`,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardInfo: { flex: 1, marginLeft: 12 },
    orderTitle: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
    cardDate: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    amountContainer: { alignItems: 'flex-end' },
    cardAmount: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
    miniBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginTop: 4,
    },
    miniBadgeText: { fontSize: 10, fontWeight: 'bold' },
    viewDetailsBtn: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    viewDetailsText: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 13,
    },
    paymentBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    selectedCount: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: 'bold',
    },
    totalPayAmount: { color: colors.text, fontSize: 22, fontWeight: '900' },
    payNowBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 30,
      paddingVertical: 14,
      borderRadius: 16,
    },
    payNowText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      padding: 20,
    },
    popupContainer: {
      backgroundColor: colors.surface,
      borderRadius: 32,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    popupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    popupTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
    statusDisplay: { alignItems: 'center', marginVertical: 30 },
    checkCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    statusAmount: { color: colors.text, fontSize: 32, fontWeight: '900' },
    statusSub: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
    detailTable: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 16,
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowLabel: { color: colors.textMuted, fontSize: 13 },
    rowValue: { color: colors.text, fontWeight: 'bold', fontSize: 13 },
    popupFooter: { flexDirection: 'row', gap: 10, marginTop: 25 },
    downloadBtn: {
      flex: 1,
      height: 50,
      backgroundColor: colors.primary,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    shareBtn: {
      flex: 1,
      height: 50,
      backgroundColor: colors.text,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    btnText: {
      color: colors.isDark ? 'white' : colors.background,
      fontWeight: 'bold',
      marginLeft: 8,
    },
  });

export default InvoicesScreen;
