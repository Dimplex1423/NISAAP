const docx = require("docx");
const fs = require("fs");
const path = require("path");

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, Header, Footer, PageNumber,
  TableLayoutType, VerticalAlign
} = docx;

const SCREENSHOTS_DIR = "/home/z/my-project/download/screenshots";
const OUTPUT_PATH = "/home/z/my-project/download/Munyaradzi_Patama_B221315B_Chapter_4.docx";

const MARGIN_TOP = 1440;
const MARGIN_BOTTOM = 1440;
const MARGIN_LEFT = 1701;
const MARGIN_RIGHT = 1417;
const FONT_EN = "Times New Roman";
const FONT_CJK = "SimSun";
const CM_TO_EMU = 360000;

function loadScreenshot(filename) {
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(filepath)) { console.error(`WARNING: Not found: ${filepath}`); return null; }
  return fs.readFileSync(filepath);
}

function getImageDimensions(imageBuffer, maxCmWidth) {
  const maxWidthEMU = maxCmWidth * CM_TO_EMU;
  let origW = 1920, origH = 1080;
  try { origW = imageBuffer.readUInt32BE(16); origH = imageBuffer.readUInt32BE(20); } catch(e) {}
  return { maxWidthEMU, maxHeightEMU: Math.round(maxWidthEMU / (origW / origH)) };
}

function bodyParagraph(text, options = {}) {
  const { alignment = AlignmentType.JUSTIFIED, spacing = { line: 360, before: 0, after: 120 }, indent = { firstLine: 480 } } = options;
  return new Paragraph({ alignment, spacing, indent, children: [new TextRun({ text, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 24 })] });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240, line: 360 }, children: [new TextRun({ text, bold: true, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 32 })] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, alignment: AlignmentType.LEFT, spacing: { before: 240, after: 120, line: 360 }, children: [new TextRun({ text, bold: true, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 30 })] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, alignment: AlignmentType.LEFT, spacing: { before: 200, after: 120, line: 360 }, children: [new TextRun({ text, bold: true, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 28 })] });
}

function figureCaption(text) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 200, line: 360 }, children: [new TextRun({ text, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 21, bold: true })] });
}
function tableCaption(text) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120, line: 360 }, children: [new TextRun({ text, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 21, bold: true })] });
}

function imageParagraph(imageBuffer, maxWidthCm) {
  const dims = getImageDimensions(imageBuffer, maxWidthCm);
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 0 }, children: [new ImageRun({ data: imageBuffer, transformation: { width: Math.round(dims.maxWidthEMU / 9525), height: Math.round(dims.maxHeightEMU / 9525) }, type: "png" })] });
}

function createAcademicTable(headers, rows, colWidths) {
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const topBorder = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
  const bottomBorder = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
  const thinBottomBorder = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
  function hCell(t, w) { return new TableCell({ width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: { top: topBorder, bottom: thinBottomBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40, line: 340 }, children: [new TextRun({ text: t, bold: true, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 20 })] })] }); }
  function dCell(t, w, last) { return new TableCell({ width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: { top: noBorder, bottom: last ? bottomBorder : noBorder, left: noBorder, right: noBorder }, children: [new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 20, after: 20, line: 320 }, indent: { left: 60 }, children: [new TextRun({ text: t, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 20 })] })] }); }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, colWidths[i])) }), ...rows.map((row, ri) => new TableRow({ children: row.map((c, ci) => dCell(c, colWidths[ci], ri === rows.length - 1)) }))], layout: TableLayoutType.FIXED });
}

function imgFigure(filename, widthCm, caption) {
  const img = loadScreenshot(filename);
  const els = [];
  if (img) els.push(imageParagraph(img, widthCm));
  els.push(figureCaption(caption));
  return els;
}

// =================== SECTIONS ===================

function sec_4_0() {
  return [
    heading1("CHAPTER 4: SYSTEM DESIGN AND IMPLEMENTATION"),
    heading2("4.0 Introduction"),
    bodyParagraph("This chapter presents the detailed design and implementation of the Network Infrastructure Security Assessment and Action Platform (NISAAP), a web-based IoT security management system developed specifically for the National Railways of Zimbabwe (NRZ). The chapter systematically documents the architectural decisions, technology selections, database design, and implementation details of each functional module that constitutes the NISAAP platform. The system was designed to address the critical security gaps identified in the vulnerability assessment of NRZ's IoT infrastructure, as discussed in the preceding chapters of this study."),
    bodyParagraph("The design and implementation process followed a structured methodology that incorporated industry best practices for secure software development. The platform was conceived as a comprehensive solution to manage, monitor, and mitigate security risks associated with the growing deployment of Internet of Things devices across NRZ's railway operations. These IoT devices, which include signal controllers, CCTV cameras, track sensors, network gateways, routers, and GPS trackers, form the operational backbone of the railway network and require robust security management to ensure both operational continuity and passenger safety."),
    bodyParagraph("The chapter begins with an overview of the system architecture, explaining the layered design approach and the interaction between frontend, backend, and data persistence layers. This is followed by a detailed discussion of the technology stack and the database design. The subsequent sections provide an in-depth examination of each functional module, including authentication, dashboard, IoT device management, vulnerability management, security solutions, assessment, audit logging, user management, and the dark mode feature. Each module is presented with visual evidence in the form of system screenshots. The chapter also presents the REST API design, system security considerations, and testing validation. The chapter concludes with a summary that synthesises the key design decisions and implementation outcomes."),
  ];
}

