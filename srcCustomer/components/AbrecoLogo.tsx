import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../Icon';
import { SVG_ICONS } from '../assets/icons/svg';


const AbrecoLogoUI = () => {
  return (
    <View style={styles.container}>
      {/* The Gradient Icon Box */}
      <LinearGradient
        colors={['#DC3545', '#4158D0']} // Red to Blue gradient transition
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoBox}
      >
        <Icon
          xml={SVG_ICONS.loginBox} // The package/box icon from your images
          size={32}
          color="white"
        />
      </LinearGradient>

      {/* The Brand Text */}
      <Text style={styles.brandText}>Abreco</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F19', // Dark background from screenshot
    padding: 20,
  },
  logoBox: {
    width: 65,
    height: 65,
    borderRadius: 18, // Smooth rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Optional shadow for depth
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  brandText: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
});

export default AbrecoLogoUI;
