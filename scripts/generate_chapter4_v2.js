const docx = require("docx");
const fs = require("fs");
const path = require("path");

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, PageBreak, Header, Footer, PageNumber,
  NumberFormat, TableLayoutType, VerticalAlign
} = docx;

// =================== CONSTANTS ===================
const SCREENSHOTS_DIR = "/home/z/my-project/download/screenshots";
const OUTPUT_PATH = "/home/z/my-project/download/Munyaradzi_Patama_B221315B_Chapter_4.docx";

const MARGIN_TOP = 1440;
const MARGIN_BOTTOM = 1440;
const MARGIN_LEFT = 1701;
const MARGIN_RIGHT = 1417;

const FONT_EN = "Times New Roman";
const FONT_CJK = "SimSun";
const CM_TO_EMU = 360000;

// =================== HELPER FUNCTIONS ===================
function loadScreenshot(filename) {
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`WARNING: Screenshot not found: ${filepath}`);
    return null;
  }
  return fs.readFileSync(filepath);
}

function getImageDimensions(imageBuffer, maxCmWidth) {
  const maxWidthEMU = maxCmWidth * CM_TO_EMU;
  let origW = 1920, origH = 1080;
  try {
    origW = imageBuffer.readUInt32BE(16);
    origH = imageBuffer.readUInt32BE(20);
  } catch(e) {}
  const ratio = origW / origH;
  const maxHeightEMU = Math.round(maxWidthEMU / ratio);
  return { maxWidthEMU, maxHeightEMU };
}

function bodyParagraph(text, options = {}) {
  const {
    bold = false,
    italic = false,
    alignment = AlignmentType.JUSTIFIED,
    spacing = { line: 360, before: 0, after: 120 },
    indent = { firstLine: 480 },
    font = FONT_EN,
    size = 24,
  } = options;
  return new Paragraph({
    alignment, spacing, indent,
    children: [
      new TextRun({
        text, bold, italic,
        font: { name: font, eastAsia: FONT_CJK },
        size,
      }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240, line: 360 },
    children: [
      new TextRun({
        text, bold: true,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 32,
      }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 120, line: 360 },
    children: [
      new TextRun({
        text, bold: true,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 30,
      }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 120, line: 360 },
    children: [
      new TextRun({
        text, bold: true,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 28,
      }),
    ],
  });
}

function heading4(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_4,
    alignment: AlignmentType.LEFT,
    spacing: { before: 160, after: 100, line: 360 },
    children: [
      new TextRun({
        text, bold: true, italic: true,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 26,
      }),
    ],
  });
}

function figureCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200, line: 360 },
    children: [
      new TextRun({
        text, font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 21, bold: true,
      }),
    ],
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120, line: 360 },
    children: [
      new TextRun({
        text, font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 21, bold: true,
      }),
    ],
  });
}

function imageParagraph(imageBuffer, maxWidthCm) {
  const dims = getImageDimensions(imageBuffer, maxWidthCm);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 0 },
    children: [
      new ImageRun({
        data: imageBuffer,
        transformation: {
          width: Math.round(dims.maxWidthEMU / 9525),
          height: Math.round(dims.maxHeightEMU / 9525),
        },
        type: "png",
      }),
    ],
  });
}

function createAcademicTable(headers, rows, colWidths) {
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const topBorder = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
  const bottomBorder = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
  const thinBottomBorder = { style: BorderStyle.SINGLE, size: 6, color: "000000" };

  function headerCell(text, width) {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      borders: { top: topBorder, bottom: thinBottomBorder, left: noBorder, right: noBorder },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40, line: 360 },
          children: [
            new TextRun({ text, bold: true, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 21 }),
          ],
        }),
      ],
    });
  }

  function dataCell(text, width, isLastRow = false) {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      borders: { top: noBorder, bottom: isLastRow ? bottomBorder : noBorder, left: noBorder, right: noBorder },
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 20, after: 20, line: 340 },
          indent: { left: 60 },
          children: [
            new TextRun({ text, font: { name: FONT_EN, eastAsia: FONT_CJK }, size: 20 }),
          ],
        }),
      ],
    });
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => headerCell(h, colWidths[i])),
  });

  const dataRows = rows.map((row, rowIdx) =>
    new TableRow({
      children: row.map((cell, colIdx) =>
        dataCell(cell, colWidths[colIdx], rowIdx === rows.length - 1)
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    layout: TableLayoutType.FIXED,
  });
}

// =================== CONTENT SECTIONS ===================

function section_4_0_introduction() {
  return [
    heading1("CHAPTER 4: SYSTEM DESIGN AND IMPLEMENTATION"),

    heading2("4.0 Introduction"),

    bodyParagraph(
      "This chapter presents the detailed design and implementation of the Network Infrastructure Security Assessment and Action Platform (NISAAP), a web-based IoT security management system developed specifically for the National Railways of Zimbabwe (NRZ). The chapter systematically documents the architectural decisions, technology selections, database design, and implementation details of each functional module that constitutes the NISAAP platform. The system was designed to address the critical security gaps identified in the vulnerability assessment of NRZ's IoT infrastructure, as discussed in the preceding chapters of this study."
    ),

    bodyParagraph(
      "The design and implementation process followed a structured methodology that incorporated industry best practices for secure software development. The platform was conceived as a comprehensive solution to manage, monitor, and mitigate security risks associated with the growing deployment of Internet of Things devices across NRZ's railway operations. These IoT devices, which include signal controllers, CCTV cameras, track sensors, network gateways, routers, and GPS trackers, form the operational backbone of the railway network and require robust security management to ensure both operational continuity and passenger safety. The proliferation of these connected devices has expanded the attack surface of NRZ's network infrastructure, creating an urgent need for a centralised platform that can provide real-time visibility into the security posture of each device and enable coordinated remediation of identified vulnerabilities."
    ),

    bodyParagraph(
      "The chapter begins with an overview of the system architecture, explaining the layered design approach and the interaction between the presentation, application logic, and data persistence layers. This is followed by a detailed discussion of the technology stack, providing justification for each technology choice in the context of NRZ's operational requirements and infrastructure constraints. The database design section presents the entity-relationship model, the Prisma schema definition, and the six core data models that underpin the platform. The subsequent sections provide an in-depth examination of each functional module, including authentication, dashboard, IoT device management, vulnerability management, security solutions, assessment, audit logging, and the dark mode user interface feature. Each module is presented with its design rationale, implementation details, and visual evidence in the form of system screenshots. The chapter also presents the REST API design, system security considerations, and testing validation, ensuring that all components meet the specified functional and security requirements. The chapter concludes with a summary that synthesises the key design decisions and implementation outcomes."
    ),
  ];
}

function section_4_1_system_architecture() {
  return [
    heading2("4.1 System Architecture"),

    bodyParagraph(
      "The NISAAP platform was designed using a three-tier architecture that separates the presentation layer, application logic layer, and data persistence layer. This architectural pattern was selected for its well-established benefits in terms of maintainability, scalability, and security. The separation of concerns inherent in the three-tier model allows each layer to be developed, tested, and modified independently, which is particularly important for a security-critical system deployed in a railway operations environment where system availability and reliability are paramount. The three-tier approach also facilitates future extension and modification of individual layers without requiring changes to the other layers, reducing the risk of regression errors and minimising the operational impact of system updates."
    ),

    bodyParagraph(
      "As illustrated in Figure 4-1, the NISAAP system architecture follows a client-server model where the web browser serves as the client, the Next.js application server handles both static asset serving and API request processing, and the SQLite database provides persistent data storage. The architecture supports concurrent user access through the stateless API design, with user sessions managed through HTTP-only cookies containing encoded session data. This design ensures that the system can support multiple users across different departments, including IT Security, Network Operations, Cybersecurity, and Management, each with appropriate role-based access privileges."
    ),

    (() => {
      const img = loadScreenshot("02_dashboard.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-1: NISAAP Dashboard Overview Showing System Architecture Components"));
      return elements;
    })(),

    heading3("4.1.1 Presentation Tier"),

    bodyParagraph(
      "The presentation tier, or frontend layer, was implemented using Next.js 16 with React, providing a responsive and interactive user interface. This tier communicates with the application tier exclusively through RESTful API endpoints, ensuring a clean separation between the user-facing components and the business logic. The choice of Next.js as the frontend framework provided significant advantages, including server-side rendering capabilities for improved initial page load performance, automatic code splitting for optimised bundle sizes, and a robust file-based routing system that simplifies navigation architecture. The user interface was constructed using Tailwind CSS 4 for utility-first styling and shadcn/ui for consistent, accessible component design, resulting in a professional and intuitive interface that aligns with NRZ's corporate branding guidelines."
    ),

    bodyParagraph(
      "The presentation tier manages client-side state through the Zustand library, which provides a lightweight and efficient state management solution. The Zustand store maintains the current user session information, the active navigation view, sidebar state, and dark mode preference. This centralised state management approach ensures that all components have consistent access to the application state, eliminating the need for prop drilling or complex context hierarchies. The store is designed with a clear interface that defines the state shape and the available actions, providing type safety through TypeScript and ensuring that state transitions are predictable and traceable. The Zustand store's design follows the single-store pattern, where all application state is contained within a single store object, which simplifies state debugging and enables straightforward implementation of features such as state persistence to localStorage for the dark mode preference."
    ),

    heading3("4.1.2 Application Tier"),

    bodyParagraph(
      "The application tier, or backend layer, was implemented using Next.js API Routes, which provide a Node.js-based server environment integrated within the Next.js framework. This approach eliminates the need for a separate backend server, reducing deployment complexity and infrastructure requirements, which is particularly advantageous given NRZ's resource constraints. The API layer implements the business logic for all functional modules, including authentication, data validation, role-based access control, and audit logging. Each API endpoint follows RESTful design principles, accepting JSON requests and returning structured JSON responses with appropriate HTTP status codes. The use of Next.js API Routes ensures that the backend code is co-located with the frontend code, simplifying deployment, version control, and development workflow."
    ),

    bodyParagraph(
      "The application tier enforces a consistent authentication verification pattern across all protected endpoints. Each protected endpoint begins by extracting the session cookie from the request headers and decoding it to retrieve the user's identity and role. If no valid session is found, the endpoint returns a 401 Unauthorised response. This authentication check is implemented as a reusable function called checkAuth, which is invoked at the beginning of every protected API handler. The function extracts the session data from the cookie header using the getSessionFromCookie utility from the authentication library, and returns the user ID and role if the session is valid. This consistent authentication pattern ensures that no protected resource can be accessed without proper credentials, providing a robust security boundary around the application's data and functionality."
    ),

    heading3("4.1.3 Data Persistence Tier"),

    bodyParagraph(
      "The data persistence tier utilises SQLite as the relational database engine, accessed through the Prisma Object-Relational Mapping (ORM) framework. SQLite was selected for its zero-configuration deployment model, which eliminates the need for a separate database server process, thereby reducing the attack surface and simplifying system administration. The database file is stored locally on the server, providing fast data access without network latency, which is particularly beneficial for the dashboard statistics endpoint that performs multiple aggregation queries. Prisma ORM provides type-safe database queries, automatic migration management, and a declarative schema definition language that ensures data integrity and consistency. The combination of SQLite and Prisma offers an optimal balance between performance, security, and operational simplicity for the NRZ deployment context."
    ),

    bodyParagraph(
      "The Prisma client is initialised through a singleton pattern implemented in the database library module, which ensures that only one instance of the PrismaClient is created per application lifecycle. This singleton pattern prevents the creation of excessive database connections, which is particularly important in a serverless-like environment such as Next.js API Routes, where each request could potentially create a new PrismaClient instance if the singleton pattern is not used. The database connection is configured through the DATABASE_URL environment variable, which specifies the path to the SQLite database file. The Prisma migration system manages schema evolution, generating SQL migration scripts that are applied to the database in a controlled and reversible manner, ensuring that schema changes are tracked and can be rolled back if necessary."
    ),
  ].flat();
}

