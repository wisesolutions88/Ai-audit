export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum Category {
  SECURITY = 'SECURITY',
  PRIVACY = 'PRIVACY',
  OPERATIONS = 'OPERATIONS',
  QUALITY = 'QUALITY',
  IDENTITY = 'IDENTITY',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN'
}

export interface Checkpoint {
  id: number;
  title: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  summary: string;
}

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'WS';
  isPublic: boolean;
  hasAuth: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  abuseControls: {
    rateLimited: boolean;
    paginated: boolean;
    idorRisk: boolean;
    injectionRisk: boolean;
    ssrfRisk: boolean;
  };
}

export interface SecretLeak {
  keyType: string;
  severity: Severity;
  file: string;
  snippet: string;
  remediation: string;
}

export interface ThreatModel {
  assets: string[];
  entryPoints: string[];
  trustBoundaries: string[];
  topAbuseCases: string[];
}

export interface QualityMetrics {
  complexity: number;
  maintainability: number;
  performance: number;
  hygiene: number;
}

export interface InfraCheck {
  title: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category: Category;
  confidence: number;
  likelihood: number;
  evidence: {
    file: string;
    lineRange: string;
    snippet: string;
  };
  thoughtProcess: string;
  fixGuidance: {
    explanation: string;
    alternative: string;
  };
  exploitStory: string;
  cve?: string;
  references?: string[];
}

export interface BlueprintPillar {
  title: string;
  description: string;
  icon: 'Shield' | 'Database' | 'Cpu' | 'Globe' | 'Zap' | 'Lock' | 'Activity' | 'Layers';
}

export interface AuditReport {
  projectName?: string;
  timestamp?: string;
  score: number;
  vibePersonality: string;
  techStack: string[];
  summary: string;
  blueprint: {
    architectureType: string;
    dataFlow: string;
    pillars: BlueprintPillar[];
  };
  threatModel: ThreatModel;
  endpoints: APIEndpoint[];
  leaks: SecretLeak[];
  infraChecks: InfraCheck[];
  checkpoints: Checkpoint[];
  metrics: QualityMetrics;
  findings: Finding[];
  technicalReconNotes?: string;
  breakdown: {
    security: number;
    privacy: number;
    operations: number;
    quality: number;
  };
}

export type AuditStatus = 'IDLE' | 'SCANNING' | 'REPORTING' | 'ERROR';

export type AppView = 'HOME' | 'DASHBOARD' | 'ARCHIVE';