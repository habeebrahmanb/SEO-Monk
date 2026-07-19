// Helper Functions

const Helpers = {
  createResultItem: function(title, value, status, recommendation = null, detailsHtml = null) {
    let statusClass = 'status-info';
    let statusText = 'INFO';

    if (status === 'success' || status === 'passed') {
      statusClass = 'status-passed';
      statusText = 'PASSED';
    } else if (status === 'warning') {
      statusClass = 'status-warning';
      statusText = 'WARNING';
    } else if (status === 'error' || status === 'critical') {
      statusClass = 'status-critical';
      statusText = 'CRITICAL';
    }

    let html = `
      <div class="item-row">
        <div style="flex:1">
          <div class="item-title">${title}</div>
          <div class="item-desc">${value}</div>
    `;

    if (recommendation) {
      const type = status === 'critical' ? 'danger' : 'warning';
      html += `
          <div class="suggestion-box ${type}">
            <div class="suggestion-title">Recommendation</div>
            ${recommendation}
          </div>
      `;
    }

    if (detailsHtml) {
      html += `
          <details style="margin-top: 10px; font-size: 13px; color: #4b5563; background: #f9fafb; padding: 8px; border-radius: 6px; border: 1px solid #e5e7eb; max-height: 200px; overflow-y: auto;">
            <summary style="cursor: pointer; font-weight: 500; outline: none; user-select: none;">View Details</summary>
            <div style="margin-top: 8px; word-break: break-all;">
              ${detailsHtml}
            </div>
          </details>
      `;
    }

    html += `
        </div>
        <div class="item-status ${statusClass}">${statusText}</div>
      </div>
    `;
    return html;
  },

  calculateWordCount: function(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  },

  getScoreDeduction: function(issues) {
    let deduction = 0;
    issues.forEach(issue => {
      deduction += issue.weight || 0;
    });
    return deduction;
  }
};
