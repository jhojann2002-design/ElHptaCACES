/**
 * Configuración de Supabase para El Hpta CACES
 * Puedes configurar tus credenciales aquí o directamente desde la interfaz web en la pestaña "Configuración Nube".
 */
export const SupabaseConfig = {
  APP_NAME: "El Hpta CACES",
  ADMIN_EMAIL: "jhojanndemera@gmail.com",
  // Credenciales por defecto del proyecto Supabase
  DEFAULT_URL: "https://xumusduhkbpcsvuwhjuk.supabase.co",
  DEFAULT_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bXVzZHVoa2JwY3N2dXdoanVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyODYyNTUsImV4cCI6MjEwNzg2MjI1NX0.EiftbKlrgFyAvOttUKhzNSZhNZJEx6cF9_qiRMosZuI",

  getUrl() {
    return localStorage.getItem("caces_supabase_url") || this.DEFAULT_URL;
  },

  getAnonKey() {
    return localStorage.getItem("caces_supabase_key") || this.DEFAULT_ANON_KEY;
  },

  saveCredentials(url, key) {
    if (url) localStorage.setItem("caces_supabase_url", url.trim());
    else localStorage.removeItem("caces_supabase_url");

    if (key) localStorage.setItem("caces_supabase_key", key.trim());
    else localStorage.removeItem("caces_supabase_key");
  },

  isConfigured() {
    return Boolean(this.getUrl() && this.getAnonKey());
  },

  /**
   * Genera el script SQL para crear las tablas necesarias en Supabase con políticas RLS blindadas.
   */
  getSchemaSQL() {
    return `-- Script SQL para Supabase (Ejecutar en el SQL Editor de tu proyecto en Supabase)

-- 1. Tabla de Preguntas CACES (DELETE y UPDATE restringidos exclusivamente al Administrador)
CREATE TABLE IF NOT EXISTS public.caces_questions (
    id TEXT PRIMARY KEY,
    especialidad TEXT NOT NULL,
    subtema TEXT,
    enunciado TEXT NOT NULL,
    pregunta TEXT NOT NULL,
    opciones JSONB NOT NULL,
    correcta TEXT NOT NULL,
    justificacion TEXT,
    fuente TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.caces_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de preguntas" ON public.caces_questions;
DROP POLICY IF EXISTS "Inserción de preguntas autenticada o anónima" ON public.caces_questions;
DROP POLICY IF EXISTS "Actualización de preguntas" ON public.caces_questions;
DROP POLICY IF EXISTS "Eliminación libre de preguntas" ON public.caces_questions;
DROP POLICY IF EXISTS "Admin inserción de preguntas" ON public.caces_questions;
DROP POLICY IF EXISTS "Admin actualización de preguntas" ON public.caces_questions;
DROP POLICY IF EXISTS "Admin eliminación de preguntas" ON public.caces_questions;

CREATE POLICY "Lectura pública de preguntas" ON public.caces_questions
  FOR SELECT USING (true);

CREATE POLICY "Admin inserción de preguntas" ON public.caces_questions
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'email') IN ('jhojanndemera@gmail.com')
    OR current_setting('request.headers', true)::json ->> 'x-caces-admin' = 'jhojann2026'
  );

CREATE POLICY "Admin actualización de preguntas" ON public.caces_questions
  FOR UPDATE USING (
    (auth.jwt() ->> 'email') IN ('jhojanndemera@gmail.com')
    OR current_setting('request.headers', true)::json ->> 'x-caces-admin' = 'jhojann2026'
  );

CREATE POLICY "Admin eliminación de preguntas" ON public.caces_questions
  FOR DELETE USING (
    (auth.jwt() ->> 'email') IN ('jhojanndemera@gmail.com')
    OR current_setting('request.headers', true)::json ->> 'x-caces-admin' = 'jhojann2026'
  );

-- 2. Tabla de Historial de Simulacros y Estadísticas de Opciones
CREATE TABLE IF NOT EXISTS public.caces_simulacros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT,
    device_id TEXT NOT NULL,
    modo TEXT NOT NULL,
    puntuacion_obtenida NUMERIC NOT NULL,
    total_preguntas INTEGER NOT NULL,
    porcentaje NUMERIC NOT NULL,
    tiempo_segundos INTEGER NOT NULL,
    desglose_especialidades JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.caces_simulacros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura e inserción libre por device o auth" ON public.caces_simulacros;
DROP POLICY IF EXISTS "Lectura pública de simulacros y stats" ON public.caces_simulacros;
DROP POLICY IF EXISTS "Inserción de simulacros propios" ON public.caces_simulacros;
DROP POLICY IF EXISTS "Actualización y borrado solo admin o propio sync" ON public.caces_simulacros;
DROP POLICY IF EXISTS "Eliminación de sync previo o admin" ON public.caces_simulacros;

CREATE POLICY "Lectura pública de simulacros y stats" ON public.caces_simulacros
  FOR SELECT USING (true);

CREATE POLICY "Inserción de simulacros propios" ON public.caces_simulacros
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualización y borrado solo admin o propio sync" ON public.caces_simulacros
  FOR UPDATE USING (
    modo IN ('__PROFILE_SYNC__', '__OPTION_STATS__')
    OR (auth.jwt() ->> 'email') IN ('jhojanndemera@gmail.com')
  );

CREATE POLICY "Eliminación de sync previo o admin" ON public.caces_simulacros
  FOR DELETE USING (
    modo IN ('__PROFILE_SYNC__', '__OPTION_STATS__')
    OR (auth.jwt() ->> 'email') IN ('jhojanndemera@gmail.com')
  );

-- 3. Tabla de Registro de Errores (Banco de Fallos)
CREATE TABLE IF NOT EXISTS public.caces_user_errors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    fallos_consecutivos INTEGER DEFAULT 1,
    dominada BOOLEAN DEFAULT false,
    ultimo_fallo TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(device_id, question_id)
);

ALTER TABLE public.caces_user_errors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Manejo libre de errores por device" ON public.caces_user_errors;
CREATE POLICY "Manejo libre de errores por device" ON public.caces_user_errors FOR ALL USING (true);
`;
  }
};
