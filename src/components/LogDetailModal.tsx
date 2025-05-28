
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Copy
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
  details?: string;
}

interface LogDetailModalProps {
  log: LogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, isOpen, onClose }) => {
  if (!log) return null;

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getLogIcon(log.level)}
            Log Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about this log entry
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
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
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Message</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(log.message)}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm">{log.message}</p>
            </div>
          </div>
          
          {log.details && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Details</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(log.details || '')}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">{log.details}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-medium">Metadata</h4>
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg text-sm">
              <div>
                <span className="font-medium">Log ID:</span> {log.id}
              </div>
              <div>
                <span className="font-medium">Source:</span> {log.source}
              </div>
              <div>
                <span className="font-medium">Level:</span> {log.level}
              </div>
              <div>
                <span className="font-medium">Timestamp:</span> {log.timestamp.toISOString()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
