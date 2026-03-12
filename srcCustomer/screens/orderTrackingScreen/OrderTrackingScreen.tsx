import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../ThemeContext';
import Icon from '../../../Icon';
import { SVG_ICONS } from '../../assets/icons/svg';
import LoadingScreen from '../../components/LoadingScreen';
import {
  acknowledgeOrder,
  getOrderTrackingDetails,
} from '../../api/products/productsApi';

const LiveOrderScreen = ({ navigation, route }: any) => {
  const { orderId } = route.params || {};
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false); // New state to hide button after success

  const fetchTracking = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await getOrderTrackingDetails(orderId);
      if (response && response.success && response.data) {
        setOrderData(response.data);
      } else if (response && response.order_number) {
        setOrderData(response);
      }
    } catch (error) {
      console.error('Tracking Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  const handleCallAgent = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  const handleAcknowledge = async () => {
    setIsAcknowledging(true);
    try {
      const res = await acknowledgeOrder(orderId);
      console.log('respons eis', res);
        setIsConfirmed(true); 
        Alert.alert('Success', 'Order delivery confirmed successfully.');

    } catch (error) {
      Alert.alert('Error', 'Failed to acknowledge order. Please try again.');
    } finally {
      setIsAcknowledging(false);
    }
  };

  if (loading) return <LoadingScreen message="Updating status..." />;

  if (!orderData || !orderData.order_number) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: colors.text }}>Order not found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.retryBtn}
        >
          <Text style={{ color: 'white' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // STRICT MAPPING: Based only on delivery_status_display
  const getStatusStep = () => {
    const ds = orderData.delivery_status_display?.toLowerCase() || '';
    if (ds === 'delivered') return 5;
    if (ds === 'out for delivery' || ds === 'out_for_delivery') return 4;
    if (['in transit', 'in_transit', 'dispatched', 'picked'].includes(ds))
      return 3;
    if (ds === 'accepted' || ds === 'scheduled') return 2;
    return 1;
  };

  const currentStep = getStatusStep();
  const rawStatus = orderData.status?.toLowerCase();
  const isError = ['failed', 'returned', 'damaged'].includes(rawStatus);

  // Logic to show OTP UI: Only if "Out for Delivery"
  const showOTPSection =
    orderData.delivery_status_display?.toLowerCase() === 'out for delivery';

  const ORDER_STEPS = [
    { id: 1, title: 'Order Pending', icon: SVG_ICONS.orderNoteIcon },
    { id: 2, title: 'Confirmed', icon: SVG_ICONS.orderBox },
    { id: 3, title: 'In Transit', icon: SVG_ICONS.vanIcon },
    { id: 4, title: 'Out for Delivery', icon: SVG_ICONS.vanIcon },
    { id: 5, title: 'Delivered', icon: SVG_ICONS.successIcon },
  ];

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon xml={SVG_ICONS.backIcon} size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerOrderId}>{orderData.order_number}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[styles.statusCard, isError && { borderColor: colors.danger }]}
        >
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isError ? colors.danger : colors.success },
              ]}
            />
            <Text style={styles.statusText}>{orderData.status_display}</Text>
          </View>
          <Text style={styles.deliveryLabel}>Current Status</Text>
          <Text
            style={[styles.deliveryValue, isError && { color: colors.danger }]}
          >
            {orderData.delivery_status_display || 'Processing'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Delivery Progress</Text>
        <View style={styles.timelineContainer}>
          {ORDER_STEPS.map((step, index) => {
            const isLast = index === ORDER_STEPS.length - 1;
            const isCompleted = !isError && currentStep > step.id;
            const isCurrent = !isError && currentStep === step.id;
            const isActive = isCompleted || isCurrent;

            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.indicatorCircle,
                      isActive ? styles.activeCircle : styles.pendingCircle,
                      isCurrent && styles.currentCircleGlow,
                      isError && { backgroundColor: colors.border },
                    ]}
                  >
                    <Icon
                      xml={step.icon as any}
                      size={14}
                      color={isActive ? 'white' : colors.textMuted}
                    />
                  </View>
                  {!isLast && (
                    <View
                      style={[styles.line, isCompleted && styles.activeLine]}
                    />
                  )}
                </View>

                <View style={styles.stepContent}>
                  <Text
                    style={[styles.stepTitle, !isActive && styles.pendingText]}
                  >
                    {step.title}
                  </Text>
                  {isCurrent && (
                    <Text style={styles.currentStatusLabel}>In Progress</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {orderData.delivery_agent && (
          <View style={styles.agentCard}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150' }}
              style={styles.avatar}
            />
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>
                {orderData.delivery_agent.name}
              </Text>
              <Text style={styles.agentPhone}>
                {orderData.delivery_agent.phone_number || 'Driver'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() =>
                handleCallAgent(orderData.delivery_agent.phone_number)
              }
            >
              <Icon
                xml={SVG_ICONS.phoneIcon}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* OTP SECTION: Visible when "Out for Delivery" regardless of code presence */}
        {showOTPSection && (
          <View style={styles.otpSection}>
            <Text style={styles.otpLabel}>Delivery Confirmation</Text>

            {orderData?.delivery_otp?.code ? (
              <>
                <Text style={styles.otpCode}>
                  {orderData.delivery_otp.code}
                </Text>
                <Text style={styles.otpDisclaimer}>
                  Share this code with the driver or confirm below.
                </Text>
              </>
            ) : (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  OTP not generated yet. Please ask the delivery person to send
                  the OTP code to your phone.
                </Text>
              </View>
            )}

            {/* Confirm button hides if already confirmed */}
            {!isConfirmed && (
              <TouchableOpacity
                style={[styles.confirmBtn, isAcknowledging && { opacity: 0.7 }]}
                onPress={handleAcknowledge}
                disabled={isAcknowledging}
              >
                {isAcknowledging ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.confirmBtnText}>Confirm Delivery</Text>
                )}
              </TouchableOpacity>
            )}

            {isConfirmed && (
              <View style={styles.successBadge}>
                <Icon
                  xml={SVG_ICONS.successIcon}
                  size={16}
                  color={colors.success}
                />
                <Text style={styles.successText}>Delivery Confirmed</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    retryBtn: {
      marginTop: 20,
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { padding: 8 },
    headerTitleContainer: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    headerOrderId: { fontSize: 12, color: colors.textMuted },
    scrollContent: { padding: 20, paddingBottom: 40 },
    statusCard: {
      backgroundColor: isDark ? colors.surface : '#F1F5F9',
      borderRadius: 20,
      padding: 20,
      marginBottom: 25,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.background : 'white',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 12,
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold', color: colors.text },
    deliveryLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
    deliveryValue: { fontSize: 22, fontWeight: '900', color: colors.text },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    timelineContainer: { paddingLeft: 10, marginBottom: 20 },
    stepRow: { flexDirection: 'row', minHeight: 70 },
    timelineLeft: { alignItems: 'center', width: 32, marginRight: 16 },
    indicatorCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    activeCircle: { backgroundColor: colors.primary },
    pendingCircle: { backgroundColor: colors.surfaceVariant },
    currentCircleGlow: { borderWidth: 4, borderColor: `${colors.primary}33` },
    line: {
      width: 2,
      position: 'absolute',
      top: 32,
      bottom: 0,
      backgroundColor: colors.border,
      zIndex: 1,
      left: 15,
    },
    activeLine: { backgroundColor: colors.primary },
    stepContent: { flex: 1, paddingTop: 4 },
    stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
    pendingText: { color: colors.textMuted },
    currentStatusLabel: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: 'bold',
      marginTop: 2,
    },
    agentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    agentInfo: { flex: 1, marginLeft: 12 },
    agentName: { fontSize: 15, fontWeight: 'bold', color: colors.text },
    agentPhone: { fontSize: 13, color: colors.textMuted },
    callButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    otpSection: {
      backgroundColor: isDark ? colors.surface : '#F8FAFC',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    otpLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.textMuted,
      marginBottom: 10,
    },
    otpCode: {
      fontSize: 32,
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: 6,
      marginBottom: 10,
    },
    otpDisclaimer: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textMuted,
      marginBottom: 20,
      textAlign: 'center',
    },
    warningBox: {
      backgroundColor: `${colors.primary}10`,
      padding: 12,
      borderRadius: 10,
      marginBottom: 20,
    },
    warningText: {
      fontSize: 13,
      color: colors.primary,
      textAlign: 'center',
      lineHeight: 18,
      fontWeight: '600',
    },
    confirmBtn: {
      backgroundColor: colors.success,
      width: '100%',
      height: 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    confirmBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    successBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
    },
    successText: {
      color: colors.success,
      fontWeight: 'bold',
      marginLeft: 8,
    },
  });

export default LiveOrderScreen;
