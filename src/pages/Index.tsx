import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  CreditCard,
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActionLog {
  id: string;
  action: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
  message: string;
}

interface SyncAction {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: 'POST';
  icon: React.ElementType;
  color: string;
  category: 'data-sync' | 'order-sync' | 'inventory' | 'customers' | 'system';
}

const syncActions: SyncAction[] = [
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

const Index = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([
    {
      id: '1',
      action: 'Product Sync',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'success',
      message: '1,247 products synchronized successfully'
    },
    {
      id: '2',
      action: 'Inventory Update',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'success',
      message: 'Stock levels updated for 856 items'
    },
    {
      id: '3',
      action: 'Order Processing',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: 'success',
      message: '23 orders processed and sent to ERP'
    }
  ]);

  const { toast } = useToast();

  const triggerAction = async (action: SyncAction) => {
    setIsLoading(action.id);
    console.log(`Triggering action: ${action.name}`);

    try {
      const response = await fetch(`http://127.0.0.1:3000${action.endpoint}`, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Operation failed');
      }

      // Create success log entry
      const newLog: ActionLog = {
        id: Date.now().toString(),
        action: action.name,
        timestamp: new Date(),
        status: 'success',
        message: result.message || `${action.name} completed successfully`
      };

      setActionLogs(prev => [newLog, ...prev.slice(0, 4)]);
      
      toast({
        title: "Success",
        description: `${action.name} has been executed successfully`,
      });

    } catch (error) {
      console.error('Error:', error);
      
      // Create error log entry
      const newLog: ActionLog = {
        id: Date.now().toString(),
        action: action.name,
        timestamp: new Date(),
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      setActionLogs(prev => [newLog, ...prev.slice(0, 4)]);
      
      toast({
        title: "Error",
        description: `Failed to execute ${action.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedActions = syncActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, SyncAction[]>);

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

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">Integration Dashboard</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Manage data synchronization between Business NXT ERP and Vendre E-commerce platform. 
            Trigger manual sync operations and monitor integration status in real-time.
          </p>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">Business NXT ERP</CardTitle>
                <Database className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600">Connected & Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700">Middleware Service</CardTitle>
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600">Running Smoothly</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-700">Vendre E-commerce</CardTitle>
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600">Online & Synced</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Operations by Category */}
        {Object.entries(groupedActions).map(([category, actions]) => {
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
                  {actions.map((action) => (
                    <div key={action.id} className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <action.icon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">{action.name}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        {action.description}
                      </p>
                      <Button 
                        className={`w-full ${action.color} transition-colors`}
                        onClick={() => triggerAction(action)}
                        disabled={isLoading === action.id}
                      >
                        {isLoading === action.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <action.icon className="h-4 w-4 mr-2" />
                        )}
                        {isLoading === action.id ? 'Running...' : `Run ${action.name}`}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Activity Log */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
              <Activity className="h-6 w-6 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest integration actions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actionLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium text-slate-800">{log.action}</p>
                        <p className="text-sm text-slate-600">{log.message}</p>
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
                  {index < actionLogs.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
