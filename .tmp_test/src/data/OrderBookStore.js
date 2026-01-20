import { BinaryDecoder } from "../utils/BinaryDecoder";
import { MockSocket } from "../utils/MockSocket";
import { groupLevels } from "../lib/groupLevels";
const DEFAULT_DEPTH = 25;
const MAX_RAW_LEVELS = 2000;
export class OrderBookStore {
    decoder = new BinaryDecoder();
    ws = null;
    listeners = new Set();
    rawBids = new Map();
    rawAsks = new Map();
    pending = [];
    flushTimer = null;
    tickSize = 0.1;
    depth = DEFAULT_DEPTH;
    lastSeq = null;
    drift = null;
    status = "closed";
    source = "binance";
    snapshot = {
        ts: Date.now(),
        tickSize: this.tickSize,
        bids: [],
        asks: [],
        bestBid: null,
        bestAsk: null,
        drift: null,
        source: this.source,
        status: this.status,
    };
    subscribe(cb) {
        this.listeners.add(cb);
        return () => this.listeners.delete(cb);
    }
    getSnapshot() {
        return this.snapshot;
    }
    setTickSize(tick) {
        this.tickSize = tick;
        this.rebuildAndNotify();
    }
    connect(opts) {
        this.disconnect();
        this.source = opts.useMock ? "mock" : "binance";
        this.status = "connecting";
        this.drift = null;
        this.lastSeq = null;
        const url = "wss://stream.binance.com:9443/ws/btcusdt@depth";
        const ws = opts.useMock ? new MockSocket(140) : new WebSocket(url);
        this.ws = ws;
        ws.onopen = () => {
            this.status = "open";
            this.startFlushLoop();
            this.rebuildAndNotify();
        };
        ws.onclose = () => {
            this.status = "closed";
            this.stopFlushLoop();
            this.rebuildAndNotify();
        };
        ws.onerror = () => {
            this.status = "error";
            this.rebuildAndNotify();
        };
        ws.onmessage = (ev) => {
            let rawObj;
            try {
                rawObj = JSON.parse(ev.data);
            }
            catch {
                rawObj = ev.data;
            }
            let decoded;
            try {
                decoded = this.decoder.decode(rawObj);
            }
            catch {
                return;
            }
            if (this.lastSeq !== null) {
                const expected = this.lastSeq + 1;
                if (decoded.sequence !== expected && decoded.sequence > expected) {
                    this.drift = { expected, got: decoded.sequence };
                }
            }
            this.lastSeq = decoded.sequence;
            this.pending.push(decoded);
            if (this.pending.length > 5000)
                this.pending.splice(0, this.pending.length - 5000);
        };
    }
    disconnect() {
        this.stopFlushLoop();
        if (this.ws) {
            try {
                this.ws.close();
            }
            catch { }
        }
        this.ws = null;
        this.status = "closed";
        this.pending = [];
    }
    startFlushLoop() {
        this.stopFlushLoop();
        this.flushTimer = window.setInterval(() => this.flush(), 100);
    }
    stopFlushLoop() {
        if (this.flushTimer !== null)
            window.clearInterval(this.flushTimer);
        this.flushTimer = null;
    }
    flush() {
        if (this.pending.length === 0)
            return;
        for (const upd of this.pending) {
            this.applyUpdate("bids", upd.bids);
            this.applyUpdate("asks", upd.asks);
        }
        this.pending = [];
        this.prune("bids");
        this.prune("asks");
        this.rebuildAndNotify();
    }
    applyUpdate(side, levels) {
        const book = side === "bids" ? this.rawBids : this.rawAsks;
        for (const { price, amount } of levels) {
            if (!Number.isFinite(price))
                continue;
            if (!amount || amount <= 0) {
                book.delete(price);
            }
            else {
                book.set(price, amount);
            }
        }
    }
    prune(side) {
        const book = side === "bids" ? this.rawBids : this.rawAsks;
        if (book.size <= MAX_RAW_LEVELS)
            return;
        const prices = Array.from(book.keys());
        prices.sort((a, b) => a - b);
        const keep = MAX_RAW_LEVELS;
        const dropCount = prices.length - keep;
        if (side === "bids") {
            for (let i = 0; i < dropCount; i++)
                book.delete(prices[i]);
        }
        else {
            for (let i = 0; i < dropCount; i++)
                book.delete(prices[prices.length - 1 - i]);
        }
    }
    rebuildAndNotify() {
        this.snapshot = this.buildSnapshot();
        for (const cb of this.listeners)
            cb();
    }
    buildSnapshot() {
        const tickSize = this.tickSize;
        const gb = groupLevels(this.rawBids, tickSize, "bids");
        const ga = groupLevels(this.rawAsks, tickSize, "asks");
        const bids = this.toTopLevels(gb, "bids", this.depth);
        const asks = this.toTopLevels(ga, "asks", this.depth);
        const bestBid = bids.length ? bids[0].price : null;
        const bestAsk = asks.length ? asks[0].price : null;
        return {
            ts: Date.now(),
            tickSize,
            bids,
            asks,
            bestBid,
            bestAsk,
            drift: this.drift,
            source: this.source,
            status: this.status,
        };
    }
    toTopLevels(grouped, side, depth) {
        const arr = Array.from(grouped.entries()).map(([price, amount]) => ({ price, amount }));
        arr.sort((x, y) => (side === "bids" ? y.price - x.price : x.price - y.price));
        const sliced = arr.slice(0, depth);
        let cum = 0;
        return sliced.map((x) => {
            cum += x.amount;
            return { price: x.price, amount: x.amount, total: cum };
        });
    }
}
