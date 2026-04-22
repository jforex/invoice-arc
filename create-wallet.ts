import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

async function createWallet() {
  console.log("🏦 Creating wallet on Arc Testnet...\n");

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
  });

  try {
    // Create wallet set
    console.log("📦 Creating wallet set...");
    const walletSetResponse = await client.createWalletSet({
      name: "Invoice Platform Wallets",
    });

    const walletSetId = walletSetResponse.data?.walletSet?.id;
    console.log("✅ Wallet set created:", walletSetId, "\n");

    // Create wallet on Arc Testnet
    console.log("💳 Creating wallet on Arc Testnet...");
    const walletsResponse = await client.createWallets({
      blockchains: ["ARC-TESTNET"],
      count: 1,
      walletSetId: walletSetId!,
      accountType: "SCA", // Smart Contract Account (gas sponsored!)
    });

    const wallet = walletsResponse.data?.wallets?.[0];
    
    console.log("\n🎉 Wallet created successfully!");
    console.log("\n📍 Wallet Details:");
    console.log("Address:", wallet?.address);
    console.log("ID:", wallet?.id);
    console.log("Blockchain:", wallet?.blockchain);
    console.log("\n💰 Get testnet USDC:");
    console.log("Visit: https://faucet.circle.com");
    console.log("Select: Arc Testnet");
    console.log("Paste your address:", wallet?.address);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createWallet();