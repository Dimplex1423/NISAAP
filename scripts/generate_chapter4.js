const docx = require("docx");
const fs = require("fs");
const path = require("path");

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Table, TableRow, TableCell, WidthType, AlignmentType,
  BorderStyle, PageBreak, Tab, TabStopPosition, TabStopType,
  Header, Footer, PageNumber, NumberFormat, ShadingType,
  convertInchesToTwip, convertMillimetersToTwip, LineRuleType,
  TableLayoutType, VerticalAlign
} = docx;

// =================== CONSTANTS ===================
const SCREENSHOTS_DIR = "/home/z/my-project/download/screenshots";
const OUTPUT_PATH = "/home/z/my-project/download/Munyaradzi_Patama_B221315B_Chapter_4.docx";

// Margins in twips
const MARGIN_TOP = 1440;    // 2.54 cm
const MARGIN_BOTTOM = 1440; // 2.54 cm
const MARGIN_LEFT = 1701;   // 3 cm
const MARGIN_RIGHT = 1417;  // 2.5 cm

// Font
const FONT_EN = "Times New Roman";
const FONT_CJK = "SimSun";

// NRZ Brand Colors
const NRZ_NAVY = "003366";
const NRZ_GOLD = "C5A55A";
const NRZ_DARK_NAVY = "1A2B4A";
const NRZ_RED = "CC0000";
const NRZ_GREEN = "2E7D32";
const NRZ_AMBER = "FF8F00";

// Image max widths in cm -> EMU (1 cm = 360000 EMU)
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
  // Read actual PNG dimensions from header
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
    size = 24, // 12pt = 24 half-points
  } = options;

  return new Paragraph({
    alignment,
    spacing,
    indent,
    children: [
      new TextRun({
        text,
        bold,
        italic,
        font: { name: font, eastAsia: FONT_CJK },
        size,
      }),
    ],
  });
}

function bodyParagraphMultiRun(runs, options = {}) {
  const {
    alignment = AlignmentType.JUSTIFIED,
    spacing = { line: 360, before: 0, after: 120 },
    indent = { firstLine: 480 },
  } = options;

  return new Paragraph({
    alignment,
    spacing,
    indent,
    children: runs.map(r => new TextRun({
      text: r.text,
      bold: r.bold || false,
      italic: r.italic || false,
      font: { name: r.font || FONT_EN, eastAsia: FONT_CJK },
      size: r.size || 24,
    })),
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240, line: 360 },
    children: [
      new TextRun({
        text,
        bold: true,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 32, // 16pt
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
        text,
        bold: true,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 30, // 15pt
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
        text,
        bold: true,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 28, // 14pt
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
        text,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 21, // 10.5pt
        bold: true,
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
        text,
        font: { name: FONT_EN, eastAsia: FONT_CJK },
        size: 21, // 10.5pt
        bold: true,
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
          width: Math.round(dims.maxWidthEMU / 9525), // EMU to points (rough)
          height: Math.round(dims.maxHeightEMU / 9525),
        },
        type: "png",
      }),
    ],
  });
}

// Three-line academic table style
function createAcademicTable(headers, rows, colWidths) {
  const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const topBorder = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
  const bottomBorder = { style: BorderStyle.SINGLE, size: 12, color: "000000" };
  const thinBottomBorder = { style: BorderStyle.SINGLE, size: 6, color: "000000" };

  function headerCell(text, width) {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: topBorder,
        bottom: thinBottomBorder,
        left: noBorder,
        right: noBorder,
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40, line: 360 },
          children: [
            new TextRun({
              text,
              bold: true,
              font: { name: FONT_EN, eastAsia: FONT_CJK },
              size: 21,
            }),
          ],
        }),
      ],
    });
  }

  function dataCell(text, width, isLastRow = false) {
    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      verticalAlign: VerticalAlign.CENTER,
      borders: {
        top: noBorder,
        bottom: isLastRow ? bottomBorder : noBorder,
        left: noBorder,
        right: noBorder,
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 20, after: 20, line: 360 },
          indent: { left: 60 },
          children: [
            new TextRun({
              text,
              font: { name: FONT_EN, eastAsia: FONT_CJK },
              size: 21,
            }),
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
      "The design and implementation process followed a structured methodology that incorporated industry best practices for secure software development. The platform was conceived as a comprehensive solution to manage, monitor, and mitigate security risks associated with the growing deployment of Internet of Things devices across NRZ's railway operations. These IoT devices, which include signal controllers, CCTV cameras, track sensors, network gateways, routers, and GPS trackers, form the operational backbone of the railway network and require robust security management to ensure both operational continuity and passenger safety."
    ),

    bodyParagraph(
      "The chapter begins with an overview of the system architecture, explaining the layered design approach and the interaction between frontend, backend, and data persistence layers. This is followed by a detailed discussion of the technology stack, providing justification for each technology choice in the context of NRZ's operational requirements and infrastructure constraints. The database design section presents the entity-relationship model and the six core data models that underpin the platform. The subsequent sections provide an in-depth examination of each functional module, including authentication, dashboard, IoT device management, vulnerability management, security solutions, assessment, and audit logging. Each module is presented with its design rationale, implementation details, and visual evidence in the form of system screenshots. The chapter concludes with the REST API design and system testing validation, ensuring that all components meet the specified functional and security requirements."
    ),
  ];
}

