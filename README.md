# Microscope Control Application

> ⚠️ **WARNING: This repository is a _very rough draft_.**  
> It is under active development, incomplete, and may contain unstable or experimental code.  
> Use at your own risk, and expect frequent changes.

---

## Project Structure

```plaintext
backend/
├── api/                # API's config based on dev device. Will need to be refactored for actual prototome.
├── services/           # contains mock zmq agent. Will need to be rewritten or imported


dev/                    # Contains temp mock device, configuration, and zmq agent. Only using for testing.


frontend/
└── src/
    ├── app/            # prototome app
    ├── features/
    │   ├── camera/     # Camera feature (controls, UI)
    │   └── stage/      # Stage feature (movement, UI)
    ├── types/
```

---

## Backend

- The backend is responsible for communicating with microscope hardware (simulated by a mock device in development).
- Communication with the mock device is done via a **ZeroMQ (ZMQ) client** located in the `dev` folder. This will
  probably change as more discussion is put into how to communicate with prototome later but is a useful way to start
  creating the web app with minimal rewriting.
- The backend exposes APIs calls for the frontend to control and configure app. Again, the functions themselves will
  probably need to be updated/changes for the actual prototome but urls could remain the same so useful way to start
  creating the web app with minimal rewriting.

---

## Frontend

- The frontend is built with React and adheres to the **Bulletproof React** project structure.
- The **camera** and **stage** are implemented as separate features under `/features`
- This modular approach facilitates independent development and testing of each hardware component interface.

---

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Python 3.12

### Setup

1. **Install backend dependencies:**

   ```bash
   pip install -e .
   ```

2. **Install frontend dependencies:**

```bash
cd frontend
npm install
# or
yarn install
```

### Launch

1. Start dummy instrument in separate process. ZMQ socket will bind to tcp://localhost:6000.
   You can change port but not host.

   ````bash
      from dev.instrument import Instrument
      inst = Instrument()   # running on tcp://localhost:6000
      ```

   ````

2. Launch FastAPI app backend with uvicorn in separate process. Web app will be hosted on 8000 so specify 8000

   ```bash
      uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Start web ui

   ```bash
      cd frontend
      npm start
   ```
