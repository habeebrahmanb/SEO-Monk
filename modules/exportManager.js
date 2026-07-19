// Export Manager Module

const ExportManager = {
  data: {},
  
  setData: function(dataObj) {
    this.data = dataObj;
  },

  generateHTMLString: function(forPrint = false) {
    const css = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      body { font-family: 'Inter', -apple-system, sans-serif; background: ${forPrint ? '#fff' : '#f3f4f6'}; color: #1f2937; padding: ${forPrint ? '0' : '40px 20px'}; margin: 0; line-height: 1.6; }
      .container { max-width: 850px; margin: 0 auto; background: #fff; border-radius: ${forPrint ? '0' : '16px'}; box-shadow: ${forPrint ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.05)'}; padding: 40px; overflow: hidden; }
      .header { padding-bottom: 24px; margin-bottom: 32px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
      .header-left { flex: 1; }
      .header-right { text-align: right; }
      .header-title { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px; }
      .header-subtitle { font-size: 15px; color: #64748b; font-weight: 400; margin: 0; }
      .dev-badge { display: inline-block; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 8px; border: 1px solid #e2e8f0; }
      .dev-badge a { color: #0f172a; text-decoration: none; font-weight: 700; }
      
      .audit-meta { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 32px 40px; border-radius: 16px; margin-bottom: 48px; border: 1px solid #e2e8f0; color: #0f172a; page-break-inside: avoid; }
      .meta-left { flex: 1; }
      .meta-item { margin-bottom: 16px; }
      .meta-item:last-child { margin-bottom: 0; }
      .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 6px; display: block; }
      .meta-value { font-size: 15px; color: #0f172a; font-weight: 600; word-break: break-all; }
      .meta-value a { color: #2563eb; text-decoration: none; transition: color 0.2s; }
      .meta-right { text-align: right; border-left: 1px solid #e2e8f0; padding-left: 48px; margin-left: 20px; }
      .score-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; display: block; }
      .score { font-size: 64px; font-weight: 800; line-height: 1; margin: 0; letter-spacing: -2px; }
      .score.excellent { color: #16a34a; }
      .score.average { color: #d97706; }
      .score.poor { color: #dc2626; }
      h2 { margin-top: 48px; margin-bottom: 20px; font-size: 20px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; align-items: center; gap: 10px; page-break-after: avoid; }
      h2::before { content: ""; display: block; width: 12px; height: 12px; background: #3b82f6; border-radius: 3px; }
      .result-group { margin-bottom: 32px; page-break-inside: avoid; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
      .result-group h3 { font-size: 15px; margin: 0; padding: 16px 20px; color: #334155; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; }
      .item-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; gap: 20px; page-break-inside: avoid; }
      .item-row:last-child { border-bottom: none; }
      .item-content { flex: 1; }
      .item-title { font-weight: 600; font-size: 15px; color: #1e293b; margin-bottom: 4px; }
      .item-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 6px; }
      .item-status { font-weight: 700; font-size: 12px; padding: 6px 12px; border-radius: 20px; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; }
      .status-passed { background: #dcfce7; color: #166534; box-shadow: 0 1px 2px rgba(22, 101, 52, 0.1); }
      .status-warning { background: #fef3c7; color: #92400e; box-shadow: 0 1px 2px rgba(146, 64, 14, 0.1); }
      .status-critical { background: #fee2e2; color: #991b1b; box-shadow: 0 1px 2px rgba(153, 27, 27, 0.1); }
      .status-info { background: #dbeafe; color: #1e40af; box-shadow: 0 1px 2px rgba(30, 64, 175, 0.1); }
      .suggestion-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-top: 12px; font-size: 13px; border-radius: 0 6px 6px 0; color: #7f1d1d; }
      .suggestion-box.warning { background: #fffbeb; border-left-color: #f59e0b; color: #78350f; }
      .suggestion-title { font-weight: 700; margin-bottom: 6px; display: block; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; opacity: 0.8; }
      details { margin-top: 12px; font-size: 13px; color: #334155; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
      summary { cursor: pointer; font-weight: 600; outline: none; color: #0f172a; }
      summary:hover { color: #2563eb; }
      details[open] summary { margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #cbd5e1; }
      .footer { margin-top: 80px; padding-top: 30px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px; page-break-inside: avoid; }
      .footer-brand { font-weight: 700; color: #0f172a; font-size: 16px; margin-bottom: 8px; }
      .social-links { display: flex; justify-content: center; gap: 24px; margin-top: 20px; }
      .social-links a { color: #94a3b8; text-decoration: none; font-weight: 500; font-size: 13px; transition: color 0.2s; text-transform: uppercase; letter-spacing: 1px; }
    `;

    const scoreClass = this.data.score < 50 ? 'poor' : (this.data.score < 90 ? 'average' : 'excellent');

    // For print, convert <details> tags to standard <div> blocks because html2canvas often fails to render <details> content
    const replaceDetails = forPrint ? 
      (html) => {
        if (!html) return '';
        let processed = html.replace(/<details[^>]*>/g, '<div style="margin-top: 12px; font-size: 13px; color: #334155; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">');
        processed = processed.replace(/<summary[^>]*>.*?<\/summary>/g, '<div style="font-weight: 600; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #cbd5e1; color: #0f172a;">View Details:</div>');
        processed = processed.replace(/<\/details>/g, '</div>');
        return processed;
      } : 
      (html) => html || '';

    const devName = localStorage.getItem('seo-monk-dev-name') || 'HABEEB RAHMAN';
    const devLink = localStorage.getItem('seo-monk-dev-link') || 'https://www.linkedin.com/in/habeebrahmanb';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>SEO Monk Audit Report - ${this.data.url}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-left">
              <h1 class="header-title">SEO Monk</h1>
              <p class="header-subtitle">Professional SEO Audit Report</p>
            </div>
            <div class="header-right">
              <div class="dev-badge">Report by <a href="${devLink}" target="_blank">${devName}</a></div>
              <div style="font-size: 13px; font-weight: 600;"><a href="https://www.bestfreelanceseo.com/?utm_source=google&utm_medium=referral&utm_campaign=chrome" target="_blank" style="color: #2563eb; text-decoration: none;">Best Freelance SEO</a></div>
            </div>
          </div>
          
          <div class="audit-meta">
            <div class="meta-left">
              <div class="meta-item">
                <span class="meta-label">Target URL</span>
                <span class="meta-value"><a href="${this.data.url}" target="_blank">${this.data.url}</a></span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Audit Date</span>
                <span class="meta-value">${new Date(this.data.timestamp).toLocaleString()}</span>
              </div>
            </div>
            <div class="meta-right">
              <span class="score-label">Overall Score</span>
              <div class="score ${scoreClass}">${this.data.score || 0}<span style="font-size:32px; color:#16a34a; font-weight:600;">/100</span></div>
            </div>
          </div>
          
          ${this.data.htmlContent.recommendations ? this.data.htmlContent.recommendations : ''}
          
          <h2>SEO Analysis</h2>
          ${replaceDetails(this.data.htmlContent.seo)}
          
          <h2>Image Analysis</h2>
          ${replaceDetails(this.data.htmlContent.images)}
          
          <h2>Link Analysis</h2>
          ${replaceDetails(this.data.htmlContent.links)}
          
          <h2>Keyword Analysis</h2>
          ${replaceDetails(this.data.htmlContent.keywords)}
          
          <h2>Index Analysis</h2>
          ${replaceDetails(this.data.htmlContent.index)}
          
          <h2>Technology Profile</h2>
          ${replaceDetails(this.data.htmlContent.tech)}
          
          <h2>AI / LLM Analysis</h2>
          ${replaceDetails(this.data.htmlContent.llm)}

          ${this.data.htmlContent.pagespeed ? `
          <h2>PageSpeed Insights</h2>
          ${this.data.htmlContent.pagespeed}
          ` : ''}

          <div class="footer">
            <p class="footer-brand" style="margin-bottom: 0;">SEO Monk Audit Report - <a href="https://www.bestfreelanceseo.com/?utm_source=google&utm_medium=referral&utm_campaign=chrome" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 600;">Best Freelance SEO</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  exportHTML: function() {
    const html = this.generateHTMLString(false);
    this.downloadBlob(html, 'text/html', 'seo-monk-audit.html');
  },

  exportPDF: function() {
    const htmlString = this.generateHTMLString(true);
    
    if (typeof html2pdf !== 'undefined') {
      const btn = document.getElementById('export-pdf');
      const originalText = btn.innerText;
      btn.innerText = 'Generating PDF...';
      btn.disabled = true;

      // Pass the HTML string directly to html2pdf
      html2pdf().set({
        margin: [15, 10, 15, 10],
        filename: 'seo-monk-audit.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(htmlString).save().then(() => {
        btn.innerText = originalText;
        btn.disabled = false;
      }).catch(err => {
        console.error('PDF generation error:', err);
        btn.innerText = originalText;
        btn.disabled = false;
        alert('Failed to generate PDF. Please try again.');
      });
    } else {
      // Fallback
      const printHtml = htmlString.replace('</body>', '<script>window.onload = function() { window.print(); }</script></body>');
      const blob = new Blob([printHtml], { type: 'text/html' });
      chrome.tabs.create({ url: URL.createObjectURL(blob) });
    }
  },

  exportExcel: function() {
    let table = `<html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8"></head>
    <body><table>
      <tr><th style="text-align:left; font-weight:bold;">Category</th><th style="text-align:left; font-weight:bold;">Metric</th><th style="text-align:left; font-weight:bold;">Value</th></tr>`;
      
    const addRow = (cat, metric, val) => {
      table += `<tr><td>${cat}</td><td>${metric}</td><td>${val}</td></tr>`;
    };

    if (this.data.seo) {
      addRow('SEO', 'Title Length', this.data.seo.title?.length || 0);
      addRow('SEO', 'Description Length', this.data.seo.desc?.length || 0);
      addRow('SEO', 'H1 Count', this.data.seo.h1Count);
      addRow('SEO', 'H2 Count', this.data.seo.h2Count);
    }
    if (this.data.images) {
      addRow('Images', 'Total', this.data.images.total);
      addRow('Images', 'Missing ALT', this.data.images.missingAlt);
      addRow('Images', 'Empty ALT', this.data.images.emptyAlt);
      addRow('Images', 'Duplicate ALTs', this.data.images.duplicateAlts);
      addRow('Images', 'Broken Images', this.data.images.broken);
      addRow('Images', 'Large Images', this.data.images.largeImages);
    }
    if (this.data.links) {
      addRow('Links', 'Total', this.data.links.total);
      addRow('Links', 'Internal', this.data.links.internal);
      addRow('Links', 'External', this.data.links.external);
      addRow('Links', 'Empty Anchor Text', this.data.links.emptyText);
      addRow('Links', 'Nofollow', this.data.links.nofollow);
      addRow('Links', 'Invalid/Empty Links', this.data.links.potentiallyBroken);
    }
    if (this.data.tech) {
      addRow('Tech', 'Load Time', this.data.tech.loadTime + 'ms');
      addRow('Tech', 'FCP', this.data.tech.fcp + 'ms');
      addRow('Tech', 'LCP', this.data.tech.lcp + 'ms');
    }
    if (this.data.index) {
      addRow('Index', 'Robots Meta', this.data.index.robots);
      addRow('Index', 'Has Robots.txt', this.data.index.hasRobotsTxt);
      addRow('Index', 'Has Sitemap', this.data.index.hasSitemap);
    }
    if (this.data.llm) {
      addRow('LLM', 'Has llms.txt', this.data.llm.hasLlmsTxt);
      addRow('LLM', 'Paragraphs Count', this.data.llm.paragraphsCount);
    }

    table += `</table></body></html>`;
    this.downloadBlob(table, 'application/vnd.ms-excel', 'seo-monk-audit.xls');
  },

  exportCSV: function() {
    let csv = "Category,Metric,Value\n";
    
    const addRow = (cat, metric, val) => {
      csv += `"${cat}","${metric}","${val}"\n`;
    };

    if (this.data.seo) {
      addRow('SEO', 'Title Length', this.data.seo.title?.length || 0);
      addRow('SEO', 'Description Length', this.data.seo.desc?.length || 0);
      addRow('SEO', 'H1 Count', this.data.seo.h1Count);
      addRow('SEO', 'H2 Count', this.data.seo.h2Count);
    }
    if (this.data.images) {
      addRow('Images', 'Total', this.data.images.total);
      addRow('Images', 'Missing ALT', this.data.images.missingAlt);
      addRow('Images', 'Empty ALT', this.data.images.emptyAlt);
      addRow('Images', 'Duplicate ALTs', this.data.images.duplicateAlts);
      addRow('Images', 'Broken Images', this.data.images.broken);
      addRow('Images', 'Large Images', this.data.images.largeImages);
    }
    if (this.data.links) {
      addRow('Links', 'Total', this.data.links.total);
      addRow('Links', 'Internal', this.data.links.internal);
      addRow('Links', 'External', this.data.links.external);
      addRow('Links', 'Empty Anchor Text', this.data.links.emptyText);
      addRow('Links', 'Nofollow', this.data.links.nofollow);
      addRow('Links', 'Invalid/Empty Links', this.data.links.potentiallyBroken);
    }
    if (this.data.tech) {
      addRow('Tech', 'Load Time', this.data.tech.loadTime + 'ms');
      addRow('Tech', 'FCP', this.data.tech.fcp + 'ms');
      addRow('Tech', 'LCP', this.data.tech.lcp + 'ms');
    }
    if (this.data.index) {
      addRow('Index', 'Robots Meta', this.data.index.robots);
      addRow('Index', 'Has Robots.txt', this.data.index.hasRobotsTxt);
      addRow('Index', 'Has Sitemap', this.data.index.hasSitemap);
    }
    if (this.data.llm) {
      addRow('LLM', 'Has llms.txt', this.data.llm.hasLlmsTxt);
      addRow('LLM', 'Paragraphs Count', this.data.llm.paragraphsCount);
    }

    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    this.downloadFile(dataStr, 'seo-monk-audit.csv');
  },



  downloadFile: function(dataStr, filename) {
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  downloadBlob: function(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
};
