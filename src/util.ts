import fs from 'fs';
import crypto from 'crypto';
import * as cheerio from 'cheerio';


export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getConfig() {
    let config = {
        username: "",
        password: "",
        classId: "",
        courseId: "",
        sleepTime: 1,
        cookies: {} as Record<string, string>,
    }

    if (fs.existsSync('config.json'))
        config = { ...config, ...fs.readFileSync('config.json').json(), };
    fs.writeFileSync('config.json', JSON.stringify(config, null, 4));

    return config;
}

export function decodeClassInfoHtml(html: string) {
    const $ = cheerio.load(html);
    return [...$(".course")].map(el => {
        return {
            classId: $(el).find(".clazzId").attr("value") || "",
            courseId: $(el).find(".courseId").attr("value") || "",
            name: $(el).find(".course-name").attr("title") || "",
        }
    });
}

export class AESCipher {
    static AESKey = "u2oh6Vu^HWe4_AES";
    key: Buffer;
    iv: Buffer;

    constructor() {
        this.key = Buffer.from(AESCipher.AESKey, 'utf8');
        this.iv = Buffer.from(AESCipher.AESKey, 'utf8');
    }

    encrypt(plaintext: string) {
        const plaintextBuffer = Buffer.from(plaintext, 'utf8');
        const paddedBuffer = this.pkcs7Padding(plaintextBuffer);
        const blocks = this.splitToDataBlocks(paddedBuffer);

        let ciphertext = Buffer.alloc(0);
        let currentIv = this.iv;
        for (const block of blocks) {
            const cipher = crypto.createCipheriv('aes-128-cbc', this.key, currentIv);
            cipher.setAutoPadding(false);
            const encryptedBlock = Buffer.concat([cipher.update(block), cipher.final()]);
            ciphertext = Buffer.concat([ciphertext, encryptedBlock]);
            currentIv = encryptedBlock;
        }
        return ciphertext.toString('base64');
    }

    decrypt(ciphertext: string) {
        const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
        const blocks = this.splitToDataBlocks(ciphertextBuffer);

        let plaintextBuffer = Buffer.alloc(0);
        let currentIv = this.iv;
        for (const block of blocks) {
            const decipher = crypto.createDecipheriv('aes-128-cbc', this.key, currentIv);
            decipher.setAutoPadding(false);
            const decryptedBlock = Buffer.concat([decipher.update(block), decipher.final()]);
            plaintextBuffer = Buffer.concat([plaintextBuffer, decryptedBlock]);
            currentIv = block;
        }
        const plaintext = plaintextBuffer.toString('utf8');
        return this.pkcs7Unpaid(plaintext);
    }

    pkcs7Padding(s: Buffer, blockSize = 16) {
        const paddingLength = blockSize - (s.length % blockSize);
        const padding = Buffer.alloc(paddingLength, paddingLength);
        return Buffer.concat([s, padding]);
    }

    splitToDataBlocks(byteStr: Buffer, blockSize = 16) {
        const blocks: Buffer[] = [];
        for (let i = 0; i < byteStr.length; i += blockSize) {
            const block = byteStr.subarray(i, i + blockSize);
            blocks.push(block);
        }
        return blocks;
    }

    pkcs7Unpaid(string: string) {
        const paddingLength = string.charCodeAt(string.length - 1);
        return string.slice(0, -paddingLength);
    }
}



export class Session {

    cookie: Record<string, string> = {};
    constructor(cookie = {}) {
        this.cookie = cookie;

    }

    makeHeaders(headers: HeadersInit) {
        return {
            ...headers,
            "Cookie": Object.entries(this.cookie).map(([k, v]) => `${k}=${v}`).join("; "),
        }
    }

    async get(url: string, options: RequestInit = {}) {
        options = {
            ...options,
            method: "GET",
            headers: this.makeHeaders(options.headers || {}),
        };

        const res = await fetch(url, options);
        res.headers.getSetCookie().map(v => v.split(";")[0]).map(v => v.split("=")).forEach(([k, v]) => this.cookie[k] = v);
        return res;
    }

    async post(url: string, options: RequestInit = {}) {
        options = {
            ...options,
            method: "POST",
            headers: this.makeHeaders(options.headers || {}),
        };

        const res = await fetch(url, options);
        res.headers.getSetCookie().map(v => v.split(";")[0]).map(v => v.split("=")).forEach(([k, v]) => this.cookie[k] = v);
        return res;
    }

}