function section_4_2_technology_stack() {
  const techHeaders = ["Category", "Technology", "Version", "Purpose"];
  const techRows = [
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
    ["Build Tool", "Next.js (Turbopack)", "16", "Optimised bundling and hot module replacement"],
  ];

  return [
    heading2("4.2 Technology Stack"),

    bodyParagraph(
      "The selection of the technology stack for NISAAP was guided by several critical considerations, including the operational environment of NRZ, the need for security by design, the availability of developer expertise, and the requirement for long-term maintainability. Each technology was evaluated against these criteria, and the final stack represents a carefully curated combination of industry-proven tools that collectively deliver a secure, performant, and maintainable platform. Table 4-1 provides a comprehensive overview of the technologies employed in the NISAAP platform."
    ),

    tableCaption("Table 4-1: NISAAP Technology Stack Overview"),
    createAcademicTable(techHeaders, techRows, [2200, 2400, 1200, 5000]),

    bodyParagraph(
      "The decision to use Next.js 16 as the primary framework for both frontend and backend development was driven by its unified development model, which eliminates the complexity of maintaining separate frontend and backend codebases. Next.js provides server-side rendering for improved initial page load performance, automatic code splitting to reduce bundle sizes, and a file-based routing system that simplifies navigation architecture. The framework's API Routes feature enables the creation of server-side API endpoints within the same application, reducing deployment overhead and ensuring consistent security policies across the entire application stack. Additionally, Next.js 16 introduces support for the Turbopack bundler, which provides significantly faster build times and hot module replacement, improving the development experience and reducing the time required to iterate on code changes."
    ),

    bodyParagraph(
      "TypeScript was adopted as the primary programming language due to its static type system, which provides compile-time error detection and enhances code reliability. In a security-critical application such as NISAAP, the elimination of type-related runtime errors is particularly important. TypeScript's type system enforces data contracts throughout the application, from API request validation to database query results, reducing the likelihood of data handling vulnerabilities. The combination of TypeScript with Prisma's type-safe query API creates a fully type-safe data pipeline from the database to the user interface, where data types are enforced at every stage of the data flow. This end-to-end type safety significantly reduces the risk of data corruption, injection attacks, and other security vulnerabilities that can arise from improper data handling."
    ),

    bodyParagraph(
      "The choice of SQLite as the database engine, paired with Prisma ORM, was motivated by several factors specific to the NRZ deployment context. SQLite's serverless architecture eliminates the need for a separate database server process, which reduces infrastructure requirements, simplifies deployment, and minimises the attack surface. Unlike traditional client-server databases such as PostgreSQL or MySQL, SQLite operates directly on the file system, providing fast data access without the overhead of network communication. Prisma ORM provides a declarative schema definition language, automatic migration generation, and type-safe database queries, which significantly reduce the risk of SQL injection vulnerabilities and data integrity issues. The ORM's migration system ensures that database schema changes are versioned, reversible, and consistently applied across deployment environments."
    ),

    bodyParagraph(
      "For authentication, the system implements a custom JWT-based mechanism using Node.js's built-in cryptographic functions. Passwords are hashed using the scrypt key derivation function, which provides resistance against brute-force and rainbow table attacks through its memory-hard computational requirements. Session data is encoded and stored in HTTP-only cookies, which prevents client-side JavaScript access and mitigates cross-site scripting attacks targeting session tokens. The cookie-based session approach was chosen over server-side session storage to maintain the stateless nature of the API layer while still providing secure session management. The decision to use the built-in Node.js crypto module rather than external libraries such as bcrypt was motivated by the desire to minimise external dependencies and reduce the potential supply chain attack surface."
    ),

    bodyParagraph(
      "The user interface was constructed using Tailwind CSS 4 for utility-first styling and shadcn/ui for accessible, customisable component design. Tailwind CSS provides a consistent design system through utility classes, which ensures visual consistency across all modules while allowing for efficient customisation. The shadcn/ui component library offers pre-built, accessible components that conform to the Web Content Accessibility Guidelines (WCAG), ensuring that the platform is usable by individuals with disabilities. The combination of these styling technologies enabled the implementation of NRZ's corporate brand colours, including Navy Blue (#003366), Gold (#C5A55A), Dark Navy (#1A2B4A), and contextual colours for risk indicators such as red (#CC0000) for critical alerts, amber (#FF8F00) for high severity, and green (#2E7D32) for resolved items, creating a professional and organisationally aligned visual identity. The Recharts library was selected for data visualisation on the dashboard, providing interactive and responsive charts that render the vulnerability severity distribution and device type composition in a clear and informative manner."
    ),
  ];
}

