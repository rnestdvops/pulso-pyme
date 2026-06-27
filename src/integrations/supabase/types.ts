// Tipo Json minimal para JSONB de Supabase.
// Si necesitamos types completos, generar con: npx supabase gen types typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