function sec_4_1() {
  return [
    heading2("4.1 System Architecture"),
    bodyParagraph("The NISAAP platform was designed using a three-tier architecture that separates the presentation layer, application logic layer, and data persistence layer. This architectural pattern was selected for its well-established benefits in terms of maintainability, scalability, and security. The separation of concerns inherent in the three-tier model allows each layer to be developed, tested, and modified independently, which is particularly important for a security-critical system deployed in a railway operations environment where system availability and reliability are paramount. The three-tier approach also facilitates future extension and modification of individual layers without requiring changes to the other layers, reducing the risk of regression errors and minimising the operational impact of system updates."),
    bodyParagraph("The presentation tier was implemented using Next.js 16 with React, providing a responsive and interactive user interface. This tier communicates with the application tier exclusively through RESTful API endpoints, ensuring a clean separation between the user-facing components and the business logic. The user interface was constructed using Tailwind CSS 4 for utility-first styling and shadcn/ui for consistent, accessible component design. Client-side state is managed through the Zustand library, which maintains the current user session, active navigation view, sidebar state, and dark mode preference in a single centralised store."),
    bodyParagraph("The application tier was implemented using Next.js API Routes, which provide a Node.js-based server environment integrated within the Next.js framework. This approach eliminates the need for a separate backend server, reducing deployment complexity and infrastructure requirements. The API layer implements the business logic for all functional modules, including authentication, data validation, role-based access control, and audit logging. Each API endpoint follows RESTful design principles, accepting JSON requests and returning structured JSON responses with appropriate HTTP status codes. A consistent authentication verification pattern is enforced across all protected endpoints through the checkAuth function."),
    bodyParagraph("The data persistence tier utilises SQLite as the relational database engine, accessed through the Prisma ORM framework. SQLite was selected for its zero-configuration deployment model, which eliminates the need for a separate database server process, thereby reducing the attack surface and simplifying system administration. Prisma ORM provides type-safe database queries, automatic migration management, and a declarative schema definition language that ensures data integrity and consistency. The Prisma client is initialised through a singleton pattern to prevent excessive database connections, which is particularly important in the Next.js API Routes environment."),
    ...imgFigure("02_dashboard.png", 13, "Figure 4-1: NISAAP Dashboard Overview Showing System Architecture Components"),
  ];
}

