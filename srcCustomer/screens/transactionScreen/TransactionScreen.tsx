import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import * as NavigationService from '../../navigation/NavigationService';
import { useTheme } from '../../../ThemeContext';
import { getTransactionHistory } from '../../api/products/productsApi';

// --- Types ---

interface APITransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
}

const TABS = ['All', 'Payments', 'Top-ups', 'Refunds', 'Credits'];

const TransactionScreen = () => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);
  
  const [activeTab, setActiveTab] = useState('All');
  const [transactions, setTransactions] = useState<APITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- Fetch Logic ---
  const fetchTransactions = useCallback(async (pageNum: number, refreshing = false) => {
    // Prevent multiple simultaneous calls
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await getTransactionHistory(pageNum);
      const results = response.results;
      const newData = results.data || [];

      setTotalPages(results.total_pages);
      
      if (refreshing) {
        setTransactions(newData);
      } else {
        // Only append if we actually have new data
        setTransactions(prev => [...prev, ...newData]);
      }
    } catch (error) {
      console.error("Screen fetch error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isLoading]);

  // Initial Load
  useEffect(() => {
    fetchTransactions(1, true);
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchTransactions(1, true);
  };

  const loadMore = () => {
    // CRITICAL CHECK: only load more if not loading AND we have more pages to go
    if (!isLoading && page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  // --- Calculations ---
  // Note: Adjust logic if your API eventually provides specific "type" fields for In/Out
  const moneyOut = useMemo(() => 
    transactions.reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0), 
  [transactions]);
  
  const moneyIn = 0; 
  const netBalance = moneyIn - moneyOut;

  const renderTransaction = ({ item }: { item: APITransaction }) => {
    // Current API response seems to be mostly debits ("Paid Invoice")
    const isNegative = true; 
    const iconColor = isNegative ? '#F43F5E' : '#10B981';
    
    return (
      <View style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: `${iconColor}20` }]}>
          <Icon 
            xml={isNegative ? SVG_ICONS.arrowTopRight : SVG_ICONS.addIcon} 
            size={24} 
            color={iconColor} 
          />
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.titleText}>{item.description}</Text>
          <Text style={styles.subText}>{item.date}</Text>
        </View>

        <View style={styles.amountCol}>
          <Text style={[styles.amountValue, { color: iconColor }]}>
            {isNegative ? '-' : '+'} AED {parseFloat(item.amount).toFixed(2)}
          </Text>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { color: iconColor }]}>
              {isNegative ? 'DEBIT' : 'CREDIT'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => NavigationService.goBack()} style={styles.navIcon}>
          <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Transactions</Text>
        <TouchableOpacity style={styles.navIcon}>
          {/* <Icon xml={SVG_ICONS.downloadIcon} size={24} color={colors.text} /> */}
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderTransaction}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3} // Trigger loadMore slightly before bottom
        ListHeaderComponent={
          <>
            <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Wallet Transactions- Coming Soon!</Text>
              {/* <Text style={styles.balanceLabel}>Net Balance (Selected Period)</Text>
              <Text style={styles.balanceTotal}>AED {netBalance.toFixed(2)}</Text>
              
              <View style={styles.row}>
                <View style={styles.summaryBox}>
                  <View style={[styles.miniCircle, { backgroundColor: 'rgba(16, 185, 129, 0.25)' }]}>
                    <Icon xml={SVG_ICONS.arrowDownLeft} size={14} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Money In</Text>
                    <Text style={styles.summaryValue}>AED {moneyIn.toFixed(0)}</Text>
                  </View>
                </View>

                <View style={styles.summaryBox}>
                  <View style={[styles.miniCircle, { backgroundColor: 'rgba(244, 63, 94, 0.25)' }]}>
                    <Icon xml={SVG_ICONS.arrowTopRight} size={14} color="#F43F5E" />
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>Money Out</Text>
                    <Text style={styles.summaryValue}>AED {moneyOut.toFixed(0)}</Text>
                  </View>
                </View>
              </View> */}
            </View>

            {/* <Text style={styles.sectionHeader}>Filter By Type</Text> */}
            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
              {TABS.map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView> */}
          </>
        }
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          isLoading && page > 1 ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
          ) : <View style={{ height: 20 }} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>No transactions found</Text>
          ) : (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
          )
        }
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    navIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      // backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    navTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
    listContent: { paddingBottom: 40 },
    balanceCard: {
      backgroundColor: colors.primary,
      margin: 16,
      borderRadius: 28,
      padding: 24,
      elevation: 8,
    },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
    balanceTotal: { color: 'white', fontSize: 32, fontWeight: '900', marginVertical: 12 },
    row: { flexDirection: 'row', gap: 12 },
    summaryBox: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: 12,
      borderRadius: 18,
      alignItems: 'center',
      gap: 10,
    },
    miniCircle: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    summaryLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    summaryValue: { color: 'white', fontSize: 15, fontWeight: 'bold' },
    sectionHeader: { color: colors.text, fontSize: 18, fontWeight: '800', marginLeft: 16, marginTop: 8 },
    tabBar: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
    tab: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activeTab: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
    activeTabText: { color: 'white' },
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
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
        android: { elevation: 2 },
      }),
    },
    iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    infoCol: { flex: 1 },
    titleText: { color: colors.text, fontSize: 15, fontWeight: 'bold' },
    subText: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
    amountCol: { alignItems: 'flex-end' },
    amountValue: { fontSize: 16, fontWeight: '900' },
    badge: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginTop: 8,
    },
    badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 16 },
  });

export default TransactionScreen;