import { MemoryOutput } from "zebar";

type Props = {
  memory: MemoryOutput | null;
};

const Memory = ({ memory }: Props) => {
  if (memory) {
    const usage = Math.round(memory.usage);
    return (
      <div className="memory">
        <i className="nf nf-fae-chip"></i>
        <span className="memory-val">{usage}</span>
        <span className="unit-symbol">%</span>
      </div>
    );
  } else {
    return <></>;
  }
};

export default Memory;
