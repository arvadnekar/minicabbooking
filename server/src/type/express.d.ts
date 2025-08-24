// import 'express';

// declare module 'express' {
//   export interface Request {
//     userId?: string; // userId added by middleware
//   }
// }


import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string; // userId added by middleware
  }
  // Do NOT redeclare Response unless you are adding custom properties!
}