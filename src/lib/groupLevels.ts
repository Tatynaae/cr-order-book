import type { Side } from "../types/orderbook.js";

export function groupPrice(price: number, tickSize: number, side: Side): number {
    if (tickSize <= 0) return price;

    const k = price / tickSize;

    const grouped = side === "bids"
        ? Math.floor(k) * tickSize
        : Math.ceil(k) * tickSize;

    return Number(grouped.toFixed(10));
}

export function groupLevels(
    raw: Map<number, number>,
    tickSize: number,
    side: Side,
): Map<number, number> {
    const out = new Map<number, number>();

    for (const [price, amount] of raw.entries()) {
        if (amount <= 0) continue;
        const gp = groupPrice(price, tickSize, side);
        out.set(gp, (out.get(gp) ?? 0) + amount);
    }

    return out;
}
