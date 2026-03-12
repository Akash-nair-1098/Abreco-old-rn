import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Icon from "../../Icon";
import { SVG_ICONS } from "../assets/icons/svg";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkUser = async () => {
      // Simulate loading/Auth check
      setTimeout(() => {
        navigation.replace('BusinessDetails');
      }, 2000);
    };
    checkUser();
  }, []);

  return (
    <View style={styles.container}>
      <Icon xml={SVG_ICONS.loginBox} size={150} />
      <ActivityIndicator size="large" color="#EF4444" />
    </View>
  );
};
