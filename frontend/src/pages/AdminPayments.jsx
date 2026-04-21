import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import api from '../services/api';
import { 
  Landmark, Search, Filter, Download, 
  FileText, Calendar, CreditCard, 
  ArrowUpRight, ArrowDownRight, TrendingUp,
  PieChart, Activity, Briefcase, Zap, Globe, 
  BarChart3, RefreshCw, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import './AdminPaymentsAdvanced.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [activeRange, setActiveRange] = useState(30);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/orders');
      const completedPayments = data.filter(order => order.paymentStatus === 'completed');
      setPayments(completedPayments);
    } catch (error) {
      toast.error('Failed to sync financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (days) => {
    setActiveRange(days);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const filteredPayments = payments.filter(p => {
    const pDate = new Date(p.createdAt).toISOString().split('T')[0];
    const matchesSearch = 
      p.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    const matchesDate = (!dateRange.start || pDate >= dateRange.start) && 
                       (!dateRange.end || pDate <= dateRange.end);
    return matchesSearch && matchesMethod && matchesDate;
  });

  const analytics = filteredPayments.reduce((acc, p) => {
    const revenue = p.totalAmount;
    const cost = p.items.reduce((sum, item) => sum + ((item.paint?.costPricePerLiter || 0) * item.quantity), 0);
    acc.revenue += revenue;
    acc.cost += cost;
    acc.profit += (revenue - cost - (p.deliveryCharge || 0));
    return acc;
  }, { revenue: 0, cost: 0, profit: 0 });

  const stats = {
    revenue: analytics.revenue,
    profit: analytics.profit,
    margin: analytics.revenue > 0 ? (analytics.profit / analytics.revenue) * 100 : 0,
    count: filteredPayments.length,
    avg: filteredPayments.length > 0 ? analytics.revenue / filteredPayments.length : 0
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Customer', 'Date', 'Revenue', 'Profit', 'Method'];
    const rows = filteredPayments.map(p => {
      const cost = p.items.reduce((sum, item) => sum + ((item.paint?.costPricePerLiter || 0) * item.quantity), 0);
      const profit = p.totalAmount - cost - (p.deliveryCharge || 0);
      return [p.orderId, p.user?.name, new Date(p.createdAt).toLocaleDateString(), p.totalAmount, profit.toFixed(2), p.paymentMethod];
    });
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Financial_Report_${new Date().toISOString()}.csv`;
    link.click();
    
    // Log the download
    try {
      api.post('/admin/report-logs', { 
        reportType: 'CSV', 
        reportName: `Financial_Report_${new Date().toISOString()}.csv` 
      });
    } catch (error) {
      console.error('Failed to log report download', error);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setTextColor(196, 30, 58);
    doc.text("ColorNest Nepal - Financial Analytics Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${dateRange.start || 'Start'} to ${dateRange.end}`, 14, 28);
    
    autoTable(doc, {
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", `Rs. ${stats.revenue.toLocaleString()}`],
        ["Net Profit", `Rs. ${stats.profit.toLocaleString()}`],
        ["Margin", `${stats.margin.toFixed(1)}%`],
        ["Orders", stats.count.toString()]
      ],
      startY: 35,
      styles: { cellPadding: 5 }
    });

    autoTable(doc, {
      head: [["ID", "Customer", "Date", "Amount", "Method"]],
      body: filteredPayments.map(p => [p.orderId, p.user?.name, new Date(p.createdAt).toLocaleDateString(), `Rs. ${p.totalAmount}`, p.paymentMethod]),
      startY: doc.lastAutoTable.finalY + 10,
      headStyles: { fillColor: [196, 30, 58] }
    });

    doc.save(`Financial_Report.pdf`);
  };

  const exportVoucherPDF = (payment) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(196, 30, 58);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("OFFICIAL PAYMENT VOUCHER", 105, 25, { align: 'center' });
    
    // Company Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text("ColorNest Nepal Pvt. Ltd.", 14, 50);
    doc.text("Kathmandu, Nepal", 14, 55);
    doc.text("Contact: +977-1-4444444", 14, 60);
    
    // Voucher Meta
    doc.setFont("helvetica", "bold");
    doc.text(`VOUCHER NO: #${payment.orderId}`, 140, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`DATE: ${new Date(payment.createdAt).toLocaleDateString()}`, 140, 55);
    doc.text(`METHOD: ${payment.paymentMethod}`, 140, 60);

    // Customer Section
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 70, 182, 30, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO:", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.text(payment.user?.name || 'Walk-in Customer', 20, 86);
    doc.text(payment.user?.email || 'N/A', 20, 92);
    doc.text(payment.user?.phone || 'N/A', 130, 86);

    // Items Table
    autoTable(doc, {
      head: [["Product Description", "Qty", "Price", "Subtotal"]],
      body: payment.items.map(item => [
        item.paint?.name || 'Standard Paint',
        `${item.quantity}L`,
        `Rs. ${item.price}`,
        `Rs. ${item.price * item.quantity}`
      ]),
      startY: 110,
      headStyles: { fillColor: [196, 30, 58] },
      margin: { left: 14, right: 14 }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL AMOUNT: Rs. ${payment.totalAmount.toLocaleString()}`, 140, finalY + 10);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated document. No signature is required.", 105, 280, { align: 'center' });

    doc.save(`Voucher_${payment.orderId}.pdf`);
    
    // Log download
    try {
      api.post('/admin/report-logs', { 
        reportType: 'PDF', 
        reportName: `Voucher_${payment.orderId}.pdf` 
      });
    } catch (error) {
      console.error('Failed to log report download', error);
    }
    toast.success('Voucher exported successfully');
  };

  if (loading) return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-content container">
        <div className="loader-box-premium">
          <div className="pulse-loader"></div>
          <p>Processing Financial Intelligence...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="payments-advanced-layout">
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-content" style={{ padding: 0 }}>
          <section className="finance-hero-section">
            <div className="finance-header-flex container">
              <div className="hero-text">
                <h1>Financial Intelligence</h1>
                <p>Monitor your performance, analyze margins, and drive growth with advanced analytics.</p>
              </div>
              <div className="header-action-group">
                <button className="btn-glass" onClick={exportToCSV}><Download size={18} /> Export Data</button>
                <button className="btn-glass primary" onClick={exportToPDF}><FileText size={18} /> Financial PDF</button>
                <button className="btn-glass" onClick={fetchPayments}><RefreshCw size={18} /></button>
              </div>
            </div>
          </section>

          <div className="filter-glass-bar container">
            <div className="range-toggle-group">
              <button className={`range-btn ${activeRange === 7 ? 'active' : ''}`} onClick={() => handleRangeChange(7)}>1 Week</button>
              <button className={`range-btn ${activeRange === 30 ? 'active' : ''}`} onClick={() => handleRangeChange(30)}>1 Month</button>
              <button className={`range-btn ${activeRange === 365 ? 'active' : ''}`} onClick={() => handleRangeChange(365)}>1 Year</button>
            </div>
            <div className="date-picker-group">
              <div className="input-glass-group clickable" onClick={() => document.getElementById('date-start').showPicker()}>
                <label><Calendar size={12} /> Period Start</label>
                <input type="date" id="date-start" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
              </div>
              <div className="input-glass-group clickable" onClick={() => document.getElementById('date-end').showPicker()}>
                <label><Calendar size={12} /> Period End</label>
                <input type="date" id="date-end" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="finance-stats-grid container">
            <div className="finance-card">
              <div className="finance-card-icon red"><TrendingUp size={24} /></div>
              <div className="finance-card-info">
                <h4>Total Revenue</h4>
                <h2>Rs. {stats.revenue.toLocaleString()}</h2>
              </div>
              <div className="finance-card-trend up"><ArrowUpRight size={14} /> Global Growth</div>
            </div>
            <div className="finance-card">
              <div className="finance-card-icon green"><Zap size={24} /></div>
              <div className="finance-card-info">
                <h4>Net Profit (Est.)</h4>
                <h2>Rs. {stats.profit.toLocaleString()}</h2>
              </div>
              <div className="finance-card-trend up"><ArrowUpRight size={14} /> Yielding Profit</div>
            </div>
            <div className="finance-card">
              <div className="finance-card-icon blue"><Activity size={24} /></div>
              <div className="finance-card-info">
                <h4>Net Margin</h4>
                <h2>{stats.margin.toFixed(1)}%</h2>
              </div>
              <div className="finance-card-trend up"><Globe size={14} /> Efficiency Index</div>
            </div>
            <div className="finance-card">
              <div className="finance-card-icon orange"><BarChart3 size={24} /></div>
              <div className="finance-card-info">
                <h4>Avg Order</h4>
                <h2>Rs. {stats.avg.toLocaleString(undefined, {maximumFractionDigits:0})}</h2>
              </div>
              <div className="finance-card-trend"><Briefcase size={14} /> Transaction Size</div>
            </div>
          </div>

          <div className="finance-content-split container">
            <div className="premium-table-card">
              <div className="table-title-flex">
                <h3>Transactions Ledger</h3>
                <div className="search-finance">
                  <Search size={18} />
                  <input placeholder="Filter by ID or name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer</th>
                    <th>Timeline</th>
                    <th>Payment</th>
                    <th>Revenue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p._id} className="row-item">
                      <td><span className="id-badge">#{p.orderId}</span></td>
                      <td>
                        <div className="user-mini">
                          <div className="user-avatar-text">{p.user?.name.charAt(0)}</div>
                          <strong>{p.user?.name}</strong>
                        </div>
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-pill-finance completed`}>{p.paymentMethod}</span></td>
                      <td><strong style={{ color: 'var(--finance-secondary)' }}>Rs. {p.totalAmount.toLocaleString()}</strong></td>
                      <td>
                        <button className="view-btn-circle" onClick={() => setSelectedPayment(p)}>
                          <Search size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No financial records in selected period.</p>}
            </div>

            <aside className="insights-premium-card">
              <h3>Strategy Insights</h3>
              <div className="insight-advanced-item">
                <div className="insight-icon-box"><TrendingUp size={20} color="var(--finance-info)" /></div>
                <div className="insight-text-content">
                  <strong>Revenue Optimization</strong>
                  <p>Your current margin of {stats.margin.toFixed(1)}% is healthy. Increasing average order value by 5% could yield Rs. {(stats.revenue * 0.05).toLocaleString()} extra profit.</p>
                </div>
              </div>
              <div className="insight-advanced-item success">
                <div className="insight-icon-box"><RefreshCw size={20} color="var(--finance-success)" /></div>
                <div className="insight-text-content">
                  <strong>Inventory Efficiency</strong>
                  <p>Turnover is high for top categories. Maintain stock levels above 20L to avoid delivery delays during peak periods.</p>
                </div>
              </div>
              <div className="insight-advanced-item warning">
                <div className="insight-icon-box"><AlertTriangle size={20} color="var(--finance-warning)" /></div>
                <div className="insight-text-content">
                  <strong>Cost Containment</strong>
                  <p>Shipping logistics are impacting your net margin. Review regional delivery charges for remote districts to optimize costs.</p>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 'auto' }} onClick={exportToPDF}>Download Full Audit</button>
            </aside>
          </div>
        </main>

        {selectedPayment && (
          <div className="modal-overlay-premium" onClick={() => setSelectedPayment(null)}>
            <div className="modal-content-premium animate-fade" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <div className="modal-header voucher-header">
                <div className="voucher-title">
                  <Landmark size={24} />
                  <div>
                    <h2>Official Payment Voucher</h2>
                    <p>Transaction ID: #{selectedPayment.orderId}</p>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setSelectedPayment(null)}>
                  <Search size={20} style={{ transform: 'rotate(45deg)' }} /> 
                </button>
              </div>
              
              <div className="premium-form voucher-body" style={{ padding: '40px' }}>
                <div className="voucher-section grid-2">
                  <div className="voucher-box">
                    <label className="voucher-label">Customer Profile</label>
                    <div className="voucher-val-stack">
                      <div className="voucher-data-row">
                        <label className="tiny-label">Full Name</label>
                        <strong className="voucher-name">{selectedPayment.user?.name || 'Valued Customer'}</strong>
                      </div>
                      <div className="voucher-data-row">
                        <label className="tiny-label">Email Address</label>
                        <span className="voucher-sub">{selectedPayment.user?.email || 'N/A'}</span>
                      </div>
                      <div className="voucher-data-row">
                        <label className="tiny-label">Phone Contact</label>
                        <span className="voucher-sub">{selectedPayment.user?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="voucher-box text-right">
                    <label className="voucher-label">Payment Breakdown</label>
                    <div className="voucher-val-stack">
                      <span className="status-pill-finance completed">{selectedPayment.paymentMethod} Verified</span>
                      <span className="voucher-date">{new Date(selectedPayment.createdAt).toLocaleDateString()}</span>
                      <h3 className="voucher-total">Rs. {selectedPayment.totalAmount.toLocaleString()}</h3>
                    </div>
                  </div>
                </div>

                <div className="voucher-items-section mt-30">
                  <label className="voucher-label">Product Specifications</label>
                  <table className="voucher-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPayment.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong style={{ color: '#1e293b' }}>{item.paint?.name || 'Custom Mix / Special Order'}</strong>
                            <div className="mini-subtext">
                              {item.paint ? `${item.paint.category} • ${item.paint.colorCode}` : 'Standard Grade • N/A'}
                            </div>
                          </td>
                          <td>{item.quantity}L</td>
                          <td>Rs. {item.price.toLocaleString()}</td>
                          <td style={{ fontWeight: '700', color: '#1e293b' }}>Rs. {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="voucher-footer-info mt-30">
                  <div className="voucher-address-box">
                    <label className="voucher-label">Logistics Destination</label>
                    <div className="voucher-address-text">
                      <p><strong>Street:</strong> {selectedPayment.deliveryAddress.street || 'N/A'}</p>
                      <p><strong>Location:</strong> {selectedPayment.deliveryAddress.city}, {selectedPayment.deliveryAddress.province}</p>
                      <p><strong>Postal:</strong> {selectedPayment.deliveryAddress.zipCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="voucher-stamp">
                    <Shield size={44} strokeWidth={1.5} color="rgba(196, 30, 58, 0.2)" />
                    <span>CERTIFIED</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer-premium voucher-footer">
                <button className="btn-glass secondary-dark" onClick={() => setSelectedPayment(null)}>Close</button>
                <button className="btn-premium-red" onClick={() => exportVoucherPDF(selectedPayment)}>
                  <Download size={18} /> Download Official Voucher
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple AlertTriangle icon from lucide if not imported
const AlertTriangle = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

export default AdminPayments;
