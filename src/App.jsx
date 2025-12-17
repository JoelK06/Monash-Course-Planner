import { useState, useEffect } from 'react';
import { useUnitsData } from './hooks/useUnitsData';
import { useDarkMode } from './hooks/useDarkMode';
import { Loader } from './components/Icons/Icons';
import LandingModal from './components/Modals/LandingModal';
import SetupModal from './components/Modals/SetupModal';
import InfoModal from './components/Modals/InfoModal';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import SemesterGrid from './components/Grid/SemesterGrid';
import { STORAGE_KEYS } from './utils/constants';

function App() {
  const { unitsData, loading, error } = useUnitsData();
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  const [showLanding, setShowLanding] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [startYear, setStartYear] = useState(2025);
  const [degreeLength, setDegreeLength] = useState(4);
  const [semesters, setSemesters] = useState([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [draggedUnit, setDraggedUnit] = useState(null);

  // Load saved plans when units data is ready
  useEffect(() => {
    if (unitsData.length === 0) return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
      if (saved) {
        const allPlans = JSON.parse(saved);
        
        // Refresh unit data for all plans
        const refreshedPlans = allPlans.map(plan => ({
          ...plan,
          semesters: plan.semesters.map(sem => ({
            ...sem,
            units: sem.units.map(unit => {
              if (!unit || unit === 'ACADEMIC_LEAVE') return unit;
              // Find fresh unit data
              const freshUnit = unitsData.find(u => u.code === unit.code);
              if (freshUnit) {
                return { ...freshUnit, _instanceId: unit._instanceId || Date.now() + Math.random() };
              }
              return unit;
            })
          }))
        }));
        
        setPlans(refreshedPlans);
        
        if (refreshedPlans.length > 0) {
          const lastPlanId = localStorage.getItem(STORAGE_KEYS.LAST_PLAN_ID);
          const planToLoad = refreshedPlans.find(p => p.id === lastPlanId) || refreshedPlans[0];
          setCurrentPlanId(planToLoad.id);
          loadPlan(planToLoad);
          setShowLanding(false);
        }
      }
    } catch (error) {
      console.error('Error loading saved plans:', error);
      localStorage.removeItem(STORAGE_KEYS.PLANS);
    }
  }, [unitsData]);

  const loadPlan = (plan) => {
    const validSemesters = plan.semesters.map(sem => ({
      ...sem,
      units: Array.isArray(sem.units) ? sem.units : [null, null, null, null]
    }));
    setStartYear(plan.startYear);
    setDegreeLength(plan.degreeLength);
    setSemesters(validSemesters);
  };

  const savePlans = (updatedPlans, planId) => {
    setPlans(updatedPlans);
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(updatedPlans));
    localStorage.setItem(STORAGE_KEYS.LAST_PLAN_ID, planId);
  };

  const handleStartNew = () => {
    setShowLanding(false);
    setShowSetup(true);
  };

  const handleSetupComplete = () => {
    const newSemesters = [];
    for (let year = 0; year < degreeLength; year++) {
      newSemesters.push({
        id: `s1-${year}`,
        label: `Semester 1, ${startYear + year}`,
        semesterType: 'Semester 1',
        units: [null, null, null, null]
      });
      newSemesters.push({
        id: `s2-${year}`,
        label: `Semester 2, ${startYear + year}`,
        semesterType: 'Semester 2',
        units: [null, null, null, null]
      });
    }
    
    const newPlan = {
      id: 'plan-' + Date.now(),
      name: `Plan ${plans.length + 1}`,
      startYear,
      degreeLength,
      semesters: newSemesters
    };
    
    const updatedPlans = [...plans, newPlan];
    savePlans(updatedPlans, newPlan.id);
    setCurrentPlanId(newPlan.id);
    setSemesters(newSemesters);
    setShowSetup(false);
  };

  const createNewPlan = () => {
    const yearInput = prompt('Enter start year for new plan:', '2025');
    if (yearInput === null) return; 
    
    const newStartYear = parseInt(yearInput);
    if (isNaN(newStartYear) || newStartYear < 2000 || newStartYear > 2100) {
      alert('Please enter a valid year between 2000 and 2100');
      return;
    }
    
    const lengthInput = prompt('Enter degree length in years:', '4');
    if (lengthInput === null) return; 
    
    const newDegreeLength = parseInt(lengthInput);
    if (isNaN(newDegreeLength) || newDegreeLength < 1 || newDegreeLength > 12) {
      alert('Please enter a valid degree length between 1 and 12 years');
      return;
    }
    
    const newPlan = {
      id: 'plan-' + Date.now(),
      name: `Plan ${plans.length + 1}`,
      startYear: newStartYear,
      degreeLength: newDegreeLength,
      semesters: []
    };
    
    const newSemesters = [];
    for (let year = 0; year < newDegreeLength; year++) {
      newSemesters.push({
        id: `s1-${year}`,
        label: `Semester 1, ${newStartYear + year}`,
        semesterType: 'Semester 1',
        units: [null, null, null, null]
      });
      newSemesters.push({
        id: `s2-${year}`,
        label: `Semester 2, ${newStartYear + year}`,
        semesterType: 'Semester 2',
        units: [null, null, null, null]
      });
    }
    newPlan.semesters = newSemesters;
    const updatedPlans = [...plans, newPlan];
    savePlans(updatedPlans, newPlan.id);
    setCurrentPlanId(newPlan.id);
    loadPlan(newPlan);
  };

  const switchPlan = (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setCurrentPlanId(planId);
      loadPlan(plan);
      localStorage.setItem(STORAGE_KEYS.LAST_PLAN_ID, planId);
    }
  };

  const deletePlan = (planId) => {
    const planToDelete = plans.find(p => p.id === planId);
    const planName = planToDelete?.name || 'this plan';
    
    if (!confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)) {
      return;
    }
    
    if (plans.length === 1) {
      setPlans([]);
      setSemesters([]);
      setCurrentPlanId(null);
      setShowLanding(true);
      localStorage.removeItem(STORAGE_KEYS.PLANS);
      localStorage.removeItem(STORAGE_KEYS.LAST_PLAN_ID);
    } else {
      const updatedPlans = plans.filter(p => p.id !== planId);
      const newCurrentPlan = currentPlanId === planId ? updatedPlans[0] : plans.find(p => p.id === currentPlanId);
      savePlans(updatedPlans, newCurrentPlan.id);
      if (currentPlanId === planId) {
        setCurrentPlanId(newCurrentPlan.id);
        loadPlan(newCurrentPlan);
      }
    }
  };

  const clearPlan = (planId) => {
    if (confirm('Clear all units from this plan? This cannot be undone.')) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        const clearedSemesters = plan.semesters.map(sem => ({
          ...sem,
          units: sem.semesterType === 'Summer' || sem.semesterType === 'Winter' 
            ? [null, null] 
            : [null, null, null, null]
        }));
        
        const updatedPlans = plans.map(p => 
          p.id === planId ? { ...p, semesters: clearedSemesters } : p
        );
        savePlans(updatedPlans, currentPlanId);
        
        if (planId === currentPlanId) {
          setSemesters(clearedSemesters);
        }
      }
    }
  };

  const exportPlan = () => {
    const currentPlan = plans.find(p => p.id === currentPlanId);
    const dataStr = JSON.stringify({ 
      startYear, 
      degreeLength, 
      semesters,
      name: currentPlan?.name || 'Course Plan'
    }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monash-${currentPlan?.name.toLowerCase().replace(/\s+/g, '-')}-${startYear}.json`;
    link.click();
  };

  const importPlan = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          const fileName = file.name.replace('.json', '').replace(/[-_]/g, ' ');
          const planName = data.name || fileName || `Imported Plan`;
          
          const newPlan = {
            id: 'plan-' + Date.now(),
            name: planName,
            startYear: data.startYear || 2025,
            degreeLength: data.degreeLength || 4,
            semesters: data.semesters || []
          };
          
          // Refresh unit data from current unitsData
          const validSemesters = newPlan.semesters.map(sem => ({
            ...sem,
            units: Array.isArray(sem.units) 
              ? sem.units.map(unit => {
                  if (!unit || unit === 'ACADEMIC_LEAVE') return unit;
                  // Find the fresh unit data
                  const freshUnit = unitsData.find(u => u.code === unit.code);
                  if (freshUnit) {
                    return { ...freshUnit, _instanceId: Date.now() + Math.random() };
                  }
                  return unit;
                })
              : [null, null, null, null],
            isAcademicLeave: sem.isAcademicLeave || false
          }));
          newPlan.semesters = validSemesters;
          
          const updatedPlans = [...plans, newPlan];
          savePlans(updatedPlans, newPlan.id);
          setCurrentPlanId(newPlan.id);
          setStartYear(newPlan.startYear);
          setDegreeLength(newPlan.degreeLength);
          setSemesters(validSemesters);
          
        } catch (error) {
          console.error('Error importing plan:', error);
          alert('Failed to import plan. Please make sure it\'s a valid course plan file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="bg-white shadow-2xl p-12 text-center">
          <div className="mx-auto mb-4"><Loader /></div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Monash Units...</h2>
          <p className="text-gray-600 mt-2">Fetching 5000+ units from database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center p-8">
        <div className="bg-white shadow-2xl p-12 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <LandingModal 
        onStartNew={handleStartNew}
      />
    );
  }

  if (showSetup) {
    return (
      <SetupModal
        startYear={startYear}
        setStartYear={setStartYear}
        degreeLength={degreeLength}
        setDegreeLength={setDegreeLength}
        onComplete={handleSetupComplete}
      />
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        unitsData={unitsData}
        selectedFaculty={selectedFaculty}
        setSelectedFaculty={setSelectedFaculty}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedUnit={selectedUnit}
        onUnitClick={setSelectedUnit}
        onDragStart={setDraggedUnit}
      />
      
      <div className="flex-1 flex flex-col bg-gray-50">
        <Header
          plans={plans}
          currentPlanId={currentPlanId}
          onSwitchPlan={switchPlan}
          onCreatePlan={createNewPlan}
          onDeletePlan={deletePlan}
          onClearPlan={clearPlan}
          onExport={exportPlan}
          onImport={importPlan}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onShowInfo={() => setShowInfoModal(true)}
        />
        
        <SemesterGrid
          semesters={semesters}
          setSemesters={setSemesters}
          selectedUnit={selectedUnit}
          draggedUnit={draggedUnit}
          setDraggedUnit={setDraggedUnit}
          onUnitClick={setSelectedUnit}
          unitsData={unitsData}
        />
      </div>

      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
    </div>
  );
}

export default App;