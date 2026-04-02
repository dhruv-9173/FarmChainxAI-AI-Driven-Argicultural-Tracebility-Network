# FarmChainxAI — AI-Driven Agricultural Traceability Network

FarmChainxAI is an **AI-driven agricultural traceability network** that helps track and verify the journey of agricultural products across the supply chain (farm → processing → distribution → retail/consumer).  
This repository contains a **full-stack implementation** with:

- **Backend:** Java + Spring Boot (REST APIs, authentication, database integration, QR support)
- **Frontend:** Vite + React + TypeScript (web UI)

> This project is part of the **INFOSYS SPRINGBOARD INTERNSHIP — Java Batch 13**.

---

## Repository Structure

```text
.
├── LICENSE
├── presentation.pptx
└── code
    ├── backend
    │   └── FarmchainxAI
    │       ├── pom.xml
    │       ├── mvnw / mvnw.cmd
    │       ├── src
    │       └── (maven wrapper config in .mvn)
    └── frontend
        └── farmchainxAI
            ├── package.json
            ├── package-lock.json
            ├── vite.config.ts
            ├── tsconfig*.json
            ├── index.html
            ├── src
            ├── public
            └── README.md
```

---

## Tech Stack

### Backend (Spring Boot)
The backend is a Spring Boot application built with Maven.

**Key highlights from `pom.xml`:**
- **Java:** 17  
- **Spring Boot:** 4.0.4 (parent)
- **Core:** `spring-boot-starter-web`, `spring-boot-starter-webmvc`, embedded `tomcat`
- **Database:** `spring-boot-starter-data-jpa` + **MySQL** driver
- **Security:** `spring-boot-starter-security`
- **Auth / Tokens:** JWT libraries (`io.jsonwebtoken` + `java-jwt`)
- **Validation:** `spring-boot-starter-validation`
- **QR Code generation:** ZXing (`core`, `javase`)
- **Utilities:** Lombok

### Frontend (Web App)
The frontend is a modern web UI built with:
- **React + TypeScript**
- **Vite** (fast dev server + bundler)
- ESLint configuration included

---

## Features (High-Level)

Depending on how you configure and run the system, typical features in a traceability platform like this include:

- **Product / batch traceability** (record & retrieve product journey details)
- **QR code-based lookup** (scan QR → fetch traceability data)
- **Role-based access** (e.g., admin / producer / distributor / consumer) via Spring Security
- **JWT-based authentication** (secure API access)
- **Database-backed storage** (MySQL + JPA)

---

## Getting Started

### Prerequisites
Make sure you have:
- **Java 17**
- **Maven** (or use the included Maven Wrapper: `mvnw`)
- **Node.js + npm**
- **MySQL** (running locally or via cloud)

---

## Run the Backend (Spring Boot)

Go to:

```bash
cd code/backend/FarmchainxAI
```

Run with Maven Wrapper:

```bash
./mvnw spring-boot:run
```

On Windows:

```bat
mvnw.cmd spring-boot:run
```

#### Database configuration
This project uses **MySQL + Spring Data JPA**.  
You will typically need to configure your DB credentials in `application.properties` / `application.yml` under `src/main/resources/` (exact file name may vary).

Common properties look like:

- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `spring.jpa.hibernate.ddl-auto`

> If you don’t see these configured yet, add them before running.

---

## Run the Frontend (React + Vite)

Go to:

```bash
cd code/frontend/farmchainxAI
```

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## How the Frontend Talks to the Backend

Typically, the frontend will call backend REST endpoints (e.g., `/api/...`).  
If your backend runs on a different port/domain, you may need to:

- Set a **frontend environment variable** for API base URL (common with Vite), and/or
- Configure **CORS** in Spring Boot.

---

## Documentation / Slides

- `presentation.pptx` contains the project presentation material.

---

## License
This repository includes a `LICENSE` file. Review it for usage and distribution terms.

---

## Internship Note

This project is developed as part of **INFOSYS SPRINGBOARD INTERNSHIP — Java Batch 13**.

---

## Credits / Contributors
- Maintained by: **dhruv-9173** 

---

## Future Improvements (Optional Ideas)
- Add Docker setup for MySQL + backend + frontend
- Add OpenAPI/Swagger docs for REST endpoints
- Add CI workflow for backend tests and frontend builds
- Add better environment config samples (`.env.example`, `application.properties.example`)
