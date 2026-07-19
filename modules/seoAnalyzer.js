// SEO Analyzer Module

const SEOAnalyzer = {
  analyze: function(data) {
    let resultsHTML = '<div class="result-group"><h3>Basic SEO</h3>';
    let issues = [];
    let criticalCount = 0;
    let warningCount = 0;
    let passedCount = 0;
    let totalScore = 100;

    // Helper to log issue
    function addIssue(weight, severity) {
      issues.push({ weight });
      if (severity === 'critical') criticalCount++;
      else warningCount++;
    }

    // 1. Title
    const title = data.title;
    if (!title) {
      addIssue(20, 'critical');
      resultsHTML += Helpers.createResultItem('Title Tag', 'Missing', 'critical', 'Add a <title> tag to your page header.');
    } else {
      const len = title.length;
      if (len < 50 || len > 60) {
        addIssue(10, 'warning');
        resultsHTML += Helpers.createResultItem('Title Tag', `Length: ${len} chars ("${title}")`, 'warning', 'Keep title between 50-60 characters for optimal display in SERPs.');
      } else {
        passedCount++;
        resultsHTML += Helpers.createResultItem('Title Tag', `Length: ${len} chars ("${title}")`, 'passed');
      }
    }

    // 2. Meta Description
    const desc = data.meta.description;
    if (!desc) {
      addIssue(15, 'critical');
      resultsHTML += Helpers.createResultItem('Meta Description', 'Missing', 'critical', 'Add a meta description to improve click-through rates.');
    } else {
      const len = desc.length;
      if (len < 120 || len > 160) {
        addIssue(10, 'warning');
        resultsHTML += Helpers.createResultItem('Meta Description', `Length: ${len} chars ("${desc}")`, 'warning', 'Keep meta description between 120-160 characters.');
      } else {
        passedCount++;
        resultsHTML += Helpers.createResultItem('Meta Description', `Length: ${len} chars ("${desc}")`, 'passed');
      }
    }

    // 3. Canonical
    if (!data.meta.canonical) {
      addIssue(10, 'warning');
      resultsHTML += Helpers.createResultItem('Canonical URL', 'Missing', 'warning', 'Add a rel="canonical" link to prevent duplicate content issues.');
    } else {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Canonical URL', data.meta.canonical, 'passed');
    }

    // 4. Robots Meta
    if (data.meta.robots) {
      if (data.meta.robots.toLowerCase().includes('noindex')) {
        addIssue(20, 'critical');
        resultsHTML += Helpers.createResultItem('Robots Meta', 'Noindex found', 'critical', 'Search engines are blocked from indexing this page.');
      } else {
        passedCount++;
        resultsHTML += Helpers.createResultItem('Robots Meta', data.meta.robots, 'passed');
      }
    } else {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Robots Meta', 'Default (Index, Follow)', 'passed');
    }

    // 5. Technical Metadata
    resultsHTML += '</div><div class="result-group"><h3>Technical Data</h3>';
    
    if (data.protocol === 'https:') {
      passedCount++;
      resultsHTML += Helpers.createResultItem('SSL Enabled', 'HTTPS Secure', 'passed');
    } else {
      addIssue(20, 'critical');
      resultsHTML += Helpers.createResultItem('SSL Enabled', 'Not Secure (HTTP)', 'critical', 'Migrate to HTTPS to secure your site and improve search rankings.');
    }

    if (data.language) {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Language', data.language, 'passed');
    } else {
      addIssue(5, 'warning');
      resultsHTML += Helpers.createResultItem('Language', 'Missing lang attribute', 'warning', 'Add a lang attribute to the <html> tag (e.g., lang="en").');
    }

    if (data.meta.charset) {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Charset', data.meta.charset, 'passed');
    } else {
      addIssue(5, 'warning');
      resultsHTML += Helpers.createResultItem('Charset', 'Missing', 'warning', 'Add <meta charset="UTF-8"> to your page.');
    }

    if (data.meta.viewport) {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Viewport', data.meta.viewport, 'passed');
    } else {
      addIssue(15, 'critical');
      resultsHTML += Helpers.createResultItem('Viewport', 'Missing', 'critical', 'Add a viewport meta tag for mobile responsiveness.');
    }

    if (data.meta.favicon) {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Favicon', 'Present', 'passed');
    } else {
      addIssue(5, 'warning');
      resultsHTML += Helpers.createResultItem('Favicon', 'Missing', 'warning', 'Add a favicon for better brand recognition in tabs.');
    }

    // 6. Headings
    resultsHTML += '</div><div class="result-group"><h3>Headings</h3>';

    const h1Count = data.headings.h1.length;
    let h1Details = h1Count > 0 ? '<ul style="margin:0; padding-left:20px;">' + data.headings.h1.map(h => `<li>${h}</li>`).join('') + '</ul>' : null;

    if (h1Count === 0) {
      addIssue(15, 'critical');
      resultsHTML += Helpers.createResultItem('H1 Tag', 'Missing H1', 'critical', 'Every page should have exactly one H1 tag describing the main topic. <br><code>&lt;h1&gt;Main Topic&lt;/h1&gt;</code>');
    } else if (h1Count > 1) {
      addIssue(10, 'warning');
      resultsHTML += Helpers.createResultItem('H1 Tag', `Multiple H1s (${h1Count})`, 'warning', 'It is recommended to use only one H1 tag per page.', h1Details);
    } else {
      passedCount++;
      resultsHTML += Helpers.createResultItem('H1 Tag', `1 Found`, 'passed', null, h1Details);
    }

    // Check for duplicate H1s if there are multiple
    if (h1Count > 1) {
      const uniqueH1s = new Set(data.headings.h1);
      if (uniqueH1s.size < h1Count) {
        addIssue(10, 'warning');
        resultsHTML += Helpers.createResultItem('Duplicate H1', 'Identical H1s found', 'warning', 'Make sure headings are unique if you use multiple.');
      }
    }

    const h2Count = data.headings.h2.length;
    let h2Details = h2Count > 0 ? '<ul style="margin:0; padding-left:20px;">' + data.headings.h2.map(h => `<li>${h}</li>`).join('') + '</ul>' : null;

    if (h2Count === 0) {
      addIssue(5, 'warning');
      resultsHTML += Helpers.createResultItem('H2 Tags', 'Missing', 'warning', 'Use H2 tags to divide content into logical sections.');
    } else {
      passedCount++;
      resultsHTML += Helpers.createResultItem('H2 Tags', `${h2Count} Found`, 'passed', null, h2Details);
    }

    const otherHeadings = data.headings.h3.length + data.headings.h4.length + data.headings.h5.length + data.headings.h6.length;
    let otherDetails = '';
    if (data.headings.h3.length > 0) otherDetails += `<strong>H3:</strong><ul style="margin:0; padding-left:20px;">` + data.headings.h3.map(h => `<li>${h}</li>`).join('') + `</ul>`;
    if (data.headings.h4.length > 0) otherDetails += `<strong>H4:</strong><ul style="margin:0; padding-left:20px;">` + data.headings.h4.map(h => `<li>${h}</li>`).join('') + `</ul>`;
    if (data.headings.h5.length > 0) otherDetails += `<strong>H5:</strong><ul style="margin:0; padding-left:20px;">` + data.headings.h5.map(h => `<li>${h}</li>`).join('') + `</ul>`;
    if (data.headings.h6.length > 0) otherDetails += `<strong>H6:</strong><ul style="margin:0; padding-left:20px;">` + data.headings.h6.map(h => `<li>${h}</li>`).join('') + `</ul>`;

    passedCount++;
    resultsHTML += Helpers.createResultItem('H3-H6 Tags', `${otherHeadings} Found`, 'passed', null, otherDetails !== '' ? otherDetails : null);

    // 7. Social Meta & Structured Data
    resultsHTML += '</div><div class="result-group"><h3>Social & Structured Data</h3>';

    // Open Graph
    const ogTitle = data.meta['og:title'];
    if (!ogTitle) {
      addIssue(5, 'warning');
      resultsHTML += Helpers.createResultItem('Open Graph', 'Missing OG Tags', 'warning', 'Add Open Graph tags (og:title, og:image) for better social sharing.');
    } else {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Open Graph', 'Present', 'passed');
    }

    // Twitter Cards
    const twitterCard = data.meta['twitter:card'] || data.meta['twitter:title'];
    if (!twitterCard) {
      addIssue(5, 'warning');
      resultsHTML += Helpers.createResultItem('Twitter Cards', 'Missing', 'warning', 'Add Twitter card meta tags to optimize sharing on X/Twitter.');
    } else {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Twitter Cards', 'Present', 'passed');
    }

    // Page Social Media Profiles
    if (data.socialLinks && data.socialLinks.length > 0) {
      passedCount++;
      let socialList = '<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">';
      data.socialLinks.forEach(link => {
        try {
          const domain = new URL(link).hostname.replace('www.', '');
          socialList += `<a href="${link}" target="_blank" class="badge passed" style="text-decoration:none; text-transform:capitalize;">${domain.split('.')[0]}</a>`;
        } catch(e) {}
      });
      socialList += '</div>';
      resultsHTML += Helpers.createResultItem('Social Profiles', `${data.socialLinks.length} profiles linked`, 'passed', socialList);
    } else {
      resultsHTML += Helpers.createResultItem('Social Profiles', 'None detected', 'info', 'Linking to your active social media profiles builds trust and authority.');
    }

    // Schema.org
    let hasIdentitySchema = false;
    let hasLocalSchema = false;

    if (data.schema && data.schema.length > 0) {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Schema.org', `${data.schema.length} JSON-LD found`, 'passed');
      
      // Analyze Schema Types
      data.schema.forEach(s => {
        const type = s['@type'];
        if (type === 'Organization' || type === 'Person') hasIdentitySchema = true;
        if (type === 'LocalBusiness' || (typeof type === 'string' && type.includes('LocalBusiness'))) hasLocalSchema = true;
      });

      if (hasIdentitySchema) {
        passedCount++;
        resultsHTML += Helpers.createResultItem('Identity Schema', 'Present (Organization/Person)', 'passed');
      } else {
        addIssue(5, 'warning');
        resultsHTML += Helpers.createResultItem('Identity Schema', 'Missing', 'warning', 'Add Organization or Person schema to help establish entity identity in Knowledge Graphs.');
      }

      if (hasLocalSchema) {
        passedCount++;
        resultsHTML += Helpers.createResultItem('Local SEO', 'LocalBusiness Schema Present', 'passed');
      } else {
        resultsHTML += Helpers.createResultItem('Local SEO', 'No LocalBusiness Schema', 'info', 'If you have a physical location, add LocalBusiness schema.');
      }

    } else {
      addIssue(5, 'warning');
      resultsHTML += Helpers.createResultItem('Schema.org', 'Missing Structured Data', 'warning', 'Use JSON-LD schema to help search engines understand your content.');
    }

    // Hreflang
    if (data.hreflangs && data.hreflangs.length > 0) {
      passedCount++;
      resultsHTML += Helpers.createResultItem('Hreflang Usage', `${data.hreflangs.length} language alternates found`, 'passed');
    } else {
      resultsHTML += Helpers.createResultItem('Hreflang Usage', 'None found', 'info', 'If your site targets multiple languages, implement hreflang tags.');
    }

    resultsHTML += '</div>';

    // Calculate Score Deduction
    const deduction = Helpers.getScoreDeduction(issues);

    return {
      html: resultsHTML,
      deduction: deduction,
      stats: {
        critical: criticalCount,
        warnings: warningCount,
        passed: passedCount
      },
      exportData: { title, desc, h1Count, ogTitle }
    };
  }
};
