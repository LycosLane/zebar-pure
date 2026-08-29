import { createProviderGroup, currentWidget, shellExec } from 'zebar';
import { useState, useEffect } from 'react';
import { Left, Center, Right } from './Components';
import { Battery, BindingMode, CPU, Media, Memory, Network, Weather, Workspaces } from './Components/Applets';
import SettingsModal from './Components/SettingsModal';
import ZebarSettingsModal from './Components/ZebarSettingsModal';
import { formatLuxonDate } from './utils/formatLuxonDate';
import { mapWmoCodeToStatus } from './Components/Applets/Weather';
import { parseSpeed } from './Components/Applets/Network';

const DEFAULT_DATE_LONG = "EEEE dd.MM.yyyy - HH:mm:ss";
const DEFAULT_DATE_SHORT = "d.M.yy - H:mm";
const DEFAULT_ACCENT_COLOR = '#818cf8';
const DEFAULT_BG_COLOR = '#0f101d';
const DEFAULT_BG_OPACITY = 0;

const DEFAULT_LEFT_MODULES = ['workspaces'];
const DEFAULT_CENTER_MODULES = ['date'];
const DEFAULT_RIGHT_MODULES = ['media', 'tiling', 'network', 'cpumem', 'battery', 'weather'];

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

const getWeatherProviderConfig = () => {
  if (typeof window !== 'undefined') {
    const lat = localStorage.getItem('weather_lat');
    const lon = localStorage.getItem('weather_lon');
    if (lat && lon) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
        return {
          type: 'weather',
          latitude: parsedLat,
          longitude: parsedLon,
        };
      }
    }
  }
  return { type: 'weather' };
};

let providers: any = null;
try {
  providers = createProviderGroup({
    audio: { type: 'audio' },
    network: { type: 'network' },
    glazewm: { type: 'glazewm' },
    cpu: { type: 'cpu' },
    date: { type: 'date' },
    battery: { type: 'battery' },
    memory: { type: 'memory' },
    weather: getWeatherProviderConfig(),
    media: { type: 'media' },
  });
} catch (e) {
  console.warn('[Zebar] Provider group initialization skipped (Dev mode)');
}

const applyAccentColorVariables = (hex: string) => {
  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
  document.documentElement.style.setProperty('--accent-color', cleanHex);
  
  const r = parseInt(cleanHex.slice(1, 3), 16) || 129;
  const g = parseInt(cleanHex.slice(3, 5), 16) || 140;
  const b = parseInt(cleanHex.slice(5, 7), 16) || 248;
  
  document.documentElement.style.setProperty('--accent-bg', `rgba(${r}, ${g}, ${b}, 0.22)`);
  document.documentElement.style.setProperty('--accent-border', `rgba(${r}, ${g}, ${b}, 0.45)`);
  document.documentElement.style.setProperty('--accent-hover', `rgba(${r}, ${g}, ${b}, 0.35)`);
};

const applyBgColorVariables = (hex: string, opacity: number) => {
  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
  const r = parseInt(cleanHex.slice(1, 3), 16) || 15;
  const g = parseInt(cleanHex.slice(3, 5), 16) || 16;
  const b = parseInt(cleanHex.slice(5, 7), 16) || 29;
  const alpha = Math.max(0, Math.min(100, opacity)) / 100;
  document.documentElement.style.setProperty('--bar-bg', `rgba(${r}, ${g}, ${b}, ${alpha})`);
};

type HoverAppletId = 'date' | 'cpumem' | 'network' | 'battery' | 'media' | 'weather' | 'tiling' | 'workspaces';

const getPopoverStyle = (section: 'left' | 'center' | 'right', width = '240px'): React.CSSProperties => {
  if (section === 'left') {
    return { left: 0, transform: 'none', width };
  }
  if (section === 'center') {
    return { left: '50%', transform: 'translateX(-50%)', width };
  }
  return { right: 0, transform: 'none', width };
};

