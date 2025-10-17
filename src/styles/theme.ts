import { useAppSelector } from '../store/hooks';
import { colors, colors_dark } from './colors';

export const useThemeMode = () => useAppSelector(state => state.theme.mode);

export const useThemeColors = () => {
  const mode = useThemeMode();
  return mode === 'dark' ? colors_dark : colors;
};