function sec_4_2() {
  const tH = ["Category", "Technology", "Version", "Purpose"];
  const tR = [
    ["Frontend Framework", "Next.js (React)", "16", "Server-side rendering, routing, and UI framework"],
    ["Programming Language", "TypeScript", "5.x", "Type-safe JavaScript for reduced runtime errors"],
    ["CSS Framework", "Tailwind CSS", "4", "Utility-first CSS for responsive styling"],
    ["UI Component Library", "shadcn/ui", "Latest", "Accessible, customisable UI components"],
    ["State Management", "Zustand", "5.x", "Lightweight client-side state management"],
    ["Backend Runtime", "Node.js (via Next.js)", "22.x", "Server-side JavaScript execution environment"],
    ["API Architecture", "Next.js API Routes", "16", "RESTful endpoint handlers within Next.js"],
    ["Database Engine", "SQLite", "3", "Embedded relational database for data persistence"],
    ["ORM Framework", "Prisma", "6.x", "Type-safe database access and migration management"],
    ["Authentication", "JWT (Cookie-based)", "Custom", "Session management with HTTP-only cookies"],
    ["Password Hashing", "Node.js scrypt", "Built-in", "Memory-hard key derivation for password security"],
    ["Charting Library", "Recharts", "2.x", "Data visualisation for dashboards and analytics"],
  ];
  return [
    heading2("4.2 Technology Stack"),
    bodyParagraph("The selection of the technology stack for NISAAP was guided by several critical considerations, including the operational environment of NRZ, the need for security by design, the availability of developer expertise, and the requirement for long-term maintainability. Each technology was evaluated against these criteria, and the final stack represents a carefully curated combination of industry-proven tools that collectively deliver a secure, performant, and maintainable platform. Table 4-1 provides a comprehensive overview of the technologies employed."),
    tableCaption("Table 4-1: NISAAP Technology Stack Overview"),
    createAcademicTable(tH, tR, [2200, 2400, 1200, 5000]),
    bodyParagraph("The decision to use Next.js 16 as the primary framework for both frontend and backend development was driven by its unified development model, which eliminates the complexity of maintaining separate frontend and backend codebases. Next.js provides server-side rendering for improved initial page load performance, automatic code splitting to reduce bundle sizes, and a file-based routing system. The framework's API Routes feature enables the creation of server-side API endpoints within the same application, reducing deployment overhead and ensuring consistent security policies across the entire application stack."),
    bodyParagraph("TypeScript was adopted as the primary programming language due to its static type system, which provides compile-time error detection and enhances code reliability. In a security-critical application such as NISAAP, the elimination of type-related runtime errors is particularly important. The combination of TypeScript with Prisma's type-safe query API creates a fully type-safe data pipeline from the database to the user interface, significantly reducing the risk of data corruption and injection vulnerabilities. For authentication, the system implements a custom session-based mechanism using Node.js's built-in scrypt key derivation function, which provides resistance against brute-force and rainbow table attacks through its memory-hard computational requirements."),
    bodyParagraph("The user interface was constructed using Tailwind CSS 4 for utility-first styling and shadcn/ui for accessible, customisable component design. The combination of these styling technologies enabled the implementation of NRZ's corporate brand colours, including Navy Blue (#003366), Gold (#C5A55A), Dark Navy (#1A2B4A), and contextual colours for risk indicators such as red (#CC0000) for critical alerts, amber (#FF8F00) for high severity, and green (#2E7D32) for resolved items. The Recharts library was selected for data visualisation on the dashboard, providing interactive and responsive charts that render vulnerability severity distribution and device type composition."),
  ];
}

function sec_4_3() {
  const mH = ["Model", "Key Fields", "Relationships", "Records"];
  const mR = [
    ["User", "id, username, email, fullName, role, department, isActive", "Has many Assessments, AuditLogs", "10"],
    ["IoTDevice", "deviceName, deviceType, ipAddress, macAddress, location, station, status, riskLevel", "Has many Vulnerabilities, Assessments", "31"],
    ["Vulnerability", "deviceId, title, description, severity, cvssScore, cveId, status", "Belongs to IoTDevice; Has many SecuritySolutions", "26"],
    ["SecuritySolution", "vulnerabilityId, title, implementationStatus, priority, costEstimate", "Belongs to Vulnerability", "22"],
    ["Assessment", "deviceId, assessorId, findings, recommendations, riskRating", "Belongs to IoTDevice, User", "14"],
    ["AuditLog", "userId, action, module, details, ipAddress, timestamp", "Belongs to User (optional)", "93"],
  ];
  return [
    heading2("4.3 Database Design"),
    bodyParagraph("The database design for NISAAP follows a relational model that captures the complex interrelationships between users, IoT devices, vulnerabilities, security solutions, assessments, and audit logs. The schema was defined using Prisma's declarative schema definition language, which provides a clear, human-readable representation of the data model and automatically generates the SQL migration scripts required to create the database structure. The design prioritises data integrity through the use of foreign key constraints, cascade deletion rules, and unique field constraints, ensuring that the database maintains consistency even under concurrent access conditions."),
    bodyParagraph("The Prisma schema defines six core models that collectively represent the complete data domain of the NISAAP platform. As shown in Figure 4-2, the Prisma schema code defines the complete data model, including field types, default values, relationships, and constraints. The schema serves as both the documentation and the implementation of the database design."),
    ...imgFigure("10_prisma_schema.png", 14, "Figure 4-2: Prisma Schema Definition for the NISAAP Database Models"),
    bodyParagraph("Table 4-2 provides a summary of the six database models, their key fields, relationships, and the number of records seeded during the initial deployment. The data model was designed to support the full lifecycle of IoT security management, from device registration and vulnerability discovery through remediation tracking and audit compliance reporting."),
    tableCaption("Table 4-2: NISAAP Database Models Summary"),
    createAcademicTable(mH, mR, [1600, 3200, 3200, 800]),
    bodyParagraph("The User model stores authentication credentials and role information for all system users. Password security is implemented through the scrypt key derivation function, which generates a 64-byte key from the user's password combined with a 16-byte random salt. The model supports three role levels, namely admin, analyst, and viewer, each with progressively restricted access privileges. The isActive flag allows administrators to deactivate user accounts without deleting them, preserving the integrity of audit logs that reference the user."),
    bodyParagraph("The IoTDevice model captures comprehensive information about each IoT device deployed across the NRZ railway network, including device type, network location, station, risk level, IP and MAC addresses, network segment, and firmware version. The Vulnerability model represents security weaknesses with detailed fields for severity classification, CVSS scoring, and CVE tracking, with status states including open, acknowledged, in_progress, resolved, and accepted_risk. The SecuritySolution model links remediation actions to identified vulnerabilities, tracking implementation status from proposed through to verified, with priority levels, assignment tracking, and cost estimates. The Assessment model records formal security assessments linking devices to assessors with findings, recommendations, and risk ratings. The AuditLog model provides an append-only record of all user actions, supporting compliance reporting and forensic investigation capabilities."),
  ];
}

