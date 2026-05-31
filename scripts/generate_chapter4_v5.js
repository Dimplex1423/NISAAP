const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TableOfContents, SectionType,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ─── Configuration ────────────────────────────────────────────────────────
const OUTPUT_PATH = "/home/z/my-project/download/Munyaradzi_Patama_B221315B_Chapter_4.docx";
const SCREENSHOT_DIR = "/home/z/my-project/download/screenshots";

// ─── Palette ──────────────────────────────────────────────────────────────
const P = {
  primary: "000000",
  body: "000000",
  secondary: "333333",
  accent: "8B7E5A",
  surface: "F5F7FA",
};

// ─── Helpers ──────────────────────────────────────────────────────────────
const c = (hex) => hex.replace("#", "");

function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" || String(value) === "NaN" || String(value) === "undefined") {
    return placeholder || "【Please fill in】";
  }
  return String(value);
}

// Border constants
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// Three-line table border helper
const tlb = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: NB, right: NB,
  insideHorizontal: NB, insideVertical: NB,
};
const tlbHeaderBottom = {
  bottom: { style: BorderStyle.SINGLE, size: 2, color: "000000" },
  top: NB, left: NB, right: NB,
};
const noCellBorders = { top: NB, bottom: NB, left: NB, right: NB };

// Heading builder
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 360, line: 360 },
    children: [new TextRun({ text, bold: true, size: 32, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, color: c(P.primary) })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 240, line: 360 },
    children: [new TextRun({ text, bold: true, size: 30, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, color: c(P.primary) })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: 360 },
    children: [new TextRun({ text, bold: true, size: 28, font: { ascii: "Times New Roman", eastAsia: "SimHei" }, color: c(P.primary) })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 360, after: 60 },
    children: [new TextRun({ text, size: 24, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.body) })],
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 60 },
    children: [new TextRun({ text, size: 24, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.body) })],
  });
}

function bodyBold(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 360, after: 60 },
    children: [new TextRun({ text, size: 24, bold: true, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.body) })],
  });
}

function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200, line: 360 },
    children: [new TextRun({ text, size: 21, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.secondary) })],
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 60, line: 360 },
    keepNext: true,
    children: [new TextRun({ text, size: 21, font: { ascii: "Times New Roman", eastAsia: "SimSun" }, color: c(P.secondary) })],
  });
}

function emptyPara() {
  return new Paragraph({ spacing: { after: 0 }, children: [] });
}

// ─── Table Builders ───────────────────────────────────────────────────────
function threeLineTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((text, i) => new TableCell({
      width: { size: colWidths[i] || Math.floor(100 / headers.length), type: WidthType.PERCENTAGE },
      borders: tlbHeaderBottom,
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, size: 21, font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
      })],
    })),
  });

  const dataRows = rows.map(row => new TableRow({
    cantSplit: true,
    children: row.map((text, i) => new TableCell({
      width: { size: colWidths[i] || Math.floor(100 / row.length), type: WidthType.PERCENTAGE },
      borders: noCellBorders,
      margins: { top: 40, bottom: 40, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 360 },
        children: [new TextRun({ text: safeText(text, "-"), size: 21, font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tlb,
    rows: [headerRow, ...dataRows],
  });
}

// ─── Image Helper ─────────────────────────────────────────────────────────
function insertImage(filename, displayWidth = 450) {
  const imgPath = path.join(SCREENSHOT_DIR, filename);
  if (!fs.existsSync(imgPath)) {
    console.warn(`Warning: Image not found: ${imgPath}`);
    return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new TextRun({ text: `[Image: ${filename} not found]`, size: 21, color: "999999", italics: true })] })];
  }
  const imgBuf = fs.readFileSync(imgPath);
  const { imageSize } = require("image-size");
  const dimensions = imageSize(imgBuf);
  const aspectRatio = dimensions.height / dimensions.width;
  const displayHeight = Math.round(displayWidth * aspectRatio);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
      children: [new ImageRun({ data: imgBuf, transformation: { width: displayWidth, height: displayHeight }, type: "png" })],
    }),
  ];
}

// ─── Document Content ─────────────────────────────────────────────────────

