
# Voice Notes Keeper

A desktop voice recording application built with Tauri, React, and shadcn/ui.

## Features

- Record voice notes with a clean, intuitive interface
- Save recordings with custom titles
- Manage your recording library
- Playback your voice recordings
- Cross-platform desktop application (Windows, macOS, Linux)

## Prerequisites

To build and run this application, you need to have the following installed:

1. Node.js and npm (or yarn)
2. Rust and Cargo
3. Tauri CLI
4. Platform-specific dependencies as outlined in the [Tauri setup guide](https://tauri.app/v1/guides/getting-started/prerequisites)

## Development

1. Install dependencies:
```bash
npm install
```

2. Run the application in development mode:
```bash
npm run tauri:dev
```

## Building

To build the application for your current platform:

```bash
npm run tauri:build
```

The output will be located in `src-tauri/target/release/bundle/`.

## Project Structure

- `src/` - React frontend code
  - `components/` - UI components
  - `lib/` - Utility functions
  - `types/` - TypeScript type definitions
  - `pages/` - Application pages
- `src-tauri/` - Tauri/Rust backend code
  - `src/` - Rust source code
  - `Cargo.toml` - Rust dependencies

## Technologies Used

- [Tauri](https://tauri.app/) - Framework for building desktop applications
- [React](https://reactjs.org/) - Frontend UI library
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [SQLite](https://www.sqlite.org/) - Embedded database
