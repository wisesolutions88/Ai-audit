
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AuditReport, Severity, Category } from "../types";

const SHIP_READY_CHECKPOINTS_LIST = [
  "PII Sanitization (No raw emails/names in logs/state)",
  "SQL/NoSQL Injection Resilience",
  "SSRF & Open Redirect Protection",
  "IDOR/Broken Access Control Check",
  "Hardcoded Secret Detection",
  "Secure Error Handling (No stack traces exposed)",
  "Client-Side Storage Security (LocalStorage usage)",
  "API Rate Limiting & DoS Protection",
  "Supply Chain Risk (Dependency Audit)",
  "Security Headers Presence (CSP, HSTS)",
  "Environment Variable Hygiene",
  "Input Validation & Sanitization",
  "Authentication & Session Integrity",
  "Sensitive Data Flow Topology",
  "Logging Hygiene (No credentials in stdout)"
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;
    const errorStr = JSON.stringify(error).toLowerCase();
    const isRetryable = errorStr.includes('500') || errorStr.includes('xhr') || errorStr.includes('timeout') || errorStr.includes('deadline');
    if (isRetryable) {
      console.warn(`[VibeAudit] Retrying after error... (${retries} left)`);
      await sleep(delay + Math.random() * 1000); // Add jitter
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const extractJson = (text: string) => {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return JSON.parse(text);
    return JSON.parse(text.substring(start, end + 1).replace(/,\s*([\]}])/g, '$1'));
  } catch (e) {
    throw new Error("Audit generation failed: Invalid JSON structure returned by the model.");
  }
};

const normalizeReport = (report: any): AuditReport => {
  const safeFindings = (report.findings || []).map((f: any) => ({
    id: f.id || Math.random().toString(36).substr(2, 9),
    title: f.title || "Untitled Finding",
    severity: f.severity || Severity.MEDIUM,
    category: f.category || Category.SECURITY,
    confidence: f.confidence ?? 0.5,
    likelihood: f.likelihood ?? 0.5,
    evidence: {
      file: f.evidence?.file || "unknown_file",
      lineRange: f.evidence?.lineRange || "??",
      snippet: f.evidence?.snippet || "// No snippet available"
    },
    thoughtProcess: f.thoughtProcess || "Analysis complete.",
    fixGuidance: {
      explanation: f.fixGuidance?.explanation || "Fix details pending.",
      alternative: f.fixGuidance?.alternative || "// remediation logic pending"
    },
    exploitStory: f.exploitStory || "Potential risk identified.",
    references: f.references || []
  }));

  return {
    projectName: report.projectName || "Unnamed Project",
    timestamp: report.timestamp || new Date().toISOString(),
    score: report.score ?? 50,
    vibePersonality: report.vibePersonality || "Standard vibes.",
    techStack: report.techStack || [],
    summary: report.summary || "No summary available.",
    metrics: report.metrics || { complexity: 50, maintainability: 50, performance: 50, hygiene: 50 },
    threatModel: report.threatModel || { assets: [], entryPoints: [], trustBoundaries: [], topAbuseCases: [] },
    blueprint: report.blueprint || { architectureType: 'Standard', dataFlow: 'N/A', pillars: [] },
    endpoints: report.endpoints || [],
    leaks: report.leaks || [],
    infraChecks: report.infraChecks || [],
    checkpoints: (report.checkpoints || []).slice(0, 15),
    findings: safeFindings,
    breakdown: report.breakdown || { security: 50, privacy: 50, operations: 50, quality: 50 }
  };
};

export const performVibeAudit = async (code: string, onProgress: (msg: string) => void): Promise<AuditReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const codeSnippet = code.slice(0, 7000); 

  onProgress("Phase 1/2: Technical Recon...");
  
  const recon: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze code vulnerabilities. Return JSON only. CODE: ${codeSnippet}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          findings: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  }));

  onProgress("Phase 2/2: Architectural Reasoning...");

  const generateReport = async (model: string): Promise<GenerateContentResponse> => {
    return await ai.models.generateContent({
      model,
      contents: `Finalize security audit based on recon: ${recon.text}. Source: ${codeSnippet}. 
      Return JSON only. vibePersonality must be 1 sentence.`,
      config: {
        maxOutputTokens: 6000,
        thinkingConfig: { thinkingBudget: 2000 },
        responseMimeType: "application/json",
        systemInstruction: "Lead Security Architect. Output strictly valid JSON."
      }
    });
  };

  try {
    let final;
    try {
      final = await withRetry(() => generateReport("gemini-3-pro-preview"), 2);
    } catch (e) {
      console.warn("Falling back to Flash for report synthesis...");
      final = await withRetry(() => generateReport("gemini-3-flash-preview"), 1);
    }

    const data = normalizeReport(extractJson(final.text));
    
    // Checkpoints backfill
    if (!data.checkpoints || data.checkpoints.length < 15) {
      const existing = new Set(data.checkpoints.map(c => c.title));
      const missing = SHIP_READY_CHECKPOINTS_LIST.filter(t => !existing.has(t)).map((title, i) => ({
        id: data.checkpoints.length + i + 1,
        title,
        status: 'WARN' as const,
        summary: 'Not explicitly verified in current context.'
      }));
      data.checkpoints = [...data.checkpoints, ...missing].slice(0, 15);
    }

    return data;
  } catch (error: any) {
    throw new Error(`Audit synthesis failed: ${error.message}`);
  }
};

export const generateAudioBriefing = async (report: AuditReport): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const textToSpeak = `Security Briefing for project ${report.projectName}. Score is ${report.score}. ${report.vibePersonality}`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: textToSpeak }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
    }
  });
  const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audio) throw new Error("TTS failed");
  return audio;
};
