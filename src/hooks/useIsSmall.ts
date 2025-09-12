import { useEffect, useState } from "react";

export default function useIsSmall(breakpoint = 768) {
  const [isSmall, setIsSmall] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
    const on = () => setIsSmall(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [breakpoint]);
  return isSmall;
}
