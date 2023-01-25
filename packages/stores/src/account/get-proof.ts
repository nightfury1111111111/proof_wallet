import { Proof } from "@proof-wallet/types";

export const getProofFromWindow: () => Promise<
  Proof | undefined
> = async () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (window.proof) {
    return window.proof;
  }

  if (document.readyState === "complete") {
    return window.proof;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.proof);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
