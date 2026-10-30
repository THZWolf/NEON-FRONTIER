export interface NPCMemoryRecord {
  id: string;
  eventType: 'CONVERSATION' | 'PROXIMITY_ENCOUNTER' | 'WORLD_EVENT' | 'TRADE_COMPLETED' | 'SUSPICIOUS_ACTION';
  description: string;
  timestamp: number;
  importance: number; // 0.0 - 1.0
  participants: string[];
}

export class NPCMemoryStore {
  private static readonly STORAGE_KEY = 'neon_frontier_3d_npc_memories_v1';
  public memories: Record<string, NPCMemoryRecord[]> = {};

  constructor() {
    this.loadFromStorage();
  }

  public recordEvent(
    npcId: string,
    eventType: NPCMemoryRecord['eventType'],
    description: string,
    importance = 0.5,
    participants: string[] = ['player']
  ): NPCMemoryRecord {
    if (!this.memories[npcId]) {
      this.memories[npcId] = [];
    }

    const record: NPCMemoryRecord = {
      id: `mem_${npcId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventType,
      description,
      timestamp: Date.now(),
      importance,
      participants,
    };

    this.memories[npcId].unshift(record);
    if (this.memories[npcId].length > 50) {
      this.memories[npcId].pop();
    }

    this.saveToStorage();
    return record;
  }

  public getMemoriesFor(npcId: string): NPCMemoryRecord[] {
    return this.memories[npcId] || [];
  }

  public countInteractions(npcId: string): number {
    return (this.memories[npcId] || []).filter((m) => m.eventType === 'CONVERSATION').length;
  }

  public saveToStorage() {
    try {
      localStorage.setItem(NPCMemoryStore.STORAGE_KEY, JSON.stringify(this.memories));
    } catch {
      // storage limit or private mode safe
    }
  }

  public loadFromStorage() {
    try {
      const raw = localStorage.getItem(NPCMemoryStore.STORAGE_KEY);
      if (raw) {
        this.memories = JSON.parse(raw);
      }
    } catch {
      this.memories = {};
    }
  }

  public clearAll() {
    this.memories = {};
    localStorage.removeItem(NPCMemoryStore.STORAGE_KEY);
  }
}

export const npcMemoryStore = new NPCMemoryStore();
