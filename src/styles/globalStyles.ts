import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { useThemeColors } from './theme';

// Build theme-aware styles from a provided color palette
export const getGlobalStyles = (_colors: typeof colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: _colors.background.primary,
    },
    container: {
      flex: 1,
      paddingHorizontal: 10,
      backgroundColor: _colors.background.secondary,
      display: 'flex',
      justifyContent: 'center',
    },
    text: {
      fontSize: 18,
      color: _colors.text.primary,
    },
    button: {
      backgroundColor: _colors.interactive.primary,
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: _colors.text.inverse,
      fontSize: 16,
    },
    header: {
      textTransform: 'capitalize',
      fontSize: 24,
      fontWeight: 'light' as any,
      marginBottom: 20,
      color: _colors.text.primary,
    },
    lable: {
      fontSize: 16,
      marginBottom: 10,
      color: _colors.text.primary,
    },
    input: {
      height: 40,
      borderColor: _colors.border.default,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 15,
      color: _colors.text.primary,
    },
    card: {
      backgroundColor: _colors.background.primary,
      borderRadius: 18,
      height: 100,
      padding: 15,
      shadowColor: _colors.shadow.medium,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    line: {
      height: 1,
      backgroundColor: _colors.surface.divider,
      marginVertical: 15,
    },
    my10: { marginVertical: 10 },
    my15: { marginVertical: 15 },
    my20: { marginVertical: 20 },
    mx10: { marginHorizontal: 10 },
    mx15: { marginHorizontal: 15 },
    mx20: { marginHorizontal: 20 },
    mt10: { marginTop: 10 },
    mt15: { marginTop: 15 },
    mt20: { marginTop: 20 },
    mb10: { marginBottom: 10 },
    mb15: { marginBottom: 15 },
    mb20: { marginBottom: 20 },
    smallText: {
      fontSize: 14,
      color: _colors.text.secondary,
    },
    smallerText: {
      fontSize: 12,
      color: _colors.text.secondary,
    },
    flexRow: { flexDirection: 'row', alignItems: 'center' },
    gap5: { gap: 5 },
    gap10: { gap: 10 },
    link: { color: _colors.interactive.primary },
    between: { justifyContent: 'space-between' },
    justifyEnd: { justifyContent: 'flex-end' },
    success: { color: _colors.status.success },
    alignCenter: { alignItems: 'center' },
    justifyCenter: { justifyContent: 'center' },
    flex1: { flex: 1 },
    absolute: { position: 'absolute' },
    error: {
      color: _colors.status.error,
      fontSize: 11,
      marginBottom: 10,
      textTransform: 'capitalize',
      position: 'absolute',
      bottom: -15,
    },
  });

// Hook to consume themed styles
export const useGlobalStyles = () => {
  const themeColors = useThemeColors();
  return getGlobalStyles(themeColors);
};
