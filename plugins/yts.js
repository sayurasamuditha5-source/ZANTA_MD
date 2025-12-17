const { cmd } = require("../command");
const yts = require("yt-search");

cmd({
    pattern: "yts",
    alias: ["ytsearch", "youtubesearch"],
    react: "🔎",
    desc: "Search for YouTube videos.",
    category: "search",
    filename: __filename,
}, async (zanta, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("🔍 *කරුණාකර සෙවිය යුතු නම ලබා දෙන්න.*");

        // ආරම්භක පණිවිඩය යවා එහි ID එක ලබා ගනී
        const loading = await zanta.sendMessage(from, { text: "⌛ *Searching YouTube for you...*" }, { quoted: mek });

        const search = await yts(q);
        const results = search.videos.slice(0, 10);

        if (!results || results.length === 0) {
            return await zanta.sendMessage(from, { text: "☹️ *ප්‍රතිඵල කිසිවක් හමු නොවීය.*", edit: loading.key });
        }

        const botName = global.CURRENT_BOT_SETTINGS.botName;

        // ප්‍රතිඵල පෙළගැස්වීම
        let formattedResults = results.map((v, i) => (
            `🎬 *${i + 1}. ${v.title}*\n📅 ${v.ago} | ⌛ ${v.timestamp}\n👁️ ${v.views.toLocaleString()} views\n🔗 ${v.url}`
        )).join("\n\n");

        const caption = `╭━─━─━─━─━─━─━─━╮\n┃ *${botName} YT SEARCH*\n╰━─━─━─━─━─━─━─━╯\n\n🔎 *Query*: ${q}\n\n${formattedResults}\n\n> *© ${botName}*`;

        // සාර්ථක වූ පසු පණිවිඩය Edit කර රූපය යැවීම
        await zanta.sendMessage(from, { text: "✅ *Search completed!*", edit: loading.key });

        await zanta.sendMessage(from, {
            image: { url: "https://github.com/Akashkavindu/ZANTA_MD/blob/main/images/yt.jpg?raw=true" },
            caption: caption
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        reply("❌ *සෙවීමේදී දෝෂයක් සිදු විය.*");
    }
});
