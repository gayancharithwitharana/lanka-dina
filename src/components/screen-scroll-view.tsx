import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CONTENT_BOTTOM_SPACING = 24;

export function ScreenScrollView({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-grow"
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom + CONTENT_BOTTOM_SPACING,
        }}
      >
        <View className="w-full max-w-[600px] flex-1 self-center">{children}</View>
      </ScrollView>
    </View>
  );
}
