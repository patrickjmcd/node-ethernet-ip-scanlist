const { ScanTag, REASON_DELTA, REASON_FORCE, REASON_INITIALIZE, REASON_PERIOD } = require("./");
const moment = require("moment");

describe("ScanTag", () => {
    describe("constructor", () => {
        it("should create an instance of ScanTag", () => {
            const newScanTag = new ScanTag("test", "test", 10, 100, 60);
            expect(newScanTag).toBeInstanceOf(ScanTag);
        });

        it("should throw an error for non-string tagName", () => {
            expect(() => {
                new ScanTag(1, "test", 10, 100, 60);
            }).toThrow("ScanTag expects tagName to be type <string>, got <number>");
        });

        it("should throw an error for non-string vanityName", () => {
            expect(() => {
                new ScanTag("test", 1, 10, 100, 60);
            }).toThrow("ScanTag expects vanityName to be type <string>, got <number>");
        });

        it("should throw an error for non-number storePeriod", () => {
            expect(() => {
                new ScanTag("test", "test", "test", 100, 60);
            }).toThrow("ScanTag expects storePeriod to be type <number>, got <string>");
        });

        it("should throw an error for storePeriod <= 0", () => {
            expect(() => {
                new ScanTag("test", "test", -20, 100, 60);
            }).toThrow("ScanTag expects storePeriod to be greater than 0, got -20");
        });

        it("should throw an error for non-number storeChangeDelta", () => {
            expect(() => {
                new ScanTag("test", "test", 10, "test", 60);
            }).toThrow("ScanTag expects storeChangeDelta to be type <number>, got <string>");
        });

        it("should throw an error for storeChangeDelta <= 0", () => {
            expect(() => {
                new ScanTag("test", "test", 10, -10, 60);
            }).toThrow("ScanTag expects storeChangeDelta to be greater than 0, got -10");
        });

        describe("gotValue function", () => {
            let tag;
            beforeEach(() => {
                tag = new ScanTag("test", "Test", 2, 10.0, 60.0);
            });

            it("should return false with if no value change", () => {
                tag.lastSendValue = 100;
                tag.lastSendTime = moment(new Date());
                const read = tag.gotValue(100);
                expect(read).toEqual({storeValue: false, reason: null});
            });

            it("should return true with initialize reason if first value", () => {
                const read = tag.gotValue(100);
                expect(read).toEqual({storeValue: true, reason: REASON_INITIALIZE});
            });

            it("should return true with delta reason if changed by large enough amount", () => {
                tag.lastSendValue = 100;
                tag.lastSendTime = moment(new Date());
                const read = tag.gotValue(tag.lastSendValue + tag.storeChangeDelta + 1.0);
                expect(read).toEqual({storeValue: true, reason: REASON_DELTA});
            });

            it("should return true with delta reason if boolean changed", () => {
                tag.lastSendValue = false;
                tag.lastSendTime = moment(new Date());
                const read = tag.gotValue(true);
                expect(read).toEqual({storeValue: true, reason: REASON_DELTA});
            });

            it("should return true with period reason if changed by large enough amount", () => {
                tag.lastSendValue = 100;
                tag.lastSendTime = moment(new Date()).subtract(3, "minutes");
                const read = tag.gotValue(100);
                expect(read).toEqual({storeValue: true, reason: REASON_PERIOD});
            });

            it("should return true with force reason if force enabled", () => {
                const read = tag.gotValue(100, true);
                expect(read).toEqual({storeValue: true, reason: REASON_FORCE});
            });
        
        });
    });
});