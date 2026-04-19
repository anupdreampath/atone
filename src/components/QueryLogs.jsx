import { useState, useEffect } from 'react';
import * as neonDb from '../utils/neonDb.js';
import '../styles/QueryLogs.css';

function QueryLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ field: '', action: '' });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const result = await neonDb.getQueryLogs();
      setLogs(result.rows || []);
    } catch (err) {
      setError('Failed to load logs: ' + err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all entries except the first one?')) {
      return;
    }
    try {
      setLoading(true);
      await neonDb.clearAllLogsExceptFirst();
      await loadLogs();
    } catch (err) {
      setError('Failed to clear logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const groupedLogs = logs.reduce((acc, log) => {
    const userId = log.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        user_id: userId,
        phone: '',
        email: '',
        action: log.action,
        ip_address: log.ip_address,
        created_at: log.created_at
      };
    }
    if (log.field_name === 'phone_number') {
      acc[userId].phone = log.query_value;
    } else if (log.field_name === 'email') {
      acc[userId].email = log.query_value;
    }
    return acc;
  }, {});

  const groupedLogsArray = Object.values(groupedLogs);

  const filteredLogs = groupedLogsArray.filter(log => {
    if (filter.field === 'phone' && !log.phone) return false;
    if (filter.field === 'email' && !log.email) return false;
    if (filter.action && log.action !== filter.action) return false;
    return true;
  });

  const actions = [...new Set(logs.map(l => l.action))];

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No logs to export');
      return;
    }

    const headers = ['SR#', 'Phone', 'Email', 'Action', 'IP Address', 'Time'];
    const rows = filteredLogs.map((log, index) => [
      index + 1,
      log.phone || '',
      log.email || '',
      log.action,
      log.ip_address,
      new Date(log.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          const str = String(cell);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `query-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="query-logs-container">
      <div className="logs-header">
        <h2>Query Logs</h2>
        <div className="header-actions">
          <button onClick={exportToCSV} className="export-btn">
            📥 Export CSV
          </button>
          <button onClick={handleClearAll} className="clear-btn">
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className="logs-filters">
        <select
          value={filter.field}
          onChange={(e) => setFilter({ ...filter, field: e.target.value })}
        >
          <option value="">All Fields</option>
          <option value="phone">Phone</option>
          <option value="email">Email</option>
        </select>

        <select
          value={filter.action}
          onChange={(e) => setFilter({ ...filter, action: e.target.value })}
        >
          <option value="">All Actions</option>
          {actions.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <button onClick={loadLogs} className="refresh-btn">🔄 Refresh</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : (
        <div className="logs-table">
          {filteredLogs.length === 0 ? (
            <p className="no-logs">No logs found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>SR#</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Action</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <tr key={log.user_id}>
                    <td>{index + 1}</td>
                    <td className="value-cell">{log.phone || '—'}</td>
                    <td className="value-cell">{log.email || '—'}</td>
                    <td>{log.action}</td>
                    <td>{log.ip_address}</td>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default QueryLogs;