function section_4_3_database_design() {
  const modelHeaders = ["Model", "Key Fields", "Relationships", "Records Seeded"];
  const modelRows = [
    ["User", "id, username, email, fullName, role, department, isActive", "Has many Assessments, AuditLogs", "10"],
    ["IoTDevice", "id, deviceName, deviceType, ipAddress, macAddress, location, station, status, riskLevel", "Has many Vulnerabilities, Assessments", "31"],
    ["Vulnerability", "id, deviceId, title, description, severity, cvssScore, cveId, status", "Belongs to IoTDevice; Has many SecuritySolutions", "26"],
    ["SecuritySolution", "id, vulnerabilityId, title, description, implementationStatus, priority, costEstimate", "Belongs to Vulnerability", "22"],
    ["Assessment", "id, deviceId, assessorId, findings, recommendations, riskRating", "Belongs to IoTDevice, User", "14"],
    ["AuditLog", "id, userId, action, module, details, ipAddress, timestamp", "Belongs to User (optional)", "93"],
  ];

  const userFieldsHeaders = ["Field", "Type", "Constraints", "Description"];
  const userFieldsRows = [
    ["id", "String", "@id @default(cuid())", "Unique identifier generated using CUID algorithm"],
    ["username", "String", "@unique", "Login username, must be unique across the system"],
    ["password", "String", "Required", "Scrypt-hashed password with 16-byte salt and 64-byte key"],
    ["email", "String", "@unique", "User email address, must be unique for communication"],
    ["fullName", "String", "Required", "Full name of the user for display purposes"],
    ["role", "String", "@default('analyst')", "Access role: admin, analyst, or viewer"],
    ["department", "String", "@default('IT Security')", "Organisational department of the user"],
    ["isActive", "Boolean", "@default(true)", "Account status flag for activation/deactivation"],
    ["lastLogin", "DateTime", "Optional", "Timestamp of most recent successful authentication"],
    ["createdAt", "DateTime", "@default(now())", "Record creation timestamp"],
    ["updatedAt", "DateTime", "@updatedAt", "Automatic update timestamp"],
  ];

  const deviceFieldsHeaders = ["Field", "Type", "Constraints", "Description"];
  const deviceFieldsRows = [
    ["id", "String", "@id @default(cuid())", "Unique device identifier"],
    ["deviceName", "String", "Required", "Human-readable device name"],
    ["deviceType", "String", "Required", "Category: controller, camera, sensor, gateway, router, tracker"],
    ["ipAddress", "String", "Required", "Network IP address of the device"],
    ["macAddress", "String", "Optional", "Hardware MAC address for layer-2 identification"],
    ["location", "String", "Required", "Physical location description"],
    ["station", "String", "Optional", "Railway station where device is deployed"],
    ["status", "String", "@default('active')", "Operational status: active, inactive, maintenance"],
    ["firmwareVersion", "String", "Optional", "Current firmware version for patch management"],
    ["lastScanDate", "DateTime", "Optional", "Date of most recent security scan"],
    ["riskLevel", "String", "@default('low')", "Aggregate risk: critical, high, medium, low"],
    ["networkSegment", "String", "Optional", "Network segment or VLAN assignment"],
    ["createdAt", "DateTime", "@default(now())", "Record creation timestamp"],
    ["updatedAt", "DateTime", "@updatedAt", "Automatic update timestamp"],
  ];

  return [
    heading2("4.3 Database Design"),

    bodyParagraph(
      "The database design for NISAAP follows a relational model that captures the complex interrelationships between users, IoT devices, vulnerabilities, security solutions, assessments, and audit logs. The schema was defined using Prisma's declarative schema definition language, which provides a clear, human-readable representation of the data model and automatically generates the SQL migration scripts required to create the database structure. The design prioritises data integrity through the use of foreign key constraints, cascade deletion rules, and unique field constraints, ensuring that the database maintains consistency even under concurrent access conditions. The relational model was chosen over alternative data models such as document-oriented or graph databases because the NISAAP data domain is inherently relational, with well-defined relationships between entities such as devices and their vulnerabilities, vulnerabilities and their solutions, and users and their assessments."
    ),

    bodyParagraph(
      "The Prisma schema defines six core models that collectively represent the complete data domain of the NISAAP platform. Each model was designed with careful consideration of the specific data requirements of NRZ's IoT security management operations. As shown in Figure 4-2, the Prisma schema code defines the complete data model, including field types, default values, relationships, and constraints. The schema serves as both the documentation and the implementation of the database design, ensuring that the documented design and the actual implementation remain synchronised throughout the development lifecycle."
    ),

    (() => {
      const img = loadScreenshot("10_prisma_schema.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 15));
      elements.push(figureCaption("Figure 4-2: Prisma Schema Definition for the NISAAP Database Models"));
      return elements;
    })(),

    bodyParagraph(
      "Table 4-2 provides a summary of the six database models, their key fields, relationships, and the number of records seeded during the initial deployment. The data model was designed to support the full lifecycle of IoT security management, from device registration and vulnerability discovery through remediation tracking and audit compliance reporting."
    ),

    tableCaption("Table 4-2: NISAAP Database Models Summary"),
    createAcademicTable(modelHeaders, modelRows, [1600, 3200, 3200, 1400]),

    heading3("4.3.1 User Model"),

    bodyParagraph(
      "The User model stores authentication credentials and role information for all system users. Password security is implemented through the scrypt key derivation function, which generates a 64-byte key from the user's password combined with a 16-byte random salt. The model supports three role levels, namely admin, analyst, and viewer, each with progressively restricted access privileges. The isActive flag allows administrators to deactivate user accounts without deleting them, preserving the integrity of audit logs that reference the user. The lastLogin field tracks the most recent authentication event, supporting security monitoring and inactive account detection. Table 4-3 presents the detailed field specifications for the User model."
    ),

    tableCaption("Table 4-3: User Model Field Specifications"),
    createAcademicTable(userFieldsHeaders, userFieldsRows, [1800, 1200, 2200, 5600]),

    heading3("4.3.2 IoTDevice Model"),

    bodyParagraph(
      "The IoTDevice model captures comprehensive information about each IoT device deployed across the NRZ railway network. Key fields include the device type, which categorises devices as controllers, cameras, sensors, gateways, routers, or trackers; the network location, which identifies the station and physical placement; and the risk level, which provides an aggregate security risk rating. The model also stores network configuration data, including IP and MAC addresses, network segment, and firmware version, which are essential for vulnerability assessment and network security analysis. The status field tracks whether the device is currently active, inactive, or undergoing maintenance, enabling the system to provide an accurate real-time inventory of the IoT fleet. Table 4-4 presents the detailed field specifications for the IoTDevice model."
    ),

    tableCaption("Table 4-4: IoTDevice Model Field Specifications"),
    createAcademicTable(deviceFieldsHeaders, deviceFieldsRows, [1800, 1200, 2200, 5600]),

    heading3("4.3.3 Vulnerability Model"),

    bodyParagraph(
      "The Vulnerability model represents security weaknesses discovered in IoT devices, with detailed fields for severity classification, CVSS scoring, and CVE tracking. The severity field categorises vulnerabilities as critical, high, medium, or low, following the Common Vulnerability Scoring System guidelines. The cvssScore field stores the numerical CVSS score on a scale from 0.0 to 10.0, enabling quantitative risk analysis and prioritisation. The cveId field links the vulnerability to known CVE entries, facilitating cross-referencing with public vulnerability databases such as the National Vulnerability Database maintained by NIST. The status field tracks the remediation lifecycle from discovery through to resolution, with states including open, acknowledged, in_progress, resolved, and accepted_risk. The cascade deletion rule ensures that when a device is removed from the system, all associated vulnerability records are also deleted, maintaining referential integrity."
    ),

    heading3("4.3.4 SecuritySolution Model"),

    bodyParagraph(
      "The SecuritySolution model links remediation actions to identified vulnerabilities, creating a traceable path from vulnerability discovery to resolution. Each solution includes an implementation status that tracks progress from proposed through to implemented and verified. The priority field, which can be critical, high, medium, or low, ensures that remediation efforts are focused on the most impactful security gaps. The model also captures project management information, including the assigned security analyst through the assignedTo field, due dates and completion dates for timeline management, and cost estimates for budget planning. The cascade deletion rule between SecuritySolution and Vulnerability ensures that when a vulnerability is deleted, its associated solutions are also removed, preventing orphaned solution records."
    ),

    heading3("4.3.5 Assessment Model"),

    bodyParagraph(
      "The Assessment model records formal security assessments conducted on IoT devices by authorised users. Each assessment links a device to an assessor through foreign key relationships with both the IoTDevice and User models. The model captures detailed findings, which document the identified weaknesses, configuration issues, and compliance gaps discovered during the evaluation. The recommendations field provides specific corrective actions suggested by the assessor, while the riskRating field provides an overall assessment of the device's security risk level, categorised as critical, high, medium, or low. The relationship between Assessment and User models ensures that each assessment is attributable to a specific analyst, supporting accountability and quality assurance in the assessment process. The assessmentDate field enables tracking of assessment frequency, ensuring that devices are reassessed at appropriate intervals."
    ),

    heading3("4.3.6 AuditLog Model"),

    bodyParagraph(
      "The AuditLog model provides a comprehensive record of all user actions within the system, supporting compliance reporting and forensic investigation capabilities. Every significant action, including login events, data modifications, and configuration changes, is automatically logged with the user identity, action type, module, detailed description, and timestamp. The audit log is append-only, meaning that records cannot be modified or deleted through the application interface, ensuring the integrity of the audit trail. The optional relationship between the AuditLog model and the User model, indicated by the nullable userId field, allows the system to log actions performed by unauthenticated users, such as failed login attempts, while still maintaining the ability to associate authenticated actions with specific user accounts. The ipAddress field provides additional forensic information that can be used to identify the source of suspicious activities. With 93 audit log records seeded during initial deployment, the system demonstrates comprehensive activity tracking across all modules."
    ),
  ].flat();
}

function section_4_4_system_implementation() {
  return [
    heading2("4.4 System Implementation"),

    bodyParagraph(
      "This section presents the detailed implementation of each functional module within the NISAAP platform. The implementation follows a modular design where each module encapsulates its own business logic, API endpoints, and user interface components. This modular approach facilitates independent testing, maintenance, and future extension of individual modules without affecting the overall system stability. Each subsection provides a description of the module's functionality, the design decisions that shaped its implementation, and visual evidence of the module in operation."
    ),

    // 4.4.1 Authentication Module
    heading3("4.4.1 Authentication Module"),

    bodyParagraph(
      "The authentication module serves as the primary security gateway to the NISAAP platform, controlling access to all system functionality through a username and password verification process. The module implements a secure authentication workflow that begins with the user submitting credentials through the login page, as shown in Figure 4-3. The system validates the submitted credentials against the stored password hash using the scrypt key derivation function, which provides resistance against timing attacks through the use of the timingSafeEqual comparison function. The login page features a clean, professional design that incorporates the NRZ brand colours, with the navy blue header and gold accent elements creating a visually distinctive and organisationally appropriate authentication interface."
    ),

    (() => {
      const img = loadScreenshot("01_login_page.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-3: NISAAP Login Page with Secure Authentication Interface"));
      return elements;
    })(),

    bodyParagraph(
      "The authentication process follows a multi-step verification workflow designed to prevent common attack vectors. Upon receiving a login request, the API endpoint first validates that both username and password fields are present, returning a 400 Bad Request response if either field is missing. The system then retrieves the user record from the database and checks whether the account is active, returning a 401 Unauthorised response if the account has been deactivated. This two-step validation ensures that deactivated accounts cannot be used to gain access to the system, even if valid credentials are provided. Password verification is performed using the scrypt algorithm with a 16-byte random salt and a 64-byte derived key, providing strong resistance against brute-force attacks. The scrypt function was chosen over alternative hashing algorithms such as bcrypt because it is memory-hard, meaning that it requires a significant amount of RAM to compute, which makes hardware-based brute-force attacks using GPUs or ASICs considerably more expensive to execute."
    ),

    bodyParagraph(
      "Upon successful authentication, the system creates a session cookie containing the user's identifier, username, and role. The session data is encoded using Base64 encoding and stored in an HTTP-only cookie with the Secure, SameSite=Strict, and Max-Age=86400 attributes. The HTTP-only flag prevents client-side JavaScript from accessing the cookie, mitigating cross-site scripting attacks that attempt to steal session tokens. The SameSite=Strict attribute ensures that the cookie is only sent with same-origin requests, preventing cross-site request forgery attacks where a malicious website could attempt to send authenticated requests to the NISAAP platform. The Max-Age attribute limits the session duration to 24 hours, after which the user must re-authenticate, reducing the window of opportunity for session hijacking attacks. The system also updates the user's lastLogin timestamp and logs the successful authentication event in the audit log, creating a complete record of all authentication activities."
    ),

    (() => {
      const img = loadScreenshot("11_auth_api.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 15));
      elements.push(figureCaption("Figure 4-4: Authentication API Implementation Code"));
      return elements;
    })(),

    bodyParagraph(
      "The authentication module enforces role-based access control through three distinct user roles: admin, analyst, and viewer. Administrators have full access to all system functionality, including user management, device registration, vulnerability management, and system configuration. Analysts can perform security assessments, manage vulnerabilities and solutions, and view device information but cannot manage user accounts or modify system configuration. Viewers have read-only access to dashboard statistics, device inventories, and vulnerability reports, enabling management stakeholders to monitor security posture without the ability to modify system data. This hierarchical access model implements the principle of least privilege, ensuring that each user can only perform actions appropriate to their role, thereby reducing the risk of accidental or malicious data modification."
    ),

    bodyParagraph(
      "The logout functionality is implemented through a dedicated API endpoint that clears the session cookie by setting its Max-Age attribute to zero, effectively instructing the browser to delete the cookie. The endpoint also logs the logout event in the audit log, providing a complete record of the user's session from login to logout. The session verification endpoint allows the frontend to check the validity of the current session on application load, enabling automatic redirection to the login page if the session has expired. This session verification is performed each time the application is loaded or refreshed, ensuring that expired or invalid sessions are detected and handled gracefully without requiring the user to attempt an action before being prompted to re-authenticate."
    ),

    // 4.4.2 Dashboard Module
    heading3("4.4.2 Dashboard Module"),

    bodyParagraph(
      "The dashboard module provides a comprehensive overview of the IoT security landscape across the NRZ railway network, aggregating data from all other modules into a unified visual interface. As illustrated in Figure 4-5, the dashboard presents key performance indicators, risk distribution charts, severity breakdowns, and recent activity logs, enabling security administrators to quickly assess the current security posture and identify areas requiring immediate attention. The dashboard is designed as the landing page after successful authentication, ensuring that users are immediately presented with the most critical security information upon entering the system."
    ),

    (() => {
      const img = loadScreenshot("02_dashboard.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-5: NISAAP Dashboard Module with Security Statistics and Visualisations"));
      return elements;
    })(),

    bodyParagraph(
      "The dashboard aggregates data from multiple database queries to present real-time security metrics. The primary statistics displayed include the total number of IoT devices, the number of active devices, the count of open vulnerabilities, and the number of critical and high-severity alerts. These headline metrics provide an immediate snapshot of the security state, allowing administrators to identify potential issues at a glance. The dashboard also presents the risk distribution of IoT devices across four categories: critical, high, medium, and low, visualised through colour-coded indicators using the NRZ brand palette. The statistics cards at the top of the dashboard are designed with prominent colour coding to draw immediate attention to critical metrics, with the total devices count displayed in navy blue, active devices in green, open vulnerabilities in amber, and critical alerts in red."
    ),

    bodyParagraph(
      "The severity distribution chart provides a visual breakdown of vulnerabilities by severity level, enabling security teams to quickly assess the overall risk landscape. This chart uses distinct colours for each severity level, with critical vulnerabilities displayed in red (#CC0000), high in amber (#FF8F00), medium in gold (#C5A55A), and low in green (#2E7D32), consistent with industry-standard risk visualisation conventions. The device type distribution chart shows the composition of the IoT fleet by category, including controllers, cameras, sensors, gateways, routers, and trackers, supporting resource allocation decisions for security monitoring and maintenance activities. Both charts are implemented using the Recharts library, which provides interactive and responsive visualisations that adapt to different screen sizes and resolutions."
    ),

    (() => {
      const img = loadScreenshot("12_dashboard_api.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 15));
      elements.push(figureCaption("Figure 4-6: Dashboard Statistics API Implementation Code"));
      return elements;
    })(),

    bodyParagraph(
      "The dashboard API endpoint implements authentication verification before returning any data, ensuring that only authenticated users can access security statistics. The endpoint performs multiple database queries to gather comprehensive statistics, including total device counts, active device counts, vulnerability severity distributions, risk level distributions across devices, solution implementation progress, and recent audit log entries. The data is returned in a structured JSON format that the frontend components render as interactive charts and summary cards. The implementation uses Prisma's aggregation and grouping functions, such as the count method with where clauses and the groupBy method, to efficiently compute statistics without requiring raw SQL queries, maintaining type safety throughout the data pipeline. The recent activities section of the dashboard displays the ten most recent audit log entries with the associated user information, providing a real-time view of system activity that supports operational awareness and security monitoring."
    ),

    // 4.4.3 IoT Device Management Module
    heading3("4.4.3 IoT Device Management Module"),

    bodyParagraph(
      "The IoT Device Management module provides comprehensive functionality for managing the entire lifecycle of IoT devices deployed across the NRZ railway network. As illustrated in Figure 4-7, the module presents a searchable, filterable inventory of all registered devices, displaying key attributes such as device name, type, IP address, location, station, status, and risk level. The module supports full CRUD (Create, Read, Update, Delete) operations, allowing administrators to register new devices, update device information, and deactivate devices that have been decommissioned or require maintenance. The device list is presented in a tabular format with sortable columns and colour-coded status and risk level indicators that enable rapid visual identification of devices requiring attention."
    ),

    (() => {
      const img = loadScreenshot("04_iot_devices.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-7: IoT Device Management Module with Device Inventory and Risk Indicators"));
      return elements;
    })(),

    bodyParagraph(
      "The device inventory displays each IoT device with its complete profile, including network configuration data such as IP address, MAC address, and network segment, which are essential for network security analysis and incident response. The device type classification system categorises the 31 seeded devices into six categories: controllers, which manage railway signalling operations; cameras, which provide surveillance coverage of stations and rail yards; sensors, which monitor track conditions and environmental parameters such as temperature and humidity; gateways, which aggregate and route device communications between field devices and the central network; routers, which manage network traffic between segments and enforce access control policies; and trackers, which provide GPS location data for locomotives and rolling stock. Each category presents unique security challenges, and the classification system enables targeted vulnerability assessment and remediation strategies specific to the threat profile of each device type."
    ),

    bodyParagraph(
      "The risk level indicator associated with each device provides an aggregate security risk assessment based on the number and severity of associated vulnerabilities. The risk level is automatically recalculated whenever a vulnerability is created, updated, or resolved, ensuring that the device risk assessment always reflects the current vulnerability state. Devices with critical or high-risk vulnerabilities are flagged with prominent colour indicators, enabling security administrators to prioritise their attention on the most at-risk assets. The module also tracks the firmware version of each device, which is critical for identifying devices running outdated or vulnerable software that may contain known security flaws. The last scan date field records when each device was last assessed for security vulnerabilities, supporting compliance with security audit schedules and identifying devices that are overdue for reassessment."
    ),

    bodyParagraph(
      "The device management module implements filtering capabilities that allow users to narrow the device inventory by type, status, risk level, and station location. These filters are implemented as query parameters in the API endpoint, which constructs dynamic Prisma where clauses based on the provided filter values. The search functionality enables users to locate specific devices by name, IP address, or location, facilitating rapid incident response when a security event is detected. The search is implemented using Prisma's contains operator, which performs case-insensitive substring matching across multiple fields simultaneously using the OR logical operator. The API also implements pagination through the page and limit query parameters, ensuring that the device list loads efficiently even as the number of registered devices grows. The combination of filtering, search, and pagination capabilities ensures that security administrators can efficiently navigate the device inventory regardless of its size."
    ),

    // 4.4.4 Vulnerability Management Module
    heading3("4.4.4 Vulnerability Management Module"),

    bodyParagraph(
      "The Vulnerability Management module is the core security analysis component of the NISAAP platform, providing comprehensive functionality for documenting, tracking, and resolving security vulnerabilities identified in NRZ's IoT infrastructure. As shown in Figure 4-8, the module presents a detailed inventory of all discovered vulnerabilities, including their associated device, severity classification, CVSS score, CVE identifier, and current remediation status. The module supports full CRUD operations for vulnerability records, enabling security analysts to create new vulnerability entries, update severity classifications and status, and close vulnerabilities that have been successfully remediated."
    ),

    (() => {
      const img = loadScreenshot("05_vulnerabilities.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-8: Vulnerability Management Module with Severity Classifications and CVSS Scores"));
      return elements;
    })(),

    bodyParagraph(
      "The module tracks the complete lifecycle of each vulnerability through five status stages: open, acknowledged, in_progress, resolved, and accepted_risk. The open status indicates a newly discovered vulnerability that has not yet been reviewed by the security team. The acknowledged status confirms that the security team has validated the vulnerability and accepted it as a genuine risk that requires remediation. The in_progress status indicates that remediation activities are currently underway. The resolved status marks a vulnerability as successfully remediated, while the accepted_risk status indicates that the organisation has formally accepted the residual risk, typically for low-severity vulnerabilities where remediation costs outweigh the potential impact. This lifecycle model provides a structured workflow for vulnerability management, ensuring that each vulnerability is systematically processed from discovery through to resolution or formal risk acceptance."
    ),

    bodyParagraph(
      "Each vulnerability record includes a CVSS (Common Vulnerability Scoring System) score, which provides a standardised numerical assessment of the vulnerability's severity on a scale from 0.0 to 10.0. The CVSS scoring system enables quantitative risk comparison across different vulnerability types and supports data-driven prioritisation of remediation efforts. The 26 seeded vulnerabilities span the full severity range, with 5 critical vulnerabilities scoring above 9.0, including unencrypted signal communication protocols (CVSS 9.8), default credentials on CCTV systems (CVSS 9.1), and buffer overflow vulnerabilities in point machine controllers (CVSS 9.7). These critical vulnerabilities pose direct threats to railway safety and require immediate remediation. The vulnerability creation endpoint implements an automatic device risk level update mechanism that recalculates the associated device's risk level whenever a new vulnerability is created, ensuring that the device inventory always reflects the current vulnerability state."
    ),

    bodyParagraph(
      "The CVE identifier field links each vulnerability to the Common Vulnerabilities and Exposures database, enabling security analysts to access detailed technical information, known exploit techniques, and vendor advisories for each identified weakness. The module also captures a detailed description of each vulnerability, including the attack vector, potential impact, and affected components, providing the context necessary for informed remediation planning. The remediation field documents the recommended corrective actions, ensuring that security teams have clear guidance on how to address each vulnerability. The relationship between the Vulnerability model and the SecuritySolution model creates a direct link between identified weaknesses and their proposed or implemented remediation actions, enabling security administrators to track the complete remediation pipeline from vulnerability discovery through to solution verification."
    ),

    // 4.4.5 Security Solutions Module
    heading3("4.4.5 Security Solutions Module"),

    bodyParagraph(
      "The Security Solutions module provides a structured framework for managing the remediation of identified vulnerabilities, tracking the implementation of security measures from proposal through to verification. As illustrated in Figure 4-9, the module presents a comprehensive list of security solutions linked to their associated vulnerabilities, displaying key information including the solution title, implementation status, priority level, assigned analyst, and cost estimate. The module supports full CRUD operations for solution records, enabling security analysts to propose new solutions, update implementation status, and record completion details."
    ),

    (() => {
      const img = loadScreenshot("06_security_solutions.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-9: Security Solutions Module with Implementation Tracking and Priority Levels"));
      return elements;
    })(),

    bodyParagraph(
      "The module tracks the implementation lifecycle of each security solution through four status stages: proposed, in_progress, implemented, and verified. The proposed status indicates a solution that has been identified but not yet started. The in_progress status indicates active implementation by the assigned security analyst. The implemented status confirms that the solution has been deployed to the production environment, and the verified status indicates that the solution has been tested and confirmed to effectively mitigate the associated vulnerability. This lifecycle tracking ensures that remediation efforts are systematically managed and that no identified vulnerability remains unaddressed. The transition from implemented to verified requires independent testing and validation, providing quality assurance that the remediation has been effective and has not introduced any new vulnerabilities."
    ),

    bodyParagraph(
      "The priority classification system categorises solutions as critical, high, medium, or low, aligning with the severity of the associated vulnerability and ensuring that remediation resources are directed toward the most impactful security gaps. The 22 seeded security solutions address vulnerabilities across all severity levels, with critical-priority solutions including the implementation of TLS 1.3 encryption for signal communications, emergency firmware patching for point machine controllers, and security hardening of core routing infrastructure. Each solution includes a cost estimate, supporting budget planning and return-on-investment analysis for security investments. The total estimated cost of all proposed and in-progress solutions provides management with a clear picture of the investment required to achieve a comprehensive security posture, enabling informed decision-making about security budget allocation."
    ),

    bodyParagraph(
      "The assignment feature links each solution to a specific security analyst through the assignedTo field, establishing clear accountability for remediation activities. This assignment mechanism ensures that responsibility for each security action is explicitly defined, preventing remediation tasks from being overlooked or duplicated. The module also tracks due dates and completion dates, enabling project management oversight of the remediation programme. The combination of priority classification, assignment tracking, and date management creates a comprehensive remediation management system that supports both operational security improvement and strategic security planning. The module's integration with the audit log system ensures that all solution creation, modification, and status change events are automatically recorded for compliance reporting and forensic analysis purposes."
    ),

    // 4.4.6 Assessment Module
    heading3("4.4.6 Assessment Module"),

    bodyParagraph(
      "The Assessment module supports the formal security assessment process for IoT devices, providing a structured framework for documenting evaluation findings, recommendations, and risk ratings. As illustrated in Figure 4-10, the module presents a list of completed and pending assessments, each linked to a specific device and assessor, ensuring full traceability of the assessment process. The module enables security analysts to schedule, conduct, and document security assessments of IoT devices, creating a systematic record of security evaluations that supports compliance reporting and continuous improvement of the security posture."
    ),

    (() => {
      const img = loadScreenshot("07_assessments.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-10: Assessment Module with Device Security Evaluation Records"));
      return elements;
    })(),

    bodyParagraph(
      "Each assessment record captures the findings from the security evaluation, including identified weaknesses, configuration issues, and compliance gaps. The findings field provides a detailed narrative description of the assessor's observations, which serves as the primary documentation of the assessment results. The recommendations field documents the specific corrective actions suggested by the assessor, providing actionable guidance for improving the device's security posture. The risk rating field provides an overall assessment of the device's security risk level, categorised as critical, high, medium, or low, which complements the vulnerability-based risk rating by incorporating the assessor's professional judgement regarding the device's overall security posture beyond what can be captured by automated vulnerability scanning alone."
    ),

    bodyParagraph(
      "The 14 seeded assessments cover a representative sample of IoT devices across different types and stations, demonstrating the assessment workflow and providing baseline data for the platform's initial deployment. The relationship between the Assessment model and the User model ensures that each assessment is attributable to a specific analyst, supporting quality assurance and professional accountability. The relationship between the Assessment model and the IoTDevice model enables the platform to present a comprehensive security profile for each device, combining vulnerability data, solution implementation status, and assessment findings into a unified view of the device's security posture. The assessment module supports NRZ's compliance requirements by maintaining a documented record of security evaluations for all critical IoT devices, which is essential for demonstrating due diligence in cybersecurity management and for supporting regulatory compliance audits."
    ),

    // 4.4.7 Audit Log Module
    heading3("4.4.7 Audit Log Module"),

    bodyParagraph(
      "The Audit Log module provides comprehensive activity tracking across all NISAAP modules, creating an immutable record of user actions that supports security monitoring, compliance reporting, and forensic investigation. As shown in Figure 4-11, the audit log presents a chronological listing of all recorded activities, including the user who performed the action, the action type, the affected module, and a detailed description of the activity. The audit log is a critical component of the platform's security architecture, providing the accountability and transparency required for effective security governance and regulatory compliance."
    ),

    (() => {
      const img = loadScreenshot("08_audit_logs.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-11: Audit Log Module with Comprehensive Activity Tracking"));
      return elements;
    })(),

    bodyParagraph(
      "The audit logging system is implemented as a cross-cutting concern through the logAudit function, which serves as the central logging mechanism. The function accepts parameters for the user identifier, action type, module name, optional details, and optional IP address, and creates a new AuditLog record in the database. This function is invoked at every critical operation point, including user authentication events, data creation and modification operations, and configuration changes. The system differentiates between successful and failed authentication attempts, logging both successful login events and failed login attempts with the associated username, which supports intrusion detection and account compromise monitoring. The logAudit function includes error handling that prevents logging failures from disrupting the primary operation, ensuring that a failed audit log entry does not prevent a user from completing their intended action."
    ),

    bodyParagraph(
      "The 93 seeded audit log records demonstrate the comprehensive coverage of the logging system, spanning all functional modules. The audit log entries include actions such as LOGIN, LOGIN_FAILED, CREATE_DEVICE, CREATE_VULNERABILITY, UPDATE, and DELETE, providing a complete trace of data modifications within the system. The module field categorises each log entry by its source module, including Authentication, Devices, Vulnerabilities, Solutions, Assessments, and Users, enabling filtered analysis of activity patterns within specific functional areas. The timestamp field records the precise time of each action using the database server's clock, supporting chronological analysis and incident reconstruction. The audit log is designed as an append-only data store, meaning that existing log records cannot be modified or deleted through the application interface. This design ensures the integrity of the audit trail, preventing the possibility of tampering with evidence of unauthorised or malicious activities."
    ),

    // 4.4.8 User Management Module
    heading3("4.4.8 User Management Module"),

    bodyParagraph(
      "The User Management module provides administrators with the ability to create, view, modify, and deactivate user accounts within the NISAAP platform. As illustrated in Figure 4-12, the module presents a comprehensive list of all user accounts, displaying key information including full name, username, email, role, department, and account status. The module is restricted to administrator-level access, ensuring that only authorised personnel can manage user accounts and assign security roles. This restriction implements the principle of least privilege at the module level, preventing lower-privileged users from escalating their own access rights or modifying the access rights of other users."
    ),

    (() => {
      const img = loadScreenshot("03_user_management.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-12: User Management Module with Role-Based Access Control Interface"));
      return elements;
    })(),

    bodyParagraph(
      "The user creation process requires the administrator to provide a username, full name, email address, and initial password, along with the role assignment and department designation. The password provided during account creation is immediately hashed using the scrypt key derivation function before being stored in the database, ensuring that plaintext passwords are never persisted in the data store. The system enforces uniqueness constraints on both the username and email fields, preventing the creation of duplicate accounts. The role field determines the user's access level throughout the platform, with the three available roles providing progressively restricted permissions. The department field enables the system to categorise users by their organisational unit, supporting departmental reporting and activity analysis in the audit log."
    ),

    bodyParagraph(
      "Account deactivation is implemented through the isActive flag rather than account deletion, which is a deliberate design decision that preserves the integrity of audit log records that reference the user. When a user account is deactivated, the user can no longer authenticate to the system, but their historical activity records remain intact and traceable. This approach is consistent with best practices for security audit systems, where the ability to attribute historical actions to specific individuals is essential for forensic investigation and compliance reporting. The user management module also supports account reactivation, allowing administrators to restore access for previously deactivated accounts without the need to recreate the user profile. All user management operations, including creation, modification, role changes, and deactivation, are logged in the audit trail, ensuring complete accountability for administrative actions."
    ),

    // 4.4.9 Dark Mode Feature
    heading3("4.4.9 Dark Mode Feature"),

    bodyParagraph(
      "The NISAAP platform includes a dark mode feature that provides an alternative visual theme optimised for low-light environments and extended monitoring sessions. As illustrated in Figure 4-13, the dark mode replaces the default light colour scheme with a dark background and adjusted text and component colours that reduce eye strain and improve readability in operational environments where lighting conditions may vary. The feature is particularly relevant for NRZ's security operations centre, where personnel may need to monitor the platform for extended periods during night shifts or in dimly lit control rooms."
    ),

    (() => {
      const img = loadScreenshot("09_dark_mode_dashboard.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 14));
      elements.push(figureCaption("Figure 4-13: NISAAP Dashboard in Dark Mode with Reduced Glare Interface"));
      return elements;
    })(),

    bodyParagraph(
      "The dark mode implementation uses the Zustand state management library to maintain the user's theme preference in the application state and the browser's localStorage. When a user toggles the dark mode switch, the Zustand store updates the darkMode state variable and persists the preference to localStorage using the key 'nisaap-dark-mode'. Upon subsequent visits, the application reads the stored preference from localStorage and applies the appropriate theme before rendering the interface, ensuring a consistent user experience across sessions. The toggleDarkMode function in the Zustand store implements this persistence logic, reading from localStorage when the application initialises and writing to it whenever the user changes the theme."
    ),

    (() => {
      const img = loadScreenshot("13_dark_mode_code.png");
      const elements = [];
      if (img) elements.push(imageParagraph(img, 15));
      elements.push(figureCaption("Figure 4-14: Dark Mode Implementation Code with LocalStorage Persistence"));
      return elements;
    })(),

    bodyParagraph(
      "The dark mode styling is implemented through CSS class toggling, where the application adds or removes a 'dark' class on the root HTML element. Tailwind CSS's dark mode support enables component-level styling adjustments through the dark: variant prefix, which applies alternative styles when the dark class is present. This approach allows fine-grained control over the appearance of each component in dark mode without requiring separate style sheets or complex conditional rendering logic. The colour palette for dark mode was carefully designed to maintain sufficient contrast ratios for readability while reducing overall screen brightness, with dark navy backgrounds (#1A2B4A) and muted text colours that comply with Web Content Accessibility Guidelines for contrast ratios. The dark mode feature is accessible from all pages within the application through a toggle switch located in the sidebar navigation panel, ensuring that users can switch themes at any point during their session without navigating to a separate settings page."
    ),
  ].flat();
}

