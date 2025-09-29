type ParsedParams = {
  /**
   * weather or not profile should be extended (only supported by some commands)
   */
  extended: boolean;
  command: string;
  user: {
    value: string;
    type: "discordId" | "osuId" | "osuUsername";
  } | null;
};

export function commandParser(msg: string) {
  const params: ParsedParams = {
    extended: false, // profile
    command: "",
    user: null,
  };
  
  const tokens = msg.substring(1).split(" "); // removing the prefix
  if (tokens.length === 0) {
    throw new Error("Empty Msg");
  }
  const command = tokens[0];
  const args = tokens.slice(1);
  params.extended = args.includes("--extended");
  params.command = command as string;
  const user = args
    .map((a) => {
      if (a.startsWith("--")) return null;
      if (a.startsWith("<@")) {
        return {
          value: a.substring(2, a.length - 1),
          type: "discordId",
        };
      }
      if (Number.isNaN(Number(a))) {
        return {
          value: a,
          type: "osuUsername",
        };
      }
      return {
        value: a,
        type: "osuId",
      };
    })
    .filter((a) => a !== null)
    .at(0) as ParsedParams["user"] | undefined;

  if (user) {
    params.user = user;
  }

  return params;
}
