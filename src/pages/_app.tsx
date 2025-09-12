import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        shouldRetryOnError: true,
        errorRetryCount: 2,
        errorRetryInterval: 1500,
        revalidateOnFocus: false,
        dedupingInterval: 10000,
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}