function section_4_5_rest_api_design() {
  const apiHeaders = ["Module", "Method", "Endpoint", "Description"];
  const apiRows = [
    ["Authentication", "POST", "/api/auth/login", "User login with credential verification"],
    ["Authentication", "POST", "/api/auth/logout", "User logout and session destruction"],
    ["Authentication", "GET", "/api/auth/session", "Retrieve current session information"],
    ["Users", "GET", "/api/users", "List all users with role information"],
    ["Users", "GET/PUT/DELETE", "/api/users/[id]", "Get, update, or delete a specific user"],
    ["Dashboard", "GET", "/api/dashboard/stats", "Retrieve aggregated security statistics"],
    ["Devices", "GET", "/api/devices", "List all IoT devices with filters"],
    ["Devices", "POST", "/api/devices", "Create a new IoT device record"],
    ["Devices", "GET/PUT/DELETE", "/api/devices/[id]", "Get, update, or delete a specific device"],
    ["Vulnerabilities", "GET", "/api/vulnerabilities", "List all vulnerabilities with severity data"],
    ["Vulnerabilities", "POST", "/api/vulnerabilities", "Create a new vulnerability record"],
    ["Vulnerabilities", "GET/PUT/DELETE", "/api/vulnerabilities/[id]", "Get, update, or delete a vulnerability"],
    ["Solutions", "GET", "/api/solutions", "List all security solutions"],
    ["Solutions", "POST", "/api/solutions", "Create a new security solution record"],
    ["Solutions", "GET/PUT/DELETE", "/api/solutions/[id]", "Get, update, or delete a solution"],
    ["Assessments", "GET", "/api/assessments", "List all security assessments"],
    ["Assessments", "POST", "/api/assessments", "Create a new assessment record"],
    ["Assessments", "GET/PUT/DELETE", "/api/assessments/[id]", "Get, update, or delete an assessment"],
    ["Audit Logs", "GET", "/api/audit-logs", "List all audit log entries"],
    ["Root", "GET", "/api/route", "API health check and endpoint listing"],
  ];

  return [
    heading2("4.5 REST API Design"),

    bodyParagraph(
      "The NISAAP platform exposes its functionality through a comprehensive set of RESTful API endpoints that follow established design principles for web-based applications. The API was designed to be stateless, cacheable, and uniform in its interface design, adhering to the Representational State Transfer architectural constraints. Each endpoint accepts and returns JSON-formatted data, uses standard HTTP methods to indicate the intended operation, and returns appropriate HTTP status codes to communicate the outcome of the request. The API design supports the separation of concerns between the frontend and backend layers, enabling independent evolution of the user interface and the business logic. Table 4-5 provides a comprehensive listing of the 20 API endpoints implemented across the eight functional modules."
    ),

    tableCaption("Table 4-5: NISAAP REST API Endpoints"),
    createAcademicTable(apiHeaders, apiRows, [1800, 1400, 3200, 4000]),

    bodyParagraph(
      "The endpoints follow a consistent naming convention that uses plural resource nouns and hierarchical paths to indicate resource relationships. The authentication endpoints are grouped under the /api/auth path, while resource-specific endpoints follow the /api/{resource} pattern with optional identifier parameters for individual resource operations. The dashboard statistics endpoint provides an aggregated data view that combines information from multiple underlying resources, reducing the number of API calls required by the frontend to populate the dashboard interface. The API implements filtering, search, and pagination capabilities through query parameters on the list endpoints, enabling clients to retrieve specific subsets of data without loading the entire dataset."
    ),

    bodyParagraph(
      "The API implementation enforces authentication requirements on all endpoints except the login endpoint, which by necessity must be accessible to unauthenticated users. Each protected endpoint begins by verifying the presence and validity of the session cookie in the request headers through the checkAuth function. If no valid session is found, the endpoint returns a 401 Unauthorised response with a descriptive error message. Error handling across the API follows a consistent pattern that returns structured JSON error responses with appropriate HTTP status codes. Client-side errors, such as missing required fields or invalid data formats, result in 400 Bad Request responses. Authentication failures return 401 Unauthorised responses. Server-side errors return 500 Internal Server Error responses with a generic error message to avoid exposing internal system details that could be exploited by attackers."
    ),

    bodyParagraph(
      "The API also implements comprehensive audit logging for all data modification operations. Every POST, PUT, and DELETE request triggers an audit log entry that records the user who performed the action, the type of action, the affected module, and a description of the change. This audit trail provides complete traceability of all data modifications, supporting both operational oversight and compliance reporting requirements. The combination of authentication enforcement, consistent error handling, and comprehensive audit logging creates a secure and well-documented API layer that forms the backbone of the NISAAP platform. The API's design also supports future extension through the addition of new endpoints without modifying existing ones, following the open-closed principle of software design."
    ),
  ].flat();
}

