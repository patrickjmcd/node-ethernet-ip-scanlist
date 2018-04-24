const { Tag } = require("ethernet-ip");
const moment = require("moment");

const REASON_INITIALIZE = "No value stored yet.";
const REASON_DELTA = "Value changed by more than storeChangeDelta";
const REASON_PERIOD = "Store period elapsed";
const REASON_FORCE = "Store forced.";


class ScanTag {
    /**
     * ScanTag constructor
     * 
     * @param  {string} tagName tag name in PLC
     * @param  {string} vanityName vanity (display) name for the tag
     * @param  {number} storePeriod minutes between storing value
     * @param  {number} storeChangeDelta max change allowed before storing value
     * @param  {number} keepAlivePeriod minutes to allow tag value to be unread
     */
    constructor(tagName, vanityName, storePeriod, storeChangeDelta){
        if (typeof tagName !== "string") throw new Error(`ScanTag expects tagName to be type <string>, got <${typeof tagName}>`);

        if (typeof vanityName !== "string") throw new Error(`ScanTag expects vanityName to be type <string>, got <${typeof vanityName}>`);

        if (typeof storePeriod !== "number") throw new Error(`ScanTag expects storePeriod to be type <number>, got <${typeof storePeriod}>`);
        if(storePeriod < 0) throw new Error(`ScanTag expects storePeriod to be greater than 0, got ${storePeriod}`);

        if (typeof storeChangeDelta !== "number") throw new Error(`ScanTag expects storeChangeDelta to be type <number>, got <${typeof storeChangeDelta}>`);
        if(storeChangeDelta < 0) throw new Error(`ScanTag expects storeChangeDelta to be greater than 0, got ${storeChangeDelta}`);

        this.tagName = tagName;
        this.vanityName = vanityName;
        this.storePeriod = storePeriod;  // in minutes
        this.storeChangeDelta = storeChangeDelta;
        this.value = null;
        this.lastSendValue = null;
        this.lastSendTime = null;
        this.keepAlivePeriod = (storeChangeDelta / 2.0) / 60.0; // convert minutes to seconds
        this.enipTag = new Tag(tagName, undefined, undefined, this.keepAlivePeriod);
        this.lastSendReason = null;

    }
    /**
     * @param  {} value value retrieved from PLC
     * @param  {boolean} force=false automatically force send
     */
    gotValue(value, force=false){
        this.value = value;
        let reason = null;
        let storeValue = false;
        if (this.lastSendValue === null || !this.lastSendTime){
            reason = REASON_INITIALIZE;
        } else if ((typeof this.value === "number") && (Math.abs(this.value - this.lastSendValue) >= this.storeChangeDelta) && (this.storeChangeDelta !== 0)){
            reason = REASON_DELTA;
        } else if ((typeof this.value !== "number") && (this.value != this.lastSendValue)){
            reason = REASON_DELTA;
        } else if ((moment(new Date()).diff(this.lastSendTime, "minutes") >= this.storePeriod) && (this.storePeriod !== 0)) {
            reason = REASON_PERIOD;
        }

        if (force){
            reason = REASON_FORCE;
        }

        if (reason){
            storeValue = true;
            this.lastSendTime = moment(new Date());
            this.lastSendValue = value;
            this.lastSendReason = reason;
        }

        return {storeValue, reason};
    }


}

module.exports = { ScanTag, REASON_DELTA, REASON_FORCE, REASON_INITIALIZE, REASON_PERIOD };