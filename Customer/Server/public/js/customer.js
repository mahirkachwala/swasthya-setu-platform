const BACKEND = 'https://health-bridge-backend.replit.app';

const SUPABASE_URL = 'https://iwvqypawztxulfjhpjyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dnF5cGF3enR4dWxmamhwanl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTEzNjIsImV4cCI6MjA4Nzg4NzM2Mn0.Xx1J8-aXfxxjycJZRZaJ2JBDNQzUwlIYfJpUn2IepMc';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let currentUser = null;
let currentLang = 'en';
let selectedCenter = null;
let centersCache = [];

const LANG_LABELS = { en:'EN', hi:'HI', mr:'MR', ta:'TA', te:'TE', bn:'BN', gu:'GU', kn:'KN', pa:'PA' };

function setTodayAsMinimumDate() {
  const dateInput = document.getElementById('book-date');
  if (!dateInput) return;
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  dateInput.min = localDate;
  dateInput.value = localDate;
}

function init() {
  const saved = localStorage.getItem('vc_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      showApp();
    } catch(e) { localStorage.removeItem('vc_user'); }
  }
  const lang = localStorage.getItem('vc_lang');
  if (lang) { currentLang = lang; updateLangBadges(); }

  setTodayAsMinimumDate();
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navMap = { home: 0, book: 1, chat: 2, profile: 3 };
  const navItems = document.querySelectorAll('.nav-item');
  if (navMap[id] !== undefined && navItems[navMap[id]]) navItems[navMap[id]].classList.add('active');
}

function navigateTo(page) {
  if (!currentUser && page !== 'auth') {
    showPage('auth');
    return;
  }
  showPage(page);
  if (page === 'home') loadHome();
  if (page === 'book') loadCenters();
  if (page === 'centers') loadAllCenters();
  if (page === 'profile') loadProfile();
  if (page === 'chat') focusChat();
}

function showLogin() {
  document.getElementById('auth-login').style.display = 'block';
  document.getElementById('auth-register').style.display = 'none';
  document.getElementById('login-error').textContent = '';
}

function showRegister() {
  document.getElementById('auth-login').style.display = 'none';
  document.getElementById('auth-register').style.display = 'block';
  document.getElementById('reg-error').textContent = '';
}

async function doLogin() {
  const aadhaar = document.getElementById('login-aadhaar').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';

  if (!aadhaar || !password) { errEl.textContent = 'Please fill in all fields'; return; }
  if (aadhaar.length !== 12) { errEl.textContent = 'Aadhaar must be 12 digits'; return; }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'Signing in...';

  try {
    const res = await fetch(`${BACKEND}/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar, password })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('vc_user', JSON.stringify(currentUser));
      showApp();
    } else {
      errEl.textContent = data.error || 'Login failed';
    }
  } catch (err) {
    errEl.textContent = 'Connection error. Please try again.';
  }
  btn.disabled = false;
  btn.textContent = 'Sign In';
}

async function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const aadhaar = document.getElementById('reg-aadhaar').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl = document.getElementById('reg-error');
  errEl.textContent = '';

  if (!name || !aadhaar || !password) { errEl.textContent = 'Please fill in all fields'; return; }
  if (aadhaar.length !== 12) { errEl.textContent = 'Aadhaar must be 12 digits'; return; }
  if (password.length < 4) { errEl.textContent = 'Password must be at least 4 characters'; return; }

  try {
    const res = await fetch(`${BACKEND}/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar, name, password })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      currentUser.aadhar_no = aadhaar;
      localStorage.setItem('vc_user', JSON.stringify(currentUser));
      showApp();
    } else {
      errEl.textContent = data.error || 'Registration failed';
    }
  } catch (err) {
    errEl.textContent = 'Connection error. Please try again.';
  }
}

function showApp() {
  const avatar = document.getElementById('header-avatar');
  const initial = (currentUser.username || 'U').charAt(0).toUpperCase();
  avatar.textContent = initial;
  document.getElementById('profile-avatar').textContent = initial;
  navigateTo('home');
}

