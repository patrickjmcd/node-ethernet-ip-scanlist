const ScanList = require("./").ScanList;
const ScanTag = require("../ScanTag").ScanTag;

describe("ScanList", () => {
    let scanList;
    beforeEach(() => {
        scanList = new ScanList("192.168.1.1");
    });
    it("should create an instance of ScanList", () => {
        expect(scanList).toBeInstanceOf(ScanList);
    });
        
    it("should create ScanTag instances when calling the add function", () => {
        scanList.add("test", "Test", 1, 50.0, 600);
        expect(scanList.tags.test).toBeInstanceOf(ScanTag);
        scanList.add("test2", "Test 2", 2, 100.0, 600);
        expect(scanList.tags.test2).toBeInstanceOf(ScanTag);
    });

    it("should return the correct length of tags", () => {
        scanList.add("test", "Test", 1, 50.0, 600);
        expect(scanList.length).toEqual(1);
        scanList.add("test2", "Test 2", 2, 100.0, 600);
        expect(scanList.length).toEqual(2);
    });

    it("should remove the specified tag from tags with the remove function", () => {
        scanList.add("test", "Test", 1, 50.0, 600);
        scanList.add("test2", "Test 2", 2, 100.0, 600);
        scanList.remove("test");
        expect(scanList.tags.test).toBeUndefined();
    });

    it("should emit a newValue event with tag info", () => {
        scanList.add("test", "Test", 1, 50.0, 600);
        const newValueFn = jest.fn();
        scanList.on("newValue", (tag) => {
            newValueFn(tag);
        });
        scanList.emitNewValue("test");
        expect(newValueFn).toHaveBeenCalled();
    });

    it("should emit an Updated event", () => {
        scanList.add("test", "Test", 1, 50.0, 600);
        const newValueFn = jest.fn();
        scanList.on("Updated", (tag) => {
            newValueFn(tag);
        });
        scanList.emitUpdated("test");
        expect(newValueFn).toHaveBeenCalled();
    });

    it("should null the PLC property out on stop function", () => {
        scanList.stop();
        expect(scanList.PLC).toBeNull();
    });
});