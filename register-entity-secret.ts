import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { randomBytes } from "crypto";
import { appendFileSync } from "fs";

async function registerEntitySecret() {
  console.log("🔐 Generating Entity Secret...\n");

  // Generate a random 32-byte entity secret
  const entitySecret = randomBytes(32).toString("hex");
  console.log("✅ Entity Secret generated!");
  console.log("⚠️  SAVE THIS: " + entitySecret + "\n");

  console.log("📝 Saving to .env file...\n");

  try {
    // Save to .env file
    appendFileSync(".env", `\nCIRCLE_ENTITY_SECRET=${entitySecret}\n`);
    
    console.log("✅ Entity Secret saved to .env file");
    console.log("\n🎉 Setup complete!");
    console.log("\nYour Entity Secret: " + entitySecret);
    console.log("\n⚠️  IMPORTANT: Keep this secret safe!");
    console.log("It has been saved to your .env file.");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

registerEntitySecret();