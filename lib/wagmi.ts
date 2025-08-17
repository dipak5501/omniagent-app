import { createConfig, http } from 'wagmi';
import { localhost, mainnet } from 'wagmi/chains';

export const config = createConfig({
  // make sure to update the chains in the dashboard
  chains: [mainnet, localhost],
  multiInjectedProviderDiscovery: false,
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
