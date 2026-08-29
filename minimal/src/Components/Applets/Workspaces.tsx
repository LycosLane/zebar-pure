import { GlazeWmOutput } from "zebar";

type Props = {
  glazewm: GlazeWmOutput | null;
  onContextMenu?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const Workspaces = ({ glazewm, onContextMenu, onMouseEnter, onMouseLeave }: Props) => {
  if (!glazewm) return <></>;

  return (
    <div 
      className="workspaces-wrapper" 
      style={{ display: 'inline-flex', alignItems: 'center' }}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {glazewm.currentWorkspaces.map((workspace) => (
        <button
          className={`workspace ${workspace.hasFocus ? 'focused' : ''} ${workspace.isDisplayed ? 'displayed' : ''}`}
          key={workspace.name}
          onClick={() =>
            glazewm.runCommand(`focus --workspace ${workspace.name}`)
          }
        >
          {workspace.displayName ?? workspace.name}
        </button>
      ))}
    </div>
  );
};

export default Workspaces;
