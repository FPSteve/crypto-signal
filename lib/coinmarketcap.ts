const CMC_GLOBAL_METRICS_URL = "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest";

type CoinMarketCapGlobalMetricsResponse = {
  data?: {
    btc_dominance?: number;
    btc_dominance_24h_percentage_change?: number;
  };
};

export type BtcDominanceMetric = {
  dominance: number | null;
  change24h: number | null;
  source: "coinmarketcap" | "missing-key" | "error";
};

function getCoinMarketCapApiKey() {
  return process.env.COINMARKETCAP_API_KEY ?? process.env.CMC_API_KEY ?? null;
}

export async function getBtcDominance(): Promise<BtcDominanceMetric> {
  const apiKey = getCoinMarketCapApiKey();

  if (!apiKey) {
    return {
      dominance: null,
      change24h: null,
      source: "missing-key",
    };
  }

  try {
    const res = await fetch(CMC_GLOBAL_METRICS_URL, {
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": apiKey,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return {
        dominance: null,
        change24h: null,
        source: "error",
      };
    }

    const json = (await res.json()) as CoinMarketCapGlobalMetricsResponse;
    return {
      dominance: typeof json.data?.btc_dominance === "number" ? json.data.btc_dominance : null,
      change24h:
        typeof json.data?.btc_dominance_24h_percentage_change === "number"
          ? json.data.btc_dominance_24h_percentage_change
          : null,
      source: "coinmarketcap",
    };
  } catch {
    return {
      dominance: null,
      change24h: null,
      source: "error",
    };
  }
}
