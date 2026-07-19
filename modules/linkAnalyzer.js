// Link Analyzer Module

const LinkAnalyzer = {
  analyze: function(data) {
    let resultsHTML = '<div class="result-group"><h3>Links Overview</h3>';
    let stats = { critical: 0, warnings: 0, passed: 0 };
    let scoreDeduction = 0;

    const links = data.links;
    const total = links.length;
    let internal = 0;
    let external = 0;
    let externalList = [];
    let emptyText = 0;
    let nofollow = 0;
    let nofollowList = [];
    let sponsored = 0;
    let ugc = 0;
    let potentiallyBrokenCount = 0;
    let brokenList = [];

    links.forEach(l => {
      if (l.isInternal) internal++;
      else {
        external++;
        externalList.push(l.href);
      }

      if (l.text === '') emptyText++;
      
      const rel = l.rel.toLowerCase();
      if (rel.includes('nofollow')) {
        nofollow++;
        nofollowList.push(l.href);
      }
      if (rel.includes('sponsored')) sponsored++;
      if (rel.includes('ugc')) ugc++;

      // Basic heuristic for broken/invalid links
      const href = l.href.trim();
      if (href === '' || href === '#' || href.startsWith('javascript:void') || href.includes('undefined')) {
        potentiallyBrokenCount++;
        brokenList.push(l.text ? `${l.text} (${href})` : href);
      }
    });

    resultsHTML += Helpers.createResultItem('Total Links', total, 'passed');
    resultsHTML += Helpers.createResultItem('Internal Links', internal, 'passed');
    let extDetails = external > 0 ? '<ul style="margin:0; padding-left:20px;">' + externalList.map(s => `<li><a href="${s}" target="_blank">${s.substring(0,60)}...</a></li>`).join('') + '</ul>' : null;
    resultsHTML += Helpers.createResultItem('External Links', external, 'passed', null, extDetails);
    
    resultsHTML += '</div><div class="result-group"><h3>Link Attributes & Health</h3>';
    
    let nofDetails = nofollow > 0 ? '<ul style="margin:0; padding-left:20px;">' + nofollowList.map(s => `<li><a href="${s}" target="_blank">${s.substring(0,60)}...</a></li>`).join('') + '</ul>' : null;
    resultsHTML += Helpers.createResultItem('Nofollow Links', nofollow, 'passed', 'Use rel="nofollow" for paid links, untrusted content, or when you do not want to pass link equity.<br><code>&lt;a href="..." rel="nofollow"&gt;</code>', nofDetails);
    resultsHTML += Helpers.createResultItem('Sponsored Links', sponsored, 'passed');
    resultsHTML += Helpers.createResultItem('UGC Links', ugc, 'passed');

    if (emptyText > 0) {
      stats.warnings++;
      resultsHTML += Helpers.createResultItem('Empty Anchor Text', `${emptyText} links without text`, 'warning', 'Ensure all links have descriptive anchor text for accessibility and SEO.');
    } else if (total > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Empty Anchor Text', '0', 'passed');
    }

    if (potentiallyBrokenCount > 0) {
      stats.critical++;
      scoreDeduction += 5;
      
      let details = '<ul style="margin:0; padding-left:20px; word-break: break-all;">' + brokenList.map(s => `<li>${s}</li>`).join('') + '</ul>';
      
      resultsHTML += Helpers.createResultItem('Invalid/Empty Links', `${potentiallyBrokenCount} suspect links found`, 'critical', 'Avoid empty hrefs or # links as they provide no value to crawlers. <br>Ensure links are valid URLs: <code>&lt;a href="https://example.com"&gt;</code>', details);
    } else if (total > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Invalid/Empty Links', '0', 'passed');
    }

    resultsHTML += '</div>';

    return {
      html: resultsHTML,
      deduction: scoreDeduction,
      stats: stats,
      exportData: { total, internal, external, emptyText, nofollow, sponsored, ugc, potentiallyBroken: potentiallyBrokenCount }
    };
  }
};
