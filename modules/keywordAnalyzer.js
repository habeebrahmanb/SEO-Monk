// Keyword Analyzer Module

const KeywordAnalyzer = {
  stopWords: new Set(['the','and','a','to','of','in','i','is','that','it','on','you','this','for','but','with','are','have','be','at','or','as','was','so','if','out','not','we','my','by','they','from','which','all','about','up','one','their','an','your','would','can','will','there','what','has','more','who','when','do','like','has','just','some','these','them','other','into','then','than','only','its','also','any','very','could','should','would','been']),
  
  analyze: function(data) {
    let resultsHTML = '<div class="result-group"><h3>Content Metrics</h3>';
    let stats = { critical: 0, warnings: 0, passed: 0 };
    let scoreDeduction = 0;

    const text = data.text || '';
    const charCount = text.length;
    
    // Calculate words
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200); // avg 200 words per minute

    resultsHTML += Helpers.createResultItem('Total Word Count', `${wordCount} words`, wordCount > 300 ? 'passed' : 'warning', wordCount < 300 ? 'Thin content. Consider adding more valuable content (aim for 300+ words).' : null);
    if(wordCount < 300) { stats.warnings++; scoreDeduction += 5; } else { stats.passed++; }

    resultsHTML += Helpers.createResultItem('Character Count', `${charCount} characters`, 'passed');
    resultsHTML += Helpers.createResultItem('Estimated Reading Time', `~${readingTime} min`, 'passed');
    
    // Keyword Frequency
    const frequencies = {};
    words.forEach(w => {
      if (!this.stopWords.has(w)) {
        frequencies[w] = (frequencies[w] || 0) + 1;
      }
    });

    const sortedKeywords = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15); // Top 15 keywords to display

    resultsHTML += '</div><div class="result-group"><h3>Keyword Density & Top Keywords</h3>';
    
    if (sortedKeywords.length > 0) {
      stats.passed++;
      let keywordHtml = '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">';
      sortedKeywords.forEach(([kw, count]) => {
        const density = ((count / wordCount) * 100).toFixed(1);
        
        let colorClass = 'passed';
        if (density > 5) {
          colorClass = 'warning'; // Keyword stuffing warning
        }
        
        keywordHtml += `<span class="badge ${colorClass}" style="margin:0;">${kw} (${count}) - ${density}%</span>`;
      });
      keywordHtml += '</div>';

      // Check for keyword stuffing
      const stuffed = sortedKeywords.filter(([_, count]) => (count / wordCount) * 100 > 5);
      if (stuffed.length > 0) {
        stats.warnings++;
        resultsHTML += Helpers.createResultItem('Keyword Stuffing', `${stuffed.length} terms appear to be stuffed (>5% density)`, 'warning', 'Ensure natural keyword distribution. Avoid densities over 5%.');
      } else {
        stats.passed++;
        resultsHTML += Helpers.createResultItem('Keyword Density', 'Natural distribution (All < 5%)', 'passed');
      }

      resultsHTML += Helpers.createResultItem('Top 15 Keywords', keywordHtml, 'info');

    } else {
      resultsHTML += Helpers.createResultItem('Keywords', 'Not enough text to extract meaningful keywords.', 'warning');
      stats.warnings++;
    }

    // Heading Keywords (Basic Analysis)
    const allHeadingsText = Object.values(data.headings).flat().join(' ').toLowerCase();
    const headingWords = allHeadingsText.match(/\b[a-z]{3,}\b/g) || [];
    const targetKeywordFound = sortedKeywords.length > 0 && headingWords.includes(sortedKeywords[0][0]);

    resultsHTML += '</div><div class="result-group"><h3>Heading & Paragraph Analysis</h3>';
    
    if (targetKeywordFound) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Heading Keywords', `Top keyword "${sortedKeywords[0][0]}" found in headings.`, 'passed');
    } else if (sortedKeywords.length > 0) {
      stats.warnings++;
      resultsHTML += Helpers.createResultItem('Heading Keywords', `Top keyword "${sortedKeywords[0][0]}" NOT found in headings.`, 'warning', 'Include your primary keywords in H1 and H2 tags.');
    }

    resultsHTML += '</div>';

    return {
      html: resultsHTML,
      deduction: scoreDeduction,
      stats: stats,
      exportData: { wordCount, charCount, readingTime, topKeywords: sortedKeywords }
    };
  }
};
