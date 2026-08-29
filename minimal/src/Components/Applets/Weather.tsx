import { useState, useRef, useEffect } from 'react';
import { shellExec, WeatherOutput } from "zebar";

type Props = {
  weather: WeatherOutput | null;
  onOpenChange?: (isOpen: boolean) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const DEFAULT_WEATHER_URL = 'https://weather.com';

export const mapWmoCodeToStatus = (code: number, isDay: boolean) => {
  const daySuffix = isDay ? '_day' : '_night';
  if (code === 0) return isDay ? 'clear_day' : 'clear_night';
  if (code >= 1 && code <= 3) return isDay ? 'cloudy_day' : 'cloudy_night';
  if (code >= 51 && code <= 67) return `light_rain${daySuffix}`;
  if (code >= 71 && code <= 77) return `snow${daySuffix}`;
  if (code >= 80 && code <= 82) return `heavy_rain${daySuffix}`;
  if (code >= 85 && code <= 86) return `snow${daySuffix}`;
  if (code >= 95 && code <= 99) return `thunder${daySuffix}`;
  return isDay ? 'clear_day' : 'clear_night';
};

const getWeatherIcon = (status: string | null) => {
  if (!status) return null;
  switch (status) {
    case 'clear_day':
      return <i className="nf nf-weather-day_sunny"></i>;
    case 'clear_night':
      return <i className="nf nf-weather-night_clear"></i>;
    case 'cloudy_day':
      return <i className="nf nf-weather-day_cloudy"></i>;
    case 'cloudy_night':
      return <i className="nf nf-weather-night_alt_cloudy"></i>;
    case 'light_rain_day':
      return <i className="nf nf-weather-day_sprinkle"></i>;
    case 'light_rain_night':
      return <i className="nf nf-weather-night_alt_sprinkle"></i>;
    case 'heavy_rain_day':
      return <i className="nf nf-weather-day_rain"></i>;
    case 'heavy_rain_night':
      return <i className="nf nf-weather-night_alt_rain"></i>;
    case 'snow_day':
      return <i className="nf nf-weather-day_snow"></i>;
    case 'snow_night':
      return <i className="nf nf-weather-night_alt_snow"></i>;
    case 'thunder_day':
      return <i className="nf nf-weather-day_lightning"></i>;
    case 'thunder_night':
      return <i className="nf nf-weather-night_alt_lightning"></i>;
    default:
      return <i className="nf nf-weather-day_sunny"></i>;
  }
};

const Weather = ({ weather, onOpenChange, onMouseEnter, onMouseLeave }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpenState] = useState(false);
  const [urlInput, setUrlInput] = useState<string>(() => {
    return localStorage.getItem('weather_url') || DEFAULT_WEATHER_URL;
  });
  const [weatherUnit, setWeatherUnit] = useState<string>(() => {
    return localStorage.getItem('weather_unit') || 'auto';
  });
  const [cityNameInput, setCityNameInput] = useState<string>(() => {
    return localStorage.getItem('weather_city_input') || '';
  });
  const [latInput, setLatInput] = useState<string>(() => {
    return localStorage.getItem('weather_lat') || '';
  });
  const [lonInput, setLonInput] = useState<string>(() => {
    return localStorage.getItem('weather_lon') || '';
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Custom location weather state for instant custom city temperature forecast
  const [customWeatherData, setCustomWeatherData] = useState<{ celsiusTemp: number; fahrenheitTemp: number; status: string } | null>(null);

  const setIsOpen = (val: boolean) => {
    setIsOpenState(val);
    onOpenChange?.(val);
  };

  const fetchCustomWeather = async (lat: string, lon: string) => {
    if (!lat || !lon) {
      setCustomWeatherData(null);
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
        setCustomWeatherData({ celsiusTemp: cTemp, fahrenheitTemp: fTemp, status });
      }
    } catch (e) {
      console.warn('Failed to fetch custom weather forecast:', e);
      setCustomWeatherData(null);
    }
  };

  useEffect(() => {
    const lat = localStorage.getItem('weather_lat');
    const lon = localStorage.getItem('weather_lon');
    if (lat && lon) {
      fetchCustomWeather(lat, lon);
    } else {
      setCustomWeatherData(null);
    }
  }, []);

  const cancelAndClosePopover = () => {
    setUrlInput(localStorage.getItem('weather_url') || DEFAULT_WEATHER_URL);
    setCityNameInput(localStorage.getItem('weather_city_input') || '');
    setLatInput(localStorage.getItem('weather_lat') || '');
    setLonInput(localStorage.getItem('weather_lon') || '');
    setErrorMessage('');
    setSuccessMessage('');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleWeatherUrlChange = () => {
      setUrlInput(localStorage.getItem('weather_url') || DEFAULT_WEATHER_URL);
      setCityNameInput(localStorage.getItem('weather_city_input') || '');
      setLatInput(localStorage.getItem('weather_lat') || '');
      setLonInput(localStorage.getItem('weather_lon') || '');

      const lat = localStorage.getItem('weather_lat');
      const lon = localStorage.getItem('weather_lon');
      if (lat && lon) {
        fetchCustomWeather(lat, lon);
      } else {
        setCustomWeatherData(null);
      }
    };
    window.addEventListener('storage_weather_url_changed', handleWeatherUrlChange);
    return () => window.removeEventListener('storage_weather_url_changed', handleWeatherUrlChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        cancelAndClosePopover();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const hasValidData = (customWeatherData !== null) || (weather !== null && typeof weather?.celsiusTemp === 'number');

  const activeCelsius = customWeatherData ? customWeatherData.celsiusTemp : (weather?.celsiusTemp ?? null);
  const activeFahrenheit = customWeatherData ? customWeatherData.fahrenheitTemp : (weather?.fahrenheitTemp ?? null);
  const activeStatus = customWeatherData ? customWeatherData.status : (weather?.status ?? null);

  const getDisplayedTemp = () => {
    let unit = weatherUnit;
    if (unit === 'auto') {
      const loc = localStorage.getItem('date_locale') || (typeof navigator !== 'undefined' ? navigator.language : '');
      unit = (loc && (loc.toLowerCase() === 'en-us' || loc.toLowerCase().endsWith('-us'))) ? 'fahrenheit' : 'celsius';
    }

    if (!hasValidData || activeCelsius === null || activeFahrenheit === null) {
      return unit === 'fahrenheit' ? '-°F' : '-°C';
    }

    if (unit === 'fahrenheit') {
      return `${Math.round(activeFahrenheit)}°F`;
    }
    return `${Math.round(activeCelsius)}°C`;
  };

  const updateUnit = (unit: string) => {
    setWeatherUnit(unit);
    localStorage.setItem('weather_unit', unit);
  };

  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const storedUrl = localStorage.getItem('weather_url') || DEFAULT_WEATHER_URL;
    shellExec('powershell', `-Command Start-Process "${storedUrl}"`).catch(() => {
      window.open(storedUrl, '_blank');
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) {
      cancelAndClosePopover();
    } else {
      setUrlInput(localStorage.getItem('weather_url') || DEFAULT_WEATHER_URL);
      setCityNameInput(localStorage.getItem('weather_city_input') || '');
      setLatInput(localStorage.getItem('weather_lat') || '');
      setLonInput(localStorage.getItem('weather_lon') || '');
      setErrorMessage('');
      setSuccessMessage('');
      setIsOpen(true);
    }
  };

  const handleCheckCity = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage('');
    setSuccessMessage('');
    const cityName = cityNameInput.trim();
    if (!cityName) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data && data.results && data.results.length > 0) {
        const first = data.results[0];
        const formattedName = `${first.name}${first.country ? `, ${first.country}` : ''}`;
        const latStr = String(first.latitude);
        const lonStr = String(first.longitude);

        setCityNameInput(formattedName);
        setLatInput(latStr);
        setLonInput(lonStr);
        setSuccessMessage(`✓ Verified: ${formattedName}`);
        setIsSearching(false);
      } else {
        setIsSearching(false);
        setErrorMessage('City not found. Try a larger nearby city or enter coordinates manually.');
      }
    } catch (err) {
      setIsSearching(false);
      setErrorMessage('⚠️ No internet connection or geocoding service unreachable. You can enter Latitude & Longitude manually.');
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage('');
    setSuccessMessage('');
    const finalUrl = urlInput.trim() || DEFAULT_WEATHER_URL;
    localStorage.setItem('weather_url', finalUrl);
    setUrlInput(finalUrl);

    if (latInput.trim() && lonInput.trim()) {
      const latNum = parseFloat(latInput.trim());
      const lonNum = parseFloat(lonInput.trim());
      if (isNaN(latNum) || isNaN(lonNum)) {
        setErrorMessage('Invalid coordinates.');
        return;
      }
      localStorage.setItem('weather_lat', String(latNum));
      localStorage.setItem('weather_lon', String(lonNum));
      localStorage.setItem('weather_city_input', cityNameInput.trim());
      await fetchCustomWeather(String(latNum), String(lonNum));
      window.dispatchEvent(new Event('storage_weather_url_changed'));
      setIsOpen(false);
      return;
    }

    const cityName = cityNameInput.trim();
    if (cityName && cityName.toLowerCase() !== 'auto') {
      setIsSearching(true);
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data && data.results && data.results.length > 0) {
          const first = data.results[0];
          const latStr = String(first.latitude);
          const lonStr = String(first.longitude);
          const formattedName = `${first.name}${first.country ? `, ${first.country}` : ''}`;

          localStorage.setItem('weather_lat', latStr);
          localStorage.setItem('weather_lon', lonStr);
          localStorage.setItem('weather_city_input', formattedName);
          await fetchCustomWeather(latStr, lonStr);
          window.dispatchEvent(new Event('storage_weather_url_changed'));
          setIsSearching(false);
          setIsOpen(false);
          return;
        } else {
          setIsSearching(false);
          setErrorMessage('City not found. Try entering Latitude & Longitude manually.');
          return;
        }
      } catch (err) {
        setIsSearching(false);
        setErrorMessage('⚠️ No internet connection or geocoding service unreachable. You can enter Latitude & Longitude manually.');
        return;
      }
    } else {
      localStorage.removeItem('weather_lat');
      localStorage.removeItem('weather_lon');
      localStorage.setItem('weather_city_input', '');
      setLatInput('');
      setLonInput('');
      setCustomWeatherData(null);
      window.dispatchEvent(new Event('storage_weather_url_changed'));
      setIsOpen(false);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem('weather_url', DEFAULT_WEATHER_URL);
    localStorage.removeItem('weather_lat');
    localStorage.removeItem('weather_lon');
    localStorage.setItem('weather_city_input', '');
    setUrlInput(DEFAULT_WEATHER_URL);
    setCityNameInput('');
    setLatInput('');
    setLonInput('');
    setErrorMessage('');
    setSuccessMessage('');
    setCustomWeatherData(null);
    setWeatherUnit('auto');
    localStorage.setItem('weather_unit', 'auto');
    window.dispatchEvent(new Event('storage_weather_url_changed'));
  };

  return (
    <div className="applet-popover-wrapper" ref={wrapperRef}>
      <button 
        className="interactive weather"
        onClick={handleLeftClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {hasValidData ? getWeatherIcon(activeStatus) : null}
        {getDisplayedTemp()}
      </button>

      {isOpen && (
        <div className="module-popover weather-popover" style={{ width: '270px' }} onClick={(e) => e.stopPropagation()}>
          {/* Temperature Unit at top */}
          <div className="popover-title">Temperature Unit</div>
          <div className="settings-tokens" style={{ marginBottom: '6px' }}>
            <button className={`settings-chip ${weatherUnit === 'auto' ? 'active' : ''}`} onClick={() => updateUnit('auto')}>
              Auto
            </button>
            <button className={`settings-chip ${weatherUnit === 'celsius' ? 'active' : ''}`} onClick={() => updateUnit('celsius')}>
              °C
            </button>
            <button className={`settings-chip ${weatherUnit === 'fahrenheit' ? 'active' : ''}`} onClick={() => updateUnit('fahrenheit')}>
              °F
            </button>
          </div>

          {/* City / Location Search with Map Search Icon Button */}
          <div className="popover-title">City / Location</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              className="popover-input"
              style={{ flex: 1 }}
              value={cityNameInput}
              onChange={(e) => setCityNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCheckCity(e as any); }}
              placeholder="e.g. Berlin, Tokyo, London (empty = Auto IP)"
            />
            <button 
              className="btn-action btn-save" 
              onClick={handleCheckCity} 
              disabled={isSearching}
              style={{ height: '24px', width: '28px', padding: 0 }}
              title="Verify City & Auto-Fill Coordinates"
            >
              {isSearching ? '...' : <i className="nf nf-md-map_search"></i>}
            </button>
          </div>

          {successMessage && (
            <div style={{ color: '#34d399', fontSize: '11px', lineHeight: '1.2', marginTop: '4px', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 6px', borderRadius: '3px' }}>
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div style={{ color: '#ff4d4d', fontSize: '11px', lineHeight: '1.2', marginTop: '4px', background: 'rgba(255, 77, 77, 0.1)', padding: '4px 6px', borderRadius: '3px' }}>
              {errorMessage}
            </div>
          )}

          {/* Optional Manual Coordinates */}
          <div className="popover-title" style={{ marginTop: '6px' }}>Coordinates (Lat / Lon)</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
            <input
              type="text"
              className="popover-input"
              style={{ flex: 1 }}
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              placeholder="Lat (52.52)"
            />
            <input
              type="text"
              className="popover-input"
              style={{ flex: 1 }}
              value={lonInput}
              onChange={(e) => setLonInput(e.target.value)}
              placeholder="Lon (13.41)"
            />
          </div>

          {/* Weather Web URL section */}
          <div className="popover-title" style={{ marginTop: '6px' }}>Weather Web URL</div>
          <input
            type="text"
            className="popover-input"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://weather.com"
          />

          <div className="popover-actions" style={{ marginTop: '8px' }}>
            <button className="btn-action btn-reset" onClick={handleReset} title="Reset to Auto IP Location">
              <i className="nf nf-fa-minus_square"></i>
            </button>
            <button className="btn-action btn-save" onClick={handleSave} disabled={isSearching} title="Save & Close">
              {isSearching ? '...' : <i className="nf nf-fa-check_square"></i>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
