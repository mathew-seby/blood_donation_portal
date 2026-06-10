(function () {
  'use strict';

  /* ── Navigation drawer ─────────────────────────────────────── */
  const menuBtn = document.getElementById('menu-btn');
  const navDrawer = document.getElementById('nav-drawer');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinks = document.querySelectorAll('.nav-drawer__link');

  function openMenu() {
    menuBtn.classList.add('is-open');
    navDrawer.classList.add('is-open');
    navOverlay.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close navigation menu');
  }

  function closeMenu() {
    menuBtn.classList.remove('is-open');
    navDrawer.classList.remove('is-open');
    navOverlay.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open navigation menu');
  }

  function toggleMenu() {
    if (navDrawer.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  menuBtn.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', closeMenu);
  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ── Section scroll arrows ─────────────────────────────────── */
  document.querySelectorAll('.scroll-down-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = document.querySelector(btn.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.querySelectorAll('.scroll-top-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ── Tab switching ─────────────────────────────────────────── */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function showTab(tabId, clickedBtn) {
    tabPanels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.id === tabId);
    });

    tabButtons.forEach(function (btn) {
      const isActive = btn === clickedBtn;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      showTab(btn.dataset.tab, btn);
    });
  });

  /* ── Form helpers ──────────────────────────────────────────── */
  function setStatus(el, message, type) {
    el.textContent = message;
    el.className = 'form-status form-status--' + type;
  }

  function clearStatus(el) {
    el.textContent = '';
    el.className = 'form-status';
  }

  function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
  }

  function setButtonLoading(btn, loading, defaultText) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Submitting…' : defaultText;
    btn.style.opacity = loading ? '0.7' : '1';
  }

  /* ── Donor form ────────────────────────────────────────────── */
  const donorForm = document.getElementById('donor-form');
  const donorStatus = document.getElementById('donor-status');
  const donorSubmitBtn = document.getElementById('donor-submit-btn');
  const DONOR_BTN_TEXT = '🩸 Register as Donor';

  donorForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus(donorStatus);

    const formData = {
      name: donorForm.name.value,
      phone: donorForm.phone.value,
      age: donorForm.age.value,
      gender: donorForm.gender.value,
      bloodGroup: donorForm.bloodGroup.value,
      address: donorForm.address.value,
      eligible: donorForm.eligible.checked,
    };

    if (!formData.name || !formData.phone || !formData.age || !formData.gender || !formData.bloodGroup || !formData.address) {
      setStatus(donorStatus, 'Please fill in all required fields.', 'error');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setStatus(donorStatus, 'Enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }

    const age = Number(formData.age);
    if (age < 18 || age > 65) {
      setStatus(donorStatus, 'Age must be between 18 and 65.', 'error');
      return;
    }

    if (!formData.eligible) {
      setStatus(donorStatus, 'You must be eligible to donate. Please uncheck only if temporarily ineligible.', 'error');
      return;
    }

    setButtonLoading(donorSubmitBtn, true, DONOR_BTN_TEXT);

    try {
      await ApiService.registerDonor(formData);
      setStatus(donorStatus, '✅ Registration successful! Our team will contact you soon.', 'success');
      donorForm.reset();
      document.getElementById('donor-eligible').checked = true;
    } catch (err) {
      setStatus(donorStatus, err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setButtonLoading(donorSubmitBtn, false, DONOR_BTN_TEXT);
    }
  });

  /* ── Blood request form ────────────────────────────────────── */
  const requestForm = document.getElementById('request-form');
  const requestStatus = document.getElementById('request-status');
  const requestSubmitBtn = document.getElementById('request-submit-btn');
  const REQUEST_BTN_TEXT = '🆘 Submit Urgent Request';

  requestForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearStatus(requestStatus);

    const formData = {
      bloodGroup: requestForm.bloodGroup.value,
      contactName: requestForm.contactName.value,
      contactPhone: requestForm.contactPhone.value,
    };

    if (!formData.bloodGroup || !formData.contactName || !formData.contactPhone) {
      setStatus(requestStatus, 'Please fill in all required fields.', 'error');
      return;
    }

    if (!validatePhone(formData.contactPhone)) {
      setStatus(requestStatus, 'Enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }

    setButtonLoading(requestSubmitBtn, true, REQUEST_BTN_TEXT);

    try {
      await ApiService.submitBloodRequest(formData);
      setStatus(requestStatus, '✅ Request submitted! Our coordinator has been notified.', 'success');
      requestForm.reset();
    } catch (err) {
      setStatus(requestStatus, err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setButtonLoading(requestSubmitBtn, false, REQUEST_BTN_TEXT);
    }
  });
})();
