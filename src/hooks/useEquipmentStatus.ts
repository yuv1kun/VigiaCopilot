import { useState, useEffect } from 'react';

export interface EquipmentItem {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  lastInspection: string;
  healthScore: number;
}

// Simulate random fluctuations in health scores
const simulateHealthChange = (currentScore: number): number => {
  // Small random change (-1.5 to +1)
  const change = Math.random() * 2.5 - 1.5;
  // Apply change but keep within bounds
  return Math.max(0, Math.min(100, currentScore + change));
};

// Determine status based on health score
const determineStatus = (score: number): 'operational' | 'warning' | 'critical' | 'maintenance' => {
  if (score >= 90) return 'operational';
  if (score >= 75) return 'warning';
  if (score >= 60) return 'critical';
  return 'maintenance';
};

// Generate a future date for last inspection
const generateInspectionDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const useEquipmentStatus = (isActive: boolean = true, updateInterval: number = 5000) => {
  // Initial equipment data
  const [equipment, setEquipment] = useState<EquipmentItem[]>([
    {
      id: "BOP-001",
      name: "Main Blowout Preventer",
      status: "operational",
      lastInspection: "2025-04-30",
      healthScore: 92
    },
    {
      id: "PMP-114",
      name: "Hydraulic Pump System",
      status: "warning",
      lastInspection: "2025-04-12",
      healthScore: 76
    },
    {
      id: "PIP-239",
      name: "Production Pipeline Section P-12",
      status: "warning",
      lastInspection: "2025-03-28",
      healthScore: 81
    },
    {
      id: "CTR-053",
      name: "Control Module CM-3",
      status: "operational",
      lastInspection: "2025-05-01",
      healthScore: 98
    }
  ]);

  // Simulate occasional events that affect equipment status
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setEquipment(prevEquipment => 
        prevEquipment.map(item => {
          // Simulate health score changes
          const newHealthScore = simulateHealthChange(item.healthScore);
          
          // Determine new status based on health score
          const newStatus = determineStatus(newHealthScore);
          
          // Occasionally simulate maintenance events (1% chance)
          const isInMaintenance = Math.random() < 0.01;
          
          return {
            ...item,
            healthScore: newHealthScore,
            status: isInMaintenance ? 'maintenance' : newStatus
          };
        })
      );
    }, updateInterval);

    // Simulate rare critical failures (every 2 minutes, 3% chance for a random equipment)
    const criticalInterval = setInterval(() => {
      if (Math.random() < 0.03) {
        setEquipment(prevEquipment => {
          const equipmentIndex = Math.floor(Math.random() * prevEquipment.length);
          const updatedEquipment = [...prevEquipment];
          
          updatedEquipment[equipmentIndex] = {
            ...updatedEquipment[equipmentIndex],
            healthScore: Math.max(40, updatedEquipment[equipmentIndex].healthScore - 25),
            status: 'critical'
          };
          
          return updatedEquipment;
        });
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearInterval(criticalInterval);
    };
  }, [isActive, updateInterval]);

  return { equipment, isActive };
};
