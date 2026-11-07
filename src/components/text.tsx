import { useTranslation } from 'react-i18next';
import { Text as NativeText, type TextProps } from 'react-native';

import { getLanguageFont } from '@/fonts';

export function Text({ className, ...props }: TextProps) {
  const { i18n } = useTranslation();
  const fontClassName = getLanguageFont(i18n.language).className;

  return (
    <NativeText
      className={className ? `${fontClassName} ${className}` : fontClassName}
      {...props}
    />
  );
}
