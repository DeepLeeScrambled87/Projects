export interface Category {
  id: number;
  name: string;
}

export interface Auth {
  id: number;
  name: string;
}

export interface ReliabilityStats {
  id: number;
  uptime: number | null;
  latency: number | null;
  lastChecked: string | null;
}

export interface Api {
  id: number;
  name: string;
  description: string | null;
  link: string;
  https: boolean;
  cors: string | null;
  categories: Category[];
  authMethods: Auth[];
  reliabilityStats: ReliabilityStats | null;
  lastFetched: string;
}

export interface SearchResponse {
  data: Api[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FacetsResponse {
  categories: string[];
  authMethods: string[];
  cors: string[];
}
