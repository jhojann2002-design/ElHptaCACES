import { SupabaseConfig } from './supabase-config.js';

/**
 * Genera una firma clínica única e invariable para cualquier pregunta
 * basándose en su enunciado y opciones normalizadas (sin tildes, signos ni mayúsculas).
 */
export function getQuestionFingerprint(q) {
  if (!q) return '';
  const stem = (q.enunciado || q.statement || q.pregunta || '').toString();
  const normStem = stem
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  let optText = '';
  if (q.opciones) {
    if (Array.isArray(q.opciones)) {
      optText = q.opciones.map(o => (typeof o === 'string' ? o : o.texto || o.text || '')).sort().join('');
    } else if (typeof q.opciones === 'object') {
      optText = Object.values(q.opciones).map(v => (typeof v === 'string' ? v : v.texto || v.text || '')).sort().join('');
    }
  }
  const normOpt = optText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 60);

  return `${normStem.substring(0, 220)}_${normOpt}`;
}

/**
 * Normaliza las opciones de cualquier pregunta al formato estándar Array:
 * [ { id: 'A', texto: '...' }, { id: 'B', texto: '...' }, ... ]
 */
export function normalizeQuestionOptions(q) {
  if (!q) return q;
  const letters = ['A', 'B', 'C', 'D', 'E'];
  let normalized = [];
  const rawOpts = q.opciones || q.options || q.respuestas || q.answers;

  if (Array.isArray(rawOpts)) {
    rawOpts.forEach((item, i) => {
      if (typeof item === 'string') {
        normalized.push({ id: letters[i] || `${i + 1}`, texto: item.trim() });
      } else if (typeof item === 'object' && item !== null) {
        normalized.push({
          id: (item.id || item.letter || letters[i] || `${i + 1}`).toString().trim().toUpperCase(),
          texto: (item.texto || item.text || item.value || item.answer || '').toString().trim()
        });
      }
    });
  } else if (typeof rawOpts === 'object' && rawOpts !== null) {
    Object.keys(rawOpts).forEach(k => {
      const val = rawOpts[k];
      normalized.push({
        id: k.toString().trim().toUpperCase(),
        texto: (typeof val === 'string' ? val : (val?.texto || val?.text || '')).toString().trim()
      });
    });
  }

  normalized = normalized.filter(o => o && o.texto && o.texto.length > 0);
  while (normalized.length < 4) {
    const nextL = letters[normalized.length];
    normalized.push({ id: nextL, texto: `Opción adicional ${nextL}` });
  }

  return {
    ...q,
    opciones: normalized.slice(0, 4)
  };
}

class StorageManager {
  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.supabaseClient = null;
    this.initSupabase();

