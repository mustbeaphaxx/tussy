
# DocuSpark - Smart Note Taking

DocuSpark is a modern note-taking application that allows you to organize thoughts, highlight key terms, and manage universal explanations across all your documents.

## ✨ Features

- **Cloud Sync:** Real-time persistence using Firebase Firestore.
- **Universal Explanations:** Define a term once, and it highlights everywhere it appears in your notes.
- **Selection Mode:** Highlight any text to quickly link it to a term's definition.
- **Smart Uploads:** Import `.docx` and `.txt` files directly into your workspace.
- **Secure Auth:** Anonymous access with the option to link to a Google account.

## 🚀 Getting Started

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Firebase:**
   - Create a project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Firestore** and **Authentication** (Google, Anonymous, and Email/Password).
   - Copy your Firebase config and paste it into `src/firebase/config.ts`.

3. **Run the server:**
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Framework:** Next.js 15
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Styling:** Tailwind CSS + ShadCN UI
