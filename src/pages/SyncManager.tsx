import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  ShoppingCart, 
  RefreshCw, 
  Package, 
  TrendingUp,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Users,
  FileText,
  Play,
  Pause,
  Calendar,
  BarChart3,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncOperation {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'POST';
  icon: React.ElementType;
  color: string;
  category: 'data-sync' | 'order-sync' | 'inventory' | 'customers' | 'system';
  lastRun?: Date;
  status?: 'idle' | 'running' | 'success' | 'error';
  duration?: number;
  recordsProcessed?: number;
}

interface SyncLog {
  id: string;
  operationId: string;
  operationName: string;
  timestamp: Date;
  status: 'success' | 'error' | 'running';
  message: string;
  duration?: number;
  recordsProcessed?: number;
  error?: string;
}

const syncOperations: SyncOperation[] = [
  // Data Sync Operations
  {
    id: 'fetch-customers',
    name: 'Customer Sync',
    description: 'Fetch and sync customer data from Business NXT to Vendre',
    endpoint: '/integration/fetch-customers',
    method: 'POST',
    icon: Users,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    category: 'customers'
  },
  {
    id: 'fetch-articles',
    name: 'Product Sync',
    description: 'Fetch and sync product catalog from Business NXT to Vendre',
    endpoint: '/integration/fetch-articles',
    method: 'POST',
    icon: Package,
    color: 'bg-blue-600 hover:bg-blue-700',
    category: 'data-sync'
  },
  {
    id: 'fetch-inventory',
    name: 'Inventory Sync',
    description: 'Update stock levels and inventory data from Business NXT to Vendre',
    endpoint: '/integration/fetch-inventory',
    method: 'POST',
    icon: TrendingUp,
    color: 'bg-green-600 hover:bg-green-700',
    category: 'inventory'
  },
  // Order Sync Operations
  {
    id: 'sync-order-statuses',
    name: 'Order Status Sync',
    description: 'Sync order statuses from Business NXT to Vendre',
    endpoint: '/integration/sync-order-statuses',
    method: 'POST',
    icon: ShoppingCart,
    color: 'bg-purple-600 hover:bg-purple-700',
    category: 'order-sync'
  },
  // Additional Sync Operations
  {
    id: 'full-sync',
    name: 'Full System Sync',
    description: 'Complete synchronization of all data between systems',
    endpoint: '/integration/full-sync',
    method: 'POST',
    icon: RefreshCw,
    color: 'bg-red-600 hover:bg-red-700',
    category: 'system'
  }
];

