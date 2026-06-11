/**
 * API Service — communicates with the Google Apps Script web app (Code.gs).
 *
 * SETUP: Replace WEB_APP_URL with your deployed Apps Script URL after publishing Code.gs.
 */
const ApiService = (function () {
  const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyN4QVQQx1Z_1NY6W0sz1zy41bf2TuBDrZ0K_aqJhJ4kPmh2zpqgZc8Ma0rfPsv3LVeIw/exec';

  async function post(action, payload) {
    if (WEB_APP_URL != 'https://script.google.com/macros/s/AKfycbyN4QVQQx1Z_1NY6W0sz1zy41bf2TuBDrZ0K_aqJhJ4kPmh2zpqgZc8Ma0rfPsv3LVeIw/exec') {
      throw new Error(
        'API not configured. Deploy Code.gs and set WEB_APP_URL in apiService.js.'
      );
    }

    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    });

    if (!response.ok) {
      throw new Error('Server error (' + response.status + '). Please try again.');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Submission failed. Please try again.');
    }
    return data;
  }

  function registerDonor(formData) {
    return post('registerDonor', {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      address: formData.address.trim(),
      eligible: formData.eligible,
    });
  }

  function submitBloodRequest(formData) {
    return post('submitRequest', {
      bloodGroup: formData.bloodGroup,
      contactName: formData.contactName.trim(),
      contactPhone: formData.contactPhone.trim(),
    });
  }

  return { registerDonor, submitBloodRequest };
})();
