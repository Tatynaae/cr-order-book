export type Side = "bids" | "asks";

export type Level = {
    price: number;
    amount: number;
    total: number;
};

export type OrderBookSnapshot = {
    ts: number;
    tickSize: number;
    bids: Level[];
    asks: Level[];
    bestBid: number | null;
    bestAsk: number | null;
    drift: null | { expected: number; got: number };
    source: "binance" | "mock";
    status: "connecting" | "open" | "closed" | "error";
};
