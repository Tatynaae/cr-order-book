export function groupPrice(price, tickSize, side) {
    if (tickSize <= 0)
        return price;
    const k = price / tickSize;
    const grouped = side === "bids"
        ? Math.floor(k) * tickSize
        : Math.ceil(k) * tickSize;
    return Number(grouped.toFixed(10));
}
export function groupLevels(raw, tickSize, side) {
    const out = new Map();
    for (const [price, amount] of raw.entries()) {
        if (amount <= 0)
            continue;
        const gp = groupPrice(price, tickSize, side);
        out.set(gp, (out.get(gp) ?? 0) + amount);
    }
    return out;
}
