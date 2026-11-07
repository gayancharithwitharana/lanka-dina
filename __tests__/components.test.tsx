import '@/i18n';

import { render, screen, userEvent } from '@testing-library/react-native';

import { MonthGrid } from '@/components/calendar/month-grid';
import { MonthHeader } from '@/components/calendar/month-header';
import { SegmentedControl } from '@/components/segmented-control';
import { HolidayFilterChips } from '@/components/upcoming/holiday-filter-chips';
import { getHolidaysInMonth } from '@/data/holidays';

const november2026 = { year: 2026, monthIndex: 10 };

describe('MonthGrid', () => {
  it('shows weekday labels and every day of the month', async () => {
    await render(
      <MonthGrid
        yearMonth={november2026}
        weekStartsOn={0}
        today={new Date(2026, 10, 7)}
        holidays={getHolidaysInMonth(november2026)}
        locale="en"
      />,
    );

    expect(screen.getAllByText('S')).toHaveLength(2);
    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByText('30')).toBeOnTheScreen();
    expect(screen.queryByText('31')).not.toBeOnTheScreen();
  });
});

describe('MonthHeader', () => {
  it('calls the previous and next handlers', async () => {
    const user = userEvent.setup();
    const onPreviousMonth = jest.fn();
    const onNextMonth = jest.fn();
    await render(
      <MonthHeader
        year={2026}
        monthName="November"
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Previous month' }));
    await user.press(screen.getByRole('button', { name: 'Next month' }));

    expect(onPreviousMonth).toHaveBeenCalledTimes(1);
    expect(onNextMonth).toHaveBeenCalledTimes(1);
    expect(screen.getByText('November')).toBeOnTheScreen();
  });
});

describe('SegmentedControl', () => {
  it('marks the selected option and reports a new selection', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    await render(
      <SegmentedControl
        accessibilityLabel="Week starts on"
        options={[
          { value: 0, label: 'Sunday' },
          { value: 1, label: 'Monday' },
        ]}
        selectedValue={0}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Sunday' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Monday' })).not.toBeChecked();

    await user.press(screen.getByRole('radio', { name: 'Monday' }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});

describe('HolidayFilterChips', () => {
  it('offers All, Poya and Holidays and reports the chosen filter', async () => {
    const user = userEvent.setup();
    const onSelectFilter = jest.fn();
    await render(<HolidayFilterChips selectedFilter="all" onSelectFilter={onSelectFilter} />);

    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    await user.press(screen.getByRole('radio', { name: 'Poya' }));
    expect(onSelectFilter).toHaveBeenCalledWith('poya');
  });
});
