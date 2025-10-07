// Lightbox fullscreen image preview for Our Space images
document.addEventListener('DOMContentLoaded', () => {
  // Function to show the card modal with title, message, and callbacks for OK and Cancel
  function showCardModal(title, message, onOk, onCancel) {
    const cardModal = document.getElementById('cardModal');
    const cardModalTitle = document.getElementById('cardModalTitle');
    const cardModalBody = document.getElementById('cardModalBody');
    const cardModalOk = document.getElementById('cardModalOk');
    const cardModalCancel = document.getElementById('cardModalCancel');
    const cardModalClose = document.querySelector('.card-modal-close');

    cardModalTitle.textContent = title;
    cardModalBody.textContent = message;
    cardModal.style.display = 'block';

    function cleanup() {
      cardModal.style.display = 'none';
      cardModalOk.removeEventListener('click', okHandler);
      cardModalCancel.removeEventListener('click', cancelHandler);
      cardModalClose.removeEventListener('click', cancelHandler);
    }

    function okHandler() {
      cleanup();
      if (typeof onOk === 'function') onOk();
    }

    function cancelHandler() {
      cleanup();
      if (typeof onCancel === 'function') onCancel();
    }

    cardModalOk.addEventListener('click', okHandler);
    cardModalCancel.addEventListener('click', cancelHandler);
    cardModalClose.addEventListener('click', cancelHandler);
  }

  // Override the default alert function to use the card modal
  window.alert = function(message) {
    showCardModal('Alert', message, null, null);
  };

  // Alias openAppModal to showCardModal for backward compatibility
  function openAppModal(message, title = 'Notice', okLabel = 'OK', onOk) {
    showCardModal(title, message, onOk, null);
  }
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  // Lightbox handlers (guarded so the rest of the script still runs)
  if (lightbox && lightboxImg) {
  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Preview';
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  document.querySelectorAll('.our-gallery .images img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxClose) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
  }

  // Contact form handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');

      // Basic validation feedback
      if (!name || !email || !message) {
        showCardModal('Error', 'Please fill in all fields.', null, null);
        return;
      }

      // Simulate async submit with loading and success states
      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.classList.add('is-loading');
      submitBtn.textContent = 'Sending';

      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.classList.add('is-success');
        submitBtn.textContent = 'Sent';
        contactForm.reset();

        setTimeout(() => {
          submitBtn.classList.remove('is-success');
          submitBtn.textContent = originalText;
        }, 1600);
      }, 1200);
    });
  }

  // Footer year
  const yearCopy = document.getElementById('yearCopy');
  if (yearCopy) {
    yearCopy.textContent = new Date().getFullYear();
  }

  // Back to top behavior
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

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
      }
    } catch (e) { /* ignore */ }

    const saveDraft = () => {
      const payload = {
        name: resName?.value || '',
        phone: resPhone?.value || '',
        email: resEmail?.value || '',
        date: resDate?.value || '',
        time: resTime?.value || '',
        guests: resGuests?.value || ''
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
      // Date not in past
      if (!resDate.value || resDate.value < toISODate(new Date())) {
        errors.push('Choose a valid date (not in the past).');
        resDate.classList.add('invalid');
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
      return errors;
    };

    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = reservationForm.querySelector('.submit-btn');
      const originalText = submitBtn.textContent;

      const errors = validate();
      if (errors.length) { showCardModal('Fix these', errors.join('\n'), null, null); return; }

      submitBtn.classList.add('is-loading');
      submitBtn.textContent = 'Booking...';

      setTimeout(() => {
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

        setTimeout(() => {
          submitBtn.classList.remove('is-success');
          submitBtn.textContent = originalText;
        }, 1600);
      }, 1200);
    });
  }

  // Login/Signup toggle (for login.html)
  const loginContainer = document.getElementById('container');
  const registerToggleBtn = document.getElementById('register');
  const loginToggleBtn = document.getElementById('login');
  if (loginContainer && (registerToggleBtn || loginToggleBtn)) {
    // Initialize based on URL hash ?view=signup to open sign-up directly
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'signup') {
      loginContainer.classList.add('active');
    }
    registerToggleBtn && registerToggleBtn.addEventListener('click', () => {
      loginContainer.classList.add('active');
    });
    loginToggleBtn && loginToggleBtn.addEventListener('click', () => {
      loginContainer.classList.remove('active');
    });

  // Removed popup modal functionality as per user request

    // Basic validation and demo auth flow
    const signUpForm = loginContainer.querySelector('#signupForm');
    const signInForm = loginContainer.querySelector('#signinForm');
    const verifyForm = loginContainer.querySelector('#verifyForm');
    const otpDestination = loginContainer.querySelector('#otpDestination');
    const resendOtp = loginContainer.querySelector('#resendOtp');
    const backToSignup = loginContainer.querySelector('#backToSignup');

    const markInvalid = (el) => { el.classList.add('invalid'); };
    const clearInvalids = (form) => { form.querySelectorAll('.invalid').forEach(x => x.classList.remove('invalid')); };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const saveUser = (user) => { try { localStorage.setItem('demoUser', JSON.stringify(user)); } catch(e){} };
    const loadUser = () => { try { return JSON.parse(localStorage.getItem('demoUser')||'null'); } catch(e){ return null; } };
    // EmailJS config (fill these values for production)
    const EMAILJS_PUBLIC_KEY = window.EMAILJS_PUBLIC_KEY || '';
    const EMAILJS_SERVICE_ID = window.EMAILJS_SERVICE_ID || '';
    const EMAILJS_TEMPLATE_ID = window.EMAILJS_TEMPLATE_ID || '';
    if (window.emailjs && EMAILJS_PUBLIC_KEY) {
      try { window.emailjs.init(EMAILJS_PUBLIC_KEY); } catch(e){}
    }
    async function sendOtpEmail(toEmail, otpCode){
      if (!window.emailjs || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) return false;
      try{
        await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { to_email: toEmail, otp: otpCode });
        return true;
      }catch(err){ console.error('EmailJS error', err); return false; }
    }


    if (signUpForm) {
      signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearInvalids(signUpForm);
        const [nameEl, emailEl, passEl] = signUpForm.querySelectorAll('input');
        let ok = true;
        if (!nameEl.value || nameEl.value.trim().length < 2) { markInvalid(nameEl); ok = false; }
        if (!emailRegex.test(emailEl.value)) { markInvalid(emailEl); ok = false; }
        if (!passEl.value || passEl.value.length < 6) { markInvalid(passEl); ok = false; }
        if (!ok) { showCardModal('Sign Up', 'Please fill in all required fields correctly.', null, null); return; }
        // Simulate sending OTP
        const phoneEl = document.getElementById('signupPhone');
        const phoneVal = phoneEl && phoneEl.value ? `+${phoneEl.value}` : '';
        const emailVal = emailEl.value.trim();
        const dest = [emailVal || null, phoneVal || null].filter(Boolean).join(' and ');
        otpDestination.textContent = dest || 'your email/phone';
        // Generate a one-time 6-digit code and store temporarily
        const code = String(Math.floor(100000 + Math.random()*900000));
        try { sessionStorage.setItem('otpCode', code); } catch(e){}
        // Attempt to send via EmailJS; fallback to console if not configured
        let sent = false;
        if (emailRegex.test(emailVal) && EMAILJS_PUBLIC_KEY) {
          const btn = signUpForm.querySelector('button[type="submit"]');
          const original = btn.textContent; btn.classList.add('is-loading'); btn.textContent = 'Sending OTP...';
          sent = await sendOtpEmail(emailVal, code);
          btn.classList.remove('is-loading'); btn.textContent = original;
        }
        // No backend SMS in frontend-only mode; keep email or demo fallback
        if (!sent) { console.log('DEV OTP:', code); }
        // Move to verify screen (hide sign-in; show verify)
        loginContainer.classList.add('active');
        loginContainer.classList.add('verify-otp');
        const hint = document.getElementById('otpHint');
        if (hint) hint.style.display = EMAILJS_PUBLIC_KEY || phoneVal ? 'none' : 'block';
        showCardModal('Verify your account', sent ? 'We sent a verification code to your email. Use the same code for phone as well.' : 'Verification code generated. Check console. You can also use 123456.', null, null);
      });
    }

    if (verifyForm) {
      verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otpInput = document.getElementById('otpCode');
        const expected = sessionStorage.getItem('otpCode');
        const isDefault = otpInput.value === '123456';
        if (!otpInput.value || otpInput.value.length !== 6 || (otpInput.value !== expected && !isDefault)) {
          otpInput.classList.add('invalid');
          showCardModal('Verification', 'Invalid code. Please try again.', null, null);
          return;
        }
        // On success, finalize signup: save user and go to home
        const nameVal = document.getElementById('signupName').value.trim();
        const emailVal = document.getElementById('signupEmail').value.trim();
        const passVal = document.getElementById('signupPassword').value;
        saveUser({ name: nameVal, email: emailVal, password: passVal });
        sessionStorage.removeItem('otpCode');
        const btn = verifyForm.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.classList.add('is-loading');
        btn.textContent = 'Verified';
        setTimeout(() => { window.location.href = 'index.html'; }, 600);
      });
    }

    resendOtp && resendOtp.addEventListener('click', async (e) => {
      e.preventDefault();
      const code = String(Math.floor(100000 + Math.random()*900000));
      try { sessionStorage.setItem('otpCode', code); } catch(e){}
      let sent = false; const signupEmail = document.getElementById('signupEmail');
      if (signupEmail && EMAILJS_PUBLIC_KEY) {
        sent = await sendOtpEmail(signupEmail.value.trim(), code);
      }
      if (!sent) console.log('DEV OTP (resend):', code);
      showCardModal('Verification', sent ? 'A new code has been sent to your email.' : 'A new demo code is in the console.', null, null);
    });

    backToSignup && backToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      loginContainer.classList.remove('verify-otp');
    });
    if (signInForm) {
      signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearInvalids(signInForm);
        const [emailEl, passEl] = signInForm.querySelectorAll('input');
        let ok = true;
        if (!emailRegex.test(emailEl.value)) { markInvalid(emailEl); ok = false; }
        if (!passEl.value || passEl.value.length < 6) { markInvalid(passEl); ok = false; }
        if (!ok) { showCardModal('Sign In', 'Please enter a valid email and password (6+ characters).', null, null); return; }
        const user = loadUser();
        if (!user || user.email !== emailEl.value.trim() || user.password !== passEl.value) {
          showCardModal('Sign In', 'Invalid credentials. If you are new here, please Sign Up.', null, null);
          return;
        }
        const btn = signInForm.querySelector('button');
        const original = btn.textContent;
        btn.classList.add('is-loading');
        btn.textContent = 'Signing in...';
        setTimeout(() => {
          btn.classList.remove('is-loading');
          btn.classList.add('is-success');
          btn.textContent = 'Welcome!';
          setTimeout(() => { window.location.href = 'index.html'; }, 600);
        }, 700);
      });
    }

    // Add click event to change submit button color to green
    const submitButtons = loginContainer.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.add('clicked-green');
        setTimeout(() => {
          btn.classList.remove('clicked-green');
        }, 1000); // Revert back to orange after 1 second
      });
    });
  }

  // Simple auth UI on index: show login/signup or profile
  const authUser = (() => { try { return JSON.parse(localStorage.getItem('demoUser')||'null'); } catch(e){ return null; } })();
  const btnSign = document.getElementById('btnSign');
  const btnReserve = document.getElementById('btnReserve');
  const btnProfile = document.getElementById('btnProfile');
  const profileMenu = document.getElementById('profileMenu');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileName = document.getElementById('profileName');
  if (btnSign && btnReserve) {
    if (authUser) {
      btnSign.style.display = 'none';
      if (btnProfile) {
        btnProfile.style.display = 'inline-flex';
        btnProfile.innerHTML = `${authUser.name || 'Profile'} <i class='bx bxs-user-circle' style="margin-left:8px;font-size:20px"></i>`;
        if (profileName) profileName.textContent = authUser.name || 'Profile';
        btnProfile.onclick = () => {
          if (!profileMenu) return;
          profileMenu.style.display = profileMenu.style.display === 'none' ? 'block' : 'none';
        };
      }
      btnReserve.onclick = () => { location.href = 'reservation.html'; };
    } else {
      btnSign.onclick = () => { showCardModal('Login Required', 'Please login first.', () => { location.href = 'login.html'; }, null); };
      btnReserve.onclick = () => { showCardModal('Login Required', 'Please login first.', () => { location.href = 'login.html'; }, null); };
    }
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      try { localStorage.removeItem('demoUser'); } catch(e){}
      location.href = 'index.html';
    };
  }

  // Require login for key CTAs on index
  const requireLoginThen = (handler) => (e) => {
    if (!authUser) {
      e && e.preventDefault && e.preventDefault();
      showCardModal('Login Required', 'Please login first.', () => { location.href = 'login.html'; }, null);
      return;
    }
    if (typeof handler === 'function') handler(e);
  };
  // Explore -> gallery
  document.querySelectorAll('.explore').forEach(btn => {
    btn.addEventListener('click', requireLoginThen(() => { location.hash = '#gallery'; }));
  });
  // Reserve -> reservation page
  document.querySelectorAll('.reserve').forEach(btn => {
    btn.addEventListener('click', requireLoginThen(() => { location.href = 'reservation.html'; }));
  });
  // Order buttons in services
  document.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', requireLoginThen());
  });
});


// login page
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});
