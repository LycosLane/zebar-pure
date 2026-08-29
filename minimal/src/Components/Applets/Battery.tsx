import { useState } from 'react';
import { BatteryOutput, shellExec } from "zebar";

type Props = {
  battery: BatteryOutput | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const getBatteryIcon = (pct: number) => {
  if (pct > 85) return <i className="nf nf-fa-battery_4"></i>;
  if (pct > 60) return <i className="nf nf-fa-battery_3"></i>;
  if (pct > 35) return <i className="nf nf-fa-battery_2"></i>;
  if (pct > 10) return <i className="nf nf-fa-battery_1"></i>;
  return <i className="nf nf-fa-battery_0"></i>;
};

const Battery = ({ battery, onMouseEnter, onMouseLeave }: Props) => {
  const [showPercentText, setShowPercentText] = useState<boolean>(() => {
    return localStorage.getItem('battery_show_text') !== 'false';
  });

  const rawPercent = battery && typeof battery.chargePercent === 'number' ? battery.chargePercent : 100;
  const percent = Math.round(rawPercent);
  const isCharging = battery ? Boolean(battery.isCharging) : false;

  let statusClass = '';
  if (!isCharging) {
    if (percent <= 5) {
      statusClass = 'critical-battery';
    } else if (percent <= 15) {
      statusClass = 'low-battery';
    }
  }

  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    shellExec('powershell', '-Command Start-Process ms-settings:powersleep');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVal = !showPercentText;
    setShowPercentText(nextVal);
    localStorage.setItem('battery_show_text', String(nextVal));
  };

  return (
    <button 
      className={`interactive battery ${statusClass}`}
      onClick={handleLeftClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isCharging && (
        <i className="nf nf-md-power_plug charging-icon"></i>
      )}
      {getBatteryIcon(percent)}
      {showPercentText && (
        <span className="battery-percent">{percent}%</span>
      )}
    </button>
  );
};

export default Battery;
