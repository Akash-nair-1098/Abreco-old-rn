import { Text, TextInput, View } from "react-native";
import { registrationStyles } from "../styles";
import Icon from "../../../../Icon";


const CustomInput: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  icon?: string;
  multiline?: boolean;
  keyboardType?: any;
  maxLength?: number;
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
}) =>{
  const styles = registrationStyles;

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon &&<View style={{marginRight:5, marginLeft:5}}>
             <Icon xml={icon} size={20} /></View>}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType}
          maxLength={maxLength}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};


export default CustomInput;