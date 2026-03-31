import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { makeStyles } from '../styles';
import Icon from '../../../../Icon';
import { useTheme } from '../../../../ThemeContext';

const CustomInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  icon?: string;
  multiline?: boolean;
  keyboardType?: any;
  maxLength?: number;
  disabled?: boolean;
}> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  icon,
  multiline,
  keyboardType,
  maxLength,
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          !!error && styles.inputError,
          disabled && {
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            borderColor: colors.border,
            opacity: 0.65,
          },
        ]}
      >
        {icon && (
          <View style={{ marginRight: 5, marginLeft: 5 }}>
            <Icon xml={icon} size={20} color={disabled ? colors.textMuted : colors.text} />
          </View>
        )}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={!disabled}
          selectTextOnFocus={!disabled}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default CustomInput;