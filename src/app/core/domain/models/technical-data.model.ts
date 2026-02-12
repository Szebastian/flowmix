export interface TechnicalData {
  /** Foreign Key to Profile.id */
  userId: string;
  
  /** Familia de Sistema Operativo (Windows, macOS, Linux) */
  osFamily: string;
  
  /** Versión del SO (11, Sonoma, etc.) */
  osVersion: string;
  
  /** Arquitectura (x64, ARM64, Apple Silicon) */
  architecture: string;
  
  /** Formatos de audio utilizados (mp3, wav, flac, etc.) */
  audioFormats?: string[];
}
