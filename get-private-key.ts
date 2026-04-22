import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

async function getPrivateKey() {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
  });

  console.log("⚠️  Circle Developer Wallets don't expose private keys.");
  console.log("We'll use a different approach for deployment.\n");
  console.log("Your wallet address:", "0x215cd078e21aab65821e743190c9aa4afbeca6be");
  console.log("\n💡 Let's use MetaMask instead for deployment.");
  console.log("\nSteps:");
  console.log("1. Install MetaMask");
  console.log("2. Import with a new private key");
  console.log("3. Send USDC from your Circle wallet to MetaMask");
  console.log("4. Deploy with MetaMask");
}

getPrivateKey();