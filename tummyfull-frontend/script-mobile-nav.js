// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const closeMobileNav = document.getElementById('closeMobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }

  if (closeMobileNav && mobileNav) {
    closeMobileNav.addEventListener('click', () => {
      mobileNav.classList.remove('open');
    });
  }

  // Mobile nav links close the menu
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-content a');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav) mobileNav.classList.remove('open');
    });
  });

  // Mobile buttons
  const btnSignMobile = document.getElementById('btnSignMobile');
  const btnReserveMobile = document.getElementById('btnReserveMobile');
  if (btnSignMobile) {
    btnSignMobile.onclick = () => {
      if (typeof openAppModal === 'function') {
        openAppModal('Please login first.', 'Login Required', 'Login', () => { location.href = 'login.html'; });
      }
    };
  }
  if (btnReserveMobile) {
    btnReserveMobile.onclick = () => {
      if (typeof requireLoginThen === 'function') {
        requireLoginThen(() => { location.href = 'reservation.html'; })();
      }
    };
  }

  // Contact form validation and popup
  const contactForm = document.getElementById('contactForm');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showPopupCard('Please fill in all details.', 'Warning');
    } else {
      showPopupCard('Message sent successfully!', 'Success');
      // Reset form
      contactForm.reset();
    }
  });
});

const sendBtn = document.getElementById("sendBtn");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

sendBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (name === "" || email === "" || message === "") {
    // Show popup if any field is empty
    popup.style.display = "flex";
  } else {
    alert("Message Sent Successfully ✅");
  }
});

// Close popup
closePopup.addEventListener("click", () => {
  popup.style.display = "none";
});

// Close if click outside popup
window.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.style.display = "none";
  }
});
