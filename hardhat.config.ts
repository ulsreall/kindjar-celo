import 'dotenv/config';
import hardhatVerify from '@nomicfoundation/hardhat-verify';

const CELO_RPC_URL = process.env.CELO_RPC_URL || 'https://forno.celo.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
const CELOSCAN_API_KEY = process.env.CELOSCAN_API_KEY || '';

export default {
  plugins: [hardhatVerify],
  solidity: {
    profiles: {
      default: {
        version: '0.8.24',
      },
      production: {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    celo: {
      type: 'http',
      chainType: 'l1',
      url: CELO_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 42220,
    },
  },
  verify: {
    etherscan: {
      apiKey: CELOSCAN_API_KEY,
    },
  },
};
