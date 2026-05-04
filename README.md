# Trip It! 🚀

**Trip It!** is your intelligent German travel companion. It helps you plan optimized, high-quality itineraries across Germany's top 15 cities using advanced AI and custom routing algorithms.

## ✨ Features

### 🌍 German City Expert
*   **Deep POI Database**: Over 450 researched locations across 15 major German cities (Berlin, Munich, Hamburg, Cologne, Frankfurt, Stuttgart, Düsseldorf, Leipzig, Nuremberg, Dresden, Bremen, Hannover, Dortmund, Essen, and Heidelberg).
*   **10 Specialized Categories**: Culture, Nature, Food & Drink, Entertainment, Shopping, History, Nightlife, Relaxation, Family-Friendly, and Hidden Gems.
*   **Interactive Selection**: Choose your destination via a focused search bar or an interactive map of Germany.

### 🤖 AI Local Guide Persona
*   **Rich Context**: The AI acts as a knowledgeable local tour guide, providing detailed 2-sentence cultural and historical descriptions for every stop.
*   **Smart Transit**: AI-generated instructions include specific transit line numbers (e.g., "Take U2") for a realistic travel experience.
*   **Multi-Language (EN/DE)**: Full support for English and German. AI responses automatically match your selected UI language.

### 🗺️ Intelligent Route Optimization
*   **TSP Routing**: Uses a Nearest Neighbor algorithm to solve the Traveling Salesperson Problem, ensuring your route minimizes travel time and distance.
*   **Multi-Day Logic**: Automatically handles trips that exceed daily limits by inserting "Day End • Overnight Break" markers and resetting the schedule for the next morning.
*   **Google Maps Integration**: One-click button to open your entire optimized route directly in Google Maps with all waypoints pre-loaded.

### 🎨 Premium UX & UI
*   **Cinematic Landing Page**: A beautiful, blurred-background entry screen for a focused planning experience.
*   **Interactive Tutorial**: An onboarding system accessible via a high-contrast info button to help users get started.
*   **Dynamic Sidebar**: Real-time stats on step counts, realistic cost estimations (including food and transit baselines), and weather-based packing suggestions.
*   **Synced Visuals**: Category icons and colors are perfectly synchronized between the filters, map pins, and the timeline.

## 🚀 Getting Started

1.  **Clone & Install**:
    ```bash
    git clone [repository-url]
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file and add your `VITE_ITINERARY_API_BASE` (optional, defaults to localhost).

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Plan your Trip**:
    Navigate to `http://localhost:8080`, pick a city, set your interests, and hit **Trip It!**

## 🛠️ Built With

*   **React + TypeScript**
*   **Vite** (Build Tool)
*   **Leaflet** (Interactive Maps)
*   **Tailwind CSS + Shadcn UI** (Styling)
*   **Framer Motion** (Animations)
*   **Google AI (Imagen API & LLMs)** (Itinerary Generation)

---
© 2026 Trip It! — AI-Optimized Local Guides for Germany