function section_4_1_system_architecture() {
  return [
    heading2("4.1 System Architecture"),

    bodyParagraph(
      "The NISAAP platform was designed using a three-tier architecture that separates the presentation layer, application logic layer, and data persistence layer. This architectural pattern was selected for its well-established benefits in terms of maintainability, scalability, and security. The separation of concerns inherent in the three-tier model allows each layer to be developed, tested, and modified independently, which is particularly important for a security-critical system deployed in a railway operations environment where system availability and reliability are paramount."
    ),

    bodyParagraph(
      "The presentation tier, or frontend layer, was implemented using Next.js 16 with React, providing a responsive and interactive user interface. This tier communicates with the application tier exclusively through RESTful API endpoints, ensuring a clean separation between the user-facing components and the business logic. The choice of Next.js as the frontend framework provided significant advantages, including server-side rendering capabilities, automatic code splitting for optimized performance, and a robust routing system. The user interface was constructed using Tailwind CSS 4 for utility-first styling and shadcn/ui for consistent, accessible component design, resulting in a professional and intuitive interface that aligns with NRZ's corporate branding guidelines."
    ),

    bodyParagraph(
      "The application tier, or backend layer, was implemented using Next.js API Routes, which provide a Node.js-based server environment integrated within the Next.js framework. This approach eliminates the need for a separate backend server, reducing deployment complexity and infrastructure requirements, which is particularly advantageous given NRZ's resource constraints. The API layer implements the business logic for all eight functional modules, including authentication, data validation, role-based access control, and audit logging. Each API endpoint follows RESTful design principles, accepting JSON requests and returning structured JSON responses with appropriate HTTP status codes."
    ),

    bodyParagraph(
      "The data persistence tier utilises SQLite as the relational database engine, accessed through the Prisma Object-Relational Mapping (ORM) framework. SQLite was selected for its zero-configuration deployment model, which eliminates the need for a separate database server process, thereby reducing the attack surface and simplifying system administration. Prisma ORM provides type-safe database queries, automatic migration management, and a declarative schema definition language that ensures data integrity and consistency. The combination of SQLite and Prisma offers an optimal balance between performance, security, and operational simplicity for the NRZ deployment context."
    ),

    bodyParagraph(
      "As illustrated in Figure 4-1, the NISAAP system architecture follows a client-server model where the web browser serves as the client, the Next.js application server handles both static asset serving and API request processing, and the SQLite database provides persistent data storage. The architecture supports concurrent user access through the stateless API design, with user sessions managed through HTTP-only cookies containing encoded session data. This design ensures that the system can support multiple users across different departments, including IT Security, Network Operations, Cybersecurity, and Management, each with appropriate role-based access privileges."
    ),

    // Figure 4-1: Dashboard showing architecture overview
    (() => {
      const img = loadScreenshot("02_dashboard.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-1: NISAAP Dashboard Overview Showing System Architecture Components"));
      return elements;
    })(),
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
      "The decision to use Next.js 16 as the primary framework for both frontend and backend development was driven by its unified development model, which eliminates the complexity of maintaining separate frontend and backend codebases. Next.js provides server-side rendering for improved initial page load performance, automatic code splitting to reduce bundle sizes, and a file-based routing system that simplifies navigation architecture. The framework's API Routes feature enables the creation of server-side API endpoints within the same application, reducing deployment overhead and ensuring consistent security policies across the entire application stack."
    ),

    bodyParagraph(
      "TypeScript was adopted as the primary programming language due to its static type system, which provides compile-time error detection and enhances code reliability. In a security-critical application such as NISAAP, the elimination of type-related runtime errors is particularly important. TypeScript's type system enforces data contracts throughout the application, from API request validation to database query results, reducing the likelihood of data handling vulnerabilities. The combination of TypeScript with Prisma's type-safe query API creates a fully type-safe data pipeline from the database to the user interface."
    ),

    bodyParagraph(
      "The choice of SQLite as the database engine, paired with Prisma ORM, was motivated by several factors specific to the NRZ deployment context. SQLite's serverless architecture eliminates the need for a separate database server process, which reduces infrastructure requirements, simplifies deployment, and minimises the attack surface. The database file is stored locally on the server, providing fast data access without network latency. Prisma ORM provides a declarative schema definition language, automatic migration generation, and type-safe database queries, which significantly reduce the risk of SQL injection vulnerabilities and data integrity issues. The ORM's migration system ensures that database schema changes are versioned, reversible, and consistently applied across deployment environments."
    ),

    bodyParagraph(
      "For authentication, the system implements a custom JWT-based mechanism using Node.js's built-in cryptographic functions. Passwords are hashed using the scrypt key derivation function, which provides resistance against brute-force and rainbow table attacks through its memory-hard computational requirements. Session data is encoded and stored in HTTP-only cookies, which prevents client-side JavaScript access and mitigates cross-site scripting attacks targeting session tokens. The cookie-based session approach was chosen over server-side session storage to maintain the stateless nature of the API layer while still providing secure session management."
    ),

    bodyParagraph(
      "The user interface was constructed using Tailwind CSS 4 for utility-first styling and shadcn/ui for accessible, customisable component design. Tailwind CSS provides a consistent design system through utility classes, which ensures visual consistency across all modules while allowing for efficient customisation. The shadcn/ui component library offers pre-built, accessible components that conform to the Web Content Accessibility Guidelines (WCAG), ensuring that the platform is usable by individuals with disabilities. The combination of these styling technologies enabled the implementation of NRZ's corporate brand colours, including Navy Blue (#003366), Gold (#C5A55A), Dark Navy (#1A2B4A), and contextual colours for risk indicators, creating a professional and organisationally aligned visual identity."
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

  return [
    heading2("4.3 Database Design"),

    bodyParagraph(
      "The database design for NISAAP follows a relational model that captures the complex interrelationships between users, IoT devices, vulnerabilities, security solutions, assessments, and audit logs. The schema was defined using Prisma's declarative schema definition language, which provides a clear, human-readable representation of the data model and automatically generates the SQL migration scripts required to create the database structure. The design prioritises data integrity through the use of foreign key constraints, cascade deletion rules, and unique field constraints, ensuring that the database maintains consistency even under concurrent access conditions."
    ),

    bodyParagraph(
      "The Prisma schema defines six core models that collectively represent the complete data domain of the NISAAP platform. Each model was designed with careful consideration of the specific data requirements of NRZ's IoT security management operations. As shown in Figure 4-2, the Prisma schema code defines the complete data model, including field types, default values, relationships, and constraints. The schema serves as both the documentation and the implementation of the database design, ensuring that the documented design and the actual implementation remain synchronised throughout the development lifecycle."
    ),

    // Figure 4-2: Prisma Schema
    (() => {
      const img = loadScreenshot("10_prisma_schema.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 15));
      }
      elements.push(figureCaption("Figure 4-2: Prisma Schema Definition for the NISAAP Database Models"));
      return elements;
    })(),

    bodyParagraph(
      "Table 4-2 provides a summary of the six database models, their key fields, relationships, and the number of records seeded during the initial deployment. The data model was designed to support the full lifecycle of IoT security management, from device registration and vulnerability discovery through remediation tracking and audit compliance reporting."
    ),

    tableCaption("Table 4-2: NISAAP Database Models Summary"),
    createAcademicTable(modelHeaders, modelRows, [1600, 3200, 3200, 1400]),

    bodyParagraph(
      "The User model stores authentication credentials and role information for all system users. Password security is implemented through the scrypt key derivation function, which generates a 64-byte key from the user's password combined with a 16-byte random salt. The model supports three role levels, namely admin, analyst, and viewer, each with progressively restricted access privileges. The isActive flag allows administrators to deactivate user accounts without deleting them, preserving the integrity of audit logs that reference the user. The lastLogin field tracks the most recent authentication event, supporting security monitoring and inactive account detection."
    ),

    bodyParagraph(
      "The IoTDevice model captures comprehensive information about each IoT device deployed across the NRZ railway network. Key fields include the device type, which categorises devices as controllers, cameras, sensors, gateways, routers, or trackers; the network location, which identifies the station and physical placement; and the risk level, which provides an aggregate security risk rating. The model also stores network configuration data, including IP and MAC addresses, network segment, and firmware version, which are essential for vulnerability assessment and network security analysis. The status field tracks whether the device is currently active, inactive, or undergoing maintenance, enabling the system to provide an accurate real-time inventory of the IoT fleet."
    ),

    bodyParagraph(
      "The Vulnerability model represents security weaknesses discovered in IoT devices, with detailed fields for severity classification, CVSS scoring, and CVE tracking. The severity field categorises vulnerabilities as critical, high, medium, or low, following the Common Vulnerability Scoring System guidelines. The cvssScore field stores the numerical CVSS score, enabling quantitative risk analysis and prioritisation. The cveId field links the vulnerability to known CVE entries, facilitating cross-referencing with public vulnerability databases. The status field tracks the remediation lifecycle from discovery through to resolution, with states including open, acknowledged, in_progress, resolved, and accepted_risk."
    ),

    bodyParagraph(
      "The SecuritySolution model links remediation actions to identified vulnerabilities, creating a traceable path from vulnerability discovery to resolution. Each solution includes an implementation status that tracks progress from proposed through to implemented and verified. The priority field, which can be critical, high, medium, or low, ensures that remediation efforts are focused on the most impactful security gaps. The model also captures project management information, including the assigned security analyst, due dates, completion dates, and cost estimates, supporting both operational remediation tracking and budget planning for security investments."
    ),

    bodyParagraph(
      "The Assessment model records formal security assessments conducted on IoT devices by authorised users. Each assessment links a device to an assessor and captures detailed findings, recommendations, and an overall risk rating. The model supports a structured assessment workflow where analysts can systematically evaluate device security postures and document their findings for management review. The relationship between Assessment and User models ensures that each assessment is attributable to a specific analyst, supporting accountability and quality assurance in the assessment process."
    ),

    bodyParagraph(
      "The AuditLog model provides a comprehensive record of all user actions within the system, supporting compliance reporting and forensic investigation capabilities. Every significant action, including login events, data modifications, and configuration changes, is automatically logged with the user identity, action type, module, detailed description, and timestamp. The audit log is append-only, meaning that records cannot be modified or deleted through the application interface, ensuring the integrity of the audit trail. With 93 audit log records seeded during initial deployment, the system demonstrates comprehensive activity tracking across all modules."
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
      "The authentication module serves as the primary security gateway to the NISAAP platform, controlling access to all system functionality through a username and password verification process. The module implements a secure authentication workflow that begins with the user submitting credentials through the login page, as shown in Figure 4-3. The system validates the submitted credentials against the stored password hash using the scrypt key derivation function, which provides resistance against timing attacks through the use of the timingSafeEqual comparison function."
    ),

    // Figure 4-3: Login Page
    (() => {
      const img = loadScreenshot("01_login_page.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-3: NISAAP Login Page with Secure Authentication Interface"));
      return elements;
    })(),

    bodyParagraph(
      "The authentication process follows a multi-step verification workflow. Upon receiving a login request, the API endpoint first validates that both username and password fields are present, returning a 400 Bad Request response if either field is missing. The system then retrieves the user record from the database and checks whether the account is active, returning a 401 Unauthorised response if the account has been deactivated. Password verification is performed using the scrypt algorithm with a 16-byte random salt and a 64-byte derived key, providing strong resistance against brute-force attacks. If authentication fails, the system logs the failed attempt in the audit log, enabling security monitoring of potential unauthorised access attempts."
    ),

    bodyParagraph(
      "Upon successful authentication, the system creates a session cookie containing the user's identifier, username, and role. The session data is encoded using Base64 encoding and stored in an HTTP-only cookie with the Secure, SameSite=Strict, and Max-Age=86400 attributes. The HTTP-only flag prevents client-side JavaScript from accessing the cookie, mitigating cross-site scripting attacks. The SameSite=Strict attribute ensures that the cookie is only sent with same-origin requests, preventing cross-site request forgery attacks. The Max-Age attribute limits the session duration to 24 hours, after which the user must re-authenticate. The system also updates the user's lastLogin timestamp and logs the successful authentication event in the audit log."
    ),

    // Figure 4-4: Auth API Code
    (() => {
      const img = loadScreenshot("11_auth_api.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 15));
      }
      elements.push(figureCaption("Figure 4-4: Authentication API Implementation Code"));
      return elements;
    })(),

    bodyParagraph(
      "The authentication module enforces role-based access control through three distinct user roles: admin, analyst, and viewer. Administrators have full access to all system functionality, including user management, device registration, vulnerability management, and system configuration. Analysts can perform security assessments, manage vulnerabilities and solutions, and view device information but cannot manage user accounts. Viewers have read-only access to dashboard statistics, device inventories, and vulnerability reports, enabling management stakeholders to monitor security posture without the ability to modify system data. This hierarchical access model ensures that each user can only perform actions appropriate to their role, reducing the risk of accidental or malicious data modification."
    ),

    // 4.4.2 Dashboard Module
    heading3("4.4.2 Dashboard Module"),

    bodyParagraph(
      "The dashboard module provides a comprehensive overview of the IoT security landscape across the NRZ railway network, aggregating data from all other modules into a unified visual interface. As illustrated in Figure 4-5, the dashboard presents key performance indicators, risk distribution charts, severity breakdowns, and recent activity logs, enabling security administrators to quickly assess the current security posture and identify areas requiring immediate attention."
    ),

    // Figure 4-5: Dashboard
    (() => {
      const img = loadScreenshot("02_dashboard.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-5: NISAAP Dashboard Module with Security Statistics and Visualisations"));
      return elements;
    })(),

    bodyParagraph(
      "The dashboard aggregates data from multiple database queries to present real-time security metrics. The primary statistics displayed include the total number of IoT devices, the number of active devices, the count of open vulnerabilities, and the number of critical and high-severity alerts. These headline metrics provide an immediate snapshot of the security state, allowing administrators to identify potential issues at a glance. The dashboard also presents the risk distribution of IoT devices across four categories: critical, high, medium, and low, visualised through colour-coded indicators using the NRZ brand palette."
    ),

    bodyParagraph(
      "The severity distribution chart provides a visual breakdown of vulnerabilities by severity level, enabling security teams to quickly assess the overall risk landscape. This chart uses distinct colours for each severity level, with critical vulnerabilities displayed in red (#CC0000), high in amber (#FF8F00), medium in gold (#C5A55A), and low in green (#2E7D32), consistent with industry-standard risk visualisation conventions. The device type distribution chart shows the composition of the IoT fleet by category, including controllers, cameras, sensors, gateways, routers, and trackers, supporting resource allocation decisions for security monitoring and maintenance activities."
    ),

    // Figure 4-6: Dashboard API Code
    (() => {
      const img = loadScreenshot("12_dashboard_api.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 15));
      }
      elements.push(figureCaption("Figure 4-6: Dashboard Statistics API Implementation Code"));
      return elements;
    })(),

    bodyParagraph(
      "The dashboard API endpoint implements authentication verification before returning any data, ensuring that only authenticated users can access security statistics. The endpoint performs multiple database queries to gather comprehensive statistics, including total device counts, active device counts, vulnerability severity distributions, risk level distributions across devices, solution implementation progress, and recent audit log entries. The data is returned in a structured JSON format that the frontend components render as interactive charts and summary cards. The implementation uses Prisma's aggregation and grouping functions to efficiently compute statistics without requiring raw SQL queries, maintaining type safety throughout the data pipeline."
    ),

    // 4.4.3 IoT Device Management Module
    heading3("4.4.3 IoT Device Management Module"),

    bodyParagraph(
      "The IoT Device Management module provides comprehensive functionality for managing the entire lifecycle of IoT devices deployed across the NRZ railway network. As illustrated in Figure 4-7, the module presents a searchable, filterable inventory of all registered devices, displaying key attributes such as device name, type, IP address, location, station, status, and risk level. The module supports full CRUD operations, allowing administrators to register new devices, update device information, and deactivate devices that have been decommissioned or require maintenance."
    ),

    // Figure 4-7: IoT Devices
    (() => {
      const img = loadScreenshot("04_iot_devices.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-7: IoT Device Management Module with Device Inventory and Risk Indicators"));
      return elements;
    })(),

    bodyParagraph(
      "The device inventory displays each IoT device with its complete profile, including network configuration data such as IP address, MAC address, and network segment, which are essential for network security analysis and incident response. The device type classification system categorises the 31 seeded devices into six categories: controllers, which manage railway signalling operations; cameras, which provide surveillance coverage; sensors, which monitor track conditions and environmental parameters; gateways, which aggregate and route device communications; routers, which manage network traffic between segments; and trackers, which provide GPS location data for locomotives and rolling stock. Each category presents unique security challenges, and the classification system enables targeted vulnerability assessment and remediation strategies."
    ),

    bodyParagraph(
      "The risk level indicator associated with each device provides an aggregate security risk assessment based on the number and severity of associated vulnerabilities. Devices with critical or high-risk vulnerabilities are flagged with prominent colour indicators, enabling security administrators to prioritise their attention on the most at-risk assets. The module also tracks the firmware version of each device, which is critical for identifying devices running outdated or vulnerable software. The last scan date field records when each device was last assessed for security vulnerabilities, supporting compliance with security audit schedules and identifying devices that are overdue for reassessment."
    ),

    bodyParagraph(
      "The device management module implements filtering capabilities that allow users to narrow the device inventory by type, status, risk level, and station location. This filtering functionality is particularly important given the scale of NRZ's IoT deployment, which spans multiple stations across Zimbabwe, including Harare, Bulawayo, Mutare, Gweru, Kadoma, Kwekwe, and Masvingo. The search functionality enables users to locate specific devices by name, IP address, or location, facilitating rapid incident response when a security event is detected. The combination of filtering and search capabilities ensures that security administrators can efficiently navigate the device inventory regardless of its size."
    ),

    // 4.4.4 Vulnerability Management Module
    heading3("4.4.4 Vulnerability Management Module"),

    bodyParagraph(
      "The Vulnerability Management module is the core security analysis component of the NISAAP platform, providing comprehensive functionality for documenting, tracking, and resolving security vulnerabilities identified in NRZ's IoT infrastructure. As shown in Figure 4-8, the module presents a detailed inventory of all discovered vulnerabilities, including their associated device, severity classification, CVSS score, CVE identifier, and current remediation status."
    ),

    // Figure 4-8: Vulnerabilities
    (() => {
      const img = loadScreenshot("05_vulnerabilities.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-8: Vulnerability Management Module with Severity Classifications and CVSS Scores"));
      return elements;
    })(),

    bodyParagraph(
      "The module tracks the complete lifecycle of each vulnerability through five status stages: open, acknowledged, in_progress, resolved, and accepted_risk. The open status indicates a newly discovered vulnerability that has not yet been reviewed. The acknowledged status confirms that the security team has validated the vulnerability and accepted it as a genuine risk. The in_progress status indicates that remediation activities are underway. The resolved status marks a vulnerability as successfully remediated, while the accepted_risk status indicates that the organisation has formally accepted the residual risk, typically for low-severity vulnerabilities where remediation costs outweigh the potential impact."
    ),

    bodyParagraph(
      "Each vulnerability record includes a CVSS (Common Vulnerability Scoring System) score, which provides a standardised numerical assessment of the vulnerability's severity on a scale from 0.0 to 10.0. The CVSS scoring system enables quantitative risk comparison across different vulnerability types and supports data-driven prioritisation of remediation efforts. The 26 seeded vulnerabilities span the full severity range, with 5 critical vulnerabilities scoring above 9.0, including unencrypted signal communication protocols (CVSS 9.8), default credentials on CCTV systems (CVSS 9.1), and buffer overflow vulnerabilities in point machine controllers (CVSS 9.7). These critical vulnerabilities pose direct threats to railway safety and require immediate remediation."
    ),

    bodyParagraph(
      "The CVE identifier field links each vulnerability to the Common Vulnerabilities and Exposures database, enabling security analysts to access detailed technical information, known exploit techniques, and vendor advisories for each identified weakness. The module also captures a detailed description of each vulnerability, including the attack vector, potential impact, and affected components, providing the context necessary for informed remediation planning. The remediation field documents the recommended corrective actions, ensuring that security teams have clear guidance on how to address each vulnerability. The relationship between the Vulnerability model and the SecuritySolution model creates a direct link between identified weaknesses and their proposed or implemented remediation actions."
    ),

    // 4.4.5 Security Solutions Module
    heading3("4.4.5 Security Solutions Module"),

    bodyParagraph(
      "The Security Solutions module provides a structured framework for managing the remediation of identified vulnerabilities, tracking the implementation of security measures from proposal through to verification. As illustrated in Figure 4-9, the module presents a comprehensive list of security solutions linked to their associated vulnerabilities, displaying key information including the solution title, implementation status, priority level, assigned analyst, and cost estimate."
    ),

    // Figure 4-9: Security Solutions
    (() => {
      const img = loadScreenshot("06_security_solutions.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-9: Security Solutions Module with Implementation Tracking and Priority Levels"));
      return elements;
    })(),

    bodyParagraph(
      "The module tracks the implementation lifecycle of each security solution through four status stages: proposed, in_progress, implemented, and verified. The proposed status indicates a solution that has been identified but not yet started. The in_progress status indicates active implementation. The implemented status confirms that the solution has been deployed, and the verified status indicates that the solution has been tested and confirmed to effectively mitigate the associated vulnerability. This lifecycle tracking ensures that remediation efforts are systematically managed and that no identified vulnerability remains unaddressed."
    ),

    bodyParagraph(
      "The priority classification system categorises solutions as critical, high, medium, or low, aligning with the severity of the associated vulnerability and ensuring that remediation resources are directed toward the most impactful security gaps. The 22 seeded security solutions address vulnerabilities across all severity levels, with critical-priority solutions including the implementation of TLS 1.3 encryption for signal communications, emergency firmware patching for point machine controllers, and security hardening of core routing infrastructure. Each solution includes a cost estimate, supporting budget planning and return-on-investment analysis for security investments. The total estimated cost of all proposed and in-progress solutions provides management with a clear picture of the investment required to achieve a comprehensive security posture."
    ),

    bodyParagraph(
      "The assignment feature links each solution to a specific security analyst, establishing clear accountability for remediation activities. This assignment mechanism ensures that responsibility for each security action is explicitly defined, preventing remediation tasks from being overlooked or duplicated. The module also tracks due dates and completion dates, enabling project management oversight of the remediation programme. The combination of priority classification, assignment tracking, and date management creates a comprehensive remediation management system that supports both operational security improvement and strategic security planning."
    ),

    // 4.4.6 Assessment Module
    heading3("4.4.6 Assessment Module"),

    bodyParagraph(
      "The Assessment module supports the formal security assessment process for IoT devices, providing a structured framework for documenting evaluation findings, recommendations, and risk ratings. As illustrated in Figure 4-10, the module presents a list of completed and pending assessments, each linked to a specific device and assessor, ensuring full traceability of the assessment process."
    ),

    // Figure 4-10: Assessments
    (() => {
      const img = loadScreenshot("07_assessments.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-10: Assessment Module with Device Security Evaluation Records"));
      return elements;
    })(),

    bodyParagraph(
      "Each assessment record captures the findings from the security evaluation, including identified weaknesses, configuration issues, and compliance gaps. The recommendations field documents the specific corrective actions suggested by the assessor, providing actionable guidance for improving the device's security posture. The risk rating field provides an overall assessment of the device's security risk level, categorised as critical, high, medium, or low, which complements the vulnerability-based risk rating by incorporating the assessor's professional judgement regarding the device's overall security posture."
    ),

    bodyParagraph(
      "The 14 seeded assessments cover a representative sample of IoT devices across different types and stations, demonstrating the assessment workflow and providing baseline data for the platform's initial deployment. The relationship between the Assessment model and the User model ensures that each assessment is attributable to a specific analyst, supporting quality assurance and professional accountability. The relationship between the Assessment model and the IoTDevice model enables the platform to present a comprehensive security profile for each device, combining vulnerability data, solution implementation status, and assessment findings into a unified view of the device's security posture."
    ),

    bodyParagraph(
      "The assessment module supports NRZ's compliance requirements by maintaining a documented record of security evaluations for all critical IoT devices. This documentation is essential for demonstrating due diligence in cybersecurity management and for supporting regulatory compliance audits. The assessment date field enables tracking of assessment frequency, ensuring that devices are reassessed at appropriate intervals and that the security programme maintains up-to-date evaluations. The module's integration with the audit log system ensures that all assessment activities, including creation, modification, and deletion of assessment records, are automatically logged for compliance reporting purposes."
    ),

    // 4.4.7 Audit Log Module
    heading3("4.4.7 Audit Log Module"),

    bodyParagraph(
      "The Audit Log module provides comprehensive activity tracking across all NISAAP modules, creating an immutable record of user actions that supports security monitoring, compliance reporting, and forensic investigation. As shown in Figure 4-11, the audit log presents a chronological listing of all recorded activities, including the user who performed the action, the action type, the affected module, and a detailed description of the activity."
    ),

    // Figure 4-11: Audit Logs
    (() => {
      const img = loadScreenshot("08_audit_logs.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-11: Audit Log Module with Comprehensive Activity Tracking"));
      return elements;
    })(),

    bodyParagraph(
      "The audit logging system is implemented as a cross-cutting concern that automatically records significant actions across all modules. The logAudit function, which serves as the central logging mechanism, accepts parameters for the user identifier, action type, module name, optional details, and optional IP address. This function is invoked at every critical operation point, including user authentication events, data creation and modification operations, and configuration changes. The system differentiates between successful and failed authentication attempts, logging both successful login events and failed login attempts with the associated username, which supports intrusion detection and account compromise monitoring."
    ),

    bodyParagraph(
      "The 93 seeded audit log records demonstrate the comprehensive coverage of the logging system, spanning all eight functional modules. The audit log entries include actions such as LOGIN, LOGIN_FAILED, CREATE, UPDATE, and DELETE, providing a complete trace of data modifications within the system. The module field categorises each log entry by its source module, including Authentication, Devices, Vulnerabilities, Solutions, Assessments, and Users, enabling filtered analysis of activity patterns within specific functional areas. The timestamp field records the precise time of each action, supporting chronological analysis and incident reconstruction."
    ),

    bodyParagraph(
      "The audit log is designed as an append-only data store, meaning that existing log records cannot be modified or deleted through the application interface. This design ensures the integrity of the audit trail, preventing the possibility of tampering with evidence of unauthorised or malicious activities. The optional relationship between the AuditLog model and the User model allows the system to log actions performed by unauthenticated users, such as failed login attempts, while still maintaining the ability to associate authenticated actions with specific user accounts. The IP address field provides additional forensic information that can be used to identify the source of suspicious activities and to support network-level intrusion detection."
    ),

    // 4.4.8 Dark Mode Feature
    heading3("4.4.8 Dark Mode Feature"),

    bodyParagraph(
      "The NISAAP platform includes a dark mode feature that provides an alternative visual theme optimised for low-light environments and extended monitoring sessions. As illustrated in Figure 4-12, the dark mode replaces the default light colour scheme with a dark background and adjusted text and component colours that reduce eye strain and improve readability in operational environments where lighting conditions may vary. The feature is particularly relevant for NRZ's security operations centre, where personnel may need to monitor the platform for extended periods during night shifts or in dimly lit control rooms."
    ),

    // Figure 4-12: Dark Mode Dashboard
    (() => {
      const img = loadScreenshot("09_dark_mode_dashboard.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-12: NISAAP Dashboard in Dark Mode with Reduced Glare Interface"));
      return elements;
    })(),

    bodyParagraph(
      "The dark mode implementation uses the Zustand state management library to maintain the user's theme preference in the application state and the browser's localStorage. When a user toggles the dark mode switch, the Zustand store updates the darkMode state variable and persists the preference to localStorage using the key 'nisaap-dark-mode'. Upon subsequent visits, the application reads the stored preference from localStorage and applies the appropriate theme before rendering the interface, ensuring a consistent user experience across sessions. The toggleDarkMode function in the Zustand store implements this persistence logic, reading from localStorage when the application initialises and writing to it whenever the user changes the theme."
    ),

    // Figure 4-13: Dark Mode Code
    (() => {
      const img = loadScreenshot("13_dark_mode_code.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 15));
      }
      elements.push(figureCaption("Figure 4-13: Dark Mode Implementation Code with LocalStorage Persistence"));
      return elements;
    })(),

    bodyParagraph(
      "The dark mode styling is implemented through CSS class toggling, where the application adds or removes a 'dark' class on the root HTML element. Tailwind CSS's dark mode support enables component-level styling adjustments through the dark: variant prefix, which applies alternative styles when the dark class is present. This approach allows fine-grained control over the appearance of each component in dark mode without requiring separate style sheets or complex conditional rendering logic. The colour palette for dark mode was carefully designed to maintain sufficient contrast ratios for readability while reducing overall screen brightness, with dark navy backgrounds (#1A2B4A) and muted text colours that comply with Web Content Accessibility Guidelines for contrast ratios."
    ),

    bodyParagraph(
      "The dark mode feature is accessible from all pages within the application through a toggle switch located in the sidebar navigation panel. This placement ensures that users can switch themes at any point during their session without navigating to a separate settings page. The toggle state is visually indicated through a sun or moon icon, providing clear feedback about the current theme. The implementation ensures that all UI components, including data tables, form inputs, charts, and modal dialogs, correctly render in both light and dark modes, maintaining functional consistency and visual coherence across the entire application regardless of the selected theme."
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
    ["Devices", "GET/PUT/DELETE", "/api/devices/[id]", "Get, update, or delete a specific device"],
    ["Vulnerabilities", "GET", "/api/vulnerabilities", "List all vulnerabilities with severity data"],
    ["Vulnerabilities", "GET/PUT/DELETE", "/api/vulnerabilities/[id]", "Get, update, or delete a vulnerability"],
    ["Solutions", "GET", "/api/solutions", "List all security solutions"],
    ["Solutions", "GET/PUT/DELETE", "/api/solutions/[id]", "Get, update, or delete a solution"],
    ["Assessments", "GET", "/api/assessments", "List all security assessments"],
    ["Assessments", "GET/PUT/DELETE", "/api/assessments/[id]", "Get, update, or delete an assessment"],
    ["Audit Logs", "GET", "/api/audit-logs", "List all audit log entries"],
    ["Root", "GET", "/api/route", "API health check and endpoint listing"],
  ];

  return [
    heading2("4.5 REST API Design"),

    bodyParagraph(
      "The NISAAP platform exposes its functionality through a comprehensive set of RESTful API endpoints that follow established design principles for web-based applications. The API was designed to be stateless, cacheable, and uniform in its interface design, adhering to the Representational State Transfer architectural constraints. Each endpoint accepts and returns JSON-formatted data, uses standard HTTP methods to indicate the intended operation, and returns appropriate HTTP status codes to communicate the outcome of the request. The API design supports the separation of concerns between the frontend and backend layers, enabling independent evolution of the user interface and the business logic."
    ),

    bodyParagraph(
      "Table 4-3 provides a comprehensive listing of the 17 API endpoints implemented across the eight functional modules. The endpoints follow a consistent naming convention that uses plural resource nouns and hierarchical paths to indicate resource relationships. The authentication endpoints are grouped under the /api/auth path, while resource-specific endpoints follow the /api/{resource} pattern with optional identifier parameters for individual resource operations. The dashboard statistics endpoint provides an aggregated data view that combines information from multiple underlying resources."
    ),

    tableCaption("Table 4-3: NISAAP REST API Endpoints"),
    createAcademicTable(apiHeaders, apiRows, [1800, 1400, 3200, 4000]),

    bodyParagraph(
      "The API implementation enforces authentication requirements on all endpoints except the login endpoint, which by necessity must be accessible to unauthenticated users. Each protected endpoint begins by verifying the presence and validity of the session cookie in the request headers. If no valid session is found, the endpoint returns a 401 Unauthorised response with a descriptive error message. This consistent authentication check ensures that no protected resource can be accessed without proper credentials, providing a robust security boundary around the application's data and functionality."
    ),

    bodyParagraph(
      "Error handling across the API follows a consistent pattern that returns structured JSON error responses with appropriate HTTP status codes. Client-side errors, such as missing required fields or invalid data formats, result in 400 Bad Request responses. Authentication failures return 401 Unauthorised responses. Server-side errors return 500 Internal Server Error responses with a generic error message to avoid exposing internal system details. All error responses include a success field set to false and an error field containing a human-readable description of the problem. This consistent error handling pattern simplifies frontend error processing and ensures that the API provides useful feedback without compromising security."
    ),

    bodyParagraph(
      "The API also implements comprehensive audit logging for all data modification operations. Every POST, PUT, and DELETE request triggers an audit log entry that records the user who performed the action, the type of action, the affected module, and a description of the change. This audit trail provides complete traceability of all data modifications, supporting both operational oversight and compliance reporting requirements. The combination of authentication enforcement, consistent error handling, and comprehensive audit logging creates a secure and well-documented API layer that forms the backbone of the NISAAP platform."
    ),

    // User Management screenshot (additional figure)
    bodyParagraph(
      "The user management interface, as shown in Figure 4-13, provides administrators with the ability to view and manage all user accounts within the system. The interface displays user details including full name, username, email, role, department, and account status. Administrators can create new user accounts, modify existing account details, change role assignments, and deactivate accounts that are no longer required. All user management operations are protected by role-based access control, ensuring that only administrators can modify user account information."
    ),

    (() => {
      const img = loadScreenshot("03_user_management.png");
      const elements = [];
      if (img) {
        elements.push(imageParagraph(img, 14));
      }
      elements.push(figureCaption("Figure 4-13: User Management Module with Role-Based Access Control Interface"));
      return elements;
    })(),
  ].flat();
}

