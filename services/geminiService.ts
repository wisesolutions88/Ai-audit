import { GoogleGenAI, Type } from "@google/genai";
import { AuditReport } from "../types";

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

/**
 * Helper to safely extract JSON from model responses which might include markdown blocks
 */
const extractJson = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return JSON.parse(text);
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON Parse Error. Original text:", text);
    throw new Error("The auditor returned an invalid response format.");
  }
};

export const performVibeAudit = async (
  code: string, 
  onProgress: (msg: string) => void
): Promise<AuditReport> => {
  console.log("[VibeAudit] Starting Audit Process...");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  onProgress("Phase 1/3: Rapid recon hunting for PII & injection points...");
  console.log("[VibeAudit] Phase 1: Requesting Gemini 3 Flash Recon...");
  
  try {
    const reconResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify vulnerabilities and PII leaks in this code. 
      Focus on: Endpoints, PII in logs/URLs/State, SQLi, NoSQLi, and hardcoded keys.
      CODE:
      ---
      ${code.slice(0, 30000)}
      ---`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            piiLeaks: { type: Type.ARRAY, items: { type: Type.STRING } },
            endpoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const reconDataRaw = reconResponse.text;
    console.log("[VibeAudit] Phase 1 Complete. Recon Data size:", reconDataRaw?.length);

    onProgress("Phase 2/3: Deep architectural reasoning & threat modeling...");
    console.log("[VibeAudit] Phase 2: Requesting Gemini 3 Pro Synthesis (this may take 30-60s due to deep reasoning)...");

    const synthesisResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Finalize the Audit Report.
      RECON DATA: ${reconDataRaw}
      FULL CODE: ${code.slice(0, 20000)}
      
      REQUIRED:
      1. Evaluate ALL 15 SHIP-READY CHECKPOINTS: ${SHIP_READY_CHECKPOINTS_LIST.join(', ')}.
      2. Score the project (0-100).
      3. Detailed 'findings' with CATEGORY: PRIVACY for any PII issues.`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        systemInstruction: "You are a Lead Security Architect. Return a complete AuditReport JSON. Ensure checkpoints have IDs 1-15.",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            vibePersonality: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            metrics: {
              type: Type.OBJECT,
              properties: {
                complexity: { type: Type.NUMBER },
                maintainability: { type: Type.NUMBER },
                performance: { type: Type.NUMBER },
                hygiene: { type: Type.NUMBER }
              }
            },
            threatModel: {
              type: Type.OBJECT,
              properties: {
                assets: { type: Type.ARRAY, items: { type: Type.STRING } },
                entryPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                trustBoundaries: { type: Type.ARRAY, items: { type: Type.STRING } },
                topAbuseCases: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            blueprint: {
              type: Type.OBJECT,
              properties: {
                architectureType: { type: Type.STRING },
                dataFlow: { type: Type.STRING },
                pillars: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      icon: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            checkpoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  status: { type: Type.STRING },
                  summary: { type: Type.STRING }
                }
              }
            },
            endpoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  method: { type: Type.STRING },
                  isPublic: { type: Type.BOOLEAN },
                  hasAuth: { type: Type.BOOLEAN },
                  riskLevel: { type: Type.STRING },
                  description: { type: Type.STRING },
                  abuseControls: {
                    type: Type.OBJECT,
                    properties: {
                      rateLimited: { type: Type.BOOLEAN },
                      paginated: { type: Type.BOOLEAN },
                      idorRisk: { type: Type.BOOLEAN },
                      injectionRisk: { type: Type.BOOLEAN },
                      ssrfRisk: { type: Type.BOOLEAN }
                    }
                  }
                }
              }
            },
            leaks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  keyType: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  file: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  remediation: { type: Type.STRING }
                }
              }
            },
            infraChecks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  status: { type: Type.STRING },
                  detail: { type: Type.STRING }
                }
              }
            },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                security: { type: Type.NUMBER },
                privacy: { type: Type.NUMBER },
                operations: { type: Type.NUMBER },
                quality: { type: Type.NUMBER }
              }
            },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  category: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  likelihood: { type: Type.NUMBER },
                  evidence: {
                    type: Type.OBJECT,
                    properties: {
                      file: { type: Type.STRING },
                      lineRange: { type: Type.STRING },
                      snippet: { type: Type.STRING }
                    }
                  },
                  thoughtProcess: { type: Type.STRING },
                  fixGuidance: {
                    type: Type.OBJECT,
                    properties: {
                      explanation: { type: Type.STRING },
                      alternative: { type: Type.STRING }
                    }
                  },
                  exploitStory: { type: Type.STRING }
                }
              }
            },
            technicalReconNotes: { type: Type.STRING }
          }
        }
      }
    });

    console.log("[VibeAudit] Phase 2 Complete. Processing results...");
    onProgress("Phase 3/3: Finalizing security ledger...");

    const report = extractJson(synthesisResponse.text) as AuditReport;
    
    // Ensure all checkpoints exist
    if (!report.checkpoints || report.checkpoints.length < 15) {
      const existingTitles = new Set((report.checkpoints || []).map(cp => cp.title));
      const missingTitles = SHIP_READY_CHECKPOINTS_LIST.filter(t => !existingTitles.has(t));
      const backfilled = missingTitles.map((title, idx) => ({
        id: (report.checkpoints?.length || 0) + idx + 1,
        title,
        status: 'WARN' as const,
        summary: 'Deep scan inconclusive or requirements not explicitly identified in source.'
      }));
      report.checkpoints = [...(report.checkpoints || []), ...backfilled].slice(0, 15);
    }

    console.log("[VibeAudit] Audit Process Finished successfully.");
    return report;
  } catch (error: any) {
    console.error("[VibeAudit] Fatal Audit Error:", error);
    if (error.message?.includes("403") || error.message?.includes("PERMISSION_DENIED")) {
      throw error; // Re-throw for App.tsx to handle API key selection
    }
    throw new Error(`Audit failed during architectural reasoning: ${error.message || 'Unknown error'}`);
  }
};

export const generateAudioBriefing = async (report: AuditReport): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const topAbuse = report.threatModel.topAbuseCases?.[0] || "potential architectural flaws";
  const textToSpeak = `Security Briefing for project with ${report.vibePersonality} vibes. 
  Our threat model highlights a risk of ${topAbuse}. 
  With a Ship Score of ${report.score}, my verdict is: ${report.score > 70 ? 'Ship it with caution.' : 'Hold deployment and fix critical findings.'}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: textToSpeak }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio generation failed.");
  return base64Audio;
};
