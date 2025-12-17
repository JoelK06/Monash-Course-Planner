import { useState, useEffect } from 'react';
import { Plus } from '../Icons/Icons';
import SemesterRow from './SemesterRow';

export default function SemesterGrid({ 
  semesters, 
  setSemesters, 
  selectedUnit, 
  draggedUnit,
  setDraggedUnit,
  onUnitClick,
  unitsData 
}) {
  const [contextMenuSemester, setContextMenuSemester] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuSemester && !e.target.closest('.semester-menu-container')) {
        setContextMenuSemester(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenuSemester]);

  const addSemester = () => {
    const lastSem = semesters[semesters.length - 1];
    const lastYear = parseInt(lastSem.label.split(', ')[1]);
    const isS1 = lastSem.semesterType === 'Semester 1';
    const newYear = isS1 ? lastYear : lastYear + 1;
    const newSemType = isS1 ? 'Semester 2' : 'Semester 1';
    
    setSemesters([...semesters, {
      id: `${newSemType.toLowerCase().replace(' ', '')}-${Date.now()}`,
      label: `${newSemType}, ${newYear}`,
      semesterType: newSemType,
      units: [null, null, null, null]
    }]);
  };

  const handleDrop = (semesterId, unitIndex) => {
    const unitToPlace = draggedUnit || selectedUnit;
    if (!unitToPlace) return;
                
    const newSemesters = [...semesters];
    const semIndex = newSemesters.findIndex(s => s.id === semesterId);
    
    let fromSemIndex = -1;
    let fromUnitIndex = -1;
  
    const isFromGrid = unitToPlace._instanceId !== undefined;
    
    if (isFromGrid) {
      // Find where the unit is coming from
      for (let i = 0; i < newSemesters.length; i++) {
        const foundIndex = newSemesters[i].units.findIndex(u => 
          u && u._instanceId === unitToPlace._instanceId
        );
        if (foundIndex !== -1) {
          fromSemIndex = i;
          fromUnitIndex = foundIndex;
          break;
        }
      }
      
      // Don't do anything if dropping in the same spot
      if (fromSemIndex === semIndex && fromUnitIndex === unitIndex) {
        if (setDraggedUnit) setDraggedUnit(null);
        return;
      }
      
      // Swap the units
      const temp = newSemesters[semIndex].units[unitIndex];
      newSemesters[semIndex].units[unitIndex] = unitToPlace;
      
      if (fromSemIndex !== -1 && fromUnitIndex !== -1) {
        newSemesters[fromSemIndex].units[fromUnitIndex] = temp;
      }
    } else {
      // Adding from sidebar - check for duplicates
      const duplicateIndex = newSemesters[semIndex].units.findIndex(
        (u, idx) => u && u.code === unitToPlace.code && idx !== unitIndex
      );
      
      if (duplicateIndex !== -1) {
        newSemesters[semIndex].units[duplicateIndex] = null;
      }
      
      const newUnit = { ...unitToPlace, _instanceId: Date.now() + Math.random() };
      newSemesters[semIndex].units[unitIndex] = newUnit;
    }
    
    setSemesters(newSemesters);
    onUnitClick(null);
    if (setDraggedUnit) setDraggedUnit(null);
  };

  const removeUnit = (semesterId, unitIndex) => {
    const newSemesters = [...semesters];
    const semIndex = newSemesters.findIndex(s => s.id === semesterId);
    newSemesters[semIndex].units[unitIndex] = null;
    setSemesters(newSemesters);
  };

  return (
    <div className="flex-1 overflow-auto p-8 relative">
      <div className="bg-white shadow-lg overflow-hidden">
        <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left font-semibold text-gray-800" style={{width: '180px'}}>
                Semester
              </th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-800">
                Units
              </th>
            </tr>
          </thead>
          <tbody>
            {semesters.map((semester, semIdx) => (
              <SemesterRow
                key={semester.id}
                semester={semester}
                semIdx={semIdx}
                isLastSemester={semIdx === semesters.length - 1}
                selectedUnit={selectedUnit}
                draggedUnit={draggedUnit}
                setDraggedUnit={setDraggedUnit}
                contextMenuSemester={contextMenuSemester}
                setContextMenuSemester={setContextMenuSemester}
                onDrop={handleDrop}
                onRemoveUnit={removeUnit}
                onUnitClick={onUnitClick}
                setSemesters={setSemesters}
                semesters={semesters}
              />
            ))}    
          </tbody>
        </table>
        
        <div className="p-4 bg-gray-50 border-t border-gray-300 flex justify-center">
          <button
            onClick={addSemester}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 bg-white px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <Plus />
            Add Semester
          </button>
        </div>
      </div>
    </div>
  );
}