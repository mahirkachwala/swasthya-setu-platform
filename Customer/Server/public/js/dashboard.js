const BACKEND = '';

let shipmentsData = [];

async function refreshShipments() {
  try {
    const res = await fetch(`${BACKEND}/iot/shipments`);
    if (!res.ok) throw new Error('Server returned ' + res.status);
    const data = await res.json();
    if (Array.isArray(data)) {
      shipmentsData = data;
      renderShipments(shipmentsData);
      document.getElementById('dbWarning').style.display = 'none';
    }
  } catch (err) {
    const warning = document.getElementById('dbWarning');
    if (warning) {
      warning.style.display = 'block';
      warning.textContent = 'Database not connected. Set MONGODB_URI in Secrets to enable full functionality.';
    }
  }

  try {
    const chainRes = await fetch(`${BACKEND}/chain/status`);
    const chainData = await chainRes.json();
    const el = document.getElementById('chainStatus');
    el.textContent = chainData.connected
      ? `Blockchain: Connected to ${chainData.network} | Contract: ${chainData.contractAddress}`
      : 'Blockchain: Mock mode (no Ethereum configured)';
    el.className = chainData.connected ? 'chain-status' : 'chain-status error';
  } catch (err) {}
}

function renderShipments(shipments) {
  const container = document.getElementById('shipmentsList');
  const empty = document.getElementById('emptyState');

  if (shipments.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  container.innerHTML = shipments.map(s => {
    const cardClass = s.verdict === 'UNSAFE' ? 'unsafe' : (s.status === 'IN_TRANSIT' ? 'in-transit' : '');
    const latest = s.latestTelemetry || {};
    return `
      <div class="shipment-card ${cardClass}" onclick="window.location='/track/${s.shipmentId}'">
        <div class="shipment-header">
          <span class="shipment-id">${s.shipmentId}</span>
          <span class="shipment-verdict ${s.verdict.toLowerCase()}">${s.verdict}</span>
        </div>
        <div class="shipment-details">
          <div><label>Route</label>${s.source} → ${s.destination}</div>
          <div><label>Temperature</label>${latest.tempC != null ? latest.tempC + '°C' : 'N/A'}</div>
          <div><label>Status</label>${s.status}</div>
          <div><label>Updated</label>${new Date(s.updatedAt).toLocaleTimeString()}</div>
        </div>
      </div>
    `;
  }).join('');
}

function showSimulator() {
  const panel = document.getElementById('simulatorPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function showCreateForm() {
  const panel = document.getElementById('createPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

async function runScenario(scenario) {
  const status = document.getElementById('simStatus');
  status.textContent = `Starting ${scenario} scenario...`;

  try {
    const res = await fetch(`${BACKEND}/simulator/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    const data = await res.json();
    if (data.started) {
      status.textContent = `Running "${data.scenarioName}" — ${data.totalPackets} packets over ${data.durationSec}s (${data.shipmentId})`;
      setTimeout(refreshShipments, 2000);
    } else {
      status.textContent = `Error: ${data.error}`;
    }
  } catch (err) {
    status.textContent = `Failed: ${err.message}`;
  }
}

async function createShipment(e) {
  e.preventDefault();
  try {
    const res = await fetch(`${BACKEND}/iot/shipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipmentId: document.getElementById('newShipmentId').value,
        source: document.getElementById('newSource').value,
        destination: document.getElementById('newDest').value,
        tempMin: parseFloat(document.getElementById('newTempMin').value),
        tempMax: parseFloat(document.getElementById('newTempMax').value)
      })
    });
    const data = await res.json();
    if (data.created) {
      document.getElementById('createPanel').style.display = 'none';
      refreshShipments();
    } else {
      alert(data.error || 'Failed to create shipment');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

refreshShipments();
setInterval(refreshShipments, 5000);
