
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  RefreshCw, 
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LogDetailModal } from '@/components/LogDetailModal';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  details?: string;
}

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      level: 'success',
      source: 'Product Sync',
      message: '1,247 products synchronized successfully',
      details: 'Batch processing completed with no errors. All product data including pricing, inventory, and descriptions have been updated across all channels.'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      level: 'info',
      source: 'Inventory Update',
      message: 'Stock levels updated for 856 items',
      details: 'Automatic inventory sync from ERP system completed. Updated stock quantities for SKUs across warehouse locations.'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      level: 'warning',
      source: 'Order Processing',
      message: '2 orders failed validation',
      details: 'Invalid shipping address format detected for orders #12345 and #12346. Manual review required for address correction.'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      level: 'success',
      source: 'Full Sync',
      message: 'Complete data synchronization finished',
      details: 'Full synchronization process completed successfully. All systems are now in sync with the latest data from all connected platforms.'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      level: 'error',
      source: 'API Connection',
      message: 'Failed to connect to ERP endpoint',
      details: 'Connection timeout after 30 seconds. Error: ECONNREFUSED. Please check network connectivity and ERP system status.'
    }
  ]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadgeColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Integration Logs</h1>
              <p className="text-slate-600">Monitor all integration activities and system events</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
            <Button className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {['all', 'success', 'info', 'warning', 'error'].map((level) => (
                  <Button
                    key={level}
                    variant={selectedLevel === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel(level)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              System Logs
            </CardTitle>
            <CardDescription>
              {filteredLogs.length} log entries found • Click on any log to view details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredLogs.map((log, index) => (
                  <div key={log.id}>
                    <div 
                      className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => handleLogClick(log)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getLogIcon(log.level)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{log.source}</span>
                            <Badge className={getLogBadgeColor(log.level)}>
                              {log.level}
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-500">
                            {log.timestamp.toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-slate-700 mb-1">{log.message}</p>
                        {log.details && (
                          <p className="text-sm text-slate-500 truncate">{log.details}</p>
                        )}
                      </div>
                    </div>
                    {index < filteredLogs.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <LogDetailModal 
        log={selectedLog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Logs;
