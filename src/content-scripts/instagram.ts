const url = browser.runtime.getURL('content-scripts/context.js');
const el = document.createElement('script');
el.src = url;
document.documentElement.prepend(el);