function sec_4_4() {
  return [
    heading2("4.4 System Implementation"),
    bodyParagraph("This section presents the detailed implementation of each functional module within the NISAAP platform. The implementation follows a modular design where each module encapsulates its own business logic, API endpoints, and user interface components. This modular approach facilitates independent testing, maintenance, and future extension of individual modules without affecting the overall system stability."),

    heading3("4.4.1 Authentication Module"),
    bodyParagraph("The authentication module serves as the primary security gateway to the NISAAP platform, controlling access to all system functionality through a username and password verification process. The module implements a secure authentication workflow that begins with the user submitting credentials through the login page, as shown in Figure 4-3. The system validates the submitted credentials against the stored password hash using the scrypt key derivation function, which provides resistance against timing attacks through the use of the timingSafeEqual comparison function."),
    ...imgFigure("01_login_page.png", 12, "Figure 4-3: NISAAP Login Page with Secure Authentication Interface"),
    bodyParagraph("The authentication process follows a multi-step verification workflow. Upon receiving a login request, the API endpoint first validates that both username and password fields are present, returning a 400 Bad Request response if either field is missing. The system then retrieves the user record and checks whether the account is active, returning a 401 Unauthorised response if the account has been deactivated. Password verification is performed using the scrypt algorithm with a 16-byte random salt and a 64-byte derived key, providing strong resistance against brute-force attacks. If authentication fails, the system logs the failed attempt in the audit log, enabling security monitoring of potential unauthorised access attempts."),
    bodyParagraph("Upon successful authentication, the system creates a session cookie containing the user's identifier, username, and role. The session data is encoded using Base64 encoding and stored in an HTTP-only cookie with the Secure, SameSite=Strict, and Max-Age=86400 attributes. The HTTP-only flag prevents client-side JavaScript from accessing the cookie, mitigating cross-site scripting attacks. The SameSite=Strict attribute ensures that the cookie is only sent with same-origin requests, preventing cross-site request forgery attacks. The Max-Age attribute limits the session duration to 24 hours, after which the user must re-authenticate. The module enforces role-based access control through three user roles: admin, analyst, and viewer, each with progressively restricted access privileges."),
    ...imgFigure("11_auth_api.png", 14, "Figure 4-4: Authentication API Implementation Code"),

    heading3("4.4.2 Dashboard Module"),
    bodyParagraph("The dashboard module provides a comprehensive overview of the IoT security landscape across the NRZ railway network, aggregating data from all other modules into a unified visual interface. As illustrated in Figure 4-5, the dashboard presents key performance indicators, risk distribution charts, severity breakdowns, and recent activity logs, enabling security administrators to quickly assess the current security posture and identify areas requiring immediate attention."),
    ...imgFigure("02_dashboard.png", 12, "Figure 4-5: NISAAP Dashboard Module with Security Statistics and Visualisations"),
    bodyParagraph("The dashboard aggregates data from multiple database queries to present real-time security metrics, including the total number of IoT devices, active devices, open vulnerabilities, and critical and high-severity alerts. The severity distribution chart uses distinct colours for each severity level: critical in red (#CC0000), high in amber (#FF8F00), medium in gold (#C5A55A), and low in green (#2E7D32). The device type distribution chart shows the composition of the IoT fleet by category, supporting resource allocation decisions. The dashboard API endpoint implements authentication verification before returning any data and uses Prisma's aggregation and grouping functions to efficiently compute statistics."),
    ...imgFigure("12_dashboard_api.png", 14, "Figure 4-6: Dashboard Statistics API Implementation Code"),

    heading3("4.4.3 IoT Device Management Module"),
    bodyParagraph("The IoT Device Management module provides comprehensive functionality for managing the entire lifecycle of IoT devices deployed across the NRZ railway network. As illustrated in Figure 4-7, the module presents a searchable, filterable inventory of all registered devices, displaying key attributes such as device name, type, IP address, location, station, status, and risk level. The module supports full CRUD operations, allowing administrators to register new devices, update device information, and deactivate decommissioned devices."),
    ...imgFigure("04_iot_devices.png", 12, "Figure 4-7: IoT Device Management Module with Device Inventory and Risk Indicators"),
    bodyParagraph("The device type classification system categorises the 31 seeded devices into six categories: controllers, which manage railway signalling operations; cameras, which provide surveillance coverage; sensors, which monitor track conditions and environmental parameters; gateways, which aggregate and route device communications; routers, which manage network traffic between segments; and trackers, which provide GPS location data for locomotives and rolling stock. The risk level indicator associated with each device provides an aggregate security risk assessment that is automatically recalculated whenever a vulnerability is created, updated, or resolved. The module implements filtering by type, status, risk level, and station location, along with search functionality that enables location of specific devices by name, IP address, or location using Prisma's contains operator for case-insensitive substring matching."),

    heading3("4.4.4 Vulnerability Management Module"),
    bodyParagraph("The Vulnerability Management module is the core security analysis component of the NISAAP platform, providing comprehensive functionality for documenting, tracking, and resolving security vulnerabilities. As shown in Figure 4-8, the module presents a detailed inventory of all discovered vulnerabilities, including their associated device, severity classification, CVSS score, CVE identifier, and current remediation status."),
    ...imgFigure("05_vulnerabilities.png", 12, "Figure 4-8: Vulnerability Management Module with Severity Classifications and CVSS Scores"),
    bodyParagraph("The module tracks the complete lifecycle of each vulnerability through five status stages: open, acknowledged, in_progress, resolved, and accepted_risk. Each vulnerability record includes a CVSS score providing a standardised numerical assessment on a scale from 0.0 to 10.0, enabling quantitative risk comparison and data-driven prioritisation of remediation efforts. The 26 seeded vulnerabilities span the full severity range, with critical vulnerabilities including unencrypted signal communication protocols (CVSS 9.8), default credentials on CCTV systems (CVSS 9.1), and buffer overflow vulnerabilities in point machine controllers (CVSS 9.7). The vulnerability creation endpoint implements an automatic device risk level update mechanism that recalculates the associated device's risk level whenever a new vulnerability is created."),

    heading3("4.4.5 Security Solutions Module"),
    bodyParagraph("The Security Solutions module provides a structured framework for managing the remediation of identified vulnerabilities. As illustrated in Figure 4-9, the module presents a comprehensive list of security solutions linked to their associated vulnerabilities, displaying key information including the solution title, implementation status, priority level, assigned analyst, and cost estimate."),
    ...imgFigure("06_security_solutions.png", 12, "Figure 4-9: Security Solutions Module with Implementation Tracking and Priority Levels"),
    bodyParagraph("The module tracks the implementation lifecycle through four status stages: proposed, in_progress, implemented, and verified. The priority classification system categorises solutions as critical, high, medium, or low, ensuring that remediation resources are directed toward the most impactful security gaps. The 22 seeded security solutions address vulnerabilities across all severity levels, with critical-priority solutions including the implementation of TLS 1.3 encryption for signal communications, emergency firmware patching for point machine controllers, and security hardening of core routing infrastructure. Each solution includes a cost estimate, supporting budget planning and return-on-investment analysis for security investments. The assignment feature links each solution to a specific security analyst, establishing clear accountability for remediation activities."),

    heading3("4.4.6 Assessment Module"),
    bodyParagraph("The Assessment module supports the formal security assessment process for IoT devices, providing a structured framework for documenting evaluation findings, recommendations, and risk ratings. As illustrated in Figure 4-10, the module presents a list of completed and pending assessments, each linked to a specific device and assessor."),
    ...imgFigure("07_assessments.png", 12, "Figure 4-10: Assessment Module with Device Security Evaluation Records"),
    bodyParagraph("Each assessment record captures findings from the security evaluation, recommendations for corrective actions, and an overall risk rating. The 14 seeded assessments cover a representative sample of IoT devices across different types and stations, demonstrating the assessment workflow. The module supports NRZ's compliance requirements by maintaining a documented record of security evaluations for all critical IoT devices, which is essential for demonstrating due diligence in cybersecurity management."),

    heading3("4.4.7 Audit Log Module"),
    bodyParagraph("The Audit Log module provides comprehensive activity tracking across all NISAAP modules, creating an immutable record of user actions that supports security monitoring, compliance reporting, and forensic investigation. As shown in Figure 4-11, the audit log presents a chronological listing of all recorded activities."),
    ...imgFigure("08_audit_logs.png", 12, "Figure 4-11: Audit Log Module with Comprehensive Activity Tracking"),
    bodyParagraph("The audit logging system is implemented through the logAudit function, which creates a new AuditLog record at every critical operation point. The system differentiates between successful and failed authentication attempts. The 93 seeded audit log entries include actions such as LOGIN, LOGIN_FAILED, CREATE, UPDATE, and DELETE, providing a complete trace of data modifications. The audit log is append-only, meaning records cannot be modified or deleted through the application interface, ensuring the integrity of the audit trail."),

    heading3("4.4.8 User Management Module"),
    bodyParagraph("The User Management module provides administrators with the ability to create, view, modify, and deactivate user accounts. As illustrated in Figure 4-12, the module presents a comprehensive list of all user accounts. The module is restricted to administrator-level access, implementing the principle of least privilege at the module level."),
    ...imgFigure("03_user_management.png", 12, "Figure 4-12: User Management Module with Role-Based Access Control Interface"),
    bodyParagraph("The user creation process requires a username, full name, email address, initial password, role assignment, and department designation. The password is immediately hashed using the scrypt function before storage. Account deactivation is implemented through the isActive flag rather than deletion, preserving the integrity of audit log records. All user management operations are logged in the audit trail, ensuring complete accountability for administrative actions."),

    heading3("4.4.9 Dark Mode Feature"),
    bodyParagraph("The NISAAP platform includes a dark mode feature that provides an alternative visual theme optimised for low-light environments and extended monitoring sessions. As illustrated in Figure 4-13, the dark mode replaces the default light colour scheme with a dark background and adjusted component colours that reduce eye strain."),
    ...imgFigure("09_dark_mode_dashboard.png", 12, "Figure 4-13: NISAAP Dashboard in Dark Mode with Reduced Glare Interface"),
    bodyParagraph("The dark mode implementation uses the Zustand state management library to persist the user's theme preference in localStorage. The toggleDarkMode function updates the darkMode state and writes the preference using the key 'nisaap-dark-mode'. Styling is implemented through CSS class toggling with Tailwind CSS's dark: variant prefix, providing fine-grained control over component appearance. The colour palette for dark mode maintains sufficient contrast ratios that comply with Web Content Accessibility Guidelines. The feature is accessible from all pages through a toggle switch in the sidebar navigation panel."),
  ].flat();
}

