/**
 * Threat Intelligence API Integrations
 * This file exports all available API integrations
 */

export * from './virustotal';
export * from './abuseipdb';

/**
 * Template for adding a new integration:
 * 
 * 1. Create a new file: lib/integrations/[platform-name].ts
 * 2. Implement the API check functions
 * 3. Export them from this index file
 * 4. Update lib/threat-checker.ts to use the new functions
 * 5. Add API key to .env.local
 */

/**
 * Add more integrations here as needed:
 * - GreyNoise
 * - Shodan
 * - IPinfo
 * - Pulsedive
 * - URLScan
 * - SecurityTrails
 */