function section_4_6_security_considerations() {
  const securityHeaders = ["Security Measure", "Implementation", "Protection Against"];
  const securityRows = [
    ["Password Hashing", "scrypt with 16-byte salt and 64-byte key", "Brute-force and rainbow table attacks"],
    ["Session Cookie (HTTP-only)", "HttpOnly flag prevents JavaScript access", "Cross-site scripting (XSS) session theft"],
    ["SameSite Cookie", "SameSite=Strict attribute", "Cross-site request forgery (CSRF)"],
    ["Session Expiry", "Max-Age=86400 (24 hours)", "Session hijacking and replay attacks"],
    ["Timing-Safe Comparison", "timingSafeEqual for password verification", "Timing side-channel attacks"],
    ["Input Validation", "Required field checks on all endpoints", "Injection and data integrity attacks"],
    ["Role-Based Access Control", "Three-tier role hierarchy (admin/analyst/viewer)", "Unauthorised privilege escalation"],
    ["Audit Logging", "Comprehensive action logging across all modules", "Unauthorised activity and compliance gaps"],
    ["SQL Injection Prevention", "Prisma ORM parameterised queries", "SQL injection attacks"],
    ["Error Handling", "Generic server error messages", "Information disclosure vulnerabilities"],
  ];

  return [
    heading2("4.6 System Security Considerations"),

    bodyParagraph(
      "The NISAAP platform was designed with security as a fundamental architectural principle, incorporating multiple layers of protection to safeguard both the system itself and the sensitive security data it manages. This section discusses the key security considerations that influenced the design and implementation decisions throughout the development process. The security approach follows the principle of defence in depth, where multiple overlapping security controls are implemented to ensure that the failure of any single control does not result in a complete security breach. Table 4-6 summarises the key security measures implemented in the NISAAP platform and the threats they mitigate."
    ),

    tableCaption("Table 4-6: NISAAP Security Measures and Threat Mitigation"),
    createAcademicTable(securityHeaders, securityRows, [2600, 3400, 4400]),

    bodyParagraph(
      "The authentication system represents the first and most critical layer of defence, implementing several security measures that collectively protect against common attack vectors. Password storage uses the scrypt key derivation function with a 16-byte random salt and a 64-byte derived key, which provides strong resistance against both brute-force attacks and rainbow table attacks. The scrypt algorithm is specifically designed to be memory-hard, requiring a significant amount of RAM to compute the derived key, which makes hardware-based attacks using GPUs or specialised ASIC devices substantially more expensive to execute than equivalent attacks against simpler hashing algorithms such as MD5 or SHA-256. The use of a unique random salt for each password ensures that identical passwords produce different hash values, preventing the use of precomputed rainbow tables and requiring attackers to perform a separate brute-force attack for each password hash."
    ),

    bodyParagraph(
      "Session management implements several protective measures to prevent session-based attacks. The HTTP-only flag on the session cookie prevents client-side JavaScript from accessing the cookie, mitigating cross-site scripting attacks that attempt to steal session tokens. The SameSite=Strict attribute ensures that the cookie is only sent with same-origin requests, preventing cross-site request forgery attacks where a malicious website could attempt to send authenticated requests to the NISAAP platform. The 24-hour session expiry limit reduces the window of opportunity for session hijacking attacks and ensures that users must periodically re-authenticate, which is consistent with security best practices for operational technology management systems. The timing-safe comparison function used during password verification prevents timing side-channel attacks, where an attacker could potentially determine information about the password hash by measuring the time taken for the comparison operation."
    ),

    bodyParagraph(
      "Input validation is implemented on all API endpoints to prevent injection attacks and ensure data integrity. Each endpoint validates that required fields are present in the request body before processing the request, returning a 400 Bad Request response with a descriptive error message if any required field is missing. The use of Prisma ORM for database access provides automatic parameterisation of SQL queries, which effectively prevents SQL injection attacks by ensuring that user input is always treated as data rather than executable code. Error handling across the API is designed to prevent information disclosure by returning generic error messages for server-side errors, avoiding the exposure of internal system details such as stack traces, file paths, or database schema information that could be exploited by attackers to gain intelligence about the system's internal structure."
    ),

    bodyParagraph(
      "The role-based access control system implements the principle of least privilege by restricting each user's access to only the functionality required for their role. Administrators have full access to all system functionality, analysts have read and write access to security-related modules but cannot manage user accounts, and viewers have read-only access to monitoring and reporting functions. This three-tier hierarchy ensures that even if a user's credentials are compromised, the attacker's capabilities are limited by the compromised user's role. The audit logging system provides the final layer of defence by creating an immutable record of all user actions, enabling security administrators to detect and investigate any suspicious or unauthorised activity. The combination of these security measures creates a comprehensive security framework that addresses the specific threats facing a railway IoT security management platform."
    ),
  ];
}

