// register-entity-secret.js
// Run this ONCE to register your entity secret with Circle

const { registerEntitySecretCiphertext } = require('@circle-fin/developer-controlled-wallets');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret) {
    console.error('❌ Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env.local');
    process.exit(1);
  }

  console.log('🔑 Registering entity secret with Circle...');
  console.log('   API Key prefix:', apiKey.substring(0, 25) + '...');
  console.log('   Entity Secret length:', entitySecret.length, 'characters');

  try {
    const response = await registerEntitySecretCiphertext({
      apiKey,
      entitySecret,
    });

    console.log('\n✅ SUCCESS! Entity secret registered with Circle.');
    console.log('\n📁 Recovery file has been downloaded to your project directory.');
    console.log('   File name: recovery_file_<timestamp>.dat');
    console.log('\n🔒 IMPORTANT: Move this file to a safe location!');
    console.log('   This is your only way to recover access if you lose your entity secret.');
    
    if (response.data?.recoveryFile) {
      console.log('\n📝 Recovery file content (also save this):');
      console.log(response.data.recoveryFile);
    }
  } catch (error) {
    console.error('\n❌ Registration failed:');
    console.error(error.message || error);
    
    if (error.message?.includes('already registered')) {
      console.log('\n💡 An entity secret is already registered.');
      console.log('   If you need to use a different one, you must reset via the Circle Console.');
    }
  }
}

main();
