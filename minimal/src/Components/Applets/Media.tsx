import { useState, useRef, useEffect } from 'react';
import { GlazeWmOutput, MediaOutput, shellExec } from "zebar";

type Props = {
  media: MediaOutput | null;
  glazewm?: GlazeWmOutput | null;
  onOpenChange?: (isOpen: boolean) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const DEFAULT_TEXT_ORDER = ['title', 'artist', 'album'];
const DEFAULT_BAR_ORDER = ['text', 'prev', 'play', 'next', 'voldown', 'volup'];

const TEXT_LABELS: Record<string, string> = {
  title: 'Title',
  artist: 'Artist',
  album: 'Album Title',
};

const BAR_LABELS: Record<string, string> = {
  text: 'Media Text',
  prev: 'Previous (⏮)',
  play: 'Play / Pause (⏯)',
  next: 'Next (⏭)',
  voldown: 'Volume Down (🔉)',
  volup: 'Volume Up (🔊)',
};

const cleanText = (str: string | null | undefined): string => {
  if (!str) return '';
  return str.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
};

export const Media = ({ media, glazewm, onOpenChange, onMouseEnter, onMouseLeave }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpenState] = useState(false);

  // Text Components Visibility
  const [showTitle, setShowTitle] = useState<boolean>(() => localStorage.getItem('media_show_title') !== 'false');
  const [showArtist, setShowArtist] = useState<boolean>(() => localStorage.getItem('media_show_artist') !== 'false');
  const [showAlbum, setShowAlbum] = useState<boolean>(() => localStorage.getItem('media_show_album') === 'true');

  // Control Buttons Visibility
  const [showBtnPrev, setShowBtnPrev] = useState<boolean>(() => localStorage.getItem('media_show_btn_prev') !== 'false');
  const [showBtnPlay, setShowBtnPlay] = useState<boolean>(() => localStorage.getItem('media_show_btn_play') !== 'false');
  const [showBtnNext, setShowBtnNext] = useState<boolean>(() => localStorage.getItem('media_show_btn_next') !== 'false');
  const [showBtnVolDown, setShowBtnVolDown] = useState<boolean>(() => localStorage.getItem('media_show_btn_voldown') === 'true');
  const [showBtnVolUp, setShowBtnVolUp] = useState<boolean>(() => localStorage.getItem('media_show_btn_volup') === 'true');

  // Text Order Array
  const [textOrder, setTextOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('media_text_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TEXT_ORDER;
  });

  // Main Bar Controls Order Array
  const [barOrder, setBarOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('media_bar_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BAR_ORDER;
  });

  // Percentage of available free space (10% to 100% Max Free)
  const [mediaSpacePercent, setMediaSpacePercent] = useState<number>(() => {
    const saved = localStorage.getItem('media_space_percent');
    return saved ? parseInt(saved, 10) : 100;
  });

  const setIsOpen = (val: boolean) => {
    setIsOpenState(val);
    onOpenChange?.(val);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!media || !media.currentSession) {
    return <></>;
  }

  const handleTitleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!glazewm || !glazewm.allWindows || !media.currentSession?.sessionId) return;

    const sessionProc = media.currentSession.sessionId.toLowerCase().replace(/\.exe$/, '');

    const targetWindow = glazewm.allWindows.find((w: any) => {
      const proc = (w.processName || '').toLowerCase();
      return proc && (sessionProc.includes(proc) || proc.includes(sessionProc));
    });

    if (targetWindow) {
      glazewm.runCommand(`focus --window id=${targetWindow.id}`);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const toggleSetting = (key: string, currentVal: boolean, setter: (v: boolean) => void) => {
    const nextVal = !currentVal;
    setter(nextVal);
    localStorage.setItem(key, String(nextVal));
  };

  const updateSpacePercent = (val: number) => {
    setMediaSpacePercent(val);
    localStorage.setItem('media_space_percent', String(val));
  };

  const moveTextItem = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= textOrder.length) return;

    const nextOrder = [...textOrder];
    const [moved] = nextOrder.splice(index, 1);
    nextOrder.splice(targetIndex, 0, moved);

    setTextOrder(nextOrder);
    localStorage.setItem('media_text_order', JSON.stringify(nextOrder));
  };

  const moveBarItem = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= barOrder.length) return;

    const nextOrder = [...barOrder];
    const [moved] = nextOrder.splice(index, 1);
    nextOrder.splice(targetIndex, 0, moved);

    setBarOrder(nextOrder);
    localStorage.setItem('media_bar_order', JSON.stringify(nextOrder));
  };

  const handlePreviousClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    media.previous();
  };

  const handlePauseClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    media.togglePlayPause();
  };

  const handleNextClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    media.next();
  };

  const handleVolumeDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    shellExec('powershell', '-Command (New-Object -ComObject WScript.Shell).SendKeys([char]174)');
  };

  const handleVolumeUp = (event: React.MouseEvent) => {
    event.stopPropagation();
    shellExec('powershell', '-Command (New-Object -ComObject WScript.Shell).SendKeys([char]175)');
  };

  // Build unified single-line text string
  const session = media.currentSession;
  const activeTextParts: string[] = [];

  textOrder.forEach((key) => {
    if (key === 'title' && showTitle && session?.title) {
      const val = cleanText(session.title);
      if (val) activeTextParts.push(val);
    } else if (key === 'artist' && showArtist && session?.artist) {
      const val = cleanText(session.artist);
      if (val) activeTextParts.push(val);
    } else if (key === 'album' && showAlbum && session?.albumTitle) {
      const val = cleanText(session.albumTitle);
      if (val) activeTextParts.push(`(${val})`);
    }
  });

  const formattedMediaText = activeTextParts.join(' - ');

  // Compute dynamic max-width: 100% uses full available flex space (zero collision!), smaller % uses proportional vws
  const dynamicMaxWidthStyle: React.CSSProperties = mediaSpacePercent >= 100
    ? { maxWidth: '100%', flexShrink: 1, minWidth: 0 }
    : { maxWidth: `${Math.round(mediaSpacePercent * 0.35)}vw`, flexShrink: 1, minWidth: 0 };

  const renderBarElement = (key: string) => {
    switch (key) {
      case 'text':
        if (!formattedMediaText) return null;
        return (
          <span 
            key="text" 
            className="song-title" 
            onClick={handleTitleClick} 
            style={{ 
              cursor: 'pointer', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              display: 'inline-block',
              ...dynamicMaxWidthStyle
            }}
          >
            {formattedMediaText}
          </span>
        );

      case 'prev':
        if (!showBtnPrev) return null;
        return (
          <button key="prev" className="media-btn" onClick={handlePreviousClick} title="Previous" style={{ flexShrink: 0 }}>
            <i className="nf nf-md-skip_previous"></i>
          </button>
        );

      case 'play':
        if (!showBtnPlay) return null;
        return (
          <button key="play" className="media-btn" onClick={handlePauseClick} title={session.isPlaying ? "Pause" : "Play"} style={{ flexShrink: 0 }}>
            <i className={`nf ${session.isPlaying ? 'nf-md-pause' : 'nf-md-play'}`}></i>
          </button>
        );

      case 'next':
        if (!showBtnNext) return null;
        return (
          <button key="next" className="media-btn" onClick={handleNextClick} title="Next" style={{ flexShrink: 0 }}>
            <i className="nf nf-md-skip_next"></i>
          </button>
        );

      case 'voldown':
        if (!showBtnVolDown) return null;
        return (
          <button key="voldown" className="media-btn" onClick={handleVolumeDown} title="Volume Down" style={{ flexShrink: 0 }}>
            <i className="nf nf-md-volume_minus"></i>
          </button>
        );

      case 'volup':
        if (!showBtnVolUp) return null;
        return (
          <button key="volup" className="media-btn" onClick={handleVolumeUp} title="Volume Up" style={{ flexShrink: 0 }}>
            <i className="nf nf-md-volume_plus"></i>
          </button>
        );

      default:
        return null;
    }
  };

  const getTextVisibilityProps = (key: string): { isChecked: boolean; toggleFn: () => void } => {
    switch (key) {
      case 'title': return { isChecked: showTitle, toggleFn: () => toggleSetting('media_show_title', showTitle, setShowTitle) };
      case 'artist': return { isChecked: showArtist, toggleFn: () => toggleSetting('media_show_artist', showArtist, setShowArtist) };
      case 'album': return { isChecked: showAlbum, toggleFn: () => toggleSetting('media_show_album', showAlbum, setShowAlbum) };
      default: return { isChecked: true, toggleFn: () => {} };
    }
  };

  const getBarVisibilityProps = (key: string): { isChecked: boolean; toggleFn: () => void } => {
    switch (key) {
      case 'text': return { isChecked: showTitle || showArtist || showAlbum, toggleFn: () => toggleSetting('media_show_title', showTitle, setShowTitle) };
      case 'prev': return { isChecked: showBtnPrev, toggleFn: () => toggleSetting('media_show_btn_prev', showBtnPrev, setShowBtnPrev) };
      case 'play': return { isChecked: showBtnPlay, toggleFn: () => toggleSetting('media_show_btn_play', showBtnPlay, setShowBtnPlay) };
      case 'next': return { isChecked: showBtnNext, toggleFn: () => toggleSetting('media_show_btn_next', showBtnNext, setShowBtnNext) };
      case 'voldown': return { isChecked: showBtnVolDown, toggleFn: () => toggleSetting('media_show_btn_voldown', showBtnVolDown, setShowBtnVolDown) };
      case 'volup': return { isChecked: showBtnVolUp, toggleFn: () => toggleSetting('media_show_btn_volup', showBtnVolUp, setShowBtnVolUp) };
      default: return { isChecked: true, toggleFn: () => {} };
    }
  };

  return (
    <div className="applet-popover-wrapper" ref={wrapperRef}>
      <div 
        className="interactive media-applet"
        onContextMenu={handleContextMenu}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', maxWidth: '100%', minWidth: 0 }}
      >
        {barOrder.map((key) => renderBarElement(key))}
      </div>

      {isOpen && (
        <div className="module-popover" style={{ right: 0, width: '270px' }} onClick={(e) => e.stopPropagation()}>
          {/* Top Quick Control Bar */}
          <div className="popover-title">Quick Controls</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 4px', marginBottom: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px' }}>
            <button className="media-btn" onClick={handlePreviousClick} title="Previous">
              <i className="nf nf-md-skip_previous"></i>
            </button>
            <button className="media-btn" onClick={handlePauseClick} title={session.isPlaying ? "Pause" : "Play"}>
              <i className={`nf ${session.isPlaying ? 'nf-md-pause' : 'nf-md-play'}`}></i>
            </button>
            <button className="media-btn" onClick={handleNextClick} title="Next">
              <i className="nf nf-md-skip_next"></i>
            </button>
            <button className="media-btn" onClick={handleVolumeDown} title="Volume Down">
              <i className="nf nf-md-volume_minus"></i>
            </button>
            <button className="media-btn" onClick={handleVolumeUp} title="Volume Up">
              <i className="nf nf-md-volume_plus"></i>
            </button>
          </div>

          {/* Section 1: Text Sub-Components Order & Visibility */}
          <div className="popover-title">Text Components (Order & Visibility)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', marginBottom: '8px' }}>
            {textOrder.map((key, index) => {
              const { isChecked, toggleFn } = getTextVisibilityProps(key);

              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 4px', borderRadius: '3px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={toggleFn}
                    />
                    {TEXT_LABELS[key] || key}
                  </label>

                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      onClick={() => moveTextItem(index, 'left')}
                      disabled={index === 0}
                      style={{ background: 'none', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.2)' : 'var(--accent-color)', cursor: index === 0 ? 'default' : 'pointer', fontSize: '11px', padding: '0 2px' }}
                      title="Move Left"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => moveTextItem(index, 'right')}
                      disabled={index === textOrder.length - 1}
                      style={{ background: 'none', border: 'none', color: index === textOrder.length - 1 ? 'rgba(255,255,255,0.2)' : 'var(--accent-color)', cursor: index === textOrder.length - 1 ? 'default' : 'pointer', fontSize: '11px', padding: '0 2px' }}
                      title="Move Right"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 2: Dynamic Percentage-based Free Space Control */}
          <div className="popover-title">Available Text Space ({mediaSpacePercent >= 100 ? 'Max Free' : `${mediaSpacePercent}%`})</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginBottom: '8px' }}>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={mediaSpacePercent}
              onChange={(e) => updateSpacePercent(Number(e.target.value))}
              style={{ flex: 1, cursor: 'pointer' }}
            />
            <button
              className={`settings-chip ${mediaSpacePercent >= 100 ? 'active' : ''}`}
              onClick={() => updateSpacePercent(100)}
              style={{ padding: '2px 8px', fontSize: '11px' }}
              title="Use 100% Available Free Space (Zero Collision)"
            >
              Max Free
            </button>
          </div>

          {/* Section 3: Main Bar Controls Order & Visibility */}
          <div className="popover-title">Main Bar Controls (Order & Visibility)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            {barOrder.map((key, index) => {
              const { isChecked, toggleFn } = getBarVisibilityProps(key);

              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 4px', borderRadius: '3px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={toggleFn}
                    />
                    {BAR_LABELS[key] || key}
                  </label>

                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      onClick={() => moveBarItem(index, 'left')}
                      disabled={index === 0}
                      style={{ background: 'none', border: 'none', color: index === 0 ? 'rgba(255,255,255,0.2)' : 'var(--accent-color)', cursor: index === 0 ? 'default' : 'pointer', fontSize: '11px', padding: '0 2px' }}
                      title="Move Left"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => moveBarItem(index, 'right')}
                      disabled={index === barOrder.length - 1}
                      style={{ background: 'none', border: 'none', color: index === barOrder.length - 1 ? 'rgba(255,255,255,0.2)' : 'var(--accent-color)', cursor: index === barOrder.length - 1 ? 'default' : 'pointer', fontSize: '11px', padding: '0 2px' }}
                      title="Move Right"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