function doLogout() {
  currentUser = null;
  localStorage.removeItem('vc_user');
  showPage('auth');
  showLogin();
}

async function loadHome() {
  const name = currentUser.username || 'User';
  document.getElementById('greeting-name').textContent = `Hello, ${name}!`;
  loadHomeAppointments();
}

async function loadHomeAppointments() {
  const container = document.getElementById('home-appointments');
  try {
    const res = await fetch(`${BACKEND}/customer/appointments/` + currentUser.aadhar_no);
    const apts = await res.json();
    if (!Array.isArray(apts) || apts.length === 0) {
      container.innerHTML = '<div class="empty-state-sm">No appointments yet. Book one to get started!</div>';
      return;
    }
    container.innerHTML = apts.slice(0, 3).map(a => renderAppointmentCard(a)).join('');
  } catch (err) {
    container.innerHTML = '<div class="empty-state-sm">No appointments yet. Book one to get started!</div>';
  }
}

function renderAppointmentCard(a) {
  const statusClass = a.status.toLowerCase();
  const date = new Date(a.slot).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Kolkata' });
  const time = new Date(a.slot).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Kolkata' });
  return `
    <div class="appointment-card ${statusClass}">
      <h4>${a.centerName || a.centerId}</h4>
      <p>${date} at ${time} | Dose ${a.dose || 1}</p>
      <span class="apt-status ${statusClass}">${a.status}</span>
    </div>
  `;
}

async function loadCenters() {
  document.getElementById('booking-step1').style.display = 'block';
  document.getElementById('booking-step2').style.display = 'none';
  document.getElementById('booking-success').style.display = 'none';
  selectedCenter = null;

  const container = document.getElementById('centers-list');
  container.innerHTML = '<div class="empty-state-sm">Loading centers...</div>';

  try {
    const res = await fetch(`${BACKEND}/customer/centers`);
    centersCache = await res.json();
    renderCentersList(container, centersCache, true);
  } catch (err) {
    container.innerHTML = '<div class="empty-state-sm">Could not load centers. Try again later.</div>';
  }
}

async function loadAllCenters() {
  const container = document.getElementById('all-centers-list');
  container.innerHTML = '<div class="empty-state-sm">Loading centers...</div>';
  try {
    const res = await fetch(`${BACKEND}/customer/centers`);
    const centers = await res.json();
    renderCentersList(container, centers, false);
  } catch (err) {
    container.innerHTML = '<div class="empty-state-sm">Could not load centers.</div>';
  }
}

function renderCentersList(container, centers, selectable) {
  if (!centers.length) {
    container.innerHTML = '<div class="empty-state-sm">No vaccination centers available.</div>';
    return;
  }
  container.innerHTML = centers.map((c, i) => `
    <div class="center-card" ${selectable ? `onclick="selectCenter(${i})"` : ''} id="center-${i}">
      <h4>${c.name}</h4>
      <p>${c.address || `Lat: ${c.latitude}, Lng: ${c.longitude}`}</p>
      ${c.slots ? `<span class="center-slots">${c.slots} slots available</span>` : ''}
    </div>
  `).join('');
}

