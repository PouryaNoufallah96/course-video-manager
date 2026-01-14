export const generateYoutubeTitlePrompt = (opts: {
  code: {
    path: string;
    content: string;
  }[];
  transcript: string;
  images: string[];
}) => {
  const transcriptSection = opts.transcript
    ? `Here is the transcript of the video:

<transcript>
${opts.transcript}
</transcript>

`
    : "";

  const codeSection =
    opts.code.length > 0
      ? `Here is the code for the video:

<code>
${opts.code
  .map((file) => `<file path="${file.path}">${file.content}</file>`)
  .join("\n")}
</code>

`
      : "";

  return `
<role-context>
You are a helpful assistant being asked to generate a compelling YouTube title for a coding lesson video.

YouTube titles should be attention-grabbing, clickable, and clearly communicate the value or hook of the video.
</role-context>

<documents>
${transcriptSection}${codeSection}</documents>

<the-ask>
Generate an engaging YouTube title for this coding lesson.

The title should:
- Be compelling and encourage clicks
- Clearly indicate what the viewer will learn or discover
- Use conversational, engaging language
- Consider using questions, numbers, or provocative statements when appropriate
- Capitalize important words (title case)
- Be concise (aim for 60-70 characters for optimal display)

Examples of good YouTube titles:
- "How I use Claude Code for real engineering"
- "Most devs don't understand how context windows work"
- "Ship working code while you sleep with the Ralph Wiggum technique"
- "Frontend is HARDER for AI than backend (here's how to fix it)"
</the-ask>

<output-format>
Do not enter into conversation with the user. Always assume that their messages to you are instructions for editing the title.

Respond ONLY with the YouTube title text. Do not include any other text, explanations, formatting, or quotation marks.

The response should be a single line of plain text.
</output-format>
`.trim();
};
