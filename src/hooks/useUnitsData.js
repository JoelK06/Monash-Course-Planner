import { useState, useEffect } from 'react';
import { UNITS_CSV_URL, DATA_VERSION, CACHE_DURATION, STORAGE_KEYS } from '../utils/constants';
import { parseCSV } from '../utils/csvParser';

export const useUnitsData = () => {
  const [unitsData, setUnitsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUnits = async () => {
      const cached = localStorage.getItem(STORAGE_KEYS.UNITS_DATA);
      const cacheTimestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIME);
      const cacheVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
      
      if (cacheVersion !== DATA_VERSION) {
        localStorage.removeItem(STORAGE_KEYS.UNITS_DATA);
        localStorage.removeItem(STORAGE_KEYS.CACHE_TIME);
        localStorage.removeItem(STORAGE_KEYS.DATA_VERSION);
      } else if (cached && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp) < CACHE_DURATION)) {
        setUnitsData(JSON.parse(cached));
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(UNITS_CSV_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const units = parseCSV(text);
        
        setUnitsData(units);
        localStorage.setItem(STORAGE_KEYS.UNITS_DATA, JSON.stringify(units));
        localStorage.setItem(STORAGE_KEYS.CACHE_TIME, Date.now().toString());
        localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
      } catch (err) {
        console.error('Error loading units:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadUnits();
  }, []);

  return { unitsData, loading, error };
};