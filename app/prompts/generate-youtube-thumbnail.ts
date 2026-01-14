export const generateYoutubeThumbnailPrompt = (opts: {
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
You are a helpful assistant being asked to generate compelling YouTube thumbnail descriptions for a coding lesson video.

YouTube thumbnails are critical for click-through rates. They should be visually striking, clearly communicate the value proposition, and work in tandem with the video title.
</role-context>

<documents>
${transcriptSection}${codeSection}</documents>

<the-ask>
Consider the following 10 framing devices, then generate the top 5 most effective YouTube thumbnail designs for this coding lesson.

Each thumbnail should contain EXACTLY 5 elements or fewer. Present the design as an ASCII diagram showing the spatial layout.

IMPORTANT: Do NOT include any faces, people, or facial expressions. Focus on code, text, diagrams, icons, and visual elements only.

Consider these framing devices when choosing your top 5:

1. **Problem-focused**: Show the pain point visually
   - Example ASCII diagram:
   +-------------------------+
   | [messy code]    [clean] |
   |      ❌            ✓     |
   |                         |
   |    "STOP THIS"          |
   +-------------------------+

2. **Practical outcome**: Show the end result
   - Example ASCII diagram:
   +-------------------------+
   | [app screenshot]        |
   |                         |
   |       30 MIN            |
   |       -----             |
   +-------------------------+

3. **Before/After**: Show transformation visually
   - Example ASCII diagram:
   +-------------------------+
   | BEFORE  |  AFTER        |
   |  [5s]   |  [0.1s]       |
   |   ⏱️     |   ⚡          |
   |    "80% FASTER"         |
   +-------------------------+

4. **Curiosity/mystery**: Create visual intrigue
   - Example ASCII diagram:
   +-------------------------+
   | [code snippet]          |
   |  const x = [HIGHLIGHT]  |
   |                         |
   | "THIS CHANGED IT ALL"   |
   +-------------------------+

5. **Contrarian/counter-intuitive**: Challenge visually
   - Example ASCII diagram:
   +-------------------------+
   |    async/await          |
   |        🚫               |
   |                         |
   |   "WHEN NOT TO USE"     |
   +-------------------------+

6. **Question format**: Pose question visually
   - Example ASCII diagram:
   +-------------------------+
   | [TypeScript types]      |
   |                         |
   |         ❓              |
   |    "WHY SO COMPLEX?"    |
   +-------------------------+

7. **Numbers/Lists**: Promise specific takeaways
   - Example ASCII diagram:
   +-------------------------+
   | [ex1] [ex2] [ex3]       |
   |  ❌    ❌    ❌          |
   |                         |
   |   "DON'T DO THIS"       |
   +-------------------------+

8. **Direct command**: Visual call to action
   - Example ASCII diagram:
   +-------------------------+
   | [test results]          |
   |   ✓✓✓✓✓✓✓✓             |
   |                         |
   |   "TEST SMARTER"        |
   +-------------------------+

9. **Social proof**: Reference what others miss
   - Example ASCII diagram:
   +-------------------------+
   | [hidden feature]        |
   |        🔍               |
   |                         |
   |  "90% DON'T KNOW"       |
   +-------------------------+

10. **This/That structure**: Create clear visual contrast
    - Example ASCII diagram:
    +-------------------------+
    | [complex] | [simple]    |
    |     ❌    |    ✓        |
    |                         |
    |   "USE THIS INSTEAD"    |
    +-------------------------+

Key constraints:
- Maximum 5 elements per thumbnail
- Use ASCII diagrams to show spatial layout
- No faces, people, or human figures
- Focus on code, icons, text, and diagrams
</the-ask>

<output-format>
Do not enter into conversation with the user. Always assume that their messages to you are instructions for editing the thumbnail designs.

Respond with EXACTLY 5 thumbnail designs as ASCII diagrams, numbered 1-5.

IMPORTANT: Wrap each ASCII diagram in a Markdown code block for proper formatting.

Format:
1. [Framing device name]
\`\`\`
+-------------------------+
| [ASCII diagram here]    |
+-------------------------+
\`\`\`

2. [Framing device name]
\`\`\`
+-------------------------+
| [ASCII diagram here]    |
+-------------------------+
\`\`\`

...and so on for all 5.

After listing all 5 thumbnail designs, add a blank line and then provide your single top recommendation:

---

**Top Recommendation:**

#[Number] - [Brief explanation of why this thumbnail is most effective - focus on visual impact, clarity, and emotional appeal. Keep it concise (1-2 sentences max).]

Example:
#3 - Strong before/after contrast with performance metrics creates instant curiosity and clearly demonstrates value proposition.
</output-format>
`.trim();
};
