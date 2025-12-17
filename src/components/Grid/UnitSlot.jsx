import { useState } from 'react';
import { X } from '../Icons/Icons';
import { FACULTY_COLORS } from '../../utils/constants';
import { isUnitOffered, hasDuplicateInSemester } from '../../utils/validation';

export default function UnitSlot({ 
  unit, 
  unitIdx, 
  semester, 
  selectedUnit,
  draggedUnit,
  setDraggedUnit,
  onDrop,
  onRemoveUnit,
  onUnitClick
}) {
  const [hoveredUnit, setHoveredUnit] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = (unit) => {
    const timeout = setTimeout(() => {
      setHoveredUnit(unit);
    }, 800);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    const timeout = setTimeout(() => {
      setHoveredUnit(null);
    }, 300);
    setHoverTimeout(timeout);
  };

  const handlePopupEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
  };

  const handlePopupLeave = () => {
    setHoveredUnit(null);
  };

  const handleDragStart = (e, unit) => {
    if (setDraggedUnit) {
      setDraggedUnit(unit);
    }
    onUnitClick(null);
  };

  const handleTouchStart = (e, unit) => {
    if (setDraggedUnit) setDraggedUnit(unit);
  };

  const handleTouchMove = (e) => {
    if (!draggedUnit) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!draggedUnit) return;
    onDrop(semester.id, unitIdx);
  };

  const handleSlotClick = () => {
    if (selectedUnit) {
      onDrop(semester.id, unitIdx);
    }
  };

  if (unit) {
    return (
      <div
        className="relative bg-white border border-gray-200 rounded-lg h-24 flex group w-full cursor-pointer"
        draggable
        onDragStart={(e) => handleDragStart(e, unit)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          console.log('Drop on unit slot');
          onDrop(semester.id, unitIdx);
        }}
        onTouchStart={(e) => handleTouchStart(e, unit)}
        onTouchMove={handleTouchMove}
        onMouseEnter={() => handleMouseEnter(unit)}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.stopPropagation();
          onUnitClick(unit);
        }}
      >
        <div
          className="w-2 rounded-l-lg mr-3 flex-shrink-0"
          style={{ backgroundColor: FACULTY_COLORS[unit.faculty] || FACULTY_COLORS["Unknown"] }}
        />
        <div className="flex-1 min-w-0 overflow-hidden pt-1">
          <div className="font-bold text-gray-800 text-sm">{unit.code}</div>
          <div className="text-xs text-gray-600 line-clamp-2">{unit.name}</div>
          {hasDuplicateInSemester(semester, unit.code) ? (
            <div className="text-xs text-orange-600 mt-1">
              ⚠️ No duplicates
            </div>
          ) : (() => {
            const semesterYear = parseInt(semester.label.split(', ')[1]);
            let dataYear = semesterYear;
            if (semesterYear > 2026) dataYear = 2026;
            else if (semesterYear < 2020) return null;
            
            const semesterKey = `semesters_${dataYear}`;
            const semesterData = unit[semesterKey];
            
            if (!semesterData || semesterData.trim() === '' || semesterData.includes('Not offered')) {
              return (
                <div className="text-xs text-red-600 mt-1 truncate" title="No offering data available">
                  ⚠️ No offering
                </div>
              );
            }
            
            if (!isUnitOffered(unit, semester.semesterType, semester.label)) {
              const semType = semester.semesterType === 'Semester 1' ? 'S1' : 
                          semester.semesterType === 'Semester 2' ? 'S2' : 
                          semester.semesterType === 'Summer' ? 'Sum A/B' : 'Winter';
              return (
                <div className="text-xs text-red-600 mt-1 truncate"
                  title={`Not offered ${semester.semesterType}`}>
                  ⚠️ Not offered {semType}
                </div>
              );
            }
            
            return null;
          })()}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemoveUnit(semester.id, unitIdx);
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0 text-gray-800"
        >
          <X />
        </button>
        
        {hoveredUnit && hoveredUnit._instanceId === unit._instanceId && (
          <div
            className="absolute z-50 bg-gray-800 text-white p-2 rounded shadow-lg text-xs top-full mt-1 left-0 whitespace-nowrap"
            onMouseEnter={handlePopupEnter}
            onMouseLeave={handlePopupLeave}
          >
            <a
              href={`https://handbook.monash.edu/2026/units/${unit.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View in Handbook →
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-xs w-full cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition ${
        selectedUnit ? 'border-blue-500' : 'border-gray-200'
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(semester.id, unitIdx)}
      onTouchEnd={handleTouchEnd}
      onClick={handleSlotClick}
    >
      {selectedUnit ? 'Click to place unit' : 'Drop unit here'}
    </div>
  );
}