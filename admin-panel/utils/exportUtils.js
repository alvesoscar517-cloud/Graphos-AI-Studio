/**
 * Export Utilities
 * Functions for exporting data to various formats
 */

/**
 * Export data to CSV
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Export users to CSV
 */
export function exportUsersToCSV(users) {
  const data = users.map(user => ({
    'ID': user.id,
    'Email': user.email,
    'Credits': user.credits?.balance || 0,
    'Created': new Date(user.created_at).toLocaleDateString('vi-VN'),
    'Last Login': user.last_login ? new Date(user.last_login).toLocaleDateString('vi-VN') : 'Never',
    'Profiles': user.profile_count || 0,
    'Analyses': user.analysis_count || 0,
    'Status': user.locked ? 'Locked' : 'Active'
  }));

  exportToCSV(data, `users_export_${Date.now()}.csv`);
}

/**
 * Export analytics to CSV
 */
export function exportAnalyticsToCSV(analytics) {
  const data = [];

  // User growth data
  if (analytics.userGrowth) {
    analytics.userGrowth.forEach(item => {
      data.push({
        'Type': 'User Growth',
        'Date': item.date,
        'Count': item.count,
        'Value': item.count
      });
    });
  }

  // Credit distribution
  if (analytics.creditDistribution) {
    Object.entries(analytics.creditDistribution).forEach(([segment, count]) => {
      data.push({
        'Type': 'Credit Distribution',
        'Date': new Date().toLocaleDateString('vi-VN'),
        'Segment': segment,
        'Count': count
      });
    });
  }

  exportToCSV(data, `analytics_export_${Date.now()}.csv`);
}

/**
 * Export support tickets to CSV
 */
export function exportSupportToCSV(tickets) {
  const data = tickets.map(ticket => ({
    'ID': ticket.id,
    'User': ticket.user_email || ticket.user_id,
    'Subject': ticket.subject,
    'Category': ticket.category,
    'Priority': ticket.priority,
    'Status': ticket.status,
    'Created': new Date(ticket.created_at).toLocaleDateString('vi-VN'),
    'Updated': new Date(ticket.updated_at).toLocaleDateString('vi-VN')
  }));

  exportToCSV(data, `support_tickets_${Date.now()}.csv`);
}

/**
 * Generate PDF report (basic implementation)
 */
export async function exportToPDF(content, filename = 'report.pdf') {
  // This is a placeholder - you would need a library like jsPDF or pdfmake
  // For now, we'll create an HTML page that can be printed to PDF
  
  const printWindow = window.open('', '_blank');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        h1 {
          color: #1f2937;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
        }
        h2 {
          color: #374151;
          margin-top: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .stat-card {
          display: inline-block;
          padding: 20px;
          margin: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          min-width: 200px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #3b82f6;
        }
        .stat-label {
          color: #6b7280;
          margin-top: 5px;
        }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      ${content}
      <div style="margin-top: 40px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Print / Save as PDF
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}

/**
 * Generate analytics PDF report
 */
export function generateAnalyticsReport(overview, userAnalytics, usageAnalytics) {
  const content = `
    <h1>Analytics Report</h1>
    <p>Generated on: ${new Date().toLocaleString('vi-VN')}</p>
    
    <h2>Overview Statistics</h2>
    <div>
      <div class="stat-card">
        <div class="stat-value">${overview?.totalUsers || 0}</div>
        <div class="stat-label">Total Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${overview?.newUsers || 0}</div>
        <div class="stat-label">New Users (7 days)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${usageAnalytics?.totalProfiles || 0}</div>
        <div class="stat-label">Total Profiles</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${usageAnalytics?.totalAnalyses || 0}</div>
        <div class="stat-label">Total Analyses</div>
      </div>
    </div>
    
    <h2>Credit Distribution</h2>
    <table>
      <thead>
        <tr>
          <th>Segment</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(userAnalytics?.creditDistribution || {}).map(([segment, count]) => `
          <tr>
            <td>${segment}</td>
            <td>${count}</td>
            <td>${((count / (overview?.totalUsers || 1)) * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>Usage Statistics</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Total</th>
          <th>Average per User</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Profiles</td>
          <td>${usageAnalytics?.totalProfiles || 0}</td>
          <td>${usageAnalytics?.avgProfilesPerUser || 0}</td>
        </tr>
        <tr>
          <td>Analyses</td>
          <td>${usageAnalytics?.totalAnalyses || 0}</td>
          <td>${usageAnalytics?.avgAnalysesPerUser || 0}</td>
        </tr>
        <tr>
          <td>Rewrites</td>
          <td>${usageAnalytics?.totalRewrites || 0}</td>
          <td>${(usageAnalytics?.totalRewrites / (overview?.totalUsers || 1)).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    
    <h2>Profile Status</h2>
    <table>
      <thead>
        <tr>
          <th>Status</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Ready</td>
          <td>${usageAnalytics?.profilesByStatus?.ready || 0}</td>
        </tr>
        <tr>
          <td>Pending</td>
          <td>${usageAnalytics?.profilesByStatus?.pending || 0}</td>
        </tr>
      </tbody>
    </table>
  `;
  
  exportToPDF(content, `analytics_report_${Date.now()}.pdf`);
}

/**
 * Helper function to download blob
 */
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export JSON data
 */
export function exportToJSON(data, filename = 'export.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * Create backup file
 */
export function createBackup(data) {
  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: data
  };
  
  exportToJSON(backup, `backup_${Date.now()}.json`);
}
