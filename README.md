# ZeroQueue - Lab Resource Manager

ZeroQueue is a real-time terminal booking and lab occupancy management system designed for educational institutions.

## 🚀 Impactathon Special Features
- **Real-Time Visualization**: Instant updates of seat status (Occupied, Booked, Maintenance, Available).
- **Proactive Notifications**: Students get alerted as soon as a seat becomes available in a full lab.
- **Admin Control**: Force-release seats to prevent long idle sessions.
- **Cross-Platform**: Built as a PWA, usable on Web, Android, and iOS.

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion (for smooth animations).
- **Backend / Database**: Google Firebase (Firestore) - provides real-time data synchronization across all users.
- **Authentication**: Anonymous session-based auth with student/admin roles.

---

## 💻 How to run locally in VS Code

1. **Prerequisites**:
   - Install [Node.js](https://nodejs.org/) (LTS recommended).
   - Install [Visual Studio Code](https://code.visualstudio.com/).

2. **Setup**:
   - Open VS Code and open your project folder.
   - Open a terminal in VS Code (`Ctrl + ~`).
   - Run `npm install` to install all dependencies.

3. **Development**:
   - Run `npm run dev` to start the development server.
   - Open `http://localhost:3000` in your browser.

4. **Building for Production**:
   - Run `npm run build` to generate the production-ready files in the `dist` folder.

---

## 🔑 Demo Access Credentials
For the Impactathon demonstration, the following access rules apply:

- **Student Access**: 
  - **Username**: Use any ID ending in `@git.edu` (e.g., `student@git.edu`).
  - **Password**: Any password (min 8 characters).
- **Admin Access**:
  - **Username**: `Srushti_S`
  - **Password**: `admin@ZQ`

---

## 🔒 Firebase Management
Your database is live on Google Cloud. You can manage users, check history, and view real-time bookings here:

**Firestore Database Link**:
[Go to Firebase Console](https://console.firebase.google.com/project/gen-lang-client-0949204620/firestore/databases/ai-studio-82021dd7-581a-49ea-b249-be1744de695e/data)

**To rename the project**:
1. Go to the [Firebase Console Settings](https://console.firebase.google.com/project/gen-lang-client-0949204620/settings/general).
2. Click the edit icon next to the Project name and change it to **ZeroQueue - Lab Resource Manager**.

---

## 📱 Mobile Installation (PWA)
1. Open the shared App URL on your phone's browser (Chrome for Android, Safari for iOS).
2. **Android**: Tap the menu (three dots) and select "Install app" or "Add to Home screen".
3. **iOS**: Tap the "Share" button and select "Add to Home Screen".
4. The app will now appear on your home screen with the **ZeroQueue** icon and launch without the browser interface.
