const { cmd } = require("../command");
const { ytmp4, ytmp3 } = require("@vreden/youtube_scraper"); 
const yts = require("yt-search");
const axios = require('axios'); // ✅ Axius is confirmed
const { sleep } = require("../lib/functions");

// --- Core Helper Function for Download ---
async function downloadYoutubeVreden(url, format, zanta, from, mek, reply, data) {
    if (!url) return reply("❌ Invalid YouTube URL provided.");
    
    // Duration Check Logic
    let durationParts = data.timestamp.split(":").map(Number);
    let totalSeconds = 0;
    
    if (durationParts.length === 3) {
        totalSeconds = durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];
    } else if (durationParts.length === 2) {
        totalSeconds = durationParts[0] * 60 + durationParts[1];
    }

    if (format === 'mp4' && totalSeconds > 600) { 
        return reply("⏳ *Sorry, videos longer than 10 minutes are not supported for stable download (WhatsApp limits).*");
    }
    
    if (format === 'mp3' && totalSeconds > 1800) { 
        return reply("⏳ *Sorry, audio files longer than 30 minutes are not supported.*");
    }

    let tempReplyKey = null;

    try {
        let finalData;
        let quality = (format === 'mp4') ? '360' : '192'; // 360p පමණක් උත්සාහ කරයි
        
        // Initial Message for Status Update
        const initialReply = await reply(`*Starting download (${format.toUpperCase()}):* ${data.title} \n> Quality: ${quality}p 📥`);
        tempReplyKey = initialReply.key;
        
        await sleep(1000); 

        // --- 1. Scraper Link Fetch ---
        if (format === 'mp4') {
            finalData = await ytmp4(url, quality);
        } else if (format === 'mp3') {
            finalData = await ytmp3(url, quality);
        }

        if (!finalData || !finalData.download || !finalData.download.url) {
             return zanta.sendMessage(from, { text: `*❌ Download Failed!* Reason: Could not get a valid download URL from the scraper. (Code: 202)`, edit: tempReplyKey });
        }

        const downloadUrl = finalData.download.url;
        
        // --- 2. Download Link එකෙන් Buffer එක Fetch කිරීම (Axios) ---
        const response = await axios.get(downloadUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000 
        });
        
        const mediaBuffer = response.data; 

        if (!mediaBuffer || mediaBuffer.length === 0) {
            return zanta.sendMessage(from, { text: "*❌ Download Failed!* Reason: Downloaded file is empty or link expired rapidly. 😔", edit: tempReplyKey });
        }

        const caption = `*Download Complete (${format.toUpperCase()})!* \n\n🎬 Title: ${data.title} \n⭐ Quality: ${quality}p`;
        
        // --- 3. Buffer එක Chat එකට යැවීම ---
        if (format === 'mp4') {
            await zanta.sendMessage(
                from, 
                { 
                    video: mediaBuffer, 
                    caption: caption,
                    mimetype: 'video/mp4' 
                }, 
                { quoted: mek }
            );
        } else if (format === 'mp3') {
             await zanta.sendMessage(
                from, 
                { 
                    audio: mediaBuffer, 
                    caption: caption,
                    mimetype: 'audio/mpeg' 
                }, 
                { quoted: mek }
            );
        }

        // Final message
        return zanta.sendMessage(from, { text: `> *Download Complete!* ${format === 'mp4' ? '🎞️' : '🎶'}✅`, edit: tempReplyKey });

    } catch (e) {
        console.error(`Vreden Download Error (${format}):`, e);
        
        let errorText = `*❌ Download Failed!* \n\n*Reason:* Download link expired, Network Error, or Timeout. 😔`;
        
        // Send the final error message
        if (tempReplyKey) {
            zanta.sendMessage(from, { text: errorText, edit: tempReplyKey });
        } else {
            reply(errorText);
        }
    }
}

// --- $ytmp4 Command (Video Download) ---
cmd(
    {
        pattern: "ytmp4",
        alias: ["vid", "ytvideo"],
        react: "🎞️",
        desc: "Downloads a YouTube video as MP4.",
        category: "download",
        filename: __filename,
    },
    async (zanta, mek, m, { from, reply, q }) => {
        if (!q) return reply("*Please provide a YouTube link or search query.* 🔗");
        
        const search = await yts(q);
        const data = search.videos[0];
        
        if (!data) return reply("❌ Could not find the requested video.");
        
        await downloadYoutubeVreden(data.url, 'mp4', zanta, from, mek, reply, data);
    }
);

// --- $ytmp3 Command (Audio Download) ---
cmd(
    {
        pattern: "ytmp3",
        alias: ["audio", "ytaudio"],
        react: "🎶",
        desc: "Downloads a YouTube video as MP3 audio.",
        category: "download",
        filename: __filename,
    },
    async (zanta, mek, m, { from, reply, q }) => {
        if (!q) return reply("*Please provide a YouTube link or search query.* 🔗");
        
        const search = await yts(q);
        const data = search.videos[0];
        
        if (!data) return reply("❌ Could not find the requested video.");
        
        await downloadYoutubeVreden(data.url, 'mp3', zanta, from, mek, reply, data);
    }
);
