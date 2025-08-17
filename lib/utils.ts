import {
  Client,
  PrivateKey,
  TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to get a configured Hedera client
function getHederaClient() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const network = process.env.HEDERA_NETWORK || 'testnet';
  if (!accountId || !privateKey) throw new Error('Missing Hedera credentials');
  const client = Client.forName(network);
  client.setOperator(accountId, PrivateKey.fromString(privateKey));
  return client;
}

// Logs a message to a Hedera Consensus Service topic
export async function logToHedera(message: string, topicId: string) {
  const client = getHederaClient();
  const tx = new TopicMessageSubmitTransaction({ topicId, message });
  const submit = await tx.execute(client);
  const receipt = await submit.getReceipt(client);
  return receipt;
}
