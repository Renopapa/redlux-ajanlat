// MongoDB kapcsolat ellenőrző script
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://redluxCRM:redlux123@redluxcrm.evoxfzk.mongodb.net/redluxDB?retryWrites=true&w=majority&appName=RedLuxCRM';

console.log('MongoDB kapcsolat ellenőrzése...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Jelszó elrejtése

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Sikeresen csatlakozva a MongoDB-hez!');
    
    // Adatbázis információk
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`\n📊 Adatbázis neve: ${dbName}`);
    
    // Kollekciók listázása
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Kollekciók (${collections.length} db):`);
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });
    
    // Dokumentumok száma kollekciónként
    console.log('\n📈 Dokumentumok száma kollekciónként:');
    for (const col of collections) {
      try {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   ${col.name}: ${count} dokumentum`);
      } catch (err) {
        console.log(`   ${col.name}: hiba a számolásnál`);
      }
    }
    
    // Példa adatok lekérése (ha vannak)
    if (collections.length > 0) {
      const firstCollection = collections[0].name;
      const sampleDocs = await db.collection(firstCollection).find({}).limit(3).toArray();
      if (sampleDocs.length > 0) {
        console.log(`\n🔍 Példa dokumentumok a "${firstCollection}" kollekcióból (max 3):`);
        sampleDocs.forEach((doc, index) => {
          console.log(`\n   Dokumentum ${index + 1}:`);
          console.log(JSON.stringify(doc, null, 2));
        });
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Kapcsolat bezárva.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Hiba a MongoDB kapcsolat során:');
    console.error(error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Lehet, hogy a felhasználónév vagy jelszó nem megfelelő.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 Lehet, hogy a MongoDB cluster nem elérhető vagy törölve lett.');
    } else if (error.message.includes('IP')) {
      console.error('\n💡 Lehet, hogy az IP címed nincs engedélyezve a MongoDB Atlas-ban.');
    }
    
    process.exit(1);
  });

