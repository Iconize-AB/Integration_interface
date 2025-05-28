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
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActionLog {
  id: string;
  action: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'error';
  message: string;
}

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

  const triggerAction = async (actionName: string, description: string) => {
    setIsLoading(actionName);
    console.log(`Triggering action: ${actionName}`);

    try {
      if (actionName === 'Customer Sync') {
        const response = await fetch('http://127.0.0.1:3000/integration/fetch-customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const { success, data, error } = await response.json();
        if (!success) {
          throw new Error(error || 'Failed to sync customers');
        }
        const customerCount = data?.useCompany?.associate?.items?.length || 0;
        description = `Successfully synced ${customerCount} customers`;
      } else if (actionName === 'Product Sync') {
        const response = await fetch('http://127.0.0.1:3000/integration/fetch-articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const { success, data, error } = await response.json();
        if (!success) {
          throw new Error(error || 'Failed to sync articles');
        }
        const articleCount = data?.items?.length || 0;
        description = `Successfully synced ${articleCount} articles`;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: `Failed to execute ${actionName}`,
        variant: "destructive"
      });
      setIsLoading(null);
      return;
    }

    // Simulate API call for other actions
    setTimeout(() => {
      const newLog: ActionLog = {
        id: Date.now().toString(),
        action: actionName,
        timestamp: new Date(),
        status: 'success',
        message: description
      };

      setActionLogs(prev => [newLog, ...prev.slice(0, 4)]);
      setIsLoading(null);

      toast({
        title: "Action Triggered",
        description: `${actionName} has been executed successfully`,
      });
    }, 2000);
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

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">Dashboard</h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Manage data synchronization between your ERP system and Ecommerce platform. 
            Trigger manual actions and monitor integration status in real-time.
          </p>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">ERP System</CardTitle>
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
                <CardTitle className="text-sm font-medium text-blue-700">Middleware</CardTitle>
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
                <CardTitle className="text-sm font-medium text-purple-700">Ecommerce</CardTitle>
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

        {/* Action Triggers */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
              <Settings className="h-6 w-6 text-blue-600" />
              Manual Action Triggers
            </CardTitle>
            <CardDescription>
              Execute integration actions manually to sync data between systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Product Sync */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-800">Product Sync</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Synchronize product catalog from ERP to Ecommerce platform
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  onClick={() => triggerAction('Product Sync', 'Product catalog synchronized successfully')}
                  disabled={isLoading === 'Product Sync'}
                >
                  {isLoading === 'Product Sync' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  Sync Products
                </Button>
              </div>

              {/* Inventory Update */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-slate-800">Inventory Update</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Update stock levels and inventory data across platforms
                </p>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 transition-colors"
                  onClick={() => triggerAction('Inventory Update', 'Stock levels updated successfully')}
                  disabled={isLoading === 'Inventory Update'}
                >
                  {isLoading === 'Inventory Update' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Update Inventory
                </Button>
              </div>

              {/* Order Processing */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-slate-800">Order Processing</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Process pending orders and send to ERP system
                </p>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
                  onClick={() => triggerAction('Order Processing', 'Orders processed and sent to ERP')}
                  disabled={isLoading === 'Order Processing'}
                >
                  {isLoading === 'Order Processing' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  Process Orders
                </Button>
              </div>

              {/* Full Sync */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-slate-800">Full Sync</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Complete synchronization of all data between systems
                </p>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 transition-colors"
                  onClick={() => triggerAction('Full Sync', 'Complete data synchronization finished')}
                  disabled={isLoading === 'Full Sync'}
                >
                  {isLoading === 'Full Sync' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Full Sync
                </Button>
              </div>

              {/* Customer Sync */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800">Customer Sync</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Synchronize customer data from ERP to Ecommerce platform
                </p>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  onClick={() => triggerAction('Customer Sync', 'Customer data synchronized successfully')}
                  disabled={isLoading === 'Customer Sync'}
                >
                  {isLoading === 'Customer Sync' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  Sync Customers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
