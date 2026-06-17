import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    timestamps: number[];
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 100;    // max requests per window

/**
 * Custom memory-efficient sliding-window rate limiter.
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const now = Date.now();

  if (!store[ip]) {
    store[ip] = { timestamps: [now] };
    return next();
  }

  // Remove timestamps outside of sliding window
  store[ip].timestamps = store[ip].timestamps.filter(ts => now - ts < WINDOW_MS);

  if (store[ip].timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many queries generated. Please wait and throttle your carbon requests.'
    });
  }

  store[ip].timestamps.push(now);
  next();
}
