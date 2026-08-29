import { CpuOutput } from "zebar";

type Props = {
  cpu: CpuOutput | null;
};

const CPU = ({ cpu }: Props) => {
  if (cpu) {
    const usage = Math.round(cpu.usage);
    return (
      <div className="cpu">
        <i className="nf nf-oct-cpu"></i>
        <span className={`cpu-val ${cpu.usage > 85 ? 'high-usage' : ''}`}>{usage}</span>
        <span className="unit-symbol">%</span>
      </div>
    );
  } else {
    return <></>;
  }
};

export default CPU;
