# CognitiveMeshUI Development Setup

This project is configured with a complete development environment using VS Code Dev Containers.

## 🚀 Quick Start

### Using Dev Containers (Recommended)

1. **Prerequisites:**
   - [VS Code](https://code.visualstudio.com/)
   - [Docker](https://docker.com/get-started)
   - [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Setup:**
   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd CognitiveMeshUI
   
   # Open in VS Code
   code .
   
   # When prompted, click "Reopen in Container"
   # Or use Command Palette: "Dev Containers: Reopen in Container"
   ```

3. **The container will automatically:**
   - Install Node.js 20
   - Install all npm dependencies
   - Configure VS Code with recommended extensions
   - Set up development tools

### Manual Setup (Alternative)

If you prefer not to use Dev Containers:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 🛠️ Available Commands

### VS Code Tasks (Ctrl+Shift+P → "Tasks: Run Task")

- **Dev Server** - Start the Next.js development server
- **Build** - Create production build
- **Lint** - Run ESLint
- **Lint Fix** - Fix ESLint issues automatically
- **Type Check** - Run TypeScript compiler check
- **Clean** - Clean build artifacts
- **Install Dependencies** - Install npm packages

### NPM Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting

# Utilities
npm run clean        # Clean build artifacts
```

## 🐛 Debugging

The workspace includes multiple debugging configurations:

- **Next.js: debug server-side** - Debug server-side code
- **Next.js: debug client-side** - Debug in Chrome
- **Next.js: debug full stack** - Debug both server and client
- **Debug Build** - Debug build process

Access via VS Code Debug panel (Ctrl+Shift+D).

## 🎨 Development Features

### Code Quality
- **ESLint** - Code linting with Next.js rules
- **Prettier** - Code formatting (auto-format on save)
- **TypeScript** - Type checking and IntelliSense

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Modules** - Scoped styling support
- **Custom Properties** - CSS variables for theming

### Extensions Included
- Prettier (code formatting)
- ESLint (linting)
- Tailwind CSS IntelliSense
- TypeScript support
- Auto Rename Tag
- Path Intellisense
- Error Lens (inline error display)
- GitHub Copilot (if available)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── ...            # Feature components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── types/             # TypeScript type definitions

components/            # Shared UI components (shadcn/ui)
public/               # Static assets
```

## 🔧 Configuration Files

- `.devcontainer/` - Dev container configuration
- `.vscode/` - VS Code workspace settings
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.js` - Next.js configuration

## 🌐 Port Forwarding

The dev container automatically forwards these ports:
- **3000** - Next.js development server
- **3001** - Storybook (if added)
- **5173** - Vite dev server (if needed)

## 🎯 Tips

1. **Auto-formatting:** Files are automatically formatted on save
2. **Auto-imports:** TypeScript imports are organized automatically
3. **Live reload:** Development server auto-reloads on changes
4. **Error highlighting:** Errors are highlighted inline with Error Lens
5. **File nesting:** Related files are grouped in the explorer

## 🐳 Container Details

The dev container uses:
- **Base Image:** `mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye`
- **Node.js:** Version 20
- **Features:** Git, GitHub CLI, Docker-in-Docker
- **User:** `node` (non-root for security)

## 🚨 Troubleshooting

### Container Issues
```bash
# Rebuild container
Ctrl+Shift+P → "Dev Containers: Rebuild Container"

# Reset container
Ctrl+Shift+P → "Dev Containers: Rebuild and Reopen in Container"
```

### Port Conflicts
If port 3000 is in use, Next.js will automatically use the next available port.

### Extension Issues
Extensions are automatically installed, but you can manually install via:
```bash
Ctrl+Shift+P → "Extensions: Install Extensions"
```

---

Happy coding! 🚀
