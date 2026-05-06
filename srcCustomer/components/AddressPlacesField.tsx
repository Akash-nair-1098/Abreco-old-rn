import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import {useTheme} from '../../ThemeContext';
import {
  fetchPlacePredictions,
  fetchPlaceDetails,
  PlacePrediction,
} from '../utilities/googlePlaces';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onPlaceResolved: (address: string, lat: string, lng: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  multiline?: boolean;
  label?: string;
};

const DEBOUNCE_MS = 350;
const POPUP_MAX_H = 220;

const AddressPlacesField = ({
  value,
  onChangeText,
  onPlaceResolved,
  placeholder = 'Start typing address…',
  disabled = false,
  error,
  multiline = true,
  label = 'FULL ADDRESS',
}: Props) => {
  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors, isDark);

  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurHideRef.current) clearTimeout(blurHideRef.current);
    };
  }, []);

  const clearBlurHide = () => {
    if (blurHideRef.current) {
      clearTimeout(blurHideRef.current);
      blurHideRef.current = null;
    }
  };

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    const list = await fetchPlacePredictions(q);
    if (mounted.current) {
      setPredictions(list);
      setLoading(false);
    }
  }, []);

  const onTextChange = (text: string) => {
    onChangeText(text);
    setShowList(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), DEBOUNCE_MS);
  };

  const pickItem = useCallback(
    (p: PlacePrediction) => {
      clearBlurHide();
      setShowList(false);
      setPredictions([]);
      void (async () => {
        setLoading(true);
        try {
          const detail = await fetchPlaceDetails(p.place_id);
          if (!mounted.current) return;
          if (detail) {
            onPlaceResolved(detail.address || p.description, detail.lat, detail.lng);
          } else {
            onPlaceResolved(p.description, '', '');
          }
          inputRef.current?.blur();
          Keyboard.dismiss();
        } finally {
          if (mounted.current) setLoading(false);
        }
      })();
    },
    [onPlaceResolved],
  );

  const scheduleHideFromBlur = () => {
    clearBlurHide();
    blurHideRef.current = setTimeout(() => {
      blurHideRef.current = null;
      setShowList(false);
    }, 280);
  };

  const showPopup = showList && (loading || predictions.length > 0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.anchor}>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            multiline && styles.textArea,
            error ? styles.inputError : null,
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onTextChange}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => {
            clearBlurHide();
            setShowList(true);
          }}
          onBlur={scheduleHideFromBlur}
          blurOnSubmit={false}
        />

        {showPopup ? (
          <View style={styles.popup} pointerEvents="box-none">
            {loading && predictions.length === 0 ? (
              <View style={styles.popupLoading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <ScrollView
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled
                bounces={false}
                style={styles.popupScroll}
                contentContainerStyle={styles.popupScrollContent}>
                {predictions.map(item => (
                  <Pressable
                    key={item.place_id}
                    style={({pressed}) => [
                      styles.predRow,
                      pressed && styles.predRowPressed,
                    ]}
                    onPressIn={() => pickItem(item)}>
                    <Text style={styles.predText} numberOfLines={3}>
                      {item.description}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    wrap: {
      marginBottom: 4,
      zIndex: 20,
      elevation: 20,
    },
    inputLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    anchor: {
      position: 'relative',
      zIndex: 2,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      color: colors.text,
      fontSize: 16,
      marginBottom: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {minHeight: 100, textAlignVertical: 'top'},
    inputError: {borderColor: '#FF5252'},
    errorText: {
      color: '#FF5252',
      fontSize: 12,
      marginBottom: 10,
      marginTop: 2,
      fontWeight: '600',
    },
    popup: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '100%',
      marginTop: 4,
      maxHeight: POPUP_MAX_H,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      zIndex: 1000,
      elevation: 16,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.35 : 0.2,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 4},
    },
    popupScroll: {maxHeight: POPUP_MAX_H},
    popupScrollContent: {paddingVertical: 4},
    popupLoading: {padding: 16, alignItems: 'center', justifyContent: 'center'},
    predRow: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    predRowPressed: {backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'},
    predText: {color: colors.text, fontSize: 14},
  });

export default AddressPlacesField;
