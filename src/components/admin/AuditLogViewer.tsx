import React from 'react';
import { History, Shield, Calendar, User, FileText } from 'lucide-react';
import { AuditLog } from '../../types';
import { formatToIST } from '../../utils/timezone';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold text-christmas-emerald">
            Administrative Audit Trail & Activity Logs
          </h3>
          <p className="text-xs text-gray-500">
            Immutable tracking of all publications, result modifications, and settings changes.
          </p>
        </div>
        <span className="text-xs font-mono bg-gray-100 text-gray-700 px-3 py-1 rounded-full border">
          {logs.length} Entries
        </span>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {logs.map((log) => {
            const isPublish = log.action.includes('PUBLISH');
            const isDelete = log.action.includes('DELETE');

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                        isPublish
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDelete
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      ID: {log.id}
                    </span>
                  </div>

                  <p className="font-semibold text-gray-900 text-sm">
                    {log.details}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{log.adminEmail}</span>
                    </span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-left sm:text-right flex-shrink-0 text-xs font-mono text-gray-500">
                  <div className="flex items-center sm:justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5 text-christmas-gold" />
                    <span>{formatToIST(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
