import { useState, useMemo } from 'react';
import { Search } from '../Icons/Icons';
import { FACULTY_COLORS } from '../../utils/constants';

export default function Sidebar({ 
  unitsData, 
  selectedFaculty, 
  setSelectedFaculty,
  searchQuery,
  setSearchQuery,
  selectedUnit,
  onUnitClick,
  onDragStart,
  onTouchStart 
}) {
  const faculties = useMemo(() => {
    return [...new Set(unitsData.map(u => u.faculty))].filter(Boolean).sort();
  }, [unitsData]);

  const filteredUnits = useMemo(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = [];
      const seen = new Set();
      
      // Exact and prefix matches first
      for (const u of unitsData) {
        if (seen.has(u.code)) continue;
        const code = u.code.toLowerCase();
        const name = u.name.toLowerCase();
        
        if (code === query || code.startsWith(query) || name.startsWith(query)) {
          results.push(u);
          seen.add(u.code);
        }
      }
      
      // Then substring matches
      if (results.length < 100) {
        for (const u of unitsData) {
          if (seen.has(u.code)) continue;
          const code = u.code.toLowerCase();
          const name = u.name.toLowerCase();
          
          if (code.includes(query) || name.includes(query)) {
            results.push(u);
            seen.add(u.code);
            if (results.length >= 100) break;
          }
        }
      }
      
      return results;
    }
    
    if (selectedFaculty) {
      return unitsData.filter(u => u.faculty === selectedFaculty);
    }
    
    return [];
  }, [unitsData, searchQuery, selectedFaculty]);

  const handleUnitClick = (unit) => {
    onUnitClick(selectedUnit?.code === unit.code ? null : unit);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Unit Library</h2>
        <div className="relative">
          <div className="absolute left-3 top-3 text-gray-400">
            <Search />
          </div>
          <input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedFaculty(null);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {!searchQuery && !selectedFaculty && (
          <div className="space-y-2">
            {faculties.map(faculty => (
              <button
                key={faculty}
                onClick={() => setSelectedFaculty(faculty)}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 font-medium text-gray-700 transition"
              >
                {faculty}
              </button>
            ))}
          </div>
        )}
        
        {(searchQuery || selectedFaculty) && (
          <div>
            {selectedFaculty && (
              <button
                onClick={() => setSelectedFaculty(null)}
                className="mb-4 text-sm text-blue-600 hover:text-blue-800"
              >
                ← Back to faculties
              </button>
            )}
            <div className="space-y-2">
              {filteredUnits.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No units found
                </div>
              ) : (
                filteredUnits.map((unit, index) => (
                  <div
                    key={`${unit.code}-${index}`}
                    draggable
                    onDragStart={() => onDragStart(unit)}
                    onTouchStart={(e) => onTouchStart && onTouchStart(e, unit)}
                    onClick={() => handleUnitClick(unit)}
                    className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition flex touch-none ${
                      selectedUnit?.code === unit.code
                        ? 'border-blue-500 border-2 shadow-lg'
                        : 'border-gray-200'
                    }`}
                  >
                    <div
                      className="w-2 rounded-l-lg mr-3"
                      style={{ 
                        backgroundColor: FACULTY_COLORS[unit.faculty] || FACULTY_COLORS["Unknown"] 
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{unit.code}</div>
                      <div className="text-sm text-gray-600">{unit.name}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}