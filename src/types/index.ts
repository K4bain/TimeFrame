export interface Capture {
  timestamp: string;
  url: string;
  status: number;
  mimetype: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  websites: string[];
}