function section_4_6_system_testing() {
  return [
    heading2("4.6 System Testing and Validation"),

    bodyParagraph(
      "System testing was conducted throughout the development lifecycle of the NISAAP platform to ensure that each functional module met its specified requirements and that the integrated system performed reliably under expected operational conditions. The testing strategy encompassed multiple levels, including unit testing of individual API endpoints, integration testing of module interactions, and system-level testing of end-to-end workflows. The testing process was designed to validate both the functional correctness of the system and its security properties, reflecting the dual importance of operational reliability and security assurance in a railway IoT management context."
    ),

    bodyParagraph(
      "Authentication testing verified the security of the login and session management mechanisms. Tests confirmed that valid credentials result in successful authentication with the creation of a properly configured session cookie, including HTTP-only, SameSite=Strict, and Max-Age attributes. Invalid credentials were confirmed to return 401 Unauthorised responses without creating session cookies. Failed authentication attempts were verified to generate audit log entries, and deactivated accounts were confirmed to be denied access regardless of credential validity. Session expiry was tested by verifying that expired cookies no longer grant access to protected endpoints."
    ),

    bodyParagraph(
      "Module-level testing validated the CRUD operations for each data model, confirming that create, read, update, and delete operations function correctly and enforce data integrity constraints. The IoT Device Management module was tested with the 31 seeded device records, verifying that filtering by device type, status, and risk level produces accurate results. The Vulnerability Management module was tested with the 26 seeded vulnerability records, confirming that severity classifications, CVSS scores, and status transitions function as designed. The Security Solutions module was validated with the 22 seeded solution records, verifying that implementation status tracking and priority classification operate correctly."
    ),

    bodyParagraph(
      "The Audit Log module was subjected to particularly rigorous testing due to its importance for security monitoring and compliance reporting. Tests confirmed that all CRUD operations across all modules generate appropriate audit log entries, including the correct action type, module name, and timestamp. The append-only nature of the audit log was verified by confirming that no application interface allows modification or deletion of existing log entries. The 93 seeded audit log records were used to validate the log display, filtering, and pagination functionality, ensuring that the audit log interface can handle large volumes of log data without performance degradation."
    ),

    bodyParagraph(
      "Role-based access control testing confirmed that the three user roles, namely admin, analyst, and viewer, have the appropriate access privileges. Viewer accounts were verified to have read-only access to dashboard statistics, device inventories, and vulnerability reports, while being denied access to data modification endpoints. Analyst accounts were confirmed to have read and write access to vulnerability, solution, and assessment modules, but denied access to user management functions. Administrator accounts were verified to have full access to all system functionality. Unauthorized access attempts from each role type were confirmed to return appropriate 403 Forbidden responses and generate audit log entries."
    ),

    bodyParagraph(
      "The dark mode feature was tested across all application views to ensure consistent rendering in both light and dark themes. Tests verified that the theme preference is correctly persisted in localStorage and restored upon subsequent visits. The colour contrast ratios in both themes were validated against the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA requirements, confirming that all text elements maintain sufficient contrast against their backgrounds in both modes. The visual consistency of all UI components, including data tables, charts, form inputs, and navigation elements, was verified across both themes to ensure a professional and usable interface regardless of the selected mode."
    ),
  ];
}

