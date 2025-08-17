import { network } from "hardhat";
import { logToHedera } from '../../lib/utils.js';

const { viem } = await network.connect({
  network: "hardhatOp",
  chainType: "optimism",
});

console.log("Sending transaction using the OP chain type");

const publicClient = await viem.getPublicClient();
const [senderClient] = await viem.getWalletClients();

console.log("Sending 1 wei from", senderClient.account.address, "to itself");

const l1Gas = await publicClient.estimateL1Gas({
  account: senderClient.account.address,
  to: senderClient.account.address,
  value: 1n,
});

console.log("Estimated L1 gas:", l1Gas);

console.log("Sending L2 transaction");
const tx = await senderClient.sendTransaction({
  to: senderClient.account.address,
  value: 1n,
});

await publicClient.waitForTransactionReceipt({ hash: tx });

console.log("Transaction sent successfully");

// Log transaction to Hedera
const topicId = process.env.HEDERA_TOPIC_ID;
if (topicId) {
  await logToHedera(`Transaction sent: hash=${tx}, from=${senderClient.account.address}`, topicId);
  console.log('Logged transaction to Hedera.');
} else {
  console.warn('HEDERA_TOPIC_ID not set. Skipping Hedera logging.');
}
