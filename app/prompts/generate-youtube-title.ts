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
Generate 10 different engaging YouTube titles for this coding lesson, each using a different framing device.

Each title should:
- Be compelling and encourage clicks
- Clearly indicate what the viewer will learn or discover
- Use conversational, engaging language
- Capitalize important words (title case)
- Be concise (aim for 60-70 characters for optimal display)

Use these framing devices (one title per device):

1. **Problem-focused**: Identify the pain point immediately
   - Example: "Stop reading paragraphs from Claude Code"

2. **Practical outcome**: Promise a specific result
   - Example: "Make Claude Code 10x more readable with one line"

3. **Before/After revelation**: Show transformation
   - Example: "I changed one setting in Claude Code and look what happened"

4. **Curiosity/mystery**: Create intrigue
   - Example: "The hidden setting that fixes Claude Code verbosity"

5. **Contrarian/counter-intuitive**: Challenge assumptions
   - Example: "Why you should tell Claude to sacrifice grammar"

6. **Question format**: Pose the problem as a question
   - Example: "Why does Claude Code give you essays instead of answers?"

7. **Numbers/Lists**: Promise specific takeaways
   - Example: "3 settings that transform Claude Code output"

8. **Direct command**: Tell them what to do
   - Example: "Get faster answers from Claude Code"

9. **Social proof**: Reference what others don't know
   - Example: "Most people don't know Claude Code can do this"

10. **This/That structure**: Create clear contrast
    - Example: "This one line transforms Claude Code output"

Examples of good YouTube titles:
- "How I use Claude Code for real engineering"
- "Most devs don't understand how context windows work"
- "Ship working code while you sleep with the Ralph Wiggum technique"
- "Frontend is HARDER for AI than backend (here's how to fix it)"
</the-ask>

<output-format>
Do not enter into conversation with the user. Always assume that their messages to you are instructions for editing the titles.

Respond with EXACTLY 10 titles, one per line, numbered 1-10.

Format:
1. [Title text here]
2. [Title text here]
...
10. [Title text here]

Do not include any other text, explanations, or quotation marks around the titles.
</output-format>
`.trim();
};
