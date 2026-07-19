// LLM Readability & Readiness Module

const LLMAnalyzer = {
  analyze: function(data) {
    let resultsHTML = '<div class="result-group"><h3>LLM Readiness</h3>';
    let stats = { critical: 0, warnings: 0, passed: 0 };
    let scoreDeduction = 0;

    const origin = new URL(data.url).origin;

    // llms.txt check
    if (data.network && data.network.llms) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('llms.txt', 'Detected', 'passed', 'Great! You have an llms.txt file providing AI agents with context about your site.', `<a href="${origin}/llms.txt" target="_blank" style="color:#3b82f6;">${origin}/llms.txt</a>`);
    } else {
      stats.warnings++;
      resultsHTML += Helpers.createResultItem('llms.txt', 'Not Found', 'info', 'Consider adding an llms.txt file to help AI models like Claude, GPT, and Gemini parse your site better. <br>Create it at: <code>' + origin + '/llms.txt</code>');
    }

    resultsHTML += '</div><div class="result-group"><h3>Rendered Content (LLM Readability)</h3>';

    // Content structure for LLMs
    const text = data.text || '';
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    
    if (paragraphs.length > 3) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Content Structure', `${paragraphs.length} substantial text blocks found`, 'passed');
    } else {
      stats.warnings++;
      scoreDeduction += 5;
      resultsHTML += Helpers.createResultItem('Content Structure', 'Low textual density', 'warning', 'LLMs rely heavily on textual content. Ensure your page has rich, readable paragraphs rather than just images or interactive elements.');
    }

    const avgParagraphLength = paragraphs.length > 0 
      ? Math.round(paragraphs.reduce((acc, p) => acc + p.length, 0) / paragraphs.length) 
      : 0;

    if (avgParagraphLength > 500) {
      stats.warnings++;
      resultsHTML += Helpers.createResultItem('Readability (Density)', `Dense paragraphs (~${avgParagraphLength} chars avg)`, 'warning', 'Break text into smaller, digestable chunks to improve parsing for both humans and AI.');
    } else if (avgParagraphLength > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Readability (Density)', 'Good text chunking', 'passed');
    } else {
      resultsHTML += Helpers.createResultItem('Readability (Density)', 'Not enough text', 'warning');
    }

    // Checking for Semantic HTML which helps LLMs
    const h1s = data.headings.h1.length;
    const h2s = data.headings.h2.length;
    if (h1s > 0 && h2s > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Semantic Hierarchy', 'Clear H1 -> H2 structure', 'passed');
    } else {
      stats.warnings++;
      resultsHTML += Helpers.createResultItem('Semantic Hierarchy', 'Missing clear heading structure', 'warning', 'LLMs use headings to understand content hierarchy. Ensure proper use of H1, H2, and H3 tags.');
    }

    resultsHTML += '</div>';

    return {
      html: resultsHTML,
      deduction: scoreDeduction,
      stats: stats,
      exportData: { hasLlmsTxt: data.network?.llms, paragraphsCount: paragraphs.length, avgParagraphLength }
    };
  }
};