function sec_4_5() {
  const aH = ["Module", "Method", "Endpoint", "Description"];
  const aR = [
    ["Authentication", "POST", "/api/auth/login", "User login with credential verification"],
    ["Authentication", "POST", "/api/auth/logout", "User logout and session destruction"],
    ["Authentication", "GET", "/api/auth/session", "Retrieve current session information"],
    ["Users", "GET", "/api/users", "List all users with role information"],
    ["Users", "GET/PUT/DELETE", "/api/users/[id]", "Get, update, or delete a specific user"],
    ["Dashboard", "GET", "/api/dashboard/stats", "Retrieve aggregated security statistics"],
    ["Devices", "GET/POST", "/api/devices", "List or create IoT device records"],
    ["Devices", "GET/PUT/DELETE", "/api/devices/[id]", "Get, update, or delete a specific device"],
    ["Vulnerabilities", "GET/POST", "/api/vulnerabilities", "List or create vulnerability records"],
    ["Vulnerabilities", "GET/PUT/DELETE", "/api/vulnerabilities/[id]", "Get, update, or delete a vulnerability"],
    ["Solutions", "GET/POST", "/api/solutions", "List or create security solution records"],
    ["Solutions", "GET/PUT/DELETE", "/api/solutions/[id]", "Get, update, or delete a solution"],
    ["Assessments", "GET/POST", "/api/assessments", "List or create assessment records"],
    ["Assessments", "GET/PUT/DELETE", "/api/assessments/[id]", "Get, update, or delete an assessment"],
    ["Audit Logs", "GET", "/api/audit-logs", "List all audit log entries"],
    ["Root", "GET", "/api/route", "API health check and endpoint listing"],
  ];
  return [
    heading2("4.5 REST API Design"),
    bodyParagraph("The NISAAP platform exposes its functionality through a comprehensive set of RESTful API endpoints that follow established design principles for web-based applications. The API was designed to be stateless, cacheable, and uniform in its interface design, adhering to the Representational State Transfer architectural constraints. Each endpoint accepts and returns JSON-formatted data, uses standard HTTP methods to indicate the intended operation, and returns appropriate HTTP status codes to communicate the outcome. Table 4-3 provides a comprehensive listing of the API endpoints implemented across the functional modules."),
    tableCaption("Table 4-3: NISAAP REST API Endpoints"),
    createAcademicTable(aH, aR, [1800, 1400, 3200, 4000]),
    bodyParagraph("The endpoints follow a consistent naming convention that uses plural resource nouns and hierarchical paths. The authentication endpoints are grouped under the /api/auth path, while resource-specific endpoints follow the /api/{resource} pattern. The API implements filtering, search, and pagination through query parameters on list endpoints. The API enforces authentication requirements on all endpoints except the login endpoint, with each protected endpoint verifying the session cookie through the checkAuth function. Error handling returns structured JSON responses with appropriate HTTP status codes: 400 for client errors, 401 for authentication failures, and 500 for server errors. All data modification operations trigger audit log entries for complete traceability."),
  ];
}

