// AnimeTosho ArabicSubs Provider for CloudStream
// Adapted for Hayase Nagatoro with Arabic sub support
// Version 0.0.5 - December 2025

const API_URL = "https://nyaa.si/api/v2/search?";
const SUB_URL = "https://api.opensubtitles.com/api/v1/subtitles"; // For Arabic subs

class AnimeToshoArabicSubsProvider {
    websiteUrl = "https://animetosho.org";
    name = "AnimeTosho ArabicSubs";

    async search(query, page = 1, langs = ["Arabic"]) {
        const params = new URLSearchParams({
            q: query,
            f: "0_0", // All subs
            c: "1_2", // Anime category
            o: "size", // Sort by size desc
            p: page
        });
        const res = await request(API_URL + params.toString(), { headers: { "User-Agent": "CloudStream" } });
        const json = JSON.parse(res);
        const results = [];
        for (const torrent of json.items || []) {
            // Prioritize Hayase/Nagatoro
            if (torrent.name.toLowerCase().includes("nagatoro") || torrent.name.toLowerCase().includes("hayase")) {
                results.unshift(this.buildResult(torrent)); // Pin to top
            } else {
                results.push(this.buildResult(torrent));
            }
        }
        return results;
    }

    buildResult(torrent) {
        return {
            name: torrent.name,
            url: torrent.torrentUrl || torrent.magnetUrl,
            poster: torrent.poster || "",
            quality: this.extractQuality(torrent.name),
            subs: this.fetchSubs(torrent.name)
        };
    }

    async fetchSubs(name) {
        // Fetch Arabic subs via OpenSubtitles (needs API key - add in settings)
        const params = new URLSearchParams({ query: name, languages: "ar" });
        const res = await request(SUB_URL + "?" + params.toString(), {
            headers: { "Api-Key": "YOUR_OPENSUBTITLES_KEY" } // User adds this in CloudStream settings
        });
        const subs = JSON.parse(res).data;
        return subs.length > 0 ? subs[0].attributes.files[0].file_id : null; // First Arabic sub
    }

    extractQuality(name) {
        if (name.includes("2160p")) return "4K";
        if (name.includes("1080p")) return "1080p";
        if (name.includes("720p")) return "720p";
        return "Unknown";
    }

    // Add more methods as needed: homePage, load, etc.
    async load(id) {
        // Load torrent details
        return { episodes: [], links: [] }; // Implement based on torrent
    }
}

// Export for CloudStream
module.exports = AnimeToshoArabicSubsProvider;
