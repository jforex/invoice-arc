import https from 'https';
import crypto from 'crypto';
import { appendFileSync } from 'fs';

async function getPublicKey(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get('https://api.circle.com/v1/w3s/config/entity/publicKey', {
      headers: {
        'Authorization': `Bearer ${process.env.CIRCLE_API_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        resolve(parsed.data.publicKey);
      });
    }).on('error', reject);
  });
}

function encryptEntitySecret(entitySecret: string, publicKeyPem: string): string {
  const publicKey = crypto.createPublicKey(publicKeyPem);
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(entitySecret, 'hex')
  );
  return encrypted.toString('base64');
}

async function register() {
  console.log("🔐 Step 1: Getting Circle's public key...\n");
  
  try {
    const publicKey = await getPublicKey();
    console.log("✅ Got public key!\n");

    console.log("🔒 Step 2: Encrypting your entity secret...\n");
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET!;
    const ciphertext = encryptEntitySecret(entitySecret, publicKey);
    
    console.log("✅ Entity secret encrypted!\n");
    console.log("📋 Your Entity Secret Ciphertext:");
    console.log(ciphertext);
    console.log("\n" + "=".repeat(80));
    console.log("\n🎯 NEXT STEPS:");
    console.log("\n1. Copy the ciphertext above");
    console.log("2. Go to: https://console.circle.com/wallets/dev/configurator/entity-secret");
    console.log("3. Paste it in the 'Entity Secret Ciphertext' box");
    console.log("4. Click 'Register'\n");
    
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

register();