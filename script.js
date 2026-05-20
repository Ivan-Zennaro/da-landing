// halfpast — landing page
// v2: form + FAQ accordion. Forms are UI-only — wire a real provider here
// (Formspree, Mailchimp, Customer.io — see /tools/REGISTRY.md).

document.querySelectorAll('form[data-form]').forEach((form) => {
  const success = document.createElement('p');
  success.className = 'form-success';
  success.setAttribute('role', 'status');
  success.textContent = "You're on the list. We'll write before the next session opens.";
  form.appendChild(success);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }
    // TODO: POST input.value to lead-capture endpoint.
    form.classList.add('is-success');
  });
});

// Hero phones: desktop crossfades two pairs in sync; mobile shows one phone
// that cycles through all four mockups so users see the same imagery.
const phonePairs = document.querySelectorAll('[data-phone-pair]');
if (phonePairs.length) {
  const mobileQuery = window.matchMedia('(max-width: 540px)');
  const mobilePhone = document.querySelector('.phone--back');
  let timer = null;

  const startCycle = () => {
    if (timer) clearInterval(timer);
    phonePairs.forEach((phone) => {
      phone.classList.remove('is-swapped');
      delete phone.dataset.cycle;
    });

    if (mobileQuery.matches && mobilePhone) {
      let idx = 0;
      mobilePhone.dataset.cycle = '0';
      timer = setInterval(() => {
        idx = (idx + 1) % 4;
        mobilePhone.dataset.cycle = String(idx);
      }, 3000);
    } else {
      let swapped = false;
      timer = setInterval(() => {
        swapped = !swapped;
        phonePairs.forEach((phone) => phone.classList.toggle('is-swapped', swapped));
      }, 4000);
    }
  };

  startCycle();
  mobileQuery.addEventListener('change', startCycle);
}

// FAQ accordion: only one open at a time.
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
      track('faq_open', { question: item.querySelector('summary span')?.textContent?.trim() });
    }
  });
});

// ---------- Google Analytics: consent banner + event tracking ----------

function track(name, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params || {});
  }
}

// Consent banner: show only if the visitor hasn't chosen yet.
const consentBanner = document.getElementById('consent');
if (consentBanner) {
  let stored = null;
  try { stored = localStorage.getItem('halfpast_consent'); } catch (e) {}
  if (!stored) consentBanner.hidden = false;

  consentBanner.querySelectorAll('[data-consent]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.getAttribute('data-consent');
      try { localStorage.setItem('halfpast_consent', choice); } catch (e) {}
      if (typeof window.gtag === 'function') {
        const value = choice === 'granted' ? 'granted' : 'denied';
        window.gtag('consent', 'update', {
          ad_storage: value,
          ad_user_data: value,
          ad_personalization: value,
          analytics_storage: value
        });
      }
      consentBanner.hidden = true;
    });
  });
}

// CTA click tracking. Walks up to the closest <section> to label the source.
function sectionOf(el) {
  const section = el.closest('section');
  if (!section) return el.closest('header') ? 'header' : 'unknown';
  return section.className.split(' ').find((c) => !c.includes('--')) || 'unknown';
}

document.querySelectorAll('.btn--primary, .store-btn, .header-cta').forEach((el) => {
  if (el.classList.contains('store-btn--disabled')) return;
  el.addEventListener('click', () => {
    const isStore = el.classList.contains('store-btn');
    const label = isStore
      ? (el.querySelector('.store-btn-name')?.textContent?.trim() || 'store')
      : (el.textContent?.trim() || 'cta');
    track('cta_click', {
      cta_label: label,
      cta_location: sectionOf(el),
      destination: el.getAttribute('href') || ''
    });
  });
});

// Footer email click.
document.querySelectorAll('.footer-email').forEach((el) => {
  el.addEventListener('click', () => {
    track('email_click', { destination: el.getAttribute('href') || '' });
  });
});

// Scroll depth: fire 25 / 50 / 75 / 100 once each.
(function scrollDepth() {
  const marks = [25, 50, 75, 100];
  const fired = new Set();
  let ticking = false;
  function check() {
    ticking = false;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const pct = Math.round((window.scrollY / scrollable) * 100);
    marks.forEach((m) => {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        track('scroll_depth', { percent: m });
      }
    });
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(check); ticking = true; }
  }, { passive: true });
})();
