// Convertit la clé publique VAPID (base64 URL-safe) au format attendu par
// PushManager.subscribe (un Uint8Array).
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  // Uint8Array(length) infère un ArrayBufferLike (pouvant être un
  // SharedArrayBuffer) que le typage DOM de PushManager.subscribe refuse ;
  // on force un vrai ArrayBuffer en le passant explicitement.
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
