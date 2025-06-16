import React from "react";
import { FaSave, FaFolder, FaFolderOpen, FaUndo, FaRedo } from "react-icons/fa";
import ToolbarButton from "./ToolbarButton";
import appController from "../../../Controllers/AppController";

const Toolbar: React.FC = () => {
  const historyInfo = appController.getCommandHistoryInfo();

  return (
    <div className="bg-white/95 backdrop-blur-lg px-4 py-3 flex items-center gap-2 flex-wrap">
      {}
      <div className="flex items-center gap-1 pr-4 border-r border-gray-200/60">
        <ToolbarButton
          text="Save (Ctrl+S)"
          onClick={() => appController.saveScheme()}
          icon={<FaSave />}
        />
        <ToolbarButton
          text="Save As"
          onClick={() => appController.saveSchemeAsFile()}
          icon={<FaFolder />}
        />
        <ToolbarButton
          text="Import"
          onClick={() => appController.importSchemeFromFile()}
          icon={<FaFolderOpen />}
        />
      </div>

      {}
      <div className="flex items-center gap-1">
        <ToolbarButton
          text={`Undo (Ctrl+Z) - ${historyInfo.undoCount} actions available (Instance #${historyInfo.instanceId})`}
          onClick={() => {
            appController.undo();
          }}
          icon={<FaUndo />}
          disabled={!appController.canUndo()}
        />
        <ToolbarButton
          text={`Redo (Ctrl+Y) - ${historyInfo.redoCount} actions available (Instance #${historyInfo.instanceId})`}
          onClick={() => {
            appController.redo();
          }}
          icon={<FaRedo />}
          disabled={!appController.canRedo()}
        />
      </div>
    </div>
  );
};

export default Toolbar;