    if (localStorage.getItem('caces_master_db_v4_pro') !== 'true') {
      localStorage.removeItem('caces_force_empty');
      localStorage.removeItem('caces_custom_questions');
      localStorage.removeItem('caces_questions');
      localStorage.removeItem('custom_questions');
      localStorage.removeItem('imported_questions');
      localStorage.removeItem('banco_caces');
      localStorage.setItem('caces_master_db_v4_pro', 'true');
    }
  }

  getOrCreateDeviceId() {
    let id = localStorage.getItem('caces_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('caces_device_id', id);
    }
    return id;
  }

  initSupabase() {
    if (SupabaseConfig.isConfigured() && window.supabase) {
      try {
        this.supabaseClient = window.supabase.createClient(
          SupabaseConfig.getUrl(),
          SupabaseConfig.getAnonKey()
        );
      } catch (e) {
        console.warn("No se pudo inicializar cliente Supabase:", e);
        this.supabaseClient = null;
      }
    } else {
      this.supabaseClient = null;
    }
  }

  // =========================================================================
  // SISTEMA DE PERFIL DE USUARIO Y SINCRONIZACIÓN DE PROGRESO
  // =========================================================================
  getUserProfile() {
    try {
      const raw = localStorage.getItem('caces_user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async loginOrRegisterUser({ name, email, pin }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim() || cleanEmail.split('@')[0] || 'Médico EHEP';
    const cleanPin = (pin || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Ingresa un correo electrónico válido.');
    }
    if (cleanPin.length < 4) {
      throw new Error('El PIN debe tener al menos 4 caracteres.');
    }

    const userKey = `user_${cleanEmail}_${cleanPin}`;
    const profile = {
      name: cleanName,
      email: cleanEmail,
      userKey,
      updatedAt: new Date().toISOString()
    };

    // Usar el correo como identificador persistente del dispositivo para sincronizar en Supabase
    this.deviceId = `usr_${cleanEmail}`;
    localStorage.setItem('caces_device_id', this.deviceId);
    localStorage.setItem('caces_user_profile', JSON.stringify(profile));

    // Intentar recuperar progreso previo en la nube si existe
    await this.pullUserProgressFromCloud(cleanEmail);
    // Sincronizar estado actual hacia la nube
    await this.syncUserProgressToCloud();

    return profile;
  }

  logoutUser() {
    localStorage.removeItem('caces_user_profile');
  }

  async syncUserProgressToCloud() {
    const profile = this.getUserProfile();
    if (!profile || !this.supabaseClient) return { synced: false };

    const snapshot = {
      xp: parseInt(localStorage.getItem('caces_xp') || '120', 10),
      streak: parseInt(localStorage.getItem('caces_streak') || '1', 10),
      highScoreBlitz: parseInt(localStorage.getItem('caces_blitz_high') || '0', 10),
      errorBank: this.getErrorBank(),
      srsDeck: JSON.parse(localStorage.getItem('caces_srs_deck') || '{}'),
      profileName: profile.name
    };

    try {
      // Guardamos un registro de sincronización en caces_simulacros con modo '__PROFILE_SYNC__'
      // para no requerir tablas adicionales en Supabase
      await this.supabaseClient.from('caces_simulacros').insert({
        user_email: profile.email,
        device_id: this.deviceId,
        modo: '__PROFILE_SYNC__',
        puntuacion_obtenida: snapshot.xp,
        total_preguntas: snapshot.streak,
        porcentaje: snapshot.highScoreBlitz,
        tiempo_segundos: 0,
        desglose_especialidades: snapshot
      });
      return { synced: true };
    } catch (e) {
      console.warn('Error sincronizando perfil en la nube:', e);
      return { synced: false };
    }
  }

  async pullUserProgressFromCloud(email) {
    if (!this.supabaseClient || !email) return false;
    try {
      const { data, error } = await this.supabaseClient
        .from('caces_simulacros')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !data || data.length === 0) return false;

      // 1. Restaurar snapshot de XP, racha y errores más reciente
      const latestSync = data.find(r => r.modo === '__PROFILE_SYNC__' && r.desglose_especialidades);
      if (latestSync && latestSync.desglose_especialidades) {
        const snap = latestSync.desglose_especialidades;
        const localXp = parseInt(localStorage.getItem('caces_xp') || '0', 10);
        if ((snap.xp || 0) > localXp) {
          localStorage.setItem('caces_xp', String(snap.xp));
        }
        if (snap.highScoreBlitz) {
          const localHigh = parseInt(localStorage.getItem('caces_blitz_high') || '0', 10);
          if (snap.highScoreBlitz > localHigh) {
            localStorage.setItem('caces_blitz_high', String(snap.highScoreBlitz));
          }
        }
        if (snap.errorBank && typeof snap.errorBank === 'object') {
          const mergedErrors = { ...snap.errorBank, ...this.getErrorBank() };
          localStorage.setItem('caces_error_bank', JSON.stringify(mergedErrors));
        }
      }

      // 2. Restaurar historial de simulacros reales
      const realExams = data.filter(r => r.modo !== '__PROFILE_SYNC__');
      if (realExams.length > 0 && this.getExamHistory().length === 0) {
        const reconstructed = realExams.map(r => ({
          id: r.id,
          modo: r.modo,
          puntuacion: r.puntuacion_obtenida,
          total: r.total_preguntas,
          porcentaje: r.porcentaje,
          tiempo: r.tiempo_segundos,
          desglose: r.desglose_especialidades || {},
          fecha: r.created_at
        }));
        localStorage.setItem('caces_exam_history', JSON.stringify(reconstructed));
      }
      return true;
    } catch (e) {
      console.warn('No se pudo recuperar respaldo de la nube:', e);
      return false;
    }
  }

  async testSupabaseConnection() {
    if (!this.supabaseClient) {
      this.initSupabase();
    }
    if (!this.supabaseClient) {
      return { success: false, message: "Cliente de Supabase no configurado o credenciales inválidas." };
    }
    try {
      const { error } = await this.supabaseClient.from('caces_questions').select('id').limit(1);
      if (error) {
        return { success: false, message: `Error de consulta en Supabase: ${error.message}` };
      }
      return { success: true, message: "Conexión exitosa a Supabase. Base de datos sincronizada." };
    } catch (e) {
      return { success: false, message: `Excepción de red: ${e.message}` };
    }
  }

  deduplicateQuestions(questionsList) {
    if (!Array.isArray(questionsList)) return [];
    const map = new Map();

    questionsList.forEach(q => {
      if (!q) return;
      const fp = getQuestionFingerprint(q);
      const key = fp || q.id;
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, q);
      } else {
        const existing = map.get(key);
        const existingScore = (existing.justificacion?.length || 0) + (existing.subtema ? 10 : 0);
        const newScore = (q.justificacion?.length || 0) + (q.subtema ? 10 : 0);
        if (newScore > existingScore) {
          map.set(key, { ...existing, ...q });
        }
      }
    });

    return Array.from(map.values());
  }

  async getAllQuestions() {
    if (localStorage.getItem('caces_force_empty') === 'true') {
      return [];
    }

    let baseQuestions = [];
    try {
      const resp = await fetch(`data/banco_inicial.json?nocache=${Date.now()}`, { cache: 'no-store' });
      if (resp.ok) {
        baseQuestions = await resp.json();
      }
    } catch (e) {
      console.warn("No se pudo cargar data/banco_inicial.json:", e);
    }

    let localCustom = [];
    try {
      const stored = localStorage.getItem('caces_custom_questions');
      if (stored) {
        localCustom = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error leyendo caces_custom_questions:", e);
    }

    let cloudQuestions = [];
    if (this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient
          .from('caces_questions')
          .select('*');
        if (!error && data) {
          cloudQuestions = data;
        }
      } catch (e) {
        console.warn("Error consultando Supabase:", e);
      }
    }

    const combined = [...baseQuestions, ...localCustom, ...cloudQuestions];
    const unique = this.deduplicateQuestions(combined);

    if (localCustom.length > 0) {
      const cleanCustom = this.deduplicateQuestions(localCustom);
      if (cleanCustom.length !== localCustom.length) {
        localStorage.setItem('caces_custom_questions', JSON.stringify(cleanCustom));
      }
    }

    return unique.map(q => normalizeQuestionOptions(q));
  }

  async saveCustomQuestions(newQuestions) {
    if (!Array.isArray(newQuestions) || newQuestions.length === 0) {
      return { added: 0, duplicatesSkipped: 0, total: 0 };
    }

    let existing = [];
    try {
      const stored = localStorage.getItem('caces_custom_questions');
      if (stored) existing = JSON.parse(stored);
    } catch (e) {}

    existing = this.deduplicateQuestions(existing);

    const existingFpMap = new Map();
    existing.forEach(q => {
      const fp = getQuestionFingerprint(q) || q.id;
      if (fp) existingFpMap.set(fp, q);
    });

    const trulyNew = [];
    let duplicatesSkipped = 0;

    newQuestions.forEach(q => {
      const fp = getQuestionFingerprint(q) || q.id;
      if (!fp) return;

      if (!existingFpMap.has(fp)) {
        existingFpMap.set(fp, q);
        trulyNew.push(q);
      } else {
        const oldQ = existingFpMap.get(fp);
        if (oldQ) {
          Object.assign(oldQ, q);
        }
        duplicatesSkipped++;
      }
    });

    const updated = trulyNew.length > 0 ? [...existing, ...trulyNew] : existing;
    localStorage.setItem('caces_custom_questions', JSON.stringify(updated));
    localStorage.removeItem('caces_force_empty');

    if (trulyNew.length > 0 && this.supabaseClient) {
      try {
        const chunkSize = 100;
        for (let i = 0; i < trulyNew.length; i += chunkSize) {
          const slice = trulyNew.slice(i, i + chunkSize);
          await this.supabaseClient
            .from('caces_questions')
            .upsert(slice, { onConflict: 'id' });
        }
      } catch (e) {
        console.error("Excepción al subir a Supabase en lotes:", e);
      }
    }

    return {
      added: trulyNew.length,
      duplicatesSkipped: duplicatesSkipped,
      total: existing.length + trulyNew.length
    };
  }

  async cleanDuplicates() {
    let existing = [];
    try {
      const stored = localStorage.getItem('caces_custom_questions');
      if (stored) existing = JSON.parse(stored);
    } catch (e) {}

    const beforeCount = existing.length;
    const cleanList = this.deduplicateQuestions(existing);
    const removedCount = beforeCount - cleanList.length;

    localStorage.setItem('caces_custom_questions', JSON.stringify(cleanList));
    return {
      before: beforeCount,
      after: cleanList.length,
      removed: removedCount
    };
  }

  async saveExamResult(result) {
    result.id = 'sim_' + Date.now();
    result.fecha = new Date().toISOString();
    result.deviceId = this.deviceId;

    const profile = this.getUserProfile();

    let history = this.getExamHistory();
    history.unshift(result);
    if (history.length > 100) history = history.slice(0, 100);
    localStorage.setItem('caces_exam_history', JSON.stringify(history));

    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from('caces_simulacros').insert({
          user_email: profile ? profile.email : null,
          device_id: this.deviceId,
          modo: result.modo || 'Simulacro CACES',
          puntuacion_obtenida: result.puntuacion,
          total_preguntas: result.total,
          porcentaje: result.porcentaje,
          tiempo_segundos: result.tiempo,
          desglose_especialidades: result.desglose || {}
        });
      } catch (e) {
        console.warn("No se pudo guardar historial en Supabase:", e);
      }
    }

    await this.syncUserProgressToCloud();
    return result;
  }

  getExamHistory() {
    try {
      const data = localStorage.getItem('caces_exam_history');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  registerAnswer(questionId, isCorrect) {
    let errors = this.getErrorBank();
    if (!isCorrect) {
      if (!errors[questionId]) {
        errors[questionId] = { fallos: 1, aciertos_seguidos: 0, ultimo_fallo: Date.now(), dominada: false };
      } else {
        errors[questionId].fallos += 1;
        errors[questionId].aciertos_seguidos = 0;
        errors[questionId].ultimo_fallo = Date.now();
        errors[questionId].dominada = false;
      }
    } else {
      if (errors[questionId]) {
        errors[questionId].aciertos_seguidos = (errors[questionId].aciertos_seguidos || 0) + 1;
        if (errors[questionId].aciertos_seguidos >= 2) {
          errors[questionId].dominada = true;
        }
      }
    }
    localStorage.setItem('caces_error_bank', JSON.stringify(errors));
  }

  markErrorMastered(questionId) {
    let errors = this.getErrorBank();
    if (errors[questionId]) {
      errors[questionId].dominada = true;
      errors[questionId].aciertos_seguidos = 2;
      localStorage.setItem('caces_error_bank', JSON.stringify(errors));
    }
  }

  removeError(questionId) {
    let errors = this.getErrorBank();
    if (errors[questionId]) {
      delete errors[questionId];
      localStorage.setItem('caces_error_bank', JSON.stringify(errors));
    }
  }

  clearErrors() {
    localStorage.removeItem('caces_error_bank');
  }

  async clearDatabase() {
    localStorage.removeItem('caces_custom_questions');
    localStorage.removeItem('caces_questions');
    localStorage.removeItem('custom_questions');
    localStorage.removeItem('imported_questions');
    localStorage.removeItem('banco_caces');
    localStorage.removeItem('questions');
    localStorage.setItem('caces_force_empty', 'true');

    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from('caces_questions').delete().neq('id', '___force_clear___');
      } catch (e) {
        console.warn("Error borrando preguntas de Supabase:", e);
      }
    }
  }

  async resetAll() {
    localStorage.removeItem('caces_custom_questions');
    localStorage.removeItem('caces_questions');
    localStorage.removeItem('custom_questions');
    localStorage.removeItem('imported_questions');
    localStorage.removeItem('banco_caces');
    localStorage.removeItem('questions');
    localStorage.removeItem('caces_exam_history');
    localStorage.removeItem('caces_error_bank');
    localStorage.removeItem('caces_bookmarks');
    localStorage.setItem('caces_force_empty', 'true');

    if (this.supabaseClient) {
      try {
        await this.supabaseClient.from('caces_questions').delete().neq('id', '___force_clear___');
      } catch (e) {
        console.warn("Error borrando de Supabase:", e);
      }
    }
  }

  getErrorBank() {
    try {
      const data = localStorage.getItem('caces_error_bank');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  toggleBookmark(questionId) {
    let bookmarks = this.getBookmarks();
    if (bookmarks.includes(questionId)) {
      bookmarks = bookmarks.filter(id => id !== questionId);
    } else {
      bookmarks.push(questionId);
    }
    localStorage.setItem('caces_bookmarks', JSON.stringify(bookmarks));
    return bookmarks.includes(questionId);
  }

  isBookmarked(questionId) {
    return this.getBookmarks().includes(questionId);
  }

  getBookmarks() {
    try {
      const data = localStorage.getItem('caces_bookmarks');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
}

export const Storage = new StorageManager();