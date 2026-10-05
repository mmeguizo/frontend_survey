export interface Survey {
  id: number;
  ticketId: string;
  clientType: string;
  date: string;
  sex: string;
  age: number;
  regionOfResidence: string;
  serviceTalisay: boolean;
  serviceExternal: boolean;
  cc1Awareness?: number;
  cc2Visibility?: number;
  cc3Helpfulness?: number;
  sqd0?: number;
  sqd1?: number;
  sqd2?: number;
  sqd3?: number;
  sqd4?: number;
  sqd5?: number;
  sqd6?: number;
  sqd7?: number;
  sqd8?: number;
  suggestions?: string;
  emailAddress?: string;
  createdAt: string;
  updatedAt: string;
}

// Additional interfaces from backend DTOs
export interface CreateSurveyDto {
  ticketId?: string;
  clientType: 'CITIZEN' | 'BUSINESS' | 'GOVERNMENT';
  date: string;
  sex: 'MALE' | 'FEMALE';
  age: number;
  regionOfResidence: string;
  serviceTalisay?: boolean;
  serviceExternal?: boolean;
  cc1Awareness?: number;
  cc2Visibility?: number;
  cc3Helpfulness?: number;
  sqd0?: number;
  sqd1?: number;
  sqd2?: number;
  sqd3?: number;
  sqd4?: number;
  sqd5?: number;
  sqd6?: number;
  sqd7?: number;
  sqd8?: number;
  suggestions?: string;
  emailAddress?: string;
}

// Response structures
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SurveyAnalytics {
  totalSurveys: number;
  averageSqd: number;
  clientTypeDistribution: { clientType: string; count: number }[];
  sqdAveragesPerQuestion: Record<string, number>;
}

// Authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}