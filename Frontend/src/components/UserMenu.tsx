import { useState, useEffect, useRef } from "react";
import { LogOut } from "lucide-react"; 

interface User {
  id: string;
  email: string;
}

interface UserMenuProps {
  user: User;
  onSignOut: () => void;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
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

  return (
    <div className="relative" ref={menuRef}>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#171717]"
      >
        <span className="text-white text-sm">👤</span>
      </button>

      <div
        className={`
          absolute right-0 bottom-10 w-48
          bg-[#171717] border border-[#2f2f2f] rounded-lg shadow-lg
          transition-all duration-200 ease-in-out
          ${
            isOpen
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-2 pointer-events-none"
          }
        `}
      >
        <div className="p-1">
          <div className="px-3 py-2 border-b border-[#2f2f2f]">
            <p className="text-sm font-medium text-white truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={() => {
              onSignOut();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-[#2a2a2a] rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

