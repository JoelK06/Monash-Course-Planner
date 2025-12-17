import { useState, useEffect } from 'react';
import { Settings, Upload, Download } from '../Icons/Icons';

export default function SettingsMenu({ 
  onExport, 
  onImport, 
  darkMode, 
  onToggleDarkMode 
}) {
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSettings && !e.target.closest('.settings-container')) {
        setShowSettings(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettings]);

  return (
    <div className="relative settings-container">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowSettings(!showSettings);
        }}
        className="flex items-center gap-2 border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition"
      >
        <Settings />
        Settings
      </button>

      {showSettings && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-48">
          <button
            onClick={() => {
              onImport();
              setShowSettings(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
          >
            <Upload />
            Import Plan
          </button>
          <button
            onClick={() => {
              onExport();
              setShowSettings(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
          >
            <Download />
            Export Plan
          </button>
          <button
            onClick={() => {
              onToggleDarkMode();
              setShowSettings(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {darkMode ? (
                <circle cx="12" cy="12" r="5"></circle>
              ) : (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              )}
            </svg>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      )}
    </div>
  );
}