const App = () => {
  const [outputMap, setOutputMap] = useState<any>(() => providers?.outputMap || {});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isZebarSettingsOpen, setIsZebarSettingsOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [hoverApplet, setHoverApplet] = useState<HoverAppletId | null>(null);

  // Global Preferences
  const [hoverPopupsEnabled, setHoverPopupsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('enable_hover_popups') !== 'false';
  });

  // Global Module Visibility State
  const [modules, setModules] = useState(() => ({
    showWorkspaces: localStorage.getItem('show_workspaces') !== 'false',
    showDate: localStorage.getItem('show_date') !== 'false',
    showNetwork: localStorage.getItem('show_network') !== 'false',
    showCpu: localStorage.getItem('show_cpu') !== 'false',
    showMemory: localStorage.getItem('show_memory') !== 'false',
    showBattery: localStorage.getItem('show_battery') !== 'false',
    showMedia: localStorage.getItem('show_media') !== 'false',
    showTiling: localStorage.getItem('show_tiling') !== 'false',
    showWeather: localStorage.getItem('show_weather') !== 'false',
  }));

  // 3 Section Module Order Arrays
  const [leftModules, setLeftModules] = useState<string[]>(() => getStoredArray('bar_left_modules', DEFAULT_LEFT_MODULES));
  const [centerModules, setCenterModules] = useState<string[]>(() => getStoredArray('bar_center_modules', DEFAULT_CENTER_MODULES));
  const [rightModules, setRightModules] = useState<string[]>(() => getStoredArray('bar_right_modules', DEFAULT_RIGHT_MODULES));

  const [customWeather, setCustomWeather] = useState<{ celsiusTemp: number; fahrenheitTemp: number; status: string } | null>(null);
  const [customCityName, setCustomCityName] = useState<string>('');

  const [dateLongFormat, setDateLongFormat] = useState<string>(() => {
    return localStorage.getItem('date_format_long') || DEFAULT_DATE_LONG;
  });
  const [dateShortFormat, setDateShortFormat] = useState<string>(() => {
    return localStorage.getItem('date_format_short') || DEFAULT_DATE_SHORT;
  });
  const [dateFormatMode, setDateFormatMode] = useState<string>(() => {
    return localStorage.getItem('date_format_mode') || 'long';
  });
  const [cpuFirst, setCpuFirst] = useState<boolean>(() => {
    return localStorage.getItem('cpu_mem_order') !== 'ram_first';
  });

  const fetchAppCustomWeather = async () => {
    if (localStorage.getItem('show_weather') === 'false') return;

    const lat = localStorage.getItem('weather_lat');
    const lon = localStorage.getItem('weather_lon');
    const city = localStorage.getItem('weather_city_input') || '';
    setCustomCityName(city);

    if (!lat || !lon) {
      setCustomWeather(null);
      return;
    }
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && data.current) {
        const cTemp = data.current.temperature_2m;
        const fTemp = (cTemp * 9) / 5 + 32;
        const status = mapWmoCodeToStatus(data.current.weather_code, data.current.is_day === 1);
        setCustomWeather({ celsiusTemp: cTemp, fahrenheitTemp: fTemp, status });
      }
    } catch (e) {
      console.warn('App custom weather fetch failed:', e);
      setCustomWeather(null);
    }
  };

  useEffect(() => {
    fetchAppCustomWeather();
    const handleWeatherChange = () => {
      fetchAppCustomWeather();
    };
    window.addEventListener('storage_weather_url_changed', handleWeatherChange);
    return () => window.removeEventListener('storage_weather_url_changed', handleWeatherChange);
  }, []);

  // Fully dynamic real-time Tauri window resizing based on active popover bounding box
  useEffect(() => {
    const updateDynamicHeight = () => {
      let targetHeight = 40;
      const popoverEl = document.querySelector('.module-popover') as HTMLElement | null;

      if (popoverEl) {
        const rect = popoverEl.getBoundingClientRect();
        targetHeight = Math.max(40, Math.ceil(rect.bottom + 16));
      } else if (isSettingsOpen || isZebarSettingsOpen || isWeatherOpen || isMediaOpen || (hoverPopupsEnabled && hoverApplet !== null)) {
        // Safe fallback before DOM paints
        targetHeight = 650;
      }

      try {
        const widget = currentWidget();
        if (widget?.window?.tauri) {
          widget.window.tauri.setSize({
            type: 'Logical',
            width: window.innerWidth,
            height: targetHeight,
          }).catch(() => {});
        }
      } catch (e) {}
    };

    updateDynamicHeight();
    const rafId = requestAnimationFrame(updateDynamicHeight);

    const observer = new MutationObserver(() => {
      updateDynamicHeight();
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [isSettingsOpen, isZebarSettingsOpen, isWeatherOpen, isMediaOpen, hoverApplet, hoverPopupsEnabled]);

  useEffect(() => {
    const initialAccent = localStorage.getItem('accent_color') || DEFAULT_ACCENT_COLOR;
    applyAccentColorVariables(initialAccent);

    const initialBg = localStorage.getItem('bar_bg_color') || DEFAULT_BG_COLOR;
    const initialOpacity = parseInt(localStorage.getItem('bar_bg_opacity') || String(DEFAULT_BG_OPACITY), 10);
    applyBgColorVariables(initialBg, initialOpacity);
  }, []);

  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', preventContextMenu, true);
    document.addEventListener('contextmenu', preventContextMenu, true);
    return () => {
      window.removeEventListener('contextmenu', preventContextMenu, true);
      document.removeEventListener('contextmenu', preventContextMenu, true);
    };
  }, []);

  useEffect(() => {
    if (providers?.onOutput) {
      providers.onOutput((newOutput: any) => setOutputMap(newOutput));
    }
  }, []);

  useEffect(() => {
    const handleFormatChange = () => {
      setDateLongFormat(localStorage.getItem('date_format_long') || DEFAULT_DATE_LONG);
      setDateShortFormat(localStorage.getItem('date_format_short') || DEFAULT_DATE_SHORT);
    };
    const handleCpuOrderChange = () => {
      setCpuFirst(localStorage.getItem('cpu_mem_order') !== 'ram_first');
    };
    const handleAccentChange = () => {
      const hex = localStorage.getItem('accent_color') || DEFAULT_ACCENT_COLOR;
      applyAccentColorVariables(hex);
    };
    const handleBgChange = () => {
      const hex = localStorage.getItem('bar_bg_color') || DEFAULT_BG_COLOR;
      const opacity = parseInt(localStorage.getItem('bar_bg_opacity') || String(DEFAULT_BG_OPACITY), 10);
      applyBgColorVariables(hex, opacity);
    };
    const handleHoverPopupsChange = () => {
      setHoverPopupsEnabled(localStorage.getItem('enable_hover_popups') !== 'false');
    };
    const handleModulesChange = () => {
      setModules({
        showWorkspaces: localStorage.getItem('show_workspaces') !== 'false',
        showDate: localStorage.getItem('show_date') !== 'false',
        showNetwork: localStorage.getItem('show_network') !== 'false',
        showCpu: localStorage.getItem('show_cpu') !== 'false',
        showMemory: localStorage.getItem('show_memory') !== 'false',
        showBattery: localStorage.getItem('show_battery') !== 'false',
        showMedia: localStorage.getItem('show_media') !== 'false',
        showTiling: localStorage.getItem('show_tiling') !== 'false',
        showWeather: localStorage.getItem('show_weather') !== 'false',
      });
      setLeftModules(getStoredArray('bar_left_modules', DEFAULT_LEFT_MODULES));
      setCenterModules(getStoredArray('bar_center_modules', DEFAULT_CENTER_MODULES));
      setRightModules(getStoredArray('bar_right_modules', DEFAULT_RIGHT_MODULES));
    };
    window.addEventListener('storage_date_format_changed', handleFormatChange);
    window.addEventListener('storage_cpu_order_changed', handleCpuOrderChange);
    window.addEventListener('storage_accent_changed', handleAccentChange);
    window.addEventListener('storage_bg_changed', handleBgChange);
    window.addEventListener('storage_hover_popups_changed', handleHoverPopupsChange);
    window.addEventListener('storage_modules_changed', handleModulesChange);
    return () => {
      window.removeEventListener('storage_date_format_changed', handleFormatChange);
      window.removeEventListener('storage_cpu_order_changed', handleCpuOrderChange);
      window.removeEventListener('storage_accent_changed', handleAccentChange);
      window.removeEventListener('storage_bg_changed', handleBgChange);
      window.removeEventListener('storage_hover_popups_changed', handleHoverPopupsChange);
      window.removeEventListener('storage_modules_changed', handleModulesChange);
    };
  }, []);

  const handleCpuMemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    shellExec('powershell', '-Command Start-Process taskmgr');
  };

  const handleCpuMemContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextCpuFirst = !cpuFirst;
    setCpuFirst(nextCpuFirst);
    localStorage.setItem('cpu_mem_order', nextCpuFirst ? 'cpu_first' : 'ram_first');
  };

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMode = dateFormatMode === 'long' ? 'short' : 'long';
    setDateFormatMode(nextMode);
    localStorage.setItem('date_format_mode', nextMode);
  };

  const handleDateContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSettingsOpen(!isSettingsOpen);
  };

  const output = outputMap;

  // Render Date token preview cleanly from Zebar date provider
  const activePattern = dateFormatMode === 'long' ? dateLongFormat : dateShortFormat;
  const activeLocale = localStorage.getItem('date_locale') || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  const liveDateFormatted = formatLuxonDate(output.date?.now, activePattern, activeLocale);

  const renderModuleByKey = (key: string, section: 'left' | 'center' | 'right') => {
    switch (key) {
      case 'workspaces':
        if (!modules.showWorkspaces) return null;
        return (
          <div key="workspaces" className="applet-popover-wrapper">
            <Workspaces 
              glazewm={output.glazewm}
              onContextMenu={() => setIsZebarSettingsOpen(true)}
              onMouseEnter={() => setHoverApplet('workspaces')}
              onMouseLeave={() => setHoverApplet(null)}
            />

            {hoverPopupsEnabled && hoverApplet === 'workspaces' && !isZebarSettingsOpen && (
              <div className="module-popover" style={getPopoverStyle(section, '230px')}>
                <div className="popover-title">Workspaces</div>
                <div className="popover-detail">
                  <span>Click:</span>
                  <span>Switch Workspace</span>
                </div>
                <div className="popover-detail">
                  <span>Right-click:</span>
                  <span>Zebar Pure Global Settings</span>
                </div>
              </div>
            )}

            <ZebarSettingsModal 
              isOpen={isZebarSettingsOpen} 
              onClose={() => setIsZebarSettingsOpen(false)} 
            />
          </div>
        );

      case 'date':
        if (!modules.showDate) return null;
        return (
          <div key="date" className="applet-popover-wrapper">
            <button 
              className='interactive' 
              onClick={handleDateClick}
              onContextMenu={handleDateContextMenu}
              onMouseEnter={() => setHoverApplet('date')}
              onMouseLeave={() => setHoverApplet(null)}
            >
              {liveDateFormatted}
            </button>

            {hoverPopupsEnabled && hoverApplet === 'date' && !isSettingsOpen && (
              <div className="module-popover" style={getPopoverStyle(section, '230px')}>
                <div className="popover-title">Date & Time</div>
                <div className="popover-detail">
                  <span>Click:</span>
                  <span>Toggle Short / Long Format</span>
                </div>
                <div className="popover-detail">
                  <span>Right-click:</span>
                  <span>Date & Time Settings</span>
                </div>
              </div>
            )}

            <SettingsModal 
              isOpen={isSettingsOpen} 
              onClose={() => setIsSettingsOpen(false)} 
            />
          </div>
        );

      case 'media':
        if (!modules.showMedia || !output.media?.currentSession) return null;
        return (
          <div key="media" className="applet-popover-wrapper">
            <Media 
              media={output.media} 
              glazewm={output.glazewm} 
              onOpenChange={setIsMediaOpen}
              onMouseEnter={() => setHoverApplet('media')}
              onMouseLeave={() => setHoverApplet(null)}
            />
            {hoverPopupsEnabled && hoverApplet === 'media' && !isMediaOpen && (
              <div className="module-popover" style={getPopoverStyle(section, '240px')}>
                <div className="popover-title">Media Session</div>
                <div className="popover-detail">
                  <span>Status:</span>
                  <span>{output.media.currentSession.isPlaying ? 'Playing' : 'Paused'}</span>
                </div>
                <div className="popover-detail">
                  <span>Click:</span>
                  <span>Focus Playing App</span>
                </div>
                <div className="popover-detail">
                  <span>Right-click:</span>
                  <span>Media Controls & Settings</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'tiling':
        if (!modules.showTiling) return null;
        return (
          <div key="tiling" className="applet-popover-wrapper">
            <BindingMode 
              glazewm={output.glazewm} 
              onMouseEnter={() => setHoverApplet('tiling')}
              onMouseLeave={() => setHoverApplet(null)}
            />
            {hoverPopupsEnabled && hoverApplet === 'tiling' && (
              <div className="module-popover" style={getPopoverStyle(section, '230px')}>
                <div className="popover-title">Layout Mode</div>
                <div className="popover-detail">
                  <span>Click:</span>
                  <span>Toggle Horizontal / Vertical</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'network':
        if (!modules.showNetwork) return null;
        const downTraffic = parseSpeed(output.network?.traffic?.received);
        const upTraffic = parseSpeed(output.network?.traffic?.transmitted);
        return (
          <div key="network" className="applet-popover-wrapper">
            <Network 
              network={output.network} 
              onMouseEnter={() => setHoverApplet('network')}
              onMouseLeave={() => setHoverApplet(null)}
            />
            {hoverPopupsEnabled && hoverApplet === 'network' && (
              <div className="module-popover" style={getPopoverStyle(section, '240px')}>
                <div className="popover-title">Network Status</div>
                <div className="popover-detail">
                  <span>Type:</span>
                  <span>{output.network?.defaultInterface?.type || 'Online'}</span>
                </div>
                <div className="popover-detail">
                  <span>Download:</span>
                  <span>{`${downTraffic.val} ${downTraffic.unit}`}</span>
                </div>
                <div className="popover-detail">
                  <span>Upload:</span>
                  <span>{`${upTraffic.val} ${upTraffic.unit}`}</span>
                </div>
                <div className="popover-detail">
                  <span>Click:</span>
                  <span>Open Windows Network Settings</span>
                </div>
                <div className="popover-detail">
                  <span>Right-click:</span>
                  <span>Toggle Fixed / Dynamic Width</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'cpumem':
        if (!modules.showCpu && !modules.showMemory) return null;
        return (
          <div key="cpumem" className="applet-popover-wrapper">
            <div 
              className="interactive" 
              onClick={handleCpuMemClick} 
              onContextMenu={handleCpuMemContextMenu}
              onMouseEnter={() => setHoverApplet('cpumem')}
              onMouseLeave={() => setHoverApplet(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {cpuFirst ? (
                <>
                  {modules.showCpu && <CPU cpu={output.cpu} />}
                  {modules.showMemory && <Memory memory={output.memory} />}
                </>
              ) : (
                <>
                  {modules.showMemory && <Memory memory={output.memory} />}
                  {modules.showCpu && <CPU cpu={output.cpu} />}
                </>
              )}
            </div>

            {hoverPopupsEnabled && hoverApplet === 'cpumem' && (
              <div className="module-popover" style={getPopoverStyle(section, '230px')}>
                <div className="popover-title">System Resources</div>
                {modules.showCpu && (
                  <div className="popover-detail">
                    <span>CPU Usage:</span>
                    <span>{output.cpu?.usage ? Math.round(output.cpu.usage) : 0}%</span>
                  </div>
                )}
                {modules.showMemory && (
                  <div className="popover-detail">
                    <span>RAM Usage:</span>
                    <span>{output.memory?.usage ? Math.round(output.memory.usage) : 0}%</span>
                  </div>
                )}
                <div className="popover-detail">
                  <span>Click:</span>
                  <span>Open Windows Task Manager</span>
                </div>
                <div className="popover-detail">
                  <span>Right-click:</span>
                  <span>Swap CPU / RAM Order</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'battery':
        if (!modules.showBattery) return null;
        return (
          <div key="battery" className="applet-popover-wrapper">
            <Battery 
              battery={output.battery} 
              onMouseEnter={() => setHoverApplet('battery')}
              onMouseLeave={() => setHoverApplet(null)}
            />
            {hoverPopupsEnabled && hoverApplet === 'battery' && (
              <div className="module-popover" style={getPopoverStyle(section, '230px')}>
                <div className="popover-title">Battery Status</div>
                <div className="popover-detail">
                  <span>Charge:</span>
                  <span>{output.battery?.chargePercent ? `${Math.round(output.battery.chargePercent)}%` : (output.battery ? '100%' : 'Connected')}</span>
                </div>
                <div className="popover-detail">
                  <span>State:</span>
                  <span>{output.battery?.isCharging ? 'Charging' : 'Discharging'}</span>
                </div>
                <div className="popover-detail">
                  <span>Click:</span>
                  <span>Open Windows Power Settings</span>
                </div>
                <div className="popover-detail">
                  <span>Right-click:</span>
                  <span>Toggle Percentage Display</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'weather':
        if (!modules.showWeather) return null;
        const hasWeatherData = (customWeather !== null) || (output.weather !== null && typeof output.weather?.celsiusTemp === 'number');
        return (
          <div key="weather" className="applet-popover-wrapper">
            <Weather 
              weather={output.weather} 
              onOpenChange={setIsWeatherOpen}
              onMouseEnter={() => setHoverApplet('weather')}
              onMouseLeave={() => setHoverApplet(null)}
            />
            {hoverPopupsEnabled && hoverApplet === 'weather' && !isWeatherOpen && (
              <div className="module-popover" style={getPopoverStyle(section, '240px')}>
                <div className="popover-title">Weather Status</div>
                <div className="popover-detail">
                  <span>Location:</span>
                  <span>{customCityName || 'Auto (IP)'}</span>
                </div>
                <div className="popover-detail">
                  <span>Status:</span>
                  <span>{hasWeatherData ? (customWeather ? customWeather.status.replace(/_/g, ' ') : output.weather?.status?.replace(/_/g, ' ') || 'Online') : 'Offline / No Connection'}</span>
                </div>
                <div className="popover-detail">
                  <span>Temp:</span>
                  <span>
                    {hasWeatherData
                      ? (customWeather
                        ? `${Math.round(customWeather.celsiusTemp)}°C`
                        : `${Math.round(output.weather.celsiusTemp)}°C`)
                      : '-°C'}
                  </span>
                </div>
                <div className="popover-detail">
                  <span>Click:</span>
                  <span>Open Weather Website</span>
                </div>
                <div className="popover-detail">
                  <span>Right-click:</span>
                  <span>Configure Weather & City</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Left>
        {leftModules.map((key) => renderModuleByKey(key, 'left'))}
      </Left>

      <Center>
        {centerModules.map((key) => renderModuleByKey(key, 'center'))}
      </Center>

      <Right>
        {rightModules.map((key) => renderModuleByKey(key, 'right'))}
      </Right>
    </div>
  );
};

export default App;
