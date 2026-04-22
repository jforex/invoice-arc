import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { readFileSync } from "fs";
import solc from "solc";

async function deployContract() {
  console.log("📜 Compiling InvoicePayment contract...\n");

  // Read the contract
  const source = readFileSync("./contracts/InvoicePayment.sol", "utf8");

  // Compile
  const input = {
    language: "Solidity",
    sources: {
      "InvoicePayment.sol": { content: source },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    output.errors.forEach((err: any) => {
      console.log(err.formattedMessage);
    });
    if (output.errors.some((e: any) => e.severity === "error")) {
      console.error("❌ Compilation failed");
      return;
    }
  }

  const contract = output.contracts["InvoicePayment.sol"]["InvoicePayment"];
  const bytecode = "0x" + contract.evm.bytecode.object;

  console.log("✅ Contract compiled successfully!\n");
  console.log("📦 Bytecode length:", bytecode.length, "characters\n");

  // Deploy via Circle
  console.log("🚀 Deploying to Arc Testnet...\n");

  const client = initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
  });

  try {
    // Use createContractExecutionTransaction for deployment
    const deployTx = await client.createContractExecutionTransaction({
      walletId: process.env.WALLET_ID!,
      blockchain: "ARC-TESTNET",
      abiFunctionSignature: "constructor()",
      abiParameters: [],
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM",
        },
      },
    });

    const txId = deployTx.data?.id;
    console.log("📋 Transaction ID:", txId);
    console.log("\n⏳ Waiting for deployment (this may take 10-30 seconds)...\n");

    // Wait for completion
    let attempts = 0;
    while (attempts < 40) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const txStatus = await client.getTransaction({ id: txId! });
      const state = txStatus.data?.transaction?.state;

      process.stdout.write(".");

      if (state === "COMPLETE") {
        const contractAddress = txStatus.data?.transaction?.contractAddress;
        const txHash = txStatus.data?.transaction?.txHash;

        console.log("\n\n🎉 Contract deployed successfully!\n");
        console.log("📍 Contract Address:", contractAddress);
        console.log("🔗 Transaction Hash:", txHash);
        console.log("\n🔍 View on Explorer:");
        console.log("https://testnet.arcscan.app/address/" + contractAddress);
        console.log("\n✅ Add this to your .env file:");
        console.log("CONTRACT_ADDRESS=" + contractAddress);
        break;
      } else if (state === "FAILED") {
        console.error("\n\n❌ Deployment failed");
        console.log("Transaction:", txStatus.data?.transaction);
        break;
      }

      attempts++;
      
      if (attempts >= 40) {
        console.log("\n\n⏰ Taking longer than expected...");
        console.log("Check status at: https://console.circle.com");
      }
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.log("\nTrying alternative deployment method...\n");
    
    // Alternative: Try with minimal parameters
    try {
      const deployTx = await client.createContractExecutionTransaction({
        walletId: process.env.WALLET_ID!,
        blockchain: "ARC-TESTNET",
        abiFunctionSignature: "",
        abiParameters: [],
        fee: {
          type: "level",
          config: {
            feeLevel: "MEDIUM",
          },
        },
      });
      
      console.log("✅ Transaction submitted:", deployTx.data?.id);
    } catch (err: any) {
      console.error("Still failed:", err.message);
      console.log("\n💡 Let's try using Foundry instead for deployment.");
    }
  }
}

deployContract();