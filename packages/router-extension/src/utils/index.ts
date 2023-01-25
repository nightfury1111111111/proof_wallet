/**
 * getProofExtensionRouterId returns the `window.proofExtensionRouterId`.
 * If the `window.proofExtensionRouterId` is not initialized, it will be initialized and returned.
 */
export function getProofExtensionRouterId(): number {
  if (window.proofExtensionRouterId == null) {
    window.proofExtensionRouterId = Math.floor(Math.random() * 1000000);
  }
  return window.proofExtensionRouterId;
}
