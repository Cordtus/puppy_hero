from bip_utils import Bip39MnemonicGenerator, Bip39SeedGenerator, Bip44, Bip44Coins
from pygments import highlight, lexers, formatters
import sys

def generate_address(prefix, coin_type, mnemonic):
    # Generate seed from mnemonic
    seed_bytes = Bip39SeedGenerator(mnemonic).Generate()

    # Create a BIP44 object with the specified coin type
    bip44_mst_ctx = Bip44.FromSeed(seed_bytes, Bip44Coins(coin_type))
    
    # Derive the BIP44 account keys for account 0
    bip44_acc_ctx = bip44_mst_ctx.Purpose().Coin().Account(0)

    # Derive the BIP44 chain keys for external chain
    bip44_chg_ctx = bip44_acc_ctx.Change(Bip44Changes.CHAIN_EXT)

    # Derive the address at index 0
    bip44_addr_ctx = bip44_chg_ctx.AddressIndex(0)

    # Get the private key, public key, and address
    priv_key = bip44_addr_ctx.PrivateKey().Raw().ToHex()
    pub_key = bip44_addr_ctx.PublicKey().ToBech32Addr(prefix)
    address = bip44_addr_ctx.PublicKey().ToAddress()
    return address, pub_key, priv_key

# Main function
def main():
    prefix = input("Enter the prefix (e.g., 'cosmos', 'chihuahua'): ")
    coin_type = int(input("Enter the HD wallet cointype (e.g., 118 for Cosmos): "))
    mnemonic = input("Enter your seed phrase: ")

    try:
        address, pub_key, priv_key = generate_address(prefix, coin_type, mnemonic)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return

    # Display results
    colored_pubkey = highlight(pub_key, lexers.JsonLexer(), formatters.TerminalFormatter())
    colored_privkey = highlight(priv_key, lexers.TextLexer(), formatters.TerminalFormatter())

    print("\033[91m")  # Red color start
    print(f"Address: {address}\nPublic Key: {colored_pubkey}\nType: local")
    print("\033[0m")  # Reset color

    print("\033[93m")  # Yellow color start
    print(f"Private Key: {colored_privkey}")
    print("*NEVER SHARE THIS OR STORE DIGITALLY*")
    print("\033[0m")  # Reset color

if __name__ == "__main__":
    main()
