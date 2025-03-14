import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const Button = ({ 
  onPress, 
  title, 
  variant = 'primary', // primary, secondary, outline
  size = 'large', // large, medium, small
  fullWidth = true,
  style,
  disabled = false,
}) => {
  const { colors, textStyles } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.gray[300];
    switch (variant) {
      case 'secondary':
        return colors.secondary;
      case 'outline':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.gray[500];
    switch (variant) {
      case 'outline':
        return colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      {
        backgroundColor: getBackgroundColor(),
        width: fullWidth ? '100%' : 'auto',
      },
    ];

    if (variant === 'outline') {
      baseStyle.push({
        borderWidth: 2,
        borderColor: disabled ? colors.gray[300] : colors.primary,
      });
    }

    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButton);
        break;
      default:
        baseStyle.push(styles.largeButton);
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text 
        style={[
          textStyles.button,
          styles.text,
          { color: getTextColor() }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeButton: {
    height: 56,
    paddingHorizontal: 32,
  },
  mediumButton: {
    height: 48,
    paddingHorizontal: 24,
  },
  smallButton: {
    height: 40,
    paddingHorizontal: 16,
  },
  text: {
    textAlign: 'center',
  },
}); 