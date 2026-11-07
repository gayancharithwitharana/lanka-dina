import { useColorScheme } from 'react-native';

import { dark, light } from '@/constants/colors';

export function useThemeColors() {
  return useColorScheme() === 'dark' ? dark : light;
}
