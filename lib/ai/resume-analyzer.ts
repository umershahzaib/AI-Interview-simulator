import { ResumeContext } from "@/lib/types/interview";

/**
 * Parse resume text and extract structured information
 * This is a simple text-based parser that looks for common resume patterns
 */
export async function parseResumeText(text: string): Promise<ResumeContext> {
  const lines = text.split("\n").map((line) => line.trim());

  const context: ResumeContext = {
    name: extractName(lines),
    skills: extractSkills(text),
    education: extractEducation(lines),
    experience: extractExperience(lines),
    projects: extractProjects(lines),
    technologies: extractTechnologies(text),
    certifications: extractCertifications(lines),
  };

  return context;
}

/**
 * Extract name from resume (usually in first few lines)
 */
function extractName(lines: string[]): string | undefined {
  // Look for a name in the first 5 lines
  // Usually a name is a short line with capital letters
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      line.length > 3 &&
      line.length < 50 &&
      /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line)
    ) {
      return line;
    }
  }
  return undefined;
}

/**
 * Extract skills section
 */
function extractSkills(text: string): string[] {
  const skillsMatch = text.match(
    /(?:skills|technical skills|core competencies)[:\s]+([\s\S]{0,500}?)(?:\n\n|education|experience|projects)/i
  );

  if (skillsMatch) {
    const skillsText = skillsMatch[1];
    const skills = skillsText
      .split(/[,;|\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 50);
    return skills.slice(0, 20); // Limit to 20 skills
  }

  // Fallback: extract common tech keywords
  const techKeywords = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "Angular",
    "Vue",
    "SQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
    "Git",
    "REST API",
    "GraphQL",
    "HTML",
    "CSS",
    "Tailwind",
    "Next.js",
  ];

  return techKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Extract education entries
 */
function extractEducation(lines: string[]): string[] {
  const education: string[] = [];
  let inEducationSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect education section start
    if (/^(education|academic|qualifications)$/i.test(line)) {
      inEducationSection = true;
      continue;
    }

    // Stop at next major section
    if (
      inEducationSection &&
      /^(experience|work|projects|skills|certifications)$/i.test(line)
    ) {
      break;
    }

    // Extract education entries
    if (
      inEducationSection &&
      (line.includes("University") ||
        line.includes("College") ||
        line.includes("Bachelor") ||
        line.includes("Master") ||
        line.includes("PhD") ||
        line.includes("Degree"))
    ) {
      education.push(line);
    }
  }

  return education.slice(0, 5);
}

/**
 * Extract work experience entries
 */
function extractExperience(lines: string[]): string[] {
  const experience: string[] = [];
  let inExperienceSection = false;
  let currentEntry = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect experience section
    if (/^(experience|work experience|employment)$/i.test(line)) {
      inExperienceSection = true;
      continue;
    }

    // Stop at next major section
    if (
      inExperienceSection &&
      /^(education|projects|skills|certifications)$/i.test(line)
    ) {
      break;
    }

    // Look for job titles or company names
    if (
      inExperienceSection &&
      (line.match(/\d{4}\s*-\s*\d{4}/) || // Date range
        line.match(/\d{4}\s*-\s*present/i) || // Current job
        line.includes("Engineer") ||
        line.includes("Developer") ||
        line.includes("Manager") ||
        line.includes("Analyst"))
    ) {
      if (currentEntry) {
        experience.push(currentEntry.trim());
      }
      currentEntry = line;
    } else if (inExperienceSection && line && currentEntry) {
      currentEntry += " " + line;
      if (currentEntry.length > 200) {
        experience.push(currentEntry.trim().substring(0, 200));
        currentEntry = "";
      }
    }
  }

  if (currentEntry) {
    experience.push(currentEntry.trim());
  }

  return experience.slice(0, 5);
}

/**
 * Extract project entries
 */
function extractProjects(lines: string[]): string[] {
  const projects: string[] = [];
  let inProjectsSection = false;
  let currentProject = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect projects section
    if (/^(projects|personal projects|portfolio)$/i.test(line)) {
      inProjectsSection = true;
      continue;
    }

    // Stop at next major section
    if (
      inProjectsSection &&
      /^(education|experience|skills|certifications)$/i.test(line)
    ) {
      break;
    }

    if (inProjectsSection && line) {
      if (line.match(/^[A-Z]/) && !currentProject) {
        currentProject = line;
      } else if (currentProject) {
        currentProject += " " + line;
        if (currentProject.length > 150) {
          projects.push(currentProject.trim().substring(0, 150));
          currentProject = "";
        }
      }
    }
  }

  if (currentProject) {
    projects.push(currentProject.trim());
  }

  return projects.slice(0, 5);
}

/**
 * Extract technologies from entire text
 */
function extractTechnologies(text: string): string[] {
  const technologies = new Set<string>();

  const techPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|Go|Rust|PHP|Swift|Kotlin)\b/gi,
    /\b(React|Angular|Vue|Svelte|Next\.js|Nuxt\.js|Express|Django|Flask|Spring|Laravel)\b/gi,
    /\b(Node\.js|Deno|Bun)\b/gi,
    /\b(MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch|DynamoDB)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|CircleCI|GitHub Actions)\b/gi,
    /\b(REST|GraphQL|gRPC|WebSocket)\b/gi,
    /\b(Git|GitHub|GitLab|Bitbucket)\b/gi,
  ];

  techPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => technologies.add(match));
    }
  });

  return Array.from(technologies).slice(0, 20);
}

/**
 * Extract certifications
 */
function extractCertifications(lines: string[]): string[] {
  const certifications: string[] = [];
  let inCertSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^(certifications|certificates|licenses)$/i.test(line)) {
      inCertSection = true;
      continue;
    }

    if (
      inCertSection &&
      /^(education|experience|projects|skills)$/i.test(line)
    ) {
      break;
    }

    if (
      inCertSection &&
      (line.includes("Certified") ||
        line.includes("Certificate") ||
        line.includes("AWS") ||
        line.includes("Azure") ||
        line.includes("Google"))
    ) {
      certifications.push(line);
    }
  }

  return certifications.slice(0, 5);
}

/**
 * Extract text from PDF file
 * For MVP, we'll implement a basic approach
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // For MVP: use a simple approach with PDF.js or similar
  // This is a placeholder that returns the file as text if possible
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuffer);
    return text;
  } catch (error) {
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Main function to analyze resume from file
 */
export async function analyzeResume(file: File): Promise<ResumeContext> {
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  try {
    const text = await extractTextFromPDF(file);
    return await parseResumeText(text);
  } catch (error) {
    console.error("Resume analysis failed:", error);
    throw new Error(
      "Failed to analyze resume. Please check the file and try again."
    );
  }
}
