import { Strings } from "@core/i18n";
import { ApplicationCommand, ApplicationCommandOptionType } from "@lib/api/commands/types";
import { settings } from "@lib/settings";
import { messageUtil } from "@metro/common";
import { findByProps } from "@metro/utils";

const util = findByProps("inspect");
const AsyncFunction = (async () => void 0).constructor;

const ZERO_WIDTH_SPACE_CHARACTER = "\u200B";

function wrapInJSCodeblock(resString: string) {
    return "```js\n" + resString.replaceAll("`", "`" + ZERO_WIDTH_SPACE_CHARACTER) + "\n```";
}

export default () => <ApplicationCommand>{
    name: "eval",
    description: Strings.COMMAND_EVAL_DESC,
    shouldHide: () => settings.enableEvalCommand === true,
    options: [
        {
            name: "code",
            type: ApplicationCommandOptionType.STRING,
            description: Strings.COMMAND_EVAL_OPT_CODE,
            required: true
        },
        {
            name: "async",
            type: ApplicationCommandOptionType.BOOLEAN,
            description: Strings.COMMAND_EVAL_OPT_ASYNC,
        }
    ],
    async execute([code, async], ctx) {
        try {
            const res = util.inspect(async?.value ? await AsyncFunction(code.value)() : eval?.(code.value));
            const trimmedRes = res.length > 2000 ? res.slice(0, 2000) + "..." : res;

            messageUtil.sendBotMessage(ctx.channel.id, wrapInJSCodeblock(trimmedRes));
        } catch (err: any) {
            messageUtil.sendBotMessage(ctx.channel.id, wrapInJSCodeblock(err?.stack ?? err));
        }
    }
};
