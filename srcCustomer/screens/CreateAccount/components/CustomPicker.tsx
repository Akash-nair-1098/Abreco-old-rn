import React from 'react';
import { View, Text } from 'react-native';
import { registrationStyles } from '../styles';
import { SVG_ICONS } from '../../../assets/icons/svg';
import Dropdown, { DropdownOption } from '../../../components/DropDown';

interface CustomPickerProps {
  label: string;
  value: string | undefined;
  options: DropdownOption[];
  onChange: (option: DropdownOption) => void;
  error?: string;
  leftIcon?: string;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  value,
  options,
  onChange,
  error,
  leftIcon,
}) => {
  const styles = registrationStyles;

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>

      <Dropdown
        options={options}
        value={value}
        onChange={onChange}
        leftIcon={leftIcon}
        rightIcon={SVG_ICONS.arrowDown}
        // Passing registration styles to the reusable component
        dropDownStyles={[
          styles.inputContainer,
          error && styles.inputError,
          { marginVertical: 0, flex: 0 }, // Resetting internal margins
        ]}
        optionStyles={styles.pickerText}
        placeholder="Select Role"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default CustomPicker;
