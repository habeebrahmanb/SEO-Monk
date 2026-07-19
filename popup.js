// Popup Main Controller

document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navItems = document.querySelectorAll('.nav-item[data-target]');
  const views = document.querySelectorAll('.view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      views.forEach(view => view.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(item.dataset.target).classList.add('active');
    });
  });

  // Theme Switcher
  const themeSelect = document.getElementById('theme-select');
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeSelect.value = theme;
    localStorage.setItem('seo-monk-theme', theme);
  }

  const savedTheme = localStorage.getItem('seo-monk-theme') || 'system';
  setTheme(savedTheme);

  themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  // Report Settings
  const nameInput = document.getElementById('report-name');
  const linkInput = document.getElementById('report-link');
  const psKeyInput = document.getElementById('pagespeed-api-key');
  
  if (psKeyInput) {
    psKeyInput.value = localStorage.getItem('seo-monk-ps-key') || '';
    psKeyInput.addEventListener('input', (e) => localStorage.setItem('seo-monk-ps-key', e.target.value.trim()));
  }
  
  if (nameInput) {
    nameInput.value = localStorage.getItem('seo-monk-dev-name') || 'HABEEB RAHMAN';
    nameInput.addEventListener('input', (e) => localStorage.setItem('seo-monk-dev-name', e.target.value));
  }
  
  if (linkInput) {
    linkInput.value = localStorage.getItem('seo-monk-dev-link') || 'https://www.linkedin.com/in/habeebrahmanb';
    linkInput.addEventListener('input', (e) => localStorage.setItem('seo-monk-dev-link', e.target.value));
  }

  // Actions
  document.getElementById('re-audit-btn').addEventListener('click', () => runAudit(true));

  // Exports
  document.getElementById('export-pdf').addEventListener('click', () => ExportManager.exportPDF());
  document.getElementById('export-html').addEventListener('click', () => ExportManager.exportHTML());

  // Run audit on load
  runAudit();
});

function runAudit(forceReAudit = false) {
  const loading = document.getElementById('loading-overlay');
  const progressBar = document.getElementById('audit-progress');
  loading.classList.add('active');
  progressBar.style.width = '10%';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    
    if (!activeTab || activeTab.url.startsWith('chrome://')) {
      alert('Cannot audit this page. Please open a regular website.');
      loading.classList.remove('active');
      return;
    }

    const url = activeTab.url.split('#')[0];
    document.getElementById('header-title').innerText = activeTab.title || 'Unknown Title';
    document.getElementById('header-url').innerText = url;
    if (activeTab.favIconUrl) {
      document.getElementById('header-favicon').src = activeTab.favIconUrl;
    }

    progressBar.style.width = '30%';

    // Check Cache First
    chrome.storage.local.get([url], (result) => {
      if (result[url] && !forceReAudit) {
        // If we have cached data and aren't forcing a re-audit, just load it and stop.
        processAuditData(result[url]);
        loading.classList.remove('active');
        
        // If we loaded from cache but PageSpeed hasn't finished/saved yet, fetch it in background
        if (!result[url].pagespeed) {
          fetchPageSpeed(url);
        }
        return;
      }

      // If no cache or forceReAudit is true, run the live audit
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['content.js']
      }, () => {
        progressBar.style.width = '50%';
        
        chrome.tabs.sendMessage(activeTab.id, { action: 'extractData' }, (response) => {
          progressBar.style.width = '80%';
          
          if (chrome.runtime.lastError || !response) {
            console.error(chrome.runtime.lastError);
            alert('Failed to connect to page. Make sure the page has fully loaded.');
            loading.classList.remove('active');
            return;
          }

          // Save fresh data to storage
          chrome.storage.local.set({ [url]: response });
          processAuditData(response);
          progressBar.style.width = '100%';
          
          setTimeout(() => {
            loading.classList.remove('active');
          }, 300);
        });
      });

      // Run PageSpeed API only on fresh audit
      fetchPageSpeed(url);
    });
  });
}

