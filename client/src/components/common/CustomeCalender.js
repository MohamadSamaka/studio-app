import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import 'moment/locale/he'; // Import Hebrew locale
import 'moment/locale/ar'; // Import Arabic locale
import { useTranslation } from 'react-i18next';

const CustomCalendar = ({
  locale,
  current,
  minDate,
  maxDate,
  onDayPress,
  markedDates,
  hideArrows,
  hideExtraDays,
  disableMonthChange,
  renderHeader,
  theme,
  style,
  ...rest
}) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set moment locale
    moment.locale(locale);

    // Handle RTL layout
    const isRTL = ['ar', 'he'].includes(locale);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      // Restart the app to apply RTL changes if necessary
    }
  }, [locale]);

  return (
    <Calendar
      {...rest}
      locale={locale}
      current={current}
      minDate={minDate}
      maxDate={maxDate}
      onDayPress={onDayPress}
      markedDates={markedDates}
      hideArrows={hideArrows}
      hideExtraDays={hideExtraDays}
      disableMonthChange={disableMonthChange}
      renderHeader={renderHeader}
      theme={theme}
      style={style}
    />
  );
};

export default CustomCalendar;
