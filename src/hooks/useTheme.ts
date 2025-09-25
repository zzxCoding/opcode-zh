import { useTheme as useThemeContext } from '../contexts/ThemeContext';

/**
 * Hook to access and control the theme and language system
 * 
 * @returns {Object} Theme and language utilities and state
 * @returns {ThemeMode} theme - Current theme mode ('dark' | 'gray' | 'light' | 'custom')
 * @returns {Language} language - Current language ('en' | 'zh')
 * @returns {CustomThemeColors} customColors - Custom theme color configuration
 * @returns {Function} setTheme - Function to change the theme mode
 * @returns {Function} setLanguage - Function to change the language
 * @returns {Function} setCustomColors - Function to update custom theme colors
 * @returns {boolean} isLoading - Whether theme operations are in progress
 * 
 * @example
 * const { theme, language, setTheme, setLanguage } = useTheme();
 * 
 * // Change theme
 * await setTheme('light');
 * 
 * // Change language
 * await setLanguage('zh');
 * 
 * // Update custom colors
 * await setCustomColors({ background: 'oklch(0.98 0.01 240)' });
 */
export const useTheme = () => {
  return useThemeContext();
};