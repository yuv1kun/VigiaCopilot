
import { format, subDays, addDays } from 'date-fns';

/**
 * Upcoming deadline for compliance-related tasks
 */
export interface ComplianceDeadline {
  title: string;
  description: string;
  dueDate: Date;
  daysRemaining: number;
  standard: string;
  isRecurring: boolean;
}

/**
 * Compliance checklist item
 */
export interface ComplianceItem {
  id: string;
  standard: string;
  requirement: string;
  details?: string;
  category: string;
  isCompliant: boolean;
  lastCheckedDate: string;
  nextCheckDate: string;
  responsibleParty: string;
}

/**
 * Safety incident record
 */
export interface Incident {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  severity: 'major' | 'minor' | 'near-miss';
  status: 'open' | 'closed' | 'under-investigation';
  reportedBy: string;
  relatedStandard?: string;
}

/**
 * Audit trail record
 */
export interface AuditTrailRecord {
  id: string;
  action: string;
  timestamp: Date;
  user: string;
  details: string;
  category: string;
  relatedItemId?: string;
}

/**
 * Complete compliance data structure
 */
export interface ComplianceData {
  // Overall metrics
  overallScore: number;
  overallScoreChange: number;
  openIssues: number;
  openIssuesChange: number;
  criticalIssues: number;
  highPriorityIssues: number;
  mediumPriorityIssues: number;
  lowPriorityIssues: number;
  incidentCount: number;
  incidentCountChange: number;
  majorIncidents: number;
  minorIncidents: number;
  nearMissIncidents: number;
  auditCompleteness: number;
  auditCompletenessChange: number;
  
  // OSHA metrics
  oshaCompliance: number;
  oshaStandardsMet: number;
  oshaStandardsTotal: number;
  oshaCriticalCompliance: number;
  oshaDocCompliance: number;
  oshaTrainingCompliance: number;
  
  // NORSOK metrics
  norsokCompliance: number;
  norsokStandardsMet: number;
  norsokStandardsTotal: number;
  norsokTechCompliance: number;
  norsokRiskCompliance: number;
  norsokEnvCompliance: number;
  
  // Detailed data
  upcomingDeadlines: ComplianceDeadline[];
  complianceItems: ComplianceItem[];
  incidents: Incident[];
  auditTrail: AuditTrailRecord[];
}

/**
 * Generate realistic mock compliance data for demonstration
 * 
 * @returns {ComplianceData} Mock compliance dashboard data
 */
