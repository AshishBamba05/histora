# 🕰️ Histora ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Interactive Timeline Explorer for U.S. History** 

**Live App**: https://abamba-histbytz-sdsq.onrender.com/

This project is licensed under the [MIT License](./LICENSE) © 2025 Ashish Bamba.

---

## 📌 Overview

**Histora** is a full-stack interactive history explorer built with `ReactJS` + `Vite` on the frontend and `NodeJS` + `ExpressJS` on the backend. Users can search key historical events occurring between 1492 and 2025 by keyword or date, and the backend dynamically retrieves matching results from a `MongoDB`-backed NoSQL dataset. 
- 🔤 **Keyword search**: e.g., `civil rights`, `World War`
- 📅 **Date search**: e.g., `7/4/1776`, `4/09/1865`

The app maps your input to a **relevant historical period** and a **specific U.S. event**, providing clear, concise context.

---

## 🎯 Core Features

- 🧠 Intelligent "Did you mean?" suggestions powered by dynamic programming algorithm
- 📆 Mapped to both general historical era + specific event
- ⚡ Fast, lightweight UI with Vite + React
- 🗄️ Dynamic event retrieval from MongoDB-backed NoSQL dataset via Express API
- 🧭 Educational for students, teachers, and trivia lovers

---

## ⚙️ Tech Stack

| Layer        | Technology         |
|--------------|--------------------|
| **Frontend**     | ReactJS + Vite       |
| **Styling**      | HTML/CSS           |
| **Backend**     | NodeJS + ExpressJS  |
| **Database**     | MongoDB               |
| **Dev Tools**	   | ESLint, Babel / SWC|
| **Deployment**   | Render  |
---

## 🚀 How It Works

1. The app has **two search engines**:
   - One for **keywords**
   - One for **dates**

**NOTE**: Only one of these search filters is required to be filled in with a valid entry. If both search filters are filled via valid inputs, Histora will only consider date entry during event retrieval.

2. The search input is mapped to:
   - A **broad U.S. time period**
   - A **specific historical event**
3. The result includes:
   - Event name
   - Year
   - Brief description
   - Contextual notes

  
## 🏗️ Project Structure

### Key Files

[`src/`](https://github.com/AshishBamba05/histora/tree/main/src) : Frontend React App
- [`src/Histora.jsx`](https://github.com/AshishBamba05/histora/blob/main/src/Histora.jsx) — Main search interface and result rendering logic
- [`src/App.jsx`](https://github.com/AshishBamba05/histora/blob/main/src/App.jsx) — App shell and page layout

[`server/`](https://github.com/AshishBamba05/histora/tree/main/server) : Backend (Express server, MongoDB connection, Mongoose model, and seed/build scripts)
- [`server/server.js`](https://github.com/AshishBamba05/histora/blob/main/server/server.js) — Express server, API routes, search handling, and suggestion logic
- [`server/models/Event.js`](https://github.com/AshishBamba05/histora/blob/main/server/models/Event.js) — MongoDB schema and text indexes for historical events
- [`server/db.js`](https://github.com/AshishBamba05/histora/blob/main/server/db.js) — Database connection setup
- [`server/build-events.mjs`](https://github.com/AshishBamba05/histora/blob/main/server/build-events.mjs) — Builds normalized event data for seeding
- [`server/seed.mjs`](https://github.com/AshishBamba05/histora/blob/main/server/seed.mjs) — Seeds event data into MongoDB


## 🧭 Scenario Walkthrough

**Case #1: The user lands on page and hasn't searched anything (yet).**

All events are pre-loaded because we call an API (`/api/events`) to display **ALL** events. When the frontend React component calls `fetch('/api/events')` in [`src/Histora.jsx`](https://github.com/AshishBamba05/histora/blob/main/src/Histora.jsx), that sends a `GET` request routed through Express server in [`server/server.js`](https://github.com/AshishBamba05/histora/blob/main/server/server.js), and returns a MongoDB query in JSON format.


**Case #2: The user types in a valid date but leaves the keyword section blank.**

No search API gets called, instead: 

The frontend React component parses through all the events pre-loaded from the initial API call, and it keeps the events that match the date input.



**Case #3: The user leaves the date filter empty but instead types in a valid keyword.**

Since the date field is empty, the date matching branch is skipped and we look at keyword filter. On the React frontend component via [`src/Histora.jsx`](https://github.com/AshishBamba05/histora/blob/main/src/Histora.jsx), we call `fetch('/api/search?q=...')`, where `q` is the user-inputted keyword filter. This sends a `GET` request to the `/api/search` endpoint in [`server/server.js`](https://github.com/AshishBamba05/histora/blob/main/server/server.js).  The backend server retrieves this request, reads the given word filter, and runs a text match against MongoDB event database. It then returns all relevant findings.

If the Express server is unable to find an exact text match against the MongoDB database, then we resort to a dynamic programming algorithm to find the closest keyword match against the given filter, and return a `Did you mean?` suggestion on the React frontend. 

However, if the dynamic programming algorithm is unable to find any close match, then the React frontend just returns a message saying `No Data Found.`


**Case #4: The user fills in both filters.**

We default to the date filter, and this renders the same output as Case #2.

**Case #5: The user types nothing and hits search.**


## Software Engineering Design Decisions

### 1.) Choosing REST APIs

I chose REST APIs for this project because

- It is stateless, meaning that each API request is independent of one another. This is suitable for my project, because I call a search API every time a user searches a keyword, and I want each user search request to operate within its own realm.
- 

### 2.) MongoDB over SQL

### 3.) 

## 🖥️ Black-Box Testing

| Home Page | Search Result (Search Bar) |
|-----------|----------------|
| ![Home Screenshot](public/prev.png) | ![Search Result Screenshot (Search Bar) ](public/searchResult.png) |


| Search Result (Date) | Mistyped Input In Search Bar Example | 
| ------------------|----------------------|
|  ![Search Result Screenshot (Dates)](public/date.png) | ![Mistyped Input In Search Bar Example](public/mistype.png) |

---

## 📦 Installation & Running Locally

### 1) Clone + install

```bash
git clone https://github.com/AshishBamba05/histora.git
cd histora
npm install
```

### 2) Environment variables (create in server/)
Create a `.env` file in the project root:
```
MONGODB_URI="your_mongodb_connection_string"
PORT = <Enter Port Number>
```

#### To get your MongoDB connection string:
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up or log in
2. Create a free cluster
3. Create a database user (username + password)
4. Add your IP address to the access list
5. Click **Connect → Drivers** and copy the connection string
6. Replace `<password>` with your actual password (i.e. the connection string)

#### Security Note:
Do NOT commit your `.env` file. It contains sensitive credentials like your MongoDB URI.

Ensure `.env` is listed in your `.gitignore`.

### 3) Run Application Through NPM (Node Package Manager):

Open `Split Terminal` then run the following commands:

#### Activate backend (Terminal 1)
```
npm start
```

#### Activate frontend (Terminal 2)
```
npm run dev
```


---

## 🧩 Vite + React Setup

This project uses [Vite](https://vitejs.dev/) for blazing-fast dev with HMR.

### 🔌 Plugins Used

- [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react) (Babel-based)
- [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react-swc) (SWC-based)

Both support **Fast Refresh** during development.

---

## ✅ Linting & TypeScript Support

If you're using TypeScript:

- Use [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) for **type-aware linting**
- Template to get started: [React TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)

---
