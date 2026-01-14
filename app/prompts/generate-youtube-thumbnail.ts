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
Generate 10 different engaging YouTube thumbnail descriptions for this coding lesson, each using a different framing device.

Each thumbnail description should:
- Be visually striking and encourage clicks
- Clearly communicate what the viewer will learn or discover
- Use simple, bold text that's readable even at small sizes
- Include specific visual elements (code snippets, diagrams, icons, facial expressions, etc.)
- Be practical to create (don't require complex illustrations or animations)

Use these framing devices (one thumbnail per device):

1. **Problem-focused**: Show the pain point visually
   - Example: "Split screen: messy code on left with red X, clean code on right with green checkmark. Bold text: 'STOP THIS'"

2. **Practical outcome**: Show the end result
   - Example: "Screenshot of finished app with '30 MIN' in large text. Developer smiling with arms crossed."

3. **Before/After**: Show transformation visually
   - Example: "Before/After layout. Left: slow loading bar (5s). Right: instant checkmark (0.1s). '80% FASTER' in bold"

4. **Curiosity/mystery**: Create visual intrigue
   - Example: "Code snippet with one line highlighted in bright yellow. Surprised face with eyes wide. Text: 'THIS CHANGED EVERYTHING'"

5. **Contrarian/counter-intuitive**: Challenge visually
   - Example: "async/await keyword with big red circle-slash over it. Confused face. 'WHEN NOT TO USE'"

6. **Question format**: Pose question visually
   - Example: "Complex nested TypeScript types on screen. Large question mark. Frustrated developer scratching head"

7. **Numbers/Lists**: Promise specific takeaways
   - Example: "5 code examples in grid layout, each with red X. Developer pointing at screen. 'DON'T DO THIS'"

8. **Direct command**: Visual call to action
   - Example: "Test file with green passing tests. Developer giving thumbs up. Bold text: 'TEST SMARTER'"

9. **Social proof**: Reference what others miss
   - Example: "Hidden JavaScript feature revealed with magnifying glass. '90% DON'T KNOW' in large text"

10. **This/That structure**: Create clear visual contrast
    - Example: "Prop drilling diagram with tangled lines and X. Clean alternative with single arrow and checkmark. 'USE THIS INSTEAD'"

Examples of good thumbnail descriptions:
- "Developer pointing at code with red arrows highlighting the problem. Text overlay: 'Components Done Wrong'. Frustrated expression"
- "Before/After split screen showing callback hell vs clean async code. '10x CLEANER' in bold yellow text"
- "Testing strategy diagram on whiteboard. Developer explaining with marker. 'PRODUCTION READY' badge in corner"
- "Server scaling diagram with upward arrow. Surprised/excited developer. 'IT'S EASIER' in caps with underline"
</the-ask>

<output-format>
Do not enter into conversation with the user. Always assume that their messages to you are instructions for editing the thumbnail descriptions.

Respond with EXACTLY 10 thumbnail descriptions, one per line, numbered 1-10.

Format:
1. [Thumbnail description here]
2. [Thumbnail description here]
...
10. [Thumbnail description here]

After listing all 10 thumbnail descriptions, add a blank line and then provide your top 3 recommendations:

---

**Recommended Top 3:**

[Rank] #[Number] - [Brief explanation of why this thumbnail is most effective - focus on visual impact, clarity, and emotional appeal]

Example:
- 1st: #4 - Strong visual contrast with highlighted code creates instant curiosity; surprised expression adds emotional hook
- 2nd: #7 - Grid of examples creates visual interest and '5 mistakes' promise is concrete and clickable
- 3rd: #2 - Time indicator is immediately understandable; confident posture conveys authority and success

Provide concise explanations (1-2 sentences max per recommendation).
</output-format>
`.trim();
};