export function generateMockComplianceData(): ComplianceData {
  // Generate current date for reference
  const now = new Date();
  const currentDate = format(now, 'yyyy-MM-dd');
  
  // Generate compliance items
  const complianceItems: ComplianceItem[] = [
    {
      id: 'osha-001',
      standard: 'OSHA',
      requirement: 'Provide HAZCOM training to all employees',
      details: 'Training must cover GHS, SDS, labeling, and chemical hazards. Annual refresher required.',
      category: 'Training',
      isCompliant: true,
      lastCheckedDate: format(subDays(now, 25), 'yyyy-MM-dd'),
      nextCheckDate: format(addDays(now, 340), 'yyyy-MM-dd'),
      responsibleParty: 'Safety Manager'
    },
    {
      id: 'osha-002',
      standard: 'OSHA',
      requirement: 'Maintain accurate OSHA 300 logs',
      details: 'Record all work-related injuries and illnesses within 7 days of occurrence.',
      category: 'Documentation',
      isCompliant: true,
      lastCheckedDate: format(subDays(now, 5), 'yyyy-MM-dd'),
      nextCheckDate: format(addDays(now, 25), 'yyyy-MM-dd'),
      responsibleParty: 'HSE Coordinator'
    },
    {
      id: 'osha-003',
      standard: 'OSHA',
      requirement: 'Conduct emergency evacuation drills',
      details: 'Minimum quarterly drills required for offshore operations.',
      category: 'Emergency Preparedness',
      isCompliant: false,
      lastCheckedDate: format(subDays(now, 120), 'yyyy-MM-dd'),
      nextCheckDate: format(addDays(now, 5), 'yyyy-MM-dd'),
      responsibleParty: 'Emergency Response Team'
    },
    {
      id: 'osha-004',
      standard: 'OSHA',
      requirement: 'Maintain PPE inspection records',
      details: 'All PPE must be inspected monthly and records kept for 3 years.',
      category: 'PPE',
      isCompliant: true,
      lastCheckedDate: format(subDays(now, 12), 'yyyy-MM-dd'),
      nextCheckDate: format(addDays(now, 18), 'yyyy-MM-dd'),
      responsibleParty: 'Safety Officer'
    },
    {
      id: 'osha-005',
      standard: 'OSHA',
      requirement: 'Perform machine guarding assessments',
      category: 'Equipment Safety',
      isCompliant: true,
      lastCheckedDate: format(subDays(now, 45), 'yyyy-MM-dd'),
      nextCheckDate: format(addDays(now, 45), 'yyyy-MM-dd'),
      responsibleParty: 'Maintenance Supervisor'
    },
    {
      id: 'norsok-001',
      standard: 'NORSOK',
      requirement: 'Maintain pressure systems integrity documentation',
      details: 'Documentation must include pressure testing results, material certificates, and maintenance records.',
      category: 'Technical Safety',
      isCompliant: true,
      lastCheckedDate: format(subDays(now, 30), 'yyyy-MM-dd'),
      nextCheckDate: format(addDays(now, 60), 'yyyy-MM-dd'),
      responsibleParty: 'Technical Manager'
    },
    {
      id: 'norsok-002',
      standard: 'NORSOK',
      requirement: 'Implement risk assessment for all confined space entries',
      category: 'Risk Assessment',
      isCompliant: false,
      lastCheckedDate: format(subDays(now, 60), 'yyyy-MM-dd'),
      nextCheckDate: currentDate,
      responsibleParty: 'Safety Supervisor'
    },
    {
      id: 'norsok-003',
      standard: 'NORSOK',
      requirement: 'Monitor gas detection system calibration',
      details: 'Monthly tests required with full calibration quarterly.',
      category: 'Technical Safety',
      isCompliant: true,
      lastCheckedDate: format(subDays(now, 15), 'yyyy-MM-dd'),
      nextCheckDate: format(addDays(now, 15), 'yyyy-MM-dd'),
      responsibleParty: 'Instrument Technician'
    },
    {
      id: 'norsok-004',
      standard: 'NORSOK',
      requirement: 'Implement work environment surveys',
      details: 'Annual survey of noise, lighting, air quality, and ergonomics required.',
      category: 'Work Environment',
      isCompliant: false,
      lastCheckedDate: format(subDays(now, 400), 'yyyy-MM-dd'),
      nextCheckDate: format(subDays(now, 35), 'yyyy-MM-dd'),
      responsibleParty: 'HSE Manager'
    },
    {
      id: 'norsok-005',
      standard: 'NORSOK',
      requirement: 'Perform HAZOP for process changes',
      category: 'Risk Assessment',
      isCompliant: true,
      lastCheckedDate: format(subDays(now, 90), 'yyyy-MM-dd'),
      nextCheckDate: format(addDays(now, 90), 'yyyy-MM-dd'),
      responsibleParty: 'Process Engineer'
    }
  ];
  
  // Generate incidents
  const incidents: Incident[] = [
    {
      id: 'inc-001',
      title: 'Pressure relief valve failure',
      description: 'PRV failed to activate during pressure test, causing system overpressure. No injuries.',
      date: subDays(now, 12),
      location: 'Platform A, Process Area',
      severity: 'near-miss',
      status: 'closed',
      reportedBy: 'John T., Operator',
      relatedStandard: 'NORSOK S-001'
    },
    {
      id: 'inc-002',
      title: 'Personnel slip and fall',
      description: 'Worker slipped on wet deck, resulting in minor contusion to left arm.',
      date: subDays(now, 8),
      location: 'Platform A, Outdoor Deck 3',
      severity: 'minor',
      status: 'closed',
      reportedBy: 'Michael B., Safety Officer'
    },
    {
      id: 'inc-003',
      title: 'H2S gas detection alarm',
      description: 'Gas detector triggered alarm at 8 ppm. Area evacuated, source identified as calibration error.',
      date: subDays(now, 5),
      location: 'Platform B, Processing Module',
      severity: 'near-miss',
      status: 'closed',
      reportedBy: 'Sarah L., Control Room Operator',
      relatedStandard: 'OSHA 1910.1000'
    },
    {
      id: 'inc-004',
      title: 'Crane cable failure',
      description: 'Main hoist cable snapped during lift. No load was attached and no injuries occurred.',
      date: subDays(now, 3),
      location: 'Platform A, Main Deck',
      severity: 'major',
      status: 'under-investigation',
      reportedBy: 'David R., Crane Operator',
      relatedStandard: 'OSHA 1910.180'
    },
    {
      id: 'inc-005',
      title: 'Missing confined space permit',
      description: 'Maintenance crew entered tank without proper confined space entry permit.',
      date: subDays(now, 1),
      location: 'Platform B, Storage Area',
      severity: 'minor',
      status: 'open',
      reportedBy: 'James F., Supervisor',
      relatedStandard: 'OSHA 1910.146'
    }
  ];
  
  // Generate audit trail
  const auditTrail: AuditTrailRecord[] = [
    {
      id: 'audit-001',
      action: 'Document Updated',
      timestamp: subDays(now, 1),
      user: 'Jane Smith',
      details: 'Updated Emergency Response Plan with new evacuation routes',
      category: 'Documentation',
      relatedItemId: 'doc-erp-001'
    },
    {
      id: 'audit-002',
      action: 'Training Completed',
      timestamp: subDays(now, 3),
      user: 'Training Department',
      details: 'Annual H2S awareness training completed for 24 personnel',
      category: 'Training',
      relatedItemId: 'training-h2s-001'
    },
    {
      id: 'audit-003',
      action: 'Inspection Performed',
      timestamp: subDays(now, 5),
      user: 'Mike Johnson',
      details: 'Quarterly fire suppression system inspection completed',
      category: 'Inspection',
      relatedItemId: 'insp-fire-001'
    },
    {
      id: 'audit-004',
      action: 'Incident Report Filed',
      timestamp: subDays(now, 8),
      user: 'Sarah Lee',
      details: 'Incident report filed for slip and fall on Deck 3',
      category: 'Incident',
      relatedItemId: 'inc-002'
    },
    {
      id: 'audit-005',
      action: 'Permit Issued',
      timestamp: subDays(now, 9),
      user: 'Robert Wilson',
      details: 'Hot work permit issued for welding on process piping',
      category: 'Permit',
      relatedItemId: 'permit-hw-034'
    },
    {
      id: 'audit-006',
      action: 'Risk Assessment Completed',
      timestamp: subDays(now, 10),
      user: 'Risk Assessment Team',
      details: 'HAZOP completed for new pressure monitoring system',
      category: 'Risk Assessment',
      relatedItemId: 'risk-hazop-012'
    },
    {
      id: 'audit-007',
      action: 'Compliance Status Changed',
      timestamp: subDays(now, 15),
      user: 'Compliance System',
      details: 'NORSOK work environment requirement status changed to non-compliant',
      category: 'Compliance',
      relatedItemId: 'norsok-004'
    }
  ];
  
  // Generate upcoming deadlines
  const upcomingDeadlines: ComplianceDeadline[] = [
    {
      title: 'Emergency Response Drill',
      description: 'Quarterly evacuation and emergency response drill',
      dueDate: addDays(now, 3),
      daysRemaining: 3,
      standard: 'OSHA Emergency Preparedness',
      isRecurring: true
    },
    {
      title: 'NORSOK Work Environment Survey',
      description: 'Annual ergonomics and environmental conditions assessment',
      dueDate: addDays(now, 5),
      daysRemaining: 5,
      standard: 'NORSOK S-002',
      isRecurring: true
    },
    {
      title: 'Gas Detection System Calibration',
      description: 'Monthly calibration check of all H2S and combustible gas detectors',
      dueDate: addDays(now, 10),
      daysRemaining: 10,
      standard: 'Technical Safety',
      isRecurring: true
    },
    {
      title: 'Incident Investigation Report Submission',
      description: 'Complete investigation report for crane cable failure incident',
      dueDate: addDays(now, 7),
      daysRemaining: 7,
      standard: 'Incident Management Procedure',
      isRecurring: false
    }
  ];
  
  // Calculate compliance statistics
  const oshaItems = complianceItems.filter(item => item.standard === 'OSHA');
  const norsokItems = complianceItems.filter(item => item.standard === 'NORSOK');
  
  const oshaCompliantCount = oshaItems.filter(item => item.isCompliant).length;
  const norsokCompliantCount = norsokItems.filter(item => item.isCompliant).length;
  
  const oshaCompliancePercent = Math.round((oshaCompliantCount / oshaItems.length) * 100);
  const norsokCompliancePercent = Math.round((norsokCompliantCount / norsokItems.length) * 100);
  
  const overallCompliancePercent = Math.round(
    ((oshaCompliantCount + norsokCompliantCount) / complianceItems.length) * 100
  );
  
  // Return the complete mock data structure
  return {
    // Overall metrics
    overallScore: overallCompliancePercent,
    overallScoreChange: 2,
    openIssues: 3,
    openIssuesChange: -1,
    criticalIssues: 1,
    highPriorityIssues: 1,
    mediumPriorityIssues: 0,
    lowPriorityIssues: 1,
    incidentCount: 5,
    incidentCountChange: 2,
    majorIncidents: 1,
    minorIncidents: 2,
    nearMissIncidents: 2,
    auditCompleteness: 92,
    auditCompletenessChange: 3,
    
    // OSHA metrics
    oshaCompliance: oshaCompliancePercent,
    oshaStandardsMet: oshaCompliantCount,
    oshaStandardsTotal: oshaItems.length,
    oshaCriticalCompliance: 90,
    oshaDocCompliance: 95,
    oshaTrainingCompliance: 100,
    
    // NORSOK metrics
    norsokCompliance: norsokCompliancePercent,
    norsokStandardsMet: norsokCompliantCount,
    norsokStandardsTotal: norsokItems.length,
    norsokTechCompliance: 88,
    norsokRiskCompliance: 75,
    norsokEnvCompliance: 67,
    
    // Detailed data
    upcomingDeadlines,
    complianceItems,
    incidents,
    auditTrail
  };
}
