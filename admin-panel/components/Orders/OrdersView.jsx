import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import CustomSelect from '../Common/CustomSelect';
import './OrdersView.css';

export default function OrdersView() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);
  const [costs, setCosts] = useState({
    lemonSqueezyFee: 5, // 5% + $0.50 per transaction
    lemonSqueezyFixed: 0.50,
    serverCost: 50, // Monthly server cost
    geminiApi: 0, // Gemini API cost (estimate per 1000 requests)
    firebaseCost: 25, // Firebase monthly cost
    domainCost: 1, // Domain monthly (yearly/12)
    otherCosts: 0
  });
  const navigate = useNavigate();
  const notify = useNotify();

  useEffect(() => {
    loadData();
  }, [activeTab, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'orders') {
        const response = await ordersApi.getAll({ limit: 50 });
        setOrders(response.orders);
      } else if (activeTab === 'subscriptions') {
        const response = await ordersApi.getSubscriptions({ limit: 50 });
        setSubscriptions(response.subscriptions);
      } else if (activeTab === 'revenue') {
        const response = await ordersApi.getRevenueStats(timeRange);
        setRevenueStats(response.stats);
      }
    } catch (err) {
      notify.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStatusBadge = (status) => {
    const colors = {
      paid: { bg: '#e8f5e9', color: '#2e7d32' },
      pending: { bg: '#fff3e0', color: '#e65100' },
      refunded: { bg: '#ffebee', color: '#c62828' },
      active: { bg: '#e8f5e9', color: '#2e7d32' },
      cancelled: { bg: '#ffebee', color: '#c62828' },
      expired: { bg: '#f5f5f5', color: '#666' },
      paused: { bg: '#fff3e0', color: '#e65100' }
    };
    const style = colors[status] || colors.pending;
    return (
      <span className="status-badge" style={{ background: style.bg, color: style.color }}>
        {status}
      </span>
    );
  };

  if (loading && !orders.length && !subscriptions.length && !revenueStats) {
    return <LoadingScreen />;
  }

  return (
    <div className="orders-view">
      <PageHeader
        icon="dollar-sign.svg"
        title="Orders & Revenue"
        subtitle="Manage orders, subscriptions and revenue analytics"
      />

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <img src="/icon/shopping-cart.svg" alt="Orders" />
          Orders
        </button>
        <button 
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          <img src="/icon/repeat.svg" alt="Subscriptions" />
          Subscriptions
        </button>
        <button 
          className={`tab ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          <img src="/icon/trending-up.svg" alt="Revenue" />
          Revenue
        </button>
        <button 
          className={`tab ${activeTab === 'profit' ? 'active' : ''}`}
          onClick={() => setActiveTab('profit')}
        >
          <img src="/icon/calculator.svg" alt="Profit" />
          Profit Calculator
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="orders-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-row">No orders found</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.orderId?.toString().slice(-8) || order.id.slice(0, 8)}</td>
                      <td>
                        <div className="user-cell">
                          <span className="user-email">{order.customerEmail || 'N/A'}</span>
                          {order.userId && (
                            <button 
                              className="btn-link"
                              onClick={() => navigate(`/users/${order.userId}`)}
                            >
                              View User
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="product-cell">
                          <span className="product-name">{order.productName || order.packageId || 'N/A'}</span>
                          {order.variantName && <span className="variant-name">{order.variantName}</span>}
                        </div>
                      </td>
                      <td className="amount-cell">{order.totalFormatted || formatCurrency(order.total || 0)}</td>
                      <td>{getStatusBadge(order.status || 'paid')}</td>
                      <td className="date-cell">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="subscriptions-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subscription ID</th>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Renews At</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-row">No subscriptions found</td>
                  </tr>
                ) : (
                  subscriptions.map(sub => (
                    <tr key={sub.id}>
                      <td className="order-id">#{sub.subscriptionId?.toString().slice(-8) || sub.id.slice(0, 8)}</td>
                      <td>
                        {sub.userId && (
                          <button 
                            className="btn-link"
                            onClick={() => navigate(`/users/${sub.userId}`)}
                          >
                            {sub.userId.slice(0, 12)}...
                          </button>
                        )}
                      </td>
                      <td>{sub.variantName || sub.productName || 'N/A'}</td>
                      <td>{getStatusBadge(sub.status)}</td>
                      <td className="date-cell">
                        {sub.renewsAt ? new Date(sub.renewsAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="date-cell">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && revenueStats && (
        <div className="revenue-section">
          <div className="revenue-header">
            <CustomSelect
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              options={[
                { value: 7, label: 'Last 7 days' },
                { value: 30, label: 'Last 30 days' },
                { value: 90, label: 'Last 90 days' }
              ]}
            />
          </div>

          <div className="revenue-stats-grid">
            <div className="revenue-stat-card">
              <div className="stat-icon">
                <img src="/icon/dollar-sign.svg" alt="Revenue" />
              </div>
              <div className="stat-content">
                <div className="stat-value">${revenueStats.totalRevenue?.toFixed(2) || '0.00'}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>
            <div className="revenue-stat-card">
              <div className="stat-icon">
                <img src="/icon/shopping-cart.svg" alt="Orders" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{revenueStats.orderCount || 0}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>
            <div className="revenue-stat-card">
              <div className="stat-icon">
                <img src="/icon/trending-up.svg" alt="Average" />
              </div>
              <div className="stat-content">
                <div className="stat-value">${revenueStats.averageOrderValue || '0.00'}</div>
                <div className="stat-label">Avg Order Value</div>
              </div>
            </div>
          </div>

          <div className="revenue-charts">
            <div className="chart-card">
              <h3>Revenue Trend</h3>
              <div className="simple-chart">
                {revenueStats.revenueTrend?.map((day, index) => (
                  <div key={index} className="chart-bar-container">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${Math.max(5, (day.revenue / Math.max(...revenueStats.revenueTrend.map(d => d.revenue || 1))) * 100)}%` 
                      }}
                      title={`${day.date}: $${(day.revenue / 100).toFixed(2)}`}
                    />
                    {index % 7 === 0 && (
                      <span className="chart-label">{day.date.slice(5)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h3>Revenue by Package</h3>
              <div className="package-list">
                {revenueStats.revenueByPackage?.map((pkg, index) => (
                  <div key={index} className="package-item">
                    <div className="package-info">
                      <span className="package-name">{pkg.package}</span>
                      <span className="package-count">{pkg.count} orders</span>
                    </div>
                    <span className="package-revenue">${pkg.revenue?.toFixed(2)}</span>
                  </div>
                ))}
                {(!revenueStats.revenueByPackage || revenueStats.revenueByPackage.length === 0) && (
                  <div className="empty-state">No data available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profit' && (
        <ProfitCalculator 
          revenueStats={revenueStats}
          costs={costs}
          setCosts={setCosts}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          loadRevenueStats={async () => {
            const response = await ordersApi.getRevenueStats(timeRange);
            setRevenueStats(response.stats);
          }}
        />
      )}
    </div>
  );
}

// Profit Calculator Component
function ProfitCalculator({ revenueStats, costs, setCosts, timeRange, setTimeRange, loadRevenueStats }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!revenueStats) {
      setLoading(true);
      loadRevenueStats().finally(() => setLoading(false));
    }
  }, [timeRange]);

  // Calculate profits
  const grossRevenue = revenueStats?.totalRevenue || 0;
  const orderCount = revenueStats?.orderCount || 0;
  
  // Lemon Squeezy fees: 5% + $0.50 per transaction
  const lemonSqueezyFees = (grossRevenue * (costs.lemonSqueezyFee / 100)) + (orderCount * costs.lemonSqueezyFixed);
  
  // Monthly costs (prorated based on time range)
  const monthlyMultiplier = timeRange / 30;
  const serverCosts = costs.serverCost * monthlyMultiplier;
  const firebaseCosts = costs.firebaseCost * monthlyMultiplier;
  const domainCosts = costs.domainCost * monthlyMultiplier;
  const geminiCosts = costs.geminiApi * monthlyMultiplier;
  const otherCosts = costs.otherCosts * monthlyMultiplier;
  
  const totalCosts = lemonSqueezyFees + serverCosts + firebaseCosts + domainCosts + geminiCosts + otherCosts;
  const netProfit = grossRevenue - totalCosts;
  const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="profit-calculator-section">
      <div className="profit-header">
        <div className="profit-title">
          <h2><img src="/icon/coins.svg" alt="Profit" className="title-icon" /> Profit Calculator</h2>
          <p>Estimate your actual profit after deducting all costs</p>
        </div>
        <CustomSelect
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          options={[
            { value: 7, label: 'Last 7 days' },
            { value: 30, label: 'Last 30 days' },
            { value: 90, label: 'Last 90 days' }
          ]}
        />
      </div>

      <div className="profit-summary">
        <div className="profit-card gross">
          <div className="profit-card-header">
            <img src="/icon/dollar-sign.svg" alt="Revenue" />
            <span>Gross Revenue</span>
          </div>
          <div className="profit-card-value">${grossRevenue.toFixed(2)}</div>
          <div className="profit-card-sub">{orderCount} orders</div>
        </div>

        <div className="profit-card costs">
          <div className="profit-card-header">
            <img src="/icon/minus-circle.svg" alt="Costs" />
            <span>Total Costs</span>
          </div>
          <div className="profit-card-value">-${totalCosts.toFixed(2)}</div>
          <div className="profit-card-sub">All expenses</div>
        </div>

        <div className={`profit-card net ${netProfit >= 0 ? 'positive' : 'negative'}`}>
          <div className="profit-card-header">
            <img src="/icon/trending-up.svg" alt="Profit" />
            <span>Net Profit</span>
          </div>
          <div className="profit-card-value">
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
          </div>
          <div className="profit-card-sub">{profitMargin}% margin</div>
        </div>
      </div>

      <div className="profit-details">
        <div className="costs-breakdown">
          <h3><img src="/icon/chart-pie.svg" alt="Chart" className="section-icon" /> Cost Breakdown</h3>
          
          <div className="cost-item highlight">
            <div className="cost-info">
              <span className="cost-name">Lemon Squeezy Fees</span>
              <span className="cost-desc">{costs.lemonSqueezyFee}% + ${costs.lemonSqueezyFixed}/transaction</span>
            </div>
            <span className="cost-value">-${lemonSqueezyFees.toFixed(2)}</span>
          </div>

          <div className="cost-item">
            <div className="cost-info">
              <span className="cost-name">Server (Cloud Run/GCP)</span>
              <span className="cost-desc">${costs.serverCost}/month</span>
            </div>
            <span className="cost-value">-${serverCosts.toFixed(2)}</span>
          </div>

          <div className="cost-item">
            <div className="cost-info">
              <span className="cost-name">Firebase (Firestore, Auth)</span>
              <span className="cost-desc">${costs.firebaseCost}/month</span>
            </div>
            <span className="cost-value">-${firebaseCosts.toFixed(2)}</span>
          </div>

          <div className="cost-item">
            <div className="cost-info">
              <span className="cost-name">Gemini API</span>
              <span className="cost-desc">${costs.geminiApi}/month estimate</span>
            </div>
            <span className="cost-value">-${geminiCosts.toFixed(2)}</span>
          </div>

          <div className="cost-item">
            <div className="cost-info">
              <span className="cost-name">Domain</span>
              <span className="cost-desc">${costs.domainCost}/month</span>
            </div>
            <span className="cost-value">-${domainCosts.toFixed(2)}</span>
          </div>

          <div className="cost-item">
            <div className="cost-info">
              <span className="cost-name">Other Costs</span>
              <span className="cost-desc">Misc expenses</span>
            </div>
            <span className="cost-value">-${otherCosts.toFixed(2)}</span>
          </div>

          <div className="cost-total">
            <span>Total Costs ({timeRange} days)</span>
            <span>-${totalCosts.toFixed(2)}</span>
          </div>
        </div>

        <div className="costs-editor">
          <h3><img src="/icon/settings.svg" alt="Settings" className="section-icon" /> Adjust Monthly Costs</h3>
          <p className="editor-note">Edit these values to match your actual costs</p>

          <div className="cost-input-group">
            <label>
              <span>Lemon Squeezy Fee (%)</span>
              <input
                type="number"
                step="0.1"
                value={costs.lemonSqueezyFee}
                onChange={(e) => setCosts({...costs, lemonSqueezyFee: parseFloat(e.target.value) || 0})}
              />
            </label>
            <label>
              <span>LS Fixed Fee ($)</span>
              <input
                type="number"
                step="0.01"
                value={costs.lemonSqueezyFixed}
                onChange={(e) => setCosts({...costs, lemonSqueezyFixed: parseFloat(e.target.value) || 0})}
              />
            </label>
          </div>

          <div className="cost-input-group">
            <label>
              <span>Server Cost ($/month)</span>
              <input
                type="number"
                value={costs.serverCost}
                onChange={(e) => setCosts({...costs, serverCost: parseFloat(e.target.value) || 0})}
              />
            </label>
            <label>
              <span>Firebase ($/month)</span>
              <input
                type="number"
                value={costs.firebaseCost}
                onChange={(e) => setCosts({...costs, firebaseCost: parseFloat(e.target.value) || 0})}
              />
            </label>
          </div>

          <div className="cost-input-group">
            <label>
              <span>Gemini API ($/month)</span>
              <input
                type="number"
                value={costs.geminiApi}
                onChange={(e) => setCosts({...costs, geminiApi: parseFloat(e.target.value) || 0})}
              />
            </label>
            <label>
              <span>Domain ($/month)</span>
              <input
                type="number"
                step="0.01"
                value={costs.domainCost}
                onChange={(e) => setCosts({...costs, domainCost: parseFloat(e.target.value) || 0})}
              />
            </label>
          </div>

          <div className="cost-input-group">
            <label className="full-width">
              <span>Other Costs ($/month)</span>
              <input
                type="number"
                value={costs.otherCosts}
                onChange={(e) => setCosts({...costs, otherCosts: parseFloat(e.target.value) || 0})}
              />
            </label>
          </div>

          <div className="monthly-total">
            <span>Total Monthly Fixed Costs:</span>
            <strong>${(costs.serverCost + costs.firebaseCost + costs.geminiApi + costs.domainCost + costs.otherCosts).toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="profit-projections">
        <h3><img src="/icon/trending-up.svg" alt="Growth" className="section-icon" /> Projections</h3>
        <div className="projections-grid">
          <div className="projection-card">
            <span className="projection-label">Daily Average</span>
            <span className="projection-value">${(netProfit / timeRange).toFixed(2)}</span>
          </div>
          <div className="projection-card">
            <span className="projection-label">Monthly Estimate</span>
            <span className="projection-value">${((netProfit / timeRange) * 30).toFixed(2)}</span>
          </div>
          <div className="projection-card">
            <span className="projection-label">Yearly Estimate</span>
            <span className="projection-value">${((netProfit / timeRange) * 365).toFixed(2)}</span>
          </div>
          <div className="projection-card">
            <span className="projection-label">Break-even Orders/month</span>
            <span className="projection-value">
              {grossRevenue > 0 && orderCount > 0
                ? Math.ceil((costs.serverCost + costs.firebaseCost + costs.geminiApi + costs.domainCost + costs.otherCosts) / 
                    Math.max(0.01, (grossRevenue / orderCount) - costs.lemonSqueezyFixed - ((grossRevenue / orderCount) * costs.lemonSqueezyFee / 100)))
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="profit-disclaimer">
        <img src="/icon/info.svg" alt="Info" />
        <p>
          <strong>Note:</strong> This is an estimate for reference only. Actual costs may vary based on usage, 
          API calls, storage, and other factors. Lemon Squeezy fees are calculated as {costs.lemonSqueezyFee}% + ${costs.lemonSqueezyFixed} per transaction.
        </p>
      </div>
    </div>
  );
}
