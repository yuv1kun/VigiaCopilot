
import { useState, useEffect } from 'react';

// Maintenance item type definition
export interface MaintenanceItem {
  id: string;
  title: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // in hours
  equipmentId: string;
  createdAt: Date;
}

// Generate a random date within a range from now
const generateRandomDate = (minDays: number, maxDays: number): string => {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const resultDate = new Date(today);
  resultDate.setDate(today.getDate() + randomDays);
  
  return resultDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate initial maintenance items
const generateInitialMaintenanceItems = (): MaintenanceItem[] => {
  const maintenanceTasks = [
    { title: 'BOP Pressure System Inspection', priority: 'high', estimatedTime: 3, equipmentId: 'bop-001' },
    { title: 'Hydraulic Line Replacement', priority: 'medium', estimatedTime: 5, equipmentId: 'hyd-002' },
    { title: 'Seal Integrity Check', priority: 'medium', estimatedTime: 2, equipmentId: 'seal-003' },
    { title: 'Wellhead Temperature Calibration', priority: 'high', estimatedTime: 4, equipmentId: 'well-004' },
    { title: 'Gas Detection System Check', priority: 'high', estimatedTime: 3, equipmentId: 'gas-005' },
    { title: 'Pipe Corrosion Inspection', priority: 'medium', estimatedTime: 6, equipmentId: 'pipe-006' },
    { title: 'Emergency Shutdown Test', priority: 'high', estimatedTime: 2, equipmentId: 'esd-007' },
    { title: 'Drilling Equipment Lubrication', priority: 'low', estimatedTime: 4, equipmentId: 'drill-008' },
    { title: 'Control System Firmware Update', priority: 'medium', estimatedTime: 8, equipmentId: 'ctrl-009' },
    { title: 'Power Generator Maintenance', priority: 'high', estimatedTime: 6, equipmentId: 'power-010' },
    { title: 'Mud Pump Inspection', priority: 'medium', estimatedTime: 3, equipmentId: 'mud-011' },
    { title: 'Derrick Structural Inspection', priority: 'high', estimatedTime: 5, equipmentId: 'drk-012' },
  ];

  // Create completed items (in the past)
  const completedItems = maintenanceTasks.slice(3, 6).map((task, index) => ({
    id: `maint-${index + 1}-completed`,
    ...task,
    date: generateRandomDate(-14, -1),
    status: 'completed' as const,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
  }));

  // Create scheduled items (in the future)
  const scheduledItems = maintenanceTasks.slice(0, 3).map((task, index) => ({
    id: `maint-${index + 7}-scheduled`,
    ...task,
    date: generateRandomDate(1, 14),
    status: 'scheduled' as const,
    createdAt: new Date()
  }));

  // Create in-progress items (today/tomorrow)
  const inProgressItems = maintenanceTasks.slice(6, 8).map((task, index) => ({
    id: `maint-${index + 10}-progress`,
    ...task,
    date: generateRandomDate(-1, 1),
    status: 'in-progress' as const,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  }));

  // Create overdue items
  const overdueItems = maintenanceTasks.slice(8, 10).map((task, index) => ({
    id: `maint-${index + 12}-overdue`,
    ...task,
    date: generateRandomDate(-10, -3),
    status: 'overdue' as const,
    createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
  }));

  return [...scheduledItems, ...inProgressItems, ...overdueItems, ...completedItems];
};

// Random maintenance events that can occur during simulation
const maintenanceEvents = [
  { type: 'complete', probability: 0.1 }, // Maintenance task completed
  { type: 'delay', probability: 0.05 },   // Task delayed
  { type: 'new', probability: 0.08 },     // New maintenance task added
  { type: 'start', probability: 0.07 },   // Task started
  { type: 'emergency', probability: 0.02 } // Emergency maintenance needed
];

export const useMaintenanceSchedule = (updateInterval = 10000) => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(generateInitialMaintenanceItems);
  const [isSimulating, setIsSimulating] = useState(true);
  const [lastEvent, setLastEvent] = useState<{type: string, item?: MaintenanceItem} | null>(null);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setMaintenanceItems(currentItems => {
        // Clone the current items to modify
        let newItems = [...currentItems];
        let eventOccurred = false;
        let eventType = "";
        let affectedItem: MaintenanceItem | undefined;

        // Process random maintenance events based on probabilities
        for (const event of maintenanceEvents) {
          if (Math.random() < event.probability) {
            eventOccurred = true;
            eventType = event.type;

            switch (event.type) {
              case 'complete': {
                // Complete a scheduled or in-progress task
                const eligibleItems = newItems.filter(item => 
                  item.status === 'scheduled' || item.status === 'in-progress' || item.status === 'overdue');
                
                if (eligibleItems.length > 0) {
                  const itemToComplete = eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
                  affectedItem = {...itemToComplete};
                  
                  // Update the status to completed
                  newItems = newItems.map(item => 
                    item.id === itemToComplete.id 
                      ? {...item, status: 'completed' as const} 
                      : item
                  );
                }
                break;
              }
              
              case 'delay': {
                // Delay a scheduled task
                const scheduledItems = newItems.filter(item => item.status === 'scheduled');
                
                if (scheduledItems.length > 0) {
                  const itemToDelay = scheduledItems[Math.floor(Math.random() * scheduledItems.length)];
                  affectedItem = {...itemToDelay};
                  
                  // Push the date forward by 2-7 days
                  const itemDate = new Date(itemToDelay.date);
                  itemDate.setDate(itemDate.getDate() + Math.floor(Math.random() * 5) + 2);
                  const newDate = itemDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                  
                  newItems = newItems.map(item => 
                    item.id === itemToDelay.id 
                      ? {...item, date: newDate} 
                      : item
                  );
                }
                break;
              }
              
              case 'new': {
                // Add a new maintenance task
                const maintenanceTasks = [
                  { title: 'Pressure Relief Valve Inspection', priority: 'high', estimatedTime: 2, equipmentId: 'valve-013' },
                  { title: 'Electrical System Check', priority: 'medium', estimatedTime: 4, equipmentId: 'elec-014' },
                  { title: 'Cooling System Maintenance', priority: 'low', estimatedTime: 3, equipmentId: 'cool-015' },
                  { title: 'Safety Sensor Calibration', priority: 'high', estimatedTime: 2, equipmentId: 'sens-016' },
                  { title: 'Winch Cable Inspection', priority: 'medium', estimatedTime: 4, equipmentId: 'winch-017' },
                ];
                
                const newTask = maintenanceTasks[Math.floor(Math.random() * maintenanceTasks.length)];
                const newId = `maint-${Date.now()}`;
                const newItem: MaintenanceItem = {
                  id: newId,
                  ...newTask,
                  date: generateRandomDate(1, 10),
                  status: 'scheduled',
                  createdAt: new Date()
                };
                
                affectedItem = newItem;
                newItems = [...newItems, newItem];
                break;
              }
              
              case 'start': {
                // Start a scheduled maintenance task
                const scheduledItems = newItems.filter(item => item.status === 'scheduled');
                
                if (scheduledItems.length > 0) {
                  const itemToStart = scheduledItems[Math.floor(Math.random() * scheduledItems.length)];
                  affectedItem = {...itemToStart};
                  
                  newItems = newItems.map(item => 
                    item.id === itemToStart.id 
                      ? {...item, status: 'in-progress' as const} 
                      : item
                  );
                }
                break;
              }
              
              case 'emergency': {
                // Add an emergency maintenance task (high priority, immediate)
                const emergencyTasks = [
                  { title: 'Critical Valve Failure Repair', priority: 'high', estimatedTime: 4, equipmentId: 'valve-emg-1' },
                  { title: 'Emergency Pressure System Fix', priority: 'high', estimatedTime: 3, equipmentId: 'pres-emg-2' },
                  { title: 'Power System Failure Recovery', priority: 'high', estimatedTime: 6, equipmentId: 'power-emg-3' },
                ];
                
                const emergencyTask = emergencyTasks[Math.floor(Math.random() * emergencyTasks.length)];
                const newId = `emg-${Date.now()}`;
                const today = new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                
                const newItem: MaintenanceItem = {
                  id: newId,
                  ...emergencyTask,
                  date: today,
                  status: 'scheduled',
                  createdAt: new Date()
                };
                
                affectedItem = newItem;
                newItems = [...newItems, newItem];
                break;
              }
            }
            
            // Only process one event per interval
            break;
          }
        }
        
        // Update real-time status based on dates
        const today = new Date();
        newItems = newItems.map(item => {
          const itemDate = new Date(item.date);
          
          // Mark items as overdue if their date is in the past and they're not completed
          if (itemDate < today && item.status === 'scheduled') {
            return {...item, status: 'overdue' as const};
          }
          return item;
        });
        
        // Set last event for notification purposes
        if (eventOccurred) {
          setLastEvent({ type: eventType, item: affectedItem });
        }
        
        return newItems;
      });
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [isSimulating, updateInterval]);
  
  // Function to toggle simulation
  const toggleSimulation = () => {
    setIsSimulating(prev => !prev);
  };

  // Function to clear last event notification
  const clearLastEvent = () => {
    setLastEvent(null);
  };

  // Sort maintenance items
  const upcomingMaintenance = [...maintenanceItems]
    .filter(item => item.status === 'scheduled' || item.status === 'in-progress' || item.status === 'overdue')
    .sort((a, b) => {
      // Sort by status priority: overdue > in-progress > scheduled
      const statusOrder: Record<string, number> = {
        overdue: 0,
        'in-progress': 1, 
        scheduled: 2
      };
      
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Then sort by date
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .slice(0, 5); // Get top 5 upcoming/current items

  const completedMaintenance = [...maintenanceItems]
    .filter(item => item.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first
    .slice(0, 5); // Get 5 most recent completed items

  return {
    upcomingMaintenance,
    completedMaintenance,
    allMaintenance: maintenanceItems,
    isSimulating,
    toggleSimulation,
    lastEvent,
    clearLastEvent
  };
};
