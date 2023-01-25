import { SecretUtils } from "secretjs/types/enigmautils";
import { Proof } from "@proof-wallet/types";

/**
 * ProofEnigmaUtils duplicates the public methods that are supported on secretjs's EnigmaUtils class.
 */
export class ProofEnigmaUtils implements SecretUtils {
  constructor(
    protected readonly chainId: string,
    protected readonly proof: Proof
  ) {}

  async getPubkey(): Promise<Uint8Array> {
    return await this.proof.getEnigmaPubKey(this.chainId);
  }

  async getTxEncryptionKey(nonce: Uint8Array): Promise<Uint8Array> {
    return await this.proof.getEnigmaTxEncryptionKey(this.chainId, nonce);
  }

  async encrypt(
    contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    msg: object
  ): Promise<Uint8Array> {
    return await this.proof.enigmaEncrypt(this.chainId, contractCodeHash, msg);
  }

  async decrypt(
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    return await this.proof.enigmaDecrypt(this.chainId, ciphertext, nonce);
  }
}
