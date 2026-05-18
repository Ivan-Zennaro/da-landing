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
    }
  });
});
