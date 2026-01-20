import { useMemo, useState, useEffect } from "react";
import { OrderBookStore } from "./data/OrderBookStore";
import { useOrderBook } from "./data/useOrderBook";
import { TickSizeSelect } from "./components/TickSizeSelect";
import { OrderBookView } from "./components/OrderBook";

const USE_MOCK_DEFAULT = import.meta.env.VITE_USE_MOCK === "true";

export default function App() {
    const store = useMemo(() => new OrderBookStore(), []);
    const [useMock, setUseMock] = useState<boolean>(USE_MOCK_DEFAULT);

    const snap = useOrderBook(store);

    useEffect(() => {
        store.connect({ useMock });
        return () => store.disconnect();
    }, [store, useMock]);

    useEffect(() => {
        const bid = snap.bestBid;
        const ask = snap.bestAsk;

        if (bid == null || ask == null) {
            document.title = "BTC/USDT · Order Book";
            return;
        }

        const mid = (bid + ask) / 2;
        const spread = ask - bid;

        document.title = `${mid.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} BTC/USDT (${spread.toFixed(2)})`;
    }, [snap.bestBid, snap.bestAsk]);

    return (
        <div className="app">
            <div className="panel">
                <h1>Order Book</h1>

                <div className="controls">
                    <TickSizeSelect value={snap.tickSize} onChange={(v) => store.setTickSize(v)} />

                    <label className="tick">
                        <span>Source</span>
                        <select
                            value={useMock ? "mock" : "binance"}
                            onChange={(e) => setUseMock(e.target.value === "mock")}
                        >
                            <option value="binance">Binance WS</option>
                            <option value="mock">Mock (high load)</option>
                        </select>
                    </label>
                </div>

                <OrderBookView snap={snap} />
            </div>
        </div>
    );
}