function selectCenter(index) {
  selectedCenter = centersCache[index];
  document.querySelectorAll('.center-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('center-' + index).classList.add('selected');

  document.getElementById('booking-step1').style.display = 'none';
  document.getElementById('booking-step2').style.display = 'block';

  setTodayAsMinimumDate();

  document.getElementById('selected-center-info').innerHTML = `
    <h4>${selectedCenter.name}</h4>
    <p>${selectedCenter.address || `Lat: ${selectedCenter.latitude}, Lng: ${selectedCenter.longitude}`}</p>
  `;
}

function backToStep1() {
  document.getElementById('booking-step1').style.display = 'block';
  document.getElementById('booking-step2').style.display = 'none';
  selectedCenter = null;
}

async function confirmBooking() {
  const date = document.getElementById('book-date').value;
  const time = document.getElementById('book-time').value;
  const dose = document.getElementById('book-dose').value;
  const errEl = document.getElementById('book-error');
  errEl.textContent = '';

  if (!date) { errEl.textContent = 'Please select a date'; return; }
  if (!selectedCenter) { errEl.textContent = 'Please select a center'; return; }

  const selectedDate = new Date(date);
  const todayCheck = new Date();
  todayCheck.setHours(0,0,0,0);
  if (selectedDate < todayCheck) { errEl.textContent = 'Please select today or a future date'; return; }

  const slot = `${date}T${time}:00+05:30`;

  const patientName = currentUser.username || currentUser.name;
  const phone = currentUser.phone || '';
  const centerId = selectedCenter._id || selectedCenter.centerId;
  const centerName = selectedCenter.name || centerId;

  try {
    const res = await fetch(`${BACKEND}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aadhaarId: currentUser.aadhar_no,
        patientName,
        phone,
        language: currentLang,
        centerId,
        slotTime: slot,
        vaccineType: 'Covishield',
        aadhaarVerified: true
      })
    });
    const data = await res.json();
    console.log('[BOOKING] Backend response:', data);
    if (data.appointment) {
      localStorage.setItem('appointmentId', data.appointment.appointmentId);
      console.log('[BOOKING] Appointment ID saved:', data.appointment.appointmentId);

      if (supabaseClient) {
        try {
          const { error: sbErr } = await supabaseClient.from('appointments').insert([{
            appointment_id: data.appointment.appointmentId,
            name: patientName,
            phone: phone,
            center: centerName,
            date: date,
            time: time,
            vaccine_type: 'Covishield',
            dose: dose,
            status: 'BOOKED',
            aadhaar_id: currentUser.aadhar_no
          }]);
          if (sbErr) console.warn('[SUPABASE] Insert error (non-blocking):', sbErr.message);
          else console.log('[SUPABASE] Appointment saved to Supabase');
        } catch (sbCatchErr) {
          console.warn('[SUPABASE] Insert failed (non-blocking):', sbCatchErr);
        }
      }

      showBookingSuccess(data.appointment);
    } else {
      errEl.textContent = data.error || 'Booking failed';
      console.error('[BOOKING] Failed:', data);
    }
  } catch (err) {
    console.error('[BOOKING] Connection error:', err);
    errEl.textContent = 'Connection error. Please try again.';
  }
}

function showBookingSuccess(apt) {
  document.getElementById('booking-step1').style.display = 'none';
  document.getElementById('booking-step2').style.display = 'none';
  document.getElementById('booking-success').style.display = 'block';

  const slotDate = new Date(apt.slotTime || apt.slot);
  const tzOpts = { timeZone: 'Asia/Kolkata' };
  document.getElementById('booking-details').innerHTML = `
    <div class="detail"><label>Appointment ID</label><span>${apt.appointmentId}</span></div>
    <div class="detail"><label>Center</label><span>${apt.centerName}</span></div>
    <div class="detail"><label>Date</label><span>${slotDate.toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric', ...tzOpts})}</span></div>
    <div class="detail"><label>Time</label><span>${slotDate.toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit', ...tzOpts})}</span></div>
    <div class="detail"><label>Vaccine</label><span>${apt.vaccineType || 'Covishield'}</span></div>
    <div class="detail"><label>Status</label><span id="booking-status-display">${apt.status}</span></div>
  `;

  const qrContainer = document.getElementById('booking-qr');
  qrContainer.innerHTML = '';
  if (window.QRCode) {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, JSON.stringify({ id: apt.appointmentId, center: apt.centerName, slot: apt.slotTime || apt.slot, vaccine: apt.vaccineType }), { width: 200, margin: 2 }, function(err) {
      if (!err) qrContainer.appendChild(canvas);
    });
  }
}

async function verifyShipment() {
  const id = document.getElementById('verify-shipment-id').value.trim();
  const resultEl = document.getElementById('verify-result');
  if (!id) return;

  resultEl.style.display = 'block';
  resultEl.innerHTML = '<div class="empty-state-sm">Checking...</div>';

  try {
    const res = await fetch(`${BACKEND}/iot/shipment/` + id + '/latest');
    if (!res.ok) {
      resultEl.innerHTML = '<div class="verify-result-card unsafe"><div class="verdict-big unsafe">Not Found</div><p style="text-align:center;color:#64748b">No shipment found with this ID. Please check and try again.</p></div>';
      return;
    }
    const data = await res.json();
    const s = data.shipment;
    const t = data.latestTelemetry;
    const isSafe = s.verdict === 'SAFE';

    resultEl.innerHTML = `
      <div class="verify-result-card ${isSafe ? 'safe' : 'unsafe'}">
        <div class="verdict-big ${isSafe ? 'safe' : 'unsafe'}">${isSafe ? 'SAFE' : 'UNSAFE'}</div>
        <div class="verify-detail"><label>Shipment</label><span>${s.shipmentId}</span></div>
        <div class="verify-detail"><label>Route</label><span>${s.source} to ${s.destination}</span></div>
        <div class="verify-detail"><label>Allowed Temp</label><span>${s.tempRange}</span></div>
        <div class="verify-detail"><label>Status</label><span>${s.status}</span></div>
        ${t ? `<div class="verify-detail"><label>Current Temp</label><span>${t.tempC}\u00B0C</span></div>` : ''}
        ${t ? `<div class="verify-detail"><label>Last Update</label><span>${new Date(t.ts).toLocaleString()}</span></div>` : ''}
        <div class="verify-detail"><label>Violations</label><span>${data.recentEvents.length} event(s)</span></div>
        ${data.recentEvents.length > 0 ? data.recentEvents.slice(0,3).map(e =>
          `<div class="verify-detail"><label>${e.eventType.replace(/_/g,' ')}</label><span>${e.severity} | ${e.txHash ? 'On-chain' : 'Local'}</span></div>`
        ).join('') : ''}
        <div style="text-align:center;margin-top:12px">
          <a href="/track/${s.shipmentId}" style="font-size:14px">View Full Details</a>
        </div>
      </div>
    `;
  } catch (err) {
    resultEl.innerHTML = '<div class="verify-result-card unsafe"><div class="verdict-big unsafe">Error</div><p style="text-align:center;color:#64748b">Could not verify. Please try again.</p></div>';
  }
}

function focusChat() {
  setTimeout(() => {
    const input = document.getElementById('chat-input');
    if (input) input.focus();
  }, 300);
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const container = document.getElementById('chat-messages');
  container.innerHTML += `<div class="chat-bubble user"><p>${escapeHtml(msg)}</p></div>`;
  container.innerHTML += `<div class="chat-bubble typing" id="typing">Thinking...</div>`;
  container.scrollTop = container.scrollHeight;

  const userData = currentUser ? {
    aadhaarId: currentUser.aadhar_no,
    name: currentUser.username || currentUser.name,
    phone: '',
    aadhaarVerified: true
  } : null;

  try {
    const res = await fetch(`${BACKEND}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, language: currentLang, sessionId: 'customer-' + (currentUser?.aadhar_no || 'anon'), userData })
    });
    const data = await res.json();
    console.log('[CHAT] Backend response:', data);
    const typingEl = document.getElementById('typing');
    if (typingEl) typingEl.remove();
    container.innerHTML += `<div class="chat-bubble bot"><p>${escapeHtml(data.reply || data.response)}</p></div>`;

    if (data.booking) {
      localStorage.setItem('appointmentId', data.booking.appointmentId);
      console.log('[CHAT BOOKING] Appointment booked:', data.booking.appointmentId);
      container.innerHTML += `<div class="chat-bubble bot"><p style="color:#16a34a;font-weight:600">Appointment booked successfully! ID: ${escapeHtml(data.booking.appointmentId)}</p></div>`;
    } else if (data.intent === 'FIND_CENTERS') {
      container.innerHTML += `<div class="chat-bubble bot"><button onclick="showPage('book')" style="background:#6C63FF;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer">View Centers</button></div>`;
    } else if (data.intent === 'CHECK_APPOINTMENT') {
      container.innerHTML += `<div class="chat-bubble bot"><button onclick="showPage('home');loadHomeAppointments()" style="background:#6C63FF;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer">My Appointments</button></div>`;
    }
  } catch (err) {
    console.error('[CHAT] Error:', err);
    const typingEl = document.getElementById('typing');
    if (typingEl) typingEl.remove();
    container.innerHTML += `<div class="chat-bubble bot"><p>Sorry, I couldn't process your request. Please try again.</p></div>`;
  }
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadProfile() {
  document.getElementById('profile-name').textContent = currentUser.username || 'User';
  document.getElementById('profile-aadhaar').textContent = 'Aadhaar: XXXX-XXXX-' + (currentUser.aadhar_no || '').slice(-4);
  document.getElementById('profile-vaccinated').textContent = currentUser.vaccinated || 'NO';

  const container = document.getElementById('profile-appointments');
  try {
    const res = await fetch(`${BACKEND}/customer/appointments/` + currentUser.aadhar_no);
    const apts = await res.json();
    document.getElementById('profile-appointments-count').textContent = Array.isArray(apts) ? apts.length : 0;
    if (!Array.isArray(apts) || apts.length === 0) {
      container.innerHTML = '<div class="empty-state-sm">No appointments found</div>';
    } else {
      container.innerHTML = apts.map(a => renderAppointmentCard(a)).join('');
    }
  } catch (err) {
    container.innerHTML = '<div class="empty-state-sm">Could not load appointments</div>';
  }
}

function showLangPicker() { document.getElementById('lang-picker').style.display = 'flex'; }
function closeLangPicker() { document.getElementById('lang-picker').style.display = 'none'; }

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('vc_lang', lang);
  updateLangBadges();
  closeLangPicker();
}

