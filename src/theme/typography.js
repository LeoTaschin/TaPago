export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
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
  },
  h2: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.families.bold,
    fontWeight: typography.weights.bold,
  },
  h3: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.families.medium,
    fontWeight: typography.weights.medium,
  },
  h4: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.families.light,
    fontWeight: typography.weights.light,
  },
  body: {
    fontSize: typography.sizes.md,
    fontFamily: typography.families.regular,
    fontWeight: typography.weights.regular,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.regular,
    fontWeight: typography.weights.regular,
  },
  button: {
    fontSize: typography.sizes.md,
    fontFamily: typography.families.semibold,
    fontWeight: typography.weights.semibold,
  },
  header: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.families.light,
    fontWeight: typography.weights.light,
  },
  subText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.families.regular,
    fontWeight: typography.weights.regular,
  },
}; 