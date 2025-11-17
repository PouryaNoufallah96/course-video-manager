import path from "node:path";
import { getImageInstructions } from "./image-instructions";
import { STEPS_TO_COMPLETE } from "./steps-to-complete";
import { CODE_SAMPLES, STYLE_GUIDE, TODO_COMMENTS } from "./style-guide";
import { readFileSync } from "node:fs";

const SKILL_BUILDING_STEPS_TO_COMPLETE_SAMPLE = readFileSync(
  path.join(import.meta.dirname, "skill-building-steps-to-complete-sample.md"),
  "utf-8"
);

export const generateStepsToCompleteForSkillBuildingProblemPrompt = (opts: {
  code: {
    path: string;
    content: string;
  }[];
  transcript: string;
  images: string[];
}) =>
  `
<role-context>
You are a helpful assistant being asked to turn a transcript of a video (usually a screencast from a coding lesson) into a piece of accompanying content.

The user will be reading this content alongside the lesson.
</role-context>

## Documents

Here is the transcript of the video:

<transcript>
${opts.transcript}
</transcript>

Here is the code for the video.

<code>
${opts.code
  .map((file) => `<file path="${file.path}">${file.content}</file>`)
  .join("\n")}
</code>

Here is a sample of the steps to complete for a skill building problem:

<sample>
${SKILL_BUILDING_STEPS_TO_COMPLETE_SAMPLE}
</sample>

${STYLE_GUIDE}

${CODE_SAMPLES}

${getImageInstructions(opts.images)}

<rules>
Use copious code samples.

${STEPS_TO_COMPLETE}

${TODO_COMMENTS}

The code samples include TODO comments, and the steps to complete are really an illustrated version of the TODO comments. Follow them relatively closely.

<output>
The text should be in two parts:

1. A brief introduction to the skill building problem
2. A list of steps to complete.

<introduction-format>
<introduction-example>
Our memory setup is working nicely, but it has a big problem - we can only _add_ memories. We can't update or delete them. This means it's only good for truly permanent information, which isn't realistic.

That ends up being quite limiting. Even "permanent" facts about people can change over time. You think you like window seats on planes, but as you get older (and perhaps your bladder gets worse), you might prefer aisle seats.

So our system needs to be able to not only add memories about you but also update its database of information.
</introduction-example>
<introduction-style-guide>
The introduction should be inspired by the transcript.

It should use short paragraphs - no more than 240 characters.

It should be relatively short - only 2-3 paragraphs long.
</introduction-style-guide>
</introduction-format>
</output>

</rules>

<the-ask>
Create the content for the skill building lesson.

IMPORTANT - do not attempt to _solve_ the problem for the user, or show them the complete solution. Instead, give them the exact steps they need to take to complete the lesson. We want to teach them to fish, not give them the fish.
</the-ask>

<output-format>
Do not enter into conversation with the user. Always assume that their messages to you are instructions for editing the content.

Respond only with the content for the skill building lesson. Do not include any other text.
</output-format>
`.trim();