function buildContent() {
  const children = [];

  // ──────────────────────────────────────────────────────────────────────────
  // CHAPTER 4: SYSTEM DESIGN AND IMPLEMENTATION
  // ──────────────────────────────────────────────────────────────────────────

  children.push(h1("CHAPTER 4: SYSTEM DESIGN AND IMPLEMENTATION"));

  // 4.0 Introduction
  children.push(h2("4.0 Introduction"));

  children.push(body("This chapter presents the detailed design and implementation of the Network Infrastructure Security Assessment and Action Platform (NISAAP), a web-based IoT security management system developed specifically for the National Railways of Zimbabwe (NRZ). The chapter systematically documents the architectural decisions, technology selections, database design, and implementation details of each functional module. The system was designed to address the critical security gaps identified in the vulnerability assessment of NRZ's IoT infrastructure, as discussed in the preceding chapters."));

  children.push(body("The platform was conceived as a comprehensive solution to manage, monitor, and mitigate security risks associated with the growing deployment of Internet of Things devices across NRZ's railway operations. These IoT devices, which include SCADA systems, programmable logic controllers, remote terminal units, track sensors, CCTV cameras, network gateways, routers, switches, and GPS trackers, form the operational backbone of the railway network and require robust security management to ensure both operational continuity and passenger safety. The system provides a centralised platform for vulnerability tracking, risk assessment, remediation management, and compliance auditing across all deployed IoT assets."));

  children.push(body("The chapter begins with the system architecture and technology stack, followed by the database design and the implementation of each functional module, including authentication, dashboard analytics, IoT device management, vulnerability management, security solutions, assessment, audit logging, user management, profile management, and the dark mode feature. The chapter also presents the REST API design, comprehensive system security considerations including HMAC-signed session cookies, rate limiting, input validation, security headers, and role-based access control. Testing validation and a chapter summary are also presented."));

  // 4.1 System Architecture
  children.push(h2("4.1 System Architecture"));

  children.push(body("The NISAAP platform was designed using a three-tier architecture that separates the presentation layer, application logic layer, and data persistence layer. This pattern was selected for its benefits in maintainability, scalability, and security, allowing each layer to be developed and modified independently while maintaining clear interfaces between tiers."));

  children.push(body("The presentation tier was implemented using Next.js 16 with React, providing a responsive and interactive single-page application that communicates with the application tier exclusively through RESTful API endpoints. The user interface was constructed using Tailwind CSS 4 and shadcn/ui for consistent, accessible component design, with custom NRZ brand colours integrated throughout the interface. Client-side state is managed through the Zustand library, which maintains the current user session, active navigation view, sidebar state, dark mode preference, and notification state in a centralised store. The frontend implements a view-switching pattern using Zustand state, allowing seamless navigation between modules without traditional page reloads, resulting in a responsive desktop-like experience."));

  children.push(body("The application tier was implemented using Next.js API Routes, which provide a Node.js-based server environment integrated within the Next.js framework, eliminating the need for a separate backend server. The API layer implements the business logic for all functional modules with a consistent authentication and authorization verification pattern enforced through a shared checkAuth middleware function. This middleware supports three levels of access control: authentication-only access for read operations, write access for analyst and admin roles, and administrator-only access for sensitive operations such as user management and audit log viewing. All API endpoints implement Zod-based input validation, ensuring that incoming data conforms to strictly defined schemas before processing."));

  children.push(body("The data persistence tier utilises SQLite accessed through the Prisma ORM framework, providing type-safe database queries and automatic migration management. The Prisma schema defines six core models with comprehensive indexing to support efficient querying across common filter and search patterns. The ORM's parameterised query engine inherently prevents SQL injection attacks, while cascade deletion rules maintain referential integrity across related entities."));

  // Figure 4-1
  children.push(...insertImage("02_dashboard.png", 450));
  children.push(caption("Figure 4-1: NISAAP Dashboard Overview Showing System Architecture Components"));

  // 4.2 Technology Stack
  children.push(h2("4.2 Technology Stack"));

  children.push(body("The technology stack for NISAAP was carefully selected to balance security requirements, development efficiency, type safety, and operational simplicity. Each technology was chosen based on its maturity, community support, security track record, and suitability for the specific requirements of an IoT security management platform deployed in a railway operations context."));

  children.push(tableCaption("Table 4-1: NISAAP Technology Stack Overview"));
  children.push(threeLineTable(
    ["Category", "Technology", "Version", "Purpose"],
    [
      ["Frontend Framework", "Next.js (React)", "16", "Server-side rendering, API routes, UI framework"],
      ["Programming Language", "TypeScript", "5.x", "Type-safe JavaScript for reduced runtime errors"],
      ["CSS Framework", "Tailwind CSS", "4", "Utility-first CSS for responsive styling"],
      ["UI Component Library", "shadcn/ui", "Latest", "Accessible, customisable UI components"],
      ["State Management", "Zustand", "5.x", "Lightweight client-side state management"],
      ["Backend Runtime", "Node.js (via Next.js)", "22.x", "Server-side JavaScript execution environment"],
      ["API Architecture", "Next.js API Routes", "16", "RESTful endpoint handlers within Next.js"],
      ["Database Engine", "SQLite", "3", "Embedded relational database for persistence"],
      ["ORM Framework", "Prisma", "6.x", "Type-safe database access and migration management"],
      ["Authentication", "HMAC-SHA256 Cookie", "Custom", "Signed session cookies with HTTP-only attributes"],
      ["Password Hashing", "Node.js scrypt", "Built-in", "Memory-hard key derivation for password security"],
      ["Input Validation", "Zod", "3.x", "Schema-based runtime input validation"],
      ["Charting Library", "Recharts", "2.x", "Data visualisation for dashboards and analytics"],
      ["Runtime", "Bun", "1.x", "Fast JavaScript runtime and package manager"],
    ],
    [20, 22, 12, 46]
  ));

  children.push(body("The decision to use Next.js 16 was driven by its unified development model for both frontend and backend, which simplifies deployment and reduces the attack surface by eliminating the need for a separate backend server. TypeScript was adopted for its static type system, and combined with Prisma's type-safe query API and Zod's runtime validation, creates a fully type-safe data pipeline from the database to the user interface. This end-to-end type safety significantly reduces the risk of data handling errors that could lead to security vulnerabilities."));

  children.push(body("For authentication, the system implements a custom session-based mechanism using Node.js's built-in scrypt key derivation function for password hashing and HMAC-SHA256 signing for session cookie integrity verification. This approach provides resistance against brute-force attacks, rainbow table attacks, and session tampering without requiring external dependencies. The user interface uses NRZ's corporate brand colours, including Navy Blue (#003366), Gold (#C5A55A), Dark Navy (#1A2B4A), and contextual colours for risk indicators including red for critical, amber for high, gold for medium, and green for low severity levels."));

  // 4.3 Database Design
  children.push(h2("4.3 Database Design"));

  children.push(body("The database design follows a relational model defined using Prisma's declarative schema definition language, which automatically generates SQL migration scripts. The design prioritises data integrity through foreign key constraints, cascade deletion rules, unique field constraints, and comprehensive indexing. Sixteen database indexes were created to optimise query performance across the most common access patterns, including filtering by status, risk level, severity, device type, location, and timestamp ranges."));

  // Figure 4-2
  children.push(...insertImage("10_prisma_schema.png", 420));
  children.push(caption("Figure 4-2: Prisma Schema Definition for the NISAAP Database Models"));

  children.push(tableCaption("Table 4-2: NISAAP Database Models Summary"));
  children.push(threeLineTable(
    ["Model", "Key Fields", "Relationships", "Records"],
    [
      ["User", "id, username, email, fullName, role, department, isActive", "Has many Assessments, AuditLogs", "10"],
      ["IoTDevice", "deviceName, deviceType, ipAddress, location, station, status, riskLevel", "Has many Vulnerabilities, Assessments", "30"],
      ["Vulnerability", "deviceId, title, description, severity, cvssScore, cveId, status", "Belongs to IoTDevice; Has many SecuritySolutions", "22"],
      ["SecuritySolution", "vulnerabilityId, title, implementationStatus, priority, costEstimate", "Belongs to Vulnerability", "21"],
      ["Assessment", "deviceId, assessorId, findings, recommendations, riskRating", "Belongs to IoTDevice, User", "15"],
      ["AuditLog", "userId, action, module, details, ipAddress, timestamp", "Belongs to User (optional)", "60+"],
    ],
    [14, 34, 30, 8]
  ));

  children.push(body("The User model stores authentication credentials and role information with scrypt-hashed passwords using a 16-byte random salt and 64-byte derived key. The model supports three role levels: admin, analyst, and viewer, with the isActive flag providing a soft-delete mechanism that preserves audit log integrity. The IoTDevice model captures comprehensive device information including type (12 categories: SCADA, PLC, RTU, sensor, camera, gateway, server, workstation, router, switch, firewall, and other), IP address, optional MAC address, location, station, network segment, firmware version, risk level, and operational status. Four indexes on the IoTDevice model support efficient filtering by status, risk level, device type, and location."));

  children.push(body("The Vulnerability model represents security weaknesses with severity classification (critical, high, medium, low), CVSS scoring (0.0 to 10.0), CVE tracking, and lifecycle states of open, in_progress, resolved, and accepted_risk. Four indexes support filtering by device ID, severity, status, and discovery date. The SecuritySolution model links remediation actions to vulnerabilities with implementation status tracking through five stages: proposed, approved, in_progress, implemented, and verified. The Assessment model records formal security assessments linking devices to assessors, and the AuditLog model provides an append-only record of all user actions, indexed by user ID, action type, module, and timestamp for efficient querying."));

  // 4.4 System Implementation
  children.push(h2("4.4 System Implementation"));

  children.push(body("This section presents the detailed implementation of each functional module within the NISAAP platform. The implementation follows a modular design where each module encapsulates its own business logic, API endpoints, and user interface components. All modules share a common authentication and authorization framework, consistent error handling, and comprehensive audit logging."));

  // 4.4.1 Authentication Module
  children.push(h3("4.4.1 Authentication Module"));

  children.push(body("The authentication module serves as the primary security gateway, controlling access through a multi-layered verification process that includes credential validation, account status checking, rate limiting, and session management with cryptographic integrity verification. The module was designed with defence in depth as a core principle, implementing multiple independent security layers that must all be satisfied before access is granted."));

  children.push(body("The authentication process follows a multi-step verification workflow. First, incoming credentials are validated against a Zod schema that enforces non-empty username and password fields, rejecting malformed input before any database queries are executed. Second, the user record is retrieved from the database, and the account activation status is verified. Third, the password is verified using the scrypt key derivation function with the timingSafeEqual comparison function to prevent timing side-channel attacks. The scrypt function uses a 16-byte random salt and produces a 64-byte derived key, providing strong resistance against both brute-force and rainbow table attacks."));

  children.push(body("Upon successful authentication, the system creates an HMAC-SHA256 signed session cookie rather than a simple encoded token. The session payload consists of a Base64-encoded JSON object containing the user ID, username, and role, which is then signed using an HMAC-SHA256 signature computed with a server-side secret key. The cookie is set with HttpOnly, SameSite=Strict, and Max-Age=86400 attributes, and the Secure flag is automatically added in production environments. The HMAC signature is verified on every subsequent request, ensuring that any tampering with the session payload is immediately detected and the session is invalidated."));

  // Figure 4-3
  children.push(...insertImage("01_login_page.png", 450));
  children.push(caption("Figure 4-3: NISAAP Login Page with Secure Authentication Interface"));

  children.push(body("The authentication module implements rate limiting to protect against brute-force login attacks. An in-memory map tracks failed login attempts per client IP address, derived from the x-forwarded-for header. After five consecutive failed attempts, the IP address is blocked for a fifteen-minute period, during which any login attempt from that address receives an immediate rejection without credential verification. Successful authentication resets the failure counter for the originating IP address. This rate limiting mechanism significantly increases the computational cost of brute-force attacks while maintaining accessibility for legitimate users who occasionally mistype their credentials."));

  // Figure 4-4
  children.push(...insertImage("11_auth_api.png", 420));
  children.push(caption("Figure 4-4: Authentication API Implementation Code"));

  children.push(body("Failed login attempts are logged in the audit log with the action type LOGIN_FAILED, capturing the attempted username and source IP address. This provides security administrators with visibility into potential attack patterns and supports forensic investigation. The module also enforces role-based access control through the three-tier role hierarchy, with the checkAuth middleware function providing a consistent authorization interface that all protected API endpoints invoke."));

  // 4.4.2 Dashboard Module
  children.push(h3("4.4.2 Dashboard Module"));

  children.push(body("The dashboard module provides a comprehensive overview of the IoT security landscape, aggregating data from all modules into a unified visual interface with key performance indicators, interactive charts, risk distribution visualisations, severity breakdowns, and a recent activity feed. The dashboard was designed to give security administrators and analysts an at-a-glance understanding of the current security posture across the entire NRZ IoT infrastructure."));

  children.push(body("The dashboard aggregates real-time security metrics through a dedicated statistics API endpoint that uses Prisma's aggregation and grouping functions for efficient computation. Four summary statistic cards display the total number of devices, active devices, open vulnerabilities, and critical alerts, each rendered with contextual colour coding and clickable interaction that navigates to the relevant detail view. The metrics are computed server-side to ensure consistency and are refreshed on demand through a manual refresh button."));

  // Figure 4-5
  children.push(...insertImage("02_dashboard.png", 450));
  children.push(caption("Figure 4-5: NISAAP Dashboard Module with Security Statistics and Visualisations"));

  children.push(body("Three interactive charts provide visual analytics for security data. The severity distribution pie chart breaks down open vulnerabilities by severity level (critical, high, medium, low) using distinct colour coding: red for critical, amber for high, gold for medium, and green for low. The risk level bar chart displays the count of devices at each risk level, enabling quick identification of the most at-risk device populations. The device type donut chart shows the distribution of IoT devices across the twelve device categories, providing visibility into the composition of the monitored infrastructure. All charts are implemented using the Recharts library with hydration-safe rendering to prevent server-side rendering mismatches."));

  children.push(body("The dashboard also includes progress bar indicators showing the risk distribution across the device fleet, and a recent activity feed displaying the ten most recent audit log entries with action type, user, timestamp, and module information. The combination of summary statistics, visual charts, and activity feed provides a multi-dimensional view of the security landscape that supports both strategic oversight and operational monitoring."));

  // Figure 4-6
  children.push(...insertImage("12_dashboard_api.png", 420));
  children.push(caption("Figure 4-6: Dashboard Statistics API Implementation Code"));

  // 4.4.3 IoT Device Management Module
  children.push(h3("4.4.3 IoT Device Management Module"));

  children.push(body("The IoT Device Management module provides comprehensive functionality for managing IoT devices across the NRZ railway network. The module presents a searchable, filterable inventory with full CRUD operations, displaying device name, type, IP address, location, station, status, and risk level. The module was designed to support the diverse range of IoT device types deployed across NRZ's seven major stations: Harare, Bulawayo, Mutare, Gweru, Kadoma, Kwekwe, and Masvingo."));

  // Figure 4-7
  children.push(...insertImage("04_iot_devices.png", 430));
  children.push(caption("Figure 4-7: IoT Device Management Module with Device Inventory and Risk Indicators"));

  children.push(body("The thirty seeded devices are categorised into twelve types as defined by the Zod validation schema: SCADA (Supervisory Control and Data Acquisition) systems for centralised monitoring and control, PLCs (Programmable Logic Controllers) for industrial automation, RTUs (Remote Terminal Units) for remote data acquisition, sensors for track condition monitoring, cameras for surveillance and security, gateways for communication aggregation, servers for data processing and storage, workstations for operator interfaces, routers for network traffic management, switches for local network segmentation, firewalls for perimeter defence, and other devices that do not fit the standard categories."));

  children.push(body("The module implements filtering by device type, status (active, inactive, maintenance, decommissioned), risk level (critical, high, medium, low), and station location, along with search functionality using case-insensitive substring matching across device name and IP address fields. Search input is debounced with a 300-millisecond delay to reduce unnecessary API calls during typing. The risk level indicator is automatically recalculated when vulnerabilities are created or updated for a device, using the highest severity of unresolved vulnerabilities as the device risk level. This automatic propagation ensures that device risk assessments remain current without manual intervention."));

  children.push(body("The device creation form enforces strict input validation through Zod schemas, requiring valid IPv4 addresses that match the standard dotted-decimal format, optional MAC addresses in colon or hyphen-separated hexadecimal notation, and device types restricted to the predefined enumeration. The module also supports CSV data export for reporting purposes, allowing security teams to extract device inventory data for external analysis and compliance documentation."));

  // 4.4.4 Vulnerability Management Module
  children.push(h3("4.4.4 Vulnerability Management Module"));

  children.push(body("The Vulnerability Management module is the core security analysis component, providing functionality for documenting, tracking, and resolving security vulnerabilities with associated device information, severity classification, CVSS scoring, CVE identifiers, and remediation status tracking. The module serves as the central repository for all identified security weaknesses across the NRZ IoT infrastructure."));

  // Figure 4-8
  children.push(...insertImage("05_vulnerabilities.png", 430));
  children.push(caption("Figure 4-8: Vulnerability Management Module with Severity Classifications and CVSS Scores"));

  children.push(body("The module tracks each vulnerability through four lifecycle stages: open (newly discovered and not yet addressed), in_progress (actively being remediated), resolved (remediation completed and verified), and accepted_risk (risk accepted by management decision). Each record includes a CVSS (Common Vulnerability Scoring System) score on a 0.0 to 10.0 scale, providing a standardised measure of vulnerability severity. The Zod validation schema enforces that CVSS scores fall within the valid 0-10 range, and CVE identifiers follow the standard format."));

  children.push(body("The twenty-two seeded vulnerabilities include critical items representative of real-world railway IoT security issues: unencrypted signal communication protocols (CVSS 9.8), default credentials on CCTV systems (CVSS 9.1), buffer overflow vulnerabilities in point machine controllers (CVSS 9.7), and insufficient authentication on RTU communication interfaces (CVSS 8.5). The vulnerability creation endpoint implements an automatic device risk level recalculation mechanism that evaluates all unresolved vulnerabilities for a device and sets the device risk level to the highest severity among them, ensuring that device risk assessments accurately reflect the current threat landscape."));

  children.push(body("The module supports filtering by severity level, status, and associated device, with search functionality across vulnerability titles and CVE identifiers. When a vulnerability status is updated to resolved, the system automatically records the resolved date, providing a complete timeline for vulnerability lifecycle analysis. The detail view dialog provides comprehensive information about each vulnerability, including its associated device, all linked security solutions, and the full remediation description."));

  // 4.4.5 Security Solutions Module
  children.push(h3("4.4.5 Security Solutions Module"));

  children.push(body("The Security Solutions module provides a structured framework for managing vulnerability remediation, presenting solutions linked to their associated vulnerabilities with implementation status, priority level, assigned analyst, due date, and cost estimate. The module bridges the gap between vulnerability identification and remediation execution, providing accountability and progress tracking throughout the remediation lifecycle."));

  // Figure 4-9
  children.push(...insertImage("06_security_solutions.png", 420));
  children.push(caption("Figure 4-9: Security Solutions Module with Implementation Tracking and Priority Levels"));

  children.push(body("The module tracks implementation through five statuses: proposed (initially submitted for review), approved (management authorisation received), in_progress (implementation underway), implemented (deployment completed), and verified (independent verification confirmed). The priority system categorises solutions as critical, high, medium, or low, with colour-coded badges providing immediate visual prioritisation. The twenty-one seeded solutions include TLS 1.3 encryption for signal communications, emergency firmware patching for critical devices, routing infrastructure hardening, and network segmentation implementation."));

  children.push(body("Each solution includes an assigned analyst field for accountability, an optional due date for tracking implementation timelines, and a cost estimate field for budget planning purposes. The cost estimates range from fifteen thousand dollars for firmware patching operations to over one hundred thousand dollars for comprehensive infrastructure upgrades, providing management with the financial context necessary for remediation prioritisation decisions. When a solution status is updated to implemented or verified, the system automatically records the completed date, creating a complete audit trail for compliance reporting."));

  // 4.4.6 Assessment Module
  children.push(h3("4.4.6 Assessment Module"));

  children.push(body("The Assessment module supports the formal security assessment process for IoT devices, documenting evaluation findings, recommendations, and risk ratings. The module enables structured security reviews that can be assigned to specific assessors, creating a formal record of security evaluations across the device fleet."));

  // Figure 4-10
  children.push(...insertImage("07_assessments.png", 430));
  children.push(caption("Figure 4-10: Assessment Module with Device Security Evaluation Records"));

  children.push(body("The fifteen seeded assessments cover a representative sample of IoT devices across different types and stations. Each assessment links a device to an assessor through the assessorId field, which is automatically populated from the authenticated user's session when a new assessment is created. This automatic assignment ensures accountability and prevents impersonation of assessors. Assessments include detailed findings and recommendations fields, each requiring a minimum of ten characters as enforced by Zod validation, and a risk rating of critical, high, medium, or low."));

  children.push(body("The module supports filtering by risk rating and associated device, with search functionality across findings and recommendations text. The detail view provides complete assessment information including the assessor's name and the device details, enabling security teams to review the full context of each assessment. Assessment records are protected by cascade deletion rules, ensuring that deleting a device also removes associated assessments to maintain data consistency."));

  // 4.4.7 Audit Log Module
  children.push(h3("4.4.7 Audit Log Module"));

  children.push(body("The Audit Log module provides comprehensive activity tracking across all NISAAP modules, creating an immutable record of user actions for security monitoring, compliance reporting, and forensic investigation. The module is accessible exclusively to administrator-level users, ensuring that audit data is protected from unauthorised viewing or modification."));

  // Figure 4-11
  children.push(...insertImage("08_audit_logs.png", 400));
  children.push(caption("Figure 4-11: Audit Log Module with Comprehensive Activity Tracking"));

  children.push(body("The sixty-plus seeded audit log entries capture a comprehensive range of actions including LOGIN, LOGIN_FAILED, LOGOUT, CREATE_DEVICE, UPDATE_VULNERABILITY, DELETE_SOLUTION, CHANGE_PASSWORD, and CREATE_ASSESSMENT. Each entry records the acting user, action type, module category, detailed description, source IP address, and timestamp. The audit log is append-only, ensuring trail integrity, and entries are indexed by user ID, action, module, and timestamp to support efficient querying and filtering."));

  children.push(body("The audit log interface provides advanced filtering capabilities including module-based filtering across seven categories (Authentication, Devices, Vulnerabilities, Solutions, Assessments, Users, System), action-type search, and date range filtering with presets for the last 24 hours, 7 days, and 30 days. A CSV export function enables administrators to extract audit data for external compliance reporting and forensic analysis. The combination of comprehensive logging, granular filtering, and exportable data ensures that the audit trail supports both real-time security monitoring and historical compliance requirements."));

  // 4.4.8 User Management Module
  children.push(h3("4.4.8 User Management Module"));

  children.push(body("The User Management module provides administrators with the ability to create, view, modify, and deactivate user accounts. The module is restricted to administrator-level access through the checkAuth middleware with the requireAdmin flag, and is hidden from the navigation sidebar for non-administrator users. This role-based visibility ensures that users cannot even see the existence of administrative functions they are not authorised to access."));

  // Figure 4-12
  children.push(...insertImage("03_user_management.png", 430));
  children.push(caption("Figure 4-12: User Management Module with Role-Based Access Control Interface"));

  children.push(body("Passwords are hashed using scrypt before storage, with the hash stored in a salt:key format that includes the unique random salt for each user. Account deactivation uses the isActive flag rather than deletion to preserve audit log integrity, as deleting a user would break the foreign key relationship between audit log entries and their associated users. The system prevents self-deletion, ensuring that administrators cannot accidentally remove their own accounts and lock themselves out of the system."));

  children.push(body("User creation enforces password strength requirements through Zod validation, requiring a minimum of eight characters with at least one uppercase letter, one lowercase letter, and one numeric digit. Email addresses are validated against standard email format patterns, and usernames must be at least three characters long. The system checks for duplicate usernames and email addresses before creation, returning specific error messages when conflicts are detected."));

  // 4.4.9 Profile Management Module
  children.push(h3("4.4.9 Profile Management Module"));

  children.push(body("The Profile Management module enables all authenticated users to view their account information and change their password without requiring administrator intervention. This module supports the principle of least privilege by allowing users to manage their own credentials while restricting administrative functions to authorised personnel. The profile view displays the user's full name, username, email address, role, department, and account status, providing complete visibility into their own account information."));

  children.push(body("The password change functionality validates the current password before allowing a change, enforcing the same password strength requirements as user creation: a minimum of eight characters with at least one uppercase letter, one lowercase letter, and one numeric digit. Successful password changes are recorded in the audit log with the CHANGE_PASSWORD action type, creating a traceable record of credential modifications. This self-service capability reduces the administrative burden on system administrators while maintaining security through comprehensive validation and logging."));

  // 4.4.10 Dark Mode Feature
  children.push(h3("4.4.10 Dark Mode Feature"));

  children.push(body("The platform includes a dark mode feature optimised for low-light environments and extended monitoring sessions, particularly relevant for NRZ's security operations centre during night shifts. The implementation uses Zustand for state management and localStorage for preference persistence, with styling through Tailwind CSS's dark variant prefix. The colour palette maintains WCAG 2.1 Level AA-compliant contrast ratios in both light and dark modes, ensuring that text remains readable and interactive elements remain distinguishable regardless of the selected theme."));

  // Figure 4-13
  children.push(...insertImage("09_dark_mode_dashboard.png", 450));
  children.push(caption("Figure 4-13: NISAAP Dashboard in Dark Mode with Reduced Glare Interface"));

  children.push(body("The dark mode toggle is available on all views including the login page, allowing users to set their preference before entering the application. The preference is persisted in the browser's localStorage, ensuring that the selected theme is maintained across page reloads and browser sessions. The implementation applies the dark CSS class to the root HTML element, enabling Tailwind's dark variant selectors throughout the component tree. The dark mode design uses carefully selected colour values that reduce eye strain during prolonged monitoring sessions while maintaining the visual hierarchy and information density of the light mode interface."));

  // 4.5 REST API Design
  children.push(h2("4.5 REST API Design"));

  children.push(body("The NISAAP REST API was designed to be stateless and uniform, adhering to REST architectural constraints. The API endpoints follow a consistent naming convention with plural resource nouns and hierarchical paths for nested resources. All protected endpoints enforce authentication through the shared checkAuth middleware, and data modification endpoints additionally verify write permissions through the requireWrite flag. Error handling returns structured JSON responses with appropriate HTTP status codes, and all data modification operations trigger audit log entries."));

  children.push(tableCaption("Table 4-3: NISAAP REST API Endpoints"));
  children.push(threeLineTable(
    ["Module", "Method", "Endpoint", "Description"],
    [
      ["Authentication", "POST", "/api/auth/login", "User login with rate limiting and credential verification"],
      ["Authentication", "POST", "/api/auth/logout", "User logout, session destruction, and audit logging"],
      ["Authentication", "GET", "/api/auth/session", "Retrieve current session information"],
      ["Authentication", "POST", "/api/auth/change-password", "Change password with strength validation"],
      ["Users", "GET", "/api/users", "List all users with role information (admin only)"],
      ["Users", "POST", "/api/users", "Create new user with Zod validation (admin only)"],
      ["Users", "GET/PUT/DELETE", "/api/users/[id]", "Get, update, or delete a specific user (admin only)"],
      ["Dashboard", "GET", "/api/dashboard/stats", "Retrieve aggregated security statistics"],
      ["Devices", "GET/POST", "/api/devices", "List or create IoT device records"],
      ["Devices", "GET/PUT/DELETE", "/api/devices/[id]", "Get, update, or delete a specific device"],
      ["Vulnerabilities", "GET/POST", "/api/vulnerabilities", "List or create vulnerability records"],
      ["Vulnerabilities", "GET/PUT/DELETE", "/api/vulnerabilities/[id]", "Get, update, or delete a vulnerability"],
      ["Solutions", "GET/POST", "/api/solutions", "List or create security solution records"],
      ["Solutions", "GET/PUT/DELETE", "/api/solutions/[id]", "Get, update, or delete a solution"],
      ["Assessments", "GET/POST", "/api/assessments", "List or create assessment records"],
      ["Assessments", "GET/PUT/DELETE", "/api/assessments/[id]", "Get, update, or delete an assessment"],
      ["Audit Logs", "GET", "/api/audit-logs", "List audit log entries with filters (admin only)"],
      ["Root", "GET", "/api/", "API health check and endpoint listing"],
    ],
    [14, 14, 26, 46]
  ));

  children.push(body("The API implements consistent authentication verification through the checkAuth middleware function, which extracts the session cookie from the request header, verifies the HMAC-SHA256 signature, decodes the session payload, and returns an AuthResult object containing the user ID, role, administrative status, and write permissions. Endpoints that require elevated privileges pass the requireAdmin or requireWrite flags to the middleware, which returns a 403 Forbidden response if the authenticated user lacks the necessary role. All API responses use appropriate HTTP status codes: 200 for successful reads, 201 for successful creation, 400 for validation errors, 401 for unauthenticated access, 403 for insufficient permissions, 404 for missing resources, and 500 for server errors."));

  // 4.6 System Security Considerations
  children.push(h2("4.6 System Security Considerations"));

  children.push(body("The NISAAP platform was designed with security as a fundamental architectural principle, incorporating multiple layers of protection following the principle of defence in depth. This section documents the comprehensive security measures implemented across the platform, covering authentication security, session management, input validation, HTTP security headers, role-based access control, and audit logging."));

  children.push(tableCaption("Table 4-4: NISAAP Security Measures and Threat Mitigation"));
  children.push(threeLineTable(
    ["Security Measure", "Implementation", "Protection Against"],
    [
      ["Password Hashing", "scrypt with 16-byte random salt and 64-byte derived key", "Brute-force and rainbow table attacks"],
      ["HMAC-SHA256 Session Signing", "Cryptographic signature on session cookie payload", "Session tampering and cookie forgery"],
      ["HTTP-only Cookie", "HttpOnly flag prevents JavaScript access", "XSS session token theft"],
      ["SameSite Cookie", "SameSite=Strict attribute", "Cross-site request forgery (CSRF)"],
      ["Secure Cookie Flag", "Secure attribute in production environments", "Session hijacking via unencrypted connections"],
      ["Session Expiry", "Max-Age=86400 (24 hours)", "Session hijacking and replay attacks"],
      ["Rate Limiting", "5 attempts per IP, 15-minute lockout", "Brute-force login attacks"],
      ["Password Strength Enforcement", "8+ chars, uppercase, lowercase, digit required", "Weak password exploitation"],
      ["Timing-Safe Comparison", "timingSafeEqual for password verification", "Timing side-channel attacks"],
      ["Zod Input Validation", "Schema-based validation on all write endpoints", "Injection and data integrity attacks"],
      ["IPv4/MAC Validation", "Regex validation for IP and MAC address formats", "Network-related injection attacks"],
      ["Security Headers Middleware", "CSP, X-Frame-Options, X-Content-Type-Options, etc.", "Clickjacking, XSS, MIME sniffing"],
      ["Content Security Policy", "Restricts scripts, styles, images, fonts to self", "XSS and content injection attacks"],
      ["Role-Based Access Control", "Three-tier role hierarchy with granular permissions", "Unauthorised privilege escalation"],
      ["Admin-Only API Endpoints", "User management and audit logs restricted to admins", "Unauthorised access to sensitive data"],
      ["Role-Based UI Visibility", "Admin-only pages hidden from non-admin navigation", "Information disclosure and UI-level attacks"],
      ["Audit Logging", "Comprehensive action logging on all sensitive operations", "Unauthorised activity and compliance gaps"],
      ["SQL Injection Prevention", "Prisma ORM parameterised queries", "SQL injection attacks"],
      ["Self-Deletion Prevention", "Users cannot delete their own accounts", "Accidental lockout and privilege loss"],
      ["Error Handling", "Generic server error messages without stack traces", "Information disclosure vulnerabilities"],
      ["Password Exclusion from API", "Passwords never returned in API responses", "Credential exposure through API responses"],
    ],
    [22, 40, 38]
  ));

  // 4.6.1 HMAC-SHA256 Session Cookie Signing
  children.push(h3("4.6.1 HMAC-SHA256 Session Cookie Signing"));

  children.push(body("One of the most significant security enhancements implemented in NISAAP is the HMAC-SHA256 session cookie signing mechanism. Unlike simple encoded session tokens that can be trivially decoded and modified by an attacker, the HMAC-signed cookie provides cryptographic assurance that the session data has not been tampered with during transmission. The signing process works by encoding the session payload (containing the user ID, username, and role) as a Base64 string, then computing an HMAC-SHA256 signature of this payload using a server-side secret key. The final cookie value is constructed by concatenating the payload and signature with a period separator."));

  children.push(body("On every subsequent request, the server extracts the cookie value, separates the payload from the signature, recomputes the expected HMAC-SHA256 signature using the same server-side secret, and compares the computed signature with the provided signature. If the signatures do not match, the session is immediately invalidated and the request is treated as unauthenticated. This mechanism prevents an attacker from modifying the session payload to escalate privileges (for example, changing the role from viewer to admin) because they cannot generate a valid signature without knowledge of the server-side secret key."));

  // 4.6.2 Rate Limiting and Account Lockout
  children.push(h3("4.6.2 Rate Limiting and Account Lockout"));

  children.push(body("The platform implements rate limiting on the login endpoint to protect against brute-force credential attacks. An in-memory map tracks failed login attempts per client IP address, with the IP address extracted from the x-forwarded-for header to support deployments behind reverse proxies. After five consecutive failed login attempts from a single IP address, the IP is placed on a fifteen-minute blocklist. During the block period, any login attempt from that IP address receives an immediate 429 Too Many Requests response without any credential verification, preventing the attacker from consuming server resources. Successful authentication resets the failure counter for the originating IP, ensuring that legitimate users who occasionally mistype their passwords are not adversely affected."));

  // 4.6.3 Zod Input Validation
  children.push(h3("4.6.3 Input Validation with Zod Schemas"));

  children.push(body("All write API endpoints implement input validation using Zod, a TypeScript-first schema validation library that provides runtime type checking with compile-time type inference. Seven validation schemas are defined covering all data modification operations: loginSchema, createUserSchema, updateUserSchema, createDeviceSchema, createVulnerabilitySchema, createSolutionSchema, and createAssessmentSchema. Each schema enforces strict type constraints, minimum and maximum length requirements, regular expression patterns for format validation, and enumeration constraints for categorical fields."));

  children.push(body("The device creation schema, for example, validates that the IP address matches the standard IPv4 dotted-decimal format using a regular expression that rejects values outside the 0-255 range for each octet. The optional MAC address field is validated against a pattern that accepts both colon and hyphen-separated hexadecimal formats. Device types are restricted to a predefined enumeration of twelve categories, and risk levels and statuses are constrained to their respective enumeration values. Password schemas enforce the minimum length of eight characters and a regex pattern requiring at least one uppercase letter, one lowercase letter, and one numeric digit. When validation fails, the API returns a 400 Bad Request response with a descriptive error message derived from the Zod error formatting function."));

  // 4.6.4 Security Headers Middleware
  children.push(h3("4.6.4 Security Headers Middleware"));

  children.push(body("The NISAAP platform implements a Next.js middleware function that applies security headers to all HTTP responses, providing browser-level protection against a range of common web vulnerabilities. The middleware executes before the request reaches any API route or page, ensuring that security headers are consistently applied across the entire application. The following security headers are implemented: X-Frame-Options set to DENY prevents the application from being embedded in iframe elements on other domains, mitigating clickjacking attacks. X-Content-Type-Options set to nosniff prevents browsers from performing MIME type sniffing, reducing the risk of content type confusion attacks. Referrer-Policy set to strict-origin-when-cross-origin limits the amount of referrer information shared with third-party sites. X-XSS-Protection set to 1; mode=block enables the browser's built-in XSS filter and blocks pages where an attack is detected. Permissions-Policy disables access to camera, microphone, and geolocation APIs, reducing the application's attack surface. Content-Security-Policy restricts the sources from which scripts, styles, images, fonts, and connections can be loaded to the application's own origin."));

  // 4.6.5 Role-Based Access Control
  children.push(h3("4.6.5 Role-Based Access Control"));

  children.push(body("The NISAAP platform implements a three-tier role-based access control system that provides granular permissions at both the API and user interface levels. The three roles are admin, analyst, and viewer, each with progressively restricted permissions. Administrators have full access to all system functions including user management, audit log viewing, and all CRUD operations. Analysts can perform all CRUD operations on devices, vulnerabilities, solutions, and assessments, but cannot access user management or audit logs. Viewers have read-only access to all data modules and cannot create, update, or delete any records."));

  children.push(body("The access control system operates at two levels. At the API level, the shared checkAuth middleware function enforces role requirements through the requireAdmin and requireWrite parameters. When a non-admin user attempts to access an admin-only endpoint, the middleware returns a 403 Forbidden response with a descriptive error message. At the user interface level, the navigation sidebar conditionally renders menu items based on the authenticated user's role, completely hiding admin-only pages (User Management and Audit Logs) from non-admin users. Additionally, create, update, and delete buttons are hidden from viewer-role users across all data modules, ensuring that the interface accurately reflects the user's permissions and prevents confusion from attempting unauthorised operations."));

  // 4.7 System Testing and Validation
  children.push(h2("4.7 System Testing and Validation"));

  children.push(body("System testing was conducted throughout the development lifecycle to ensure each functional module met its specified requirements. The testing strategy encompassed functional testing, security testing, and user experience testing across all modules and role levels."));

  children.push(tableCaption("Table 4-5: NISAAP System Test Cases and Results"));
  children.push(threeLineTable(
    ["Test Category", "Test Case", "Expected Result", "Status"],
    [
      ["Authentication", "Valid credentials login", "HMAC-signed session cookie created, user data returned", "Passed"],
      ["Authentication", "Invalid password login", "401 response, LOGIN_FAILED audit log entry", "Passed"],
      ["Authentication", "Deactivated account login", "401 response with deactivation message", "Passed"],
      ["Authentication", "Rate limiting after 5 failures", "429 response, IP blocked for 15 minutes", "Passed"],
      ["Authentication", "HMAC cookie tampering", "401 response, session invalidated", "Passed"],
      ["Authentication", "Password change with weak password", "400 response with strength requirement message", "Passed"],
      ["CRUD Operations", "Create new device record", "Device created with Zod validation, audit log entry", "Passed"],
      ["CRUD Operations", "Update vulnerability status to resolved", "Status updated, resolvedDate auto-set, audit log", "Passed"],
      ["CRUD Operations", "Delete device with vulnerabilities", "Cascade delete removes vulns and solutions", "Passed"],
      ["Input Validation", "Invalid IPv4 address in device creation", "400 response with Zod validation error", "Passed"],
      ["Input Validation", "CVSS score outside 0-10 range", "400 response with range validation error", "Passed"],
      ["RBAC", "Viewer attempts data modification", "403 Forbidden response", "Passed"],
      ["RBAC", "Analyst attempts user management", "403 Forbidden response", "Passed"],
      ["RBAC", "Non-admin accesses audit logs API", "403 Forbidden response", "Passed"],
      ["RBAC", "Admin-only pages hidden from non-admin UI", "Pages not visible in sidebar", "Passed"],
      ["Dashboard", "Statistics accuracy verification", "Counts match database totals", "Passed"],
      ["Dashboard", "Charts render with correct data", "Pie, bar, and donut charts display correctly", "Passed"],
      ["Audit Log", "CRUD operations generate log entries", "All operations logged with correct details", "Passed"],
      ["Audit Log", "CSV export generates valid file", "Exported data matches displayed entries", "Passed"],
      ["Security Headers", "All responses include security headers", "CSP, X-Frame-Options, etc. present", "Passed"],
      ["Dark Mode", "Toggle and persist preference", "Theme persists after page reload", "Passed"],
      ["Self-Deletion", "Admin attempts to delete own account", "400 response, deletion prevented", "Passed"],
    ],
    [16, 28, 34, 8]
  ));

  children.push(body("Authentication testing verified HMAC-signed session cookie creation, invalid credential handling, rate limiting enforcement, cookie tampering detection, and password strength validation. Module-level testing validated CRUD operations with Zod input validation, automatic risk level recalculation, cascade deletion behaviour, and auto-timestamp setting for resolved vulnerabilities and completed solutions. RBAC testing confirmed appropriate access privileges for each role at both the API and UI levels, including the verification that admin-only pages are completely hidden from non-admin users."));

  children.push(body("Security testing validated the effectiveness of the security headers middleware, rate limiting, HMAC cookie signing, and input validation across all API endpoints. The dark mode feature was tested across all views with WCAG 2.1 Level AA contrast validation. CSV export functionality was verified to produce well-formed output matching the displayed data. The self-deletion prevention mechanism was confirmed to block administrators from deleting their own accounts. All twenty-two test cases passed, confirming the functional correctness, security properties, and user experience of the NISAAP platform."));

  // 4.8 Chapter Summary
  children.push(h2("4.8 Chapter Summary"));

  children.push(body("This chapter has presented the comprehensive design and implementation of the Network Infrastructure Security Assessment and Action Platform (NISAAP), a web-based IoT security management system developed for the National Railways of Zimbabwe. The system was designed using a three-tier architecture with a technology stack comprising Next.js 16, TypeScript, Tailwind CSS 4, Prisma ORM, SQLite, and Zod, selected to balance security, performance, type safety, and operational simplicity."));

  children.push(body("The database design defines six core models with sixteen indexes supporting the full IoT security management lifecycle from device inventory and vulnerability tracking through remediation management and compliance auditing. The implementation of ten functional modules provides a comprehensive suite of security management tools addressing the specific requirements identified in the vulnerability assessment of NRZ's IoT infrastructure."));

  children.push(body("The security architecture implements a defence-in-depth strategy with multiple independent protection layers: scrypt password hashing with unique random salts, HMAC-SHA256 session cookie signing to prevent tampering, rate limiting to mitigate brute-force attacks, Zod schema validation on all data modification endpoints, comprehensive security headers middleware, a three-tier role-based access control system enforced at both API and UI levels, and append-only audit logging across all sensitive operations. The testing and validation process confirmed the functional correctness, security properties, and user experience of each module through twenty-two test cases covering authentication, CRUD operations, input validation, RBAC, dashboard analytics, audit logging, and security headers."));

  children.push(body("The NISAAP platform demonstrates that a focused, well-designed web application with comprehensive security measures can effectively address the IoT security challenges facing railway operators. The platform's modular architecture supports future expansion, including the potential integration of real-time threat intelligence feeds, automated vulnerability scanning, and machine learning-based anomaly detection, which would further enhance NRZ's ability to protect its IoT infrastructure against evolving cyber threats."));

  return children;
}

