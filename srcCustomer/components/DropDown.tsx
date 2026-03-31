import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../ThemeContext';
import Icon from '../../Icon';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export type DropdownOption = {
  name: string;
  id: any;
};

type Props = {
  placeholder?: string;
  options: DropdownOption[];
  value: string | undefined;
  onChange: (value: DropdownOption) => void;
  leftIcon?: string;
  rightIcon?: string;
  maxListHeight?: number;
  dropDownStyles?: StyleProp<ViewStyle>;
  optionStyles?: StyleProp<TextStyle>; // Added to support the custom text colors passed from parent
  disabled?: boolean;
};

const Dropdown = ({
  placeholder = 'Select...',
  options,
  value,
  onChange,
  leftIcon,
  rightIcon,
  maxListHeight = 200,
  dropDownStyles,
  optionStyles,
  disabled = false,
}: Props) => {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors, isDark);

  const [open, setOpen] = useState(false);
  const inputRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  const currentLabel = options.find(o => o.id === value)?.name || placeholder;

  const openDropdown = () => {
    inputRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = SCREEN_HEIGHT - (y + height);
      // Decide whether to open upwards or downwards based on screen space
      setDirection(spaceBelow >= maxListHeight ? 'down' : 'up');
      setDropdownLayout({ x, y, width, height });
      setOpen(true);
    });
  };

  return (
    <>
      <TouchableOpacity
        ref={inputRef}
        style={[
          styles.dropdownBox,
          dropDownStyles,
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && openDropdown()}
        activeOpacity={0.7}
      >
        {leftIcon && <Icon xml={leftIcon} size={15} color={colors.text} />}

        <Text
          style={[
            styles.valueText,
            { color: value ? colors.text : colors.textMuted },
            optionStyles, // Applied to the main selected text
          ]}
          numberOfLines={1}
        >
          {currentLabel}
        </Text>

        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <Icon
            xml={
              rightIcon ||
              `<svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
            }
            size={10}
            color={colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.dropdownList,
              {
                left: dropdownLayout?.x,
                width: dropdownLayout?.width,
                maxHeight: maxListHeight,
                top:
                  direction === 'down'
                    ? (dropdownLayout?.y || 0) +
                      (dropdownLayout?.height || 0) +
                      5
                    : undefined,
                bottom:
                  direction === 'up'
                    ? SCREEN_HEIGHT - (dropdownLayout?.y || 0) + 5
                    : undefined,
              },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((item, index) => {
                const isSelected = item.id === value;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.optionItem,
                      index === options.length - 1 && { borderBottomWidth: 0 },
                      isSelected && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? colors.primary : colors.text },
                        optionStyles, // Applied to list items
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Icon
                        xml={`<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
                        size={12}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const makeStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    dropdownBox: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      height: 48,
      borderWidth: 1,
      borderRadius: 12,
      gap: 8,
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
    },
    valueText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
    },
    overlay: {
      flex: 1,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)',
    },
    dropdownList: {
      position: 'absolute',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.5 : 0.1,
          shadowRadius: 10,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    optionItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedOption: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    },
    optionText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });

export default Dropdown;