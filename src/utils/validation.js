export const isUnitOffered = (unit, semesterType, semesterLabel) => {
  if (!unit) return true;
  
  const semesterYear = parseInt(semesterLabel.split(', ')[1]);
  
  let dataYear = semesterYear;
  if (semesterYear > 2026) {
    dataYear = 2026;
  } else if (semesterYear < 2020) {
    return true;
  }
  
  const hasAnyData = 
    (unit.semesters_2020 && unit.semesters_2020.trim() !== '') ||
    (unit.semesters_2021 && unit.semesters_2021.trim() !== '') ||
    (unit.semesters_2022 && unit.semesters_2022.trim() !== '') ||
    (unit.semesters_2023 && unit.semesters_2023.trim() !== '') ||
    (unit.semesters_2024 && unit.semesters_2024.trim() !== '') ||
    (unit.semesters_2025 && unit.semesters_2025.trim() !== '') ||
    (unit.semesters_2026 && unit.semesters_2026.trim() !== '');
  
  if (!hasAnyData) {
    return true;
  }
  
  const semesterKey = `semesters_${dataYear}`;
  const semesterData = unit[semesterKey];
  
  if (!semesterData || semesterData.trim() === '' || semesterData.includes('Not offered')) {
    return false;
  }
  
  const lowerData = semesterData.toLowerCase();
  
  if (semesterType === 'Summer') {
    return lowerData.includes('summer');
  }
  if (semesterType === 'Winter') {
    return lowerData.includes('winter');
  }
  if (semesterType === 'Semester 1') {
    return lowerData.includes('semester 1') || lowerData.includes('s1');
  }
  if (semesterType === 'Semester 2') {
    return lowerData.includes('semester 2') || lowerData.includes('s2');
  }
  
  return true;
};

export const hasDuplicateInSemester = (semester, unitCode) => {
  return semester.units.filter(u => u && u.code === unitCode).length > 1;
};
