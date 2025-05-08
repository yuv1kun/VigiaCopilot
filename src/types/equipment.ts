
// Equipment status type definition
export type EquipmentStatus = 'running' | 'warning' | 'failure' | 'offline';

// Alert priority levels
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

// Equipment data interface
export interface EquipmentData {
  id: string;
  name: string;
  type: 'pump' | 'compressor';
  status: EquipmentStatus;
  pressure: number;
  temperature: number;
  vibration: number;
  rpm: number;
  efficiency: number;
  operatingHours: number;
  lastMaintenance: string;
  maintenanceDue: number; // Days until next scheduled maintenance
  healthScore: number; // 0-100 score for overall health
  history: DataPoint[];
  components?: ComponentStatus[];
}

// Equipment data point for history
export interface DataPoint {
  time: string;
  pressure: number;
  temperature: number;
  vibration: number;
  rpm: number;
}

// Component-level status tracking
export interface ComponentStatus {
  name: string;
  status: 'normal' | 'warning' | 'critical' | 'replaced';
  healthScore: number;
  installDate: string;
  estimatedLifeRemaining: number; // Percentage
}

// Alert system interfaces
export interface Alert {
  id: string;
  equipmentId: string;
  timestamp: Date;
  message: string;
  parameter: string;
  value: number;
  threshold: number;
  priority: AlertPriority;
  isAcknowledged: boolean;
  correlatedAlerts?: string[]; // IDs of related alerts
}

// System status for AI Assistant
export interface SystemStatus {
  equipmentStatus: Record<string, EquipmentData>;
  activeAlerts: Alert[];
  maintenanceSchedule: MaintenanceEvent[];
}

// Maintenance event
export interface MaintenanceEvent {
  id: string;
  equipmentId: string;
  scheduledDate: Date;
  type: 'routine' | 'preventive' | 'corrective' | 'emergency';
  description: string;
  estimatedDuration: number; // hours
  technicians: string[];
  priority: 'low' | 'medium' | 'high';
  parts?: string[];
}
