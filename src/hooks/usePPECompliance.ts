
import { useState, useEffect } from 'react';
import { simulatePPECompliance } from '@/utils/ppeComplianceUtils';

interface PPEComplianceData {
  hardHat: number;
  safetyGlasses: number;
  safetyVests: number;
  protectiveGloves: number;
}

export const usePPECompliance = (isActive: boolean, updateInterval: number = 2000) => {
  const [ppeComplianceData, setPPEComplianceData] = useState<PPEComplianceData>({
    hardHat: 96,
    safetyGlasses: 100,
    safetyVests: 82,
    protectiveGloves: 78
  });

  // Store previous values for trend calculation
  const [prevValues, setPrevValues] = useState<PPEComplianceData>({
    hardHat: 96,
    safetyGlasses: 100,
    safetyVests: 82,
    protectiveGloves: 78
  });

  useEffect(() => {
    if (!isActive) return;
    
    // Store previous values every 10 seconds for trend calculation
    const trendInterval = setInterval(() => {
      setPrevValues({
        hardHat: ppeComplianceData.hardHat,
        safetyGlasses: ppeComplianceData.safetyGlasses,
        safetyVests: ppeComplianceData.safetyVests,
        protectiveGloves: ppeComplianceData.protectiveGloves
      });
    }, 10000);
    
    // Update values at the specified interval
    const dataInterval = setInterval(() => {
      setPPEComplianceData(prevState => {
        const newData = {
          hardHat: simulatePPECompliance(prevState.hardHat, 'hardHat'),
          safetyGlasses: simulatePPECompliance(prevState.safetyGlasses, 'safetyGlasses'),
          safetyVests: simulatePPECompliance(prevState.safetyVests, 'safetyVests'),
          protectiveGloves: simulatePPECompliance(prevState.protectiveGloves, 'protectiveGloves')
        };
        
        return newData;
      });
    }, updateInterval);

    return () => {
      clearInterval(dataInterval);
      clearInterval(trendInterval);
    };
  }, [isActive, updateInterval, ppeComplianceData]);

  return {
    ppeComplianceData,
    isActive
  };
};
