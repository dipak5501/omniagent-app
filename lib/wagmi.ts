import { createConfig, http } from 'wagmi';
import { localhost, mainnet } from 'wagmi/chains';

// Saga network configuration
const sagaChain = {
  id: '2749127454006000-btest',
  name: 'btest',
  network: 'btest',
  // nativeCurrency: {
  //   decimals: 18,
  //   name: 'Btest',
  //   symbol: 'btt',
  // },
  rpcUrls: {
    default: {
      http: ['https://btest-2749127454006000-1.jsonrpc.sagarpc.io'],
    },
    public: {
      http: ['https://btest-2749127454006000-1.jsonrpc.sagarpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Saga Explorer',
      url: 'https://btest-2749127454006000-1.sagaexplorer.io/',
    },
  },
} as const;

export const config = createConfig({
  // make sure to update the chains in the dashboard
  chains: [sagaChain, mainnet, localhost],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  transports: {
    [sagaChain.id]: http(),
    [mainnet.id]: http(),
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
