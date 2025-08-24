import 'express';

declare module 'express' {
  export interface Request extends Express.Request {
    userId?: string; // userId added by middleware
    auth?: {
      userId: string;
      sessionId: string;
      getToken: (options?: { template?: string }) => Promise<string | null>;
    };
  }

  export interface Response extends Express.Response {
    
  }
}
