const { generateEntitySecretCiphertext } = require('@circle-fin/developer-controlled-wallets');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!apiKey) {
    console.error('Missing CIRCLE_API_KEY in .env.local');
    process.exit(1);
  }

  const newEntitySecret = crypto.randomBytes(32).toString('hex');

  console.log('\n=== NEW ENTITY SECRET (save this for .env.local) ===');
  console.log(newEntitySecret);
  console.log('Length:', newEntitySecret.length, 'characters');

  console.log('\nGenerating ciphertext...');

  try {
    const ciphertext = await generateEntitySecretCiphertext({
      apiKey,
      entitySecret: newEntitySecret,
    });

    console.log('\n=== NEW CIPHERTEXT (paste this into Circle Console) ===');
    console.log(ciphertext);
    console.log('Length:', String(ciphertext).length, 'characters');
  } catch (error) {
    console.error('Failed:', error.message || error);
  }
}

main();
