export interface Profile {
  /** UUID Primary Key */
  id: string;
  
  /** Unique username */
  username: string;
  
  /** DJ Name (Display Name) */
  djName: string;

  /** Full Name */
  fullName?: string;
  
  /** Unique email */
  email: string;
  
  /** Nacionalidad */
  nationality?: string;
  
  /** URL de Foto de Perfil */
  fotoUrl?: string;

  /** Software principal (Rekordbox, Serato, etc.) */
  primarySoftware?: string;
}
