// MongoDB Connection Test Script
const mongoose = require('mongoose');

// Próbáld ki mindkét connection string-et
const connectionStrings = [
  // Új cluster (ahol az adatok vannak)
  'mongodb+srv://redlux-crm:redlux123@redlux-crm.korvagh.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=redluxcrm',
  
  // Eredeti cluster
  'mongodb+srv://redluxCRM:redlux123@redluxcrm.evoxfzk.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=RedLuxCRM'
];

async function testConnection(uri, name) {
  console.log(`\n🔍 Testing: ${name}`);
  console.log(`URI: ${uri.replace(/:[^:@]+@/, ':****@')}`); // Jelszó elrejtése
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 másodperc timeout
    });
    
    console.log('✅ Connected successfully!');
    
    // Próbáld meg lekérni a termékeket
    const db = conn.connection.db;
    const products = await db.collection('products').countDocuments();
    console.log(`📦 Products found: ${products}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('ENOTFOUND')) {
      console.error('   → DNS resolution failed - hostname is wrong!');
    } else if (error.message.includes('authentication failed')) {
      console.error('   → Authentication failed - wrong username/password!');
    } else if (error.message.includes('network')) {
      console.error('   → Network error - check IP whitelist in MongoDB Atlas!');
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 MongoDB Connection Test\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const result = await testConnection(connectionStrings[i], `Connection ${i + 1}`);
    results.push(result);
    
    // Várj egy kicsit a következő teszt előtt
    if (i < connectionStrings.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Results:');
  results.forEach((result, i) => {
    console.log(`  Connection ${i + 1}: ${result ? '✅ OK' : '❌ FAILED'}`);
  });
  
  const working = results.findIndex(r => r === true);
  if (working !== -1) {
    console.log(`\n✅ Working connection: Connection ${working + 1}`);
    console.log(`\nUse this in Render.com:`);
    console.log(connectionStrings[working]);
  } else {
    console.log('\n❌ No working connection found!');
    console.log('Check:');
    console.log('  1. Network Access in MongoDB Atlas (0.0.0.0/0)');
    console.log('  2. Database User exists');
    console.log('  3. Correct hostname');
  }
}

runTests().catch(console.error);

