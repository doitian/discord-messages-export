import { getSession } from "next-auth/react";
import { Client, Intents, Permissions, MessageMentions } from "discord.js";

function unauthorized(res) {
  return res.status(401).json({
    code: 0,
    message: "401: Unauthorized",
  });
}

function escapeText(text) {
  return text.replace(/[\[\]]/g, "\\$&");
}

function scrubText(text) {
  return text.replace(/[\u2028]/g, "");
}

function indentText(text, prefix) {
  if (text !== "") {
    return prefix + text.replace(/(\r|\n|\r\n)/g, `\n${prefix}`);
  }

  return text;
}

function formatOneEmbed(embed) {
  const lines = [];
  if (embed.title !== null) {
    const title =
      embed.url === null
        ? `**${escapeText(embed.title)}**`
        : `[**${escapeText(embed.title)}**](${embed.url})`;
    lines.push(`    > ${title}`);
  } else if (embed.url !== null) {
    lines.push(`    > <${embed.url}>`);
  }
  if (embed.description !== null && embed.description.trim() !== null) {
    if (lines.length > 0) {
      lines.push(`    >`);
    }
    lines.push(indentText(scrubText(embed.description || ""), "    > "));
  }
  const thumbnail = embed.thumbnail;
  if (thumbnail !== null) {
    lines.push("    >");
    lines.push(`    > ![](${thumbnail.url})`);
  }
  return lines.join("\n");
}

function formatEmbeds(embeds) {
  if (embeds.length > 0) {
    return "\n" + embeds.map(formatOneEmbed).join("\n\n") + "\n";
  }

  return "";
}

function formatAttachments(attachments) {
  const lines = [];

  for (const attachment of attachments) {
    lines.push('```');
    lines.push(JSON.stringify(attachment));
    lines.push('```');
    if (attachment.width !== undefined && attachment.width !== null) {
      lines.push(`   ![](${attachment.proxyURL})`);
    } else {
      lines.push(`   [${attachment.name}](${attachment.proxyURL})`);
    }
  }

  return lines.join("\n");
}

function handleUserMentions(discord, text) {
  return text.replace(MessageMentions.USERS_PATTERN, (_match, id) => {
    const user = discord.users.cache.get(id);
    return user.username;
  });
}

function formatOneMessage(discord, message) {
  const embeds = formatEmbeds(message.embeds);
  const attachments = formatAttachments(message.attachments);
  return [
    `- **${message.author.username}** (${message.createdAt.toLocaleString()}):`,
    "",
    indentText(
      scrubText(handleUserMentions(discord, message.content || "")),
      "    "
    ),
    embeds,
    attachments
  ].join("\n");
}

function formatMessages(discord, messages) {
  return messages
    .reverse()
    .map((m) => formatOneMessage(discord, m))
    .join("\n");
}

async function canRead(discord, { userId, channelId, guildId }) {
  const channel = await discord.channels.fetch(channelId);
  const guid = await discord.guilds.fetch(guildId);
  const member = await guid.members.fetch(userId);
  const permissions = channel.permissionsFor(member);
  return permissions.any(Permissions.FLAGS.VIEW_CHANNEL);
}

async function serveMessages(
  discord,
  { url, limit, context, messageId, channelId },
  res
) {
  const options = { limit };
  options[context] = messageId;

  const channel = await discord.channels.fetch(channelId);
  const messages = await channel.messages.fetch(options);

  res.status(200).json({
    markdown: `[※ Open Thread in Discord](${url})\n\n${formatMessages(
      discord,
      Array.from(messages.values())
    )}`,
  });
}

export default async function async(req, res) {
  const session = await getSession({ req });
  if (session) {
    const [guildId, channelId, messageId] = req.query.url.split("/").slice(-3);
    const { userId } = session;
    const discord = new Client({ intents: [Intents.FLAGS.GUILDS] });
    await discord.login(process.env.DISCORD_BOT_TOKEN);

    try {
      if (await canRead(discord, { userId, channelId, guildId })) {
        return serveMessages(
          discord,
          { limit: 4, context: "around", ...req.query, channelId, messageId },
          res
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return unauthorized(res);
}
