const BACKEND = '';

const shipmentId = window.location.pathname.split('/').pop();
let tempChart = null;
let refreshInterval = null;

async function loadData() {
  try {
    const res = await fetch(`${BACKEND}/track/${shipmentId}/data`);
    if (!res.ok) throw new Error('Shipment not found');
    const data = await res.json();
    render(data);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error').textContent = err.message;
  }
}

function render(data) {
  const s = data.shipment;
  const banner = document.getElementById('verdictBanner');
  const icon = document.getElementById('verdictIcon');
  const text = document.getElementById('verdictText');

  if (s.verdict === 'SAFE') {
    banner.className = 'verdict-banner safe';
    icon.textContent = '\u2705';
    text.textContent = 'SAFE — Vaccine Integrity Verified';
  } else {
    banner.className = 'verdict-banner unsafe';
    icon.textContent = '\u274C';
    text.textContent = 'UNSAFE — Integrity Compromised';
  }

  document.getElementById('shipmentId').textContent = s.shipmentId;
  document.getElementById('source').textContent = s.source;
  document.getElementById('destination').textContent = s.destination;
  document.getElementById('tempRange').textContent = `${s.tempRange.min}\u00B0C \u2013 ${s.tempRange.max}\u00B0C`;
  document.getElementById('status').textContent = s.status;
  document.getElementById('updatedAt').textContent = new Date(s.updatedAt).toLocaleString();

  if (data.latestTelemetry) {
    document.getElementById('noTelemetry').style.display = 'none';
    document.getElementById('telemetryData').style.display = 'grid';
    const tc = data.latestTelemetry.tempC;
    const tempEl = document.getElementById('tempC');
    tempEl.textContent = `${tc}\u00B0C`;
    tempEl.className = 'temp-value ' + (tc > s.tempRange.max ? 'hot' : tc < s.tempRange.min ? 'cold' : 'ok');
    document.getElementById('humidity').textContent = data.latestTelemetry.humidity ? `${data.latestTelemetry.humidity}%` : 'N/A';
    document.getElementById('location').textContent = data.latestTelemetry.lat ? `${data.latestTelemetry.lat}, ${data.latestTelemetry.lng}` : 'N/A';
    document.getElementById('lidOpen').textContent = data.latestTelemetry.lidOpen ? 'OPEN' : 'Sealed';
    document.getElementById('telemetryTs').textContent = new Date(data.latestTelemetry.ts).toLocaleString();
  } else {
    document.getElementById('noTelemetry').style.display = 'block';
    document.getElementById('telemetryData').style.display = 'none';
  }

  renderChart(data.telemetryHistory, s.tempRange);
  renderEvents(data.violations);
  renderBlockchain(data.chainVerification, data.violations);
}

function renderChart(history, tempRange) {
  const ctx = document.getElementById('tempChart').getContext('2d');
  if (tempChart) tempChart.destroy();

  const labels = history.map(t => new Date(t.ts).toLocaleTimeString());
  const temps = history.map(t => t.tempC);

  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (\u00B0C)',
        data: temps,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        annotation: {}
      },
      scales: {
        y: {
          title: { display: true, text: '\u00B0C' },
          suggestedMin: 0,
          suggestedMax: 15
        }
      }
    }
  });
}

function renderEvents(violations) {
  const container = document.getElementById('eventsList');
  const noEvents = document.getElementById('noEvents');

  if (violations.length === 0) {
    noEvents.style.display = 'block';
    container.innerHTML = '';
    return;
  }
  noEvents.style.display = 'none';

  container.innerHTML = violations.map(v => {
    let txHtml = '';
    if (v.txHash) {
      const link = v.network === 'sepolia'
        ? `<a href="https://sepolia.etherscan.io/tx/${v.txHash}" target="_blank">View on Etherscan</a>`
        : `<span class="badge valid">Recorded (${v.network})</span>`;
      txHtml = `<div class="event-tx">${link} | Block: ${v.blockNumber || 'pending'}</div>`;
    }
    return `
      <div class="event-item">
        <div class="event-type">${formatEventType(v.eventType)} <span class="badge ${v.severity === 'CRITICAL' ? 'invalid' : ''}">${v.severity}</span></div>
        <div class="event-time">${new Date(v.tsStart).toLocaleString()}</div>
        ${v.evidence ? `<div class="event-hash">Evidence: ${JSON.stringify(v.evidence)}</div>` : ''}
        <div class="event-hash">Hash: ${v.eventHash || 'N/A'}</div>
        ${txHtml}
      </div>
    `;
  }).join('');
}

function renderBlockchain(verification, violations) {
  const chainStatus = document.getElementById('chainStatus');
  const chainLength = document.getElementById('chainLength');
  const proofs = document.getElementById('blockchainProofs');

  if (verification.valid) {
    chainStatus.innerHTML = '<span class="badge valid">VALID</span>';
  } else {
    chainStatus.innerHTML = '<span class="badge invalid">BROKEN</span>';
  }
  chainLength.textContent = verification.length || 0;

  const onChain = violations.filter(v => v.txHash);
  if (onChain.length > 0) {
    proofs.innerHTML = '<h3 style="margin:12px 0 8px;font-size:14px;">On-Chain Records</h3>' +
      onChain.map(v => `
        <div class="proof-item">
          <strong>${formatEventType(v.eventType)}</strong><br>
          <span style="font-family:monospace;font-size:11px;">TX: ${v.txHash.substring(0, 20)}...</span>
          ${v.network === 'sepolia' ? `<br><a href="https://sepolia.etherscan.io/tx/${v.txHash}" target="_blank" style="font-size:12px;">Verify on Etherscan</a>` : ''}
        </div>
      `).join('');
  }
}

function formatEventType(type) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

loadData();
refreshInterval = setInterval(loadData, 3000);
