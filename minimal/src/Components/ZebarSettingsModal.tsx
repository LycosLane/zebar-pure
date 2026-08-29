import { useState, useRef, useEffect } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DEFAULT_ACCENT_COLOR = '#818cf8';
const DEFAULT_BG_COLOR = '#0f101d';
const DEFAULT_BG_OPACITY = 0;

const DEFAULT_LEFT_MODULES = ['workspaces'];
const DEFAULT_CENTER_MODULES = ['date'];
const DEFAULT_RIGHT_MODULES = ['media', 'tiling', 'network', 'cpumem', 'battery', 'weather'];

const TONED_DOWN_PRESETS = [
  { name: 'Lavender', hex: '#818cf8' },
  { name: 'Sky', hex: '#38bdf8' },
  { name: 'Mint', hex: '#34d399' },
  { name: 'Rose', hex: '#f472b6' },
  { name: 'Amber', hex: '#fbbf24' },
];

const COMPLEMENTARY_DARK_BG_PRESETS = [
  { name: 'Dark Slate (Lavender match)', hex: '#0f101d' },
  { name: 'Midnight Navy (Sky match)', hex: '#0a121f' },
  { name: 'Dark Aubergine (Mint match)', hex: '#1f0e24' },
  { name: 'Dark Forest (Rose match)', hex: '#0f1a12' },
  { name: 'Dark Sapphire (Amber match)', hex: '#0b132b' },
];

const MODULE_LABELS: Record<string, string> = {
  workspaces: 'Workspaces',
  date: 'Date & Time',
  media: 'Media Session',
  tiling: 'Layout Mode',
  network: 'Network Traffic',
  cpumem: 'CPU & RAM Usage',
  battery: 'Battery Status',
  weather: 'Weather',
};

const getStoredArray = (key: string, fallback: string[]): string[] => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return fallback;
};

