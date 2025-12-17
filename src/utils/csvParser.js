
export const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  
  const units = lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const regex = /(?:,|^)("(?:[^"]|"")*"|[^,]*)/g;
      const values = [];
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match[1] !== undefined) {
          values.push(match[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim());
        }
      }
      
      return {
        code: values[0] || '',
        name: values[1] || '',
        level: values[2] || '',
        faculty: values[3] || '',
        semesters_2020: values[4] || '',
        semesters_2021: values[5] || '',
        semesters_2022: values[6] || '',
        semesters_2023: values[7] || '',
        semesters_2024: values[8] || '',
        semesters_2025: values[9] || '',
        semesters_2026: values[10] || ''
      };
    })
    .filter(unit => unit.code && unit.code !== 'code');
  
  return units;
};