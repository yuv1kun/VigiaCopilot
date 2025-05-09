
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
import { CheckCircle, XCircle, Filter, Search, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ComplianceItem } from '@/utils/complianceUtils';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ComplianceTableProps {
  items: ComplianceItem[];
  isLoading: boolean;
}

/**
 * ComplianceTable displays detailed compliance checklist items
 * 
 * @component
 * @param {Object} props - Component props
 * @param {ComplianceItem[]} props.items - List of compliance items to display
 * @param {boolean} props.isLoading - Loading state
 */
const ComplianceTable: React.FC<ComplianceTableProps> = ({ items, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStandard, setFilterStandard] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Filter items based on search term and filters
  const filteredItems = items.filter(item => {
    // Search term filter
    if (searchTerm && !item.requirement.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.category.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Standard filter
    if (filterStandard && item.standard !== filterStandard) {
      return false;
    }
    
    // Status filter
    if (filterStatus !== null && item.isCompliant !== filterStatus) {
      return false;
    }
    
    // Category filter
    if (filterCategory && item.category !== filterCategory) {
      return false;
    }
    
    return true;
  });

  // Get unique categories for filtering
  const categories = [...new Set(items.map(item => item.category))];

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStandard(null);
    setFilterStatus(null);
    setFilterCategory(null);
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
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[200px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
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
            placeholder="Search requirements or categories..."
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
                {(filterStandard || filterStatus !== null || filterCategory) && (
                  <span className="h-2 w-2 rounded-full bg-vigia-teal" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium mb-1">Standard</p>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterStandard === 'OSHA' && "bg-accent"
                    )}
                    onClick={() => setFilterStandard(filterStandard === 'OSHA' ? null : 'OSHA')}
                  >
                    OSHA
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterStandard === 'NORSOK' && "bg-accent"
                    )}
                    onClick={() => setFilterStandard(filterStandard === 'NORSOK' ? null : 'NORSOK')}
                  >
                    NORSOK
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
                      filterStatus === true && "bg-accent"
                    )}
                    onClick={() => setFilterStatus(filterStatus === true ? null : true)}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-2 text-vigia-success" />
                    <span>Compliant</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start h-8 px-2",
                      filterStatus === false && "bg-accent"
                    )}
                    onClick={() => setFilterStatus(filterStatus === false ? null : false)}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-2 text-vigia-danger" />
                    <span>Non-Compliant</span>
                  </Button>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <p className="text-sm font-medium mb-1">Category</p>
                <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start h-8 px-2 text-left whitespace-normal",
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
              <TableHead>Standard</TableHead>
              <TableHead className="w-[40%]">Requirement</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Last Check</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.standard}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.requirement}
                      {item.details && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{item.details}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.lastCheckedDate}</TableCell>
                  <TableCell>
                    {item.isCompliant ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-vigia-success mr-1" />
                        <span>Compliant</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-vigia-danger mr-1" />
                        <span>Non-Compliant</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No compliance items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Showing {filteredItems.length} of {items.length} items
        {(filterStandard || filterStatus !== null || filterCategory || searchTerm) && (
          <Button 
            variant="link" 
            className="text-xs p-0 h-auto ml-2" 
            onClick={resetFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default ComplianceTable;
