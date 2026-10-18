# Privacy

Ollie is a local-first Chrome extension. It has no project-owned backend,
accounts, analytics, advertising, or telemetry.

## Data stored on your device

Ollie uses `chrome.storage.local` to keep:

- focus and break durations
- the current session, including its task, timestamps, and cached commentary
- the optional OpenAI API key you enter

The task and cached commentary are cleared from the active session when you
stop it. The API key remains until you choose **Remove key** or uninstall the
extension.

The API key is available only to the extension's trusted contexts. Ollie's
background service worker reads it when making an OpenAI request; the key is
never sent to webpage content scripts or written to logs. Browser-local
storage is a practical bring-your-own-key choice for this prototype, not a
secure secret vault.

## Network requests

If you start a session with both a non-empty task and a saved API key, Ollie's
background service worker sends the task to the OpenAI Responses API to create
one set of session commentary. OpenAI's handling of that request is governed
by its own terms and privacy policies.

If the task is blank, no OpenAI request is made. If no key is saved or the
request fails, Ollie uses bundled local dialogue.

Ollie does not send browsing history, visited hostnames, distraction matches,
timer activity, or page contents to OpenAI or to the project author.

## Page access

Ollie runs a content script on ordinary HTTP and HTTPS pages so it can display
the companion. It reads the active tab's URL locally to compare its hostname
with the bundled distraction list. It does not read or retain page content.

The overlay is isolated in Shadow DOM, does not modify page-owned nodes, and
does not intentionally block normal page interaction.

## Removing local data

Use **Remove key** in Ollie's popup to delete the stored API key. Uninstalling
the extension removes its Chrome-managed local storage.

For implementation details, see the
[architecture notes](docs/architecture-notes.md).
