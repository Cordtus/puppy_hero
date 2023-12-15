const secp256k1 = require('secp256k1');
const createHash = require('create-hash');
const bip39 = require('bip39');
const { bech32 } = require('bech32');
const readline = require('readline');

function derivePrivateKey(mnemonic, coinType) {
    // Generate a seed from the mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    // Define the derivation path with the provided coin type
    const hdPath = `m/44'/${coinType}'/0'/0/0`;
    // Derive a private key based on the seed and derivation path
    const root = bip32.fromSeed(seed);
    const child = root.derivePath(hdPath);
    return child.privateKey;
}

function createCosmosAddress(privateKey, prefix) {
    // Derive the public key
    const publicKey = secp256k1.publicKeyCreate(privateKey, true);
    // Hash the public key to get the address
    const sha256Hash = createHash('sha256').update(publicKey).digest();
    const ripemd160Hash = createHash('ripemd160').update(sha256Hash).digest();
    // Encode the address using Bech32
    const address = bech32.encode(prefix, bech32.toWords(ripemd160Hash));
    return address;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your mnemonic phrase: ', (mnemonic) => {
    rl.question("Enter the coin type (e.g., 118 for Cosmos): ", (coinTypeStr) => {
        const coinType = parseInt(coinTypeStr);
        rl.question("Enter the address prefix (e.g., cosmos, chihuahua): ", (prefix) => {
            const privateKey = derivePrivateKey(mnemonic, coinType);
            const address = createCosmosAddress(privateKey, prefix);

            console.log(`Address: ${address}`);
            console.log(`Private Key: ${privateKey.toString('hex')}`);

            rl.close();
        });
    });
});