function section_4_7_system_testing() {
  const testHeaders = ["Test Category", "Test Case", "Expected Result", "Status"];
  const testRows = [
    ["Authentication", "Valid credentials login", "Session cookie created, user data returned", "Passed"],
    ["Authentication", "Invalid password login", "401 response, LOGIN_FAILED audit log", "Passed"],
    ["Authentication", "Deactivated account login", "401 response with deactivation message", "Passed"],
    ["Authentication", "Missing fields in login", "400 Bad Request response", "Passed"],
    ["Authentication", "Session expiry after 24 hours", "401 response on subsequent requests", "Passed"],
    ["CRUD Operations", "Create new device record", "Device created, audit log entry generated", "Passed"],
    ["CRUD Operations", "Update vulnerability status", "Status updated, audit log entry generated", "Passed"],
    ["CRUD Operations", "Delete user account", "Account deactivated, audit logs preserved", "Passed"],
    ["Filtering", "Filter devices by risk level", "Only matching devices returned", "Passed"],
    ["Filtering", "Search vulnerabilities by CVE ID", "Matching vulnerabilities returned", "Passed"],
    ["RBAC", "Viewer attempts data modification", "403 Forbidden response", "Passed"],
    ["RBAC", "Analyst attempts user management", "403 Forbidden response", "Passed"],
    ["Dashboard", "Statistics accuracy verification", "Counts match database totals", "Passed"],
    ["Dashboard", "Unauthenticated dashboard access", "401 response, no data returned", "Passed"],
    ["Dark Mode", "Toggle and persist preference", "Theme persists after page reload", "Passed"],
    ["Audit Log", "CRUD operations generate log entries", "All operations logged with correct details", "Passed"],
  ];

  return [
    heading2("4.7 System Testing and Validation"),

    bodyParagraph(
      "System testing was conducted throughout the development lifecycle of the NISAAP platform to ensure that each functional module met its specified requirements and that the integrated system performed reliably under expected operational conditions. The testing strategy encompassed multiple levels, including unit testing of individual API endpoints, integration testing of module interactions, and system-level testing of end-to-end workflows. The testing process was designed to validate both the functional correctness of the system and its security properties, reflecting the dual importance of operational reliability and security assurance in a railway IoT management context. Table 4-7 presents the key test cases and their outcomes."
    ),

    tableCaption("Table 4-7: NISAAP System Test Cases and Results"),
    createAcademicTable(testHeaders, testRows, [1800, 2800, 3200, 1200]),

    heading3("4.7.1 Authentication Testing"),

    bodyParagraph(
      "Authentication testing verified the security of the login and session management mechanisms. Tests confirmed that valid credentials result in successful authentication with the creation of a properly configured session cookie, including HTTP-only, SameSite=Strict, and Max-Age attributes. Invalid credentials were confirmed to return 401 Unauthorised responses without creating session cookies. Failed authentication attempts were verified to generate audit log entries with the LOGIN_FAILED action type, enabling security monitoring of potential brute-force attacks. Deactivated accounts were confirmed to be denied access regardless of credential validity, with a specific error message indicating that the account has been deactivated. Session expiry was tested by verifying that expired cookies no longer grant access to protected endpoints, requiring the user to re-authenticate to continue using the platform."
    ),

    heading3("4.7.2 Module-Level Testing"),

    bodyParagraph(
      "Module-level testing validated the CRUD operations for each data model, confirming that create, read, update, and delete operations function correctly and enforce data integrity constraints. The IoT Device Management module was tested with the 31 seeded device records, verifying that filtering by device type, status, and risk level produces accurate results, that the search functionality correctly matches against device names, IP addresses, and locations, and that pagination correctly limits the number of returned records. The Vulnerability Management module was tested with the 26 seeded vulnerability records, confirming that severity classifications, CVSS scores, and status transitions function as designed, and that the automatic device risk level update mechanism correctly recalculates the associated device's risk level when a new vulnerability is created. The Security Solutions module was validated with the 22 seeded solution records, verifying that implementation status tracking and priority classification operate correctly."
    ),

    bodyParagraph(
      "The Audit Log module was subjected to particularly rigorous testing due to its importance for security monitoring and compliance reporting. Tests confirmed that all CRUD operations across all modules generate appropriate audit log entries, including the correct action type, module name, user identifier, and timestamp. The append-only nature of the audit log was verified by confirming that no application interface allows modification or deletion of existing log entries. The 93 seeded audit log records were used to validate the log display, filtering, and pagination functionality, ensuring that the audit log interface can handle large volumes of log data without performance degradation. The audit log's ability to record both authenticated and unauthenticated activities was verified through failed login attempt testing, confirming that the optional userId field correctly handles null values for unauthenticated actions."
    ),

    heading3("4.7.3 Role-Based Access Control Testing"),

    bodyParagraph(
      "Role-based access control testing confirmed that the three user roles, namely admin, analyst, and viewer, have the appropriate access privileges. Viewer accounts were verified to have read-only access to dashboard statistics, device inventories, and vulnerability reports, while being denied access to data modification endpoints with 403 Forbidden responses. Analyst accounts were confirmed to have read and write access to vulnerability, solution, and assessment modules, but denied access to user management functions. Administrator accounts were verified to have full access to all system functionality. Unauthorized access attempts from each role type were confirmed to return appropriate 403 Forbidden responses and generate audit log entries documenting the access violation, supporting security monitoring and incident response procedures."
    ),

    heading3("4.7.4 User Interface Testing"),

    bodyParagraph(
      "The dark mode feature was tested across all application views to ensure consistent rendering in both light and dark themes. Tests verified that the theme preference is correctly persisted in localStorage and restored upon subsequent visits. The colour contrast ratios in both themes were validated against the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA requirements, confirming that all text elements maintain sufficient contrast against their backgrounds in both modes. The visual consistency of all UI components, including data tables, charts, form inputs, and navigation elements, was verified across both themes to ensure a professional and usable interface regardless of the selected mode. The responsive layout was tested across different screen resolutions to ensure that the platform remains usable on both desktop monitors and tablet devices, which may be used by security personnel during field inspections of IoT devices."
    ),
  ].flat();
}

