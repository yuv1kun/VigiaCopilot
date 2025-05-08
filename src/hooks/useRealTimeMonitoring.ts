
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  simulateBOPPressure, 
  simulateWellheadTemperature, 
  simulateGasDetection,
  simulateSealIntegrity,
  simulatePipeCorrosion,
  simulateMaintenanceDays,
  determineStatus,
  calculateTrend,
  formatValue,
  SAFETY_PARAMETERS,
  generateAlert
} from '@/utils/monitoringUtils';

interface MonitoringData {
  value: number;
  formattedValue: string;
  status: 'normal' | 'warning' | 'alert' | 'inactive';
  trend: {
    value: number | string;
    direction: 'up' | 'down' | 'flat';
  };
}

interface MonitoringState {
  bopPressure: MonitoringData;
  wellheadTemperature: MonitoringData;
  gasDetection: MonitoringData;
  sealIntegrity: MonitoringData;
  pipeCorrosion: MonitoringData;
  nextMaintenance: MonitoringData;
  isSimulating: boolean;
}

export const useRealTimeMonitoring = (updateInterval: number = 1000) => {
  const [monitoringState, setMonitoringState] = useState<MonitoringState>({
    bopPressure: {
      value: SAFETY_PARAMETERS.bopPressure.baseline,
      formattedValue: formatValue(SAFETY_PARAMETERS.bopPressure.baseline, 'bopPressure'),
      status: 'normal',
      trend: { value: 0, direction: 'flat' }
    },
    wellheadTemperature: {
      value: SAFETY_PARAMETERS.wellheadTemperature.baseline,
      formattedValue: formatValue(SAFETY_PARAMETERS.wellheadTemperature.baseline, 'wellheadTemperature'),
      status: 'normal',
      trend: { value: 0, direction: 'flat' }
    },
    gasDetection: {
      value: SAFETY_PARAMETERS.gasDetection.baseline,
      formattedValue: formatValue(SAFETY_PARAMETERS.gasDetection.baseline, 'gasDetection'),
      status: 'normal',
      trend: { value: 0, direction: 'flat' }
    },
    sealIntegrity: {
      value: SAFETY_PARAMETERS.sealIntegrity.baseline,
      formattedValue: formatValue(SAFETY_PARAMETERS.sealIntegrity.baseline, 'sealIntegrity'),
      status: 'normal',
      trend: { value: 0, direction: 'flat' }
    },
    pipeCorrosion: {
      value: SAFETY_PARAMETERS.pipeCorrosion.baseline,
      formattedValue: formatValue(SAFETY_PARAMETERS.pipeCorrosion.baseline, 'pipeCorrosion'),
      status: 'normal',
      trend: { value: 0, direction: 'flat' }
    },
    nextMaintenance: {
      value: SAFETY_PARAMETERS.nextMaintenance.baseline,
      formattedValue: formatValue(SAFETY_PARAMETERS.nextMaintenance.baseline, 'nextMaintenance'),
      status: 'normal',
      trend: { value: 0, direction: 'flat' }
    },
    isSimulating: true
  });
  
  // Previous values for trend calculation
  const [prevValues, setPrevValues] = useState({
    bopPressure: SAFETY_PARAMETERS.bopPressure.baseline,
    wellheadTemperature: SAFETY_PARAMETERS.wellheadTemperature.baseline,
    gasDetection: SAFETY_PARAMETERS.gasDetection.baseline,
    sealIntegrity: SAFETY_PARAMETERS.sealIntegrity.baseline,
    pipeCorrosion: SAFETY_PARAMETERS.pipeCorrosion.baseline,
    nextMaintenance: SAFETY_PARAMETERS.nextMaintenance.baseline,
  });

  // Track active scenarios
  const [activeScenarios, setActiveScenarios] = useState({
    pressureEvent: false,
    temperatureEvent: false,
    gasLeakEvent: false,
    maintenanceEvent: false,
    cascadingFailure: false,
    recoveryPhase: false,
  });

  // Scenario durations (in updates)
  const [scenarioTimers, setScenarioTimers] = useState({
    pressureEvent: 0,
    temperatureEvent: 0,
    gasLeakEvent: 0,
    maintenanceEvent: 0,
    cascadingFailure: 0,
    recoveryPhase: 0,
  });

  useEffect(() => {
    if (!monitoringState.isSimulating) return;
    
    // Store previous values every 10 seconds for trend calculation
    const trendInterval = setInterval(() => {
      setPrevValues({
        bopPressure: monitoringState.bopPressure.value,
        wellheadTemperature: monitoringState.wellheadTemperature.value,
        gasDetection: monitoringState.gasDetection.value,
        sealIntegrity: monitoringState.sealIntegrity.value,
        pipeCorrosion: monitoringState.pipeCorrosion.value,
        nextMaintenance: monitoringState.nextMaintenance.value
      });
    }, 10000);
    
    // Randomly trigger realistic scenarios
    const scenarioInterval = setInterval(() => {
      // Only start a new scenario if no major scenarios are active
      const noMajorScenariosActive = !Object.values(activeScenarios).some(status => status);
      
      if (noMajorScenariosActive && Math.random() < 0.1) { // 10% chance every 15 seconds
        // Randomly select a scenario
        const scenarioRoll = Math.random();
        let selectedScenario = '';
        let duration = 0;
        let scenarioDescription = '';
        
        if (scenarioRoll < 0.25) {
          selectedScenario = 'pressureEvent';
          duration = 15 + Math.floor(Math.random() * 15); // 15-30 updates
          scenarioDescription = 'BOP pressure fluctuation detected';
        } else if (scenarioRoll < 0.50) {
          selectedScenario = 'temperatureEvent';
          duration = 20 + Math.floor(Math.random() * 20); // 20-40 updates
          scenarioDescription = 'Wellhead temperature anomaly detected';
        } else if (scenarioRoll < 0.75) {
          selectedScenario = 'gasLeakEvent';
          duration = 10 + Math.floor(Math.random() * 15); // 10-25 updates
          scenarioDescription = 'Minor gas level increase detected';
        } else if (scenarioRoll < 0.95) {
          selectedScenario = 'maintenanceEvent';
          duration = 25 + Math.floor(Math.random() * 20); // 25-45 updates
          scenarioDescription = 'Maintenance metrics fluctuating';
        } else {
          selectedScenario = 'cascadingFailure';
          duration = 40 + Math.floor(Math.random() * 20); // 40-60 updates
          scenarioDescription = 'Multiple systems showing correlated changes';
        }
        
        // Activate the scenario
        setActiveScenarios(prev => ({ ...prev, [selectedScenario]: true }));
        setScenarioTimers(prev => ({ ...prev, [selectedScenario]: duration }));
        
        // Show toast notification
        toast.info(scenarioDescription, {
          description: "Monitoring systems detecting abnormal patterns",
          position: "top-right",
        });
      }
    }, 15000);
    
    // Update values at the specified interval
    const dataInterval = setInterval(() => {
      setMonitoringState(prevState => {
        // Update scenario timers and status
        const updatedTimers = { ...scenarioTimers };
        const updatedScenarios = { ...activeScenarios };
        
        Object.keys(updatedTimers).forEach(key => {
          const typedKey = key as keyof typeof updatedTimers;
          if (updatedTimers[typedKey] > 0) {
            updatedTimers[typedKey] -= 1;
            if (updatedTimers[typedKey] === 0) {
              updatedScenarios[typedKey as keyof typeof updatedScenarios] = false;
              
              // If this was a cascading failure, enter recovery phase
              if (typedKey === 'cascadingFailure') {
                updatedScenarios.recoveryPhase = true;
                updatedTimers.recoveryPhase = 30 + Math.floor(Math.random() * 20);
                
                toast.success("Systems stabilizing", {
                  description: "Automated safety protocols engaged",
                  position: "top-right",
                });
              }
              
              // Show toast for ended scenario
              if (typedKey !== 'recoveryPhase') {
                toast.success(`${typedKey.replace('Event', '').charAt(0).toUpperCase() + typedKey.replace('Event', '').slice(1)} anomaly resolved`, {
                  description: "Values returning to normal parameters",
                  position: "top-right",
                });
              }
            }
          }
        });
        
        setScenarioTimers(updatedTimers);
        setActiveScenarios(updatedScenarios);
        
        // Apply scenario-specific modifiers
        let bopPressureModifier = 0;
        let wellheadTempModifier = 0;
        let gasDetectionModifier = 0;
        let sealIntegrityModifier = 0;
        let pipeCorrosionModifier = 0;
        
        // BOP Pressure Event
        if (updatedScenarios.pressureEvent) {
          const eventProgress = 1 - (updatedTimers.pressureEvent / 30);
          // Sine wave pattern for pressure fluctuation
          bopPressureModifier = 300 * Math.sin(eventProgress * Math.PI * 2);
          // Secondary effects
          wellheadTempModifier += 5 * Math.sin(eventProgress * Math.PI);
          sealIntegrityModifier -= 3 * eventProgress;
        }
        
        // Temperature Event
        if (updatedScenarios.temperatureEvent) {
          const eventProgress = 1 - (updatedTimers.temperatureEvent / 40);
          // Rising then falling temperature
          wellheadTempModifier += 15 * Math.sin(eventProgress * Math.PI);
          // Secondary effects
          gasDetectionModifier += 2 * eventProgress;
          pipeCorrosionModifier += 0.05 * eventProgress;
        }
        
        // Gas Leak Event
        if (updatedScenarios.gasLeakEvent) {
          const eventProgress = 1 - (updatedTimers.gasLeakEvent / 25);
          // Exponential rise then fall
          const leakCurve = Math.sin(eventProgress * Math.PI);
          gasDetectionModifier += 4 * leakCurve;
          // Secondary effects
          sealIntegrityModifier -= 5 * leakCurve;
        }
        
        // Maintenance Metrics Event
        if (updatedScenarios.maintenanceEvent) {
          const eventProgress = 1 - (updatedTimers.maintenanceEvent / 45);
          // Declining maintenance metrics
          sealIntegrityModifier -= 10 * eventProgress;
          pipeCorrosionModifier += 0.1 * eventProgress;
        }
        
        // Cascading Failure (affects all systems)
        if (updatedScenarios.cascadingFailure) {
          const eventProgress = 1 - (updatedTimers.cascadingFailure / 60);
          // Progressive deterioration across systems
          bopPressureModifier += 200 * Math.sin(eventProgress * Math.PI * 3);
          wellheadTempModifier += 20 * eventProgress;
          gasDetectionModifier += 3 * eventProgress;
          sealIntegrityModifier -= 15 * eventProgress;
          pipeCorrosionModifier += 0.15 * eventProgress;
          
          // Generate alert for cascading failure if getting worse
          if (eventProgress > 0.5 && eventProgress < 0.7) {
            toast.error("CRITICAL: Multiple system failures detected", {
              description: "Automated safety protocols activating",
              position: "top-center",
              duration: 5000,
            });
          }
        }
        
        // Recovery phase (gradual return to normal)
        if (updatedScenarios.recoveryPhase) {
          const recoveryProgress = 1 - (updatedTimers.recoveryPhase / 50);
          // All systems gradually normalize with some oscillation
          const oscillation = Math.sin(recoveryProgress * Math.PI * 4);
          bopPressureModifier = oscillation * 100 * (1 - recoveryProgress);
          wellheadTempModifier = oscillation * 8 * (1 - recoveryProgress);
          gasDetectionModifier = oscillation * 2 * (1 - recoveryProgress);
          sealIntegrityModifier = -5 * (1 - recoveryProgress);
          pipeCorrosionModifier = 0.05 * (1 - recoveryProgress);
          
          // Recovery complete notification
          if (updatedTimers.recoveryPhase === 1) {
            toast.success("All systems normalized", {
              description: "Recovery complete, performance at optimal levels",
              position: "top-right",
            });
          }
        }
        
        // Simulate new values with realistic correlations and active scenario modifiers
        const newBOPPressure = simulateBOPPressure(prevState.bopPressure.value) + bopPressureModifier;
        const newWellheadTemp = simulateWellheadTemperature(prevState.wellheadTemperature.value, newBOPPressure) + wellheadTempModifier;
        const newGasDetection = simulateGasDetection(prevState.gasDetection.value, newWellheadTemp) + gasDetectionModifier;
        
        // Simulate maintenance metrics with correlations to operational data and scenario modifiers
        const newSealIntegrity = Math.max(
          SAFETY_PARAMETERS.sealIntegrity.min,
          simulateSealIntegrity(prevState.sealIntegrity.value, newGasDetection) + sealIntegrityModifier
        );
        const newPipeCorrosion = Math.min(
          SAFETY_PARAMETERS.pipeCorrosion.max,
          simulatePipeCorrosion(prevState.pipeCorrosion.value, newWellheadTemp) + pipeCorrosionModifier
        );
        const newNextMaintenance = simulateMaintenanceDays(
          prevState.nextMaintenance.value, 
          newSealIntegrity, 
          newPipeCorrosion
        );
        
        // Calculate trends based on stored previous values
        const bopTrend = calculateTrend(newBOPPressure, prevValues.bopPressure);
        const tempTrend = calculateTrend(newWellheadTemp, prevValues.wellheadTemperature);
        const gasTrend = calculateTrend(newGasDetection, prevValues.gasDetection);
        const sealTrend = calculateTrend(newSealIntegrity, prevValues.sealIntegrity);
        const corrosionTrend = calculateTrend(newPipeCorrosion, prevValues.pipeCorrosion);
        const maintenanceTrend = calculateTrend(newNextMaintenance, prevValues.nextMaintenance);
        
        // Determine statuses
        const bopStatus = determineStatus(newBOPPressure, 'bopPressure');
        const tempStatus = determineStatus(newWellheadTemp, 'wellheadTemperature');
        const gasStatus = determineStatus(newGasDetection, 'gasDetection');
        
        // Generate alerts for status changes from normal to warning or alert
        if (bopStatus !== prevState.bopPressure.status) {
          if (bopStatus === 'warning' || bopStatus === 'alert') {
            const threshold = bopStatus === 'warning' ? 
              SAFETY_PARAMETERS.bopPressure.baseline + 200 : 
              SAFETY_PARAMETERS.bopPressure.baseline + 400;
              
            const alert = generateAlert('bopPressure', newBOPPressure, threshold);
            toast[bopStatus === 'alert' ? 'error' : 'warning'](alert.message, {
              position: bopStatus === 'alert' ? 'top-center' : 'top-right',
              duration: bopStatus === 'alert' ? 7000 : 5000,
            });
          }
        }
        
        if (tempStatus !== prevState.wellheadTemperature.status) {
          if (tempStatus === 'warning' || tempStatus === 'alert') {
            const threshold = tempStatus === 'warning' ? 
              SAFETY_PARAMETERS.wellheadTemperature.warning : 
              SAFETY_PARAMETERS.wellheadTemperature.alert;
              
            const alert = generateAlert('wellheadTemperature', newWellheadTemp, threshold);
            toast[tempStatus === 'alert' ? 'error' : 'warning'](alert.message, {
              position: tempStatus === 'alert' ? 'top-center' : 'top-right',
              duration: tempStatus === 'alert' ? 7000 : 5000,
            });
          }
        }
        
        if (gasStatus !== prevState.gasDetection.status) {
          if (gasStatus === 'warning' || gasStatus === 'alert') {
            const threshold = gasStatus === 'warning' ? 
              SAFETY_PARAMETERS.gasDetection.warning : 
              SAFETY_PARAMETERS.gasDetection.alert;
              
            const alert = generateAlert('gasDetection', newGasDetection, threshold);
            toast[gasStatus === 'alert' ? 'error' : 'warning'](alert.message, {
              position: gasStatus === 'alert' ? 'top-center' : 'top-right',
              duration: gasStatus === 'alert' ? 7000 : 5000,
            });
          }
        }
        
        return {
          ...prevState,
          bopPressure: {
            value: newBOPPressure,
            formattedValue: formatValue(newBOPPressure, 'bopPressure'),
            status: bopStatus,
            trend: bopTrend
          },
          wellheadTemperature: {
            value: newWellheadTemp,
            formattedValue: formatValue(newWellheadTemp, 'wellheadTemperature'),
            status: tempStatus,
            trend: tempTrend
          },
          gasDetection: {
            value: newGasDetection,
            formattedValue: formatValue(newGasDetection, 'gasDetection'),
            status: gasStatus,
            trend: gasTrend
          },
          sealIntegrity: {
            value: newSealIntegrity,
            formattedValue: formatValue(newSealIntegrity, 'sealIntegrity'),
            status: determineStatus(newSealIntegrity, 'sealIntegrity'),
            trend: sealTrend
          },
          pipeCorrosion: {
            value: newPipeCorrosion,
            formattedValue: formatValue(newPipeCorrosion, 'pipeCorrosion'),
            status: determineStatus(newPipeCorrosion, 'pipeCorrosion'),
            trend: corrosionTrend
          },
          nextMaintenance: {
            value: newNextMaintenance,
            formattedValue: formatValue(newNextMaintenance, 'nextMaintenance'),
            status: determineStatus(newNextMaintenance, 'nextMaintenance'),
            trend: maintenanceTrend
          }
        };
      });
    }, updateInterval);

    return () => {
      clearInterval(dataInterval);
      clearInterval(trendInterval);
      clearInterval(scenarioInterval);
    };
  }, [monitoringState.isSimulating, updateInterval, prevValues, activeScenarios, scenarioTimers]);

  const toggleSimulation = () => {
    setMonitoringState(prevState => ({
      ...prevState,
      isSimulating: !prevState.isSimulating
    }));
  };

  return {
    ...monitoringState,
    toggleSimulation
  };
};
