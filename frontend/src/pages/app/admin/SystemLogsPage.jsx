import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { CheckCircle, Search } from 'lucide-react';

export default function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('system_anomalies')
      .select('*, clubs(name)')
      .order('created_at', { ascending: false });

    if (error) console.error("Erreur chargement logs:", error);
    else setLogs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => filterSeverity === 'all' || log.severity === filterSeverity);
  }, [logs, filterSeverity]);

  const markResolved = async (id) => {
    const { error } = await supabase
      .from('system_anomalies')
      .update({ resolved: true })
      .eq('id', id);
    
    if (error) console.error("Erreur résolution:", error);
    else fetchLogs();
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'WARNING': return 'bg-amber-100 text-amber-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-950">Logs Anomalies</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6 flex gap-4">
        <select className="px-4 py-2 rounded-xl border border-slate-200" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="all">Toutes Sévérités</option>
          <option value="CRITICAL">Critique</option>
          <option value="WARNING">Attention</option>
          <option value="INFO">Info</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Sévérité</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Club</th>
              <th className="px-6 py-4">Message</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className={log.resolved ? 'opacity-50' : ''}>
                <td className="px-6 py-4 text-sm">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${getSeverityStyle(log.severity)}`}>{log.severity}</span></td>
                <td className="px-6 py-4 font-bold text-sm">{log.category}</td>
                <td className="px-6 py-4 text-sm">{log.clubs?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{log.message}</td>
                <td className="px-6 py-4">
                  {!log.resolved && (
                    <button onClick={() => markResolved(log.id)} className="text-emerald-600 hover:text-emerald-800">
                      <CheckCircle className="w-5 h-5"/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
