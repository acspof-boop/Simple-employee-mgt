import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  History, 
  Check, 
  AlertCircle, 
  CheckCircle2,
  FileJson
} from 'lucide-react';
import { storage } from '../../services/storage';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ isOpen, onClose }) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'backup' | 'logs'>('backup');
  const [logs, setLogs] = useState(storage.getLogs());

  if (!isOpen) return null;

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_management_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'Backup JSON downloaded successfully.' });
  };

  const handleImport = () => {
    if (!importJsonText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste valid backup JSON content.' });
      return;
    }

    const res = storage.importData(importJsonText);
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setImportJsonText('');
      setLogs(storage.getLogs());
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Database Snapshot & Audit Logs</h3>
              <p className="text-[10px] text-slate-400">High Density backup, restore snapshots, or inspect audit activity logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 text-sm"
          >
            ✕
          </button>
        </div>

        {statusMsg && (
          <div className={`mb-3 p-2.5 rounded-lg border flex items-center space-x-2 text-xs font-semibold ${
            statusMsg.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex space-x-2 border-b border-slate-100 pb-2 mb-4">
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeTab === 'backup'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Backup & Restore (Unlimited Free Storage)
          </button>
          <button
            onClick={() => {
              setActiveTab('logs');
              setLogs(storage.getLogs());
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Activity Audit Logs ({logs.length})
          </button>
        </div>

        {activeTab === 'backup' ? (
          <div className="space-y-3 text-xs">
            
            {/* Export */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Download JSON Snapshot</h4>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Export complete database containing all tasks, users, leaves, and logs.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export File</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Restore from JSON</h4>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Upload or paste a backup JSON string to restore application state.
                </p>
              </div>

              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
              />

              <textarea
                rows={3}
                placeholder="Or paste JSON backup content here..."
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded font-mono text-[10px] bg-white focus:ring-1 focus:ring-blue-500 outline-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleImport}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Restore Snapshot</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                  <span className="font-bold text-slate-700 uppercase">{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-900 font-medium text-xs mt-0.5">{log.details}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Triggered by: {log.userName} ({log.userId})</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
