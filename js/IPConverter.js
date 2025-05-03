/*
IPV4:
    Class C:
        Normal
            127.0.0.1
        Big End 32bits
            2130706433
        16bits:
            0x7f.0x00.0x00.0x01
            0x7f.0x0.0x0.0x1
        8bits:
            000000000177.0000000000.0000000000.000000001
            0177.00.00.01 
            0177.0.0.01 
    Class B:
        127.0.1
    Class A:
        127.1

IPV6:
    Normal:
        0000:0000:0000:0000:0000:0000:0000:0001
    Short:
        ::1
        ::
        0000::1
        1::
    Complex:
        1:2:3:4:5:6:77.77.88.88 1:2:3:4:5:6:4d4d:5858
        fe80::1.2.3.4
*/

class IPConverter {
    static Type = {
        IPV4: "IPV4",
        IPV6: "IPV6"
    };
    IPv6Regex = /^[0-9a-fA-F:.]*$/g;
    IPv4Regex = /^[0-9xX.]*$/g;
    IPv4Regex2 = /^\d*$/g;
    ipv4 = [];
    ipv6 = [];

    constructor(data) {
        if (typeof data === "string") {
            if (this.isIPv6(data)) {
                this.type = IPConverter.Type.IPV6;
                this.stringToIPv6(data);
            } else if (this.IPv4Regex2.test(data)) {
                this.type = IPConverter.Type.IPV4;
                this.ipv4 = this.numberToIPv4(data);
            } else if (this.isIPv4(data)) {
                this.type = IPConverter.Type.IPV4;
                this.stringToIPv4(data);
            }
        } else {
            throw new Error("IPConverter: data is not a string");
        }
    }

