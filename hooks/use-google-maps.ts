import { useEffect, useState } from "react";
import { loadGoogleMapsScript } from "@/lib/maps";

export function useGoogleMaps(): boolean {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let mounted = true;
    loadGoogleMapsScript()
      .then(() => { if (mounted) setLoaded(true); })
      .catch(() => { if (mounted) setLoaded(false); });
    return () => { mounted = false; };
  }, []);
  return loaded;
}
