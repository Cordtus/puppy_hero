const secp256k1 = require('secp256k1');
const createHash = require('create-hash');
const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const readline = require('readline');

// Import the encoding module from bech32
const { bech32 } = require('bech32');

function derivePrivateKey(mnemonic, coinType) {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bitcoin.bip32.fromSeed(seed);
    const child = root.derivePath(`m/44'/${coinType}'/0'/0/0`);
    return child.privateKey;
}

function createCosmosAddress(privateKey, prefix) {
    const publicKey = secp256k1.publicKeyCreate(privateKey, true);
    const sha256Hash = createHash('sha256').update(publicKey).digest();
    const ripemd160Hash = createHash('ripemd160').update(sha256Hash).digest();
    const words = bech32.toWords(ripemd160Hash);
    return bech32.encode(prefix, words);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your mnemonic phrase: ', (mnemonic) => {
    rl.question("Enter the coin type (e.g., 118 for Cosmos): ", (coinTypeStr) => {
        rl.question("Enter the address prefix (e.g., cosmos, chihuahua): ", (prefix) => {
            const privateKey = derivePrivateKey(mnemonic, parseInt(coinTypeStr));
            const address = createCosmosAddress(privateKey, prefix);

            console.log(`Address: ${address}`);
            console.log(`Private Key: ${privateKey.toString('hex')}`);

            rl.close();
        });
    });
});
