import test from "node:test";
import assert from "node:assert/strict";
import { groupLevels, groupPrice } from "../src/lib/groupLevels.js";
test("groupPrice bids floors, asks ceils", () => {
    assert.equal(groupPrice(100.09, 0.1, "bids"), 100.0);
    assert.equal(groupPrice(100.01, 0.1, "asks"), 100.1);
});
test("groupLevels sums amounts into grouped buckets", () => {
    const raw = new Map([
        [100.01, 1],
        [100.02, 2],
        [100.09, 3],
        [100.11, 4],
    ]);
    const gBids = groupLevels(raw, 0.1, "bids");
    assert.equal(gBids.get(100.0), 1 + 2 + 3);
    assert.equal(gBids.get(100.1), 4);
    const gAsks = groupLevels(raw, 0.1, "asks");
    assert.equal(gAsks.get(100.1), 1 + 2 + 3);
    assert.equal(gAsks.get(100.2), 4);
});
