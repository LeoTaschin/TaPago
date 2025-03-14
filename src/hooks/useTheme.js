import { useColorScheme } from 'react-native';
import { colors } from '../theme/colors';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    isDark,
    colors: isDark ? colors.dark : colors.light,
    // Adicione mais propriedades do tema conforme necessário
  };
}; 