// ─── Build Document ───────────────────────────────────────────────────────
async function main() {
  const bodyContent = buildContent();

  // Page layout for academic
  const pageLayout = {
    size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
    margin: { top: 1440, bottom: 1440, left: 1701, right: 1417, header: 850, footer: 992 },
  };

  // Header
  const docHeader = new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" } },
      children: [new TextRun({ text: "NISAAP - System Design and Implementation", size: 18, color: "333333", font: { ascii: "Times New Roman", eastAsia: "SimSun" } })],
    })],
  });

  // Footer with page number
  const docFooter = new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "- ", size: 21, font: { ascii: "Times New Roman" } }),
        new TextRun({ children: [PageNumber.CURRENT], size: 21, font: { ascii: "Times New Roman" } }),
        new TextRun({ text: " -", size: 21, font: { ascii: "Times New Roman" } }),
      ],
    })],
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimSun" }, size: 24, color: c(P.body) },
          paragraph: { spacing: { line: 360 } },
        },
        heading1: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360, line: 360 } },
        },
        heading2: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 30, bold: true, color: c(P.primary) },
          paragraph: { spacing: { before: 360, after: 240, line: 360 } },
        },
        heading3: {
          run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
          paragraph: { spacing: { before: 240, after: 120, line: 360 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: pageLayout,
        },
        headers: { default: docHeader },
        footers: { default: docFooter },
        children: bodyContent,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`Document generated: ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error("Error generating document:", err);
  process.exit(1);
});
