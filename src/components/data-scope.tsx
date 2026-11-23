import { Fragment, type ReactNode } from 'react';

import { useDataUpdates } from '@/data/data-updates';

export function DataScope({ children }: { children: ReactNode }) {
  const revision = useDataUpdates();
  return <Fragment key={revision}>{children}</Fragment>;
}
