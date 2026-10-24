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

const ACTIVE_SESSION_STORAGE_KEY = 'caces_active_session_v1';

class StorageManager {
  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.supabaseClient = null;
    this._syncDebounceTimer = null;
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

  /**
   * Programa una sincronización en segundo plano sin bloquear la interfaz
   */
  scheduleAutoCloudSync(delayMs = 2500) {
    try {
      if (this._syncDebounceTimer) {
        clearTimeout(this._syncDebounceTimer);
      }
      this._syncDebounceTimer = setTimeout(() => {
        this.syncUserProgressToCloud().catch(err => {
          console.warn("Auto-sync en segundo plano omitido:", err);
        });
      }, delayMs);
    } catch (e) {
      console.warn("Error al programar auto-sync:", e);
    }
  }

  // =========================================================================
  // PERSISTENCIA DE SESIÓN ACTIVA INDEPENDIENTE (SIMULADOR vs MODO ESTUDIO)
  // =========================================================================
  getSessionKeyForSlot(slot = 'simulacro') {
    return slot === 'estudio'
      ? 'caces_active_session_estudio_v1'
      : 'caces_active_session_simulacro_v1';
  }

  saveActiveSession(sessionData, explicitSlot = null) {
    try {
      if (!sessionData) return;
      const slot = explicitSlot || (sessionData.mode === 'caces' ? 'simulacro' : 'estudio');
      const payload = JSON.stringify({
        ...sessionData,
        slot,
        savedAt: Date.now()
      });
      localStorage.setItem(this.getSessionKeyForSlot(slot), payload);
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, payload);
      localStorage.setItem('caces_last_active_slot', slot);
    } catch (e) {
      console.warn("No se pudo guardar la sesión activa:", e);
    }
  }

  getActiveSession(explicitSlot = null) {
    try {
      if (explicitSlot) {
        const rawSlot = localStorage.getItem(this.getSessionKeyForSlot(explicitSlot));
        if (rawSlot) {
          const parsedSlot = JSON.parse(rawSlot);
          if (parsedSlot && Array.isArray(parsedSlot.sessionQuestions) && parsedSlot.sessionQuestions.length > 0) {
            return parsedSlot;
          }
        }
        // Compatibilidad con sesión previa única si coincide con el modo
        const rawLegacy = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
        if (rawLegacy) {
          const parsedLegacy = JSON.parse(rawLegacy);
          const legacySlot = parsedLegacy?.mode === 'caces' ? 'simulacro' : 'estudio';
          if (legacySlot === explicitSlot && Array.isArray(parsedLegacy?.sessionQuestions) && parsedLegacy.sessionQuestions.length > 0) {
            return parsedLegacy;
          }
        }
        return null;
      }

      const lastSlot = localStorage.getItem('caces_last_active_slot');
      if (lastSlot) {
        const byLast = this.getActiveSession(lastSlot);
        if (byLast) return byLast;
      }

      const simSession = this.getActiveSession('simulacro');
      if (simSession) return simSession;

      const estSession = this.getActiveSession('estudio');
      if (estSession) return estSession;

      const raw = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.sessionQuestions) || parsed.sessionQuestions.length === 0) {
        return null;
      }
      return parsed;
    } catch (e) {
      console.warn("Error leyendo sesión activa:", e);
      return null;
    }
  }

  clearActiveSession(explicitSlot = null) {
    try {
      if (explicitSlot === 'simulacro' || explicitSlot === 'estudio') {
        localStorage.removeItem(this.getSessionKeyForSlot(explicitSlot));
        const rawLegacy = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
        if (rawLegacy) {
          const parsed = JSON.parse(rawLegacy);
          const legacySlot = parsed?.mode === 'caces' ? 'simulacro' : 'estudio';
          if (legacySlot === explicitSlot) {
            localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
          }
        }
        return;
      }
      localStorage.removeItem('caces_active_session_simulacro_v1');
      localStorage.removeItem('caces_active_session_estudio_v1');
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn("Error limpiando sesión activa:", e);
    }
  }

  // =========================================================================
  // SISTEMA DE PERFIL DE USUARIO, ACCESO CON GOOGLE ("EL HPTA CACES") Y RANKEDS
  // =========================================================================
  getUserProfile() {
    try {
      const raw = localStorage.getItem('caces_user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getSavedGoogleAccounts() {
    try {
      const raw = localStorage.getItem('caces_google_accounts');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveKnownGoogleAccount(account) {
    if (!account || !account.email) return;
    try {
      const list = this.getSavedGoogleAccounts().filter(a => a.email !== account.email);
      list.unshift({
        name: account.name,
        email: account.email,
        avatar: account.avatar
      });
      localStorage.setItem('caces_google_accounts', JSON.stringify(list.slice(0, 5)));
    } catch (e) {}
  }

  getRankTitleForXP(xp = 0) {
    if (xp >= 15000) return 'Leyenda del Hpta CACES';
    if (xp >= 8000) return 'Jefe de Guardia MSP';
    if (xp >= 3500) return 'Residente R1 de Choque';
    if (xp >= 1000) return 'Interno Rotativo';
    return 'Externo de Guardia';
  }

  getTutorStats() {
    try {
      const raw = localStorage.getItem('caces_tutor_stats');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          totalAnswered: Number(parsed.totalAnswered || 0),
          totalCorrect: Number(parsed.totalCorrect || 0),
          bySpecialty: parsed.bySpecialty || {}
        };
      }
    } catch (e) {}
    return { totalAnswered: 0, totalCorrect: 0, bySpecialty: {} };
  }

  getArcadeStats() {
    try {
      const raw = localStorage.getItem('caces_arcade_stats');
      if (raw) {
        const parsed = JSON.parse(raw);
        const bestStep = Number(parsed.bridgeBestStep || 0);
        const bestStreak = Math.max(Number(parsed.bridgeBestStreak || 0), bestStep);
        return {
          bridgeHighScore: Number(parsed.bridgeHighScore || 0),
          bridgeBestStep: bestStep,
          bridgeBestStreak: bestStreak,
          bridgeWins: Number(parsed.bridgeWins || 0),
          hangmanHighScore: Number(parsed.hangmanHighScore || 0),
          hangmanWordsSolved: Number(parsed.hangmanWordsSolved || 0),
          hangmanBestStreak: Number(parsed.hangmanBestStreak || 0)
        };
      }
    } catch (e) {}
    return {
      bridgeHighScore: 0,
      bridgeBestStep: 0,
      bridgeBestStreak: 0,
      bridgeWins: 0,
      hangmanHighScore: 0,
      hangmanWordsSolved: 0,
      hangmanBestStreak: 0
    };
  }

  saveArcadeStats(update = {}) {
    const current = this.getArcadeStats();
    const nextBestStep = Math.max(current.bridgeBestStep, Number(update.bridgeBestStep || 0));
    const nextBestStreak = Math.max(current.bridgeBestStreak || 0, Number(update.bridgeBestStreak || 0), nextBestStep);
    const next = {
      bridgeHighScore: Math.max(current.bridgeHighScore, Number(update.bridgeHighScore || 0)),
      bridgeBestStep: nextBestStep,
      bridgeBestStreak: nextBestStreak,
      bridgeWins: current.bridgeWins + Number(update.addBridgeWin || 0),
      hangmanHighScore: Math.max(current.hangmanHighScore, Number(update.hangmanHighScore || 0)),
      hangmanWordsSolved: current.hangmanWordsSolved + Number(update.addHangmanWord || 0),
      hangmanBestStreak: Math.max(current.hangmanBestStreak, Number(update.hangmanBestStreak || 0))
    };
    localStorage.setItem('caces_arcade_stats', JSON.stringify(next));
    const overallHigh = Math.max(next.bridgeHighScore, next.hangmanHighScore);
    const prevHigh = parseInt(localStorage.getItem('caces_blitz_high') || '0', 10);
    if (overallHigh > prevHigh) {
      localStorage.setItem('caces_blitz_high', String(overallHigh));
    }
    this.scheduleAutoCloudSync(1200);
    return next;
  }

  getUserRankedStats() {
    const xp = parseInt(localStorage.getItem('caces_xp') || '120', 10);
    const currentStreak = parseInt(localStorage.getItem('caces_streak') || '1', 10);
    const storedBestStreak = parseInt(localStorage.getItem('caces_best_streak') || '0', 10);
    const mejorRacha = Math.max(currentStreak, storedBestStreak, 1);

    const history = this.getExamHistory();
    const tutorStats = this.getTutorStats();

    let simAnswered = 0;
    let simCorrect = 0;
    let sumPct = 0;
    let sumPuntajeCaces = 0;

    history.forEach(h => {
      if (!h.realtimeTutorCounted) {
        simAnswered += Number(h.total || 0);
        simCorrect += Number(h.puntuacion || 0);
      }
      const pct = Number(h.porcentaje || 0);
      sumPct += pct;
      const cacesPts = h.puntajeCaces || (pct < 60 ? Math.round((pct / 60) * 700) : Math.round(700 + ((pct - 60) / 40) * 300));
      sumPuntajeCaces += cacesPts;
    });

    const combinedCorrect = simCorrect + tutorStats.totalCorrect;
    const combinedAnswered = simAnswered + tutorStats.totalAnswered;
    const directCorrect = parseInt(localStorage.getItem('caces_total_correct') || '0', 10);
    const totalCorrectas = Math.max(directCorrect, combinedCorrect);

    const simulacrosCount = history.length;
    let promedioSimulacros = 0;
    let puntajeCacesPromedio = 0;

    if (combinedAnswered > 0) {
      promedioSimulacros = Math.round((combinedCorrect / combinedAnswered) * 100);
      puntajeCacesPromedio = promedioSimulacros < 60
        ? Math.round((promedioSimulacros / 60) * 700)
        : Math.round(700 + ((promedioSimulacros - 60) / 40) * 300);
    } else if (simulacrosCount > 0) {
      promedioSimulacros = Math.round(sumPct / simulacrosCount);
      puntajeCacesPromedio = Math.round(sumPuntajeCaces / simulacrosCount);
    }

    return {
      xp,
      currentStreak,
      mejorRacha,
      totalCorrectas,
      totalRespondidas: combinedAnswered,
      promedioSimulacros,
      puntajeCacesPromedio,
      simulacrosCount,
      rankTitle: this.getRankTitleForXP(xp)
    };
  }

  async loginOrRegisterUser({ name, email, pin = '0000', avatar = null, provider = 'email' }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim() || cleanEmail.split('@')[0] || 'Médico EHEP';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Ingresa un correo electrónico válido.');
    }

    const existingProfile = this.getUserProfile();
    const preservedGoogleAvatar = (existingProfile && existingProfile.email === cleanEmail && existingProfile.avatar && !existingProfile.avatar.includes('ui-avatars.com'))
      ? existingProfile.avatar
      : null;

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=10b981&color=fff&bold=true`;
    const userKey = `user_${cleanEmail}`;
    const profile = {
      name: cleanName,
      email: cleanEmail,
      avatar: avatar || preservedGoogleAvatar || defaultAvatar,
      provider: provider || 'google',
      userKey,
      updatedAt: new Date().toISOString()
    };

    if (provider === 'google') {
      this.saveKnownGoogleAccount(profile);
    }

    this.deviceId = `usr_${cleanEmail}`;
    localStorage.setItem('caces_device_id', this.deviceId);
    localStorage.setItem('caces_user_profile', JSON.stringify(profile));

    await this.pullUserProgressFromCloud(cleanEmail);
    await this.syncUserProgressToCloud();

    return profile;
  }

  /**
   * Inicia sesión con cuenta real de Google (OAuth / Google Identity)
   * obteniendo el nombre real y la foto oficial de Google del usuario.
   */
  async loginWithGoogle() {
    if (this.supabaseClient?.auth?.signInWithOAuth && window.location.protocol.startsWith('http')) {
      try {
        const redirectUrl = window.location.origin + window.location.pathname;
        const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account'
            }
          }
        });
        if (error) {
          console.warn('Supabase Google OAuth:', error.message);
        } else if (data?.url) {
          window.location.href = data.url;
          return { inProgress: true };
        }
      } catch (err) {
        console.warn('Excepción en Supabase Google OAuth:', err);
      }
    }
    const customGoogleClientId = localStorage.getItem('caces_google_client_id');
    if (customGoogleClientId && window.google?.accounts?.id && this.supabaseClient?.auth?.signInWithIdToken) {
      return new Promise((resolve, reject) => {
        try {
          window.google.accounts.id.initialize({
            client_id: customGoogleClientId,
            callback: async (response) => {
              try {
                const { data, error } = await this.supabaseClient.auth.signInWithIdToken({
                  provider: 'google',
                  token: response.credential
                });
                if (error) throw error;
                const u = data?.user;
                const name = u?.user_metadata?.full_name || u?.user_metadata?.name || u?.email?.split('@')[0] || 'Médico EHEP';
                const email = u?.email;
                const avatar = u?.user_metadata?.avatar_url || u?.user_metadata?.picture;
                const prof = await this.loginOrRegisterUser({ name, email, avatar, provider: 'google' });
                resolve(prof);
              } catch (err) {
                reject(err);
              }
            }
          });
          window.google.accounts.id.prompt();
        } catch (e) {
          reject(e);
        }
      });
    }

    return this.openGoogleAccountChooserModal();
  }

  openGoogleAccountChooserModal() {
    return new Promise((resolve, reject) => {
      let chooser = document.getElementById('google-account-chooser-modal');
      if (!chooser) {
        chooser = document.createElement('div');
        chooser.id = 'google-account-chooser-modal';
        chooser.className = 'fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4';
        document.body.appendChild(chooser);
      }

      const savedAccounts = this.getSavedGoogleAccounts();
      const currentProfile = this.getUserProfile();
      if (currentProfile && currentProfile.email && !savedAccounts.some(a => a.email === currentProfile.email)) {
        savedAccounts.unshift({
          name: currentProfile.name,
          email: currentProfile.email,
          avatar: currentProfile.avatar
        });
      }

      const savedAccountsHtml = savedAccounts.length > 0 ? `
        <div class="space-y-2 mb-4">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">Elige una cuenta guardada en este dispositivo:</p>
          <div class="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            ${savedAccounts.map((acc, idx) => `
              <button type="button" data-saved-google-idx="${idx}" class="w-full p-3.5 bg-white dark:bg-slate-900 hover:bg-emerald-500/10 transition-colors flex items-center gap-3 text-left">
                <img src="${acc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name || 'M')}&background=10b981&color=fff&bold=true`}" alt="" class="w-9 h-9 rounded-full object-cover shrink-0">
                <div class="min-w-0 flex-1">
                  <div class="font-display font-bold text-sm text-slate-900 dark:text-white truncate">${acc.name}</div>
                  <div class="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">${acc.email}</div>
                </div>
                <span class="text-xs font-mono font-bold text-emerald-500">Entrar →</span>
              </button>
            `).join('')}
          </div>
        </div>
      ` : '';

      chooser.innerHTML = `
        <div class="bto-card bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div class="p-6 border-b border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-200 mx-auto">
              <svg class="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-slate-900 dark:text-white">Iniciar sesión con Google</h3>
            <p class="text-sm text-slate-600 dark:text-slate-300">
              Ir a <span class="font-display font-extrabold text-emerald-600 dark:text-emerald-400">El Hpta CACES</span>
            </p>
          </div>

          <div class="p-6 space-y-4">
            ${savedAccountsHtml}

            <form id="google-chooser-form" class="space-y-3.5">
              <div>
                <label class="block font-mono text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Correo de Google (Gmail):</label>
                <input type="email" id="google-chooser-email" required placeholder="tu.correo@gmail.com" class="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-mono focus:border-emerald-500 focus:outline-none">
              </div>
              <div>
                <label class="block font-mono text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Nombre o Alias en El Hpta CACES:</label>
                <input type="text" id="google-chooser-name" placeholder="Ej: Dr. Jhojann Demera" class="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:border-emerald-500 focus:outline-none">
              </div>
              <div id="google-chooser-error" class="hidden p-2.5 rounded-xl bg-rose-500/15 text-rose-500 text-xs font-mono font-bold"></div>
              <div class="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" id="btn-cancel-google-chooser" class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold hover:bg-slate-200 dark:hover:bg-slate-700">
                  Cancelar
                </button>
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all">
                  Continuar a El Hpta CACES
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      chooser.classList.remove('hidden');

      const closeChooser = () => {
        chooser.classList.add('hidden');
      };

      chooser.querySelectorAll('[data-saved-google-idx]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.getAttribute('data-saved-google-idx'), 10);
          const picked = savedAccounts[idx];
          if (!picked) return;
          closeChooser();
          try {
            const prof = await this.loginOrRegisterUser({
              name: picked.name,
              email: picked.email,
              avatar: picked.avatar,
              provider: 'google'
            });
            resolve(prof);
          } catch (err) {
            reject(err);
          }
        });
      });

      const emailInput = chooser.querySelector('#google-chooser-email');
      const nameInput = chooser.querySelector('#google-chooser-name');
      emailInput?.addEventListener('input', () => {
        if (nameInput && !nameInput.dataset.touched) {
          const prefix = emailInput.value.split('@')[0] || '';
          if (prefix) {
            nameInput.placeholder = 'Dr. ' + prefix.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          }
        }
      });
      nameInput?.addEventListener('input', () => {
        nameInput.dataset.touched = 'true';
      });

      chooser.querySelector('#btn-cancel-google-chooser')?.addEventListener('click', () => {
        closeChooser();
        reject(new Error('Inicio de sesión cancelado.'));
      });

      chooser.querySelector('#google-chooser-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawEmail = (emailInput?.value || '').trim().toLowerCase();
        const errBox = chooser.querySelector('#google-chooser-error');
        if (!rawEmail || !rawEmail.includes('@')) {
          if (errBox) {
            errBox.textContent = 'Ingresa un correo de Google válido.';
            errBox.classList.remove('hidden');
          }
          return;
        }
        const fallbackName = 'Dr. ' + rawEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const finalName = (nameInput?.value || '').trim() || fallbackName;
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=10b981&color=fff&bold=true`;

        closeChooser();
        try {
          const prof = await this.loginOrRegisterUser({
            name: finalName,
            email: rawEmail,
            avatar,
            provider: 'google'
          });
          resolve(prof);
        } catch (err) {
          reject(err);
        }
      });

      setTimeout(() => emailInput?.focus(), 60);
    });
  }

  logoutUser() {
    localStorage.removeItem('caces_user_profile');
    if (this.supabaseClient?.auth?.signOut) {
      this.supabaseClient.auth.signOut().catch(() => {});
    }
  }

  async syncUserProgressToCloud() {
    const profile = this.getUserProfile();
    if (!profile || !this.supabaseClient) return { synced: false };

    const rankedStats = this.getUserRankedStats();
    const tutorStats = this.getTutorStats();
    const arcadeStats = this.getArcadeStats();
    const snapshot = {
      xp: rankedStats.xp,
      streak: rankedStats.currentStreak,
      bestStreak: rankedStats.mejorRacha,
      totalCorrectas: rankedStats.totalCorrectas,
      totalRespondidas: rankedStats.totalRespondidas,
      promedioSimulacros: rankedStats.promedioSimulacros,
      puntajeCacesPromedio: rankedStats.puntajeCacesPromedio,
      simulacrosCount: rankedStats.simulacrosCount,
      rankTitle: rankedStats.rankTitle,
      tutorStats,
      arcadeStats,
      highScoreBlitz: parseInt(localStorage.getItem('caces_blitz_high') || '0', 10),
      errorBank: this.getErrorBank(),
      srsDeck: JSON.parse(localStorage.getItem('caces_srs_deck') || '{}'),
      profileName: profile.name,
      avatar: profile.avatar
    };

    try {
      await this.supabaseClient.from('caces_simulacros').insert({
        user_email: profile.email,
        device_id: this.deviceId,
        modo: '__PROFILE_SYNC__',
        puntuacion_obtenida: snapshot.xp,
        total_preguntas: snapshot.totalCorrectas,
        porcentaje: snapshot.promedioSimulacros,
        tiempo_segundos: snapshot.bestStreak,
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
        .limit(40);

      if (error || !data || data.length === 0) return false;

      const latestSync = data.find(r => r.modo === '__PROFILE_SYNC__' && r.desglose_especialidades);
      if (latestSync && latestSync.desglose_especialidades) {
        const snap = latestSync.desglose_especialidades;
        const localXp = parseInt(localStorage.getItem('caces_xp') || '0', 10);
        if ((snap.xp || 0) > localXp) {
          localStorage.setItem('caces_xp', String(snap.xp));
        }
        const localBestStreak = parseInt(localStorage.getItem('caces_best_streak') || '0', 10);
        if ((snap.bestStreak || 0) > localBestStreak) {
          localStorage.setItem('caces_best_streak', String(snap.bestStreak));
        }
        const localTotalCorrect = parseInt(localStorage.getItem('caces_total_correct') || '0', 10);
        if ((snap.totalCorrectas || 0) > localTotalCorrect) {
          localStorage.setItem('caces_total_correct', String(snap.totalCorrectas));
        }
        if (snap.tutorStats && typeof snap.tutorStats === 'object') {
          const localTutor = this.getTutorStats();
          if ((snap.tutorStats.totalAnswered || 0) > localTutor.totalAnswered) {
            localStorage.setItem('caces_tutor_stats', JSON.stringify(snap.tutorStats));
          }
        }
        if (snap.arcadeStats && typeof snap.arcadeStats === 'object') {
          const localArc = this.getArcadeStats();
          const mergedBestStep = Math.max(localArc.bridgeBestStep, Number(snap.arcadeStats.bridgeBestStep || 0));
          const mergedBestStreak = Math.max(localArc.bridgeBestStreak || 0, Number(snap.arcadeStats.bridgeBestStreak || 0), mergedBestStep);
          const mergedArc = {
            bridgeHighScore: Math.max(localArc.bridgeHighScore, Number(snap.arcadeStats.bridgeHighScore || 0)),
            bridgeBestStep: mergedBestStep,
            bridgeBestStreak: mergedBestStreak,
            bridgeWins: Math.max(localArc.bridgeWins, Number(snap.arcadeStats.bridgeWins || 0)),
            hangmanHighScore: Math.max(localArc.hangmanHighScore, Number(snap.arcadeStats.hangmanHighScore || 0)),
            hangmanWordsSolved: Math.max(localArc.hangmanWordsSolved, Number(snap.arcadeStats.hangmanWordsSolved || 0)),
            hangmanBestStreak: Math.max(localArc.hangmanBestStreak, Number(snap.arcadeStats.hangmanBestStreak || 0))
          };
          localStorage.setItem('caces_arcade_stats', JSON.stringify(mergedArc));
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

  /**
   * Obtiene el Ranking Nacional 100% REAL de El Hpta CACES desde Supabase
   * usando únicamente las cuentas reales de Google registradas y sus fotos oficiales.
   */
  async getRankedLeaderboard() {
    const byEmail = new Map();

    if (this.supabaseClient) {
      try {
        const { data, error } = await this.supabaseClient
          .from('caces_simulacros')
          .select('user_email, modo, puntuacion_obtenida, total_preguntas, porcentaje, tiempo_segundos, desglose_especialidades, created_at')
          .order('created_at', { ascending: false })
          .limit(350);

        if (!error && Array.isArray(data)) {
          const cloudUsers = new Map();
          data.forEach(row => {
            const email = (row.user_email || '').trim().toLowerCase();
            if (!email || !email.includes('@')) return;
            if (!cloudUsers.has(email)) {
              cloudUsers.set(email, {
                email,
                name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                universidad: 'Cuenta Google Verificada',
                totalCorrectas: 0,
                examCorrectSum: 0,
                examTotalSum: 0,
                examPctSum: 0,
                simulacrosCount: 0,
                mejorRacha: 1,
                xp: 120,
                avatar: null,
                arcadeStats: {
                  bridgeHighScore: 0,
                  bridgeBestStep: 0,
                  bridgeBestStreak: 0,
                  bridgeWins: 0,
                  hangmanHighScore: 0,
                  hangmanWordsSolved: 0,
                  hangmanBestStreak: 0
                }
              });
            }
            const u = cloudUsers.get(email);
            if (row.modo === '__PROFILE_SYNC__' && row.desglose_especialidades) {
              const snap = row.desglose_especialidades;
              if (snap.profileName && !u.hasSyncedName) {
                u.name = snap.profileName;
                u.hasSyncedName = true;
              }
              if (snap.avatar && (!u.avatar || u.avatar.includes('ui-avatars.com'))) {
                u.avatar = snap.avatar;
              }
              u.xp = Math.max(u.xp, Number(snap.xp || row.puntuacion_obtenida || 120));
              u.mejorRacha = Math.max(u.mejorRacha, Number(snap.bestStreak || snap.streak || row.tiempo_segundos || 1));
              u.totalCorrectas = Math.max(u.totalCorrectas, Number(snap.totalCorrectas || row.total_preguntas || 0));
              if (snap.arcadeStats && typeof snap.arcadeStats === 'object') {
                u.arcadeStats.bridgeHighScore = Math.max(u.arcadeStats.bridgeHighScore, Number(snap.arcadeStats.bridgeHighScore || 0));
                u.arcadeStats.bridgeBestStep = Math.max(u.arcadeStats.bridgeBestStep, Number(snap.arcadeStats.bridgeBestStep || 0));
                u.arcadeStats.bridgeBestStreak = Math.max(u.arcadeStats.bridgeBestStreak || 0, Number(snap.arcadeStats.bridgeBestStreak || 0), u.arcadeStats.bridgeBestStep);
                u.arcadeStats.bridgeWins = Math.max(u.arcadeStats.bridgeWins, Number(snap.arcadeStats.bridgeWins || 0));
                u.arcadeStats.hangmanHighScore = Math.max(u.arcadeStats.hangmanHighScore, Number(snap.arcadeStats.hangmanHighScore || 0));
                u.arcadeStats.hangmanWordsSolved = Math.max(u.arcadeStats.hangmanWordsSolved, Number(snap.arcadeStats.hangmanWordsSolved || 0));
                u.arcadeStats.hangmanBestStreak = Math.max(u.arcadeStats.hangmanBestStreak, Number(snap.arcadeStats.hangmanBestStreak || 0));
              }
              if (typeof snap.promedioSimulacros === 'number' && !u.hasSyncedAvg) {
                u.cloudAvgOverride = Number(snap.promedioSimulacros);
                u.cloudSimCountOverride = Number(snap.simulacrosCount || 0);
                u.hasSyncedAvg = true;
              }
            } else {
              if (row.desglose_especialidades?._userMeta) {
                const meta = row.desglose_especialidades._userMeta;
                if (meta.name && !u.hasSyncedName) u.name = meta.name;
                if (meta.avatar && !u.avatar) u.avatar = meta.avatar;
              }
              u.simulacrosCount += 1;
              u.examCorrectSum += Number(row.puntuacion_obtenida || 0);
              u.examTotalSum += Number(row.total_preguntas || 0);
              u.examPctSum += Number(row.porcentaje || 0);
            }
          });

          cloudUsers.forEach((u, email) => {
            const totalCorrectas = Math.max(u.totalCorrectas, u.examCorrectSum);
            const simCount = Math.max(u.simulacrosCount, u.cloudSimCountOverride || 0);
            const avgPct = u.cloudAvgOverride !== undefined && u.cloudAvgOverride > 0
              ? u.cloudAvgOverride
              : (u.simulacrosCount > 0 ? Math.round(u.examPctSum / u.simulacrosCount) : 0);
            const cacesPts = avgPct > 0
              ? (avgPct < 60 ? Math.round((avgPct / 60) * 700) : Math.round(700 + ((avgPct - 60) / 40) * 300))
              : 0;

            byEmail.set(email, {
              email,
              name: u.name,
              universidad: 'Cuenta Google',
              totalCorrectas,
              promedioSimulacros: avgPct,
              puntajeCacesPromedio: cacesPts,
              simulacrosCount: simCount,
              mejorRacha: u.mejorRacha,
              xp: u.xp,
              rankTitle: this.getRankTitleForXP(u.xp),
              arcadeStats: u.arcadeStats,
              avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=10b981&color=fff&bold=true`,
              isCurrentUser: false
            });
          });
        }
      } catch (e) {
        console.warn('Error consultando ranking en Supabase:', e);
      }
    }

    const activeProfile = this.getUserProfile();
    const myStats = this.getUserRankedStats();
    const myArcade = this.getArcadeStats();
    if (activeProfile && activeProfile.email) {
      const email = activeProfile.email.toLowerCase();
      const existingCloud = byEmail.get(email);
      const mergedCorrectas = Math.max(myStats.totalCorrectas, existingCloud?.totalCorrectas || 0);
      const mergedRacha = Math.max(myStats.mejorRacha, existingCloud?.mejorRacha || 1);
      const mergedXp = Math.max(myStats.xp, existingCloud?.xp || 120);
      const mergedAvg = myStats.promedioSimulacros || existingCloud?.promedioSimulacros || 0;
      const mergedPts = myStats.puntajeCacesPromedio || existingCloud?.puntajeCacesPromedio || 0;
      const mergedSimCount = Math.max(myStats.simulacrosCount, existingCloud?.simulacrosCount || 0);
      const bestAvatar = (activeProfile.avatar && !activeProfile.avatar.includes('ui-avatars.com'))
        ? activeProfile.avatar
        : (existingCloud?.avatar || activeProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeProfile.name)}&background=10b981&color=fff&bold=true`);

      const mergedBestStep = Math.max(myArcade.bridgeBestStep, existingCloud?.arcadeStats?.bridgeBestStep || 0);
      const mergedArcade = {
        bridgeHighScore: Math.max(myArcade.bridgeHighScore, existingCloud?.arcadeStats?.bridgeHighScore || 0),
        bridgeBestStep: mergedBestStep,
        bridgeBestStreak: Math.max(myArcade.bridgeBestStreak || 0, existingCloud?.arcadeStats?.bridgeBestStreak || 0, mergedBestStep),
        bridgeWins: Math.max(myArcade.bridgeWins, existingCloud?.arcadeStats?.bridgeWins || 0),
        hangmanHighScore: Math.max(myArcade.hangmanHighScore, existingCloud?.arcadeStats?.hangmanHighScore || 0),
        hangmanWordsSolved: Math.max(myArcade.hangmanWordsSolved, existingCloud?.arcadeStats?.hangmanWordsSolved || 0),
        hangmanBestStreak: Math.max(myArcade.hangmanBestStreak, existingCloud?.arcadeStats?.hangmanBestStreak || 0)
      };

      byEmail.set(email, {
        email,
        name: activeProfile.name,
        universidad: 'Tu Cuenta de Google',
        totalCorrectas: mergedCorrectas,
        promedioSimulacros: mergedAvg,
        puntajeCacesPromedio: mergedPts,
        simulacrosCount: mergedSimCount,
        mejorRacha: mergedRacha,
        xp: mergedXp,
        rankTitle: this.getRankTitleForXP(mergedXp),
        arcadeStats: mergedArcade,
        avatar: bestAvatar,
        isCurrentUser: true
      });
    }

    return Array.from(byEmail.values());
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
    const historyEntry = {
      id: 'sim_' + Date.now(),
      modo: result.modo,
      modeKey: result.modeKey,
      realtimeTutorCounted: Boolean(result.realtimeTutorCounted),
      puntuacion: result.puntuacion,
      total: result.total,
      incorrectas: result.incorrectas,
      sinResponder: result.sinResponder,
      porcentaje: result.porcentaje,
      puntajeCaces: result.puntajeCaces,
      aprobado: result.aprobado,
      tiempo: result.tiempo,
      desglose: result.desglose || {},
      respuestasUsuario: result.respuestasUsuario || {},
      fecha: new Date().toISOString(),
      fechaTexto: result.fecha || '',
      deviceId: this.deviceId
    };

    const profile = this.getUserProfile();

    try {
      let history = this.getExamHistory();
      history.unshift(historyEntry);
      if (history.length > 100) history = history.slice(0, 100);
      localStorage.setItem('caces_exam_history', JSON.stringify(history));
    } catch (e) {
      console.warn("Advertencia al guardar historial local:", e);
    }

    if (this.supabaseClient) {
      try {
        const desglosePayload = {
          ...(result.desglose || {}),
          _userMeta: profile ? { name: profile.name, avatar: profile.avatar } : null
        };
        await this.supabaseClient.from('caces_simulacros').insert({
          user_email: profile ? profile.email : null,
          device_id: this.deviceId,
          modo: result.modo || 'Simulacro CACES',
          puntuacion_obtenida: result.puntuacion,
          total_preguntas: result.total,
          porcentaje: result.porcentaje,
          tiempo_segundos: result.tiempo,
          desglose_especialidades: desglosePayload
        });
      } catch (e) {
        console.warn("No se pudo guardar historial en Supabase:", e);
      }
    }

    this.scheduleAutoCloudSync(1000);
    return historyEntry;
  }

  getExamHistory() {
    try {
      const data = localStorage.getItem('caces_exam_history');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Registra el resultado de una pregunta en el banco de errores (La Morgue),
   * y acumula en tiempo real las estadísticas de Modo Tutor y Ranking.
   */
  registerAnswer(questionId, isCorrect, selectedOption = null, meta = {}) {
    let errors = this.getErrorBank();
    if (!isCorrect) {
      if (!errors[questionId]) {
        errors[questionId] = {
          fallos: 1,
          aciertos_seguidos: 0,
          ultimo_fallo: Date.now(),
          dominada: false,
          ultima_opcion_erronea: selectedOption || null
        };
      } else {
        errors[questionId].fallos = (errors[questionId].fallos || 0) + 1;
        errors[questionId].aciertos_seguidos = 0;
        errors[questionId].ultimo_fallo = Date.now();
        errors[questionId].dominada = false;
        if (selectedOption) {
          errors[questionId].ultima_opcion_erronea = selectedOption;
        }
      }
    } else {
      if (meta.isFirstAttempt !== false) {
        const prevTotalCorrect = parseInt(localStorage.getItem('caces_total_correct') || '0', 10);
        localStorage.setItem('caces_total_correct', String(prevTotalCorrect + 1));
      }
      if (errors[questionId]) {
        errors[questionId].aciertos_seguidos = (errors[questionId].aciertos_seguidos || 0) + 1;
        if (errors[questionId].aciertos_seguidos >= 2) {
          errors[questionId].dominada = true;
        }
      }
    }

    // Contabilizar en tiempo real las preguntas respondidas en Modo Tutor / Estudio
    if (meta && meta.mode && meta.mode !== 'caces' && meta.isFirstAttempt !== false) {
      const tutorStats = this.getTutorStats();
      tutorStats.totalAnswered += 1;
      if (isCorrect) tutorStats.totalCorrect += 1;
      const spec = meta.specialty || 'Medicina Interna';
      if (!tutorStats.bySpecialty[spec]) {
        tutorStats.bySpecialty[spec] = { total: 0, correct: 0 };
      }
      tutorStats.bySpecialty[spec].total += 1;
      if (isCorrect) tutorStats.bySpecialty[spec].correct += 1;
      localStorage.setItem('caces_tutor_stats', JSON.stringify(tutorStats));
    }

    localStorage.setItem('caces_error_bank', JSON.stringify(errors));
    this.scheduleAutoCloudSync(2000);
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
    this.clearActiveSession();
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