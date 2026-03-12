import React from 'react';
import {
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { TextInputComponentStyle } from './style';
import Icon from '../../../Icon';
import { useTheme } from '../../../ThemeContext';

type Props = TextInputProps & {
  onChangeText?: (text: string) => void;
  title?: string;
  placeHolder?: string;
  textInputStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: any;
  rightIcon?: any;
  rightIconPress?: () => void;
  leftIconPress?: () => void;
  inputMode?: React.ComponentProps<typeof TextInput>['inputMode'];
  isPassword?: boolean;
  important?: boolean;
  disabled?: boolean;
};

const TextInputComponent = ({
  onChangeText,
  title,
  textInputStyle,
  textStyle,
  placeHolder,
  leftIcon,
  rightIcon,
  inputMode = 'text',
  isPassword = false,
  rightIconPress,
  leftIconPress,
  important = false,
  disabled = false,
  ...textInputProps
}: Props) => {
  const { colors, isDark } = useTheme();
  const styles = TextInputComponentStyle(colors, isDark);

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, textStyle]}>
          {title}
          {important && (
            <Text style={{ color: colors.primary, fontSize: 15 }}> *</Text>
          )}
        </Text>
      )}

      <View
        style={[
          styles.InputBox,
          {
            height: textInputProps.multiline ? 100 : 50, // Increased default height for better touch targets
          },
          disabled && styles.disabledInput,
        ]}
      >
        {leftIcon && (
          <Pressable style={styles.leftIcon} onPress={leftIconPress}>
            <Icon xml={leftIcon} color={colors.textMuted} size={20} />
          </Pressable>
        )}

        <TextInput
          {...textInputProps}
          secureTextEntry={isPassword}
          editable={!disabled}
          inputMode={inputMode}
          style={[
            styles.textInput,
            {
              textAlignVertical: textInputProps.multiline ? 'top' : 'center',
              color: disabled ? colors.textMuted : colors.text,
            },
            textInputStyle,
          ]}
          placeholder={placeHolder}
          placeholderTextColor={colors.textMuted}
          onChangeText={onChangeText}
          autoCapitalize="none"
          cursorColor={colors.primary} // Android cursor color
          selectionColor={colors.primary} // iOS selection color
        />

        {rightIcon && (
          <Pressable style={styles.rightIcon} onPress={rightIconPress}>
            <Icon xml={rightIcon} color={colors.textMuted} size={20} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default TextInputComponent;
