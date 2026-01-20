// CONSTRAINT: You MUST use this class to process your data.
// This simulates a proprietary protocol layer.

export class BinaryDecoder {
  constructor() {
    this.processedCount = 0;
  }

  decode(rawData) {
    this.processedCount++;

    if (!rawData) throw new Error("Empty buffer");

    // Mapping logic ensuring candidates explicitly map fields
    // instead of passing generic objects.
    return {
      type: 'DEPTH_UPDATE',
      timestamp: Date.now(),
      sequence: rawData.u,
      bids: this._normalizeList(rawData.b),
      asks: this._normalizeList(rawData.a),
      meta: { packetId: this.processedCount }
    };
  }

  _normalizeList(list) {
    return list.map(item => ({
      price: parseFloat(item[0]),
      amount: parseFloat(item[1]),
      raw: item
    }));
  }
}
