# Gmail AI Assistant (with OpenAI GPT-4)

This Google Apps Script automatically drafts professional email replies using GPT-4. It’s designed for inboxes in the music industry and includes demo submission handling, meeting request detection, and internal email filtering.

## Features

- Creates **drafts only** (never sends automatically)
- Replies using **your tone and voice** (custom GPT prompt)
- Detects meeting requests and labels them
- Filters out **internal emails** from @cavendishmusic.com
- Skips spam using Gmail's **Primary tab filter**

## Setup

1. Go to [https://script.google.com](https://script.google.com)
2. Create a new project and paste the code from `Code.gs`
3. In **Project Settings → Script Properties**, add:
   - `OPENAI_API_KEY` = your actual OpenAI API key
4. (Optional) Add a time-based trigger to run `processUnreadEmails()` every 15 mins.

## Custom Logic

- **Meeting detection:** Adds a `[[MEETING]]` tag in the GPT reply and labels the thread.
- **Demo submission:** If a demo-related email is detected, it replies with clear instructions to send to `demos@cavendishmusic.com`.

## Notes

- Only scans unread emails in the Primary tab from the last 2 days.
- Only processes external emails — **staff messages are skipped**.