function section_4_8_summary() {
  return [
    heading2("4.8 Chapter Summary"),

    bodyParagraph(
      "This chapter has presented the comprehensive design and implementation of the Network Infrastructure Security Assessment and Action Platform (NISAAP), a web-based IoT security management system developed for the National Railways of Zimbabwe. The system was designed using a three-tier architecture that separates the presentation, application logic, and data persistence layers, providing a maintainable and scalable foundation for managing IoT security across NRZ's railway operations. The technology stack, comprising Next.js 16, TypeScript, Tailwind CSS 4, Prisma ORM, and SQLite, was selected to balance security, performance, and operational simplicity in the context of NRZ's infrastructure constraints."
    ),

    bodyParagraph(
      "The database design defines six core models that capture the complete data domain of IoT security management, supporting the full lifecycle from device registration through vulnerability discovery, remediation tracking, security assessment, and audit compliance. The implementation of nine functional modules, including authentication, dashboard, IoT device management, vulnerability management, security solutions, assessment, audit logging, user management, and dark mode, provides a comprehensive suite of security management tools that address the specific requirements identified in the vulnerability assessment of NRZ's IoT infrastructure. Each module was designed with careful attention to security, usability, and maintainability, following industry best practices for secure software development."
    ),

    bodyParagraph(
      "The REST API design, comprising 20 endpoints across the functional modules, provides a well-documented and secure interface for all system operations, with consistent authentication enforcement, error handling, and audit logging. The system security considerations section documented the multiple layers of protection implemented in the platform, including scrypt password hashing, HTTP-only session cookies with SameSite=Strict attribute, role-based access control, and comprehensive audit logging. System testing validated the functional correctness, security properties, and user experience of each module, confirming that the platform meets its specified requirements for reliability, security, and usability."
    ),

    bodyParagraph(
      "The NISAAP platform demonstrates that a focused, well-designed web application can effectively address the IoT security challenges facing railway operators, providing a practical tool for managing the growing attack surface created by the proliferation of connected devices in operational technology environments. The platform's modular architecture supports future expansion, including the potential integration of real-time threat intelligence feeds, automated vulnerability scanning, and machine learning-based anomaly detection, which would further enhance NRZ's ability to protect its IoT infrastructure against evolving cyber threats. The implementation demonstrates the viability of a modern web technology stack for security-critical applications in the railway sector, showing that frameworks such as Next.js and tools such as Prisma ORM can be leveraged to build secure, maintainable systems without requiring extensive infrastructure investment."
    ),
  ];
}

