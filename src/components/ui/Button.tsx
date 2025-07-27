import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'reown' | 'reown-white' | 'reown-outline';
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizeStyles = {
      sm: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 40 },
      default: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
      lg: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    const variantStyles = {
      default: {
        backgroundColor: '#8B5CF6',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E7EB',
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      reown: {
        backgroundColor: 'transparent',
      },
      'reown-white': {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      'reown-outline': {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#8B5CF6',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles = {
      sm: { fontSize: 14 },
      default: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantStyles = {
      default: { color: '#FFFFFF' },
      outline: { color: '#374151' },
      ghost: { color: '#374151' },
      reown: { color: '#FFFFFF' },
      'reown-white': { color: '#8B5CF6' },
      'reown-outline': { color: '#8B5CF6' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  const renderButton = () => (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || variant === 'reown' ? '#FFFFFF' : '#8B5CF6'}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );

  if (variant === 'reown') {
    return (
      <LinearGradient
        colors={['#A78BFA', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[getButtonStyle(), { backgroundColor: 'transparent' }]}
      >
        <TouchableOpacity
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          onPress={onPress}
          disabled={disabled || loading}
          activeOpacity={0.8}
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return renderButton();
};

export default Button;