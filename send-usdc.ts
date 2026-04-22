import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

async function sendUSDC() {
  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
  });

  const recipientAddress = "0x8b4a0A1d9442427dc8fA0Eb0F2AEABb85437169"; // Replace with your new address
  const amount = "5"; // 5 USDC for gas + deployment

  console.log("💸 Sending 5 USDC to deployment wallet...\n");
  console.log("From:", "0x215cd078e21aab65821e743190c9aa4afbeca6be");
  console.log("To:", recipientAddress);

  try {
    const transfer = await client.createTransaction({
      walletId: process.env.WALLET_ID!,
      blockchain: "ARC-TESTNET",
      tokenAddress: "0x3600000000000000000000000000000000000000", // USDC on Arc
      destinationAddress: recipientAddress,
      amounts: [amount],
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM",
        },
      },
    });

    const txId = transfer.data?.id;
    console.log("✅ Transfer initiated!");
    console.log("Transaction ID:", txId);
    console.log("\n⏳ Waiting for confirmation...\n");

    // Wait for completion
    let attempts = 0;
    while (attempts < 20) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const txStatus = await client.getTransaction({ id: txId! });
      const state = txStatus.data?.transaction?.state;

      process.stdout.write(".");

      if (state === "COMPLETE") {
        const txHash = txStatus.data?.transaction?.txHash;
        console.log("\n\n🎉 Transfer complete!");
        console.log("Transaction Hash:", txHash);
        console.log("\n🔍 View on Explorer:");
        console.log("https://testnet.arcscan.app/tx/" + txHash);
        console.log("\n✅ Ready to deploy contract!");
        break;
      } else if (state === "FAILED") {
        console.error("\n❌ Transfer failed");
        break;
      }

      attempts++;
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

sendUSDC();