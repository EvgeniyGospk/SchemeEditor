import React from "react";

interface ToolbarButtonProps {
  text: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  tooltip?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  onClick,
  icon,
  disabled = false,
  tooltip,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white/80 text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 min-w-[36px] h-9 shadow-sm";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const buttonClasses = `${baseClasses} ${disabledClasses}`.trim();

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      title={tooltip || text}
    >
      <div className="flex items-center gap-1">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="hidden lg:inline text-xs font-medium">{text}</span>
      </div>
    </button>
  );
};

export default ToolbarButton;