function updateLangBadges() {
  const label = LANG_LABELS[currentLang] || 'EN';
  const badges = document.querySelectorAll('.lang-badge');
  badges.forEach(b => b.textContent = label);
}

async function checkLatestStatus() {
  const userPhone = currentUser?.phone || '';
  const id = localStorage.getItem('appointmentId');

  try {
    if (supabaseClient && userPhone) {
      const { data: rows, error } = await supabaseClient
        .from('appointments')
        .select('*')
        .eq('phone', userPhone)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && rows && rows.length > 0) {
        const status = rows[0].status || 'BOOKED';
        console.log('[SUPABASE REALTIME] Phone:', userPhone, 'Status:', status);
        updateStatusUI(status);
        return;
      }
    }

    if (id) {
      const response = await fetch(`${BACKEND}/api/appointments/${id}`);
      const data = await response.json();
      console.log('[STATUS CHECK] Appointment:', id, 'Status:', data.appointment?.status);
      if (data.appointment) {
        updateStatusUI(data.appointment.status);
      }
    }
  } catch (e) {
    console.error('[STATUS CHECK] Error:', e);
  }
}

function updateStatusUI(status) {
  const statusDisplay = document.getElementById('booking-status-display');
  if (statusDisplay) statusDisplay.textContent = status;

  const cards = document.querySelectorAll('.appointment-card');
  cards.forEach(card => {
    const statusEl = card.querySelector('.apt-status');
    if (statusEl) {
      statusEl.textContent = status;
      statusEl.className = 'apt-status ' + status.toLowerCase().replace(/_/g, '-');
    }
  });
}

if (supabaseClient) {
  supabaseClient
    .channel('appointments-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'appointments' },
      payload => {
        console.log('[SUPABASE] Realtime update received:', payload);
        checkLatestStatus();
      }
    )
    .subscribe();
}

setInterval(checkLatestStatus, 4000);

init();
