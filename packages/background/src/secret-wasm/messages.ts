import { ProofError, Message } from "@proof-wallet/router";
import { ROUTE } from "./constants";

export class GetPubkeyMsg extends Message<Uint8Array> {
  public static type() {
    return "proof-get-pubkey-msg";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("secret-wasm", 100, "chain id not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetPubkeyMsg.type();
  }
}

export class ReqeustEncryptMsg extends Message<Uint8Array> {
  public static type() {
    return "proof-request-encrypt-msg";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractCodeHash: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    public readonly msg: object
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("secret-wasm", 100, "chain id not set");
    }

    if (!this.contractCodeHash) {
      throw new ProofError("secret-wasm", 103, "contract code hash not set");
    }

    if (!this.msg) {
      throw new ProofError("secret-wasm", 101, "msg not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ReqeustEncryptMsg.type();
  }
}

export class RequestDecryptMsg extends Message<Uint8Array> {
  public static type() {
    return "proof-request-decrypt-msg";
  }

  constructor(
    public readonly chainId: string,
    public readonly cipherText: Uint8Array,
    public readonly nonce: Uint8Array
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("secret-wasm", 100, "chain id not set");
    }

    if (!this.cipherText || this.cipherText.length === 0) {
      throw new ProofError("secret-wasm", 102, "ciphertext not set");
    }

    if (!this.nonce || this.nonce.length === 0) {
      throw new ProofError("secret-wasm", 110, "nonce not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestDecryptMsg.type();
  }
}

export class GetTxEncryptionKeyMsg extends Message<Uint8Array> {
  public static type() {
    return "proof-get-tx-encryption-key-msg";
  }

  constructor(
    public readonly chainId: string,
    public readonly nonce: Uint8Array
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("secret-wasm", 100, "chain id not set");
    }

    if (!this.nonce) {
      // Nonce of zero length is permitted.
      throw new ProofError("secret-wasm", 111, "nonce is null");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetTxEncryptionKeyMsg.type();
  }
}
