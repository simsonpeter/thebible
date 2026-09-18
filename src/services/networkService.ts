export function getOnlineStatus(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function subscribeOnlineStatus(listener: (online: boolean) => void): () => void {
  const on = () => listener(true);
  const off = () => listener(false);
  window.addEventListener("online", on);
  window.addEventListener("offline", off);
  return () => {
    window.removeEventListener("online", on);
    window.removeEventListener("offline", off);
  };
}
