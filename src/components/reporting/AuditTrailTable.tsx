
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AuditTrailRecord } from '@/utils/complianceUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AuditTrailTableProps {
  auditTrail: AuditTrailRecord[];
  isLoading: boolean;
}

/**
 * AuditTrailTable displays a chronological record of compliance activities
 * 
 * @component
 * @param {Object} props - Component props
 * @param {AuditTrailRecord[]} props.auditTrail - List of audit records to display
 * @param {boolean} props.isLoading - Loading state
 */
const AuditTrailTable: React.FC<AuditTrailTableProps> = ({ auditTrail, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string | null>(null);

  // Filter audit records based on search term and filters
  const filteredRecords = auditTrail.filter(record => {
    // Search term filter
    if (searchTerm && !record.details.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !record.user.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filterCategory && record.category !== filterCategory) {
      return false;
    }
    
    // Action filter
    if (filterAction && record.action !== filterAction) {
      return false;
    }
    
    return true;
  });

  // Get unique categories for filtering
  const categories = [...new Set(auditTrail.map(record => record.category))];
  
  // Get unique actions for filtering
  const actions = [...new Set(auditTrail.map(record => record.action))];

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory(null);
    setFilterAction(null);
  };

  // Format date and time for display
  const formatDateTime = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  };
  
  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'documentation':
        return 'bg-vigia-blue/20 text-vigia-blue';
      case 'training':
        return 'bg-vigia-teal/20 text-vigia-teal';
      case 'inspection':
        return 'bg-vigia-success/20 text-vigia-success';
      case 'incident':
        return 'bg-vigia-warning/20 text-vigia-warning';
      case 'compliance':
        return 'bg-vigia-danger/20 text-vigia-danger';
      default:
        return 'bg-vigia-muted/20 text-muted-foreground';
    }
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
                <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
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
            placeholder="Search audit records..."
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
                {(filterCategory || filterAction) && (
                  <span className="h-2 w-2 rounded-full bg-vigia-teal" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium mb-1">Category</p>
                <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start h-8 px-2",
                        filterCategory === category && "bg-accent"
                      )}
                      onClick={() => setFilterCategory(filterCategory === category ? null : category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">Action</p>
                <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
                  {actions.map(action => (
                    <Button
                      key={action}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start h-8 px-2",
                        filterAction === action && "bg-accent"
                      )}
                      onClick={() => setFilterAction(filterAction === action ? null : action)}
                    >
                      {action}
                    </Button>
                  ))}
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
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap">{formatDateTime(record.timestamp)}</TableCell>
                  <TableCell>{record.user}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{record.action}</span>
                      <span className="text-xs text-muted-foreground">{record.details}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex py-1 px-2 rounded-full text-xs ${getCategoryColor(record.category)}`}>
                      {record.category}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No audit records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Showing {filteredRecords.length} of {auditTrail.length} audit records
        {(filterCategory || filterAction || searchTerm) && (
          <Button 
            variant="link" 
            className="text-xs p-0 h-auto ml-2" 
            onClick={resetFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
      
      {/* 
      INTEGRATION POINT:
      - AI/NLP integration could be added here to:
        1. Analyze audit patterns and suggest improvements
        2. Identify recurring issues in compliance activities
        3. Generate timeline visualizations of audit activity
      - KavachAI guardrails could be implemented to:
        1. Ensure audit trail integrity and prevent tampering
        2. Control access to sensitive audit information
      */}
    </div>
  );
};

export default AuditTrailTable;
