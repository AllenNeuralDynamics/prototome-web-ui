# Prototome Control Application

React Web app built to control the prototome instrument. 

---

## Project Structure

```plaintext
backend/
├── api/                # API's config based on dev device. Will need to be refactored for actual prototome.
├── services/           # contains mock zmq agent. Will need to be rewritten or imported


dev/                    # Contains temp configuration file. Only using for testing.


frontend/
└── src/
    ├── app/            # prototome app
    ├── features/
    │   ├── camera/                  # Camera feature (controls, UI)
    │   └── stage/                   # Stage feature (movement, UI)
    │   └── acquisitionControl/      # Start/stop acquisition
    │   └── configuration/           # form to configure acquisition    
    ├── types/
```

---

## Backend

- The backend is expected to be the [prototome instrument](https://github.com/AllenInstitute/prototome/blob/feat-zmq-server/main.py).
- Communication with the prototome is done via one-liner [RouterServer](https://github.com/AllenInstitute/prototome/blob/feat-zmq-server/pylasso/zmq_server.py). 

## Backend -> Frontend link

Communication from the backend to frontend is expected to be done through the one-liner package. On the instrument side, this will be facilitated by the server found in [prototome/main.py](https://github.com/AllenInstitute/prototome/blob/feat-zmq-server/pylasso/zmq_server.py). On the ui side, there is a fastApi layer found in [prototome-web-ui/backend/main.py](https://github.com/AllenNeuralDynamics/prototome-web-ui/blob/main/backend/main.py). This also sets up a one-liner client and propogates messages to and from the instrument. The communication pattern is outlined below. 

```bash
 __________________________python_______________________                           ____typescript_____
|                                                       |                         |                   |
|prototome <---> router_server <---zmq---> router_client| <---http and webrtc---> | prototome-web-ui  |
|_______________________________________________________|                         |___________________|

```

## Frontend

- The frontend is built with React and adheres to the **Bulletproof React** project structure.
- The **camera**, **stage** , **acquisition control**, and **configuration** are implemented as separate features under `/features`

---

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Python 3.12

### Setup

1. **Install backend dependencies:**
```bash
uv sync
```

2.  **Install frontend dependencies:**
```bash
cd frontend
npm install
# or
yarn install
```

### Launch

1. Start instrument in separate process. 

```bash
uv run main.py
```

2. Launch FastAPI app backend with uvicorn in separate process. Web app will be hosted on 8000 so specify 8000

```bash
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

3. Start web ui

```bash
cd frontend
npm run dev
```
