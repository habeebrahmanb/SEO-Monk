// Technology Detector Module

const TechDetector = {
  analyze: function(data) {
    let resultsHTML = '<div class="result-group"><h3>Technologies Detected</h3>';
    let stats = { critical: 0, warnings: 0, passed: 0 };
    let detected = [];
    let scoreDeduction = 0;

    const html = data.html || '';
    const scripts = data.scripts || [];
    const vitals = data.webVitals || {};

    const checks = {
      'WordPress': html.includes('wp-content') || html.includes('wp-includes'),
      'Shopify': html.includes('cdn.shopify.com'),
      'React': html.includes('data-reactroot') || html.includes('react-dom'),
      'Next.js': html.includes('__NEXT_DATA__') || html.includes('/_next/'),
      'Vue.js': html.includes('data-v-'),
      'Nuxt.js': html.includes('__NUXT__'),
      'Angular': html.includes('ng-version') || html.includes('ng-app'),
      'Tailwind CSS': html.includes('tailwind'),
      'Bootstrap': html.includes('bootstrap'),
      'jQuery': scripts.some(s => s.includes('jquery')),
      'Google Analytics': scripts.some(s => s.includes('google-analytics.com/analytics.js') || s.includes('googletagmanager.com/gtag/js')),
      'Google Tag Manager': scripts.some(s => s.includes('googletagmanager.com/gtm.js')),
      'Cloudflare': html.includes('cf-browser-verification') || html.includes('cloudflare-static')
    };

    for (const [tech, isDetected] of Object.entries(checks)) {
      if (isDetected) {
        detected.push(tech);
      }
    }

    if (detected.length === 0) {
      resultsHTML += Helpers.createResultItem('Frameworks', 'None detected directly via DOM', 'info');
    } else {
      detected.forEach(tech => {
        resultsHTML += Helpers.createResultItem(tech, 'Detected', 'passed');
        stats.passed++;
      });
    }

    resultsHTML += '</div><div class="result-group"><h3>Core Web Vitals (Local)</h3>';
    
    if (vitals.fcp) {
      const fcpStatus = vitals.fcp <= 1800 ? 'passed' : 'warning';
      resultsHTML += Helpers.createResultItem('First Contentful Paint (FCP)', `${vitals.fcp} ms`, fcpStatus, fcpStatus === 'warning' ? 'Optimize server response times and render-blocking resources.' : null);
      if (fcpStatus === 'passed') stats.passed++; else stats.warnings++;
    }

    if (vitals.lcp) {
      const lcpStatus = vitals.lcp <= 2500 ? 'passed' : (vitals.lcp <= 4000 ? 'warning' : 'critical');
      resultsHTML += Helpers.createResultItem('Largest Contentful Paint (LCP)', `${vitals.lcp} ms`, lcpStatus, lcpStatus !== 'passed' ? 'Optimize large images, text blocks, and loading priorities.' : null);
      
      if (lcpStatus === 'passed') stats.passed++;
      else if (lcpStatus === 'warning') stats.warnings++;
      else { stats.critical++; scoreDeduction += 10; }
    }

    if (!vitals.fcp && !vitals.lcp) {
      resultsHTML += Helpers.createResultItem('Web Vitals', 'Data not available', 'info', 'Hard refresh the page to capture web vitals.');
    }

    resultsHTML += '</div>';

    return {
      html: resultsHTML,
      deduction: scoreDeduction,
      stats: stats,
      exportData: { detected, vitals }
    };
  }
};
