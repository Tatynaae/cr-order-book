import type { Level, OrderBookSnapshot } from "../types/orderbook";

function fmtPrice(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtAmount(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}

function maxAmount(levels: Level[]): number {
    let m = 0;
    for (const l of levels) m = Math.max(m, l.amount);
    return m || 1;
}

type SideProps = {
    title: string;
    side: "bids" | "asks";
    levels: Level[];
};

function Side({ title, side, levels }: SideProps) {
    const max = maxAmount(levels);

    return (
        <section className={`side ${side}`}>
            <div className="sideHeader">
                <div className="sideTitle">{title}</div>
                <div className="cols">
                    <span>Price</span>
                    <span>Amount</span>
                    <span>Total</span>
                </div>
            </div>

            <div className="rows">
                {levels.map((l) => {
                    const p = Math.min(100, (l.amount / max) * 100);
                    return (
                        <div
                            key={`${side}-${l.price}`}
                            className="row"
                            style={{ ["--fill" as any]: `${p}%` }}
                        >
                            <span className="price">{fmtPrice(l.price)}</span>
                            <span className="amount">{fmtAmount(l.amount)}</span>
                            <span className="total">{fmtAmount(l.total)}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export function OrderBookView({ snap }: { snap: OrderBookSnapshot }) {
    const spread =
        snap.bestBid !== null && snap.bestAsk !== null ? snap.bestAsk - snap.bestBid : null;

    return (
        <div className="orderbook">
            <header className="topbar">
                <div className="status">
                    <span className={`dot ${snap.status}`} />
                    <span className="label">
            {snap.source.toUpperCase()} · {snap.status}
          </span>

                    {spread !== null && (
                        <span className="spread">Spread: {spread.toFixed(2)}</span>
                    )}
                </div>

                {snap.drift && (
                    <div className="drift">
                        Packet gap detected: expected {snap.drift.expected}, got {snap.drift.got}
                    </div>
                )}
            </header>

            <div className="grid">
                <Side title="Bids" side="bids" levels={snap.bids} />
                <Side title="Asks" side="asks" levels={snap.asks} />
            </div>
        </div>
    );
}
