import 'express';

declare module 'express' {
  export interface Request {
    // userId?: string; // userId added by middleware
    auth?: {
      userId: string;
      sessionId: string;
      getToken: (options?: { template?: string }) => Promise<string | null>;
    };
  }

}
