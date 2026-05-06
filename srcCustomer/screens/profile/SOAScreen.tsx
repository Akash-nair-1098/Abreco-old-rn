import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Icon from '../../../Icon';
import {useTheme} from '../../../ThemeContext';
import {SVG_ICONS} from '../../assets/icons/svg';
import * as NavigationService from '../../navigation/NavigationService';
import {getStatementOfAccounts} from '../../api/products/productsApi';
import {useAuthStore} from '../../store/useAuthStore';
import api from '../../api/axiosConf';
import {useToast} from '../../components/ToastContext';

type PeriodKey = 'this_month' | 'last_3_month' | 'this_year';

type FileType = 'pdf' | 'excel';

const PERIOD_OPTIONS: {label: string; value: PeriodKey}[] = [
  {label: 'This Month', value: 'this_month'},
  {label: 'Last 3 Months', value: 'last_3_month'},
  {label: 'This Year', value: 'this_year'},
];

const formatAed = (value: any) => {
  const num = Number(value ?? 0);
  const safe = Number.isFinite(num) ? num : 0;
  return `AED ${safe.toFixed(2)}`;
};

const SOAScreen = () => {
  const {colors, isDark} = useTheme();
  const {showToast} = useToast();
  const styles = makeStyles(colors, isDark);

  const [period, setPeriod] = useState<PeriodKey>('this_month');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [totalInvoiced, setTotalInvoiced] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const accessToken = useAuthStore(state => state.accessToken);

  const periodLabel = useMemo(
    () => PERIOD_OPTIONS.find(item => item.value === period)?.label || 'This Month',
    [period],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getStatementOfAccounts(period);
      setTotalInvoiced(Number(result?.total_invoiced ?? 0));
      setTotalReceived(Number(result?.total_received ?? 0));
    } catch (error) {
      setTotalInvoiced(0);
      setTotalReceived(0);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const downloadStatement = async (fileType: FileType) => {
    try {
      setDownloading(true);
      const response = await api.get(
        `customers/statement-of-accounts/download?period=${period}&file_type=${fileType}`,
      );
      const fileData = response?.data?.results?.data;
      const remoteUrl = fileData?.url;
      const filename =
        fileData?.filename ||
        `soa_${period}_${Date.now()}.${fileType === 'pdf' ? 'pdf' : 'xlsx'}`;

      if (!remoteUrl) {
        showToast('Download link not available.', 'error');
        return;
      }

      const destinationPath = `${RNFS.DownloadDirectoryPath}/${filename}`;

      const res = await RNFS.downloadFile({
        fromUrl: remoteUrl,
        toFile: destinationPath,
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      }).promise;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        showToast(`Downloaded to: ${destinationPath}`, 'success');
        await FileViewer.open(destinationPath, {showOpenWithDialog: true});
      } else {
        showToast('Failed to download statement.', 'error');
      }
    } catch (error) {
      showToast('Unable to download/open statement.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => NavigationService.goBack()} style={styles.navIcon}>
          <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>SOA</Text>
        <View style={styles.navIcon} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL INVOICED (DEBIT)</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{marginTop: 14}} />
          ) : (
            <Text style={styles.totalInvoicedText}>{formatAed(totalInvoiced)}</Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL RECEIVED (CREDIT)</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{marginTop: 14}} />
          ) : (
            <Text style={styles.totalReceivedText}>{formatAed(totalReceived)}</Text>
          )}
        </View>

        <View style={styles.filterCard}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Period:</Text>
            <TouchableOpacity
              style={styles.periodPicker}
              onPress={() => setShowPeriodModal(true)}>
              <Text style={styles.periodText}>{periodLabel}</Text>
              <Icon
                xml={SVG_ICONS.arrowDown || SVG_ICONS.rightArrow}
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => setShowDownloadModal(true)}
            disabled={downloading}>
            {downloading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon xml={SVG_ICONS.downloadIcon} size={20} color="#fff" />
                <Text style={styles.downloadText}>Download Statement</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showPeriodModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPeriodModal(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setShowPeriodModal(false)}>
          <View style={styles.modalCard}>
            {PERIOD_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  setShowPeriodModal(false);
                  setPeriod(option.value);
                }}>
                <Text
                  style={[
                    styles.modalOptionText,
                    period === option.value && styles.modalOptionTextActive,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showDownloadModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDownloadModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.downloadModalCard}>
            <View style={styles.downloadModalHeader}>
              <Text style={styles.downloadModalTitle}>Download Statement</Text>
              <TouchableOpacity onPress={() => setShowDownloadModal(false)}>
                <Icon xml={SVG_ICONS.closeIcon} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.downloadModalSubtitle}>
              Please choose the format you would like to download your Statement of Accounts in.
            </Text>

            <View style={styles.downloadTypeRow}>
              <TouchableOpacity
                style={styles.downloadTypeCard}
                onPress={async () => {
                  setShowDownloadModal(false);
                  await downloadStatement('pdf');
                }}>
                <View style={styles.downloadTypeIconWrap}>
                  <Icon xml={SVG_ICONS.downloadIcon} size={26} color={colors.textMuted} />
                </View>
                <Text style={styles.downloadTypeText}>PDF Document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.downloadTypeCard}
                onPress={async () => {
                  setShowDownloadModal(false);
                  await downloadStatement('excel');
                }}>
                <View style={styles.downloadTypeIconWrap}>
                  <Icon xml={SVG_ICONS.downloadIcon} size={26} color={colors.textMuted} />
                </View>
                <Text style={styles.downloadTypeText}>Excel File</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    navIcon: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      gap: 14,
      paddingBottom: 24,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      padding: 18,
    },
    summaryLabel: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 1,
    },
    totalInvoicedText: {
      marginTop: 14,
      color: '#FF1E63',
      fontSize: 30,
      fontWeight: '900',
    },
    totalReceivedText: {
      marginTop: 14,
      color: '#00C896',
      fontSize: 30,
      fontWeight: '900',
    },
    filterCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      padding: 14,
      gap: 14,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    filterLabel: {
      color: colors.textMuted,
      fontSize: 16,
      fontWeight: '700',
    },
    periodPicker: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? colors.background : colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    periodText: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    downloadButton: {
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
    },
    downloadText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '800',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
      paddingHorizontal: 26,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 8,
    },
    modalOption: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    modalOptionText: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '600',
    },
    modalOptionTextActive: {
      color: colors.primary,
      fontWeight: '800',
    },
    downloadModalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    downloadModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    downloadModalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
    },
    downloadModalSubtitle: {
      color: colors.textMuted,
      textAlign: 'center',
      paddingHorizontal: 16,
      paddingTop: 18,
      fontSize: 13,
      lineHeight: 20,
    },
    downloadTypeRow: {
      flexDirection: 'row',
      gap: 10,
      padding: 16,
    },
    downloadTypeCard: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      gap: 10,
    },
    downloadTypeIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    downloadTypeText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
  });

export default SOAScreen;
