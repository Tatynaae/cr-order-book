export type NormalizedLevel = {
    price: number;
    amount: number;
    raw: [string, string];
};

export type DecodedDepthUpdate = {
    type: "DEPTH_UPDATE";
    timestamp: number;
    sequence: number;
    bids: NormalizedLevel[];
    asks: NormalizedLevel[];
    meta: { packetId: number };
};

export class BinaryDecoder {
    processedCount: number;
    decode(rawData: unknown): DecodedDepthUpdate;
}
