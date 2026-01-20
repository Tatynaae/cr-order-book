type MessageHandler = (ev: MessageEvent<string>) => void;

function rand(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function toFixedStr(n: number, digits: number): string {
    return n.toFixed(digits);
}

export class MockSocket {
    public readyState: number = 0;
    public onopen: null | (() => void) = null;
    public onclose: null | (() => void) = null;
    public onerror: null | (() => void) = null;
    public onmessage: null | MessageHandler = null;

    private timer: number | null = null;
    private listeners = new Set<MessageHandler>();
    private seq = 1;
    private mid = 43000;
    private msgPerSec: number;

    constructor(msgPerSec = 120) {
        this.msgPerSec = msgPerSec;

        queueMicrotask(() => {
            this.readyState = 1;
            this.onopen?.();
            this.start();
        });
    }

    addEventListener(type: "message", cb: MessageHandler) {
        if (type === "message") this.listeners.add(cb);
    }

    removeEventListener(type: "message", cb: MessageHandler) {
        if (type === "message") this.listeners.delete(cb);
    }

    close() {
        if (this.timer !== null) window.clearInterval(this.timer);
        this.timer = null;
        this.readyState = 3;
        this.onclose?.();
    }

    private emitMessage(payload: string) {
        const ev = new MessageEvent("message", { data: payload });
        this.onmessage?.(ev);
        for (const cb of this.listeners) cb(ev);
    }

    private start() {
        const intervalMs = Math.max(1, Math.floor(1000 / this.msgPerSec));

        this.timer = window.setInterval(() => {
            this.mid += rand(-8, 8);

            const bids: [string, string][] = [];
            const asks: [string, string][] = [];

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
