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
  Truck,
  DollarSign
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
  category: 'data-sync' | 'order-sync' | 'inventory' | 'customers' | 'pricing' | 'system';
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
    category: 'customers'
  },
  {
    id: 'fetch-articles',
    name: 'Product Sync',
    description: 'Fetch and sync product catalog from Business NXT to Vendre',
    endpoint: '/integration/fetch-articles',
    method: 'POST',
    icon: Package,
    category: 'data-sync'
  },
  {
    id: 'fetch-inventory',
    name: 'Inventory Sync',
    description: 'Update stock levels and inventory data from Business NXT to Vendre',
    endpoint: '/integration/fetch-inventory',
    method: 'POST',
    icon: TrendingUp,
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
    category: 'order-sync'
  },
  // Pricing Operations
  {
    id: 'sync-pricelists',
    name: 'Pricelist Sync',
    description: 'Sync pricing data and pricelists from Business NXT to Vendre',
    endpoint: '/integration/sync-pricelists',
    method: 'POST',
    icon: DollarSign,
    category: 'pricing'
  },
  // System Operations
  {
    id: 'full-sync',
    name: 'Full System Sync',
    description: 'Complete synchronization of all data between systems',
    endpoint: '/integration/full-sync',
    method: 'POST',
    icon: RefreshCw,
    category: 'system'
  }
];

const Index = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);

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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    'data-sync': 'DATA_SYNC',
    'order-sync': 'ORDER_MANAGEMENT',
    'inventory': 'INVENTORY_MANAGEMENT',
    'customers': 'CUSTOMER_MANAGEMENT',
    'pricing': 'PRICING_MANAGEMENT',
    'system': 'SYSTEM_OPERATIONS'
  };

  const categoryIcons = {
    'data-sync': Database,
    'order-sync': ShoppingCart,
    'inventory': TrendingUp,
    'customers': Users,
    'pricing': DollarSign,
    'system': Settings
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-mono text-gray-900 tracking-wide">SYSTEM_DASHBOARD</h1>
        <p className="text-sm text-gray-600 font-mono mt-1">
          Business NXT ↔ Vendre Integration Interface v1.0
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">BUSINESS_NXT_ERP</span>
            <Database className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-sm font-mono text-gray-800">STATUS: ONLINE</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">MIDDLEWARE_SERVICE</span>
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-sm font-mono text-gray-800">STATUS: RUNNING</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">VENDRE_ECOMMERCE</span>
            <ShoppingCart className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-sm font-mono text-gray-800">STATUS: SYNCED</span>
          </div>
        </div>
      </div>

      {/* Sync Operations by Category */}
      {Object.entries(groupedActions).map(([category, actions]) => {
        const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
        return (
          <div key={category} className="bg-white border border-gray-200 rounded-md">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4 text-gray-600" />
                <h2 className="text-sm font-mono text-gray-900 uppercase tracking-wider">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action) => (
                  <div key={action.id} className="border border-gray-200 p-4 rounded-md bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <action.icon className="h-4 w-4 text-gray-600" />
                      <h3 className="font-mono text-sm text-gray-900">{action.name}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 font-mono leading-relaxed">
                      {action.description}
                    </p>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full font-mono text-xs border-gray-300 hover:bg-gray-100"
                      onClick={() => triggerAction(action)}
                      disabled={isLoading === action.id}
                    >
                      {isLoading === action.id ? (
                        <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      ) : (
                        <Zap className="h-3 w-3 mr-2" />
                      )}
                      {isLoading === action.id ? 'EXECUTING...' : 'EXECUTE'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Activity Log */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-600" />
            <h2 className="text-sm font-mono text-gray-900 uppercase tracking-wider">ACTIVITY_LOG</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {actionLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-mono text-gray-500">NO_ACTIVITY_RECORDED</p>
              </div>
            ) : (
              actionLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-mono text-sm text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-600 font-mono">{log.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs font-mono border ${getStatusColor(log.status)}`}>
                        {log.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  {index < actionLogs.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
