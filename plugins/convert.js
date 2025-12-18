const { cmd } = require("../command");
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');

ffmpeg.setFfmpegPath(ffmpegPath);

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// 🗝️ Remove.bg API Key (Get from remove.bg)
const REMOVE_BG_API_KEY = "vGc2DJRV25qEAWbU26YaQV2R"; 

/**
 * Media බාගත කිරීමේ ක්‍රියාවලිය
 */
const downloadMedia = async (message, type) => {
    try {
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    } catch (e) {
        return null;
    }
};

/**
 * Media Type එක හරියටම සොයාගැනීමේ logic එක (Deep Search)
 */
const getMedia = (quoted) => {
    if (!quoted) return null;
    let msg = quoted.message || quoted.msg || quoted;
    
    if (msg.imageMessage) return { data: msg.imageMessage, type: 'image' };
    if (msg.videoMessage) return { data: msg.videoMessage, type: 'video' };
    if (msg.stickerMessage) return { data: msg.stickerMessage, type: 'sticker' };
    
    let context = msg.extendedTextMessage?.contextInfo?.quotedMessage;
    if (context) {
        if (context.imageMessage) return { data: context.imageMessage, type: 'image' };
        if (context.videoMessage) return { data: context.videoMessage, type: 'video' };
        if (context.stickerMessage) return { data: context.stickerMessage, type: 'sticker' };
    }
    
    if (quoted.imageMessage) return { data: quoted.imageMessage, type: 'image' };
    if (quoted.videoMessage) return { data: quoted.videoMessage, type: 'video' };
    if (quoted.stickerMessage) return { data: quoted.stickerMessage, type: 'sticker' };
    
    return null;
};

// 1. 🖼️ IMAGE/VIDEO TO STICKER (.s)
cmd({
    pattern: "s",
    alias: ["sticker", "st"],
    react: "🌟",
    category: "convert",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, quoted }) => {
    try {
        let media = getMedia(quoted);
        if (!media || (media.type !== 'image' && media.type !== 'video')) return reply("*කරුණාකර ඡායාරූපයකට හෝ වීඩියෝවකට Reply කරන්න!* ❌");

        reply("*ස්ටිකර් එක සාදමින් පවතී...* ⏳");
        const buffer = await downloadMedia(media.data, media.type);
        const inPath = path.join(tempDir, `temp_${Date.now()}`);
        const outPath = path.join(tempDir, `st_${Date.now()}.webp`);
        fs.writeFileSync(inPath, buffer);

        ffmpeg(inPath)
            .on('end', async () => {
                await zanta.sendMessage(from, { sticker: fs.readFileSync(outPath), packname: "ZANTA-MD", author: "Sticker-Bot" }, { quoted: mek });
                fs.unlinkSync(inPath); fs.unlinkSync(outPath);
            })
            .on('error', (e) => { reply("Error!"); fs.unlinkSync(inPath); })
            .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(320-iw)/2:(320-ih)/2:color=white@0.0"])
            .save(outPath);
    } catch (e) { reply("Error!"); }
});

// 2. 🎡 STICKER TO IMAGE (.toimg)
cmd({
    pattern: "toimg",
    react: "🖼️",
    category: "convert",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, quoted }) => {
    try {
        let media = getMedia(quoted);
        if (!media || media.type !== 'sticker') return reply("*කරුණාකර ස්ටිකර් එකකට Reply කරන්න!* ❌");

        reply("*පින්තූරය ලබාගනිමින් පවතී...* ⏳");
        const buffer = await downloadMedia(media.data, 'sticker');
        const inPath = path.join(tempDir, `st_in_${Date.now()}.webp`);
        const outPath = path.join(tempDir, `img_${Date.now()}.png`);
        fs.writeFileSync(inPath, buffer);

        ffmpeg(inPath)
            .on('end', async () => {
                await zanta.sendMessage(from, { image: fs.readFileSync(outPath), caption: "> *ZANTA-MD Convert*" }, { quoted: mek });
                fs.unlinkSync(inPath); fs.unlinkSync(outPath);
            })
            .save(outPath);
    } catch (e) { reply("Error!"); }
});

