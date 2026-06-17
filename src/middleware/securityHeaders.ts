import { Request, Response, NextFunction } from 'express';

/**
 * Express middleware to attach hardened security headers for WCAG and OWASP compliance.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // MITM protection (HSTS) - 1 year policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Cross-Site Scripting protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent framing of panels for Clickjacking defense
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Restrict referrer leakages
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Minimal Content Security Policy (allows required connections for production fallback)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.google-analytics.com;"
  );

  next();
}
