class SimpleBloomFilter {
    constructor(size = 16384, hashCount = 4) {
        this.size = size;
        this.hashCount = hashCount;
        this.bits = new Uint8Array(size);
    }

    _hashes(value) {
        const str = value.toLowerCase().trim();
        let hash1 = 0;
        let hash2 = 5381;
        for (let i = 0; i < str.length; i++) {
            const ch = str.charCodeAt(i);
            hash1 = (hash1 * 31 + ch) >>> 0;
            hash2 = (hash2 * 33) ^ ch;
        }
        const indexes = [];
        for (let i = 0; i < this.hashCount; i++) {
            indexes.push((hash1 + i * hash2) % this.size);
        }
        return indexes;
    }

    add(value) {
        this._hashes(value).forEach((index) => {
            this.bits[index] = 1;
        });
    }

    has(value) {
        return this._hashes(value).every((index) => this.bits[index] === 1);
    }
}

let emailBloomFilter = null;

async function initEmailBloomFilter(UserModel) {
    const count = await UserModel.countDocuments();
    const size = Math.max(16384, count * 20);
    emailBloomFilter = new SimpleBloomFilter(size, 4);

    const cursor = UserModel.find().select('email').lean().cursor();
    for await (const user of cursor) {
        if (user.email) {
            emailBloomFilter.add(user.email);
        }
    }

    return emailBloomFilter;
}

function emailProbablyExists(email) {
    if (!emailBloomFilter) {
        console.log("⚠️ Bloom filter not ready, skipping...");
        return true; // allow DB check
    }
    return emailBloomFilter.has(email);
}

function addEmailToBloom(email) {
    if (emailBloomFilter) {
        emailBloomFilter.add(email);
    }
}

module.exports = {
    initEmailBloomFilter,
    emailProbablyExists,
    addEmailToBloom,
};