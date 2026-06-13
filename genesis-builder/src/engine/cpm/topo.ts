import type { Activity, Relationship } from '../../core/model/types';

export function topologicalSort(activities: Activity[], relationships: Relationship[]): { sorted: string[], error?: { kind: string, codes: string[] } } {
  const inDegree: Record<string, number> = {};
  const adj: Record<string, string[]> = {};
  const codeMap: Record<string, string> = {};

  activities.forEach(a => {
    inDegree[a.id] = 0;
    adj[a.id] = [];
    codeMap[a.id] = a.code;
  });

  relationships.forEach(r => {
    if (inDegree[r.succId] !== undefined) {
      inDegree[r.succId] = (inDegree[r.succId] || 0) + 1;
      if (!adj[r.predId]) adj[r.predId] = [];
      adj[r.predId]!.push(r.succId);
    }
  });

  const queue: string[] = [];
  Object.keys(inDegree).forEach(id => {
    if (inDegree[id] === 0) queue.push(id);
  });

  const sorted: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    sorted.push(u);
    for (const v of adj[u] || []) {
      inDegree[v] = (inDegree[v] || 0) - 1;
      if (inDegree[v] === 0) queue.push(v);
    }
  }

  if (sorted.length !== activities.length) {
    const cycleNodes = Object.keys(inDegree).filter(id => (inDegree[id] || 0) > 0);
    return { sorted, error: { kind: 'cycle', codes: cycleNodes.map(id => codeMap[id]!) } };
  }

  return { sorted };
}
