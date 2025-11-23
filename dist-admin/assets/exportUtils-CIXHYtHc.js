function l(o,d="export.csv"){if(!o||o.length===0)throw new Error("No data to export");const t=Object.keys(o[0]),r=[t.join(","),...o.map(i=>t.map(a=>{const e=i[a];return typeof e=="string"&&(e.includes(",")||e.includes('"'))?`"${e.replace(/"/g,'""')}"`:e}).join(","))].join(`
`),n=new Blob([r],{type:"text/csv;charset=utf-8;"});b(n,d)}function h(o){const d=o.map(t=>({ID:t.id,Email:t.email,Tier:t.tier||"free",Created:new Date(t.created_at).toLocaleDateString("vi-VN"),"Last Login":t.last_login?new Date(t.last_login).toLocaleDateString("vi-VN"):"Never",Profiles:t.profile_count||0,Analyses:t.analysis_count||0,Status:t.locked?"Locked":"Active"}));l(d,`users_export_${Date.now()}.csv`)}function s(o){const d=[];o.userGrowth&&o.userGrowth.forEach(t=>{d.push({Type:"User Growth",Date:t.date,Count:t.count,Value:t.count})}),o.tierDistribution&&Object.entries(o.tierDistribution).forEach(([t,r])=>{d.push({Type:"Tier Distribution",Date:new Date().toLocaleDateString("vi-VN"),Tier:t,Count:r})}),l(d,`analytics_export_${Date.now()}.csv`)}function c(o){const d=o.map(t=>({ID:t.id,User:t.user_email||t.user_id,Subject:t.subject,Category:t.category,Priority:t.priority,Status:t.status,Created:new Date(t.created_at).toLocaleDateString("vi-VN"),Updated:new Date(t.updated_at).toLocaleDateString("vi-VN")}));l(d,`support_tickets_${Date.now()}.csv`)}async function p(o,d="report.pdf"){const t=window.open("","_blank");t.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${d}</title>
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
      ${o}
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
  `),t.document.close()}function f(o,d,t){var n,i;const r=`
    <h1>Analytics Report</h1>
    <p>Generated on: ${new Date().toLocaleString("vi-VN")}</p>
    
    <h2>Overview Statistics</h2>
    <div>
      <div class="stat-card">
        <div class="stat-value">${(o==null?void 0:o.totalUsers)||0}</div>
        <div class="stat-label">Total Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(o==null?void 0:o.newUsers)||0}</div>
        <div class="stat-label">New Users (7 days)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(t==null?void 0:t.totalProfiles)||0}</div>
        <div class="stat-label">Total Profiles</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(t==null?void 0:t.totalAnalyses)||0}</div>
        <div class="stat-label">Total Analyses</div>
      </div>
    </div>
    
    <h2>Tier Distribution</h2>
    <table>
      <thead>
        <tr>
          <th>Tier</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries((d==null?void 0:d.tierDistribution)||{}).map(([a,e])=>`
          <tr>
            <td>${a}</td>
            <td>${e}</td>
            <td>${(e/((o==null?void 0:o.totalUsers)||1)*100).toFixed(1)}%</td>
          </tr>
        `).join("")}
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
          <td>${(t==null?void 0:t.totalProfiles)||0}</td>
          <td>${(t==null?void 0:t.avgProfilesPerUser)||0}</td>
        </tr>
        <tr>
          <td>Analyses</td>
          <td>${(t==null?void 0:t.totalAnalyses)||0}</td>
          <td>${(t==null?void 0:t.avgAnalysesPerUser)||0}</td>
        </tr>
        <tr>
          <td>Rewrites</td>
          <td>${(t==null?void 0:t.totalRewrites)||0}</td>
          <td>${((t==null?void 0:t.totalRewrites)/((o==null?void 0:o.totalUsers)||1)).toFixed(2)}</td>
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
          <td>${((n=t==null?void 0:t.profilesByStatus)==null?void 0:n.ready)||0}</td>
        </tr>
        <tr>
          <td>Pending</td>
          <td>${((i=t==null?void 0:t.profilesByStatus)==null?void 0:i.pending)||0}</td>
        </tr>
      </tbody>
    </table>
  `;p(r,`analytics_report_${Date.now()}.pdf`)}function b(o,d){const t=window.URL.createObjectURL(o),r=document.createElement("a");r.href=t,r.download=d,document.body.appendChild(r),r.click(),document.body.removeChild(r),window.URL.revokeObjectURL(t)}export{c as a,s as b,h as e,f as g};
