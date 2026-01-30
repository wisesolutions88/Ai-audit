import { GoogleGenAI, Type } from "@google/genai";
import { AuditReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const performVibeAudit = async (
  code: string, 
  onProgress: (msg: string) => void
): Promise<AuditReport> => {
  
  onProgress("Phase 1/2: Hunting Injection, SSRF, IDOR, and PII exposures...");
  const reconResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a Lead Pentester and Privacy Advocate. Perform a Deep Recon of this codebase.
    
    CRITICAL FOCUS:
    1. Identify all API Endpoints (Path, Method, Auth status).
    2. PII EXPOSURE HUNT:
       - LOGS: Find instances where PII (emails, names, tokens) are passed to logging functions like console.log or custom loggers.
       - URLs: Identify query parameters or path segments that expose PII.
       - CLIENT STATE: Find unmasked PII stored in local state (React, Redux, localStorage).
    3. Injection Scanning: Hunt for SQLi, NoSQLi, and Command Injection points.
    4. Secrets Scan: Hunt for hardcoded keys and credentials.

    CODE:
    ---
    ${code}
    ---`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rawEndpoints: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING },
                method: { type: Type.STRING },
                risks: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            } 
          },
          piiFindings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                leakType: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          vulnerabilityAnalysis: { type: Type.STRING },
          architectureNotes: { type: Type.STRING }
        }
      }
    }
  });

  const reconDataRaw = reconResponse.text;

  onProgress("Phase 2/2: Mapping Privacy & Security surface to Ship-Ready Gate...");
  const synthesisResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a Lead Security Architect. Finalize the Audit Report based on technical recon and source code.
    
    TECHNICAL RECON DATA:
    ${reconDataRaw}

    SOURCE CODE:
    ---
    ${code}
    ---

    TASK:
    1. Evaluate EXACTLY 15 SHIP-READY CHECKPOINTS. You MUST provide all 15.
       List: ${SHIP_READY_CHECKPOINTS_LIST.join(', ')}.
    2. Synthesize PII exposures into 'findings' with CATEGORY: PRIVACY. 
    3. Ensure 'technicalReconNotes' is professional markdown for the PDF export.`,
    config: {
      responseMimeType: "application/json",
      systemInstruction: `Return a final AuditReport JSON. 
      IMPORTANT: The 'checkpoints' array MUST contain exactly 15 objects. 
      Use these IDs and Titles: ${SHIP_READY_CHECKPOINTS_LIST.map((t, i) => `#${i+1}: ${t}`).join(', ')}.`,
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
                exploitStory: { type: Type.STRING },
                cve: { type: Type.STRING },
                references: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          technicalReconNotes: { type: Type.STRING }
        }
      }
    }
  });

  try {
    const report = JSON.parse(synthesisResponse.text) as AuditReport;
    
    // Safety check: if model hallucinated a shorter list, we backfill it.
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

    // Standardize status strings
    report.checkpoints = report.checkpoints.map(cp => ({
      ...cp,
      status: (['PASS', 'FAIL', 'WARN'].includes(cp.status.toUpperCase()) 
        ? cp.status.toUpperCase() 
        : 'WARN') as 'PASS' | 'FAIL' | 'WARN'
    }));

    return report;
  } catch (error) {
    throw new Error("Failed to parse the final audit report.");
  }
};

export const generateAudioBriefing = async (report: AuditReport): Promise<string> => {
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
  if (!base64Audio) throw new Error("Audio generation failed: No audio data in response.");
  return base64Audio;
};
