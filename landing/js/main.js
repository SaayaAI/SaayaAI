(function () {
  const nav = document.querySelector('.nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function showError(field, message) {
    const input = document.getElementById(field);
    const errorEl = document.querySelector(`.error-message[data-for="${field}"]`);
    input.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearErrors() {
    contactForm.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
    contactForm.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));
    formSuccess.hidden = true;
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      let valid = true;

      if (!name) {
        showError('name', 'Please enter your name.');
        valid = false;
      }

      if (!email) {
        showError('email', 'Please enter your email.');
        valid = false;
      } else if (!validateEmail(email)) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      }

      if (!message) {
        showError('message', 'Please enter a message.');
        valid = false;
      } else if (message.length < 10) {
        showError('message', 'Message must be at least 10 characters.');
        valid = false;
      }

      if (!valid) return;

      contactForm.reset();
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    contactForm.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        field.classList.remove('error');
        const errorEl = document.querySelector(`.error-message[data-for="${field.id}"]`);
        if (errorEl) errorEl.textContent = '';
      });
    });
  }
})();
