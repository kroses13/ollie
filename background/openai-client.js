import { isValidCommentary, normalizeCommentary } from "../shared/commentary.js";

export const OPENAI_CONFIGURATION = Object.freeze({
  endpoint: "https://api.openai.com/v1/responses",
  model: "gpt-5.6-luna",
  timeoutMs: 8_000,
});

const COMMENTARY_SCHEMA = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["greeting", "idle", "distracted", "break", "celebrate"],
  properties: {
    greeting: { type: "string" },
    idle: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 2,
    },
    distracted: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 2,
    },
    break: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 2,
    },
    celebrate: { type: "string" },
  },
});

export async function generateCommentary({ apiKey, task, fetchImpl = fetch }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    OPENAI_CONFIGURATION.timeoutMs,
  );

  try {
    const response = await fetchImpl(OPENAI_CONFIGURATION.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_CONFIGURATION.model,
        store: false,
        max_output_tokens: 320,
        instructions:
          "You are Ollie, a warm, mischievous pixel octopus focus companion. " +
          "Write concise, supportive, task-specific lines. Never shame the user.",
        input: `The user's focus task is: ${task}`,
        text: {
          format: {
            type: "json_schema",
            name: "ollie_session_commentary",
            strict: true,
            schema: COMMENTARY_SCHEMA,
          },
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("OpenAI request failed.");
    }

    const responseBody = await response.json();
    const outputText = extractOutputText(responseBody);
    const commentary = JSON.parse(outputText);
    if (!isValidCommentary(commentary)) {
      throw new Error("OpenAI returned invalid commentary.");
    }

    return normalizeCommentary(commentary);
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractOutputText(responseBody) {
  if (typeof responseBody?.output_text === "string") {
    return responseBody.output_text;
  }

  for (const outputItem of responseBody?.output ?? []) {
    for (const contentItem of outputItem?.content ?? []) {
      if (
        contentItem?.type === "output_text" &&
        typeof contentItem.text === "string"
      ) {
        return contentItem.text;
      }
    }
  }

  throw new Error("OpenAI response did not contain commentary.");
}