// 3. 🎶 VIDEO TO MP3 (.tomp3)
cmd({
    pattern: "tomp3",
    alias: ["toaudio"],
    react: "🎶",
    category: "convert",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, quoted }) => {
    try {
        let media = getMedia(quoted);
        if (!media || media.type !== 'video') return reply("*වීඩියෝවකට Reply කරන්න!* ❌");

        reply("*MP3 එක සාදමින් පවතී...* ⏳");
        const buffer = await downloadMedia(media.data, 'video');
        const inPath = path.join(tempDir, `vid_${Date.now()}.mp4`);
        const outPath = path.join(tempDir, `aud_${Date.now()}.mp3`);
        fs.writeFileSync(inPath, buffer);

        ffmpeg(inPath).toFormat('mp3').audioBitrate('128k')
            .on('end', async () => {
                await zanta.sendMessage(from, { audio: fs.readFileSync(outPath), mimetype: 'audio/mpeg', fileName: `ZANTA.mp3` }, { quoted: mek });
                fs.unlinkSync(inPath); fs.unlinkSync(outPath);
            })
            .on('error', () => { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); })
            .save(outPath);
    } catch (e) { reply("Error!"); }
});

// 4. 🔗 MEDIA TO URL (.tourl)
cmd({
    pattern: "tourl",
    alias: ["url"],
    react: "🔗",
    category: "convert",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, quoted }) => {
    try {
        let media = getMedia(quoted);
        if (!media || (media.type !== 'image' && media.type !== 'video')) return reply("*Media එකකට Reply කරන්න!* ❌");

        reply("*URL එක සාදමින් පවතී...* ⏳");
        const buffer = await downloadMedia(media.data, media.type);
        const form = new FormData();
        form.append('fileToUpload', buffer, 'zanta.jpg');
        form.append('reqtype', 'fileupload');

        const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
        reply(`*🔗 Media URL:* \n${res.data}`);
    } catch (e) { reply("*Error uploading media!*"); }
});

// 5. 🏁 TEXT TO QR (.toqr)
cmd({
    pattern: "toqr",
    react: "🏁",
    category: "convert",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, args }) => {
    try {
        let text = args.join(" ");
        if (!text) return reply("*වචනයක් හෝ ලින්ක් එකක් ලබාදෙන්න!* ❌");
        let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
        await zanta.sendMessage(from, { image: { url: qrUrl }, caption: `*QR for:* ${text}` }, { quoted: mek });
    } catch (e) { reply("Error!"); }
});

// 6. ✂️ REMOVE BG (.removebg)
cmd({
    pattern: "removebg",
    alias: ["rmbg"],
    react: "✂️",
    category: "convert",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, quoted }) => {
    try {
        let media = getMedia(quoted);
        if (!media || media.type !== 'image') return reply("*ඡායාරූපයකට Reply කරන්න!* ❌");

        reply("*පසුබිම ඉවත් කරමින් පවතී...* ⏳");

        const buffer = await downloadMedia(media.data, 'image');
        if (!buffer) return reply("*ඡායාරූපය බාගත කිරීම අසාර්ථකයි!*");

        const form = new FormData();
        form.append('size', 'auto');
        form.append('image_file', buffer, { filename: 'image.jpg' });

        const res = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
            headers: { 
                ...form.getHeaders(), 
                'X-Api-Key': REMOVE_BG_API_KEY // මෙහිදී ඉහළින් ඇති Key එක ස්වයංක්‍රීයව ගනු ලබයි
            },
            responseType: 'arraybuffer'
        });

        await zanta.sendMessage(from, { 
            image: Buffer.from(res.data), 
            caption: "> *Background Removed by ZANTA-MD*" 
        }, { quoted: mek });

    } catch (e) { 
        console.error(e);
        reply("*Error! API Key එක වැරදි හෝ මාසික සීමාව (Credits 50) අවසන් වී තිබිය හැක.*"); 
    }
});

// 7. 🎨 AI IMAGE GENERATOR (.gen)
cmd({
    pattern: "genimg",
    alias: ["aiimg", "draw"],
    react: "🎨",
    category: "media",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, args }) => {
    try {
        let text = args.join(" ");
        if (!text) return reply("*කරුණාකර ඔබට අවශ්‍ය පින්තූරය ගැන විස්තරයක් ලබා දෙන්න!* ❌\n\n*උදාහරණය:* .gen a futuristic city in Sri Lanka*");

        reply("*ඔබේ පින්තූරය නිර්මාණය කරමින් පවතී...* ⏳");

        let apiUrl = `https://pollinations.ai/p/${encodeURIComponent(text)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;

        await zanta.sendMessage(from, { 
            image: { url: apiUrl }, 
            caption: `*🎨 AI Image Generated By ZANTA-MD*\n\n*Prompt:* ${text}\n\n> *No API Key Needed - Unlimited!*` 
        }, { quoted: mek });

    } catch (e) {
        reply("*Error generating AI image!* ❌");
    }
});

module.exports = {};
