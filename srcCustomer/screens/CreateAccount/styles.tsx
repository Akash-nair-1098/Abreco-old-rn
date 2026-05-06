import { StyleSheet, Platform } from "react-native";

export const makeStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerIconText: { fontSize: 28 },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: colors.text 
  },
  content: { flex: 1, paddingHorizontal: 20 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: colors.textMuted 
  },
  continueButton: {
    flex: 2,
    backgroundColor: colors.primary || '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.primary 
  },
  uploadRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  fileBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    justifyContent: 'center',
  },
  fileName: { 
    fontSize: 14, 
    color: colors.textMuted 
  },
  addButtonWhite: {
    backgroundColor: colors.text,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonWhiteText: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: colors.background 
  },
  docCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
  },
  docCardError: { 
    backgroundColor: isDark ? '#1F1315' : '#FFF1F2', 
    borderColor: '#7F1D1D' 
  },
  docHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  docIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docIcon: { fontSize: 24 },
  docName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  docStatus: { fontSize: 14 },
  progressBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  progressStep: { alignItems: 'center', flex: 1 },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  progressDotCurrent: { backgroundColor: colors.primary, borderColor: colors.primary },
  progressDotError: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  progressCheck: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  progressNum: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.textMuted 
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: -10,
  },
  progressLabel: { 
    fontSize: 11, 
    color: colors.textMuted 
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#0F2922' : '#DCFCE7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#166534',
  },
  successIcon: { fontSize: 16, marginRight: 8 },
  successText: { 
    fontSize: 14, 
    color: isDark ? '#4ADE80' : '#166534', 
    fontWeight: '500' 
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1F1315' : '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7F1D1D',
    marginBottom: 12,
  },
  errorIcon: { fontSize: 16, marginRight: 12 },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FCA5A5',
    marginBottom: 4,
  },
  errorDesc: { 
    fontSize: 13, 
    color: '#F87171', 
    lineHeight: 18 
  },
  reuploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#7F1D1D',
  },
  reuploadIcon: { fontSize: 16, marginRight: 8 },
  reuploadText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#FCA5A5', 
    marginLeft: 10 
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  uploadIcon: { fontSize: 20, marginRight: 8 },
  uploadText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: colors.textMuted, 
    marginLeft: 10 
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIconLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: isDark ? '#0F2922' : '#DCFCE7',
    borderWidth: 4,
    borderColor: '#166534',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successCheckLarge: { 
    fontSize: 60, 
    color: '#4ADE80', 
    fontWeight: 'bold' 
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  appId: { 
    fontWeight: '700', 
    color: colors.text 
  },
  infoBoxBlue: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    marginTop: 16,
  },
  infoIconBlue: { fontSize: 16, marginRight: 12 },
  infoTextBlue: { 
    flex: 1, 
    fontSize: 13, 
    color: colors.primary, 
    lineHeight: 18 
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 6,
  },
  stepActive: { 
    backgroundColor: colors.text, 
    borderColor: colors.text 
  },
  stepCompleted: { 
    backgroundColor: '#4CAF50', 
    borderColor: '#4CAF50' 
  },
  stepNumber: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: colors.textMuted 
  },
  stepNumberActive: { 
    color: colors.background 
  },
  checkmark: { 
    fontSize: 24, 
    color: '#FFFFFF', 
    fontWeight: 'bold' 
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: { color: colors.text },
  stepSublabel: { 
    fontSize: 9, 
    color: colors.textMuted, 
    textAlign: 'center' 
  },
  stepSublabelActive: { color: colors.textMuted },
  inputWrapper: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  inputError: { borderColor: '#EF4444' },
  inputIcon: { fontSize: 20, marginRight: 12 },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: colors.text, 
    paddingVertical: 16, 
    paddingHorizontal: 5 
  },
  multilineInput: { 
    minHeight: 100, 
    textAlignVertical: 'top' 
  },
  pickerText: { 
    flex: 1, 
    fontSize: 16, 
    color: colors.text, 
    paddingVertical: 8 
  },
  chevron: { 
    fontSize: 10, 
    color: colors.textMuted 
  },
  errorText: { 
    fontSize: 12, 
    color: '#EF4444', 
    marginTop: 4, 
    marginLeft: 4 
  },

  // ── Step indicator: rejected state ────────────────────────────────────────
  stepRejected: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  stepRejectedIcon: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  stepLabelRejected: {
    color: '#EF4444',
  },
  stepSublabelRejected: {
    color: '#EF4444',
  },

  // ── Rejection banner (shown at top of rejected steps) ────────────────────
  rejectionBanner: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  rejectionBannerText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Status badge (on address cards, contact cards, etc.) ─────────────────
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  addressLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 2,
  },
  addressLocationBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});