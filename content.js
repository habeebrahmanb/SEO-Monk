// SEO Monk - Content Script
// Extracts all necessary data from the active page

async function extractPageData() {
  const origin = window.location.origin;

  const data = {
    url: window.location.href,
    protocol: window.location.protocol,
    title: document.title,
    language: document.documentElement.lang,
    loadTime: getLoadTime(),
    webVitals: getWebVitals(),
    meta: extractMetaTags(),
    headings: extractHeadings(),
    images: extractImages(),
    links: extractLinks(),
    socialLinks: extractSocialLinks(),
    hreflangs: extractHreflangs(),
    text: document.body.innerText,
    html: document.documentElement.outerHTML, 
    scripts: Array.from(document.scripts).map(s => s.src).filter(Boolean),
    schema: extractSchema(),
    network: await checkNetworkFiles(origin)
  };
  return data;
}

async function checkNetworkFiles(origin) {
  const checks = {
    robots: false,
    sitemap: false,
    llms: false
  };

  try {
    const [robotsRes, sitemapRes, llmsRes] = await Promise.allSettled([
      fetch(`${origin}/robots.txt`, { method: 'HEAD' }),
      fetch(`${origin}/sitemap.xml`, { method: 'HEAD' }),
      fetch(`${origin}/llms.txt`, { method: 'HEAD' })
    ]);

    if (robotsRes.status === 'fulfilled' && robotsRes.value.ok) checks.robots = true;
    if (sitemapRes.status === 'fulfilled' && sitemapRes.value.ok) checks.sitemap = true;
    if (llmsRes.status === 'fulfilled' && llmsRes.value.ok) checks.llms = true;
  } catch (e) {
    console.error("Network check failed", e);
  }

  return checks;
}

function getLoadTime() {
  const navEntry = performance.getEntriesByType('navigation')[0];
  if (navEntry) {
    return Math.round(navEntry.loadEventEnd - navEntry.startTime);
  }
  return 0;
}

function getWebVitals() {
  const vitals = { fcp: null, lcp: null };
  const paintEntries = performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
  if (fcpEntry) vitals.fcp = Math.round(fcpEntry.startTime);

  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  if (lcpEntries && lcpEntries.length > 0) {
    vitals.lcp = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
  }
  return vitals;
}

function extractMetaTags() {
  const meta = {};
  const tags = document.getElementsByTagName('meta');
  for (let i = 0; i < tags.length; i++) {
    const name = tags[i].getAttribute('name') || tags[i].getAttribute('property');
    if (name) {
      meta[name.toLowerCase()] = tags[i].getAttribute('content');
    }
    if (tags[i].getAttribute('charset')) {
      meta['charset'] = tags[i].getAttribute('charset');
    }
  }
  
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) meta['canonical'] = canonical.href;

  const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (favicon) meta['favicon'] = favicon.href;

  return meta;
}

function extractHreflangs() {
  const hreflangs = [];
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => {
    hreflangs.push({
      lang: link.getAttribute('hreflang'),
      href: link.href
    });
  });
  return hreflangs;
}

function extractSchema() {
  const schemas = [];
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const parsed = JSON.parse(script.innerText);
      // Handle arrays of schemas
      if (Array.isArray(parsed)) {
        schemas.push(...parsed);
      } else {
        schemas.push(parsed);
      }
    } catch(e) {}
  });
  return schemas;
}

function extractHeadings() {
  const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  for (let i = 1; i <= 6; i++) {
    const elements = document.querySelectorAll(`h${i}`);
    elements.forEach(el => {
      headings[`h${i}`].push(el.innerText.trim());
    });
  }
  return headings;
}

function extractImages() {
  const images = [];
  document.querySelectorAll('img').forEach(img => {
    let imageSource = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '[No SRC attribute - likely lazy loaded via JS]';
    images.push({
      src: imageSource,
      alt: img.getAttribute('alt'),
      loading: img.getAttribute('loading') || 'eager',
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      broken: img.naturalWidth === 0 && img.complete
    });
  });
  return images;
}

function extractLinks() {
  const links = [];
  document.querySelectorAll('a').forEach(a => {
    links.push({
      href: a.href,
      text: a.innerText.trim(),
      rel: a.getAttribute('rel') || '',
      isInternal: a.href.startsWith(window.location.origin) || !a.href.startsWith('http')
    });
  });
  return links;
}

function extractSocialLinks() {
  const socialDomains = ['facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com', 'pinterest.com'];
  const found = new Set();
  
  document.querySelectorAll('a[href]').forEach(a => {
    try {
      const url = new URL(a.href);
      const domain = url.hostname.replace('www.', '').toLowerCase();
      if (socialDomains.includes(domain)) {
        found.add(a.href);
      }
    } catch(e) {}
  });
  
  return Array.from(found);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    extractPageData().then(data => {
      sendResponse(data);
    });
    return true; // Keep message channel open for async response
  }
});