function sec_4_6() {
  const sH = ["Security Measure", "Implementation", "Protection Against"];
  const sR = [
    ["Password Hashing", "scrypt with 16-byte salt and 64-byte key", "Brute-force and rainbow table attacks"],
    ["HTTP-only Cookie", "HttpOnly flag prevents JavaScript access", "XSS session token theft"],
    ["SameSite Cookie", "SameSite=Strict attribute", "Cross-site request forgery (CSRF)"],
    ["Session Expiry", "Max-Age=86400 (24 hours)", "Session hijacking and replay attacks"],
    ["Timing-Safe Comparison", "timingSafeEqual for password verification", "Timing side-channel attacks"],
    ["Input Validation", "Required field checks on all endpoints", "Injection and data integrity attacks"],
    ["Role-Based Access Control", "Three-tier role hierarchy", "Unauthorised privilege escalation"],
    ["Audit Logging", "Comprehensive action logging", "Unauthorised activity and compliance gaps"],
    ["SQL Injection Prevention", "Prisma ORM parameterised queries", "SQL injection attacks"],
    ["Error Handling", "Generic server error messages", "Information disclosure vulnerabilities"],
  ];
  return [
    heading2("4.6 System Security Considerations"),
    bodyParagraph("The NISAAP platform was designed with security as a fundamental architectural principle, incorporating multiple layers of protection to safeguard both the system and the sensitive security data it manages. The security approach follows the principle of defence in depth, where multiple overlapping security controls ensure that the failure of any single control does not result in a complete security breach. Table 4-4 summarises the key security measures and the threats they mitigate."),
    tableCaption("Table 4-4: NISAAP Security Measures and Threat Mitigation"),
    createAcademicTable(sH, sR, [2600, 3400, 4400]),
    bodyParagraph("The authentication system represents the first and most critical layer of defence. Password storage uses the scrypt key derivation function, which is specifically designed to be memory-hard, making hardware-based attacks using GPUs or ASIC devices substantially more expensive. The use of a unique random salt for each password ensures that identical passwords produce different hash values, preventing the use of precomputed rainbow tables. Session management implements the HTTP-only flag to mitigate XSS attacks, the SameSite=Strict attribute to prevent CSRF attacks, and a 24-hour session expiry to reduce the window of opportunity for session hijacking. Input validation is implemented on all API endpoints, and the use of Prisma ORM for database access provides automatic parameterisation of SQL queries, effectively preventing SQL injection attacks. The role-based access control system implements the principle of least privilege, and the audit logging system provides an immutable record of all user actions, enabling detection and investigation of suspicious activities."),
  ];
}

