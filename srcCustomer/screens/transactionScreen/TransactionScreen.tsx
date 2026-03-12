import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import * as NavigationService from '../../navigation/NavigationService';
import { useTheme } from '../../../ThemeContext';

// --- Types & Data ---

type TransactionType = 'Payment' | 'Topup' | 'Refund' | 'Credit';

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  method: string;
  type: TransactionType;
  category: string;
}

const TRANSACTION_DATA: Transaction[] = [
  {
    id: '1',
    title: 'Order #839201 Payment',
    date: '12 Oct 2023, 10:45 AM',
    amount: -135.0,
    method: 'Wallet',
    type: 'Payment',
    category: 'DEBIT',
  },
  {
    id: '2',
    title: 'Wallet Top-up',
    date: '10 Oct 2023, 09:00 AM',
    amount: 500.0,
    method: 'Bank Transfer',
    type: 'Topup',
    category: 'TOPUP',
  },
  {
    id: '3',
    title: 'Refund: Item Unavailable',
    date: '08 Oct 2023, 02:30 PM',
    amount: 45.0,
    method: 'System',
    type: 'Refund',
    category: 'REFUND',
  },
  {
    id: '4',
    title: 'Order #839190 Payment',
    date: '05 Oct 2023, 11:15 AM',
    amount: -82.5,
    method: 'Credit Limit',
    type: 'Payment',
    category: 'DEBIT',
  },
  {
    id: '5',
    title: 'Order #839185 Payment',
    date: '03 Oct 2023, 01:20 PM',
    amount: -210.0,
    method: 'Wallet',
    type: 'Payment',
    category: 'DEBIT',
  },
  {
    id: '6',
    title: 'Monthly Credit Allocation',
    date: '01 Oct 2023, 10:00 AM',
    amount: 1000.0,
    method: 'Admin',
    type: 'Credit',
    category: 'CREDIT',
  },
  {
    id: '7',
    title: 'Refund: Damaged Item',
    date: '10 Sep 2023, 10:00 AM',
    amount: 12.5,
    method: 'System',
    type: 'Refund',
    category: 'REFUND',
  },
  {
    id: '8',
    title: 'Wallet Top-up',
    date: '15 Sep 2023, 09:30 AM',
    amount: 1500.0,
    method: 'Credit Card',
    type: 'Topup',
    category: 'TOPUP',
  },
];

const TABS = ['All', 'Payments', 'Top-ups', 'Refunds', 'Credits'];

// --- Main Component ---

