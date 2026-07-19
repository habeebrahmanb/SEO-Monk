// Index Analyzer Module

const IndexAnalyzer = {
  analyze: function(data) {
    let resultsHTML = '<div class="result-group"><h3>Index & Crawlability</h3>';
    let stats = { critical: 0, warnings: 0, passed: 0 };
    let scoreDeduction = 0;

    const robots = data.meta.robots || 'Default (Index, Follow)';
    if (robots.toLowerCase().includes('noindex')) {
      stats.critical++;
      scoreDeduction += 20;
      resultsHTML += Helpers.createResultItem('Robots Meta', 'Noindex', 'critical', 'Page is blocked from being indexed by search engines.');
    } else {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Robots Meta', 'Indexable', 'passed');
    }

    if (data.meta.canonical) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Canonical', data.meta.canonical, 'passed');
    } else {
      stats.warnings++;
      scoreDeduction += 5;
      resultsHTML += Helpers.createResultItem('Canonical', 'Missing', 'warning', 'Canonical tags prevent duplicate content indexing issues.');
    }

    resultsHTML += '</div><div class="result-group"><h3>Core Files</h3>';

    const origin = new URL(data.url).origin;

    if (data.network && data.network.robots) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Robots.txt', 'Detected', 'passed', null, `<a href="${origin}/robots.txt" target="_blank" style="color:#3b82f6;">${origin}/robots.txt</a>`);
    } else {
      stats.warnings++;
      resultsHTML += Helpers.createResultItem('Robots.txt', 'Not Found at Root', 'warning', 'Ensure a robots.txt file exists to guide search engine crawlers. <br>Create it at: <code>' + origin + '/robots.txt</code>');
    }

    if (data.network && data.network.sitemap) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('XML Sitemap', 'Detected', 'passed', null, `<a href="${origin}/sitemap.xml" target="_blank" style="color:#3b82f6;">${origin}/sitemap.xml</a>`);
    } else {
      resultsHTML += Helpers.createResultItem('XML Sitemap', 'Not Found at Root', 'info', 'If your sitemap is located elsewhere, ensure it is submitted via Google Search Console.');
    }

    resultsHTML += '</div><div class="result-group"><h3>Live Index Check</h3>';
    
    // Index check buttons
    const url = encodeURIComponent(data.url);
    resultsHTML += `
      <div style="display:flex; gap:10px; margin-top:10px;">
        <a href="https://www.google.com/search?q=site:${url}" target="_blank" class="btn btn-outline" style="text-decoration:none; color:inherit;">
          <svg class="icon"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg> Check Google Index
        </a>
        <a href="https://www.bing.com/search?q=site:${url}" target="_blank" class="btn btn-outline" style="text-decoration:none; color:inherit;">
          <svg class="icon"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></svg> Check Bing Index
        </a>
      </div>
    `;

    resultsHTML += '</div>';

    return {
      html: resultsHTML,
      deduction: scoreDeduction,
      stats: stats,
      exportData: { robots, hasRobotsTxt: data.network?.robots, hasSitemap: data.network?.sitemap }
    };
  }
};
