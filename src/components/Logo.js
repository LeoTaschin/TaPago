import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import logoPequena from '../assets/images/logoPequena.png';

export function Logo({ size = 50 }) {
  const { textStyles, colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <Image 
        source={logoPequena}
        style={[styles.image]}
        resizeMode="contain"
      />
      <Text style={[
        textStyles.header, 
        { 
          color: colors.text,
        }
      ]}>
        TaPago
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  image: {
    resizeMode: 'contain',
  },
});