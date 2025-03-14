import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Tamanho base de design (pode ser ajustado conforme necessário)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Função para escalar horizontalmente
export const scaleWidth = (size) => (width / guidelineBaseWidth) * size;

// Função para escalar verticalmente
export const scaleHeight = (size) => (height / guidelineBaseHeight) * size;

// Função para escalar proporcionalmente (útil para fontes e elementos que precisam manter proporção)
export const moderateScale = (size, factor = 0.5) => {
  return size + (scaleWidth(size) - size) * factor;
};

// Dimensões da tela
export const screenWidth = width;
export const screenHeight = height;

// Espaçamentos padrão responsivos
export const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(40),
};

// Tamanhos de fonte responsivos
export const FONT_SIZES = {
  xs: moderateScale(12),
  sm: moderateScale(14),
  md: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),
};

// Breakpoints para diferentes tamanhos de tela
export const BREAKPOINTS = {
  phone: width < 375,
  tablet: width >= 768,
  desktop: width >= 1024,
}; 