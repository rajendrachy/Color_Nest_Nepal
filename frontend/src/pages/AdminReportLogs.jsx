import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  FileText, User, Calendar, Clock, 
  Download, Search, Filter, Shield, 
  History, ArrowLeft, RefreshCw, Eye, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import './AdminReportLogs.css';

const AdminReportLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/report-logs');
      setLogs(data);
    } catch (error) {
      toast.error('Failed to retrieve audit trail');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.reportName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || log.reportType === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportLogsToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setTextColor(196, 30, 58);
    doc.text("ColorNest Nepal - Report Audit Trail", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    autoTable(doc, {
      head: [["Admin", "Type", "Filename", "Date", "Time"]],
      body: filteredLogs.map(log => [
        log.user?.name, 
        log.reportType, 
        log.reportName, 
        new Date(log.downloadTimestamp).toLocaleDateString(),
        new Date(log.downloadTimestamp).toLocaleTimeString()
      ]),
      startY: 35,
      headStyles: { fillColor: [196, 30, 58] }
    });

    // Preview in new tab
    window.open(doc.output('bloburl'), '_blank');
    
    // Also save it
    doc.save(`Audit_Trail_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Audit trail generated and opened for viewing');
  };

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Decrypting Audit Logs...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content" style={{ padding: 0 }}>
        <section className="audit-hero-section">
          <div className="hero-flex-container container">
            <div className="header-info">
              <div className="flex-align">
                <Link to="/admin/payments" className="back-link-premium" style={{ color: 'white' }}>
                  <ArrowLeft size={18} />
                </Link>
                <h1>Report Audit Trail</h1>
              </div>
              <p>Comprehensive record of all financial report downloads and data exports.</p>
            </div>
            <div className="header-action-group">
              <button className="btn-glass primary" onClick={exportLogsToPDF}>
                <FileText size={18} /> Export Audit PDF
              </button>
              <button className="btn-glass" onClick={fetchLogs}>
                <RefreshCw size={18} /> Sync Logs
              </button>
            </div>
          </div>
        </section>

        <div className="filter-glass-bar container">
          <div className="search-finance">
            <Search size={18} />
            <input 
              placeholder="Search by user or file name..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="filter-group-premium">
            <Filter size={16} />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Formats</option>
              <option value="PDF">PDF Reports</option>
              <option value="CSV">CSV Exports</option>
            </select>
          </div>
        </div>

        <div className="premium-table-card mt-20 container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Report Format</th>
                <th>Filename</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log._id} className="row-item">
                  <td>
                    <div className="user-mini">
                      <div className="user-avatar-text">{log.user?.name.charAt(0)}</div>
                      <div className="user-info">
                        <strong>{log.user?.name}</strong>
                        <span>{log.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`format-badge ${log.reportType.toLowerCase()}`}>
                      {log.reportType === 'PDF' ? <FileText size={14} /> : <Download size={14} />}
                      {log.reportType}
                    </span>
                  </td>
                  <td>
                    <code className="filename-code">{log.reportName}</code>
                  </td>
                  <td>
                    <div className="timestamp-cell">
                      <div className="date-box">
                        <Calendar size={12} />
                        {new Date(log.downloadTimestamp).toLocaleDateString()}
                      </div>
                      <div className="time-box">
                        <Clock size={12} />
                        {new Date(log.downloadTimestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="view-btn-circle" onClick={() => setSelectedLog(log)}>
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="empty-state-premium">
              <History size={48} />
              <p>No audit records found matching your criteria.</p>
            </div>
          )}
        </div>

        {selectedLog && (
          <div className="modal-overlay-premium" onClick={() => setSelectedLog(null)}>
            <div className="modal-content-premium animate-fade" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h2>Audit Record Detail</h2>
                <button className="close-btn" onClick={() => setSelectedLog(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="premium-form" style={{ padding: '30px' }}>
                <div className="insight-advanced-item" style={{ marginBottom: '20px', borderLeftColor: 'var(--primary)' }}>
                  <div className="insight-icon-box">
                    <Shield size={20} color="var(--primary)" />
                  </div>
                  <div className="insight-text-content">
                    <strong>Verified System Event</strong>
                    <p>This event was securely logged by the ColorNest Audit System.</p>
                  </div>
                </div>
                
                <div className="detail-grid-premium">
                  <div className="detail-item-premium" style={{ marginBottom: '15px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Administrator</label>
                    <div className="user-mini">
                      <div className="user-avatar-text">{selectedLog.user?.name.charAt(0)}</div>
                      <strong>{selectedLog.user?.name}</strong>
                    </div>
                  </div>
                  <div className="detail-item-premium" style={{ marginBottom: '15px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Report Identity</label>
                    <code className="filename-code">{selectedLog.reportName}</code>
                  </div>
                  <div className="detail-item-premium" style={{ marginBottom: '15px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Format</label>
                    <span className={`format-badge ${selectedLog.reportType.toLowerCase()}`}>
                      {selectedLog.reportType}
                    </span>
                  </div>
                  <div className="detail-item-premium">
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>Generated On</label>
                    <div className="timestamp-cell">
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{new Date(selectedLog.downloadTimestamp).toLocaleDateString()}</span>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(selectedLog.downloadTimestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer-premium" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '20px', background: '#f8fafc' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedLog(null)} style={{ background: '#e2e8f0', color: '#475569' }}>Close View</button>
                <button className="btn btn-primary" onClick={exportLogsToPDF} style={{ background: 'var(--primary)', color: 'white' }}>Export Full Audit</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReportLogs;