function section_4_7_summary() {
  return [
    heading2("4.7 Summary"),

    bodyParagraph(
      "This chapter has presented the comprehensive design and implementation of the Network Infrastructure Security Assessment and Action Platform (NISAAP), a web-based IoT security management system developed for the National Railways of Zimbabwe. The system was designed using a three-tier architecture that separates the presentation, application logic, and data persistence layers, providing a maintainable and scalable foundation for managing IoT security across NRZ's railway operations. The technology stack, comprising Next.js 16, TypeScript, Tailwind CSS 4, Prisma ORM, and SQLite, was selected to balance security, performance, and operational simplicity in the context of NRZ's infrastructure constraints."
    ),

    bodyParagraph(
      "The database design defines six core models that capture the complete data domain of IoT security management, supporting the full lifecycle from device registration through vulnerability discovery, remediation tracking, security assessment, and audit compliance. The implementation of eight functional modules, including authentication, dashboard, IoT device management, vulnerability management, security solutions, assessment, audit logging, and dark mode, provides a comprehensive suite of security management tools that address the specific requirements identified in the vulnerability assessment of NRZ's IoT infrastructure."
    ),

    bodyParagraph(
      "The REST API design, comprising 17 endpoints across the eight modules, provides a well-documented and secure interface for all system operations, with consistent authentication enforcement, error handling, and audit logging. System testing validated the functional correctness, security properties, and user experience of each module, confirming that the platform meets its specified requirements for reliability, security, and usability. The NISAAP platform demonstrates that a focused, well-designed web application can effectively address the IoT security challenges facing railway operators, providing a practical tool for managing the growing attack surface created by the proliferation of connected devices in operational technology environments."
    ),

    bodyParagraph(
      "The implementation demonstrates the viability of a modern web technology stack for security-critical applications in the railway sector, showing that frameworks such as Next.js and tools such as Prisma ORM can be leveraged to build secure, maintainable systems without requiring extensive infrastructure investment. The platform's modular architecture supports future expansion, including the potential integration of real-time threat intelligence feeds, automated vulnerability scanning, and machine learning-based anomaly detection, which would further enhance NRZ's ability to protect its IoT infrastructure against evolving cyber threats."
    ),
  ];
}

// =================== BUILD DOCUMENT ===================

async function generateDocument() {
  console.log("Generating Chapter 4 DOCX document...");

  const allContent = [
    ...section_4_0_introduction(),
    ...section_4_1_system_architecture(),
    ...section_4_2_technology_stack(),
    ...section_4_3_database_design(),
    ...section_4_4_system_implementation(),
    ...section_4_5_rest_api_design(),
    ...section_4_6_system_testing(),
    ...section_4_7_summary(),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { name: FONT_EN, eastAsia: FONT_CJK },
            size: 24, // 12pt
          },
          paragraph: {
            spacing: { line: 360 }, // 1.5x line spacing
          },
        },
        heading1: {
          run: {
            font: { name: FONT_EN, eastAsia: FONT_CJK },
            size: 32, // 16pt
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
            size: 30, // 15pt
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
            size: 28, // 14pt
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
              width: 11906, // A4 width in twips
              height: 16838, // A4 height in twips
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
                    size: 18, // 9pt
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
                    size: 20, // 10pt
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
