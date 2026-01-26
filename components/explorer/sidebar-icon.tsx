interface SidebarIconProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  tooltip?: string;
}

export function SidebarIcon({
  children,
  onClick,
  active,
  tooltip,
}: SidebarIconProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full h-12 flex items-center justify-center p-4 group ${
        active ? "bg-blue-600 text-white" : "hover:bg-blue-500 hover:text-white"
      }`}
      title={tooltip}
    >
      {children}
      {tooltip && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {tooltip}
        </div>
      )}
    </button>
  );
}