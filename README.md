# ⚡ Exhaust Energy Recovery System 3D

### Interactive 3D Mechanical Engineering Visualization & Simulation

An interactive, high-fidelity 3D visualization of a heavy-duty vehicle exhaust energy recovery system, designed to demonstrate how waste exhaust energy can be converted into useful electrical power.

The project combines **real-time 3D rendering, mechanical component visualization, interactive inspection, and simulation-style animations** to present an engineering concept in an immersive WebGL environment.

> **Project Goal:** Visualize an exhaust energy recovery assembly, explore its internal components, and demonstrate the conceptual conversion of exhaust energy into electrical power.

---

## 🌐 Project Links

- **Live Demo:** [View the 3D Experience](YOUR_LIVE_DEMO_URL)
- **GitHub Repository:** [View Source Code](YOUR_GITHUB_REPOSITORY_URL)

---

## ✨ Key Features

### 🧩 Interactive 3D Mechanical Assembly

Explore a detailed mechanical assembly representing a heavy-duty exhaust energy recovery system.

- 360-degree camera rotation and model inspection
- Zoom and pan controls
- Detailed mechanical components and connecting shafts
- Metallic materials, reflective surfaces, and futuristic lighting
- Interactive scene designed for engineering presentations

### ⚙️ Mechanical Components

The visualization represents the following 12 components:

| No. | Component | Purpose |
|---|---|---|
| 01 | Engine / Combustion Source | Represents the source of exhaust gases |
| 02 | Main Exhaust Pipe | Carries exhaust gases through the system |
| 03 | Exhaust / Muffler Chamber | Represents an expansion chamber for exhaust flow |
| 04 | High-Velocity Exhaust Nozzle | Accelerates exhaust flow toward the turbine |
| 05 | 12-Blade Turbine | Represents the extraction of energy from exhaust flow |
| 06 | Common Rotational Shaft | Transfers mechanical rotation to the generator |
| 07 | Slanted Exhaust Deflector | Redirects exhaust after the turbine |
| 08 | Bypass Valve System | Represents an alternative exhaust flow path |
| 09 | Electrical Generator | Represents conversion of mechanical energy into electricity |
| 10 | Power Electronics | Represents electrical power conditioning |
| 11 | Vehicle Battery Pack | Represents storage of recovered electrical energy |
| 12 | Exhaust Outlet | Represents the final exhaust discharge path |

### 🎬 Simulation & Animation

- **Simulate Process:** Launch an automated, multi-stage presentation sequence.
- **Component Animation:** Visualize mechanical movement and energy flow.
- **Camera Transitions:** Explore the assembly from different viewpoints.
- **Live Dashboard:** View Engine RPM, Exhaust Temperature, Exhaust Pressure, and Recovered Power.
- **Visual Feedback:** Observe animated indicators and illuminated connections.

*Simulation values and animations are conceptual unless connected to real hardware and validated physical models.*

### 🔬 Visualization Modes

- **Normal Mode:** View the assembly with metallic materials and scene lighting.
- **Cutaway Mode:** Inspect internal components and the turbine assembly.
- **Exploded View:** Separate components visually to understand the assembly structure.
- **Technical Mode:** Explore engineering-oriented labels, dimensions, axes, and component callouts.
- **Vehicle View:** Place the system in the context of a heavy-duty vehicle.

### 🔍 Component Inspection

Select individual components to explore their role in the assembly.

- Component highlighting
- Technical information cards
- Numbered component identification
- Interactive inspection of the mechanical layout

---

## 🛠️ Technology Stack

| Technology | Usage |
|---|---|
| React 19 | User interface and component architecture |
| Vite | Development server and build tooling |
| Three.js | 3D graphics and rendering |
| React Three Fiber | Declarative 3D scene development |
| Drei | Helpers and utilities for React Three Fiber |
| Zustand | Application state management |
| Tailwind CSS v4 | Styling and responsive UI |
| WebGL | Hardware-accelerated 3D rendering |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) — preferably a version supported by the project's dependencies
- npm
- Git

### Installation

**1. Clone your repository**

Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/exhaust-energy-recovery-3d.git
```

**2. Navigate to the project directory**

```bash
cd exhaust-energy-recovery-3d
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

**5. Open the application**

Visit the local URL displayed in your terminal. For a typical Vite setup, this is:

```text
http://localhost:5173
```

---

## 📁 Project Structure

The exact structure depends on the current implementation. A typical React Three Fiber project may be organized as follows:

```text
exhaust-energy-recovery-3d/
├── public/             # Static assets and 3D resources
├── src/
│   ├── components/     # UI and reusable components
│   ├── scenes/         # 3D scene and assembly
│   ├── store/          # Zustand state management
│   ├── App.jsx          # Main application
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

*This is an illustrative structure, not a verified listing of the repository's actual files.*

---

## 🧠 Engineering Concept

The system illustrates a conceptual energy recovery process:

1. Exhaust gases leave the engine.
2. The gases travel through the exhaust pipe and chamber.
3. The nozzle directs the flow toward the turbine.
4. The turbine extracts part of the exhaust stream's available energy.
5. The rotating shaft transfers mechanical power to the generator.
6. The generator represents conversion of mechanical energy into electrical energy.
7. Power electronics condition the generated electricity.
8. The battery pack represents storage of the recovered energy.
9. The remaining exhaust gases leave through the outlet.

The actual recoverable energy depends on exhaust temperature, mass flow rate, pressure, turbine efficiency, generator losses, and other operating conditions. The visualization should not be interpreted as a validated engineering performance model unless those relationships have been implemented and verified.

---

## 🎯 Project Objectives

- Present a complex mechanical engineering concept through interactive 3D visualization.
- Demonstrate the conceptual relationship between exhaust flow, turbine rotation, and electrical generation.
- Improve understanding of mechanical assemblies through component inspection.
- Explore camera controls, scene animation, materials, and lighting using Three.js.
- Create an engaging presentation tool for engineering demonstrations and academic projects.

---

## 🔮 Future Enhancements

Potential improvements include:

- Physics-based exhaust flow simulation
- Realistic turbine torque and rotational speed calculations
- Generator efficiency and electrical power modeling
- Battery charging and energy recovery calculations
- Real-time sensor integration
- More detailed exploded views and engineering annotations
- Improved accessibility and mobile responsiveness
- Exportable simulation reports and performance graphs

---

## ⚠️ Disclaimer

This project is an interactive engineering visualization and conceptual demonstration. Unless explicitly implemented and validated, displayed sensor readings, animations, and recovered-power values are illustrative and should not be treated as real-world measurements or experimentally verified performance results.

---

## 👩‍💻 Author

**YOUR NAME**

- GitHub: [YOUR_GITHUB_USERNAME](https://github.com/YOUR_GITHUB_USERNAME)
- LinkedIn: [YOUR_LINKEDIN_PROFILE](YOUR_LINKEDIN_URL)

---

## 📄 License

Add a license file to the repository if you intend to distribute or reuse the project. Ensure that any original models, textures, assets, and third-party dependencies are used according to their respective licenses.

---

*Built to explore the intersection of mechanical engineering, energy recovery, and interactive 3D visualization.*

