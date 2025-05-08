
import { useState, useEffect } from 'react';
import { simulatePPECompliance, determineComplianceStatus, calculateComplianceTrend, Trend } from '@/utils/ppeComplianceUtils';

interface PPEComplianceData {
  hardHat: number;
  safetyGlasses: number;
  safetyVests: number;
  protectiveGloves: number;
}

interface ComplianceTrends {
  hardHat: Trend;
  safetyGlasses: Trend;
  safetyVests: Trend;
  protectiveGloves: Trend;
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

  // Status for each PPE item
  const [complianceStatus, setComplianceStatus] = useState({
    hardHat: determineComplianceStatus(96),
    safetyGlasses: determineComplianceStatus(100),
    safetyVests: determineComplianceStatus(82),
    protectiveGloves: determineComplianceStatus(78)
  });

  // Trends for each PPE item
  const [complianceTrends, setComplianceTrends] = useState<ComplianceTrends>({
    hardHat: { value: 0, direction: 'flat' },
    safetyGlasses: { value: 0, direction: 'flat' },
    safetyVests: { value: 0, direction: 'flat' },
    protectiveGloves: { value: 0, direction: 'flat' }
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
        
        // Calculate trends
        const trends: ComplianceTrends = {
          hardHat: calculateComplianceTrend(newData.hardHat, prevValues.hardHat),
          safetyGlasses: calculateComplianceTrend(newData.safetyGlasses, prevValues.safetyGlasses),
          safetyVests: calculateComplianceTrend(newData.safetyVests, prevValues.safetyVests),
          protectiveGloves: calculateComplianceTrend(newData.protectiveGloves, prevValues.protectiveGloves)
        };
        setComplianceTrends(trends);
        
        // Update status
        setComplianceStatus({
          hardHat: determineComplianceStatus(newData.hardHat),
          safetyGlasses: determineComplianceStatus(newData.safetyGlasses),
          safetyVests: determineComplianceStatus(newData.safetyVests),
          protectiveGloves: determineComplianceStatus(newData.protectiveGloves)
        });
        
        return newData;
      });
    }, updateInterval);

    return () => {
      clearInterval(dataInterval);
      clearInterval(trendInterval);
    };
  }, [isActive, updateInterval, prevValues]);

  return {
    ppeComplianceData,
    complianceStatus,
    complianceTrends,
    isActive
  };
};
