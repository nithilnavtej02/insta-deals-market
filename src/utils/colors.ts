export const colors = {
  // Primary colors
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',
  
  // Background colors
  background: '#F9FAFB',
  backgroundDark: '#111827',
  surface: '#FFFFFF',
  surfaceDark: '#1F2937',
  
  // Text colors
  text: '#374151',
  textDark: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textSecondaryDark: '#6B7280',
  
  // Border colors
  border: '#E5E7EB',
  borderDark: '#374151',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Gradient colors
  gradientStart: '#A78BFA',
  gradientEnd: '#7C3AED',
};

export const getThemeColors = (isDark: boolean) => ({
  background: isDark ? colors.backgroundDark : colors.background,
  surface: isDark ? colors.surfaceDark : colors.surface,
  text: isDark ? colors.textDark : colors.text,
  textSecondary: isDark ? colors.textSecondaryDark : colors.textSecondary,
  border: isDark ? colors.borderDark : colors.border,
});