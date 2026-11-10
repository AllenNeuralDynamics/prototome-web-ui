# Prototome Control Application

Web application for controlling the prototome instrument. A Python **FastAPI** server connects to the instrument over ZMQ using [one-liner](https://github.com/AllenNeuralDynamics/one-liner). It exposes the instrument to a **React** client over HTTP and streams camera feeds over WebRTC.

**Backend (`server/`)**
- Python 3.12+, managed with [uv](https://docs.astral.sh/uv/)
- [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/) for the HTTP API
- [Pydantic](https://docs.pydantic.dev/) for config and request/response models
- [one-liner](https://github.com/AllenNeuralDynamics/one-liner) / ZMQ for RPC with the instrument
- [aiortc](https://github.com/aiortc/aiortc) + OpenCV for WebRTC camera streaming

**Frontend (`frontend/`)**
- [Widgets](https://github.com/AllenNeuralDynamics/micetosis/blob/feat-widget/widget.md) a custom widget pattern developed to integrate with `one-liner`. 
- [React 19](https://react.dev/) + TypeScript, built with [Vite](https://vite.dev/)
- [Mantine](https://mantine.dev/) and [Tailwind CSS](https://tailwindcss.com/) for UI and styling
- [TanStack Query](https://tanstack.com/query) + Axios for server state, [Zustand](https://zustand.docs.pmnd.rs/) for client state
- [React Router](https://reactrouter.com/) for routing
- [Zod](https://zod.dev/) and [RJSF](https://rjsf-team.github.io/react-jsonschema-form/) (AJV) for validation and schema-driven forms

## Project Structure

The frontend of the project adheres to [bulletproof react](https://github.com/alan2207/bulletproof-react).

```plaintext
config.json
server/
├── pyproject.toml
└── src/prototome_web_ui/
    ├── main.py                      # CLI entry point (prototome_web_ui)
    ├── config.py                    # Config loading
    ├── route_metadata_model.py      # Pydantic models for route metadata
    └── api/
        ├── routes.py                # HTTP routes proxied to the instrument
        ├── session.py               # Client session handling
        ├── webrtc.py                # WebRTC camera stream relay
        └── write_lock.py            # Single-writer token for instrument control
frontend/
├── package.json
├── vite.config.ts
└── src/
    ├── app/                         # App shell, providers, router
    │   └── routes/                  # Pages (Home, Pylasso, Stages)
    ├── components/
    │   ├── errors/                  # Error boundary fallback
    │   ├── globalApiError/          # Global API error display
    │   ├── layouts/                 # MainLayout
    │   └── ui/                      # Shared UI (Header, ColorSchemeToggle, DrawableCamera)
    ├── hooks/                       # Shared hooks (use-config)
    ├── lib/
    │   ├── one-liner-router/        # RPC + metadata hooks for one-liner routes
    │   ├── webrtc/                  # WebRTC client and stream provider
    │   ├── write-token/             # Write token / page mode context and hooks
    │   ├── client.tsx               # Axios client
    │   ├── react-query.ts           # TanStack Query setup
    │   └── mantine-theme.ts         # Mantine theme
    ├── stores/                      # Zustand stores (ROI, theme)
    ├── types/                       # Shared types
    ├── utils/
    └── widgets/
        ├── framework/               # Widget contracts, bindings, slot validation
        ├── EStopButton/
        ├── LassoCameraWidget/
        ├── LassoControlWidget/
        ├── MicrotomeControlWidget/
        ├── StageControlWidget/
        └── WaferCalibrationWidget/
```

## Running Prototome Production

Go to the [ prototome-instrument ](https://github.com/AllenNeuralDynamics/prototome-instrument) repository and use that to launch the entire prototome instrument + UI. 

## Local development

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Python 3.12

### Install

1. **Install backend dependencies:**
```bash
cd server
uv sync
```

2.  **Install frontend dependencies:**
```bash
cd frontend
npm install
# or
yarn install
```

#### Dev mode

Run the **Launch DEV** compound configuration if you're using vscode. It starts:

| Configuration | What it does                                                              |
| ------------- | ------------------------------------------------------------------------- |
| `API`         | FastAPI server with `--config config.json --dev` (no static files served) |
| `VITE`        | Vite dev server (`npm run dev` in `frontend/`)                            |
| `Browser`     | Chrome debugging session at http://localhost:5173                         |

Equivalent commands, each in its own terminal:

```bash
cd server
uv run prototome_web_ui --config ../config.json --dev [--log-level INFO|DEBUG]
```

```bash
cd frontend
npm run dev
```

Then open http://localhost:5173. Vite proxies `/api` to `http://localhost:8000`, so `server.port` in the config should be `8000`.
