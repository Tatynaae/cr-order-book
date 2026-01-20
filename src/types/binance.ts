export type BinanceDepthMessage = {
    e: "depthUpdate";
    E: number;
    s: string;
    u: number;
    b: [string, string][];
    a: [string, string][];
};
