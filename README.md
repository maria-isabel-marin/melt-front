# AI-MELT Frontend (ai-melt-ui)

This is the Angular + Material frontend for the AI-MELT pipeline. It provides a multi‐step UI for:

1. Uploading and registering a document (English or Spanish)  
2. Identifying & classifying conceptual metaphors  
3. Grouping metaphors into scenarios  
4. Grouping scenarios into regimes  
5. Rating regimes  
6. Selecting metaphors for social mobilization  

---

## 🚀 Prerequisites

Before you can run this app locally, you must have the following installed on your machine:

1. **Node.js** (LTS ≥ 20.19.0)  
   Download & install from: https://nodejs.org/en/download/

2. **npm** (bundled with Node.js)  
   Verify with:
   ```bash
   node -v
   npm -v
   ```

3. **Angular CLI** (global)  
   ```bash
   npm install -g @angular/cli
   ng version
   ```
   Make sure your `ng` command is at least v17.x (or the version you used to generate the project).

---

## 🔧 Installation

1. **Clone the repository** (if you haven’t already):
   ```bash
   git clone https://github.com/your-username/melt-front.git
   cd melt-front/ai-melt-ui
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **(Optional) Add Angular Material**  
   If you need to reconfigure or add Material modules:
   ```bash
   ng add @angular/material
   ```

---

## ▶️ Development Server

Run the application locally with live-reload:

```bash
ng serve
```

Then open your browser and navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

---

## 📦 Production Build

To build the app for production deployment:

```bash
ng build --configuration production
```

The compiled output will be placed under:

```
dist/ai-melt-ui/
```

You can then serve those static files from any HTTP server or integrate them into your backend / CI pipeline.

---

## 🛠️ Folder Layout

```
ai-melt-ui/
├── src/
│   └── app/
│       ├── components/            ← Feature components for each pipeline step
│       ├── services/              ← ApiService for HTTP calls to Nest.js backend
│       ├── models/                ← TypeScript interfaces (Metaphor, Scenario, Regime…)
│       ├── app-routing.module.ts  ← Route definitions
│       ├── app.module.ts          ← Root module & Material imports
│       └── app.component.*        ← Application shell
├── angular.json                   ← Angular workspace config
├── package.json                   ← npm dependencies & scripts
├── tsconfig.json                  ← TypeScript compiler settings
└── README.md                      ← This file
```

---

## ⚙️ Environment & Backend

This frontend expects a running Nest.js backend at `http://localhost:3000/api`. You can configure the base URL in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/your-feature`)  
3. Commit your changes (`git commit -m "feat: describe your feature"`)  
4. Push to your branch (`git push origin feature/your-feature`)  
5. Open a Pull Request

---

## 📜 License & Citation

If you use AI-MELT in academic work, please cite:

> Marín-Morales, M.I., Valdivia, P. (2025).
> AI-MELT: A pipeline for metaphor detection and narrative analysis [Computer software].
> GitHub. https://github.com/maria-isabel-marin/melt-front
> (Work in progress as part of the Ph.D. dissertation: “Can an AI-enabled system help us understand how cultural narratives are configured, and how do they prime social mobilization?”)  

---

Happy coding! 🎉  
