const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export const subscribeUserToPush = async () => {
  if (!("serviceWorker" in navigator)) return null;

  if (!VAPID_PUBLIC_KEY) {
    console.error("خطا: VITE_VAPID_PUBLIC_KEY در فایل .env تعریف نشده است!");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return null;
  }
};