function sec_4_7() {
  const tH = ["Test Category", "Test Case", "Expected Result", "Status"];
  const tR = [
    ["Authentication", "Valid credentials login", "Session cookie created, user data returned", "Passed"],
    ["Authentication", "Invalid password login", "401 response, LOGIN_FAILED audit log", "Passed"],
    ["Authentication", "Deactivated account login", "401 response with deactivation message", "Passed"],
    ["CRUD Operations", "Create new device record", "Device created, audit log entry generated", "Passed"],
    ["CRUD Operations", "Update vulnerability status", "Status updated, audit log generated", "Passed"],
    ["Filtering", "Filter devices by risk level", "Only matching devices returned", "Passed"],
    ["RBAC", "Viewer attempts data modification", "403 Forbidden response", "Passed"],
    ["RBAC", "Analyst attempts user management", "403 Forbidden response", "Passed"],
    ["Dashboard", "Statistics accuracy verification", "Counts match database totals", "Passed"],
    ["Audit Log", "CRUD operations generate log entries", "All operations logged correctly", "Passed"],
    ["Dark Mode", "Toggle and persist preference", "Theme persists after page reload", "Passed"],
  ];
  return [
    heading2("4.7 System Testing and Validation"),
    bodyParagraph("System testing was conducted throughout the development lifecycle of the NISAAP platform to ensure that each functional module met its specified requirements and that the integrated system performed reliably under expected operational conditions. The testing strategy encompassed multiple levels, including unit testing of individual API endpoints, integration testing of module interactions, and system-level testing of end-to-end workflows. Table 4-5 presents the key test cases and their outcomes."),
    tableCaption("Table 4-5: NISAAP System Test Cases and Results"),
    createAcademicTable(tH, tR, [1800, 2800, 3200, 1200]),
    bodyParagraph("Authentication testing verified the security of the login and session management mechanisms. Tests confirmed that valid credentials result in successful authentication with a properly configured session cookie. Invalid credentials returned 401 Unauthorised responses without creating session cookies. Failed authentication attempts generated audit log entries with the LOGIN_FAILED action type. Deactivated accounts were confirmed to be denied access regardless of credential validity. Session expiry was tested by verifying that expired cookies no longer grant access to protected endpoints."),
    bodyParagraph("Module-level testing validated the CRUD operations for each data model. The IoT Device Management module was tested with the 31 seeded device records, verifying that filtering and search functionality produces accurate results. The Vulnerability Management module was tested with the 26 seeded records, confirming that severity classifications, CVSS scores, and status transitions function as designed, and that the automatic device risk level update mechanism correctly recalculates risk levels. Role-based access control testing confirmed that the three user roles have the appropriate access privileges, with unauthorised access attempts returning 403 Forbidden responses and generating audit log entries. The dark mode feature was tested across all application views to ensure consistent rendering, with colour contrast ratios validated against WCAG 2.1 Level AA requirements."),
  ];
}

