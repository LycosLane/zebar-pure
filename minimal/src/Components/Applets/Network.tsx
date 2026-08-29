import { useState } from 'react';
import { NetworkOutput, shellExec } from "zebar";

type Props = {
  network: NetworkOutput | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const getNetworkIcon = (networkOutput: NetworkOutput) => {
  const signal = networkOutput.defaultGateway?.signalStrength ?? 0;
  switch (networkOutput?.defaultInterface?.type) {
    case 'ethernet':
      return <i className="nf nf-md-ethernet_cable"></i>;
    case 'wifi':
      if (signal >= 80) return <i className="nf nf-md-wifi_strength_4"></i>;
      if (signal >= 65) return <i className="nf nf-md-wifi_strength_3"></i>;
      if (signal >= 40) return <i className="nf nf-md-wifi_strength_2"></i>;
      if (signal >= 25) return <i className="nf nf-md-wifi_strength_1"></i>;
      return <i className="nf nf-md-wifi_strength_outline"></i>;
    default:
      return <i className="nf nf-md-wifi_strength_off_outline"></i>;
  }
};

export const parseSpeed = (traffic: { bytes?: number; siValue?: number; siUnit?: string } | null | undefined) => {
  if (!traffic || typeof traffic.siValue !== 'number') {
    return { val: '0', unit: 'B/s' };
  }

  const val = traffic.siValue;
  const unit = traffic.siUnit || 'B';

  if (unit === 'B' || unit === 'kB' || unit === 'KB') {
    return { val: `${Math.round(val)}`, unit: `${unit}/s` };
  } else if (unit === 'MB') {
    return { val: val.toFixed(1), unit: 'MB/s' };
  } else {
    return { val: val.toFixed(2), unit: `${unit}/s` };
  }
};

const Network = ({ network, onMouseEnter, onMouseLeave }: Props) => {
  const [isFixedWidth, setIsFixedWidth] = useState<boolean>(() => {
    return localStorage.getItem('network_fixed_width') !== 'false';
  });

  if (!network) return <></>;

  const down = parseSpeed(network.traffic?.received);
  const up = parseSpeed(network.traffic?.transmitted);

  const handleLeftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    shellExec('powershell', '-Command Start-Process ms-settings:network-status');
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVal = !isFixedWidth;
    setIsFixedWidth(nextVal);
    localStorage.setItem('network_fixed_width', String(nextVal));
  };

  return (
    <button 
      onClick={handleLeftClick}
      onContextMenu={handleContextMenu}
      className="interactive network-applet"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {getNetworkIcon(network)}
      <span className={`network-traffic ${isFixedWidth ? 'fixed-layout' : 'flexible-layout'}`}>
        <span className="speed-group">
          <span className="speed-val">{down.val}</span>
          <span className="speed-unit">{down.unit}</span>
          <span className="speed-arrow">↓</span>
        </span>
        <span className="speed-group">
          <span className="speed-val">{up.val}</span>
          <span className="speed-unit">{up.unit}</span>
          <span className="speed-arrow">↑</span>
        </span>
      </span>
    </button>
  );
};

export default Network;
