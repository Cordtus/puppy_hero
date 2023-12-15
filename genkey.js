const secp256k1 = require('secp256k1');
const createHash = require('create-hash');
const bip39 = require('bip39');
const { bech32 } = require('bech32');
const readline = require('readline');

function derivePrivateKey(mnemonic) {
    // Generate a seed from the mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    // Hash the seed to derive a private key
    const hash = createHash('sha256').update(seed).digest();
    let privateKey = hash;
    // Ensure the private key is valid
    while (!secp256k1.privateKeyVerify(privateKey)) {
        privateKey = createHash('sha256').update(privateKey).digest();
    }
    return privateKey;
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
    rl.question("Enter the address prefix (e.g., cosmos, chihuahua): ", (prefix) => {
        const privateKey = derivePrivateKey(mnemonic);
        const address = createCosmosAddress(privateKey, prefix);

        console.log(`Address: ${address}`);
        console.log(`Private Key: ${privateKey.toString('hex')}`);

        rl.close();
    });
});
