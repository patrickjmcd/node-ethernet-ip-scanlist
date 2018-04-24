const ScanTag = require("../ScanTag").ScanTag;
const Controller = require("ethernet-ip").Controller;
const _ = require("lodash");
const { EventEmitter } = require("events");


class ScanList extends EventEmitter {
    constructor(ipAddress, slot=0, scanRate=200){
        super();
        this.ipAddress = ipAddress;
        this.slot = slot;
        this.tags = {};
        this.PLC = new Controller();
        this.PLC.scan_rate = scanRate;

    }
    /**
     * @param  {string} tagName
     * @param  {string} vanityName
     * @param  {number} storePeriod
     * @param  {number} storeChangeDelta
     * @param  {number} keepAlivePeriod
     */
    add(tagName, vanityName, storePeriod, storeChangeDelta){
        this.tags[tagName] = new ScanTag(tagName, vanityName, storePeriod, storeChangeDelta);
    }

    remove(tagName){
        this.tags = _.omit(this.tags, tagName);
    }

    get length(){
        return Object.keys(this.tags).length;
    }

    emitNewValue(tagName){
        const thisTag = this.tags[tagName];
        this.emit("newValue", thisTag);
    }

    
    start(){
        _.forEach(this.tags, (t) => {
            this.PLC.subscribe(t.enipTag);
        });
        
        this.PLC.connect(this.ipAddress, this.slot).then( () => {
            this.PLC.scan().catch((err) => {
                console.log(err);
            });
        });
        
        this.PLC.forEach( (tag) => {
            tag.on("Initialized", (tag) => {
                const { storeValue } = this.tags[tag.name].gotValue(tag.value);
                if (storeValue)
                    this.emitNewValue(tag.name);
            });
        
            tag.on("Changed", (tag) => {
                const { storeValue } = this.tags[tag.name].gotValue(tag.value);
                if (storeValue)
                    this.emitNewValue(tag.name);
            });

            tag.on("KeepAlive", (tag) => {
                const { storeValue } = this.tags[tag.name].gotValue(tag.value);
                if (storeValue)
                    this.emitNewValue(tag.name);
            });
        });
    }
}

module.exports = { ScanList };