async function fetchPageSpeed(url) {
  const statusEl = document.getElementById('ps-status');
  statusEl.className = 'badge warning';
  statusEl.innerText = 'Analyzing...';
  
  try {
    let baseUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=seo&category=accessibility&category=best-practices`;
    
    const apiKey = localStorage.getItem('seo-monk-ps-key');
    if (apiKey) {
      baseUrl += `&key=${apiKey}`;
    }

    const [mobileRes, desktopRes] = await Promise.all([
      fetch(baseUrl + '&strategy=mobile'),
      fetch(baseUrl + '&strategy=desktop')
    ]);
    
    const mobileData = await mobileRes.json();
    const desktopData = await desktopRes.json();
    
    if (mobileData && mobileData.lighthouseResult && desktopData && desktopData.lighthouseResult) {
      const getScore = (cat) => cat && cat.score ? Math.round(cat.score * 100) : '--';
      
      const mCats = mobileData.lighthouseResult.categories;
      const dCats = desktopData.lighthouseResult.categories;
      
      document.getElementById('ps-mobile-performance').innerText = getScore(mCats.performance);
      document.getElementById('ps-mobile-accessibility').innerText = getScore(mCats.accessibility);
      document.getElementById('ps-mobile-best-practices').innerText = getScore(mCats['best-practices']);
      document.getElementById('ps-mobile-seo').innerText = getScore(mCats.seo);

      document.getElementById('ps-desktop-performance').innerText = getScore(dCats.performance);
      document.getElementById('ps-desktop-accessibility').innerText = getScore(dCats.accessibility);
      document.getElementById('ps-desktop-best-practices').innerText = getScore(dCats['best-practices']);
      document.getElementById('ps-desktop-seo').innerText = getScore(dCats.seo);
      
      statusEl.className = 'badge passed';
      statusEl.innerText = 'Analysis Complete';
      
      const getColor = (s) => s === '--' ? '#94a3b8' : s >= 90 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';      
      
      ExportManager.data.htmlContent.pagespeed = `
        <h3 style="font-size: 16px; margin-top: 10px; margin-bottom: 12px; color: #1e293b;">Mobile Analysis</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: #475569;">Performance</span>
            <span style="font-size: 24px; font-weight: 800; color: ${getColor(getScore(mCats.performance))};">${getScore(mCats.performance)}<span style="font-size: 14px; color: #94a3b8; font-weight: 600;">/100</span></span>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: #475569;">Accessibility</span>
            <span style="font-size: 24px; font-weight: 800; color: ${getColor(getScore(mCats.accessibility))};">${getScore(mCats.accessibility)}<span style="font-size: 14px; color: #94a3b8; font-weight: 600;">/100</span></span>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: #475569;">Best Practices</span>
            <span style="font-size: 24px; font-weight: 800; color: ${getColor(getScore(mCats['best-practices']))};">${getScore(mCats['best-practices'])}<span style="font-size: 14px; color: #94a3b8; font-weight: 600;">/100</span></span>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: #475569;">SEO</span>
            <span style="font-size: 24px; font-weight: 800; color: ${getColor(getScore(mCats.seo))};">${getScore(mCats.seo)}<span style="font-size: 14px; color: #94a3b8; font-weight: 600;">/100</span></span>
          </div>
        </div>

        <h3 style="font-size: 16px; margin-top: 10px; margin-bottom: 12px; color: #1e293b;">Desktop Analysis</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: #475569;">Performance</span>
            <span style="font-size: 24px; font-weight: 800; color: ${getColor(getScore(dCats.performance))};">${getScore(dCats.performance)}<span style="font-size: 14px; color: #94a3b8; font-weight: 600;">/100</span></span>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: #475569;">Accessibility</span>
            <span style="font-size: 24px; font-weight: 800; color: ${getColor(getScore(dCats.accessibility))};">${getScore(dCats.accessibility)}<span style="font-size: 14px; color: #94a3b8; font-weight: 600;">/100</span></span>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: #475569;">Best Practices</span>
            <span style="font-size: 24px; font-weight: 800; color: ${getColor(getScore(dCats['best-practices']))};">${getScore(dCats['best-practices'])}<span style="font-size: 14px; color: #94a3b8; font-weight: 600;">/100</span></span>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 600; color: #475569;">SEO</span>
            <span style="font-size: 24px; font-weight: 800; color: ${getColor(getScore(dCats.seo))};">${getScore(dCats.seo)}<span style="font-size: 14px; color: #94a3b8; font-weight: 600;">/100</span></span>
          </div>
        </div>
      `;
      
      // Save to cache
      chrome.storage.local.get([url], (res) => {
        if (res[url]) {
          res[url].pagespeed = {
            mobile: {
              performance: getScore(mCats.performance),
              accessibility: getScore(mCats.accessibility),
              bestPractices: getScore(mCats['best-practices']),
              seo: getScore(mCats.seo)
            },
            desktop: {
              performance: getScore(dCats.performance),
              accessibility: getScore(dCats.accessibility),
              bestPractices: getScore(dCats['best-practices']),
              seo: getScore(dCats.seo)
            }
          };
          chrome.storage.local.set({ [url]: res[url] });
        }
      });
    }
  } catch (err) {
    console.error('PageSpeed API Error:', err);
    statusEl.className = 'badge critical';
    statusEl.innerText = 'Failed to fetch API';
  }
}

function processAuditData(data) {
  let globalStats = { critical: 0, warnings: 0, passed: 0 };
  let globalScore = 100;

  // Run Modules
  const seoResults = SEOAnalyzer.analyze(data);
  const imageResults = ImageAnalyzer.analyze(data);
  const linkResults = LinkAnalyzer.analyze(data);
  const keywordResults = KeywordAnalyzer.analyze(data);
  const techResults = TechDetector.analyze(data);
  const indexResults = IndexAnalyzer.analyze(data);
  const llmResults = LLMAnalyzer.analyze(data);

  // Update UI Panels
  document.getElementById('seo-results').innerHTML = seoResults.html;
  document.getElementById('image-results').innerHTML = imageResults.html;
  document.getElementById('link-results').innerHTML = linkResults.html;
  document.getElementById('keyword-results').innerHTML = keywordResults.html;
  document.getElementById('tech-results').innerHTML = techResults.html;
  document.getElementById('index-results').innerHTML = indexResults.html;
  document.getElementById('llm-results').innerHTML = llmResults.html;

  // Populate SERP Preview
  document.getElementById('serp-title').textContent = data.title || 'Missing Title';
  document.getElementById('serp-desc').textContent = data.meta.description || 'Missing meta description. Google will choose a relevant snippet from your page content.';
  try {
    const urlObj = new URL(data.url);
    document.getElementById('serp-domain').textContent = urlObj.hostname;
    document.getElementById('serp-url').textContent = data.url;
  } catch(e) {}
  if (data.meta.favicon) document.getElementById('serp-favicon').src = data.meta.favicon;

  // PageSpeed Buttons
  const psUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(data.url)}`;
  document.getElementById('pagespeed-btn').href = psUrl;
  const externalPsBtn = document.getElementById('ps-external-btn');
  if (externalPsBtn) externalPsBtn.href = psUrl;

  // Aggregate Stats and Recommendations
  const moduleDefs = [
    { name: 'On-Page SEO', res: seoResults },
    { name: 'Images', res: imageResults },
    { name: 'Links', res: linkResults },
    { name: 'Keywords', res: keywordResults },
    { name: 'Performance', res: techResults },
    { name: 'Indexing', res: indexResults },
    { name: 'AI Optimization', res: llmResults }
  ];

  let recommendations = [];
  const parser = new DOMParser();

  moduleDefs.forEach(mod => {
    globalStats.critical += mod.res.stats.critical;
    globalStats.warnings += mod.res.stats.warnings;
    globalStats.passed += mod.res.stats.passed;
    if (mod.res.deduction) globalScore -= mod.res.deduction;

    const doc = parser.parseFromString(mod.res.html, 'text/html');
    const items = doc.querySelectorAll('.item-row');
    items.forEach(item => {
      const statusEl = item.querySelector('.item-status');
      if (statusEl && (statusEl.classList.contains('status-critical') || statusEl.classList.contains('status-warning'))) {
        let titleEl = item.querySelector('.item-title');
        let titleText = titleEl ? titleEl.innerText.trim() : '';
        
        let descEl = item.querySelector('.item-desc');
        let descText = descEl ? descEl.innerText.trim() : '';
        
        let recBox = item.querySelector('.suggestion-box');
        let recTextFromBox = recBox ? recBox.innerText.replace('Recommendation', '').trim() : '';
        
        let recText = recTextFromBox || descText || titleText || ('Optimize ' + mod.name);
        
        if (recText.length > 80 && !recTextFromBox && titleText) {
           recText = titleText;
        }

        const isCritical = statusEl.classList.contains('status-critical');
        
        recommendations.push({
          text: recText,
          category: mod.name,
          priority: isCritical ? 'High Priority' : 'Medium Priority',
          bg: isCritical ? '#fef2f2' : '#fffbeb',
          textCol: isCritical ? '#dc2626' : '#d97706'
        });
      }
    });
  });

  // Generate HTML for recommendations
  let recHTML = `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 16px; color: #1e293b;">Recommendations</div>
      <div style="padding: 0 20px;">
  `;
  
  if (recommendations.length === 0) {
     recHTML += `<div style="padding: 20px 0; text-align: center; color: #10b981; font-weight: 600;">Perfect! No recommendations found.</div>`;
  } else {
     recommendations.sort((a,b) => a.priority === 'High Priority' ? -1 : 1).forEach((rec, idx) => {
       const borderBottom = idx === recommendations.length - 1 ? '' : 'border-bottom: 1px solid #f1f5f9;';
       recHTML += `
         <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; ${borderBottom}">
           <div style="font-size: 14px; font-weight: 500; color: #334155; flex: 1; padding-right: 20px;">${rec.text}</div>
           <div style="display: flex; gap: 12px; align-items: center;">
             <span style="background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">${rec.category}</span>
             <span style="background: ${rec.bg}; color: ${rec.textCol}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; min-width: 90px; text-align: center;">${rec.priority}</span>
           </div>
         </div>
       `;
     });
  }
  recHTML += `</div></div>`;

  globalScore = Math.max(0, globalScore);

  // Update Dashboard
  const totalIssues = globalStats.critical + globalStats.warnings;
  document.getElementById('stat-critical').innerText = globalStats.critical;
  document.getElementById('stat-warnings').innerText = globalStats.warnings;
  document.getElementById('stat-passed').innerText = globalStats.passed;
  document.getElementById('stat-load').innerText = data.loadTime + 'ms';
  document.getElementById('stat-total-issues').innerText = totalIssues;
  document.getElementById('stat-audit-date').innerText = new Date().toLocaleDateString();

  // Update Score Circle
  document.getElementById('overall-score').textContent = globalScore;
  const circle = document.getElementById('score-circle-path');
  circle.setAttribute('stroke-dasharray', `${globalScore}, 100`);

  let color = '#16a34a'; // Premium Green
  let label = 'Excellent';
  let badgeClass = 'excellent';

  if (globalScore < 50) { color = '#dc2626'; label = 'Poor'; badgeClass = 'poor'; }
  else if (globalScore < 90) { color = '#d97706'; label = 'Needs Improvement'; badgeClass = 'average'; }

  circle.style.stroke = color;
  
  const scoreLabel = document.getElementById('score-label');
  scoreLabel.innerText = label;
  scoreLabel.className = 'badge ' + badgeClass;

  document.getElementById('health-status').innerText = globalStats.critical > 0 ? 'Needs Attention' : 'Healthy';
  document.getElementById('health-status').style.color = globalStats.critical > 0 ? '#dc2626' : '#16a34a';

  // Prepare Export Data
  ExportManager.setData({
    url: data.url,
    score: globalScore,
    stats: globalStats,
    seo: seoResults.exportData,
    images: imageResults.exportData,
    links: linkResults.exportData,
    keywords: keywordResults.exportData,
    tech: techResults.exportData,
    index: indexResults.exportData,
    llm: llmResults.exportData,
    htmlContent: {
      seo: seoResults.html,
      images: imageResults.html,
      links: linkResults.html,
      keywords: keywordResults.html,
      tech: techResults.html,
      index: indexResults.html,
      llm: llmResults.html,
      recommendations: recHTML
    },
    timestamp: new Date().toISOString()
  });

  // Restore PageSpeed from cache if available
  if (data.pagespeed && data.pagespeed.mobile && data.pagespeed.desktop) {
    const ps = data.pagespeed;
    document.getElementById('ps-mobile-performance').innerText = ps.mobile.performance;
    document.getElementById('ps-mobile-accessibility').innerText = ps.mobile.accessibility;
    document.getElementById('ps-mobile-best-practices').innerText = ps.mobile.bestPractices;
    document.getElementById('ps-mobile-seo').innerText = ps.mobile.seo;

    document.getElementById('ps-desktop-performance').innerText = ps.desktop.performance;
    document.getElementById('ps-desktop-accessibility').innerText = ps.desktop.accessibility;
    document.getElementById('ps-desktop-best-practices').innerText = ps.desktop.bestPractices;
    document.getElementById('ps-desktop-seo').innerText = ps.desktop.seo;
    
    const statusEl = document.getElementById('ps-status');
    statusEl.className = 'badge passed';
    statusEl.innerText = 'Analysis Complete';

    const getColor = (s) => s === '--' ? '#94a3b8' : s >= 90 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
    
    ExportManager.data.htmlContent.pagespeed = `
      <h3 style="font-size: 16px; margin-top: 10px; margin-bottom: 12px; color: #1e293b;">Mobile Analysis</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #475569;">Performance</span>
          <span style="font-size: 24px; font-weight: 800; color: ${getColor(ps.mobile.performance)};">${ps.mobile.performance}<span style="font-size: 14px; color: #16a34a; font-weight: 600;">/100</span></span>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #475569;">Accessibility</span>
          <span style="font-size: 24px; font-weight: 800; color: ${getColor(ps.mobile.accessibility)};">${ps.mobile.accessibility}<span style="font-size: 14px; color: #16a34a; font-weight: 600;">/100</span></span>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #475569;">Best Practices</span>
          <span style="font-size: 24px; font-weight: 800; color: ${getColor(ps.mobile.bestPractices)};">${ps.mobile.bestPractices}<span style="font-size: 14px; color: #16a34a; font-weight: 600;">/100</span></span>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #475569;">SEO</span>
          <span style="font-size: 24px; font-weight: 800; color: ${getColor(ps.mobile.seo)};">${ps.mobile.seo}<span style="font-size: 14px; color: #16a34a; font-weight: 600;">/100</span></span>
        </div>
      </div>

      <h3 style="font-size: 16px; margin-top: 10px; margin-bottom: 12px; color: #1e293b;">Desktop Analysis</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #475569;">Performance</span>
          <span style="font-size: 24px; font-weight: 800; color: ${getColor(ps.desktop.performance)};">${ps.desktop.performance}<span style="font-size: 14px; color: #16a34a; font-weight: 600;">/100</span></span>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #475569;">Accessibility</span>
          <span style="font-size: 24px; font-weight: 800; color: ${getColor(ps.desktop.accessibility)};">${ps.desktop.accessibility}<span style="font-size: 14px; color: #16a34a; font-weight: 600;">/100</span></span>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #475569;">Best Practices</span>
          <span style="font-size: 24px; font-weight: 800; color: ${getColor(ps.desktop.bestPractices)};">${ps.desktop.bestPractices}<span style="font-size: 14px; color: #16a34a; font-weight: 600;">/100</span></span>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 600; color: #475569;">SEO</span>
          <span style="font-size: 24px; font-weight: 800; color: ${getColor(ps.desktop.seo)};">${ps.desktop.seo}<span style="font-size: 14px; color: #16a34a; font-weight: 600;">/100</span></span>
        </div>
      </div>
    `;
  } else {
    // Reset state for fresh audit
    ['mobile', 'desktop'].forEach(type => {
      document.getElementById(`ps-${type}-performance`).innerText = '--';
      document.getElementById(`ps-${type}-accessibility`).innerText = '--';
      document.getElementById(`ps-${type}-best-practices`).innerText = '--';
      document.getElementById(`ps-${type}-seo`).innerText = '--';
    });
    const statusEl = document.getElementById('ps-status');
    statusEl.className = 'badge warning';
    statusEl.innerText = 'Pending...';
  }
}
