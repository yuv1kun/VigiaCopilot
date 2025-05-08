
import { useState, useEffect } from 'react';
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
  SAFETY_PARAMETERS
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
    
    // Update values at the specified interval
    const dataInterval = setInterval(() => {
      setMonitoringState(prevState => {
        // Simulate new values with realistic correlations
        const newBOPPressure = simulateBOPPressure(prevState.bopPressure.value);
        const newWellheadTemp = simulateWellheadTemperature(prevState.wellheadTemperature.value, newBOPPressure);
        const newGasDetection = simulateGasDetection(prevState.gasDetection.value, newWellheadTemp);
        
        // Simulate maintenance metrics with correlations to operational data
        const newSealIntegrity = simulateSealIntegrity(prevState.sealIntegrity.value, newGasDetection);
        const newPipeCorrosion = simulatePipeCorrosion(prevState.pipeCorrosion.value, newWellheadTemp);
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
        
        return {
          ...prevState,
          bopPressure: {
            value: newBOPPressure,
            formattedValue: formatValue(newBOPPressure, 'bopPressure'),
            status: determineStatus(newBOPPressure, 'bopPressure'),
            trend: bopTrend
          },
          wellheadTemperature: {
            value: newWellheadTemp,
            formattedValue: formatValue(newWellheadTemp, 'wellheadTemperature'),
            status: determineStatus(newWellheadTemp, 'wellheadTemperature'),
            trend: tempTrend
          },
          gasDetection: {
            value: newGasDetection,
            formattedValue: formatValue(newGasDetection, 'gasDetection'),
            status: determineStatus(newGasDetection, 'gasDetection'),
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
    };
  }, [monitoringState.isSimulating, updateInterval, prevValues]);

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
