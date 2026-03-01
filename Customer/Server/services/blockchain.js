const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const VIAL_LEDGER_ADDRESS = process.env.VIAL_LEDGER_ADDRESS;
const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK || 'local';

let ethers = null;
let contract = null;
let wallet = null;
let initialized = false;

const CONTRACT_ABI = [
  "function recordViolation(string shipmentId, bytes32 eventHash, string eventType, uint256 timestamp) external",
  "event ViolationRecorded(string indexed shipmentId, bytes32 eventHash, string eventType, uint256 timestamp)"
];

async function init() {
  if (initialized) return true;
  if (!ETHEREUM_RPC_URL || !WALLET_PRIVATE_KEY || !VIAL_LEDGER_ADDRESS) {
    console.log('[BLOCKCHAIN] Missing config — running in mock mode');
    return false;
  }

  try {
    ethers = require('ethers');
    const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);
    wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    contract = new ethers.Contract(VIAL_LEDGER_ADDRESS, CONTRACT_ABI, wallet);
    initialized = true;
    console.log(`[BLOCKCHAIN] Connected to ${ETHEREUM_NETWORK} — wallet: ${wallet.address}`);
    return true;
  } catch (err) {
    console.log(`[BLOCKCHAIN] Init failed: ${err.message} — running in mock mode`);
    return false;
  }
}

async function recordEvent(shipmentId, eventHash, eventType, timestamp) {
  const ready = await init();

  if (!ready) {
    const mockTxHash = '0x' + require('crypto').randomBytes(32).toString('hex');
    console.log(`[BLOCKCHAIN][MOCK] Recorded ${eventType} for ${shipmentId} — mockTx: ${mockTxHash.substring(0, 20)}...`);
    return {
      txHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000),
      network: 'mock',
      mock: true
    };
  }

  try {
    const ts = Math.floor(new Date(timestamp).getTime() / 1000);
    const hashBytes = '0x' + eventHash;
    const tx = await contract.recordViolation(shipmentId, hashBytes, eventType, ts);
    const receipt = await tx.wait();

    console.log(`[BLOCKCHAIN] Recorded ${eventType} for ${shipmentId} — tx: ${receipt.hash}`);
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      network: ETHEREUM_NETWORK,
      explorerUrl: ETHEREUM_NETWORK === 'sepolia'
        ? `https://sepolia.etherscan.io/tx/${receipt.hash}`
        : null
    };
  } catch (err) {
    console.error(`[BLOCKCHAIN] Write failed: ${err.message}`);
    throw err;
  }
}

async function getStatus() {
  const ready = await init();
  return {
    connected: ready,
    network: ready ? ETHEREUM_NETWORK : 'mock',
    contractAddress: VIAL_LEDGER_ADDRESS || null,
    walletAddress: wallet ? wallet.address : null
  };
}

module.exports = { recordEvent, getStatus, init };
