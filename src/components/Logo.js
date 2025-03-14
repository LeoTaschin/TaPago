import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { moderateScale } from '../utils/dimensions';
import { LogoSVG } from './LogoSVG';

const LOGO_SIZE = 80; // Tamanho estático padrão

export function Logo({ size = LOGO_SIZE }) {
  const { textStyles, colors } = useTheme();
  const fontSize = moderateScale(size * 0.35); // Reduzido de 0.4 para 0.35 para evitar corte
  
  return (
    <View style={styles.container}>
      <LogoSVG 
        size={fontSize * 1.2}
        color={colors.primary}
      />
      <Text 
        style={[
          textStyles.header,
          { 
            fontSize: fontSize, 
            color: colors.text,
            includeFontPadding: false, // Remove padding extra da fonte
            textAlignVertical: 'center', // Alinha verticalmente
            lineHeight: fontSize * 1.2, // Ajusta o lineHeight para evitar corte
          }
        ]}
        numberOfLines={1} // Garante que o texto fique em uma única linha
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
    gap: moderateScale(8), // Aumentado de 5 para 8 para dar mais espaço entre o ícone e o texto
    paddingHorizontal: moderateScale(4), // Adiciona um pequeno padding horizontal
  },
});