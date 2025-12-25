import { useState, useEffect } from 'react';
import { MenuDots } from '../Icons/Icons';

export default function PlanTabs({ 
  plans, 
  currentPlanId, 
  onSwitchPlan,
  onCreatePlan,
  onDeletePlan,
  onClearPlan,
  onRenamePlan
}) {
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editingPlanName, setEditingPlanName] = useState('');
  const [openPlanMenuId, setOpenPlanMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openPlanMenuId && !e.target.closest('.plan-menu-container')) {
        setOpenPlanMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openPlanMenuId]);

  const handlePlanDoubleClick = (plan) => {
    setEditingPlanId(plan.id);
    setEditingPlanName(plan.name);
  };

  const handleRenameKeyDown = (e, planId) => {
    if (e.key === 'Enter') {
      onRenamePlan(planId, editingPlanName);
      setEditingPlanId(null);
    } else if (e.key === 'Escape') {
      setEditingPlanId(null);
    }
  };

  const handleRenameBlur = (planId) => {
    onRenamePlan(planId, editingPlanName);
    setEditingPlanId(null);
  };

  return (
    <div className="flex items-center gap-2 plan-menu-container">
      {plans.map(plan => (
        <div key={plan.id} className="relative">
          {editingPlanId === plan.id ? (
            <input
              type="text"
              value={editingPlanName}
              onChange={(e) => setEditingPlanName(e.target.value)}
              onKeyDown={(e) => handleRenameKeyDown(e, plan.id)}
              onBlur={() => handleRenameBlur(plan.id)}
              className="px-4 py-2 rounded-lg border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-32"
              autoFocus
            />
          ) : (
            <div className="flex items-center">
              <button
                onClick={() => onSwitchPlan(plan.id)}
                onDoubleClick={() => handlePlanDoubleClick(plan)}
                className={`px-4 py-2 rounded-l-lg font-medium transition ${
                  plan.id === currentPlanId
                    ? 'bg-blue-600 text-white'
                    : 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50'
                }`}
                title="Double-click to rename"
              >
                {plan.name}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPlanMenuId(openPlanMenuId === plan.id ? null : plan.id);
                }}
                className={`px-2 py-3 rounded-r-lg border-l border-blue-600 font-medium transition ${
                  plan.id === currentPlanId
                    ? 'bg-blue-700 text-white'
                    : 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50'
                }`}
              >
                <MenuDots />
              </button>

              {openPlanMenuId === plan.id && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-48">
                  <button
                    onClick={() => {
                      onClearPlan(plan.id);
                      setOpenPlanMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    Clear Plan
                  </button>
                  <button
                    onClick={() => {
                      onDeletePlan(plan.id);
                      setOpenPlanMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 text-sm border-t border-gray-200"
                  >
                    Delete Plan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={onCreatePlan}
        className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition font-medium"
      >
        +
      </button>
    </div>
  );
}