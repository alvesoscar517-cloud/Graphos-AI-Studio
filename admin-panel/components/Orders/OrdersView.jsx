import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/adminApi';
import { useNotify } from '../Common/NotificationProvider';
import PageHeader from '../Common/PageHeader';
import LoadingScreen from '../Common/LoadingScreen';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '@/lib/utils';

export default function OrdersView() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [costs, setCosts] = useState({
    lemonSqueezyFee: 5,
    lemonSqueezyFixed: 0.50,
    serverCost: 50,
    geminiApi: 0,
    firebaseCost: 25,
    domainCost: 1,
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
      } else if (activeTab === 'revenue' || activeTab === 'profit') {
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

  const getStatusVariant = (status) => {
    const map = {
      paid: 'success', active: 'success',
      pending: 'warning', paused: 'warning',
      refunded: 'error', cancelled: 'error', expired: 'default'
    };
    return map[status] || 'default';
  };

  if (loading && !orders.length && !subscriptions.length && !revenueStats) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        icon="dollar-sign.svg"
        title="Orders & Revenue"
        subtitle="Manage orders, subscriptions and revenue analytics"
      />

      {/* Tabs - Scrollable on mobile */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 sm:mt-6">
        <TabsList className="overflow-x-auto scrollbar-hide flex-nowrap">
          <TabsTrigger value="orders" className="gap-1.5 sm:gap-2 whitespace-nowrap">
            <img src="/icon/shopping-cart.svg" alt="" className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
            <span className="sm:hidden">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-1.5 sm:gap-2 whitespace-nowrap">
            <img src="/icon/repeat.svg" alt="" className="w-4 h-4" />
            <span className="hidden sm:inline">Subscriptions</span>
            <span className="sm:hidden">Subs</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1.5 sm:gap-2 whitespace-nowrap">
            <img src="/icon/trending-up.svg" alt="" className="w-4 h-4" />
            <span>Revenue</span>
          </TabsTrigger>
          <TabsTrigger value="profit" className="gap-1.5 sm:gap-2 whitespace-nowrap">
            <img src="/icon/calculator.svg" alt="" className="w-4 h-4" />
            <span>Profit</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders Tab - Responsive */}
      {activeTab === 'orders' && (
        <Card className={cn("mt-4 overflow-hidden transition-opacity duration-200", loading && "opacity-60")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Order ID</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">User</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden sm:table-cell">Product</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Amount</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap">Status</th>
                  <th className="p-2 sm:p-3 text-left text-[10px] sm:text-xs font-medium text-muted uppercase whitespace-nowrap hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="6" className="p-6 sm:p-8 text-center text-muted text-sm">No orders found</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="border-b border-border hover:bg-surface-secondary transition-colors">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm font-mono text-muted">
                        #{order.orderId?.toString().slice(-6) || order.id.slice(0, 6)}
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="text-xs sm:text-sm text-primary truncate max-w-[120px] sm:max-w-none">{order.customerEmail || 'N/A'}</div>
                        {order.userId && (
                          <button 
                            className="text-[10px] sm:text-xs text-info hover:underline"
                            onClick={() => navigate(`/users/${order.userId}`)}
                          >
                            View
                          </button>
                        )}
                      </td>
                      <td className="p-2 sm:p-3 hidden sm:table-cell">
                        <div className="text-xs sm:text-sm font-medium text-primary truncate max-w-[150px]">{order.productName || order.packageId || 'N/A'}</div>
                        {order.variantName && <div className="text-[10px] sm:text-xs text-muted truncate">{order.variantName}</div>}
                      </td>
                      <td className="p-2 sm:p-3 text-sm sm:text-lg font-semibold text-primary whitespace-nowrap">
                        {order.totalFormatted || formatCurrency(order.total || 0)}
                      </td>
                      <td className="p-2 sm:p-3">
                        <Badge variant={getStatusVariant(order.status || 'paid')}>
                          {order.status || 'paid'}
                        </Badge>
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm text-muted hidden md:table-cell whitespace-nowrap">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <Card className={cn("mt-4 overflow-hidden transition-opacity duration-200", loading && "opacity-60")}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">ID</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">User</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Plan</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Renews At</th>
                  <th className="p-3 text-left text-xs font-medium text-muted uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-muted">No subscriptions found</td></tr>
                ) : (
                  subscriptions.map(sub => (
                    <tr key={sub.id} className="border-b border-border hover:bg-surface-secondary transition-colors">
                      <td className="p-3 text-sm font-mono text-muted">
                        #{sub.subscriptionId?.toString().slice(-8) || sub.id.slice(0, 8)}
                      </td>
                      <td className="p-3">
                        {sub.userId && (
                          <button 
                            className="text-sm text-info hover:underline"
                            onClick={() => navigate(`/users/${sub.userId}`)}
                          >
                            {sub.userId.slice(0, 12)}...
                          </button>
                        )}
                      </td>
                      <td className="p-3 text-sm text-primary">{sub.variantName || sub.productName || 'N/A'}</td>
                      <td className="p-3"><Badge variant={getStatusVariant(sub.status)}>{sub.status}</Badge></td>
                      <td className="p-3 text-sm text-muted">
                        {sub.renewsAt ? new Date(sub.renewsAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 text-sm text-muted">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && revenueStats && (
        <div className="mt-4 space-y-6">
          <div className="flex justify-end">
            <Select
              value={String(timeRange)}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              options={[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' }
              ]}
              className="w-36"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-secondary flex items-center justify-center">
                <img src="/icon/dollar-sign.svg" alt="" className="w-6 h-6 icon-dark" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">${revenueStats.totalRevenue?.toFixed(2) || '0.00'}</div>
                <div className="text-xs text-muted">Total Revenue</div>
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-secondary flex items-center justify-center">
                <img src="/icon/shopping-cart.svg" alt="" className="w-6 h-6 icon-dark" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{revenueStats.orderCount || 0}</div>
                <div className="text-xs text-muted">Total Orders</div>
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-surface-secondary flex items-center justify-center">
                <img src="/icon/trending-up.svg" alt="" className="w-6 h-6 icon-dark" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">${revenueStats.averageOrderValue || '0.00'}</div>
                <div className="text-xs text-muted">Avg Order Value</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Revenue Trend</h3>
              <div className="flex items-end gap-1 h-32">
                {revenueStats.revenueTrend?.map((day, index) => {
                  const max = Math.max(...revenueStats.revenueTrend.map(d => d.revenue || 1));
                  const height = Math.max(5, (day.revenue / max) * 100);
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-primary rounded-t transition-all"
                        style={{ height: `${height}%` }}
                        title={`${day.date}: $${(day.revenue / 100).toFixed(2)}`}
                      />
                      {index % 7 === 0 && <span className="text-xxs text-muted">{day.date.slice(5)}</span>}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Revenue by Package</h3>
              <div className="space-y-3">
                {revenueStats.revenueByPackage?.map((pkg, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                    <div>
                      <div className="font-medium text-primary">{pkg.package}</div>
                      <div className="text-xs text-muted">{pkg.count} orders</div>
                    </div>
                    <div className="text-lg font-semibold text-primary">${pkg.revenue?.toFixed(2)}</div>
                  </div>
                ))}
                {(!revenueStats.revenueByPackage || revenueStats.revenueByPackage.length === 0) && (
                  <div className="text-center py-4 text-muted">No data available</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Profit Tab */}
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


function ProfitCalculator({ revenueStats, costs, setCosts, timeRange, setTimeRange, loadRevenueStats }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!revenueStats) {
      setLoading(true);
      loadRevenueStats().finally(() => setLoading(false));
    }
  }, [timeRange]);

  const grossRevenue = revenueStats?.totalRevenue || 0;
  const orderCount = revenueStats?.orderCount || 0;
  const lemonSqueezyFees = (grossRevenue * (costs.lemonSqueezyFee / 100)) + (orderCount * costs.lemonSqueezyFixed);
  
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
    <div className="mt-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <img src="/icon/coins.svg" alt="" className="w-6 h-6 icon-dark" />
            Profit Calculator
          </h2>
          <p className="text-sm text-muted mt-1">Estimate your actual profit after deducting all costs</p>
        </div>
        <Select
          value={String(timeRange)}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          options={[
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' }
          ]}
          className="w-36"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-2">
            <img src="/icon/dollar-sign.svg" alt="" className="w-4 h-4" />
            Gross Revenue
          </div>
          <div className="text-2xl font-bold text-primary">${grossRevenue.toFixed(2)}</div>
          <div className="text-xs text-muted mt-1">{orderCount} orders</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted mb-2">
            <img src="/icon/minus-circle.svg" alt="" className="w-4 h-4" />
            Total Costs
          </div>
          <div className="text-2xl font-bold text-destructive">-${totalCosts.toFixed(2)}</div>
          <div className="text-xs text-muted mt-1">All expenses</div>
        </Card>

        <Card className={cn("p-5", netProfit >= 0 ? "bg-success/5" : "bg-destructive/5")}>
          <div className="flex items-center gap-2 text-sm text-muted mb-2">
            <img src="/icon/trending-up.svg" alt="" className="w-4 h-4" />
            Net Profit
          </div>
          <div className={cn("text-2xl font-bold", netProfit >= 0 ? "text-success" : "text-destructive")}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
          </div>
          <div className="text-xs text-muted mt-1">{profitMargin}% margin</div>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <img src="/icon/chart-pie.svg" alt="" className="w-5 h-5 icon-dark" />
            Cost Breakdown
          </h3>
          <div className="space-y-3">
            <CostItem 
              name="Lemon Squeezy Fees" 
              desc={`${costs.lemonSqueezyFee}% + $${costs.lemonSqueezyFixed}/transaction`}
              value={lemonSqueezyFees}
              highlight
            />
            <CostItem name="Server (Cloud Run/GCP)" desc={`$${costs.serverCost}/month`} value={serverCosts} />
            <CostItem name="Firebase" desc={`$${costs.firebaseCost}/month`} value={firebaseCosts} />
            <CostItem name="AI API" desc={`$${costs.geminiApi}/month`} value={geminiCosts} />
            <CostItem name="Domain" desc={`$${costs.domainCost}/month`} value={domainCosts} />
            <CostItem name="Other Costs" desc="Misc expenses" value={otherCosts} />
            <div className="flex justify-between pt-3 border-t border-border font-semibold">
              <span>Total ({timeRange} days)</span>
              <span className="text-destructive">-${totalCosts.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Cost Editor */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <img src="/icon/settings.svg" alt="" className="w-5 h-5 icon-dark" />
            Adjust Monthly Costs
          </h3>
          <p className="text-xs text-muted mb-4">Edit these values to match your actual costs</p>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="LS Fee (%)"
              type="number"
              step="0.1"
              value={costs.lemonSqueezyFee}
              onChange={(e) => setCosts({...costs, lemonSqueezyFee: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="LS Fixed ($)"
              type="number"
              step="0.01"
              value={costs.lemonSqueezyFixed}
              onChange={(e) => setCosts({...costs, lemonSqueezyFixed: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="Server ($/mo)"
              type="number"
              value={costs.serverCost}
              onChange={(e) => setCosts({...costs, serverCost: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="Firebase ($/mo)"
              type="number"
              value={costs.firebaseCost}
              onChange={(e) => setCosts({...costs, firebaseCost: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="AI API ($/mo)"
              type="number"
              value={costs.geminiApi}
              onChange={(e) => setCosts({...costs, geminiApi: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="Domain ($/mo)"
              type="number"
              step="0.01"
              value={costs.domainCost}
              onChange={(e) => setCosts({...costs, domainCost: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="Other ($/mo)"
              type="number"
              value={costs.otherCosts}
              onChange={(e) => setCosts({...costs, otherCosts: parseFloat(e.target.value) || 0})}
              containerClassName="col-span-2"
            />
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted">Monthly Fixed Costs:</span>
            <span className="font-semibold">
              ${(costs.serverCost + costs.firebaseCost + costs.geminiApi + costs.domainCost + costs.otherCosts).toFixed(2)}
            </span>
          </div>
        </Card>
      </div>

      {/* Projections */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <img src="/icon/trending-up.svg" alt="" className="w-5 h-5 icon-dark" />
          Projections
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-secondary rounded-lg text-center">
            <div className="text-xs text-muted mb-1">Daily Average</div>
            <div className="text-xl font-bold text-primary">${(netProfit / timeRange).toFixed(2)}</div>
          </div>
          <div className="p-4 bg-surface-secondary rounded-lg text-center">
            <div className="text-xs text-muted mb-1">Monthly Estimate</div>
            <div className="text-xl font-bold text-primary">${((netProfit / timeRange) * 30).toFixed(2)}</div>
          </div>
          <div className="p-4 bg-surface-secondary rounded-lg text-center">
            <div className="text-xs text-muted mb-1">Yearly Estimate</div>
            <div className="text-xl font-bold text-primary">${((netProfit / timeRange) * 365).toFixed(2)}</div>
          </div>
          <div className="p-4 bg-surface-secondary rounded-lg text-center">
            <div className="text-xs text-muted mb-1">Break-even/month</div>
            <div className="text-xl font-bold text-primary">
              {grossRevenue > 0 && orderCount > 0
                ? Math.ceil((costs.serverCost + costs.firebaseCost + costs.geminiApi + costs.domainCost + costs.otherCosts) / 
                    Math.max(0.01, (grossRevenue / orderCount) - costs.lemonSqueezyFixed - ((grossRevenue / orderCount) * costs.lemonSqueezyFee / 100)))
                : 'N/A'
              }
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-surface-secondary rounded-lg text-sm text-muted">
        <img src="/icon/info.svg" alt="" className="w-5 h-5 mt-0.5 opacity-50" />
        <p>
          <strong>Note:</strong> This is an estimate for reference only. Actual costs may vary based on usage, 
          API calls, storage, and other factors.
        </p>
      </div>
    </div>
  );
}

function CostItem({ name, desc, value, highlight }) {
  return (
    <div className={cn("flex items-center justify-between py-2", highlight && "bg-surface-secondary -mx-2 px-2 rounded")}>
      <div>
        <div className="text-sm font-medium text-primary">{name}</div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <span className="text-sm text-destructive">-${value.toFixed(2)}</span>
    </div>
  );
}
