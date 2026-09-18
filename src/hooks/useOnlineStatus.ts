import { useEffect, useState } from "react";
import { getOnlineStatus, subscribeOnlineStatus } from "@/services/networkService";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(getOnlineStatus);
  useEffect(() => subscribeOnlineStatus(setOnline), []);
  return online;
}
