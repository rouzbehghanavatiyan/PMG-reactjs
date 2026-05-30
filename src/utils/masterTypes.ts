export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  employeeId: string;
  joinDate: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  url?: string;
  category: 'Contract' | 'Policy' | 'Form' | 'Other';
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  date: string;
  imageUrl: string;
  category: string;
}

export interface SalaryData {
  month: string;
  base: number;
  bonus: number;
  deductions: number;
  total: number;
}
