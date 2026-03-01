/**
 * Run this to see why MongoDB isn't working on your laptop:
 *   cd Server && node scripts/check-mongo.js
 *
 * It tries: 1) MONGO_URI from .env  2) Local (127.0.0.1:27017)  3) In-memory
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const localUri = 'mongodb://127.0.0.1:27017/immunochain';
const uri = process.env.MONGO_URI || '';

async function tryConnect(name, connectionUri) {
  try {
    await mongoose.connect(connectionUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('OK: ' + name);
    await mongoose.disconnect();
    return true;
  } catch (e) {
    console.log('FAIL: ' + name + ' – ' + e.message);
    return false;
  }
}

async function main() {
  console.log('MongoDB connection check (Windows)\n');
  console.log('MONGO_URI in .env: ' + (uri ? uri.replace(/:[^:@]+@/, ':****@') : '(not set)'));

  if (uri && uri.trim() && (await tryConnect('MONGO_URI from .env', uri))) return;
  if (await tryConnect('Local MongoDB (127.0.0.1:27017)', localUri)) return;

  console.log('\nTrying in-memory MongoDB (no install needed)...');
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({ instance: { dbName: 'immunochain' } });
    await tryConnect('In-memory', mongod.getUri());
    await mongod.stop();
  } catch (e) {
    console.log('FAIL: In-memory – ' + e.message);
  }

  console.log('\n--- What to do ---');
  console.log('1) Use local MongoDB: install it, start the service, then set in Server/.env:');
  console.log('   MONGO_URI=mongodb://127.0.0.1:27017/immunochain');
  console.log('2) Use MongoDB Atlas: set MONGO_URI=mongodb+srv://user:pass@cluster... in Server/.env');
  console.log('3) See MONGO_SETUP.md in the Server folder for step-by-step Windows setup.');
}

main().catch((e) => console.error(e));