// =================== BUILD DOCUMENT ===================

async function generateDocument() {
  console.log("Generating expanded Chapter 4 DOCX document (15 pages)...");

  const allContent = [
    ...section_4_0_introduction(),
    ...section_4_1_system_architecture(),
    ...section_4_2_technology_stack(),
    ...section_4_3_database_design(),
    ...section_4_4_system_implementation(),
    ...section_4_5_rest_api_design(),
    ...section_4_6_security_considerations(),
    ...section_4_7_system_testing(),
    ...section_4_8_summary(),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { name: FONT_EN, eastAsia: FONT_CJK },
            size: 24,
          },
          paragraph: {
            spacing: { line: 360 },
          },
        },
        heading1: {
          run: {
            font: { name: FONT_EN, eastAsia: FONT_CJK },
            size: 32,
            bold: true,
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240, line: 360 },
          },
        },
        heading2: {
          run: {
            font: { name: FONT_EN, eastAsia: FONT_CJK },
            size: 30,
            bold: true,
          },
          paragraph: {
            alignment: AlignmentType.LEFT,
            spacing: { before: 240, after: 120, line: 360 },
          },
        },
        heading3: {
          run: {
            font: { name: FONT_EN, eastAsia: FONT_CJK },
            size: 28,
            bold: true,
          },
          paragraph: {
            alignment: AlignmentType.LEFT,
            spacing: { before: 200, after: 120, line: 360 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
            },
            margin: {
              top: MARGIN_TOP,
              bottom: MARGIN_BOTTOM,
              left: MARGIN_LEFT,
              right: MARGIN_RIGHT,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                border: {
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 6,
                    color: "000000",
                  },
                },
                children: [
                  new TextRun({
                    text: "NISAAP System Design and Implementation",
                    font: { name: FONT_EN, eastAsia: FONT_CJK },
                    size: 18,
                    color: "666666",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: { name: FONT_EN, eastAsia: FONT_CJK },
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children: allContent,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`Document generated successfully: ${OUTPUT_PATH}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

generateDocument().catch((err) => {
  console.error("Error generating document:", err);
  process.exit(1);
});