export const ZebarSettingsModal = ({ isOpen, onClose }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('accent_color') || DEFAULT_ACCENT_COLOR;
  });

  const [bgColor, setBgColor] = useState<string>(() => {
    return localStorage.getItem('bar_bg_color') || DEFAULT_BG_COLOR;
  });

  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('bar_bg_opacity');
    return saved !== null ? parseInt(saved, 10) : DEFAULT_BG_OPACITY;
  });

  // Global Preferences
  const [hoverPopups, setHoverPopups] = useState<boolean>(() => {
    return localStorage.getItem('enable_hover_popups') !== 'false';
  });

  // Module visibility states (default true)
  const [showWorkspaces, setShowWorkspaces] = useState<boolean>(() => localStorage.getItem('show_workspaces') !== 'false');
  const [showDate, setShowDate] = useState<boolean>(() => localStorage.getItem('show_date') !== 'false');
  const [showNetwork, setShowNetwork] = useState<boolean>(() => localStorage.getItem('show_network') !== 'false');
  const [showCpu, setShowCpu] = useState<boolean>(() => localStorage.getItem('show_cpu') !== 'false');
  const [showMemory, setShowMemory] = useState<boolean>(() => localStorage.getItem('show_memory') !== 'false');
  const [showBattery, setShowBattery] = useState<boolean>(() => localStorage.getItem('show_battery') !== 'false');
  const [showMedia, setShowMedia] = useState<boolean>(() => localStorage.getItem('show_media') !== 'false');
  const [showTiling, setShowTiling] = useState<boolean>(() => localStorage.getItem('show_tiling') !== 'false');
  const [showWeather, setShowWeather] = useState<boolean>(() => localStorage.getItem('show_weather') !== 'false');

  // 3 Section Module Arrays
  const [leftModules, setLeftModules] = useState<string[]>(() => getStoredArray('bar_left_modules', DEFAULT_LEFT_MODULES));
  const [centerModules, setCenterModules] = useState<string[]>(() => getStoredArray('bar_center_modules', DEFAULT_CENTER_MODULES));
  const [rightModules, setRightModules] = useState<string[]>(() => getStoredArray('bar_right_modules', DEFAULT_RIGHT_MODULES));

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateAccentColor = (hex: string) => {
    const formatted = hex.startsWith('#') ? hex : `#${hex}`;
    setAccentColor(formatted);
    localStorage.setItem('accent_color', formatted);
    window.dispatchEvent(new Event('storage_accent_changed'));
  };

  const updateBgColor = (hex: string) => {
    const formatted = hex.startsWith('#') ? hex : `#${hex}`;
    setBgColor(formatted);
    localStorage.setItem('bar_bg_color', formatted);
    window.dispatchEvent(new Event('storage_bg_changed'));
  };

  const updateBgOpacity = (val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setBgOpacity(clamped);
    localStorage.setItem('bar_bg_opacity', String(clamped));
    window.dispatchEvent(new Event('storage_bg_changed'));
  };

  const toggleHoverPopups = () => {
    const nextVal = !hoverPopups;
    setHoverPopups(nextVal);
    localStorage.setItem('enable_hover_popups', String(nextVal));
    window.dispatchEvent(new Event('storage_hover_popups_changed'));
  };

  const toggleModule = (key: string, currentVal: boolean, setter: (v: boolean) => void) => {
    const nextVal = !currentVal;
    setter(nextVal);
    localStorage.setItem(key, String(nextVal));
    window.dispatchEvent(new Event('storage_modules_changed'));
  };

  const saveSections = (newLeft: string[], newCenter: string[], newRight: string[]) => {
    setLeftModules(newLeft);
    setCenterModules(newCenter);
    setRightModules(newRight);
    localStorage.setItem('bar_left_modules', JSON.stringify(newLeft));
    localStorage.setItem('bar_center_modules', JSON.stringify(newCenter));
    localStorage.setItem('bar_right_modules', JSON.stringify(newRight));
    window.dispatchEvent(new Event('storage_modules_changed'));
  };

  const moveModuleSeamlessly = (section: 'left' | 'center' | 'right', index: number, direction: 'prev' | 'next') => {
    let nextLeft = [...leftModules];
    let nextCenter = [...centerModules];
    let nextRight = [...rightModules];

    if (section === 'left') {
      if (direction === 'prev') {
        if (index > 0) {
          const [item] = nextLeft.splice(index, 1);
          nextLeft.splice(index - 1, 0, item);
        }
      } else {
        if (index < nextLeft.length - 1) {
          const [item] = nextLeft.splice(index, 1);
          nextLeft.splice(index + 1, 0, item);
        } else {
          // Cross boundary: Left -> Center
          const [item] = nextLeft.splice(index, 1);
          nextCenter.unshift(item);
        }
      }
    } else if (section === 'center') {
      if (direction === 'prev') {
        if (index > 0) {
          const [item] = nextCenter.splice(index, 1);
          nextCenter.splice(index - 1, 0, item);
        } else {
          // Cross boundary: Center -> Left
          const [item] = nextCenter.splice(index, 1);
          nextLeft.push(item);
        }
      } else {
        if (index < nextCenter.length - 1) {
          const [item] = nextCenter.splice(index, 1);
          nextCenter.splice(index + 1, 0, item);
        } else {
          // Cross boundary: Center -> Right
          const [item] = nextCenter.splice(index, 1);
          nextRight.unshift(item);
        }
      }
    } else if (section === 'right') {
      if (direction === 'prev') {
        if (index > 0) {
          const [item] = nextRight.splice(index, 1);
          nextRight.splice(index - 1, 0, item);
        } else {
          // Cross boundary: Right -> Center
          const [item] = nextRight.splice(index, 1);
          nextCenter.push(item);
        }
      } else {
        if (index < nextRight.length - 1) {
          const [item] = nextRight.splice(index, 1);
          nextRight.splice(index + 1, 0, item);
        }
      }
    }

    saveSections(nextLeft, nextCenter, nextRight);
  };

  const getVisibilityProps = (key: string): { isChecked: boolean; toggleFn: () => void } => {
    switch (key) {
      case 'workspaces': return { isChecked: showWorkspaces, toggleFn: () => toggleModule('show_workspaces', showWorkspaces, setShowWorkspaces) };
      case 'date': return { isChecked: showDate, toggleFn: () => toggleModule('show_date', showDate, setShowDate) };
      case 'media': return { isChecked: showMedia, toggleFn: () => toggleModule('show_media', showMedia, setShowMedia) };
      case 'tiling': return { isChecked: showTiling, toggleFn: () => toggleModule('show_tiling', showTiling, setShowTiling) };
      case 'network': return { isChecked: showNetwork, toggleFn: () => toggleModule('show_network', showNetwork, setShowNetwork) };
      case 'cpumem': return { isChecked: showCpu || showMemory, toggleFn: () => { toggleModule('show_cpu', showCpu, setShowCpu); toggleModule('show_memory', showMemory, setShowMemory); } };
      case 'battery': return { isChecked: showBattery, toggleFn: () => toggleModule('show_battery', showBattery, setShowBattery) };
      case 'weather': return { isChecked: showWeather, toggleFn: () => toggleModule('show_weather', showWeather, setShowWeather) };
      default: return { isChecked: true, toggleFn: () => {} };
    }
  };

  const renderSectionBlock = (sectionTitle: string, sectionKey: 'left' | 'center' | 'right', modulesList: string[]) => (
    <div style={{ marginTop: '8px' }}>
      <div className="popover-title" style={{ fontSize: '10px' }}>{sectionTitle} ({modulesList.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
        {modulesList.length === 0 ? (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', padding: '2px 4px' }}>Empty section</div>
        ) : (
          modulesList.map((key, index) => {
            const { isChecked, toggleFn } = getVisibilityProps(key);
            const isFirst = sectionKey === 'left' && index === 0;
            const isLast = sectionKey === 'right' && index === modulesList.length - 1;

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 4px', borderRadius: '3px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={toggleFn}
                  />
                  {MODULE_LABELS[key] || key}
                </label>

                <div style={{ display: 'flex', gap: '2px' }}>
                  <button
                    onClick={() => moveModuleSeamlessly(sectionKey, index, 'prev')}
                    disabled={isFirst}
                    style={{ background: 'none', border: 'none', color: isFirst ? 'rgba(255,255,255,0.2)' : 'var(--accent-color)', cursor: isFirst ? 'default' : 'pointer', fontSize: '11px', padding: '0 2px' }}
                    title="Move Left / Previous Section"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => moveModuleSeamlessly(sectionKey, index, 'next')}
                    disabled={isLast}
                    style={{ background: 'none', border: 'none', color: isLast ? 'rgba(255,255,255,0.2)' : 'var(--accent-color)', cursor: isLast ? 'default' : 'pointer', fontSize: '11px', padding: '0 2px' }}
                    title="Move Right / Next Section"
                  >
                    ▶
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="module-popover" ref={panelRef} style={{ left: 0, width: '300px' }} onClick={(e) => e.stopPropagation()}>
      {/* Section 1: Accent Color */}
      <div className="popover-title">Theme Accent Color</div>
      <div className="settings-color-presets" style={{ marginTop: '4px' }}>
        {TONED_DOWN_PRESETS.map((preset) => (
          <button
            key={preset.hex}
            className={`color-swatch ${accentColor.toLowerCase() === preset.hex.toLowerCase() ? 'active' : ''}`}
            style={{ backgroundColor: preset.hex }}
            onClick={() => updateAccentColor(preset.hex)}
            title={preset.name}
          />
        ))}
        <input
          type="color"
          className="color-picker-input"
          value={accentColor.length === 7 ? accentColor : DEFAULT_ACCENT_COLOR}
          onChange={(e) => updateAccentColor(e.target.value)}
          title="Color Picker"
        />
        <input
          type="text"
          className="settings-hex-input"
          value={accentColor}
          onChange={(e) => updateAccentColor(e.target.value)}
          placeholder="#818cf8"
          maxLength={7}
        />
      </div>

      {/* Section 2: Theme Background Color & Transparency */}
      <div className="popover-title" style={{ marginTop: '8px' }}>Theme Background Color</div>
      <div className="settings-color-presets" style={{ marginTop: '4px' }}>
        {COMPLEMENTARY_DARK_BG_PRESETS.map((preset) => (
          <button
            key={preset.hex}
            className={`color-swatch ${bgColor.toLowerCase() === preset.hex.toLowerCase() ? 'active' : ''}`}
            style={{ backgroundColor: preset.hex }}
            onClick={() => updateBgColor(preset.hex)}
            title={preset.name}
          />
        ))}
        <input
          type="color"
          className="color-picker-input"
          value={bgColor.length === 7 ? bgColor : DEFAULT_BG_COLOR}
          onChange={(e) => updateBgColor(e.target.value)}
          title="Background Color Picker"
        />
        <input
          type="text"
          className="settings-hex-input"
          value={bgColor}
          onChange={(e) => updateBgColor(e.target.value)}
          placeholder="#0f101d"
          maxLength={7}
        />
      </div>

      {/* Background Transparency Slider with Reset Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ fontSize: '10.5px', opacity: 0.85 }}>
          Opacity: {bgOpacity}% ({bgOpacity === 0 ? '100% Transparent' : bgOpacity === 100 ? 'Solid' : 'Semi-transparent'})
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={bgOpacity}
          onChange={(e) => updateBgOpacity(Number(e.target.value))}
          style={{ flex: 1, cursor: 'pointer' }}
        />
        <button
          className={`settings-chip ${bgOpacity === 0 ? 'active' : ''}`}
          onClick={() => updateBgOpacity(0)}
          style={{ padding: '2px 8px', fontSize: '10.5px' }}
          title="Reset to 100% Transparent"
        >
          Reset
        </button>
      </div>

      {/* Section 3: Preferences */}
      <div className="popover-title" style={{ marginTop: '8px' }}>Preferences</div>
      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '4px 6px', borderRadius: '3px', marginTop: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={hoverPopups}
            onChange={toggleHoverPopups}
          />
          Hover Information Popups
        </label>
      </div>

      {/* Section 4: 3 Seamless Layout Sections */}
      {renderSectionBlock('Left Section', 'left', leftModules)}
      {renderSectionBlock('Center Section', 'center', centerModules)}
      {renderSectionBlock('Right Section', 'right', rightModules)}
    </div>
  );
};

export default ZebarSettingsModal;
