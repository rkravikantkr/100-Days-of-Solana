import {
  generateKeyPairSigner,
  createSolanaRpc,
  devnet,
  address,
} from "@solana/kit";

const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

const wallet = await generateKeyPairSigner();
const wallet_addr ="3LnYvBJ3ExKi4uZV1oYR9v9CuocWg5Zkj7Y5KagguTTJ"


console.log("New Wallet address:", wallet.address);
console.log("Old Funded Wallet address:", wallet_addr);

const fundedAddress = address(`${wallet_addr}`);

const { value: balance } = await rpc.getBalance(fundedAddress).send();
const balanceInSol = Number(balance) / 1_000_000_000;

console.log(`Balance: ${balanceInSol} SOL`);
