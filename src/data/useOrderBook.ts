import { useSyncExternalStore } from "react";
import type { OrderBookSnapshot } from "../types/orderbook";
import type { OrderBookStore } from "./OrderBookStore";

export function useOrderBook(store: OrderBookStore): OrderBookSnapshot {
    return useSyncExternalStore(
        (cb) => store.subscribe(cb),
        () => store.getSnapshot(),
        () => store.getSnapshot(),
    );
}
