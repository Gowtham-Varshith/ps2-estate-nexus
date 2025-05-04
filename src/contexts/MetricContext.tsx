
import React, { createContext, useContext, useState, useEffect } from 'react';
import { LandMetric } from '@/utils/metricConversions';

interface MetricContextType {
  currentMetric: LandMetric;
  setCurrentMetric: (metric: LandMetric) => void;
}

const MetricContext = createContext<MetricContextType | undefined>(undefined);

export const MetricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMetric, setCurrentMetric] = useState<LandMetric>(() => {
    // Try to get saved preference from localStorage
    const savedMetric = localStorage.getItem('preferredMetric');
    return (savedMetric as LandMetric) || 'sqft';
  });
  
  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('preferredMetric', currentMetric);
  }, [currentMetric]);
  
  return (
    <MetricContext.Provider value={{ currentMetric, setCurrentMetric }}>
      {children}
    </MetricContext.Provider>
  );
};

export const useMetric = () => {
  const context = useContext(MetricContext);
  
  if (context === undefined) {
    throw new Error('useMetric must be used within a MetricProvider');
  }
  
  return context;
};
