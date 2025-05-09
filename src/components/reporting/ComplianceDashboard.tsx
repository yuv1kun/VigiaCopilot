import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, CheckSquare, FileText, Shield, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ComplianceOverview from './ComplianceOverview';
import ComplianceTable from './ComplianceTable';
import IncidentTable from './IncidentTable';
import AuditTrailTable from './AuditTrailTable';
import { useComplianceData } from '@/hooks/useComplianceData';

/**
 * ComplianceDashboard component for displaying OSHA/NORSOK compliance information
 * and providing tools for compliance management and reporting.
 * 
 * @component
 */
const ComplianceDashboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  
  // Use our dynamic compliance data hook - updated to refresh every 1 second
  const { complianceData, isLoading } = useComplianceData(true, 1000); // Update every 1 second

  // Handle export button clicks
  const handleExport = (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: `Compliance report has been exported as ${format.toUpperCase()}.`,
      });
      setIsExporting(false);
      
      // In a production environment, this would trigger an actual file download
      // through a backend API or a library like jspdf or xlsx
      console.log(`Exporting compliance report as ${format}`);
      
      /* 
      INTEGRATION POINT:
      - AI/NLP integration could be added here to:
        1. Generate natural language summaries of compliance status
        2. Highlight key risks or improvements in natural language
        3. Add context-aware recommendations
      - KavachAI guardrails could be implemented to:
        1. Ensure sensitive data is appropriately handled in exports
        2. Apply appropriate watermarking or security features
        3. Track and audit report generation and distribution
      */
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Quick action buttons for report generation */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={isExporting || isLoading}
          onClick={() => handleExport('pdf')}
        >
          <Download className="h-4 w-4" />
          Export as PDF
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={isExporting || isLoading}
          onClick={() => handleExport('excel')}
        >
          <Download className="h-4 w-4" />
          Export as Excel
        </Button>
      </div>

      {/* Main dashboard content */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:w-[600px] w-full mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Incidents</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Audit Trail</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ComplianceOverview data={complianceData} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-vigia-teal" /> Compliance Checklists
                  </CardTitle>
                  <CardDescription>
                    Detailed compliance items tracked across OSHA and NORSOK standards
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toast({
                    title: "Refreshed",
                    description: "Compliance data has been updated.",
                  })}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last 30 days</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ComplianceTable 
                items={complianceData?.complianceItems || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-vigia-warning" /> Incident Log
                  </CardTitle>
                  <CardDescription>
                    Records of safety incidents, near-misses, and violations
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toast({
                    title: "Refreshed",
                    description: "Incident data has been updated.",
                  })}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last 90 days</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <IncidentTable 
                incidents={complianceData?.incidents || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-vigia-teal" /> Audit Trail
                  </CardTitle>
                  <CardDescription>
                    Chronological record of compliance activities and document updates
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => toast({
                    title: "Refreshed",
                    description: "Incident data has been updated.",
                  })}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last 30 days</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AuditTrailTable 
                auditTrail={complianceData?.auditTrail || []} 
                isLoading={isLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceDashboard;
