const PING = 1;
const APPLICATION_COMMAND = 2;
const MESSAGE_COMPONENT = 3;
const APPLICATION_COMMAND_AUTOCOMPLETE = 4;
const MODAL_SUBMIT = 5;

const PONG = 1;
const CHANNEL_MESSAGE_WITH_SOURCE = 4;

export default async function interaction(req, res) {
  switch (req.body.type) {
    case PING:
      res.status(200).json({
        type: PONG,
      });
      break;

    default:
      res.status(200).json({
        data: {
          tts: false,
          content: `Open the web page ${process.env.NEXTAUTH_URL}`,
          embeds: [],
          allowed_mentions: { parse: [] },
        },
      });
      break;
  }
}
