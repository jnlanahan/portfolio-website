import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Environment-aware path utilities for Railway deployment
 */

export function getWorkingDir(): string {
  // Try multiple methods to get the working directory
  // This ensures compatibility across different deployment environments
  
  try {
    // Method 1: Standard process.cwd()
    const cwd = process.cwd();
    if (cwd && typeof cwd === 'string') {
      return cwd;
    }
  } catch (e) {
    console.warn('process.cwd() failed:', e);
  }

  try {
    // Method 2: Environment variables
    const envPwd = process.env.PWD || process.env.INIT_CWD;
    if (envPwd && typeof envPwd === 'string') {
      return envPwd;
    }
  } catch (e) {
    console.warn('Environment PWD failed:', e);
  }

  try {
    // Method 3: Import meta URL for ES modules
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      const currentFile = fileURLToPath(import.meta.url);
      return path.dirname(path.dirname(currentFile)); // Go up from server/utils to project root
    }
  } catch (e) {
    console.warn('import.meta.url failed:', e);
  }

  // Method 4: Railway-specific fallback
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log('Detected Railway environment, using /app as working directory');
    return '/app';
  }

  // Method 5: Last resort fallbacks
  const fallbacks = ['/app', '.', __dirname];
  for (const fallback of fallbacks) {
    if (fallback && typeof fallback === 'string') {
      console.warn(`Using fallback working directory: ${fallback}`);
      return fallback;
    }
  }

  throw new Error('Unable to determine working directory');
}

export function safePath(...paths: (string | undefined)[]): string {
  try {
    const workingDir = getWorkingDir();
    const validPaths = paths.filter((p): p is string => typeof p === 'string' && p.length > 0);
    
    if (validPaths.length === 0) {
      return workingDir;
    }
    
    return path.resolve(workingDir, ...validPaths);
  } catch (error) {
    console.error('Path resolution failed:', error);
    console.error('Attempted paths:', paths);
    throw error;
  }
}

export function safeJoin(...paths: (string | undefined)[]): string {
  try {
    const validPaths = paths.filter((p): p is string => typeof p === 'string' && p.length > 0);
    
    if (validPaths.length === 0) {
      return '.';
    }
    
    return path.join(...validPaths);
  } catch (error) {
    console.error('Path join failed:', error);
    console.error('Attempted paths:', paths);
    throw error;
  }
}

// Environment detection utilities
export function isRailwayEnvironment(): boolean {
  return !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
}

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Debug utility
export function debugPaths(): void {
  console.log('=== PATH DEBUG INFO ===');
  console.log('process.cwd():', process.cwd?.());
  console.log('process.env.PWD:', process.env.PWD);
  console.log('process.env.INIT_CWD:', process.env.INIT_CWD);
  console.log('__dirname:', typeof __dirname !== 'undefined' ? __dirname : 'undefined');
  console.log('import.meta.url:', typeof import.meta !== 'undefined' ? import.meta.url : 'undefined');
  console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Detected working dir:', getWorkingDir());
  console.log('======================');
}