    /**
     *
     * @param {string} data
     * @returns boolean
     */
    isIPv6(data) {
        if (data.includes(":")) {
            if (this.IPv6Regex.test(data)) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param {string} data
     * @returns boolean
     */
    isIPv4(data) {
        if (data.includes(".")) {
            if (this.IPv4Regex.test(data)) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param {string} data
     * @returns [1,2,3,4]{number}
     */
    numberToIPv4(data) {
        let tmp = [];
        let number = this.stringToNumber(data);
        for (let i = 0; i < 4; i++) {
            tmp.push(Math.floor(number % 256));
            number /= 256;
        }
        return tmp.reverse();
    }

    /**
     *
     * @param {string} data
     * @returns number
     */
    stringToNumber(data) {
        let number = 0;
        if (data.startsWith("0x") || data.startsWith("0X")) {
            number = parseInt(data, 16);
        } else if (data.startsWith("0")) {
            number = parseInt(data, 8);
        } else {
            number = parseInt(data, 10);
        }
        if (isNaN(number)) throw new Error("Invalid IP Address");
        return number;
    }

    /**
     *
     * @param {string} data
     */
    stringToIPv4(data) {
        let tmp = data.split(".");
        let tmp2;
        switch (tmp.length) {
            case 1:
                this.ipv4 = this.numberToIPv4(tmp[0]);
                break;
            case 2:
                // 192.11046143 Class A
                this.ipv4.push(this.stringToNumber(tmp[0]));
                tmp2 = this.ipv4.push(tmp[1]);
                if (0 === tmp2[0]) {
                    this.ipv4.push(tmp2[1]);
                    this.ipv4.push(tmp2[2]);
                    this.ipv4.push(tmp2[3]);
                } else {
                    throw new Error("IPConverter: data has an invalid number of dots");
                }
                break;
            case 3:
                //  192.168.1 Class B
                this.ipv4.push(this.stringToNumber(tmp[0]));
                this.ipv4.push(this.stringToNumber(tmp[1]));
                tmp2 = this.ipv4.push(tmp[2]);
                if ((0 === tmp2[0]) && (0 === tmp2[1])) {
                    this.ipv4.push(tmp2[2]);
                    this.ipv4.push(tmp2[3]);
                } else {
                    throw new Error("IPConverter: data has an invalid number of dots");
                }
                break;
            // 192.168.1.1 Class C
            case 4:
                this.ipv4.push(this.stringToNumber(tmp[0]));
                this.ipv4.push(this.stringToNumber(tmp[1]));
                this.ipv4.push(this.stringToNumber(tmp[2]));
                this.ipv4.push(this.stringToNumber(tmp[3]));
                break;
            default:
                throw new Error("IPConverter: data has an invalid number of dots");
        }
    }

    /**
     * Converts a string to an IPv6 address
     *
     * @param data The string to convert
     */
    stringToIPv6(data) {
        let tmp = data.split(":");

        switch (tmp.length) {
            case 1:
            case 2:
            default:
                throw new Error("IPConverter: data has an invalid number of colons");
            case 3:
                // ::1 ::127.0.0.1 1::
                if ("" === tmp[0] && "" === tmp[1]) {
                    if (tmp[2].indexOf(".") >= 0) {
                        this.ipv6.push(0);
                        this.ipv6.push(0);
                        this.ipv6.push(0);
                        this.ipv6.push(0);
                        this.stringToIPv4(tmp[2]);
                        this.ipv6.push(this.ipv4[0]);
                        this.ipv6.push(this.ipv4[1]);
                        this.ipv6.push(this.ipv4[2]);
                        this.ipv6.push(this.ipv4[3]);
                    } else {
                        for (let i = 0; i < 7; i++) {
                            this.ipv6.push(0);
                        }
                        this.ipv6.push(parseInt(tmp[2], 16));
                    }
                }
                if ("" === tmp[1] && "" === tmp[2]) {
                    this.ipv6.push(parseInt(tmp[0], 16));
                    for (let i = 0; i < 7; i++) {
                        this.ipv6.push(0);
                    }
                }
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                if (data.indexOf("::") >= 0) {
                    if (data.indexOf("." >= 0)) {
                        for (let i = 0; i < tmp.length - 1; i++) {
                            if (tmp[i].indexOf(".") >= 0) {
                                throw new Error("Invalid IPv6 address");
                            }
                            if (i + 1 < tmp.length && "" === tmp[i] && "" === tmp[i + 1]) {
                                for (let j = 0; j < 7 - tmp.length - 1; j++) {
                                    this.ipv6.push(0);
                                }
                            } else {
                                this.ipv6.push(parseInt(tmp[i], 16));
                            }
                            this.stringToIPv4(tmp[tmp.length - 1]);
                            this.ipv6.push(this.ipv4[0] * 0xFF + this.ipv4[1]);
                            this.ipv6.push(this.ipv4[2] * 0xFF + this.ipv4[3]);
                        }
                    } else {
                        for (let i = 0; i < tmp.length; i++) {
                            if (i + 1 < tmp.length && "" === tmp[i] && "" === tmp[i + 1]) {
                                for (let j = 0; j < 9 - tmp.length; j++) {
                                    this.ipv6.push(0);
                                }
                            } else {
                                this.ipv6.push(parseInt(tmp[i], 16));
                            }
                        }
                    }
                } else {
                    throw new Error('Invalid IPv6 address');
                }
                break;
            case 8:
                this.ipv6.push(parseInt(tmp[0], 16));
                this.ipv6.push(parseInt(tmp[1], 16));
                this.ipv6.push(parseInt(tmp[2], 16));
                this.ipv6.push(parseInt(tmp[3], 16));
                this.ipv6.push(parseInt(tmp[4], 16));
                this.ipv6.push(parseInt(tmp[5], 16));
                this.ipv6.push(parseInt(tmp[6], 16));
                this.ipv6.push(parseInt(tmp[7], 16));
                break;
        }
    }

    /**
     * Converts the IP address to a string representation.
     * @return {{}} The IP address as a string.
     */
    toString() {
        if (this.type === IPConverter.Type.IPV4) {
            let r = {};
            r["Normal"] = this.ipv4[0] + '.' + this.ipv4[1] + '.' + this.ipv4[2] + '.' + this.ipv4[3];
            r["BigEndian"] = this.ipv4[0] * (255 ^ 3) + this.ipv4[1] * (255 ^ 2) + this.ipv4[2] * 255 + this.ipv4[0];
            r["16Bits"] = "0x" + this.ipv4[0].toString(16) + '.' + "0x" + this.ipv4[1].toString(16)
                + '.' + "0x" + this.ipv4[2].toString(16)
                + '.' + "0x" + this.ipv4[3].toString(16);
            r["8Bits"] = "0" + this.ipv4[0].toString(8)
                + '.' + "0" + this.ipv4[1].toString(8)
                + '.' + "0" + this.ipv4[2].toString(8)
                + '.' + "0" + this.ipv4[3].toString(8);
            return r;
        }
        if ((this.type === IPConverter.Type.IPV6)) {
            let r = {};
            r["Normal"] = "";
            let isFirst = true;
            let isFirstColon = true;
            for (let i = 0; i < this.ipv6.length; i++) {
                if (!isFirst) {
                    r["Normal"] = r["Normal"] + ":";
                } else {
                    isFirst = false;
                }
                r["Normal"] = r["Normal"] + this.ipv6[i].toString(16);
            }
            r["Short"] = "";
            isFirst = true;
            for (let i = 0; i < this.ipv6.length; i++) {
                if (!isFirst) {
                    r["Short"] = r["Short"] + ":";
                } else {
                    isFirst = false;
                }
                if (isFirstColon && 0 === this.ipv6[i]) {
                    isFirstColon = false;
                    for (let j = 0; j < this.ipv6.length - i; j++) {
                        if (0 === this.ipv6[i + j]) {
                            continue;
                        }
                        i = i + j - 1;
                        if (i >= this.ipv6.length) {
                            r["Short"] = r["Short"] + ":";
                        }
                    }
                } else {
                    r["Short"] = r["Short"] + this.ipv6[i].toString(16);
                }
            }
            r["Complex"] = "";
            isFirst = true;
            for (let i = 0; i < 6; i++) {
                if (!isFirst) {
                    r["Complex"] = r["Complex"] + ":";
                } else {
                    isFirst = false;
                }
                r["Complex"] = r["Complex"] + this.ipv6[i].toString(16);
            }
            r["Complex"] = r["Complex"] + ":" + parseInt(this.ipv6[6] / 256) + '.' + parseInt(this.ipv6[6] % 256)
                + '.' + parseInt(this.ipv6[7] / 256) + '.' + parseInt(this.ipv6[7] % 256)
            return r;
        }
    }
}
