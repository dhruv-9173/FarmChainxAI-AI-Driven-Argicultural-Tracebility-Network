# FarmChainxAI — AI-Driven Agricultural Traceability Network

FarmChainxAI is an **AI-driven agricultural traceability network** that helps track and verify the journey of agricultural products across the supply chain (farm → processing → distribution → retail/consumer).  
This repository contains a **full-stack implementation** with:

- **Backend:** Java + Spring Boot (REST APIs, authentication, database integration, QR support)
- **Frontend:** Vite + React + TypeScript (web UI)

> This project is part of the **INFOSYS SPRINGBOARD INTERNSHIP — Java Batch 13**.
> Visit the website through -> http://farmchainx.s3-website.ap-south-1.amazonaws.com/
> For Login use these test accounts:-
>     farmer@gmail.com, Farmer@123
>     distributer@gmail.com, Distrib@123
>     retailer@gmail.com, Retail@123
>     consumer@gmail.com, Consumer@123
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
## UI Screenshots
<img width="1911" height="926" alt="Screenshot 2026-04-10 211328" src="https://github.com/user-attachments/assets/ccf1d222-07a9-40fe-82e9-e1ef820a03ea" />

<img width="1919" height="920" alt="Screenshot 2026-04-10 211404" src="https://github.com/user-attachments/assets/4ff2cfe7-4cef-4cbc-9947-af15fd90e7db" />

<img width="1918" height="930" alt="Screenshot 2026-04-10 211421" src="https://github.com/user-attachments/assets/2ffeb76b-80d4-41e0-8859-45443d384912" />

<img width="1917" height="928" alt="Screenshot 2026-04-10 211552" src="https://github.com/user-attachments/assets/be2e50fc-62a0-4429-b351-96619ab5b006" />

<img width="1917" height="925" alt="image" src="https://github.com/user-attachments/assets/d0be1fad-0cb6-454a-96b3-6ea8fb6ac24a" />

<img width="1919" height="932" alt="image" src="https://github.com/user-attachments/assets/fe5eab3e-e1a7-416a-b28f-6b23b6ed1c49" />

<img width="1919" height="930" alt="image" src="https://github.com/user-attachments/assets/678cd427-f893-40e6-ae7d-256019531902" />

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
