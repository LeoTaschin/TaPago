import { FONT_SIZES } from '../utils/dimensions';

export const typography = {
  sizes: {
    xs: FONT_SIZES.xs,
    sm: FONT_SIZES.sm,
    md: FONT_SIZES.md,
    lg: FONT_SIZES.lg,
    xl: FONT_SIZES.xl,
    xxl: FONT_SIZES.xxl,
    xxxl: FONT_SIZES.xxxl,
  },
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  families: {
    // Você pode alterar estas fontes para as que desejar usar
    // Certifique-se de que as fontes estejam instaladas no projeto
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
};

// Estilos de texto pré-definidos
export const textStyles = {
  h1: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.families.bold,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.xxxl * 1.2,
  },
  h2: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.families.bold,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.xxl * 1.2,
  },
  h3: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.families.medium,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.xxl * 1.2,
  },
  h4: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.families.light,
    fontWeight: typography.weights.light,
    lineHeight: typography.sizes.xl * 1.2,
  },
  body: {
    fontSize: typography.sizes.md,
    fontFamily: typography.families.regular,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.md * 1.5,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.regular,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.sm * 1.5,
  },
  button: {
    fontSize: typography.sizes.md,
    fontFamily: typography.families.semibold,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.md * 1.2,
  },
  header: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.families.light,
    fontWeight: typography.weights.light,
    lineHeight: typography.sizes.xl * 1.2,
  },
  subText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.regular,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.sm * 1.5,
  },
}; 