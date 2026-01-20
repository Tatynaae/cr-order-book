import { useSyncExternalStore } from "react";
export function useOrderBook(store) {
    return useSyncExternalStore((cb) => store.subscribe(cb), () => store.getSnapshot(), () => store.getSnapshot());
}
