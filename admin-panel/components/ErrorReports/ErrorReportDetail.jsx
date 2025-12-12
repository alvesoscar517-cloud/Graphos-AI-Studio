import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supportApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import LoadingScreen from '../Common/LoadingScreen';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select } from '../ui/select';
import { cn } from '@/lib/utils';

export default function ErrorReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadReport(); }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await supportApi.getById(id);
      setReport(response.ticket);
    } catch (err) {
      notify.error('Error: ' + err.message);
      navigate('/error-reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await supportApi.updateStatus(id, newStatus);
      notify.success('Status updated!');
      loadReport();
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await notify.confirm({
      title: 'Delete error report',
      message: 'Are you sure? This cannot be undone.',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      setDeleting(true);
      await supportApi.delete(id);
      notify.success('Deleted!');
      navigate('/error-reports');
    } catch (err) {
      notify.error('Error: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Parse error content sections
  const parseErrorContent = (content) => {
    if (!content) return { message: '', stack: '', environment: '', componentStack: '' };
    
    const sections = {
      message: '',
      stack: '',
      environment: '',
      componentStack: ''
    };
    
    const lines = content.split('\n');
    let currentSection = 'message';
    
    for (const line of lines) {
      if (line.includes('--- Stack Trace ---')) {
        currentSection = 'stack';
        continue;
      } else if (line.includes('--- Environment ---')) {
        currentSection = 'environment';
        continue;
      } else if (line.includes('--- Component Stack ---')) {
        currentSection = 'componentStack';
        continue;
      }
      
      sections[currentSection] += line + '\n';
    }
    
    return {
      message: sections.message.trim(),
      stack: sections.stack.trim(),
      environment: sections.environment.trim(),
      componentStack: sections.componentStack.trim()
    };
  };

  if (loading) return <LoadingScreen />;
  if (!report) return <div className="p-4 sm:p-6 text-center text-muted">Error report not found</div>;

  const { message, stack, environment, componentStack } = parseErrorContent(report.content);
  const metadata = report.metadata || {};

  // Parse error name from title
  const errorMatch = report.title?.match(/^\[Error\]\s*(\w+):\s*(.+)$/);
  const errorName = errorMatch?.[1] || 'Error';
  const errorMessage = errorMatch?.[2] || report.title;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/error-reports')}>
            <img src="/icon/arrow-left.svg" alt="" className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-error/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <img src="/icon/alert-triangle.svg" alt="" className="w-4 h-4 sm:w-5 sm:h-5" style={{ filter: 'invert(28%) sepia(93%) saturate(1654%) hue-rotate(338deg) brightness(87%) contrast(97%)' }} />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-semibold text-primary">Error Report</h1>
              <span className="text-xs text-muted">#{report.id.substring(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Error Summary Card */}
          <Card className="p-4 sm:p-6 border-l-4 border-l-error">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <code className="text-sm font-mono text-error bg-error/10 px-2 py-1 rounded font-semibold">
                {errorName}
              </code>
              <Badge variant={report.status === 'open' ? 'error' : report.status === 'in_progress' ? 'warning' : 'success'}>
                {report.status === 'open' ? 'New' : report.status === 'in_progress' ? 'Investigating' : report.status === 'resolved' ? 'Fixed' : 'Closed'}
              </Badge>
            </div>
            
            <h2 className="text-lg sm:text-xl font-semibold text-primary mb-2 break-words">
              {errorMessage}
            </h2>
            
            <div className="flex flex-wrap gap-3 text-xs text-muted mt-4">
              <span className="flex items-center gap-1">
                <img src="/icon/user.svg" alt="" className="w-3 h-3" />
                {report.userName || 'Anonymous'}
              </span>
              <span className="flex items-center gap-1">
                <img src="/icon/mail.svg" alt="" className="w-3 h-3" />
                {report.userEmail}
              </span>
              <span className="flex items-center gap-1">
                <img src="/icon/calendar.svg" alt="" className="w-3 h-3" />
                {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
          </Card>

          {/* Stack Trace */}
          {stack && (
            <Card className="p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <img src="/icon/code.svg" alt="" className="w-4 h-4 icon-dark" />
                Stack Trace
              </h3>
              <pre className="text-xs font-mono bg-surface-secondary p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto text-secondary">
                {stack}
              </pre>
            </Card>
          )}

          {/* Component Stack (React) */}
          {componentStack && (
            <Card className="p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <img src="/icon/layers.svg" alt="" className="w-4 h-4 icon-dark" />
                Component Stack
              </h3>
              <pre className="text-xs font-mono bg-surface-secondary p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto text-secondary">
                {componentStack}
              </pre>
            </Card>
          )}

          {/* Environment Info */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <img src="/icon/monitor.svg" alt="" className="w-4 h-4 icon-dark" />
              Environment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metadata.url && (
                <div className="p-3 bg-surface-secondary rounded-lg">
                  <div className="text-[10px] uppercase text-muted mb-1">URL</div>
                  <div className="text-xs text-primary break-all">{metadata.url}</div>
                </div>
              )}
              {metadata.userAgent && (
                <div className="p-3 bg-surface-secondary rounded-lg">
                  <div className="text-[10px] uppercase text-muted mb-1">User Agent</div>
                  <div className="text-xs text-primary break-all">{metadata.userAgent}</div>
                </div>
              )}
              {metadata.viewport && (
                <div className="p-3 bg-surface-secondary rounded-lg">
                  <div className="text-[10px] uppercase text-muted mb-1">Viewport</div>
                  <div className="text-xs text-primary">{metadata.viewport}</div>
                </div>
              )}
              {metadata.timestamp && (
                <div className="p-3 bg-surface-secondary rounded-lg">
                  <div className="text-[10px] uppercase text-muted mb-1">Timestamp</div>
                  <div className="text-xs text-primary">{new Date(metadata.timestamp).toLocaleString()}</div>
                </div>
              )}
              {metadata.errorHash && (
                <div className="p-3 bg-surface-secondary rounded-lg">
                  <div className="text-[10px] uppercase text-muted mb-1">Error Hash</div>
                  <code className="text-xs text-primary font-mono">{metadata.errorHash}</code>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-primary mb-3 sm:mb-4">Status</h3>
            <Select
              value={report.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={[
                { value: 'open', label: 'New' },
                { value: 'in_progress', label: 'Investigating' },
                { value: 'resolved', label: 'Fixed' },
                { value: 'closed', label: 'Closed' }
              ]}
            />
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-primary mb-3 sm:mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-start text-xs sm:text-sm" 
                onClick={() => handleStatusChange('in_progress')} 
                disabled={report.status === 'in_progress' || updatingStatus}
                loading={updatingStatus}
              >
                <img src="/icon/search.svg" alt="" className="w-3 h-3 sm:w-4 sm:h-4 icon-dark flex-shrink-0" />
                <span className="truncate">Mark Investigating</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-start text-xs sm:text-sm" 
                onClick={() => handleStatusChange('resolved')} 
                disabled={report.status === 'resolved' || updatingStatus}
                loading={updatingStatus}
              >
                <img src="/icon/check-circle.svg" alt="" className="w-3 h-3 sm:w-4 sm:h-4 icon-dark flex-shrink-0" />
                <span className="truncate">Mark Fixed</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-start text-xs sm:text-sm" 
                onClick={() => handleStatusChange('closed')} 
                disabled={report.status === 'closed' || updatingStatus}
                loading={updatingStatus}
              >
                <img src="/icon/x-circle.svg" alt="" className="w-3 h-3 sm:w-4 sm:h-4 icon-dark flex-shrink-0" />
                <span className="truncate">Close</span>
              </Button>
              <hr className="border-border my-2" />
              <Button 
                variant="destructive" 
                size="sm" 
                className="w-full justify-start text-xs sm:text-sm" 
                onClick={handleDelete} 
                disabled={deleting}
                loading={deleting}
              >
                <img src="/icon/trash-2.svg" alt="" className="w-3 h-3 sm:w-4 sm:h-4 icon-white flex-shrink-0" />
                <span className="truncate">Delete Report</span>
              </Button>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4 sm:p-6 bg-info/5 border-info/20">
            <h3 className="text-xs sm:text-sm font-medium text-info mb-2 flex items-center gap-2">
              <img src="/icon/lightbulb.svg" alt="" className="w-4 h-4" />
              Debug Tips
            </h3>
            <ul className="text-xs text-muted space-y-1.5">
              <li>• Check the stack trace for the error origin</li>
              <li>• Component stack shows React component hierarchy</li>
              <li>• Error hash helps identify duplicate reports</li>
              <li>• Viewport size may indicate responsive issues</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
