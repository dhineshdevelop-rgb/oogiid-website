export function initNavigation(doc, win) {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(win.location.hostname);
  const appOrigin = local ? 'http://localhost:4200' : 'https://oogiid-ui.vercel.app';
  doc.querySelectorAll('[data-app-path]').forEach(link => {
    link.href = `${appOrigin}${link.dataset.appPath}`;
  });
  const header = doc.querySelector('.site-header');
  const button = doc.querySelector('.menu-toggle');
  const nav = doc.querySelector('.site-nav');
  const links = [...doc.querySelectorAll('.site-nav a[href^="#"]')];
  if (button && nav) {
    function setMenu(open) {
      button.classList.toggle('active', open);
      nav.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      doc.body.classList.toggle('menu-open', open);
    }
    button.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    links.forEach(link => link.addEventListener('click', () => setMenu(false)));
  }
  if (header) win.addEventListener('scroll', () => header.classList.toggle('scrolled', win.scrollY > 12), { passive: true });
  const year = doc.querySelector('#year');
  if (year) year.textContent = String(new win.Date().getFullYear());
  return links;
}

export function initObservers(doc, win, links) {
  const elements = [...doc.querySelectorAll('.reveal')];
  if (!win.IntersectionObserver) {
    elements.forEach(element => element.classList.add('visible'));
    return;
  }
  const reveal = new win.IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        reveal.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -30px' });
  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
    reveal.observe(element);
  });
  const sections = new win.IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55%' });
  doc.querySelectorAll('main section[id]').forEach(section => sections.observe(section));
}

export function initializeWebsite(doc, win) {
  const links = initNavigation(doc, win);
  initObservers(doc, win, links);
}

if (typeof document !== 'undefined') initializeWebsite(document, window);
