import {
  createSolanaRpc,
  devnet,
  createKeyPairSignerFromBytes,
} from "@solana/kit";
import { readFile, writeFile } from "node:fs/promises";

const WALLET_FILE = "wallet.json";
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));

async function loadOrCreateWallet() {
  try {
    // Try to load an existing wallet
    const data = JSON.parse(await readFile(WALLET_FILE, "utf-8"));
    const secretBytes = new Uint8Array(data.secretKey);
    const signer = await createKeyPairSignerFromBytes(secretBytes);
    console.log("Loaded existing wallet:", signer.address);
    return signer;
  } catch {
    // Generate extractable keypair
    const keypair = await crypto.subtle.generateKey("Ed25519", true, [
      "sign",
      "verify",
    ]);

    //   Export private key as pkcs8, then slice the last 32 bytes (the actual private key)
    const pkcs8 = await crypto.subtle.exportKey("pkcs8", keypair.privateKey);
    const privateKeyBytes = new Uint8Array(pkcs8).slice(-32);

    //   Export public key as spki, then slice the last 32 bytes
    const spki = await crypto.subtle.exportKey("spki", keypair.publicKey);
    const publicKeyBytes = new Uint8Array(spki).slice(-32);

    // Solana format: 64 bytes = [32 private | 32 public]
    const keypairBytes = new Uint8Array(64);
    keypairBytes.set(privateKeyBytes, 0);
    keypairBytes.set(publicKeyBytes, 32);

    await writeFile(
      WALLET_FILE,
      JSON.stringify({ secretKey: Array.from(keypairBytes) }),
    );

    const signer = await createKeyPairSignerFromBytes(keypairBytes);
    console.log("Created new wallet:", signer.address);
    console.log(`Saved to ${WALLET_FILE}`);
    return signer;
  }
}

const wallet = await loadOrCreateWallet();

const { value: balance } = await rpc.getBalance(wallet.address).send();
const balanceInSol = Number(balance) / 1_000_000_000;

console.log(`\nAddress : ${wallet.address}`);
console.log(`Balance : ${balanceInSol} SOL`);

if (balanceInSol === 0) {
  console.log(
    "\nNo SOL found. Visit https://faucet.solana.com/ and airdrop to:",
  );
  console.log(wallet.address);
}
