const BACKEND = '';

let currentCenter = 'CEN-001';
let selectedShipment = null;
let pollTimer = null;

function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const map = { dashboard: 0, appointments: 1, inventory: 2, shipments: 3, qr: 4 };
  document.querySelectorAll('.nav-link')[map[name]]?.classList.add('active');
  const titles = { dashboard: 'Dashboard', appointments: 'Appointments', inventory: 'Inventory', shipments: 'Shipment Tracking', qr: 'QR Scan' };
  document.getElementById('section-title').textContent = titles[name] || name;

  if (name === 'dashboard') loadDashboard();
  if (name === 'appointments') loadAppointments();
  if (name === 'inventory') loadInventory();
  if (name === 'shipments') loadShipments();

  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  if (name === 'shipments') pollTimer = setInterval(() => { if (selectedShipment) loadShipmentDetail(selectedShipment); }, 2000);

  const sb = document.getElementById('sidebar');
  if (sb.classList.contains('open')) sb.classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function changeCenter() {
  currentCenter = document.getElementById('center-select').value;
  const opt = document.getElementById('center-select').selectedOptions[0];
  document.getElementById('center-label').textContent = opt.textContent;
  const active = document.querySelector('.section.active');
  if (active) showSection(active.id.replace('sec-', ''));
}

