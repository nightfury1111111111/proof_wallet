import { Proof, BroadcastMode } from "@proof-wallet/types";
import WalletConnect from "@walletconnect/client";
import { ProofQRCodeModalV1 } from "@proof-wallet/wc-qrcode-modal";
import { ProofWalletConnectV1 } from "@proof-wallet/wc-client";
import Axios from "axios";
import { EmbedChainInfos } from "./config";
import { Buffer } from "buffer/";

let proof: Proof | undefined = undefined;
let promise: Promise<Proof> | undefined = undefined;

async function sendTx(
  chainId: string,
  tx: Uint8Array,
  mode: BroadcastMode
): Promise<Uint8Array> {
  const params = {
    tx_bytes: Buffer.from(tx as any).toString("base64"),
    mode: (() => {
      switch (mode) {
        case "async":
          return "BROADCAST_MODE_ASYNC";
        case "block":
          return "BROADCAST_MODE_BLOCK";
        case "sync":
          return "BROADCAST_MODE_SYNC";
        default:
          return "BROADCAST_MODE_UNSPECIFIED";
      }
    })(),
  };

  const restInstance = Axios.create({
    baseURL: EmbedChainInfos.find((chainInfo) => chainInfo.chainId === chainId)!
      .rest,
  });

  const result = await restInstance.post("/cosmos/tx/v1beta1/txs", params);

  return Buffer.from(result.data["tx_response"].txhash, "hex");
}

export function getWCProof(): Promise<Proof> {
  if (proof) {
    return Promise.resolve(proof);
  }

  const fn = () => {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      signingMethods: [
        "proof_enable_wallet_connect_v1",
        "proof_sign_amino_wallet_connect_v1",
      ],
      qrcodeModal: new ProofQRCodeModalV1(),
    });

    // Check if connection is already established
    if (!connector.connected) {
      // create new session
      connector.createSession();

      return new Promise<Proof>((resolve, reject) => {
        connector.on("connect", (error) => {
          if (error) {
            reject(error);
          } else {
            proof = new ProofWalletConnectV1(connector, {
              sendTx,
            });
            resolve(proof);
          }
        });
      });
    } else {
      proof = new ProofWalletConnectV1(connector, {
        sendTx,
      });
      return Promise.resolve(proof);
    }
  };

  if (!promise) {
    promise = fn();
  }

  return promise;
}
