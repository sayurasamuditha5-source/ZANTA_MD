const { cmd } = require("../command");

// --- 🛠️ LID/JID ඇඩ්මින් ප්‍රශ්නය විසඳන Function එක ---
const getLastDigits = (jid) => {
    if (!jid) return "";
    let clean = jid.split('@')[0].split(':')[0]; 
    return clean.slice(-8); 
};

// --- 🛡️ PERMISSION CHECKER (අන්තිම ඉලක්කම් 8 පාවිච්චි කර ඇත) ---
const checkPerms = (zanta, m, groupAdmins, isOwner, sender) => {
    const adminDigitsList = (groupAdmins || []).map(ad => getLastDigits(ad));
    const botDigits = getLastDigits(zanta.user.lid || zanta.user.id);
    const userDigits = getLastDigits(m.senderLid || sender);

    const isBotAdmin = adminDigitsList.includes(botDigits);
    const isUserAdmin = adminDigitsList.includes(userDigits);

    if (!isBotAdmin) return "bot_not_admin";
    if (!(isOwner || isUserAdmin)) return "not_admin";
    return "ok";
};

// --- 🔒 MUTE ---
cmd({
    pattern: "mute", alias: ["close"], react: "🔒", desc: "Mute gruop.", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

    await zanta.groupSettingUpdate(from, 'announcement');
    let desc = `\n╭━─━─━─━─━─━╮\n┃    *GROUP SETTINGS*\n╰━─━─━─━─━─━╯\n\n🔒 *Status:* Group Muted\n✅ *Action:* Success\n👤 *By:* @${sender.split('@')[0]}\n\n_Only admins can send messages now._`;
    await zanta.sendMessage(from, { text: desc, mentions: [sender] }, { quoted: mek });
});

// --- 🔓 UNMUTE ---
cmd({
    pattern: "unmute", alias: ["open"], react: "🔓", desc: "Unmute gruop.", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

    await zanta.groupSettingUpdate(from, 'not_announcement');
    let desc = `\n╭━─━─━─━─━─━╮\n┃    *GROUP SETTINGS*\n╰━─━─━─━─━─━╯\n\n🔓 *Status:* Group Unmuted\n✅ *Action:* Success\n👤 *By:* @${sender.split('@')[0]}\n\n_Everyone can send messages now._`;
    await zanta.sendMessage(from, { text: desc, mentions: [sender] }, { quoted: mek });
});

// --- 🚫 KICK (REPLY SUPPORTED) ---
cmd({
    pattern: "kick", 
    react: "🚫", 
    desc: "Remove gruop member.",
    category: "group", 
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    if (!isGroup) return reply("❌ *Groups only.*");

    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

    // 1. Reply කරලා තියෙනවා නම් ඒ කෙනාව ගන්නවා
    // 2. Tag කරලා තියෙනවා නම් ඒ කෙනාව ගන්නවා
    // 3. අංකයක් ටයිප් කරලා තියෙනවා නම් ඒ කෙනාව ගන්නවා
    let user = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);

    if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    if (!user) return reply("❌ *කරුණාකර ඉවත් කළ යුතු පුද්ගලයාගේ මැසේජ් එකකට Reply කරන්න හෝ Tag කරන්න.*");

    try {
        await zanta.groupParticipantsUpdate(from, [user], "remove");

        let desc = `
╭━─━─━─━─━─━─╮
┃    *MEMBER REMOVED*
╰━─━─━─━─━─━─╯

👤 *User:* @${user.split('@')[0]}
✅ *Action:* Successfully Kicked
👮 *By:* @${sender.split('@')[0]}`;

        await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });

    } catch (e) { 
        reply("❌ ඉවත් කිරීමට නොහැක. (ඔහු සමූහයේ නොමැති වීමට හෝ වෙනත් දෝෂයක් විය හැක)"); 
    }
});

// --- ⭐ PROMOTE (REPLY / TAG / NUMBER) ---
cmd({
    pattern: "promote", 
    react: "⭐", 
    desc: "Promote gruop member.",
    category: "group", 
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    try {
        if (!isGroup) return reply("❌ *Groups only.*");

        const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
        if (perm === "bot_not_admin") return reply("❌ *maawa Admin karanna!*");
        if (perm === "not_admin") return reply("❌ *oba Admin kenek newei!*");

        // User logic (Reply -> Tag -> Number)
        let user = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);
        if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        if (!user) return reply("❌ *karunakaara Tag, Reply ho ankaya laba denna.*");

        await zanta.groupParticipantsUpdate(from, [user], "promote");

        let desc = `
╭━─━─━─━─━─╮
┃    *ADMIN PROMOTE*
╰━─━─━─━─━─╯

👤 *User:* @${user.split('@')[0]}
⭐ *Status:* Now Admin
👮 *By:* @${sender.split('@')[0]}`;

        await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });

    } catch (e) { 
        reply("❌ Error: " + e.message); 
    }
});

