function rand(min, max) {
    return Math.random() * (max - min) + min;
}
function toFixedStr(n, digits) {
    return n.toFixed(digits);
}
export class MockSocket {
    readyState = 0;
    onopen = null;
    onclose = null;
    onerror = null;
    onmessage = null;
    timer = null;
    listeners = new Set();
    seq = 1;
    mid = 43000;
    msgPerSec;
    constructor(msgPerSec = 120) {
        this.msgPerSec = msgPerSec;
        queueMicrotask(() => {
            this.readyState = 1;
            this.onopen?.();
            this.start();
        });
    }
    addEventListener(type, cb) {
        if (type === "message")
            this.listeners.add(cb);
    }
    removeEventListener(type, cb) {
        if (type === "message")
            this.listeners.delete(cb);
    }
    close() {
        if (this.timer !== null)
            window.clearInterval(this.timer);
        this.timer = null;
        this.readyState = 3;
        this.onclose?.();
    }

    emitMessage(payload) {
        const ev = new MessageEvent("message", { data: payload });
        this.onmessage?.(ev);
        for (const cb of this.listeners)
            cb(ev);
    }
    start() {
        const intervalMs = Math.max(1, Math.floor(1000 / this.msgPerSec));
        this.timer = window.setInterval(() => {
            this.mid += rand(-8, 8);
            const bids = [];
            const asks = [];
            for (let i = 0; i < 20; i++) {
                const bidP = this.mid - i * rand(0.5, 2.0);
                const askP = this.mid + i * rand(0.5, 2.0);
                const bidQ = Math.max(0, rand(0, 5) - rand(0, 0.3));
                const askQ = Math.max(0, rand(0, 5) - rand(0, 0.3));
                bids.push([toFixedStr(bidP, 2), toFixedStr(bidQ, 6)]);
                asks.push([toFixedStr(askP, 2), toFixedStr(askQ, 6)]);
            }
            const msg = JSON.stringify({
                e: "depthUpdate",
                E: Date.now(),
                s: "BTCUSDT",
                u: this.seq++,
                b: bids,
                a: asks,
            });
            this.emitMessage(msg);
        }, intervalMs);
    }
}
