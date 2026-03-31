import React from 'react';
import { View, Text } from 'react-native';
import { makeStyles } from '../styles';
import { useTheme } from '../../../../ThemeContext';
import { SVG_ICONS } from '../../../assets/icons/svg';
import Dropdown, { DropdownOption } from '../../../components/DropDown';

interface CustomPickerProps {
  label: string;
  value: string | undefined;
  options: DropdownOption[];
  onChange: (option: DropdownOption) => void;
  error?: string;
  leftIcon?: string;
  disabled?: boolean;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label, value, options, onChange, error, leftIcon, disabled = false,
}) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Dropdown
        options={options}
        value={value}
        onChange={disabled ? () => {} : onChange}
        leftIcon={leftIcon}
        rightIcon={disabled ? undefined : SVG_ICONS.arrowDown}
        dropDownStyles={[
          styles.inputContainer,
          error && styles.inputError,
          {
            marginVertical: 0,
            flex: 0,
            backgroundColor: disabled
              ? isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
              : colors.surface,
            opacity: disabled ? 0.65 : 1,
          },
        ]}
        optionStyles={{ color: colors.text }}
        placeholder="Select Role"
        placeholderTextColor={colors.textMuted}
        disabled={disabled}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default CustomPicker;