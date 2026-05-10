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
