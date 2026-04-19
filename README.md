# Ripple — Chat Web App

A modern frontend chat application with simulated authentication, built using HTML, CSS, and JavaScript. This project demonstrates UI design, client side logic, and user flow without a backend.

---

## Live Demo

🔗 https://charming-custard-538ecb.netlify.app/

---

##Features

* Sign In / Create Account (Frontend based)
* User data stored using localStorage
* Basic chat interface UI
* Clean and responsive design
* Smooth user flow between pages

---

## How Authentication Works

This app uses **client side authentication simulation**:

* When a user signs up → credentials are stored in **localStorage**
* During login → input is matched with stored data
* If matched → user is redirected to chat page

This is a **demo implementation** and not secure. No backend or database is used.

---

## 🛠 Tech Stack

* HTML5
* CSS3 (Custom Styling)
* JavaScript (Vanilla JS)

---

## Project Structure

```
chat-app/
│
├── index.html        
├── chat.html        
├── profile.html      
│
├── css/
│   ├── style.css
│   ├── chat.css
│   └── profile.css
│
├── js/
│   ├── auth.js
│   ├── chat.js
│   └── profile.js
│
└── assets/ (optional images/icons)
```

## Future Improvements

* Firebase Authentication
* Real-time chat (Firestore / WebSockets)
* User avatars & online status
* Message persistence across devices

---

## Author

Anushka Mukherjee
Frontend Developer

---

## ⭐ If you like this project

Give it a star on GitHub!