function sec_4_8() {
  return [
    heading2("4.8 Chapter Summary"),
    bodyParagraph("This chapter has presented the comprehensive design and implementation of the Network Infrastructure Security Assessment and Action Platform (NISAAP), a web-based IoT security management system developed for the National Railways of Zimbabwe. The system was designed using a three-tier architecture that separates the presentation, application logic, and data persistence layers, providing a maintainable and scalable foundation for managing IoT security across NRZ's railway operations. The technology stack, comprising Next.js 16, TypeScript, Tailwind CSS 4, Prisma ORM, and SQLite, was selected to balance security, performance, and operational simplicity in the context of NRZ's infrastructure constraints."),
    bodyParagraph("The database design defines six core models that capture the complete data domain of IoT security management, supporting the full lifecycle from device registration through vulnerability discovery, remediation tracking, security assessment, and audit compliance. The implementation of nine functional modules, including authentication, dashboard, IoT device management, vulnerability management, security solutions, assessment, audit logging, user management, and dark mode, provides a comprehensive suite of security management tools that address the specific requirements identified in the vulnerability assessment of NRZ's IoT infrastructure."),
    bodyParagraph("The REST API design provides a well-documented and secure interface for all system operations, with consistent authentication enforcement, error handling, and audit logging. The system security considerations documented the multiple layers of protection implemented, including scrypt password hashing, HTTP-only session cookies with SameSite=Strict, role-based access control, and comprehensive audit logging. System testing validated the functional correctness, security properties, and user experience of each module, confirming that the platform meets its specified requirements for reliability, security, and usability."),
    bodyParagraph("The NISAAP platform demonstrates that a focused, well-designed web application can effectively address the IoT security challenges facing railway operators, providing a practical tool for managing the growing attack surface created by the proliferation of connected devices in operational technology environments. The platform's modular architecture supports future expansion, including the potential integration of real-time threat intelligence feeds, automated vulnerability scanning, and machine learning-based anomaly detection, which would further enhance NRZ's ability to protect its IoT infrastructure against evolving cyber threats."),
  ];
}

// =================== BUILD DOCUMENT ===================

async function generateDocument() {
  console.log("Generating Chapter 4 DOCX (target: 15 pages)...");
  const allContent = [
    ...sec_4_0(), ...sec_4_1(), ...sec_4_2(), ...sec_4_3(),
    ...sec_4_4(), ...sec_4_5(), ...sec_4_6(), ...sec_4_7(), ...sec_4_8(),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 24 }, paragraph: { spacing: { line: 360 } } },
        heading1: { run: { font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 32, bold: true }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 240, line: 360 } } },
        heading2: { run: { font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 30, bold: true }, paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 240, after: 120, line: 360 } } },
        heading3: { run: { font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 28, bold: true }, paragraph: { alignment: AlignmentType.LEFT, spacing: { before: 200, after: 120, line: 360 } } },
      },
    },
    sections: [{
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT } },
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } }, children: [new TextRun({ text: "NISAAP System Design and Implementation", font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 18, color: "666666" })] })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 20 })] })] }),
      },
      children: allContent,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`Document generated: ${OUTPUT_PATH}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

generateDocument().catch((err) => { console.error("Error:", err); process.exit(1); });
