// Image Analyzer Module

const ImageAnalyzer = {
  analyze: function(data) {
    let resultsHTML = '<div class="result-group"><h3>Image SEO</h3>';
    let stats = { critical: 0, warnings: 0, passed: 0 };
    let scoreDeduction = 0;

    const images = data.images;
    const total = images.length;
    let missingAltCount = 0;
    let missingAltList = [];
    let emptyAlt = 0;
    let emptyAltList = [];
    let broken = 0;
    let brokenList = [];
    let notLazy = 0;
    let lazyList = [];
    let largeImages = 0;
    let largeList = [];
    
    let altTexts = {};
    let formats = new Set();

    images.forEach(img => {
      // ALT checks
      if (img.alt === null) {
        missingAltCount++;
        missingAltList.push(img.src);
      }
      else if (img.alt.trim() === '') {
        emptyAlt++;
        emptyAltList.push(img.src);
      }
      else {
        const txt = img.alt.trim().toLowerCase();
        altTexts[txt] = altTexts[txt] || { count: 0, urls: [] };
        altTexts[txt].count++;
        altTexts[txt].urls.push(img.src);
      }
      
      // Status checks
      if (img.broken) {
        broken++;
        brokenList.push(img.src);
      }
      if (img.loading !== 'lazy') {
        notLazy++;
        lazyList.push(img.src);
      }

      // Size check (heuristic based on rendered/natural dimensions)
      if (img.width > 1200 || img.height > 1200) {
        largeImages++;
        largeList.push(img.src);
      }

      // Format detection from URL
      try {
        const url = new URL(img.src);
        const ext = url.pathname.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(ext)) {
          formats.add(ext.toUpperCase());
        }
      } catch(e) {}
    });

    let duplicateAlts = 0;
    let duplicateDetailsHtml = '';
    Object.entries(altTexts).forEach(([txt, meta]) => {
      if (meta.count > 1) {
        duplicateAlts++;
        duplicateDetailsHtml += `<li><strong>"${txt}"</strong> used ${meta.count} times: <ul style="word-break: break-all;">` + meta.urls.map(u => `<li>${u}</li>`).join('') + `</ul></li>`;
      }
    });
    if (duplicateDetailsHtml !== '') duplicateDetailsHtml = '<ul style="margin:0; padding-left:20px;">' + duplicateDetailsHtml + '</ul>';

    resultsHTML += Helpers.createResultItem('Total Images', total, 'passed');

    if (missingAltCount > 0) {
      stats.critical++;
      scoreDeduction += Math.min(15, missingAltCount * 2);
      
      let details = '<ul style="margin:0; padding-left:20px; word-break: break-all;">' + missingAltList.map(s => `<li>${s}</li>`).join('') + '</ul>';
      
      resultsHTML += Helpers.createResultItem('Missing ALT', `${missingAltCount} images without alt attribute`, 'critical', 'Add alt attributes to all descriptive images for accessibility and SEO. <br><code>&lt;img src="..." alt="Description"&gt;</code>', details);
    } else if (total > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Missing ALT', '0', 'passed');
    }

    if (emptyAlt > 0) {
      stats.warnings++;
      let details = '<ul style="margin:0; padding-left:20px; word-break: break-all;">' + emptyAltList.map(s => `<li>${s}</li>`).join('') + '</ul>';
      resultsHTML += Helpers.createResultItem('Empty ALT', `${emptyAlt} images with empty alt=""`, 'warning', 'Ensure empty alts are only used for purely decorative images. If the image conveys meaning, write a descriptive alt text.', details);
    } else if (total > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Empty ALT', '0', 'passed');
    }

    if (duplicateAlts > 0) {
      stats.warnings++;
      resultsHTML += Helpers.createResultItem('Duplicate ALT', `${duplicateAlts} duplicate alt texts found`, 'warning', 'Make alt texts unique and descriptive for each image.', duplicateDetailsHtml);
    } else if (total > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Duplicate ALT', '0', 'passed');
    }

    if (broken > 0) {
      stats.critical++;
      scoreDeduction += 10;
      let details = '<ul style="margin:0; padding-left:20px; word-break: break-all;">' + brokenList.map(s => `<li>${s}</li>`).join('') + '</ul>';
      resultsHTML += Helpers.createResultItem('Broken Images', `${broken} broken images`, 'critical', 'Fix broken image links to improve user experience. The image files could not be loaded.', details);
    }

    if (notLazy > 0) {
      stats.warnings++;
      let details = '<ul style="margin:0; padding-left:20px; word-break: break-all;">' + lazyList.map(s => `<li>${s}</li>`).join('') + '</ul>';
      resultsHTML += Helpers.createResultItem('Lazy Loading', `${notLazy} images without loading="lazy"`, 'warning', 'Add loading="lazy" to off-screen images to improve page load time. <br><code>&lt;img src="..." loading="lazy"&gt;</code>', details);
    } else if (total > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Lazy Loading', 'All images lazy-loaded (or no images)', 'passed');
    }

    if (largeImages > 0) {
      stats.warnings++;
      let details = '<ul style="margin:0; padding-left:20px; word-break: break-all;">' + largeList.map(s => `<li>${s}</li>`).join('') + '</ul>';
      resultsHTML += Helpers.createResultItem('Large Images', `${largeImages} images > 1200px`, 'warning', 'Ensure images are properly scaled and compressed before serving.', details);
    } else if (total > 0) {
      stats.passed++;
      resultsHTML += Helpers.createResultItem('Large Images', '0 (Properly sized)', 'passed');
    }

    if (formats.size > 0) {
      const formatArr = Array.from(formats);
      if (!formatArr.includes('WEBP') && !formatArr.includes('AVIF')) {
        stats.warnings++;
        resultsHTML += Helpers.createResultItem('Image Formats', formatArr.join(', '), 'warning', 'Consider serving images in next-gen formats like WebP or AVIF.');
      } else {
        stats.passed++;
        resultsHTML += Helpers.createResultItem('Image Formats', formatArr.join(', '), 'passed');
      }
    }

    resultsHTML += '</div>';

    return {
      html: resultsHTML,
      deduction: scoreDeduction,
      stats: stats,
      exportData: { total, missingAlt: missingAltCount, emptyAlt, broken, duplicateAlts, largeImages, formats: Array.from(formats) }
    };
  }
};
