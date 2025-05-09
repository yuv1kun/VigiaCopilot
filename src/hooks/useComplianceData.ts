
import { useState, useEffect } from 'react';
import { ComplianceData, generateMockComplianceData, simulateComplianceChanges } from '@/utils/complianceUtils';

/**
 * Hook that provides dynamically updating compliance data
 * to simulate a real-world offshore oil rig compliance monitoring system
 * 
 * @param isActive Whether the hook should actively update data
 * @param updateInterval Time in ms between updates
 * @returns The current compliance data state and loading status
 */
export const useComplianceData = (isActive: boolean = true, updateInterval: number = 10000) => {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial data load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // In a real implementation, this would fetch data from an API endpoint
        // Simulate API fetch delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const data = generateMockComplianceData();
        setComplianceData(data);
      } catch (error) {
        console.error('Error fetching initial compliance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Simulate dynamic updates when active
  useEffect(() => {
    if (!isActive || !complianceData) return;

    const interval = setInterval(() => {
      setComplianceData(prevData => {
        if (!prevData) return null;
        return simulateComplianceChanges(prevData);
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isActive, complianceData, updateInterval]);

  // Check for alerts and critical changes
  useEffect(() => {
    if (!complianceData) return;

    // Check for new non-compliant items or incidents
    // This would typically trigger notifications or alerts in a real system
    const hasNewCriticalItems = complianceData.complianceItems.some(item => 
      !item.isCompliant && item.lastCheckedDate === new Date().toISOString().split('T')[0]
    );

    const hasRecentIncidents = complianceData.incidents.some(incident => 
      incident.status === 'open' && 
      Math.abs(new Date().getTime() - new Date(incident.date).getTime()) < 24 * 60 * 60 * 1000
    );

    if (hasNewCriticalItems || hasRecentIncidents) {
      console.log("ALERT: New compliance issues detected!");
      // In a real implementation, this would trigger a notification
    }
  }, [complianceData]);

  return { complianceData, isLoading, isActive };
};