// --- 📉 DEMOTE (REPLY / TAG / NUMBER) ---
cmd({
    pattern: "demote", 
    react: "📉", 
    desc: "Demote gruop member.",
    category: "group", 
    filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    try {
        if (!isGroup) return reply("❌ *Groups only.*");

        const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
        if (perm === "bot_not_admin") return reply("❌ *maawa Admin karanna!*");
        if (perm === "not_admin") return reply("❌ *oba Admin kenek newei!*");

        // User logic (Reply -> Tag -> Number)
        let user = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null);
        if (!user && q) user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

        if (!user) return reply("❌ *karunakaara Tag, Reply ho ankaya laba denna.*");

        await zanta.groupParticipantsUpdate(from, [user], "demote");

        let desc = `
╭━─━─━─━─━─╮
┃    *ADMIN DEMOTE*
╰━─━─━─━─━─╯

👤 *User:* @${user.split('@')[0]}
📉 *Status:* Admin Removed
👮 *By:* @${sender.split('@')[0]}`;

        await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });

    } catch (e) { 
        reply("❌ Error: " + e.message); 
    }
});

// --- ➕ ADD MEMBER ---
cmd({
    pattern: "add", react: "➕", category: "group", desc: "Add member.", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupAdmins, sender, isOwner, q }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "bot_not_admin") return reply("❌ *මාව Admin කරන්න!*");
    if (perm === "not_admin") return reply("❌ *ඔබ Admin කෙනෙක් නෙවෙයි!*");

    if (!q) return reply("❌ *අංකය ලබා දෙන්න (Ex: .add 947xxxxxxxx).*");
    let user = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    try {
        await zanta.groupParticipantsUpdate(from, [user], "add");
        let desc = `\n╭━─━─━─━─━─╮\n┃    *MEMBER ADDED*\n╰━─━─━─━─━─╯\n\n👤 *User:* @${user.split('@')[0]}\n✅ *Status:* Added Success\n👮 *By:* @${sender.split('@')[0]}`;
        await zanta.sendMessage(from, { text: desc, mentions: [user, sender] }, { quoted: mek });
    } catch (e) { reply("❌ එක් කිරීමට නොහැක. (Privacy Settings හෝ අංකය වැරදියි)"); }
});

// --- 🔗 INVITE ---
cmd({
  pattern: "invite", alias: ["link"], react: "🔗", desc: "Get invite link.", category: "group", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, groupMetadata, groupAdmins }) => {
  try {
      if (!isGroup) return reply("❌ *Groups only.*");
      const adminDigitsList = (groupAdmins || []).map(ad => getLastDigits(ad));
      const botDigits = getLastDigits(zanta.user.lid || zanta.user.id);

      if (!adminDigitsList.includes(botDigits)) return reply("❌ *මාව Admin කරන්න!*");

      const code = await zanta.groupInviteCode(from);
      let ppUrl;
      try { ppUrl = await zanta.profilePictureUrl(from, 'image'); } catch { ppUrl = "https://i.ibb.co/vYm6p6n/whatsapp-group-icon.png"; }

      let desc = `\n╭━─━─━─━─━╮\n┃    *GROUP INVITE*\n╰━─━─━─━─━╯\n\n🎬 *Group:* ${groupMetadata.subject}\n🔗 *Link:* https://chat.whatsapp.com/${code}\n\n_Join using the link above!_`;
      await zanta.sendMessage(from, { image: { url: ppUrl }, caption: desc }, { quoted: mek });
  } catch (e) { reply("❌ Error: " + e.message); }
});

// --- 🔔 TAGALL ---
cmd({
    pattern: "tagall", alias: ["all"], react: "📢", category: "group", desc: "Tag all.", filename: __filename,
}, async (zanta, mek, m, { from, reply, isGroup, participants, groupAdmins, sender, isOwner, q }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    const perm = checkPerms(zanta, m, groupAdmins, isOwner, sender);
    if (perm === "not_admin") return reply("❌ *Admin Only!*");

    let txt = `\n╭━─━─━─━─━─━─━╮\n┃    *📢 TAG ALL MEMBERS*\n╰━─━─━─━─━─━─━╯\n\n📢 *Message:* ${q ? q : 'No message'}\n\n`;
    for (let mem of participants) { txt += `🔘 @${mem.id.split('@')[0]}\n`; }
    await zanta.sendMessage(from, { text: txt, mentions: participants.map(p => p.id) }, { quoted: mek });
});

// --- 👋 LEFT ---
cmd({
    pattern: "left", react: "👋", category: "group", desc: "Leave in gruop.", filename: __filename,
}, async (zanta, mek, m, { from, isGroup, isOwner, reply }) => {
    if (!isGroup) return reply("❌ *Groups only.*");
    if (!isOwner) return reply("❌ *Owner Only!*");
    await reply("👋 *Goodbye! Leaving the group...*");
    await zanta.groupLeave(from);
});
