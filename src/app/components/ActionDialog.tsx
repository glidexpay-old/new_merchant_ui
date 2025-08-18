import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

type ActionOption = {
  label: string;
  action: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

type ActionMenuProps = {
  options: ActionOption[];
  icon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
  menuClassName?: string;
};

const slidersIcon = (
  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
    <rect x="2" y="9" width="16" height="2" rx="1" fill="currentColor"/>
    <rect x="7" y="4" width="6" height="2" rx="1" fill="currentColor"/>
    <rect x="7" y="14" width="6" height="2" rx="1" fill="currentColor"/>
  </svg>
);

const ActionMenu: React.FC<ActionMenuProps> = ({
  options,
  icon = slidersIcon,
  ariaLabel = 'Actions menu',
  className = '',
  menuClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, direction: 'down' });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Add timeout to prevent immediate closing
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  // Calculate menu position with viewport boundary checks
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 200; // Menu width
      const menuHeight = options.length * 40 + 16; // Approximate menu height
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Calculate available space below and above
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Determine if menu should open upward
      const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;

      // Calculate left position (ensure it stays within viewport)
      let left = rect.left - menuWidth + 20;
      if (left < 8) left = 8; // Minimum margin
      if (left + menuWidth > viewportWidth) left = viewportWidth - menuWidth - 8; // Maximum margin

      setPosition({
        top: openUpward ? rect.top - menuHeight + 20 : rect.bottom + 4,
        left: left,
        direction: openUpward ? 'up' : 'down'
      });
    }
  }, [isOpen, options.length]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleOptionClick(action);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={handleButtonClick}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
      >
        {icon}
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className={`fixed z-50 py-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 ${
              position.direction === 'up' ? 'mb-1' : 'mt-1'
            } ${menuClassName}`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            role="menu"
            aria-orientation="vertical"
          >
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => !option.disabled && handleOptionClick(option.action)}
                onKeyDown={(e) => !option.disabled && handleKeyDown(e, option.action)}
                className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                  option.danger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                role="menuitem"
                disabled={option.disabled}
                tabIndex={0}
              >
                {option.icon && <span className="mr-3">{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default ActionMenu;