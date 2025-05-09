
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { ComplianceData } from '@/utils/complianceUtils';
import { cn } from '@/lib/utils';

interface ComplianceOverviewProps {
  data: ComplianceData | null;
  isLoading: boolean;
}

/**
 * Component displaying key compliance metrics and status summaries
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ComplianceData | null} props.data - Compliance data to display
 * @param {boolean} props.isLoading - Loading state
 */
const ComplianceOverview: React.FC<ComplianceOverviewProps> = ({ data, isLoading }) => {
  // Helper to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-vigia-success';
    if (score >= 70) return 'text-vigia-warning';
    return 'text-vigia-danger';
  };
  
  // Helper to get progress color based on score
  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-vigia-success';
    if (score >= 70) return 'bg-vigia-warning';
    return 'bg-vigia-danger';
  };

  const renderSkeleton = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/3 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-1/3" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) return renderSkeleton();

  if (!data) return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">No compliance data available</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", getScoreColor(data.overallScore))}>
                {data.overallScore}%
              </span>
              <span className="text-muted-foreground text-sm">
                {data.overallScoreChange >= 0 ? '+' : ''}{data.overallScoreChange}% from last month
              </span>
            </div>
            <Progress 
              value={data.overallScore} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", data.openIssues > 5 ? "text-vigia-danger" : "text-vigia-warning")}>
                {data.openIssues}
              </span>
              <span className="text-muted-foreground text-sm">
                {data.openIssuesChange > 0 ? `+${data.openIssuesChange}` : data.openIssuesChange} from last month
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">Critical: {data.criticalIssues}</span>
              <span className="text-xs text-muted-foreground">High: {data.highPriorityIssues}</span>
              <span className="text-xs text-muted-foreground">Medium: {data.mediumPriorityIssues}</span>
              <span className="text-xs text-muted-foreground">Low: {data.lowPriorityIssues}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incident Count (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", 
                data.incidentCount > 3 ? "text-vigia-danger" : 
                data.incidentCount > 0 ? "text-vigia-warning" : "text-vigia-success"
              )}>
                {data.incidentCount}
              </span>
              <span className="text-muted-foreground text-sm">
                {data.incidentCountChange > 0 ? `+${data.incidentCountChange}` : data.incidentCountChange} from previous period
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-vigia-danger"></span>
                Major: {data.majorIncidents}
              </span>
              <span className="text-xs flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-vigia-warning"></span>
                Minor: {data.minorIncidents}
              </span>
              <span className="text-xs flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-vigia-muted"></span>
                Near Miss: {data.nearMissIncidents}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audit Trail Completeness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", getScoreColor(data.auditCompleteness))}>
                {data.auditCompleteness}%
              </span>
              <span className="text-muted-foreground text-sm">
                {data.auditCompletenessChange >= 0 ? '+' : ''}{data.auditCompletenessChange}% from last month
              </span>
            </div>
            <Progress 
              value={data.auditCompleteness} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Compliance Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* OSHA Compliance */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-vigia-success" /> OSHA Compliance
            </h4>
            <div className={cn(
              "p-4 rounded-lg border border-border flex items-center gap-3",
              data.oshaCompliance >= 90 ? "bg-vigia-success/10 border-vigia-success/30" :
              data.oshaCompliance >= 70 ? "bg-vigia-warning/10 border-vigia-warning/30" :
              "bg-vigia-danger/10 border-vigia-danger/30"
            )}>
              <div className={cn(
                "text-4xl font-bold",
                getScoreColor(data.oshaCompliance)
              )}>
                {data.oshaCompliance}%
              </div>
              <div className="text-sm">
                <p className="font-medium">Standards Met</p>
                <p className="text-muted-foreground">{data.oshaStandardsMet} of {data.oshaStandardsTotal}</p>
              </div>
            </div>
            <ul className="text-sm space-y-1">
              <li className="flex items-center justify-between">
                <span>Critical Standards</span>
                <span className={cn(
                  "font-medium",
                  data.oshaCriticalCompliance >= 90 ? "text-vigia-success" :
                  data.oshaCriticalCompliance >= 70 ? "text-vigia-warning" : 
                  "text-vigia-danger"
                )}>
                  {data.oshaCriticalCompliance}%
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Documentation</span>
                <span className={cn(
                  "font-medium",
                  data.oshaDocCompliance >= 90 ? "text-vigia-success" :
                  data.oshaDocCompliance >= 70 ? "text-vigia-warning" : 
                  "text-vigia-danger"
                )}>
                  {data.oshaDocCompliance}%
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Training</span>
                <span className={cn(
                  "font-medium",
                  data.oshaTrainingCompliance >= 90 ? "text-vigia-success" :
                  data.oshaTrainingCompliance >= 70 ? "text-vigia-warning" : 
                  "text-vigia-danger"
                )}>
                  {data.oshaTrainingCompliance}%
                </span>
              </li>
            </ul>
          </div>
          
          {/* NORSOK Compliance */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-vigia-success" /> NORSOK Compliance
            </h4>
            <div className={cn(
              "p-4 rounded-lg border border-border flex items-center gap-3",
              data.norsokCompliance >= 90 ? "bg-vigia-success/10 border-vigia-success/30" :
              data.norsokCompliance >= 70 ? "bg-vigia-warning/10 border-vigia-warning/30" :
              "bg-vigia-danger/10 border-vigia-danger/30"
            )}>
              <div className={cn(
                "text-4xl font-bold",
                getScoreColor(data.norsokCompliance)
              )}>
                {data.norsokCompliance}%
              </div>
              <div className="text-sm">
                <p className="font-medium">Standards Met</p>
                <p className="text-muted-foreground">{data.norsokStandardsMet} of {data.norsokStandardsTotal}</p>
              </div>
            </div>
            <ul className="text-sm space-y-1">
              <li className="flex items-center justify-between">
                <span>Technical Safety</span>
                <span className={cn(
                  "font-medium",
                  data.norsokTechCompliance >= 90 ? "text-vigia-success" :
                  data.norsokTechCompliance >= 70 ? "text-vigia-warning" : 
                  "text-vigia-danger"
                )}>
                  {data.norsokTechCompliance}%
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Risk Assessment</span>
                <span className={cn(
                  "font-medium",
                  data.norsokRiskCompliance >= 90 ? "text-vigia-success" :
                  data.norsokRiskCompliance >= 70 ? "text-vigia-warning" : 
                  "text-vigia-danger"
                )}>
                  {data.norsokRiskCompliance}%
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Work Environment</span>
                <span className={cn(
                  "font-medium",
                  data.norsokEnvCompliance >= 90 ? "text-vigia-success" :
                  data.norsokEnvCompliance >= 70 ? "text-vigia-warning" : 
                  "text-vigia-danger"
                )}>
                  {data.norsokEnvCompliance}%
                </span>
              </li>
            </ul>
          </div>
          
          {/* Upcoming Deadlines */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-vigia-teal" /> Upcoming Deadlines
            </h4>
            <div className="rounded-lg border border-border">
              <div className="divide-y divide-border">
                {data.upcomingDeadlines.map((deadline, i) => (
                  <div key={i} className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{deadline.title}</p>
                        <p className="text-xs text-muted-foreground">{deadline.description}</p>
                      </div>
                      <span className={cn(
                        "text-xs py-1 px-2 rounded-full",
                        deadline.daysRemaining <= 3 ? "bg-vigia-danger/20 text-vigia-danger" :
                        deadline.daysRemaining <= 7 ? "bg-vigia-warning/20 text-vigia-warning" :
                        "bg-vigia-muted/20 text-muted-foreground"
                      )}>
                        {deadline.daysRemaining} day{deadline.daysRemaining !== 1 ? 's' : ''} left
                      </span>
                    </div>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs text-muted-foreground">{deadline.standard}</span>
                      {deadline.isRecurring && (
                        <span className="ml-2 text-xs bg-vigia-muted/20 py-0.5 px-1.5 rounded-full">
                          Recurring
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {data.upcomingDeadlines.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No upcoming deadlines
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 
      INTEGRATION POINT:
      - AI/NLP integration could be added here to:
        1. Summarize compliance status in natural language
        2. Generate recommendations based on current metrics
        3. Highlight key trends and patterns in compliance data
      - KavachAI guardrails could be implemented to:
        1. Ensure sensitive data is properly protected
        2. Provide context-aware access control to compliance metrics
      */}
    </div>
  );
};

export default ComplianceOverview;
