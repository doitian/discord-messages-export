import getRawBody from "raw-body";
import { MessageFlags } from "discord.js";
import nacl from "tweetnacl";

const PING = 1;
const APPLICATION_COMMAND = 2;

const PONG = 1;
const CHANNEL_MESSAGE_WITH_SOURCE = 4;

export const config = {
  api: {
    bodyParser: false,
  },
};

function verify(req, rawBody) {
  const PUBLIC_KEY = process.env.DISCORD_BOT_PUBLIC_KEY;

  const signature = req.headers["x-signature-ed25519"];
  const timestamp = req.headers["x-signature-timestamp"];

  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, "hex"),
      Buffer.from(PUBLIC_KEY, "hex")
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

export default async function interaction(req, res) {
  const rawBody = await getRawBody(req);
  console.debug(req.headers);
  if (!verify(req, rawBody)) {
    return res.status(401).send("invalid request signature");
  }

  const body = JSON.parse(rawBody);
  console.debug(body);
  switch (body.type) {
    case PING:
      res.status(200).json({
        type: PONG,
      });
      break;

    case APPLICATION_COMMAND:
      console.debug(body.data.options);

      let options = new URLSearchParams();
      for (const o of body.data.options) {
        options.append(o.name, o.value);
      }

      res.status(200).json({
        type: CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `${process.env.NEXTAUTH_URL}?${options}`,
          flags: MessageFlags.FLAGS.SUPPRESS_EMBEDS,
        },
      });
      break;

    default:
      res.status(200).json({
        type: CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Open the web page ${process.env.NEXTAUTH_URL}`,
          flags: MessageFlags.FLAGS.SUPPRESS_EMBEDS,
        },
      });
      break;
  }
}
