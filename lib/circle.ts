import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

function getCircleClient() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error('CIRCLE_API_KEY not configured');
  }
  return initiateUserControlledWalletsClient({ apiKey });
}

// Create a new user in Circle
export async function createUser(userId: string): Promise<void> {
  const client = getCircleClient();
  await client.createUser({ userId });
}

// Create a session token for a user
export async function createUserToken(userId: string): Promise<{
  userToken: string;
  encryptionKey: string;
}> {
  const client = getCircleClient();
  const response = await client.createUserToken({ userId });

  return {
    userToken: response.data?.userToken || '',
    encryptionKey: response.data?.encryptionKey || '',
  };
}

// Initialize a user (creates challenge for PIN setup + wallet creation)
export async function initializeUser(userToken: string): Promise<{
  challengeId: string;
}> {
  const client = getCircleClient();
  const response = await client.createUserPinWithWallets({
    userToken,
    blockchains: ['ARC-TESTNET' as any],
  });

  return {
    challengeId: response.data?.challengeId || '',
  };
}

// Get user's wallets
export async function getUserWallets(userToken: string): Promise<Array<{
  id: string;
  address: string;
  blockchain: string;
}>> {
  const client = getCircleClient();
  const response = await client.listWallets({ userToken });



  return (response.data?.wallets || []).map((w: any) => ({
    id: w.id,
    address: w.address,
    blockchain: w.blockchain,
  }));
}

// Get wallet balance
export async function getWalletBalance(
  userToken: string,
  walletId: string
): Promise<string> {
  const client = getCircleClient();

  try {
    
    const response = await (client as any).getWalletTokenBalance({
      userToken,
      walletId: walletId,
    });


    const tokenBalances = response.data?.tokenBalances || [];
    
    if (tokenBalances.length > 0) {
      return tokenBalances[0].amount || '0';
    }

    return '0';
  } catch (error: any) {
    console.error('Error fetching balance:', error.message || error);
    return '0';
  }
}

// Create transaction challenge (for USDC transfer)
export async function createTransferChallenge(
  userToken: string,
  walletId: string,
  destinationAddress: string,
  amount: string
): Promise<{ challengeId: string }> {
  const client = getCircleClient();

  // First, get the wallet's token balances to find the USDC token ID
  const balanceResponse = await (client as any).getWalletTokenBalance({
    userToken,
    walletId: walletId,
  });


  const tokenBalances = balanceResponse.data?.tokenBalances || [];
  const usdcBalance = tokenBalances.find((t: any) => 
    t.token?.symbol === 'USDC' || t.token?.name?.includes('USD')
  );

  if (!usdcBalance?.token?.id) {
    throw new Error('USDC token not found in wallet. Get testnet USDC from faucet first.');
  }

  const response = await client.createTransaction({
    userToken,
    walletId,
    tokenId: usdcBalance.token.id,
    destinationAddress,
    amounts: [amount],
    fee: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM',
      },
    },
  });

  return {
    challengeId: response.data?.challengeId || '',
  };
}