import hre from 'hardhat';
import { createPublicClient, createWalletClient, http } from 'viem';
import { celo } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const USD_M_CELO = '0x765DE816845861e75A25fCA122bb6898B8B1282a';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function main() {
  const rawPrivateKey = requireEnv('PRIVATE_KEY');
  const privateKey = rawPrivateKey.startsWith('0x') ? rawPrivateKey : `0x${rawPrivateKey}`;
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const rpcUrl = process.env.CELO_RPC_URL || 'https://forno.celo.org';

  const publicClient = createPublicClient({ chain: celo, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: celo, transport: http(rpcUrl) });
  const artifact = await hre.artifacts.readArtifact('ImpactJar');

  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode as `0x${string}`,
    args: [USD_M_CELO],
  });

  console.log(`Deployment tx: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`ImpactJar deployed at: ${receipt.contractAddress}`);
  console.log(`Verify command:`);
  console.log(`npx hardhat verify --network celo ${receipt.contractAddress} ${USD_M_CELO}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
