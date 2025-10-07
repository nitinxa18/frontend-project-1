// Reservation-specific JavaScript logic for reservation.html

document.addEventListener('DOMContentLoaded', () => {
  // Custom popup card modal elements
  const popupCardModal = document.getElementById('popupCardModal');
  const popupCardMessage = document.getElementById('popupCardMessage');
  const popupCardOkBtn = document.getElementById('popupCardOkBtn');

  let popupOnOkCallback = null;

  function closePopup() {
    popupCardModal.setAttribute('aria-hidden', 'true');
    if (typeof popupOnOkCallback === 'function') {
      popupOnOkCallback();
      popupOnOkCallback = null;
    }
  }

  popupCardOkBtn.addEventListener('click', () => {
    closePopup();
  });

  popupCardModal.addEventListener('click', (e) => {
    if (e.target === popupCardModal) {
      closePopup();
    }
  });

  // Function to show popup card modal with message
  function showPopupCard(message, title = 'Notice', onOk) {
    if (!popupCardModal || !popupCardMessage || !popupCardOkBtn) {
      alert(message);
      if (typeof onOk === 'function') onOk();
      return;
    }
    popupCardMessage.textContent = message;
    popupCardModal.setAttribute('aria-hidden', 'false');
    popupCardOkBtn.focus();
    popupOnOkCallback = onOk || null;
  }

  // EmailJS config (fill these values for production)
  const EMAILJS_PUBLIC_KEY = window.EMAILJS_PUBLIC_KEY || '';
  const EMAILJS_SERVICE_ID = window.EMAILJS_SERVICE_ID || '';
  const EMAILJS_RESERVATION_TEMPLATE_ID = window.EMAILJS_RESERVATION_TEMPLATE_ID || ''; // New template for reservation confirmation
  if (window.emailjs && EMAILJS_PUBLIC_KEY) {
    try { window.emailjs.init(EMAILJS_PUBLIC_KEY); } catch(e){}
  }

  async function sendReservationEmail(reservationData) {
    if (!window.emailjs || !EMAILJS_SERVICE_ID || !EMAILJS_RESERVATION_TEMPLATE_ID) return false;
    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_RESERVATION_TEMPLATE_ID, {
        to_email: reservationData.email,
        name: reservationData.name,
        date: reservationData.date,
        time: reservationData.time,
        guests: reservationData.guests,
        phone: reservationData.phone,
        notes: reservationData.notes || 'None'
      });
      return true;
    } catch(err) {
      console.error('EmailJS error', err);
      return false;
    }
  }

  // Load user authentication data
  const loadUser = () => {
    try {
      return JSON.parse(localStorage.getItem('demoUser') || 'null');
    } catch(e) {
      return null;
    }
  };

  // Load reservations from localStorage
  const loadReservations = () => {
    try {
      return JSON.parse(localStorage.getItem('reservations') || '[]');
    } catch(e) {
      return [];
    }
  };

  // Save reservation to localStorage
  const saveReservation = (reservation) => {
    const reservations = loadReservations();
    reservation.id = Date.now(); // Simple unique ID
    reservations.push(reservation);
    try {
      localStorage.setItem('reservations', JSON.stringify(reservations));
    } catch(e) {
      console.error('Failed to save reservation', e);
    }
  };

  // Reservation form handler
  const reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    // Increment/Decrement buttons for guests
    const guestsInput = document.getElementById('resGuests');
    const decBtn = document.querySelector('.number-stepper .dec');
    const incBtn = document.querySelector('.number-stepper .inc');
    const syncGuests = (delta) => {
      const min = parseInt(guestsInput.min || '1', 10);
      const max = parseInt(guestsInput.max || '20', 10);
      const current = parseInt(guestsInput.value || guestsInput.placeholder || '1', 10);
      const next = clamp(current + delta, min, max);
      guestsInput.value = String(next);
      saveDraft();
    };
    decBtn && decBtn.addEventListener('click', () => syncGuests(-1));
    incBtn && incBtn.addEventListener('click', () => syncGuests(1));

    // Notes character counter
    const resNotes = document.getElementById('resNotes');
    const notesCounter = document.createElement('div');
    notesCounter.style.fontSize = '12px';
    notesCounter.style.color = '#666';
    notesCounter.style.textAlign = 'right';
    notesCounter.style.marginTop = '5px';
    if (resNotes) {
      resNotes.parentNode.appendChild(notesCounter);
      const updateCounter = () => {
        const length = resNotes.value.length;
        const max = 500;
        notesCounter.textContent = `${length}/${max}`;
        if (length > max) {
          notesCounter.style.color = 'red';
        } else {
          notesCounter.style.color = '#666';
        }
      };
      resNotes.addEventListener('input', updateCounter);
      updateCounter();
    }

    const resName = document.getElementById('resName');
    const resPhone = document.getElementById('resPhone');
    const resEmail = document.getElementById('resEmail');
    const resDate = document.getElementById('resDate');
    const resTime = document.getElementById('resTime');
    const resGuests = document.getElementById('resGuests');

    // Helpers
    const toISODate = (d) => d.toISOString().slice(0,10);
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const roundToNextHalfHour = (date) => {
      const rounded = new Date(date);
      rounded.setSeconds(0,0);
      const minutes = rounded.getMinutes();
      if (minutes === 0 || minutes === 30) return rounded;
      const nextHalf = minutes < 30 ? 30 : 60;
      rounded.setMinutes(nextHalf);
      if (nextHalf === 60) { rounded.setHours(rounded.getHours() + 1); rounded.setMinutes(0); }
      return rounded;
    };

    // Set min date and sensible defaults (hours: 11:00 - 23:00)
    const now = new Date();
    const todayISO = toISODate(now);
    if (resDate) {
      resDate.min = todayISO;
      // Limit to 30 days in advance
      const maxDate = new Date(now);
      maxDate.setDate(maxDate.getDate() + 30);
      resDate.max = toISODate(maxDate);
      if (!resDate.value) resDate.value = todayISO;
    }
    if (resTime) {
      const openingHour = 11;
      const closingHour = 23; // inclusive upper bound hour
      let nextSlot = roundToNextHalfHour(now);
      if (nextSlot.getHours() < openingHour) nextSlot.setHours(openingHour, 0, 0, 0);
      if (nextSlot.getHours() >= closingHour) {
        // move to tomorrow opening
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (resDate) resDate.value = toISODate(tomorrow);
        nextSlot = new Date(tomorrow);
        nextSlot.setHours(openingHour, 0, 0, 0);
      }
      const hh = String(nextSlot.getHours()).padStart(2,'0');
      const mm = String(nextSlot.getMinutes()).padStart(2,'0');
      if (!resTime.value) resTime.value = `${hh}:${mm}`;
    }

    // Availability: Disable Sundays
    if (resDate) {
      resDate.addEventListener('change', () => {
        const selectedDate = new Date(resDate.value);
        if (selectedDate.getDay() === 0) { // Sunday
          showPopupCard('We are closed on Sundays. Please select another date.', 'Unavailable');
          resDate.value = todayISO;
        }
      });
    }

    // Draft save/restore
    const DRAFT_KEY = 'reservationDraft';
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (draft) {
        resName && (resName.value = draft.name || resName.value);
        resPhone && (resPhone.value = draft.phone || resPhone.value);
        resEmail && (resEmail.value = draft.email || resEmail.value);
        resDate && (resDate.value = draft.date || resDate.value);
        resTime && (resTime.value = draft.time || resTime.value);
        resGuests && (resGuests.value = draft.guests || resGuests.value);
        resNotes && (resNotes.value = draft.notes || resNotes.value);
      }
    } catch (e) { /* ignore */ }

    const saveDraft = () => {
      const payload = {
        name: resName?.value || '',
        phone: resPhone?.value || '',
        email: resEmail?.value || '',
        date: resDate?.value || '',
        time: resTime?.value || '',
        guests: resGuests?.value || '',
        notes: resNotes?.value || ''
      };
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch (e) { /* ignore */ }
    };
    reservationForm.addEventListener('input', saveDraft);

    // Sanitize phone to digits only
    if (resPhone) {
      resPhone.addEventListener('input', () => {
        const digits = resPhone.value.replace(/\D+/g, '').slice(0, 15);
        if (resPhone.value !== digits) resPhone.value = digits;
      });
    }

    // Prefill with user data if logged in
    const authUser = loadUser();
    if (authUser) {
      resName && (resName.value = authUser.name || resName.value);
      resEmail && (resEmail.value = authUser.email || resEmail.value);
      // Phone not stored in user, so leave as is
    }

    const clearInvalids = () => {
      reservationForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    };

    const validate = () => {
      clearInvalids();
      const errors = [];
      // Name
      if (!resName.value || resName.value.trim().length < 2) {
        errors.push('Please enter your full name.');
        resName.classList.add('invalid');
      }
      // Phone 10+ digits
      if (!/^\d{10,}$/.test(resPhone.value)) {
        errors.push('Enter a valid phone number (at least 10 digits).');
        resPhone.classList.add('invalid');
      }
      // Email basic
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(resEmail.value)) {
        errors.push('Enter a valid email address.');
        resEmail.classList.add('invalid');
      }
      // Date not in past and not Sunday
      if (!resDate.value || resDate.value < toISODate(new Date())) {
        errors.push('Choose a valid date (not in the past).');
        resDate.classList.add('invalid');
      } else {
        const selectedDate = new Date(resDate.value);
        if (selectedDate.getDay() === 0) {
          errors.push('We are closed on Sundays.');
          resDate.classList.add('invalid');
        }
      }
      // Time within hours
      if (resTime.value) {
        const [hh, mm] = resTime.value.split(':').map(Number);
        if (hh < 11 || (hh > 22 || (hh === 22 && mm > 59)) && hh >= 23) {
          errors.push('Select a time between 11:00 and 23:00.');
          resTime.classList.add('invalid');
        }
      } else {
        errors.push('Select a reservation time.');
        resTime.classList.add('invalid');
      }
      // Guests
      const guestsVal = parseInt(resGuests.value, 10);
      if (Number.isNaN(guestsVal) || guestsVal < 1 || guestsVal > 20) {
        errors.push('Guests must be between 1 and 20.');
        resGuests.classList.add('invalid');
      }
      // Notes length
      if (resNotes && resNotes.value.length > 500) {
        errors.push('Special requests must be under 500 characters.');
        resNotes.classList.add('invalid');
      }
      return errors;
    };

    reservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check authentication
      if (!authUser) {
        showPopupCard('Please login first to make a reservation.', 'Login Required', () => {
          window.location.href = 'login.html';
        });
        return;
      }

      const submitBtn = reservationForm.querySelector('.submit-btn');
      const originalText = submitBtn.textContent;

      const errors = validate();
      if (errors.length) {
      showPopupCard(errors.join('\n'), 'Fix these', 'Fill details');
      return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.textContent = 'Booking...';

      // Simulate processing
      setTimeout(async () => {
        // Save reservation
        const reservationData = {
          name: resName.value.trim(),
          phone: resPhone.value,
          email: resEmail.value.trim(),
          date: resDate.value,
          time: resTime.value,
          guests: parseInt(resGuests.value, 10),
          notes: resNotes ? resNotes.value.trim() : '',
          timestamp: new Date().toISOString()
        };
        saveReservation(reservationData);

        // Send confirmation email
        let emailSent = false;
        if (EMAILJS_PUBLIC_KEY) {
          emailSent = await sendReservationEmail(reservationData);
        }

        submitBtn.classList.remove('is-loading');
        submitBtn.classList.add('is-success');
        submitBtn.textContent = 'Booked!';
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        reservationForm.reset();

        // Show themed booked modal
        const booked = document.getElementById('bookedModal');
        const bookedOk = document.getElementById('bookedOk');
        if (booked && bookedOk) {
          booked.classList.add('open');
          bookedOk.onclick = () => { booked.classList.remove('open'); };
          booked.onclick = (evt) => { if (evt.target === booked) booked.classList.remove('open'); };
        }

        // Show email sent message if applicable
        if (emailSent) {
          showPopupCard('Reservation confirmed! A confirmation email has been sent.', 'Success');
        } else {
          showPopupCard('Reservation confirmed! (Email confirmation not configured)', 'Success');
        }

        setTimeout(() => {
          submitBtn.classList.remove('is-success');
          submitBtn.textContent = originalText;
        }, 1600);
      }, 1200);
    });
  }

  // Footer year (if exists)
  const yearCopy = document.getElementById('yearCopy');
  if (yearCopy) {
    yearCopy.textContent = new Date().getFullYear();
  }

  // Back to top behavior (if exists)
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
