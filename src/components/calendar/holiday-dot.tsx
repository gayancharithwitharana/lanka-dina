import { View } from 'react-native';

import type { HolidayType } from '@/data/holidays';

const dotColorByType: Record<HolidayType, string> = {
  public: 'bg-holiday',
  poya: 'bg-poya',
};

type HolidayDotProps = {
  type: HolidayType;
  size: 'small' | 'medium';
};

export function HolidayDot({ type, size }: HolidayDotProps) {
  const sizeClass = size === 'small' ? 'h-[5px] w-[5px]' : 'h-2 w-2';
  return <View className={`rounded-full ${sizeClass} ${dotColorByType[type]}`} />;
}
