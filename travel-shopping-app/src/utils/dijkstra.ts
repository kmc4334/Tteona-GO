// ─────────────────────────────────────────────────────────────────────────────
// dijkstra.ts  –  순수 TypeScript 다익스트라 최단경로 탐색
// ─────────────────────────────────────────────────────────────────────────────

export interface GeoNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
}

export interface GeoEdge {
  from: string; // node id
  to: string;   // node id
  weight: number; // meters
}

export interface PathResult {
  path: GeoNode[];
  totalDistance: number; // meters
  segments: { from: GeoNode; to: GeoNode; distance: number }[];
}

// ── Haversine 거리 공식 (m) ─────────────────────────────────────────────────
export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // 지구 반지름 (m)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── 노드 목록으로 완전 그래프(에지) 자동 생성 ──────────────────────────────
export function buildFullGraph(nodes: GeoNode[]): GeoEdge[] {
  const edges: GeoEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = haversineMeters(
        nodes[i].lat, nodes[i].lng,
        nodes[j].lat, nodes[j].lng,
      );
      edges.push({ from: nodes[i].id, to: nodes[j].id, weight: dist });
      edges.push({ from: nodes[j].id, to: nodes[i].id, weight: dist });
    }
  }
  return edges;
}

// ── 단순 최소 힙 (Priority Queue) ───────────────────────────────────────────
interface HeapItem { id: string; dist: number }

class MinHeap {
  private data: HeapItem[] = [];

  push(item: HeapItem) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop(): HeapItem | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.data.length; }

  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent].dist <= this.data[i].dist) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private _sinkDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l].dist < this.data[smallest].dist) smallest = l;
      if (r < n && this.data[r].dist < this.data[smallest].dist) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

// ── 다익스트라 알고리즘 ─────────────────────────────────────────────────────
export function dijkstra(
  nodes: GeoNode[],
  edges: GeoEdge[],
  startId: string,
  endId: string,
): PathResult | null {
  const nodeMap = new Map<string, GeoNode>(nodes.map(n => [n.id, n]));

  // 인접 리스트 구축
  const adj = new Map<string, { to: string; weight: number }[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.from)?.push({ to: e.to, weight: e.weight });

  // 초기화
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  for (const n of nodes) { dist.set(n.id, Infinity); prev.set(n.id, null); }
  dist.set(startId, 0);

  const heap = new MinHeap();
  heap.push({ id: startId, dist: 0 });

  while (heap.size > 0) {
    const { id: u, dist: uDist } = heap.pop()!;
    if (uDist > (dist.get(u) ?? Infinity)) continue; // 오래된 항목 스킵
    if (u === endId) break;

    for (const { to, weight } of adj.get(u) ?? []) {
      const alt = (dist.get(u) ?? Infinity) + weight;
      if (alt < (dist.get(to) ?? Infinity)) {
        dist.set(to, alt);
        prev.set(to, u);
        heap.push({ id: to, dist: alt });
      }
    }
  }

  // 경로 복원
  if ((dist.get(endId) ?? Infinity) === Infinity) return null; // 경로 없음

  const path: GeoNode[] = [];
  let cur: string | null = endId;
  while (cur !== null) {
    const node = nodeMap.get(cur);
    if (node) path.unshift(node);
    cur = prev.get(cur) ?? null;
  }

  const segments = path.slice(0, -1).map((from, i) => ({
    from,
    to: path[i + 1],
    distance: haversineMeters(from.lat, from.lng, path[i + 1].lat, path[i + 1].lng),
  }));

  return {
    path,
    totalDistance: dist.get(endId) ?? 0,
    segments,
  };
}

// ── 다중 경유지 (Waypoint) 최단경로 ────────────────────────────────────────
// 순서가 고정된 경유지를 순차적으로 다익스트라 연결
export function dijkstraMultiStop(
  nodes: GeoNode[],
  edges: GeoEdge[],
  stopIds: string[],
): PathResult | null {
  if (stopIds.length < 2) return null;

  let fullPath: GeoNode[] = [];
  let totalDist = 0;
  const allSegments: { from: GeoNode; to: GeoNode; distance: number }[] = [];

  for (let i = 0; i < stopIds.length - 1; i++) {
    const result = dijkstra(nodes, edges, stopIds[i], stopIds[i + 1]);
    if (!result) return null;

    const seg = i === 0 ? result.path : result.path.slice(1);
    fullPath = [...fullPath, ...seg];
    totalDist += result.totalDistance;
    allSegments.push(...result.segments);
  }

  return { path: fullPath, totalDistance: totalDist, segments: allSegments };
}

// ── 거리 포맷 헬퍼 ──────────────────────────────────────────────────────────
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function estimateWalkTime(meters: number): string {
  const minutes = Math.round(meters / 80); // 도보 약 80m/min
  if (minutes < 60) return `도보 약 ${minutes}분`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return `도보 약 ${h}시간 ${m > 0 ? m + '분' : ''}`;
}

export function estimateDriveTime(meters: number): string {
  const minutes = Math.round(meters / 500); // 차량 약 30km/h
  if (minutes < 60) return `차량 약 ${Math.max(1, minutes)}분`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return `차량 약 ${h}시간 ${m > 0 ? m + '분' : ''}`;
}
