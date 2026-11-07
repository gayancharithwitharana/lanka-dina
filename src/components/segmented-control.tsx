import { Pressable, Text, View } from 'react-native';

type SegmentOption<Value> = {
  value: Value;
  label: string;
};

type SegmentedControlProps<Value> = {
  accessibilityLabel: string;
  options: SegmentOption<Value>[];
  selectedValue: Value;
  onSelect: (value: Value) => void;
};

export function SegmentedControl<Value extends string | number>({
  accessibilityLabel,
  options,
  selectedValue,
  onSelect,
}: SegmentedControlProps<Value>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row gap-1 rounded-button bg-subtle p-1"
    >
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            onPress={() => onSelect(option.value)}
            className={`h-11 flex-1 items-center justify-center rounded-[10px] ${isSelected ? 'bg-elevated shadow-sm' : ''}`}
          >
            <Text
              className={`text-[15px] font-semibold ${isSelected ? 'text-text' : 'text-text-secondary'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
