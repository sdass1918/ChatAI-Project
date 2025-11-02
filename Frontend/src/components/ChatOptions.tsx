import { useState, useEffect, useRef } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react"; // npm install lucide-react

interface ChatOptionsMenuProps {
  onDelete: () => void;
}

export function ChatOptionsMenu({ onDelete }: ChatOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsOpen(!isOpen);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleOpenMenu}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1 rounded-full"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <div
        className={`
          absolute right-0 top-full mt-1 w-40
          bg-[#171717] border border-[#2f2f2f] rounded-lg shadow-lg
          transition-all duration-200 ease-in-out z-10
          ${
            isOpen
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform -translate-y-2 pointer-events-none"
          }
        `}
      >
        <div className="p-1">
          <button
            onClick={handleDeleteClick}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-[#2a2a2a] rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
