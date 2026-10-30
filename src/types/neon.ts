export type BehavioralState =
  | 'IDLE'
  | 'PATROLLING'
  | 'INVESTIGATING'
  | 'ALERT'
  | 'ENGAGING'
  | 'FLEEING'
  | 'CONVERSING'
  | 'PLANNING'
  | 'RECOVERING';

export type ExecutionState =
  | 'UNINITIALIZED'
  | 'INITIALIZED'
  | 'RUNNING'
  | 'PAUSED'
  | 'TERMINATED'
  | 'ERROR_STATE';

export type EventOrigin =
  | 'CONFIRMED'
  | 'UNKNOWN'
  | 'INFERRED'
  | 'SIMULATED_TEST';

export type AdapterStatus =
  | 'CORE_READY'
  | 'ADAPTER_DISCONNECTED'
  | 'SIMULATION_MODE'
  | 'GAME_CONNECTED'
  | 'ERROR';

export type EventType =
  | 'GUNFIRE_DETECTED'
  | 'POLICE_SIREN_HEARD'
  | 'ENTITY_ENCOUNTERED'
  | 'SAFEHOUSE_ENTERED'
  | 'DEAL_OFFERED'
  | 'RESOURCE_OBTAINED'
  | 'SUSPICIOUS_MOVEMENT'
  | 'BETRAYAL_OBSERVED'
  | 'ALLIANCE_FORMED'
  | 'CUSTOM_EVENT';

export type ActionType =
  | 'SEEK_COVER'
  | 'FLEE_AREA'
  | 'OBSERVE_AND_REPORT'
  | 'APPROACH_AND_GREET'
  | 'NEGOTIATE_DEAL'
  | 'TAKE_DEFENSIVE_STANCE'
  | 'RELOCATE_TO_SAFEHOUSE'
  | 'CONTINUE_PATROL'
  | 'REMAIN_PASSIVE';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  priority: number; // 0.0 - 1.0
  completed: boolean;
}

export interface AgentIdentity {
  id: string;
  alias: string;
  archetype: 'OPERATIVE' | 'INFORMANTE' | 'FIXER' | 'CIVILIAN_WITNESS' | 'CUSTOM';
  backgroundBio: string;
  personalityTraits: string[];
  baselineAggression: number;
  baselineCaution: number;
  baselineSociability: number;
}

export interface AgentIndicators {
  alertLevel: number; // 0.0 - 1.0
  familiarity: Record<string, number>;
  trust: Record<string, number>;
}

export interface AgentModel {
  identity: AgentIdentity;
  behavior: BehavioralState;
  execution: ExecutionState;
  indicators: AgentIndicators;
  activeGoals: Goal[];
  position: Vector3;
  currentAction: string;
  recentExperiences: string[];
  lastDecisionExplanation?: DecisionExplanation;
}

export interface EpisodicMemory {
  id: string;
  agentId: string;
  eventType: EventType;
  timestamp: number;
  location: Vector3;
  participants: string[];
  importanceScore: number;
  confidence: number;
  origin: EventOrigin;
  summary: string;
  attributes?: Record<string, string>;
}

export interface CandidateEvaluation {
  actionType: ActionType;
  actionName: string;
  goalAlignmentScore: number;
  memoryBiasScore: number;
  riskDeterrenceScore: number;
  costPenalty: number;
  finalUtilityScore: number;
  evaluationNotes: string;
}

export interface DecisionExplanation {
  agentId: string;
  timestamp: number;
  selectedActionName: string;
  selectedActionType: ActionType;
  finalConfidence: number;
  primaryDecidingFactor: string;
  contextualReasoning: string;
  candidateEvaluations: CandidateEvaluation[];
  memoriesInfluenced: string[];
}

export interface WorldObservationEvent {
  id: string;
  type: EventType;
  timestamp: number;
  position: Vector3;
  sourceEntityId: string;
  observedParticipants: string[];
  origin: EventOrigin;
  confidence: number;
  severity: number;
  description: string;
  isSimulatedTestData: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  category: 'INITIALIZATION' | 'COMPATIBILITY' | 'EVENT' | 'DECISION' | 'PERSISTENCE' | 'ERROR' | 'PERFORMANCE';
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  context: string;
}

export interface TestResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  message: string;
  durationMs: number;
}