async function loadDashboard() {
  try {
    const [aptsRes, invRes, shipRes] = await Promise.all([
      fetch(`${BACKEND}/api/appointments?centerId=${currentCenter}`),
      fetch(`${BACKEND}/api/inventory?centerId=${currentCenter}`),
      fetch(`${BACKEND}/api/shipments?centerId=${currentCenter}`)
    ]);
    const allApts = (await aptsRes.json()).appointments || [];
    const inv = (await invRes.json()).inventory || [];
    const ships = (await shipRes.json()).shipments || [];

    const today = new Date().toISOString().split('T')[0];
    const upcoming = allApts.filter(a => a.slotTime && a.slotTime.substring(0, 10) >= today && a.status !== 'CANCELLED');

    document.getElementById('stat-today').textContent = upcoming.length;
    document.getElementById('stat-vaccinated').textContent = allApts.filter(a => a.status === 'VACCINATED').length;
    document.getElementById('stat-stock').textContent = inv.reduce((s, i) => s + i.quantity, 0);
    document.getElementById('stat-shipments').textContent = ships.filter(s => s.status === 'IN_TRANSIT').length;

    const alerts = [];
    inv.forEach(i => { if (i.quantity < 50) alerts.push({ type: 'warn', text: `Low stock: ${i.vaccineType} — only ${i.quantity} doses remaining` }); });
    ships.filter(s => s.status === 'IN_TRANSIT').forEach(s => alerts.push({ type: 'info', text: `Shipment ${s.shipmentId} in transit — at ${s.currentCheckpoint}` }));
    ships.filter(s => s.status === 'ARRIVED').forEach(s => alerts.push({ type: 'ok', text: `Shipment ${s.shipmentId} has arrived — ${s.quantity} ${s.vaccineType} doses` }));
    if (alerts.length === 0) alerts.push({ type: 'ok', text: 'All systems operational. No alerts.' });

    document.getElementById('alerts-list').innerHTML = alerts.map(a => `<div class="alert-item ${a.type}">${a.text}</div>`).join('');

    document.getElementById('dashboard-apts').innerHTML = upcoming.length === 0
      ? '<p style="color:#94a3b8;font-size:14px">No upcoming appointments</p>'
      : upcoming.slice(0, 5).map(a => {
          const d = new Date(a.slotTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
          const t = new Date(a.slotTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          return `<div class="alert-item info"><strong>${d} ${t}</strong> — ${a.patientName} (${a.vaccineType}) <span class="badge ${a.status.toLowerCase()}">${a.status}</span></div>`;
        }).join('');
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

async function loadAppointments() {
  const dateFilter = document.getElementById('apt-date-filter').value;
  let url = `${BACKEND}/api/appointments?centerId=${currentCenter}`;
  if (dateFilter) url += `&date=${dateFilter}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const apts = data.appointments || [];
    const tbody = document.getElementById('apt-tbody');

    if (apts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:24px">No appointments found</td></tr>';
      return;
    }

    tbody.innerHTML = apts.map(a => {
      const t = new Date(a.slotTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const d = new Date(a.slotTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const aadhaarBadge = a.aadhaarVerified
        ? '<span class="badge verified">Verified</span>'
        : '<span class="badge pending">Pending</span>';
      const statusBadge = `<span class="badge ${a.status.toLowerCase()}">${a.status}</span>`;

      let actions = '';
      if (a.status === 'BOOKED') {
        actions = `<button class="btn-sm green" onclick="updateAptStatus('${a.appointmentId}','CHECKED_IN')">Check In</button> <button class="btn-sm red" onclick="updateAptStatus('${a.appointmentId}','CANCELLED')">Cancel</button>`;
      } else if (a.status === 'CHECKED_IN') {
        actions = `<button class="btn-sm blue" onclick="updateAptStatus('${a.appointmentId}','VACCINATED')">Vaccinated</button>`;
      } else {
        actions = '<span style="color:#94a3b8;font-size:12px">—</span>';
      }

      return `<tr>
        <td><strong>${a.appointmentId}</strong></td>
        <td>${a.patientName}</td>
        <td>${d} ${t}</td>
        <td>${a.vaccineType}</td>
        <td>${aadhaarBadge}</td>
        <td>${statusBadge}</td>
        <td>${actions}</td>
      </tr>`;
    }).join('');
  } catch (err) {
    console.error('Failed to load appointments:', err);
  }
}

async function updateAptStatus(appointmentId, status) {
  try {
    await fetch(`${BACKEND}/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadAppointments();
    if (document.getElementById('sec-dashboard').classList.contains('active')) loadDashboard();
  } catch (err) {
    alert('Failed to update appointment');
  }
}

async function loadInventory() {
  try {
    const res = await fetch(`${BACKEND}/api/inventory?centerId=${currentCenter}`);
    const data = await res.json();
    const inv = data.inventory || [];

    document.getElementById('inv-cards').innerHTML = inv.length === 0
      ? '<p style="color:#94a3b8;font-size:14px">No inventory data</p>'
      : inv.map(i => `
        <div class="inv-card ${i.quantity < 50 ? 'low' : ''}">
          <div class="inv-type">${i.vaccineType}</div>
          <div class="inv-qty">${i.quantity}</div>
          <div class="inv-label">doses available</div>
        </div>
      `).join('');
  } catch (err) {
    console.error('Failed to load inventory:', err);
  }
}

async function reorderVaccines() {
  const manufacturer = document.getElementById('ro-mfr').value;
  const vaccineType = document.getElementById('ro-type').value;
  const quantity = parseInt(document.getElementById('ro-qty').value);
  const resultEl = document.getElementById('ro-result');

  if (!quantity || quantity < 1) { resultEl.className = 'result-msg error'; resultEl.textContent = 'Enter a valid quantity'; return; }

  try {
    const res = await fetch(`${BACKEND}/api/inventory/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ centerId: currentCenter, manufacturer, vaccineType, quantity })
    });
    const data = await res.json();
    resultEl.className = 'result-msg success';
    resultEl.textContent = `Order placed! Shipment ${data.shipmentId} created. Go to Shipments to track it.`;
    loadShipments();
  } catch (err) {
    resultEl.className = 'result-msg error';
    resultEl.textContent = 'Failed to place order';
  }
}

async function loadShipments() {
  try {
    const res = await fetch(`${BACKEND}/api/shipments?centerId=${currentCenter}`);
    const data = await res.json();
    const ships = data.shipments || [];
    const list = document.getElementById('shipments-list');

    if (ships.length === 0) {
      list.innerHTML = '<p style="color:#94a3b8;font-size:14px">No shipments found. Place a reorder from Inventory.</p>';
      return;
    }

    list.innerHTML = ships.map(s => `
      <div class="ship-card ${selectedShipment === s.shipmentId ? 'selected' : ''}" onclick="selectShipment('${s.shipmentId}')">
        <h4>${s.shipmentId} — ${s.vaccineType}</h4>
        <p>${s.manufacturer} | Batch: ${s.batchNo} | Qty: ${s.quantity}</p>
        <div class="ship-meta">
          <span class="badge ${s.status.toLowerCase().replace(' ', '_')}">${s.status}</span>
          <span style="font-size:12px;color:#64748b">Current: ${s.currentCheckpoint}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load shipments:', err);
  }
}

function selectShipment(shipmentId) {
  selectedShipment = shipmentId;
  loadShipmentDetail(shipmentId);
  loadShipments();
}

async function loadShipmentDetail(shipmentId) {
  const panel = document.getElementById('shipment-detail');
  panel.style.display = 'block';

  try {
    const res = await fetch(`${BACKEND}/api/shipments/${shipmentId}`);
    const data = await res.json();
    const ship = data.shipment;
    const cps = data.checkpoints || [];

    document.getElementById('ship-detail-title').textContent = `${shipmentId} — ${ship.vaccineType}`;

    const simBtn = document.getElementById('sim-btn');
    if (ship.status === 'ARRIVED') {
      simBtn.style.display = 'none';
    } else if (ship.status === 'IN_TRANSIT') {
      simBtn.textContent = 'In Progress...';
      simBtn.disabled = true;
      simBtn.style.display = '';
    } else {
      simBtn.textContent = 'Start Simulation';
      simBtn.disabled = false;
      simBtn.style.display = '';
    }

    let currentIdx = -1;
    cps.forEach((cp, i) => { if (cp.name === ship.currentCheckpoint) currentIdx = i; });

    const mapEl = document.getElementById('ship-map');
    if (window.L && cps.length > 0) {
      mapEl.innerHTML = '';
      mapEl.style.height = '250px';
      if (window._shipMap) { window._shipMap.remove(); window._shipMap = null; }
      const map = L.map(mapEl).fitBounds(cps.map(cp => [cp.lat, cp.lng]), { padding: [30, 30] });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);
      window._shipMap = map;

      const routeCoords = cps.map(cp => [cp.lat, cp.lng]);
      L.polyline(routeCoords, { color: '#94a3b8', weight: 3, dashArray: '8,6' }).addTo(map);

      if (currentIdx > 0) {
        L.polyline(routeCoords.slice(0, currentIdx + 1), { color: '#16a34a', weight: 4 }).addTo(map);
      }

      cps.forEach((cp, i) => {
        const passed = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const color = isCurrent ? '#2563eb' : passed ? '#16a34a' : '#94a3b8';
        L.circleMarker([cp.lat, cp.lng], { radius: isCurrent ? 10 : 7, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 })
          .addTo(map).bindPopup(`<b>${cp.name}</b><br>${isCurrent ? 'Current Location' : passed ? 'Passed' : 'Upcoming'}`);
      });

      setTimeout(() => map.invalidateSize(), 200);
    }

    document.getElementById('ship-checkpoints').innerHTML = cps.map((cp, i) => {
      const passed = i <= currentIdx;
      const isCurrent = i === currentIdx;
      const dotClass = isCurrent ? 'current' : passed ? 'passed' : '';
      const statusText = isCurrent ? 'Current Location' : passed ? 'Passed' : 'Upcoming';
      return `<div class="checkpoint"><div class="cp-dot ${dotClass}"></div><span class="cp-name">${cp.name}</span><span class="cp-status">${statusText}</span></div>`;
    }).join('');
  } catch (err) {
    console.error('Failed to load shipment detail:', err);
  }
}

async function startSimulation() {
  if (!selectedShipment) return;
  try {
    await fetch(`${BACKEND}/api/sim/start?shipmentId=${selectedShipment}`, { method: 'POST' });
    loadShipmentDetail(selectedShipment);
    loadShipments();
  } catch (err) {
    alert('Failed to start simulation');
  }
}

async function scanQR() {
  const payload = document.getElementById('qr-input').value.trim();
  if (!payload) return;
  const resultEl = document.getElementById('qr-result');
  resultEl.style.display = 'block';

  try {
    const res = await fetch(`${BACKEND}/api/qr/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrPayload: payload })
    });
    const data = await res.json();
    const isOk = data.ok && data.status !== 'NOT_FOUND';
    resultEl.innerHTML = `
      <div class="qr-result-card ${isOk ? 'ok' : 'fail'}">
        <h4>${isOk ? 'QR Verified' : 'Verification Failed'}</h4>
        <div class="qr-row"><label>Shipment ID</label><span>${data.shipmentId}</span></div>
        ${data.batchNo ? `<div class="qr-row"><label>Batch</label><span>${data.batchNo}</span></div>` : ''}
        <div class="qr-row"><label>Status</label><span>${data.status}</span></div>
        <div class="qr-row"><label>Message</label><span>${data.message}</span></div>
      </div>`;
  } catch (err) {
    resultEl.innerHTML = '<div class="qr-result-card fail"><h4>Error</h4><p>Failed to verify QR code</p></div>';
  }
}

loadDashboard();
