
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, MoreVertical, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Incident } from '@/utils/complianceUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface IncidentTableProps {
  incidents: Incident[];
  isLoading: boolean;
}

/**
 * IncidentTable displays a list of safety incidents with filtering and details
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Incident[]} props.incidents - List of incidents to display
 * @param {boolean} props.isLoading - Loading state
 */
const IncidentTable: React.FC<IncidentTableProps> = ({ incidents, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filter incidents based on search term and filters
  const filteredIncidents = incidents.filter(incident => {
    // Search term filter
    if (searchTerm && !incident.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !incident.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !incident.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Severity filter
    if (filterSeverity && incident.severity !== filterSeverity) {
      return false;
    }
    
    // Status filter
    if (filterStatus && incident.status !== filterStatus) {
      return false;
    }
    
    return true;
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterSeverity(null);
    setFilterStatus(null);
  };
  
  // Get severity badge class
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'major':
        return 'bg-vigia-danger/20 text-vigia-danger';
      case 'minor':
        return 'bg-vigia-warning/20 text-vigia-warning';
      case 'near-miss':
      default:
        return 'bg-vigia-blue/20 text-vigia-blue';
    }
  };
  
  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-vigia-danger/20 text-vigia-danger';
      case 'under-investigation':
        return 'bg-vigia-warning/20 text-vigia-warning';
      case 'closed':
      default:
        return 'bg-vigia-success/20 text-vigia-success';
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  // View incident details
  const viewIncidentDetails = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[50px]" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[30px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
        <div className="flex flex-1 max-w-sm relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search incidents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-1">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {(filterSeverity || filterStatus) && (
                  <span className="h-2 w-2 rounded-full bg-vigia-teal" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium mb-1">Severity</p>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterSeverity === 'major' && "bg-accent"
                    )}
                    onClick={() => setFilterSeverity(filterSeverity === 'major' ? null : 'major')}
                  >
                    <span className="h-2 w-2 rounded-full bg-vigia-danger mr-2"></span>
                    Major
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterSeverity === 'minor' && "bg-accent"
                    )}
                    onClick={() => setFilterSeverity(filterSeverity === 'minor' ? null : 'minor')}
                  >
                    <span className="h-2 w-2 rounded-full bg-vigia-warning mr-2"></span>
                    Minor
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterSeverity === 'near-miss' && "bg-accent"
                    )}
                    onClick={() => setFilterSeverity(filterSeverity === 'near-miss' ? null : 'near-miss')}
                  >
                    <span className="h-2 w-2 rounded-full bg-vigia-blue mr-2"></span>
                    Near Miss
                  </Button>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">Status</p>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterStatus === 'open' && "bg-accent"
                    )}
                    onClick={() => setFilterStatus(filterStatus === 'open' ? null : 'open')}
                  >
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterStatus === 'under-investigation' && "bg-accent"
                    )}
                    onClick={() => setFilterStatus(filterStatus === 'under-investigation' ? null : 'under-investigation')}
                  >
                    Under Investigation
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterStatus === 'closed' && "bg-accent"
                    )}
                    onClick={() => setFilterStatus(filterStatus === 'closed' ? null : 'closed')}
                  >
                    Closed
                  </Button>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="justify-center text-center cursor-pointer"
                onClick={resetFilters}
              >
                Reset filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Incident</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    <div>
                      {incident.title}
                      <p className="text-xs text-muted-foreground mt-0.5">{incident.location}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(incident.date)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex py-1 px-2 rounded-full text-xs ${getSeverityBadge(incident.severity)}`}>
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1).replace('-', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex py-1 px-2 rounded-full text-xs ${getStatusBadge(incident.status)}`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1).replace('-', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewIncidentDetails(incident)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>Download report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No incidents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Showing {filteredIncidents.length} of {incidents.length} incidents
        {(filterSeverity || filterStatus || searchTerm) && (
          <Button 
            variant="link" 
            className="text-xs p-0 h-auto ml-2" 
            onClick={resetFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
      
      {/* Incident details dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-md">
          {selectedIncident && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedIncident.title}</DialogTitle>
                <DialogDescription>
                  {selectedIncident.location} - {formatDate(selectedIncident.date)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <div className="flex flex-wrap gap-2 my-2">
                    <span className={`inline-flex py-1 px-2 rounded-full text-xs ${getSeverityBadge(selectedIncident.severity)}`}>
                      {selectedIncident.severity.charAt(0).toUpperCase() + selectedIncident.severity.slice(1).replace('-', ' ')}
                    </span>
                    <span className={`inline-flex py-1 px-2 rounded-full text-xs ${getStatusBadge(selectedIncident.status)}`}>
                      {selectedIncident.status.charAt(0).toUpperCase() + selectedIncident.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm">{selectedIncident.description}</p>
                </div>
                
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">Reported by</p>
                  <p className="text-sm">{selectedIncident.reportedBy}</p>
                </div>
                
                {selectedIncident.relatedStandard && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">Related Standard</p>
                    <p className="text-sm">{selectedIncident.relatedStandard}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* 
      INTEGRATION POINT:
      - AI/NLP integration could be added here to:
        1. Auto-categorize incidents based on description
        2. Extract key information from incident reports
        3. Suggest preventive actions based on incident patterns
      - KavachAI guardrails could be implemented to:
        1. Ensure sensitive incident details are properly protected
        2. Control who can access different severity levels
      */}
    </div>
  );
};

export default IncidentTable;
