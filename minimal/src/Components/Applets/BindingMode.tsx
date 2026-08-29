import { GlazeWmOutput } from "zebar";

type Props = {
  glazewm: GlazeWmOutput | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const BindingMode = ({ glazewm, onMouseEnter, onMouseLeave }: Props) => {
  if (!glazewm) return <></>;

  return (
    <>
      {glazewm.bindingModes.map((bindingMode) => (
        <button
          className="binding-mode"
          key={bindingMode.name}
          onClick={() =>
            glazewm.runCommand(
              `wm-disable-binding-mode --name ${bindingMode.name}`,
            )
          }
        >
          {bindingMode.displayName ?? bindingMode.name}
        </button>
      ))}

      <button
        className={`interactive tiling-direction nf ${glazewm.tilingDirection === 'horizontal' ? 'nf-md-swap_horizontal' : 'nf-md-swap_vertical'}`}
        onClick={() => glazewm.runCommand('toggle-tiling-direction')}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </>
  );
};

export default BindingMode;