const SyncManager = () => {
  const [operations, setOperations] = useState<SyncOperation[]>(syncOperations);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30); // minutes

  const { toast } = useToast();

  const triggerSync = async (operation: SyncOperation) => {
    setIsLoading(operation.id);
    
    // Update operation status to running
    setOperations(prev => prev.map(op => 
      op.id === operation.id 
        ? { ...op, status: 'running', lastRun: new Date() }
        : op
    ));

    const startTime = Date.now();

    try {
      const response = await fetch(`http://127.0.0.1:3000${operation.endpoint}`, {
        method: operation.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      // Update operation status to success
      setOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { 
              ...op, 
              status: 'success', 
              duration,
              recordsProcessed: result.data?.count || result.data?.length || 0
            }
          : op
      ));

      // Add to sync logs
      const newLog: SyncLog = {
        id: Date.now().toString(),
        operationId: operation.id,
        operationName: operation.name,
        timestamp: new Date(),
        status: 'success',
        message: result.message || `${operation.name} completed successfully`,
        duration,
        recordsProcessed: result.data?.count || result.data?.length || 0
      };

      setSyncLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs
      
      toast({
        title: "Success",
        description: `${operation.name} has been executed successfully`,
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update operation status to error
      setOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? { ...op, status: 'error', duration }
          : op
      ));

      // Add error to sync logs
      const newLog: SyncLog = {
        id: Date.now().toString(),
        operationId: operation.id,
        operationName: operation.name,
        timestamp: new Date(),
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setSyncLogs(prev => [newLog, ...prev.slice(0, 49)]);
      
      toast({
        title: "Error",
        description: `Failed to execute ${operation.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const triggerFullSync = async () => {
    const fullSyncOp = operations.find(op => op.id === 'full-sync');
    if (fullSyncOp) {
      await triggerSync(fullSyncOp);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedOperations = operations.reduce((acc, operation) => {
    if (!acc[operation.category]) {
      acc[operation.category] = [];
    }
    acc[operation.category].push(operation);
    return acc;
  }, {} as Record<string, SyncOperation[]>);

  const categoryLabels = {
    'data-sync': 'Data Synchronization',
    'order-sync': 'Order Management',
    'inventory': 'Inventory Management',
    'customers': 'Customer Management',
    'system': 'System Operations'
  };

  const categoryIcons = {
    'data-sync': Database,
    'order-sync': ShoppingCart,
    'inventory': TrendingUp,
    'customers': Users,
    'system': Settings
  };

  const successCount = operations.filter(op => op.status === 'success').length;
  const errorCount = operations.filter(op => op.status === 'error').length;
  const runningCount = operations.filter(op => op.status === 'running').length;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <RefreshCw className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">Sync Manager</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Comprehensive sync operation management with real-time status tracking, 
            detailed logs, and automated scheduling capabilities.
          </p>
        </div>

        {/* Sync Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold text-green-600">{successCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-2xl font-bold text-red-600">{errorCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">Running</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold text-blue-600">{runningCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700">Total Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-bold text-purple-600">{operations.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
              <Zap className="h-6 w-6 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Execute common sync operations with a single click
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={triggerFullSync}
                disabled={isLoading === 'full-sync'}
              >
                {isLoading === 'full-sync' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Run Full System Sync
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setAutoSync(!autoSync)}
              >
                {autoSync ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {autoSync ? 'Disable' : 'Enable'} Auto Sync
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sync Operations by Category */}
        {Object.entries(groupedOperations).map(([category, categoryOperations]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <Card key={category} className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
                  <CategoryIcon className="h-6 w-6 text-blue-600" />
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </CardTitle>
                <CardDescription>
                  Manage {categoryLabels[category as keyof typeof categoryLabels].toLowerCase()} operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryOperations.map((operation) => (
                    <Card key={operation.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <operation.icon className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-slate-800">{operation.name}</h3>
                          </div>
                          {getStatusIcon(operation.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600">
                          {operation.description}
                        </p>
                        
                        {operation.lastRun && (
                          <div className="text-xs text-slate-500">
                            Last run: {operation.lastRun.toLocaleString()}
                          </div>
                        )}
                        
                        {operation.duration && (
                          <div className="text-xs text-slate-500">
                            Duration: {operation.duration}ms
                          </div>
                        )}
                        
                        {operation.recordsProcessed !== undefined && (
                          <div className="text-xs text-slate-500">
                            Records processed: {operation.recordsProcessed}
                          </div>
                        )}
                        
                        <Button 
                          className={`w-full ${operation.color} transition-colors`}
                          onClick={() => triggerSync(operation)}
                          disabled={isLoading === operation.id}
                        >
                          {isLoading === operation.id ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <operation.icon className="h-4 w-4 mr-2" />
                          )}
                          {isLoading === operation.id ? 'Running...' : `Run ${operation.name}`}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Sync Logs */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
              <History className="h-6 w-6 text-green-600" />
              Sync Logs
            </CardTitle>
            <CardDescription>
              Recent sync operation history and detailed logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {syncLogs.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No sync operations have been performed yet
                </div>
              ) : (
                syncLogs.map((log, index) => (
                  <div key={log.id}>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="font-medium text-slate-800">{log.operationName}</p>
                          <p className="text-sm text-slate-600">{log.message}</p>
                          {log.duration && (
                            <p className="text-xs text-slate-500">Duration: {log.duration}ms</p>
                          )}
                          {log.recordsProcessed !== undefined && (
                            <p className="text-xs text-slate-500">Records: {log.recordsProcessed}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    {index < syncLogs.length - 1 && <Separator className="my-2" />}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SyncManager; 