import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LogoSVG } from './LogoSVG';

const LOGO_SIZE = 80;
const FONT_SCALE = 0.35;

export function Logo({ size = LOGO_SIZE }) {
  const { textStyles, colors } = useTheme();
  const fontSize = Math.floor(size * FONT_SCALE); // Ensure integer font size
  
  return (
    <View style={styles.container}>
      <LogoSVG 
        size={Math.floor(fontSize * 1.2)}
        color={colors.primary}
      />
      <Text 
        style={[
          styles.text,
          { 
            fontSize, 
            color: colors.text,
            lineHeight: Math.floor(fontSize * 1.2),
          }
        ]}
        numberOfLines={1}
        allowFontScaling={false}
      >
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
    gap: 8,
    paddingHorizontal: 4,
  },
  text: {
    fontWeight: '300',
    includeFontPadding: false,
    textAlignVertical: 'center',
  }
});