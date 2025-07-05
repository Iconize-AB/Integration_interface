import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  RefreshCw, 
  Download,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Database,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LogDetailModal } from '@/components/LogDetailModal';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  details?: string;
}

interface ApiLogEntry {
  timestamp: string;
  level: string;
  message: string;
  raw?: string;
}

interface LogStats {
  system: {
    exists: boolean;
    size: number;
    lines: number;
  };
  exceptions: {
    exists: boolean;
    size: number;
    lines: number;
  };
}

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [logStats, setLogStats] = useState<LogStats | null>(null);
  const [currentLogType, setCurrentLogType] = useState<'system' | 'exceptions' | null>(null);
  
  const { toast } = useToast();

  // Fetch log statistics
  const fetchLogStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/logs/stats');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        setLogStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch log statistics');
      }
    } catch (error) {
      console.error('Error fetching log stats:', error);
      toast({
        title: "Error",
        description: `Failed to fetch log statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Fetch system logs
  const fetchSystemLogs = async () => {
    setIsLoading(true);
    setCurrentLogType('system');
    try {
      const response = await fetch('http://127.0.0.1:3000/api/logs/system');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        const convertedLogs = result.data.logs.map((log: ApiLogEntry, index: number) => ({
          id: `system-${index}`,
          timestamp: new Date(log.timestamp || Date.now()),
          level: (log.level?.toLowerCase() || 'info') as 'info' | 'warning' | 'error' | 'success',
          source: 'System',
          message: log.message || log.raw || 'No message available',
          details: log.raw || undefined
        }));
        setLogs(convertedLogs);
        toast({
          title: "Success",
          description: `Loaded ${convertedLogs.length} system log entries`,
        });
      } else {
        throw new Error(result.message || 'Failed to fetch system logs');
      }
    } catch (error) {
      console.error('Error fetching system logs:', error);
      toast({
        title: "Error",
        description: `Failed to fetch system logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exception logs
  const fetchExceptionLogs = async () => {
    setIsLoading(true);
    setCurrentLogType('exceptions');
    try {
      const response = await fetch('http://127.0.0.1:3000/api/logs/exceptions');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        const convertedLogs = result.data.logs.map((log: ApiLogEntry, index: number) => ({
          id: `exception-${index}`,
          timestamp: new Date(log.timestamp || Date.now()),
          level: (log.level?.toLowerCase() || 'error') as 'info' | 'warning' | 'error' | 'success',
          source: 'Exception',
          message: log.message || log.raw || 'No message available',
          details: log.raw || undefined
        }));
        setLogs(convertedLogs);
        toast({
          title: "Success",
          description: `Loaded ${convertedLogs.length} exception log entries`,
        });
      } else {
        throw new Error(result.message || 'Failed to fetch exception logs');
      }
    } catch (error) {
      console.error('Error fetching exception logs:', error);
      toast({
        title: "Error",
        description: `Failed to fetch exception logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download log file
  const downloadLogFile = async (type: 'system' | 'exceptions') => {
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/logs/download/${type}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.log`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: `${type}.log downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading log file:', error);
      toast({
        title: "Error",
        description: `Failed to download ${type}.log: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Load initial log statistics
  useEffect(() => {
    fetchLogStats();
  }, []);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'info':
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getLogBadgeColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono text-gray-900 tracking-wide">SYSTEM_LOGS</h1>
            <p className="text-sm text-gray-600 font-mono mt-1">
              Integration activity monitoring and event tracking
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="font-mono text-xs border-gray-300 hover:bg-gray-100"
              onClick={() => downloadLogFile(currentLogType || 'system')}
              disabled={!currentLogType}
            >
              <Download className="h-3 w-3 mr-2" />
              DOWNLOAD
            </Button>
            <Button 
              size="sm" 
              className="font-mono text-xs bg-gray-800 hover:bg-gray-900"
              onClick={fetchLogStats}
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              REFRESH
            </Button>
          </div>
        </div>
      </div>

      {/* Log Statistics */}
      {logStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">SYSTEM_LOG</span>
              <Database className="h-4 w-4 text-gray-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-3 w-3 ${logStats.system.exists ? 'text-green-600' : 'text-red-600'}`} />
                <span className="text-sm font-mono text-gray-800">
                  STATUS: {logStats.system.exists ? 'EXISTS' : 'NOT_FOUND'}
                </span>
              </div>
              <span className="text-xs font-mono text-gray-600">
                LINES: {logStats.system.lines} | SIZE: {(logStats.system.size / 1024).toFixed(1)}KB
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">EXCEPTION_LOG</span>
              <AlertCircle className="h-4 w-4 text-gray-600" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-3 w-3 ${logStats.exceptions.exists ? 'text-green-600' : 'text-red-600'}`} />
                <span className="text-sm font-mono text-gray-800">
                  STATUS: {logStats.exceptions.exists ? 'EXISTS' : 'NOT_FOUND'}
                </span>
              </div>
              <span className="text-xs font-mono text-gray-600">
                LINES: {logStats.exceptions.lines} | SIZE: {(logStats.exceptions.size / 1024).toFixed(1)}KB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Log Type Selection */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">LOG_SOURCE:</span>
          <div className="flex gap-2">
            <Button
              variant={currentLogType === 'system' ? "default" : "outline"}
              size="sm"
              onClick={fetchSystemLogs}
              disabled={isLoading}
              className={`font-mono text-xs ${currentLogType === 'system' ? 'bg-gray-800 hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              {isLoading && currentLogType === 'system' ? (
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <Database className="h-3 w-3 mr-2" />
              )}
              SYSTEM_LOGS
            </Button>
            <Button
              variant={currentLogType === 'exceptions' ? "default" : "outline"}
              size="sm"
              onClick={fetchExceptionLogs}
              disabled={isLoading}
              className={`font-mono text-xs ${currentLogType === 'exceptions' ? 'bg-gray-800 hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              {isLoading && currentLogType === 'exceptions' ? (
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-2" />
              )}
              EXCEPTION_LOGS
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="SEARCH_LOGS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-mono text-sm border-gray-300"
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
                className={`font-mono text-xs ${selectedLevel === level ? 'bg-gray-800 hover:bg-gray-900' : 'border-gray-300 hover:bg-gray-100'}`}
              >
                {level.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white border border-gray-200 rounded-md">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <h2 className="text-sm font-mono text-gray-900 uppercase tracking-wider">
                {currentLogType ? `${currentLogType.toUpperCase()}_ENTRIES` : 'LOG_ENTRIES'}
              </h2>
            </div>
            <span className="text-xs font-mono text-gray-500">
              {filteredLogs.length} ENTRIES_FOUND
            </span>
          </div>
        </div>
        
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-mono text-gray-500">
                  {currentLogType ? `SELECT_LOG_SOURCE_TO_LOAD_${currentLogType.toUpperCase()}_LOGS` : 'SELECT_LOG_SOURCE_TO_LOAD_LOGS'}
                </p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-mono text-gray-500">NO_LOGS_MATCH_FILTER</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={log.id}>
                  <div 
                    className="flex items-start gap-4 p-4 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleLogClick(log)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getLogIcon(log.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-900">{log.source}</span>
                          <Badge className={`text-xs font-mono border ${getLogBadgeColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-xs font-mono text-gray-500">
                          {log.timestamp.toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="font-mono text-sm text-gray-800 mb-1">{log.message}</p>
                      {log.details && (
                        <p className="text-xs font-mono text-gray-600 truncate">{log.details}</p>
                      )}
                    </div>
                  </div>
                  {index < filteredLogs.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
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
