/**
 * Blockchain: Hardhat/Ethereum VialLedger when configured; otherwise mock.
 * - Test: USE_MOCK_CHAIN not set or true (default mock). No gas, no real tx.
 * - Live: USE_MOCK_CHAIN=false + VIAL_LEDGER_ADDRESS + ETHEREUM_RPC_URL + WALLET_PRIVATE_KEY.
 *   Each anomaly triggers a real tx (gas paid); QR shows "Recorded on Ethereum: <txHash>".
 * See BLOCKCHAIN_HOOKS.md in project root.
 */
const VIAL_LEDGER_ADDRESS = process.env.VIAL_LEDGER_ADDRESS;
const RPC_URL = process.env.ETHEREUM_RPC_URL || process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

const VIAL_LEDGER_ABI = [
  'function recordEvent(string vialId, string eventType, string eventHash, uint256 timestamp)',
  'event VialEventRecorded(string indexed vialId, string eventType, string eventHash, uint256 timestamp, uint256 blockNumber)',
];

let ethers = null;
let contract = null;
let wallet = null;

/** Runtime override for demo toggle: null = use env USE_MOCK_CHAIN, true/false = force mock/real */
let useMockChainOverride = null;
function setUseMockChain(value) {
  useMockChainOverride = value === undefined ? null : !!value;
}
function getUseMockChain() {
  if (useMockChainOverride !== null) return useMockChainOverride;
  return process.env.USE_MOCK_CHAIN !== 'false';
}

function initEthers() {
  if (contract) return true;
  if (!VIAL_LEDGER_ADDRESS || !PRIVATE_KEY) return false;
  try {
    ethers = require('ethers');
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(VIAL_LEDGER_ADDRESS, VIAL_LEDGER_ABI, wallet);
    return true;
  } catch (e) {
    console.warn('[chain.service] Ethers init failed:', e.message);
    return false;
  }
}

function mockRecordEvent(shipmentId, eventHash, eventType, ts) {
  const txHash = '0x' + Buffer.from(String(eventHash).slice(0, 32)).toString('hex').padEnd(64, '0');
  return {
    txHash,
    network: 'mock',
    blockNumber: Math.floor(Date.now() / 1000),
    explorerUrl: null,
  };
}

async function recordEvent(shipmentId, eventHash, eventType, ts, meta = {}) {
  if (getUseMockChain()) {
    return mockRecordEvent(shipmentId, eventHash, eventType, ts);
  }
  const tsUnix = ts ? Math.floor(new Date(ts).getTime() / 1000) : Math.floor(Date.now() / 1000);
  if (!initEthers() || !contract) {
    if (!getUseMockChain()) console.warn('[chain.service] Real chain requested but not configured: set VIAL_LEDGER_ADDRESS, WALLET_PRIVATE_KEY, and ETHEREUM_RPC_URL (e.g. Sepolia) in Server .env. Using mock for this event.');
  }
  if (initEthers() && contract) {
    try {
      const tx = await contract.recordEvent(shipmentId, eventType, eventHash, tsUnix);
      const receipt = await tx.wait();
      const txHash = receipt.transactionHash;
      const blockNumber = receipt.blockNumber;
      const network = process.env.ETHEREUM_NETWORK || (RPC_URL.includes('sepolia') ? 'sepolia' : RPC_URL.includes('linea') ? 'linea' : 'localhost');
      const baseExplorer = process.env.ETHEREUM_EXPLORER_URL;
      const explorerUrl = baseExplorer ? (baseExplorer.replace(/\/$/, '') + '/tx/' + txHash) : (network === 'sepolia' ? `https://sepolia.etherscan.io/tx/${txHash}` : null);
      console.log('[BLOCKCHAIN] Event recorded on Ethereum:', { shipmentId, eventType, txHash, blockNumber, network });
      try {
        const logBuffer = require('./logBuffer');
        logBuffer.add('BLOCKCHAIN', `${shipmentId} ${eventType} recorded on Ethereum`, { shipmentId, eventType, txHash, blockNumber, network, explorerUrl, evidence: meta.evidence, timestampISO: meta.timestampISO || ts });
      } catch (e) {}
      return {
        txHash,
        network,
        blockNumber,
        explorerUrl,
      };
    } catch (err) {
      console.warn('[chain.service] Ethereum tx failed, using mock:', err.message);
      return mockRecordEvent(shipmentId, eventHash, eventType, ts);
    }
  }
  return mockRecordEvent(shipmentId, eventHash, eventType, ts);
}

module.exports = { recordEvent, setUseMockChain, getUseMockChain };