const TransactionScreen = ({}: any) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  const [activeTab, setActiveTab] = useState('All');

  const getIconConfig = (type: TransactionType) => {
    switch (type) {
      case 'Payment':
        return { name: SVG_ICONS.arrowTopRight, color: '#F43F5E' };
      case 'Topup':
        return { name: SVG_ICONS.addIcon, color: '#10B981' };
      case 'Refund':
        return { name: SVG_ICONS.reloadIcon, color: '#10B981' };
      case 'Credit':
        return { name: SVG_ICONS.monthlyCreditIcon, color: colors.primary };
      default:
        return { name: SVG_ICONS.infoIcon, color: colors.textMuted };
    }
  };

  const filteredData = useMemo(() => {
    if (activeTab === 'All') return TRANSACTION_DATA;
    const typeMap: Record<string, TransactionType> = {
      Payments: 'Payment',
      'Top-ups': 'Topup',
      Refunds: 'Refund',
      Credits: 'Credit',
    };
    return TRANSACTION_DATA.filter(item => item.type === typeMap[activeTab]);
  }, [activeTab]);

  const moneyIn = useMemo(
    () =>
      filteredData.reduce(
        (sum, item) => (item.amount > 0 ? sum + item.amount : sum),
        0,
      ),
    [filteredData],
  );

  const moneyOut = useMemo(
    () =>
      filteredData.reduce(
        (sum, item) => (item.amount < 0 ? sum + Math.abs(item.amount) : sum),
        0,
      ),
    [filteredData],
  );

  const netBalance = moneyIn - moneyOut;

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const config = getIconConfig(item.type);
    return (
      <View style={styles.card}>
        <View
          style={[styles.iconBox, { backgroundColor: `${config.color}20` }]}
        >
          <Icon xml={config.name as any} size={24} color={config.color} />
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.subText}>{item.date}</Text>
          <Text style={styles.methodText}>{item.method}</Text>
        </View>

        <View style={styles.amountCol}>
          <Text
            style={[
              styles.amountValue,
              { color: item.amount < 0 ? '#F43F5E' : '#10B981' },
            ]}
          >
            {item.amount < 0 ? '-' : '+'} AED {Math.abs(item.amount).toFixed(2)}
          </Text>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { color: config.color }]}>
              {item.category}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Custom Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => NavigationService.goBack()}
          style={styles.navIcon}
        >
          <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Transactions</Text>
        <TouchableOpacity style={styles.navIcon}>
          <Icon xml={SVG_ICONS.downloadIcon} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderTransaction}
        ListHeaderComponent={
          <>
            {/* Primary Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>
                Net Balance (Selected Period)
              </Text>
              <Text style={styles.balanceTotal}>
                AED {netBalance.toFixed(2)}
              </Text>

              <View style={styles.row}>
                <View style={styles.summaryBox}>
                  <View
                    style={[
                      styles.miniCircle,
                      { backgroundColor: 'rgba(16, 185, 129, 0.25)' },
                    ]}
                  >
                    <Icon
                      xml={SVG_ICONS.arrowDownLeft}
                      size={14}
                      color="#10B981"
                    />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Money In</Text>
                    <Text style={styles.summaryValue}>
                      AED {moneyIn.toFixed(0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryBox}>
                  <View
                    style={[
                      styles.miniCircle,
                      { backgroundColor: 'rgba(244, 63, 94, 0.25)' },
                    ]}
                  >
                    <Icon
                      xml={SVG_ICONS.arrowTopRight}
                      size={14}
                      color="#F43F5E"
                    />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Money Out</Text>
                    <Text style={styles.summaryValue}>
                      AED {moneyOut.toFixed(0)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Filter By Type</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBar}
            >
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.activeTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No transactions found for {activeTab}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

// --- Themed Styles ---

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    navBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    navIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    navTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '800',
    },

    listContent: {
      paddingBottom: 40,
    },

    balanceCard: {
      backgroundColor: colors.primary,
      margin: 16,
      borderRadius: 28,
      padding: 24,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 8,
    },
    balanceLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    balanceTotal: {
      color: 'white',
      fontSize: 32,
      fontWeight: '900',
      marginVertical: 12,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    summaryBox: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: 12,
      borderRadius: 18,
      alignItems: 'center',
      gap: 10,
    },
    miniCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
    },
    summaryLabel: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    summaryValue: {
      color: 'white',
      fontSize: 15,
      fontWeight: 'bold',
    },

    sectionHeader: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginLeft: 16,
      marginTop: 8,
    },
    tabBar: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 10,
    },
    tab: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeTab: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabText: {
      color: colors.textMuted,
      fontWeight: '700',
      fontSize: 14,
    },
    activeTabText: {
      color: 'white',
    },

    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 22,
      alignItems: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: isDark ? 0 : 2,
        },
      }),
    },
    iconBox: {
      width: 50,
      height: 50,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    infoCol: { flex: 1 },
    titleText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: 'bold',
    },
    subText: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 4,
    },
    methodText: {
      color: isDark ? colors.textMuted : '#475569',
      fontSize: 11,
      marginTop: 2,
      fontWeight: '600',
    },
    amountCol: { alignItems: 'flex-end' },
    amountValue: {
      fontSize: 16,
      fontWeight: '900',
    },
    badge: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginTop: 8,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
    },
  });

export default TransactionScreen;
