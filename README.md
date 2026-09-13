# Kid Choices Connect

Build a responsive, offline-first web app using React, Tailwind CSS, Lucide React icons, and Framer Motion. This app is a dual-mode tool: a gamified, highly visual preference collector for Pre-K/Kindergarten students, and an Admin Analytics Dashboard for teachers.

1. STUDENT AVATAR CREATOR & SELECTOR

- Avatar Builder: Students select a base theme (Space, Farm, Forest, Sea, Superhero) and apply 2-3 fun accessories (hats, glasses, color filters).

- Student Roster Grid: A visual grid showing student names and custom avatars.

- Access Security: Clicking the admin button opens a "Teacher Lock" modal with a simple math question (e.g., "What is 2 + 3?") before prompting for a 4-digit PIN.

2. GAME INTERFACE (KID MODE)

- Mode Toggle: Switch between "Simple Mode" (4-item tournament bracket: 2 pairs face off, then the winners face off) and "Advanced Mode" (4-6 item grid).

- Multilingual Audio: Include UI toggles for English, Spanish, and Arabic. Show a speaker icon next to options for audio pronunciation.

- Speech-to-Text: For "Fill-in-the-Blank" choices, include a microphone button using the Web Speech API to convert spoken words into text instantly.

- Progression & Rewards: A dynamic progress bar that leads to a golden star, triggering an animated confetti celebration and a collectible star badge upon completion.

- Inactivity Warning: A 30-second visual countdown modal appears after 3 minutes of inactivity before resetting to the student selector screen.

3. SCREEN-FREE PRINTABLE GENERATOR

- Add a feature in Admin to render a printable CSS layout containing high-contrast, visual "Choice Cards" and game board templates so teachers can run the activity paper-based and log results manually later.

4. TEACHER ADMIN & ANALYTICAL DASHBOARD

- Roster Management: Manual entry and CSV bulk upload for student names and IDs.

- Custom Categories: Toggle existing categories on/off, create custom categories, or upload custom images per option.

- Visual Analytics: Charts showing class-wide preference distributions (e.g., % of class preferring Dinosaurs vs. Sharks) and an "Automated Group Builder" that clumps 3-4 students together by shared interests.

- "All About Me" Poster Generator: An auto-formatted, single-page visual printable poster summarizing an individual student's current preferences and historical choices over time.

- Offline & Storage: Save state locally using LocalStorage/IndexedDB with a cloud-sync indicator.

Create a clean, functional UI prototype connecting these flows, prioritizing large touch targets suitable for interactive whiteboards and iPads.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d9312fbe-1bce-4d2e-a905-634fa4b4a1d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
