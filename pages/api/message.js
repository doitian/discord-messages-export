import { getSession } from "next-auth/react";
import { Client, Intents, Channel, Permissions } from "discord.js";

function unauthorized(res) {
  return res.status(401).json({
    code: 0,
    message: "401: Unauthorized",
  });
}

function escape(text) {
  return text.replace(/[\[\]]/g, "\\$&");
}

function indent(text, prefix) {
  if (text !== "") {
    return prefix + text.replace(/(\r|\n|\r\n)/g, `\n${prefix}`);
  }

  return text;
}

function formatOneEmbed(embed) {
  const lines = [];
  const title =
    embed.url === null
      ? `**${escape(embed.title)}**`
      : `[**${escape(embed.title)}**](${embed.url})`;
  lines.push(`    > ${title}`);
  lines.push(`    >`);
  lines.push(indent(embed.description, "    > "));
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

function formatOne(message) {
  const embeds = formatEmbeds(message.embeds);
  return [
    `- **${message.author.username}** (${message.createdAt.toLocaleString()}):`,
    "",
    indent(message.content, "    "),
    embeds,
  ].join("\n");
}

function format(messages) {
  return messages.reverse().map(formatOne).join("\n");
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
    markdown: `[※ Open Thread in Discord](${url})\n\n${format(
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
          { ...req.query, channelId, messageId },
          res
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  return unauthorized(res);
}
