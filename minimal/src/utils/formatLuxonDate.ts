import { DateTime } from 'luxon';

export const formatLuxonDate = (dateObj: Date | string | null | undefined, fmt: string, locale?: string): string => {
  if (!fmt) return '';
  try {
    let dt: DateTime;
    if (dateObj instanceof Date) {
      dt = DateTime.fromJSDate(dateObj);
    } else if (typeof dateObj === 'string') {
      dt = DateTime.fromISO(dateObj);
      if (!dt.isValid) dt = DateTime.fromJSDate(new Date(dateObj));
    } else {
      dt = DateTime.now();
    }

    if (!dt.isValid) dt = DateTime.now();

    const activeLocale = locale || localStorage.getItem('date_locale') || 'en-US';
    return dt.setLocale(activeLocale).toFormat(fmt);
  } catch (e) {
    return fmt;
  }
};
