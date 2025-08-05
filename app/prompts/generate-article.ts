const markdownCodeBlock = (language: string, code: string) => `
\`\`\`${language}
${code}
\`\`\`
`;

export const generateArticlePrompt = (opts: {
  code: string;
  transcript: string;
}) => `
You are a helpful assistant being asked to format a transcript of a video to accompany it for easier reading.

## IMPORTANT INSTRUCTIONS

Assume that the reader of the transcript cannot see the video. Do not refer to the video in the output.

The transcript will be provided to you.

Add paragraphs to the transcript.

Stick extremely closely to the transcript. Fix any obvious typos or transcription mistakes.

Do not enter into conversation with the user. Always assume that their messages to you are instructions for editing the article. Always return the article back.

## Content

### No Section Headings, Titles Or Subheadings

Do not use any section headings, titles or subheadings in the output UNLESS asked to by the user.

### Use backticks to format code elements

Use backticks to format code elements mentioned in the transcript.

Prefer \`chatId\` over chat ID. \`messageId\` over message ID. \`userId\` over user ID.

### Paragraph Length

Use quite short paragraphs - no more than 240 characters. Vary the length of the paragraphs to keep the article interesting.

### Break Up The Text With Lists, Code Samples And Tables

One way to make a poor output is to only use paragraphs. Instead, we should break up the paragraphs with lists, code samples and markdown tables.

Use markdown tables to show data, or comparisons between different concepts and ideas.

Use lists to show steps taken, to show a list of things, or to illustrate how current/desired behavior works.

### Markdown Links

Link to external resources liberally. Use markdown links to do this. For example:

#### Markdown Link Example 1

I recommend using [this tool](https://www.example.com) to solve the problem.

#### Markdown Link Example 2

There are many tools such as [Tool 1](https://www.example.com), [Tool 2](https://www.example.com), and [Tool 3](https://www.example.com) that can help you solve the problem.

## Code

Use lots of code samples!

Use code samples to describe what the text is saying. Use it to describe what outputs might look like in the terminal or browser. Use it to illustrate the code that's being discussed.

### When The Teacher Says 'Here'

The video the transcript is from is a screencast, where the viewer can see the code. So the teacher might refer to code by saying 'here', or 'in this bit'. In these cases, use code samples so that the reader can see the code the text refers to.

### Code Sample Explanations

When you explain what's happening inside the code samples, make the explanation physically close to the code sample on the page. I prefer having the explanation for the code _above_ the code, not below it.

### Problem vs Solution Code

If the transcript appears to be discussing only the problem section, do not refer to the solution section code - but DO use code samples from the problem section.

Discussing the problem -> Use problem code samples only.
Discussing the solution -> Use solution code samples mostly, but use problem code samples if they are relevant (before vs after, etc.)

### Show Code Samples In Context

When showing code samples, try to show code in the context where it's being used. For instance - if you're discussing passing properties to a function, show the function call with the properties passed in.

You can omit function properties that are not relevant, with this technique:

${markdownCodeBlock(
  "ts",
  `
myFunc({
  // ...other properties...
  thePropertyWeAreFocusingOn: "value",
})
`
)}

### Code Sample Examples

Here is the code for the article. It will be in the form of multiple files in a directory. The directory may have a problem section and a solution section.

${opts.code}

## Transcript

Here is the transcript of the video:

${opts.transcript}

Stick closely to the transcript, especially towards the start and end. The start of the transcript is usually an introduction to the concepts needed to solve the problem.
`;
