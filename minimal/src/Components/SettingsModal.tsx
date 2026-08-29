import { useState, useRef, useEffect } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DEFAULT_DATE_LONG = 'EEEE dd.MM.yyyy - HH:mm:ss';
const DEFAULT_DATE_SHORT = 'd.M.yy - H:mm';
const DEFAULT_LOCALE = 'en-US';

const LOCALES = [
  { label: 'en-US', code: 'en-US' },
  { label: 'en-GB', code: 'en-GB' },
  { label: 'de', code: 'de' },
  { label: 'fr', code: 'fr' },
  { label: 'es', code: 'es' },
];

const TOKENS_DATE = ['dd', 'd', 'EEE', 'EEEE', 'MM', 'M', 'MMM', 'yyyy', 'yy', 'WW'];
const TOKENS_TIME_24 = ['HH', 'H', 'mm', 'm', 'ss', 's'];
const TOKENS_TIME_12 = ['hh', 'h', 'a', 'mm', 'm', 'ss', 's'];

export const SettingsModal = ({ isOpen, onClose }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const activeInputRef = useRef<'long' | 'short'>('long');
  const inputLongRef = useRef<HTMLInputElement>(null);
  const inputShortRef = useRef<HTMLInputElement>(null);

  const [dateLong, setDateLong] = useState<string>(() => {
    return localStorage.getItem('date_format_long') || DEFAULT_DATE_LONG;
  });
  const [dateShort, setDateShort] = useState<string>(() => {
    return localStorage.getItem('date_format_short') || DEFAULT_DATE_SHORT;
  });
  const [dateLocale, setDateLocale] = useState<string>(() => {
    return localStorage.getItem('date_locale') || DEFAULT_LOCALE;
  });

  const handleCloseModal = () => {
    onClose();
  };

  const handleSaveAndClose = () => {
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleCloseModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  const updateDateLong = (val: string) => {
    setDateLong(val);
    localStorage.setItem('date_format_long', val);
    window.dispatchEvent(new Event('storage_date_format_changed'));
  };

  const updateDateShort = (val: string) => {
    setDateShort(val);
    localStorage.setItem('date_format_short', val);
    window.dispatchEvent(new Event('storage_date_format_changed'));
  };

  const updateDateLocale = (code: string) => {
    setDateLocale(code);
    localStorage.setItem('date_locale', code.trim() || DEFAULT_LOCALE);
    window.dispatchEvent(new Event('storage_date_format_changed'));
  };

  const addDateToken = (token: string) => {
    const isLong = activeInputRef.current === 'long';
    const input = isLong ? inputLongRef.current : inputShortRef.current;
    const currentVal = isLong ? dateLong : dateShort;
    const updateFn = isLong ? updateDateLong : updateDateShort;

    if (!input) {
      updateFn(currentVal ? `${currentVal} ${token}` : token);
      return;
    }

    const start = input.selectionStart ?? currentVal.length;
    const end = input.selectionEnd ?? currentVal.length;

    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);

    const needsSpaceBefore = before.length > 0 && !before.endsWith(' ');
    const inserted = needsSpaceBefore ? ` ${token}` : token;
    const nextVal = `${before}${inserted}${after}`;

    updateFn(nextVal);

    setTimeout(() => {
      input.focus();
      const newPos = start + inserted.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleResetDate = () => {
    updateDateLong(DEFAULT_DATE_LONG);
    updateDateShort(DEFAULT_DATE_SHORT);
    updateDateLocale(DEFAULT_LOCALE);
  };

  return (
    <div className="module-popover" ref={panelRef} style={{ left: '50%', transform: 'translateX(-50%)', width: '280px' }} onClick={(e) => e.stopPropagation()}>
      {/* Section 1: Language / Locale */}
      <div className="popover-title">Date Language / Locale</div>
      <input
        type="text"
        className="popover-input"
        value={dateLocale}
        onChange={(e) => updateDateLocale(e.target.value)}
        placeholder="e.g. en-US, en-GB, de, fr, es, ja"
      />
      <div className="settings-token-group" style={{ marginTop: '4px' }}>
        <span className="settings-token-label">Quick Presets:</span>
        <div className="settings-tokens">
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              className={`settings-chip ${dateLocale.toLowerCase() === loc.code.toLowerCase() ? 'active' : ''}`}
              onClick={() => updateDateLocale(loc.code)}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Date Formats (Long & Short) */}
      <div className="popover-title" style={{ marginTop: '8px' }}>Long Date Format</div>
      <input
        ref={inputLongRef}
        type="text"
        className="popover-input"
        value={dateLong}
        onFocus={() => { activeInputRef.current = 'long'; }}
        onChange={(e) => updateDateLong(e.target.value)}
        placeholder="EEEE dd.MM.yyyy - HH:mm:ss"
      />

      <div className="popover-title" style={{ marginTop: '6px' }}>Short Date Format</div>
      <input
        ref={inputShortRef}
        type="text"
        className="popover-input"
        value={dateShort}
        onFocus={() => { activeInputRef.current = 'short'; }}
        onChange={(e) => updateDateShort(e.target.value)}
        placeholder="d.M.yy - H:mm"
      />

      <div className="settings-token-group" style={{ marginTop: '6px' }}>
        <span className="settings-token-label">Insert Token into Active Input:</span>
        <div className="settings-tokens">
          {TOKENS_DATE.map((tok) => (
            <button key={tok} className="settings-chip" onClick={() => addDateToken(tok)}>
              {tok}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-token-group">
        <span className="settings-token-label">24-Hour Time:</span>
        <div className="settings-tokens">
          {TOKENS_TIME_24.map((tok) => (
            <button key={tok} className="settings-chip" onClick={() => addDateToken(tok)}>
              {tok}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-token-group">
        <span className="settings-token-label">12-Hour Time & AM/PM:</span>
        <div className="settings-tokens">
          {TOKENS_TIME_12.map((tok) => (
            <button key={tok} className="settings-chip" onClick={() => addDateToken(tok)}>
              {tok}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons: Reset & Save (Square Icons) */}
      <div className="popover-actions" style={{ marginTop: '10px' }}>
        <button className="btn-action btn-reset" onClick={handleResetDate} title="Reset Settings">
          <i className="nf nf-fa-minus_square"></i>
        </button>
        <button className="btn-action btn-save" onClick={handleSaveAndClose} title="Save & Close">
          <i className="nf nf-fa-check_square"></i>
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
