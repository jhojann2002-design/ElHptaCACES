/**
 * MOTOR ARCADE EHEP 3D - EL HPTA CACES (VERSIÓN FULLSCREEN INMERSIVO + POV DEL SALTADOR)
 * Incluye 2 Juegos Oficiales de Alto Rendimiento:
 * 1. El Puente de Cristal CACES (#456, #058, #100):
 *    - Portal en Pantalla Completa real (montado en document.body sin barra superior ni ranking
 *      para que jamás se superponga nada con las preguntas u opciones).
 *    - Secuencia Cinemática Squid Game:
 *      a) Al iniciar se muestra un plano general con los 3 jugadores (#456, #058 y #100).
 *      b) La cámara entra al POV en primera persona del jugador que va a saltar (#456).
 *      c) Al responder, salta en POV y mira hacia abajo al piso para ver si el vidrio es templado;
 *         si aguanta, levanta la mirada al frente y muestra la Perla CACES / siguiente pregunta.
 *      d) Si el vidrio se rompe, se ve la animación de caída en POV al abismo, luego la cámara
 *         pasa al POV del jugador de atrás (#058 y luego #100), quien salta al vidrio templado,
 *         verifica el piso, mira al frente y pasa a la siguiente pregunta.
 * 2. Ahorcado Clínico MSP (Diagnósticos, Fármacos de Elección y Epónimos CACES)
 * + Ranking Top Arcade en Vivo con Cuentas y Fotos Reales de Google (Supabase).
 */

import { Storage } from './storage.js';

const SVG_ICONS = {
  bolt: `<svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  pulse: `<svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  award: `<svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  crosshair: `<svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`,
  shield: `<svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  eye: `<svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  sparkle: `<svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  trophy: `<svg class="w-5 h-5 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  diamond: `<svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  check: `<svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  cross: `<svg class="w-4 h-4 inline-block shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  heartFull: `<svg class="w-4 h-4 text-rose-500 inline-block" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  heartEmpty: `<svg class="w-4 h-4 text-slate-600 inline-block opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
};

export class ArcadeManager {
  constructor(formatMarkdownFn) {
    this.formatMd = formatMarkdownFn || ((t) => t);
    this.currentMode = 'bridge'; // 'bridge' | 'hangman'
    this.leaderboardTab = 'streak';
    this.sfxEnabled = localStorage.getItem('caces_sfx') !== 'off';
    this.audioCtx = null;

    this.xp = parseInt(localStorage.getItem('caces_xp') || '120', 10);
    this.streak = parseInt(localStorage.getItem('caces_streak') || '1', 10);
    this.highScoreBlitz = parseInt(localStorage.getItem('caces_blitz_high') || '0', 10);

    this.blitzInterval = null;
    this.activeRaf = null;
    this.activeTimers = [];
    this.activeKeyHandler = null;
    this.ambientTimer = null;
    this.heartbeatTimer = null;
    this.musicTimer = null;
    this.chatterTimer = null;
    this.chatterHideTimer = null;
    this.musicStepIndex = 0;
    this.lastChatterIndex = -1;
    this.questionsPool = [];
    this._audioUnlockBound = false;
    this.bindMobileAudioUnlock();

    // =========================================================================
    // BANCO DE TÉRMINOS CLÍNICOS PARA EL AHORCADO MSP (ALTO RENDIMIENTO CACES)
    // =========================================================================
    this.hangmanDictionary = [
      {
        word: 'SULFATO DE MAGNESIO',
        category: 'Ginecología y Obstetricia • Clave Azul MSP',
        clue: 'Fármaco de primera elección para prevenir y tratar las convulsiones en Preeclampsia Grave y Eclampsia (Esquema de Zuspan: impregnación 4 g IV y mantenimiento 1 g/h).',
        extraHint: 'Su intoxicación produce pérdida del reflejo rotuliano y se revierte con Gluconato de Calcio al 10%.',
        pearl: 'En Clave Azul MSP: Impregnación para Preeclampsia es 4 g IV en 20 min + 1 g/h; en Eclampsia activa es 6 g IV en 20 min + 2 g/h.'
      },
      {
        word: 'GLUCONATO DE CALCIO',
        category: 'Ginecología y Obstetricia • Antídoto Obstétrico',
        clue: 'Antídoto específico que se administra a dosis de 1 gramo IV lento cuando una gestante en Clave Azul presenta arreflexia patelar y depresión respiratoria.',
        extraHint: 'Antagoniza de forma directa la toxicidad neuromuscular por hipermagnesemia.',
        pearl: 'Vigilar reflejo rotuliano, frecuencia respiratoria (≥12 rpm) y diuresis (≥30 ml/h) cada hora durante la infusión de Sulfato de Magnesio.'
      },
      {
        word: 'ACIDO TRANEXAMICO',
        category: 'Ginecología y Obstetricia • Clave Roja MSP',
        clue: 'Fármaco antifibrinolítico que se administra a dosis de 1 gramo IV en 10 minutos dentro de las primeras 3 horas de una Hemorragia Posparto.',
        extraHint: 'Inhibe la activación del plasminógeno en plasmina y reduce la mortalidad materna por sangrado.',
        pearl: 'En Clave Roja MSP se administra 1 g IV (100 mg/ml) a 1 ml/min; puede repetirse una segunda dosis de 1 g si el sangrado continúa tras 30 minutos.'
      },
      {
        word: 'ATONIA UTERINA',
        category: 'Ginecología y Obstetricia • Las 4 T',
        clue: 'Principal causa de Hemorragia Posparto (representa el 70% de los casos), caracterizada por un útero blando y no involucionado por encima del ombligo.',
        extraHint: 'Corresponde a la primera "T" (Tono) de la nemotecnia de las 4 T.',
        pearl: 'Las 4 T de la Hemorragia Posparto: Tono (Atonía 70%), Trauma (Desgarros/Ruptura 20%), Tejido (Retención placentaria 9%) y Trombina (Coagulopatía 1%).'
      },
      {
        word: 'TRIADA DE BECK',
        category: 'Cirugía y Trauma • Urgencia Cardiotorácica',
        clue: 'Conjunto clínico clásico integrado por hipotensión arterial, ruidos cardíacos apagados (velados) e ingurgitación yugular en un paciente con trauma torácico.',
        extraHint: 'Es el sello clínico patognomónico del Taponamiento Cardíaco Agudo.',
        pearl: 'El manejo de emergencia ante inestabilidad hemodinámica por Taponamiento Cardíaco es la pericardiocentesis subxifoidea guiada o toracotomía.'
      },
      {
        word: 'PENTADA DE REYNOLDS',
        category: 'Cirugía General • Patología Biliar',
        clue: 'Cuadro clínico de colangitis supurativa grave definido por fiebre con escalofríos, ictericia, dolor en hipocondrio derecho, shock séptico y depresión del sistema nervioso central.',
        extraHint: 'Es la evolución crítica de la Triada de Charcot cuando se agregan hipotensión y obnubilación.',
        pearl: 'Exige reanimación hemodinámica inmediata, antibioticoterapia IV de amplio espectro y descompresión biliar urgente mediante CPRE.'
      },
      {
        word: 'SIGNO DE MURPHY',
        category: 'Cirugía General • Abdomen Agudo',
        clue: 'Interrupción brusca de la inspiración profunda por dolor al comprimir el punto cístico en el hipocondrio derecho.',
        extraHint: 'Tiene alta sensibilidad para el diagnóstico clínico de Colecistitis Aguda Litiásica.',
        pearl: 'El estudio de imagen inicial de elección en Colecistitis Aguda es la Ecografía Abdominal (pared vesicular > 4 mm, líquido perivesicular y Murphy ecográfico).'
      },
      {
        word: 'SIGNO DE ROVSING',
        category: 'Cirugía General • Apendicitis Aguda',
        clue: 'Dolor referido en la fosa ilíaca derecha al realizar compresión profunda retrógrada sobre la fosa ilíaca izquierda.',
        extraHint: 'Se produce por desplazamiento de gas intraluminal desde el colon descendente hacia el ciego inflamado.',
        pearl: 'En la Escala de Alvarado, los dos únicos criterios que valen 2 puntos son Dolor en FID y Leucocitosis >10,000.'
      },
      {
        word: 'ACETILCISTEINA',
        category: 'Medicina Interna • Toxicología Clínica',
        clue: 'Antídoto específico que restaura las reservas hepáticas de glutatión para neutralizar el metabolito tóxico NAPQI en la intoxicación por paracetamol.',
        extraHint: 'Alcanza su máxima eficacia protectora contra la necrosis hepatocelular si se administra en las primeras 8 horas.',
        pearl: 'El nomograma de Rumack-Matthew guía su uso midiendo niveles séricos de paracetamol a partir de las 4 horas postingesta.'
      },
      {
        word: 'ADENOSINA',
        category: 'Medicina Interna • Cardiología de Urgencia',
        clue: 'Antiarrítmico de vida media ultracorta que se administra en bolo IV rápido de 6 mg (seguido de 12 mg) tras maniobras vagales fallidas en taquicardia supraventricular estable.',
        extraHint: 'Debe inyectarse por vía antecubital con llave de tres vías seguida de lavado inmediato con 20 ml de solución salina.',
        pearl: 'Si la TSV presenta inestabilidad hemodinámica (hipotensión, angina, alteración mental), el tratamiento inmediato es la Cardioversión Eléctrica Sincronizada.'
      },
      {
        word: 'SINDROME DE HELLP',
        category: 'Ginecología y Obstetricia • Complicación Severa',
        clue: 'Complicación multisistémica grave de la preeclampsia caracterizada por anemia hemolítica microangiopática (esquistocitos), elevación de transaminasas hepáticas y trombocitopenia.',
        extraHint: 'El síntoma clínico cardinal de alarma suele ser epigastralgia intensa o dolor en barra en hipocondrio derecho.',
        pearl: 'Criterios de Tennessee: LDH ≥ 600 UI/L, AST/ALT ≥ 70 UI/L y Plaquetas < 100,000/mm³.'
      },
      {
        word: 'ENFERMEDAD DE KAWASAKI',
        category: 'Pediatría • Vasculitis Sistémica',
        clue: 'Vasculitis pediátrica de vasos de mediano calibre con fiebre ≥ 5 días, inyección conjuntival bilateral no exudativa, lengua en fresa, exantema polimorfo y adenopatía cervical.',
        extraHint: 'Su complicación más temida es el desarrollo de aneurismas de las arterias coronarias.',
        pearl: 'El tratamiento de primera línea para prevenir aneurismas coronarios es Inmunoglobulina Intravenosa (IGIV 2 g/kg dosis única) + Ácido Acetilsalicílico.'
      },
      {
        word: 'GUILLAIN BARRE',
        category: 'Medicina Interna • Neurología',
        clue: 'Polirradiculoneuropatía desmielinizante aguda autoinmune que cursa con parálisis flácida simétrica ascendente y arreflexia osteotendinosa tras infección por Campylobacter jejuni.',
        extraHint: 'En el líquido cefalorraquídeo muestra la clásica disociación albúmino-citológica (proteínas elevadas con celularidad normal).',
        pearl: 'La prioridad vital es vigilar la función ventilatoria y tratar con Inmunoglobulina IV o Plasmaféresis (los corticoides NO son eficaces).'
      },
      {
        word: 'FEOCROMOCITOMA',
        category: 'Medicina Interna • Endocrinología',
        clue: 'Tumor neuroendocrino productor de catecolaminas de la médula suprarrenal que se manifiesta con paroxismos de cefalea pulsátil, diaforesis profusa y palpitaciones con crisis hipertensiva.',
        extraHint: 'Antes de cualquier cirugía o betabloqueo es obligatorio iniciar bloqueo alfa-adrenérgico (ej. fenoxibenzamina o doxazosina).',
        pearl: 'El método diagnóstico bioquímico de mayor sensibilidad es la medición de metanefrinas fraccionadas libres en plasma o en orina de 24 horas.'
      },
      {
        word: 'PLACENTA PREVIA',
        category: 'Ginecología y Obstetricia • Sangrado Segunda Mitad',
        clue: 'Implantación placentaria sobre el segmento uterino inferior que produce hemorragia transvaginal de sangre roja rutilante, indolora y sin hipertonía uterina en el tercer trimestre.',
        extraHint: 'En esta patología está formalmente PROHIBIDO realizar tacto vaginal.',
        pearl: 'Se diferencia del DPPNI, el cual cursa con sangrado oscuro, dolor abdominal intenso y útero leñoso (hipertónico).'
      },
      {
        word: 'CETOACIDOSIS DIABETICA',
        category: 'Medicina Interna • Emergencia Metabólica',
        clue: 'Descompensación hiperglucémica aguda con pH arterial < 7.30, bicarbonato < 18 mEq/L, cetonemia positiva, respiración de Kussmaul y acidosis metabólica con anión gap elevado.',
        extraHint: 'El primer paso terapéutico antes de iniciar insulina IV es la hidratación vigorosa con solución salina al 0.9% y verificar el potasio sérico.',
        pearl: 'Si el potasio sérico inicial es < 3.3 mEq/L, se debe diferir el inicio de la insulina IV y reponer potasio primero para evitar arritmias letales.'
      },
      {
        word: 'AMOXICILINA',
        category: 'Pediatría • Infecciones Respiratorias AIEPI',
        clue: 'Antibiótico betalactámico oral de primera elección según AIEPI y GPC MSP para el manejo ambulatorio de la Neumonía Adquirida en la Comunidad y la Otitis Media Aguda en niños.',
        extraHint: 'En neumonía pediátrica ambulatoria se prescribe a dosis altas (80-90 mg/kg/día) para vencer la resistencia de Streptococcus pneumoniae.',
        pearl: 'El signo clínico más sensible para clasificar Neumonía en niños según AIEPI es la Taquipnea (respiración rápida según grupo etario).'
      },
      {
        word: 'NITROFURANTOINA',
        category: 'Ginecología y Obstetricia • Infección Urinaria MSP',
        clue: 'Antiséptico urinario de primera línea en el Ecuador (100 mg VO cada 12 horas por 5 a 7 días) para el tratamiento de la bacteriuria asintomática y cistitis aguda en el embarazo.',
        extraHint: 'Debe evitarse al final del tercer trimestre (38-42 SG) por el riesgo teórico de anemia hemolítica neonatal.',
        pearl: 'En toda embarazada con bacteriuria asintomática (≥ 100,000 UFC/ml) el tratamiento antibiótico es obligatorio porque previene hasta el 75% de las pielonefritis.'
      }
    ];
  }

  renderLivesHearts(livesCount, maxLives = 3) {
    const safeLives = Math.max(0, Math.min(maxLives, livesCount));
    let html = '<span class="inline-flex items-center gap-0.5">';
    for (let i = 0; i < maxLives; i++) {
      html += i < safeLives ? SVG_ICONS.heartFull : SVG_ICONS.heartEmpty;
    }
    html += '</span>';
    return html;
  }

  /**
   * Renderiza las 3 vidas como los 3 Jugadores (#456, #058, #100) indicando quién tiene el POV activo
   */
  renderSquadPlayersHUD(lives = 3) {
    const roster = [
      { num: '456', aliveAt: 3 },
      { num: '058', aliveAt: 2 },
      { num: '100', aliveAt: 1 }
    ];
    return roster.map((p) => {
      const isAlive = lives >= p.aliveAt;
      const isActiveJumper = (lives === 3 && p.num === '456') || (lives === 2 && p.num === '058') || (lives === 1 && p.num === '100');

      if (!isAlive) {
        return `<span class="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/30 text-rose-400/60 line-through font-mono text-[10px] font-bold">#${p.num}</span>`;
      }
      if (isActiveJumper) {
        return `<span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[10px] font-black shadow-sm" title="Jugador activo en primera persona (POV)">👁️ #${p.num}</span>`;
      }
      return `<span class="px-1.5 py-0.5 rounded bg-slate-800/90 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">#${p.num}</span>`;
    }).join('');
  }

  /**
   * Oculta o restaura absolutamente toda la interfaz externa (barra superior, ranking, footer)
   * para que cuando El Puente de Cristal esté en pantalla completa SOLO exista el juego.
   */
  setExternalPageChromeHidden(hide = true) {
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');
    const rankPanel = document.getElementById('arcade-leaderboard-panel');
    const selectorGrid = document.getElementById('arcade-mode-selector-grid');

    if (hide) {
      document.body.classList.add('overflow-hidden');
      if (headerEl) headerEl.style.display = 'none';
      if (footerEl) footerEl.style.display = 'none';
      if (rankPanel) rankPanel.style.display = 'none';
      if (selectorGrid) selectorGrid.style.display = 'none';
    } else {
      document.body.classList.remove('overflow-hidden');
      if (headerEl) headerEl.style.display = '';
      if (footerEl) footerEl.style.display = '';
      if (rankPanel) rankPanel.style.display = '';
      if (selectorGrid) selectorGrid.style.display = '';
      const portal = document.getElementById('bridge-fullscreen-portal');
      if (portal) portal.remove();
    }
  }

  bindMobileAudioUnlock() {
    if (this._audioUnlockBound || typeof window === 'undefined') return;
    this._audioUnlockBound = true;
    const unlock = () => {
      if (!this.sfxEnabled) return;
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (window.speechSynthesis && typeof window.speechSynthesis.getVoices === 'function') {
          window.speechSynthesis.getVoices();
        }
      } catch (e) {}
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  /**
   * Calcula los latidos por minuto (BPM) en tiempo real según el peldaño actual y las vidas restantes.
   * Mientras más avanzas en el puente o menos jugadores quedan, más rápido y tenso late el corazón.
   */
  getBridgeCurrentBPM() {
    const st = this.bridgeState;
    if (!st) return 74;
    const stepFactor = (st.currentStep || 0) * 5;
    const livesLostFactor = Math.max(0, 3 - (st.lives || 3)) * 15;
    const jumpingBoost = st.isAnimatingJump ? 14 : 0;
    return Math.min(152, Math.max(72, 72 + stepFactor + livesLostFactor + jumpingBoost));
  }

  /**
   * Reproduce un latido cardíaco realista de doble golpe (LUB-DUB) con ganancia e intensidad
   * que aumentan a medida que el jugador avanza por los peldaños de cristal.
   */
  playHeartbeatLubDub() {
    if (!this.sfxEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const st = this.bridgeState;
      const stepProgress = st ? (st.currentStep / Math.max(1, st.totalSteps - 1)) : 0;
      const livesStress = st ? (3 - st.lives) * 0.25 : 0;
      const intensity = Math.min(1.45, 0.78 + stepProgress * 0.48 + livesStress);

      // Golpe 1: LUB (sístole ventricular profunda)
      const lubOsc = ctx.createOscillator();
      const lubSub = ctx.createOscillator();
      const lubFilter = ctx.createBiquadFilter();
      const lubGain = ctx.createGain();

      lubFilter.type = 'lowpass';
      lubFilter.frequency.setValueAtTime(115 + stepProgress * 35, now);
      lubFilter.Q.setValueAtTime(3.2, now);

      lubOsc.type = 'sine';
      lubOsc.frequency.setValueAtTime(64, now);
      lubOsc.frequency.exponentialRampToValueAtTime(28, now + 0.14);

      lubSub.type = 'triangle';
      lubSub.frequency.setValueAtTime(48, now);
      lubSub.frequency.exponentialRampToValueAtTime(22, now + 0.14);

      lubGain.gain.setValueAtTime(0.001, now);
      lubGain.gain.linearRampToValueAtTime(0.32 * intensity, now + 0.018);
      lubGain.gain.exponentialRampToValueAtTime(0.001, now + 0.155);

      lubOsc.connect(lubFilter);
      lubSub.connect(lubFilter);
      lubFilter.connect(lubGain);
      lubGain.connect(ctx.destination);

      lubOsc.start(now);
      lubSub.start(now);
      lubOsc.stop(now + 0.16);
      lubSub.stop(now + 0.16);

      // Golpe 2: DUB (cierre valvular aórtico/pulmonar 185ms después)
      const dubStart = now + 0.185;
      const dubOsc = ctx.createOscillator();
      const dubFilter = ctx.createBiquadFilter();
      const dubGain = ctx.createGain();

      dubFilter.type = 'lowpass';
      dubFilter.frequency.setValueAtTime(130 + stepProgress * 40, dubStart);
      dubFilter.Q.setValueAtTime(2.8, dubStart);

      dubOsc.type = 'sine';
      dubOsc.frequency.setValueAtTime(76, dubStart);
      dubOsc.frequency.exponentialRampToValueAtTime(32, dubStart + 0.115);

      dubGain.gain.setValueAtTime(0.001, dubStart);
      dubGain.gain.linearRampToValueAtTime(0.24 * intensity, dubStart + 0.015);
      dubGain.gain.exponentialRampToValueAtTime(0.001, dubStart + 0.125);

      dubOsc.connect(dubFilter);
      dubFilter.connect(dubGain);
      dubGain.connect(ctx.destination);

      dubOsc.start(dubStart);
      dubOsc.stop(dubStart + 0.13);

      // Animar el indicador visual de BPM en el HUD
      const bpmPill = document.getElementById('bridge-3d-bpm-pill');
      const bpmHeart = document.getElementById('bridge-3d-bpm-heart');
      if (bpmPill) {
        const bpm = this.getBridgeCurrentBPM();
        const textNode = bpmPill.querySelector('.bpm-val');
        if (textNode) textNode.textContent = `${bpm} BPM`;
      }
      if (bpmHeart) {
        bpmHeart.style.transform = 'scale(1.32)';
        setTimeout(() => {
          if (bpmHeart) bpmHeart.style.transform = 'scale(1)';
        }, 160);
      }
    } catch (e) {}
  }

  /**
   * Reproduce la música ambiental oscura de suspenso estilo Squid Game (ostinato menor + pad atmosférico)
   */
  playBridgeAmbientMusicStep() {
    if (!this.sfxEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const step = this.musicStepIndex || 0;
      this.musicStepIndex = (step + 1) % 16;

      // Escala menor armónica / ostinato de tensión (Do menor: C4, Eb4, G4, Ab4, G4, F4, Eb4, D4)
      const melodyNotes = [
        261.63, 311.13, 392.00, 415.30,
        392.00, 349.23, 311.13, 293.66,
        261.63, 311.13, 466.16, 415.30,
        392.00, 311.13, 293.66, 246.94
      ];
      const bassRoots = [65.41, 65.41, 51.91, 58.27]; // C2, C2, Ab1, Bb1

      // 1. Pad oscuro de fondo cada 4 tiempos
      if (step % 4 === 0) {
        const bassFreq = bassRoots[Math.floor(step / 4) % bassRoots.length];
        [bassFreq, bassFreq * 1.5, bassFreq * 2].forEach((freq, idx) => {
          const padOsc = ctx.createOscillator();
          const padFilter = ctx.createBiquadFilter();
          const padGain = ctx.createGain();

          padOsc.type = idx === 0 ? 'sawtooth' : 'triangle';
          padOsc.frequency.setValueAtTime(freq, now);

          padFilter.type = 'lowpass';
          padFilter.frequency.setValueAtTime(240, now);
          padFilter.frequency.linearRampToValueAtTime(390, now + 1.1);
          padFilter.frequency.linearRampToValueAtTime(190, now + 2.3);

          const maxGain = idx === 0 ? 0.048 : 0.026;
          padGain.gain.setValueAtTime(0.0001, now);
          padGain.gain.linearRampToValueAtTime(maxGain, now + 0.45);
          padGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.35);

          padOsc.connect(padFilter);
          padFilter.connect(padGain);
          padGain.connect(ctx.destination);

          padOsc.start(now);
          padOsc.stop(now + 2.4);
        });
      }

      // 2. Motivo melódico de caja musical / pizzicato tenso en cada tiempo
      const noteFreq = melodyNotes[step % melodyNotes.length];
      const pluckOsc = ctx.createOscillator();
      const pluckFilter = ctx.createBiquadFilter();
      const pluckGain = ctx.createGain();

      pluckOsc.type = 'triangle';
      pluckOsc.frequency.setValueAtTime(noteFreq, now);

      pluckFilter.type = 'lowpass';
      pluckFilter.frequency.setValueAtTime(1350, now);
      pluckFilter.frequency.exponentialRampToValueAtTime(360, now + 0.36);

      pluckGain.gain.setValueAtTime(0.001, now);
      pluckGain.gain.linearRampToValueAtTime(0.052, now + 0.015);
      pluckGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.42);

      pluckOsc.connect(pluckFilter);
      pluckFilter.connect(pluckGain);
      pluckGain.connect(ctx.destination);

      pluckOsc.start(now);
      pluckOsc.stop(now + 0.44);
    } catch (e) {}
  }

  startAmbientSound(mode = 'bridge') {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.chatterTimer) {
      clearInterval(this.chatterTimer);
      this.chatterTimer = null;
    }
    if (this.chatterHideTimer) {
      clearTimeout(this.chatterHideTimer);
      this.chatterHideTimer = null;
    }
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {}
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }

    if (mode === 'bridge') {
      // Bucle dinámico de latidos cardíacos que acelera según avanzas de peldaño
      const scheduleNextBeat = () => {
        if (this.currentMode !== 'bridge' || !this.bridgeState) return;
        const tab = document.getElementById('tab-arcade');
        const activeBridge = tab && !tab.classList.contains('hidden') &&
          this.bridgeState.isFullscreenOpen && !this.bridgeState.isGameOver && !this.bridgeState.isVictory;

        if (activeBridge && this.sfxEnabled) {
          this.playHeartbeatLubDub();
        }
        const bpm = this.getBridgeCurrentBPM();
        const nextDelayMs = Math.max(380, Math.round(60000 / bpm));
        this.heartbeatTimer = setTimeout(scheduleNextBeat, nextDelayMs);
      };
      scheduleNextBeat();

      // Bucle de música de ambientación tensa estilo Squid Game
      this.musicStepIndex = 0;
      this.musicTimer = setInterval(() => {
        const tab = document.getElementById('tab-arcade');
        if (!tab || tab.classList.contains('hidden') || !this.sfxEnabled) return;
        if (this.currentMode === 'bridge' && this.bridgeState && this.bridgeState.isFullscreenOpen && !this.bridgeState.isGameOver && !this.bridgeState.isVictory) {
          this.playBridgeAmbientMusicStep();
        }
      }, 580);
    } else if (mode === 'hangman') {
      this.ambientTimer = setInterval(() => {
        const tab = document.getElementById('tab-arcade');
        if (!tab || tab.classList.contains('hidden') || !this.sfxEnabled) return;
        if (this.currentMode === 'hangman' && this.hangmanState && !this.hangmanState.isSolved && !this.hangmanState.isFailed) {
          this.playTone('ecg_monitor');
        }
      }, 2200);
    }
  }

  // =========================================================================
  // MOTOR DE AUDIO SINTETIZADO PRO
  // =========================================================================
  playTone(type = 'click') {
    if (!this.sfxEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(195, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.25);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
        osc.start(now);
        osc.stop(now + 0.27);
      } else if (type === 'glass_step' || type === 'correct') {
        const thud = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thud.connect(thudGain);
        thudGain.connect(ctx.destination);
        thud.type = 'sine';
        thud.frequency.setValueAtTime(140, now);
        thud.frequency.exponentialRampToValueAtTime(52, now + 0.14);
        thudGain.gain.setValueAtTime(0.26, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        thud.start(now);
        thud.stop(now + 0.15);

        [783.99, 1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.34);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.34);
        });
      } else if (type === 'glass_shatter') {
        const bufferSize = Math.floor(ctx.sampleRate * 0.42);
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, now);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.41);
        whiteNoise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        whiteNoise.start(now);

        [1680, 1240, 880, 420].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.028);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.52);
          gain.gain.setValueAtTime(0.18, now + i * 0.028);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.start(now + i * 0.028);
          osc.stop(now + 0.55);
        });
      } else if (type === 'popup_open') {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.045);
          gain.gain.setValueAtTime(0.11, now + idx * 0.045);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.18);
          osc.start(now + idx * 0.045);
          osc.stop(now + idx * 0.045 + 0.18);
        });
      } else if (type === 'tension_pulse') {
        [58, 52].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          const start = now + idx * 0.22;
          osc.frequency.setValueAtTime(freq, start);
          osc.frequency.exponentialRampToValueAtTime(36, start + 0.16);
          gain.gain.setValueAtTime(0.09, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
          osc.start(start);
          osc.stop(start + 0.18);
        });
      } else if (type === 'ecg_monitor') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now);
        gain.gain.setValueAtTime(0.055, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'victory_fanfare') {
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          const st = now + idx * 0.075;
          osc.frequency.setValueAtTime(freq, st);
          gain.gain.setValueAtTime(0.22, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.42);
          osc.start(st);
          osc.stop(st + 0.42);
        });
      } else if (type === 'flatline') {
        [440, 392, 311.13].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          const st = now + idx * 0.15;
          osc.frequency.setValueAtTime(freq, st);
          gain.gain.setValueAtTime(0.18, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
          osc.start(st);
          osc.stop(st + 0.3);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.linearRampToValueAtTime(82, now + 0.32);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.start(now);
        osc.stop(now + 0.34);
      } else if (type === 'beep' || type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {}
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    localStorage.setItem('caces_sfx', this.sfxEnabled ? 'on' : 'off');
    if (!this.sfxEnabled) {
      try {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      } catch (e) {}
    } else {
      this.playTone('beep');
    }
    this.syncSoundToggleButtons();
    return this.sfxEnabled;
  }

  syncSoundToggleButtons() {
    document.querySelectorAll('.btn-arcade-sfx-toggle').forEach(btn => {
      btn.innerHTML = this.sfxEnabled
        ? `<span>🔊 Sonido</span>`
        : `<span class="text-rose-400">🔇 Mudo</span>`;
    });
  }

  getRankInfo(xp = this.xp) {
    const ranks = [
      { min: 0, title: 'Externo de Guardia', next: 1000 },
      { min: 1000, title: 'Interno Rotativo', next: 3500 },
      { min: 3500, title: 'Residente R1 de Choque', next: 8000 },
      { min: 8000, title: 'Jefe de Guardia MSP', next: 15000 },
      { min: 15000, title: 'Leyenda del Hpta CACES', next: 30000 }
    ];
    let current = ranks[0];
    for (const r of ranks) {
      if (xp >= r.min) current = r;
    }
    const progress = Math.min(100, Math.round(((xp - current.min) / (current.next - current.min)) * 100));
    return { ...current, progress };
  }

  addXP(amount, isCorrectStreak = true, triggerToast = true) {
    this.xp += amount;
    if (isCorrectStreak) {
      this.streak += 1;
      const bestStreak = parseInt(localStorage.getItem('caces_best_streak') || '0', 10);
      if (this.streak > bestStreak) {
        localStorage.setItem('caces_best_streak', this.streak.toString());
      }
      if (triggerToast) {
        this.triggerStreakToast(this.streak);
      }
    } else {
      this.streak = 0;
    }

    localStorage.setItem('caces_xp', this.xp.toString());
    localStorage.setItem('caces_streak', this.streak.toString());
    this.updateHUD();
  }

  triggerTutorCelebration() {
    const praises = [
      { title: '¡Qué crack!', msg: 'Diagnóstico certero al primer vistazo (+10 XP).' },
      { title: '¡Qué pro!', msg: 'Lectura clínica impecable según protocolo MSP.' },
      { title: '¡Ojo Clínico!', msg: 'No caíste en el distractor del CACES. ¡Sigue así!' },
      { title: '¡Bisturí de Precisión!', msg: 'Conducta terapéutica de primera línea.' }
    ];
    const pick = praises[Math.floor(Math.random() * praises.length)];
    this.showFloatingStreakNotification(SVG_ICONS.bolt, pick.title, pick.msg, Math.max(1, this.streak));
  }

  triggerStreakToast(streak) {
    if (streak < 2) return;

    let title = '';
    let msg = '';
    let svgIcon = SVG_ICONS.bolt;

    if (streak === 2) {
      svgIcon = SVG_ICONS.pulse;
      title = '¡Calentando Motores!';
      msg = '2 diagnósticos certeros seguidos. ¡Sigue así!';
    } else if (streak === 3) {
      svgIcon = SVG_ICONS.bolt;
      title = '¡Qué pro!';
      msg = 'Mano quirúrgica de precisión. Racha de 3 aciertos.';
    } else if (streak === 4) {
      svgIcon = SVG_ICONS.crosshair;
      title = '¡Imparable!';
      msg = 'Ese R1 tiembla ante tu agudeza clínica.';
    } else if (streak === 5) {
      svgIcon = SVG_ICONS.award;
      title = '¡Qué crack!';
      msg = 'Diagnóstico certero de Jefe de Guardia. Racha de 5.';
    } else if (streak >= 10 && streak % 5 === 0) {
      svgIcon = SVG_ICONS.award;
      title = `¡Modo Leyenda CACES! (x${streak})`;
      msg = `${streak} aciertos consecutivos sin fallar.`;
    } else {
      const randomTitles = ['¡Qué crack!', '¡Qué pro!', '¡Ojo Clínico!', '¡Guardia Impecable!'];
      title = `${randomTitles[streak % randomTitles.length]} (Racha x${streak})`;
      msg = 'Manteniendo el ritmo de habilitación profesional.';
    }

    if (window.confetti && (streak === 3 || streak % 5 === 0)) {
      window.confetti({
        particleCount: Math.min(80, 30 + streak * 3),
        spread: 60,
        origin: { y: 0.8 }
      });
    }

    this.showFloatingStreakNotification(svgIcon, title, msg, streak);
  }

  showFloatingStreakNotification(svgIcon, title, msg, streak) {
    let container = document.getElementById('streak-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'streak-toast-container';
      container.className = 'fixed top-20 right-4 sm:right-8 z-50 flex flex-col gap-2 pointer-events-none transition-all';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto transform translate-y-2 opacity-0 transition-all duration-300 ease-out flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-slate-900/95 text-white border border-emerald-500/70 shadow-2xl shadow-emerald-500/20 backdrop-blur-md max-w-sm';
    toast.innerHTML = `
      <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center shrink-0">
        ${svgIcon}
      </div>
      <div class="space-y-0.5">
        <div class="flex items-center gap-2">
          <span class="font-display font-extrabold text-sm sm:text-base text-emerald-400 tracking-wide">${title}</span>
          <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold">x${streak}</span>
        </div>
        <p class="text-xs sm:text-sm text-slate-300 leading-snug">${msg}</p>
      </div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('-translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  }

  saveHighScore(score) {
    if (score > this.highScoreBlitz) {
      this.highScoreBlitz = score;
      localStorage.setItem('caces_blitz_high', score.toString());
    }
    this.updateHUD();
  }

  updateHUD() {
    const rank = this.getRankInfo();
    const arcStats = Storage.getArcadeStats();
    const bestGlassStreak = Math.max(arcStats.bridgeBestStreak || 0, arcStats.bridgeBestStep || 0);

    const elStreak = document.getElementById('hud-streak');
    const elRank = document.getElementById('hud-rank-title');
    const elXp = document.getElementById('hud-xp-badge');
    const arcBestStreak = document.getElementById('arcade-best-bridge-streak');
    const arcTotalBridges = document.getElementById('arcade-total-bridges');

    if (elStreak) elStreak.textContent = this.streak;
    if (elRank) elRank.textContent = rank.title;
    if (elXp) elXp.textContent = `${this.xp} XP`;
    if (arcBestStreak) arcBestStreak.textContent = `${bestGlassStreak} vidrios`;
    if (arcTotalBridges) arcTotalBridges.textContent = `${arcStats.bridgeWins || 0}`;
  }

  stopAllLoops() {
    this.setExternalPageChromeHidden(false);
    if (this.blitzInterval) {
      clearInterval(this.blitzInterval);
      this.blitzInterval = null;
    }
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.activeRaf) {
      cancelAnimationFrame(this.activeRaf);
      this.activeRaf = null;
    }
    this.activeTimers.forEach(t => clearInterval(t));
    this.activeTimers = [];
    if (this.activeKeyHandler) {
      window.removeEventListener('keydown', this.activeKeyHandler);
      this.activeKeyHandler = null;
    }
  }

  // =========================================================================
  // INICIALIZACIÓN DEL HUB ARCADE (2 JUEGOS + TOP RANKING GOOGLE)
  // =========================================================================
  async initArcade(questionsPool = []) {
    if (Array.isArray(questionsPool) && questionsPool.length > 0) {
      this.questionsPool = questionsPool;
    }
    this.stopAllLoops();
    this.updateHUD();
    this.renderModeSelectorCards();
    this.renderMode(this.currentMode);
    this.renderArcadeLeaderboard();
  }

  renderModeSelectorCards() {
    const gridContainer = document.getElementById('arcade-mode-selector-grid') || document.querySelector('.arcade-mode-btn')?.parentElement;
    if (!gridContainer) return;

    const arcStats = Storage.getArcadeStats();
    gridContainer.className = 'grid grid-cols-2 gap-2 sm:gap-3';

    const modes = [
      {
        id: 'bridge',
        badge: '○ △ □ • POV 3D SQUID GAME',
        badgeClass: 'bg-rose-500/15 text-rose-500 border border-rose-500/30',
        activeBorder: 'border-2 border-rose-500 ring-2 ring-rose-500/20',
        imgSrc: 'assets/juego-puente-cristal.png',
        imgWrapClass: 'bg-slate-950 border border-rose-500/30',
        imgClass: 'w-full h-full object-cover',
        title: '1. El Puente de Cristal (#456)',
        shortTitle: 'Puente de Cristal',
        desc: 'Pantalla completa inmersiva en POV primera persona con los 3 jugadores (#456, #058, #100).',
        statsLabel: `Racha Máx: ${Math.max(arcStats.bridgeBestStreak || 0, arcStats.bridgeBestStep || 0)} • Puentes: ${arcStats.bridgeWins || 0}`
      },
      {
        id: 'hangman',
        badge: 'PALABRA OCULTA MSP',
        badgeClass: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
        activeBorder: 'border-2 border-emerald-500 ring-2 ring-emerald-500/20',
        imgSrc: 'assets/juego-ahorcado.png',
        imgWrapClass: 'bg-emerald-100/95 dark:bg-emerald-950/60 border border-emerald-500/30 p-1 sm:p-1.5',
        imgClass: 'w-full h-full object-contain',
        title: '2. Ahorcado Clínico MSP',
        shortTitle: 'Ahorcado MSP',
        desc: 'Adivina el diagnóstico, fármaco de elección o signo clínico letra por letra.',
        statsLabel: `Palabras: ${arcStats.hangmanWordsSolved} • Racha: x${arcStats.hangmanBestStreak || 0}`
      }
    ];

    gridContainer.innerHTML = modes.map(m => {
      const isActive = this.currentMode === m.id;
      return `
        <button type="button" data-game-mode="${m.id}" class="arcade-mode-btn bto-card text-left p-2 sm:p-3 rounded-2xl bg-white dark:bg-bto-panel transition-all flex items-center gap-2.5 sm:gap-3.5 group ${
          isActive ? m.activeBorder : 'hover:border-slate-400 dark:hover:border-slate-600'
        }">
          <div class="w-10 h-11 sm:w-14 sm:h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-md group-hover:scale-[1.03] transition-transform ${m.imgWrapClass}">
            <img src="${m.imgSrc}" alt="${m.title}" class="${m.imgClass}">
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-between space-y-0.5">
            <div class="flex items-center justify-between gap-1.5">
              <span class="hidden sm:inline-block font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-md truncate ${m.badgeClass}">${m.badge}</span>
              <span class="font-mono text-[10px] sm:text-xs font-bold shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400'}">${isActive ? '● ENTRAR FULLSCREEN' : 'JUGAR →'}</span>
            </div>
            <h3 class="font-display font-extrabold text-xs sm:text-base text-slate-900 dark:text-white leading-tight truncate">${m.title}</h3>
            <div class="font-mono text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-300 truncate">
              ${m.statsLabel}
            </div>
          </div>
        </button>
      `;
    }).join('');

    gridContainer.querySelectorAll('.arcade-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedMode = btn.getAttribute('data-game-mode') || 'bridge';
        this.currentMode = selectedMode;
        this.leaderboardTab = selectedMode === 'hangman' ? 'hangman' : 'streak';
        this.playTone('beep');
        this.renderModeSelectorCards();
        this.renderMode(selectedMode);
        this.renderArcadeLeaderboard();
      });
    });
  }

  renderMode(mode) {
    this.stopAllLoops();
    if (mode === 'hangman') {
      this.startHangmanGame();
    } else {
      this.currentMode = 'bridge';
      this.startGlassBridgeGame();
    }
  }

  // =========================================================================
  // JUEGO 1: EL PUENTE DE CRISTAL 3D (FULLSCREEN PURO + POV DEL QUE SALTA)
  // =========================================================================
  getGlassBridgeQuestions(count = 12) {
    const fallbackQuestions = [
      {
        id: 'sq_1',
        especialidad: 'Ginecología y Obstetricia',
        subtema: 'Clave Azul MSP',
        enunciado: 'Gestante de 34 semanas ingresa con PA 170/115 mmHg, cefalea holocraneana severa y escotomas. Se activa Clave Azul.',
        pregunta: '¿Cuál es la dosis de impregnación de Sulfato de Magnesio para prevenir eclampsia según protocolo MSP?',
        opciones: [
          { id: 'A', texto: '4 gramos IV diluidos en 20 minutos' },
          { id: 'B', texto: '6 gramos IV en bolo directo rápido' },
          { id: 'C', texto: '2 gramos IV en 60 minutos' },
          { id: 'D', texto: '10 gramos IM en cada glúteo' }
        ],
        correcta: 'A',
        perla_caces: 'En Preeclampsia con signos de gravedad la impregnación es 4 g IV en 20 min + mantenimiento 1 g/h. En Eclampsia convulsiva es 6 g IV en 20 min + 2 g/h.',
        fuente: 'GPC Trastornos Hipertensivos del Embarazo - MSP Ecuador'
      },
      {
        id: 'sq_2',
        especialidad: 'Pediatría',
        subtema: 'Esquema PAI MSP',
        enunciado: 'Recién nacido a término de 3,200 g en alojamiento conjunto a las 6 horas de vida sin contraindicaciones.',
        pregunta: '¿Qué vacunas deben administrarse obligatoriamente antes de las 24 horas de vida según el MSP?',
        opciones: [
          { id: 'A', texto: 'BCG intradérmica + Hepatitis B pediátrica intramuscular' },
          { id: 'B', texto: 'BCG + Rotavirus + fIPV' },
          { id: 'C', texto: 'Solo Hepatitis B intramuscular' },
          { id: 'D', texto: 'Pentavalente + Neumococo' }
        ],
        correcta: 'A',
        perla_caces: 'Todo recién nacido recibe BCG (previene tuberculosis meníngea y miliar) y Hepatitis B monodosis en las primeras 24 horas.',
        fuente: 'Manual de Normas del Programa Ampliado de Inmunizaciones (PAI) - MSP'
      },
      {
        id: 'sq_3',
        especialidad: 'Cirugía General',
        subtema: 'Trauma Torácico',
        enunciado: 'Paciente apuñalado en región precordial ingresa con PA 70/40 mmHg, ingurgitación yugular marcada y ruidos cardíacos hipofonéticos.',
        pregunta: '¿Cuál es el diagnóstico clínico inmediato que define esta Triada de Beck?',
        opciones: [
          { id: 'A', texto: 'Taponamiento Cardíaco Agudo' },
          { id: 'B', texto: 'Neumotórax a Tensión' },
          { id: 'C', texto: 'Hemotórax Masivo' },
          { id: 'D', texto: 'Contusión Miocárdica Simple' }
        ],
        correcta: 'A',
        perla_caces: 'Triada de Beck = Hipotensión + Ruidos cardíacos velados + Ingurgitación yugular (Taponamiento Cardíaco).',
        fuente: 'ATLS 10ª Edición - Trauma Torácico'
      },
      {
        id: 'sq_4',
        especialidad: 'Medicina Interna',
        subtema: 'Toxicología',
        enunciado: 'Trabajador agrícola ingresa con sialorrea profusa, broncorrea, miosis puntiforme, bradicardia y fasciculaciones musculares.',
        pregunta: '¿Cuál es el fármaco de primera línea para revertir los síntomas muscarínicos que amenazan la vida?',
        opciones: [
          { id: 'A', texto: 'Atropina IV en dosis progresivas hasta secar secreciones' },
          { id: 'B', texto: 'Flumazenil 0.5 mg IV' },
          { id: 'C', texto: 'Naloxona 2 mg IV' },
          { id: 'D', texto: 'N-Acetilcisteína en infusión' }
        ],
        correcta: 'A',
        perla_caces: 'Intoxicación por Organofosforados (síndrome colinérgico): Atropinización inmediata evaluando la desaparición de broncorrea.',
        fuente: 'Protocolo de Manejo de Intoxicaciones Agudas - MSP'
      },
      {
        id: 'sq_5',
        especialidad: 'Ginecología y Obstetricia',
        subtema: 'Clave Roja MSP',
        enunciado: 'Puérpera inmediata tras parto vaginal presenta sangrado activo > 1,000 ml, taquicardia de 128 lpm y útero blando supraumbilical.',
        pregunta: '¿Cuál es la causa más frecuente de esta hemorragia posparto y su fármaco uterotónico de primera elección?',
        opciones: [
          { id: 'A', texto: 'Atonía uterina — Oxitocina IV' },
          { id: 'B', texto: 'Retención placentaria — Misoprostol sublingual único' },
          { id: 'C', texto: 'Coagulopatía — Ácido tranexámico exclusivo' },
          { id: 'D', texto: 'Inversión uterina — Ergometrina en hipertensas' }
        ],
        correcta: 'A',
        perla_caces: 'La Atonía Uterina (Tono) causa el 70% de las HPP. El uterotónico de primera línea es Oxitocina + masaje uterino bimanual + Ácido Tranexámico 1 g IV.',
        fuente: 'GPC Hemorragia Posparto / Score MAMÁ y Claves Obstétricas MSP'
      }
    ];

    const pool = Array.isArray(this.questionsPool) && this.questionsPool.length >= count
      ? [...this.questionsPool]
      : [...fallbackQuestions];

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selected = [];
    for (let i = 0; i < count; i++) {
      selected.push(pool[i % pool.length]);
    }
    return selected;
  }

  laneIndexForOption(optId) {
    const map = { A: 0, B: 1, C: 2, D: 3 };
    return map[optId] !== undefined ? map[optId] : 0;
  }

  optionForLaneIndex(laneIdx) {
    return ['A', 'B', 'C', 'D'][laneIdx] || 'A';
  }

  getSquadOrderForLives(lives) {
    if (lives >= 3) return ['456', '058', '100'];
    if (lives === 2) return ['058', '100'];
    if (lives === 1) return ['100'];
    return [];
  }

  getQuestionOptionPercentages(q) {
    if (typeof Storage.getQuestionOptionStats === 'function' && q?.id) {
      const stats = Storage.getQuestionOptionStats(q.id);
      if (stats && stats.percentages && typeof stats.percentages.A === 'number') {
        return stats.percentages;
      }
    }
    const seedStr = String(q?.id || q?.enunciado || 'caces');
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) | 0;
    }
    const absH = Math.abs(hash);
    const correctKey = q?.correcta || 'A';
    const correctPct = 58 + (absH % 22);
    const rem = 100 - correctPct;
    const d1 = Math.max(4, Math.round(rem * 0.52));
    const d2 = Math.max(3, Math.round(rem * 0.31));
    const d3 = Math.max(1, rem - d1 - d2);
    const wrongPcts = [d1, d2, d3];
    const result = {};
    let wIdx = 0;
    ['A', 'B', 'C', 'D'].forEach(letter => {
      if (letter === correctKey) {
        result[letter] = correctPct;
      } else {
        result[letter] = wrongPcts[wIdx++] || 5;
      }
    });
    return result;
  }

  renderOptionPercentagePill(pct) {
    const safePct = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    return `
      <span class="caces-pct-pill" tabindex="0" aria-label="Porcentaje de personas que escogieron esta opción: ${safePct}%">
        <span>${safePct}%</span>
        <span class="caces-pct-info-icon" aria-hidden="true">i</span>
        <span class="caces-pct-tooltip" role="tooltip">Porcentaje de médicos que escogieron esta opción</span>
      </span>
    `;
  }

  startGlassBridgeGame(carryOver = null) {
    this.stopAllLoops();
    const totalSteps = 12;
    const bridgeLevel = carryOver ? (carryOver.bridgeLevel + 1) : 1;
    const globalStepOffset = (bridgeLevel - 1) * totalSteps;
    const lives = carryOver ? carryOver.lives : 3;
    const squadNums = this.getSquadOrderForLives(lives);
    const leadNum = squadNums[0] || '456';
    const now = performance.now();

    this.bridgeState = {
      totalSteps,
      bridgeLevel,
      globalStepOffset,
      currentStep: 0,
      lives,
      score: carryOver ? carryOver.score : 0,
      streak: carryOver ? carryOver.streak : 0,
      questions: this.getGlassBridgeQuestions(totalSteps),
      tiles: Array.from({ length: totalSteps }, () => ['intact', 'intact', 'intact', 'intact']),
      safeLaneHistory: {},
      brokenOptionsInCurrentStep: new Set(),
      hintRevealedInCurrentStep: false,
      shieldActiveInCurrentStep: false,
      awaitingNextStep: false,
      isAnimatingJump: false,
      lastJumpOutcome: null,
      lastChosenOptionId: null,
      lastFallenPlayerNum: null,
      isGameOver: false,
      isVictory: false,
      isFullscreenOpen: true,
      powerups: {
        glassmakerEye: carryOver ? Math.min(3, (carryOver.powerups?.glassmakerEye || 0) + 1) : 2,
        marbleHint: carryOver ? Math.min(3, (carryOver.powerups?.marbleHint || 0) + 1) : 2,
        temperedShield: carryOver ? Math.max(1, carryOver.powerups?.temperedShield || 0) : 1
      },
      anim: {
        // Secuencia de Cámara:
        // 'INTRO_SQUAD' -> Plano inicial mostrando a los 3 jugadores (#456, #058, #100)
        // 'POV_READY'   -> Primera Persona (POV) del jugador que va a saltar
        // 'POV_JUMPING' -> Saltando y bajando la mirada hacia el piso para ver si está templado
        // 'POV_FLOOR_CHECK_SAFE' -> Mirando el piso templado firme antes de levantar la vista al frente
        // 'POV_FLOOR_CRACK'      -> Mirando el piso agrietarse antes de caer
        // 'POV_FALLING'          -> Cayendo al vacío en primera persona
        // 'POV_SWITCH_BACK'      -> Pasando al POV del jugador de atrás (#058 o #100)
        // 'POV_RELAY_JUMP'       -> El jugador de atrás salta en su POV al vidrio templado seguro
        camMode: 'INTRO_SQUAD',
        introStartTime: now,
        introDuration: 2050,
        statusBannerText: '🎬 ESCUADRÓN LISTO: #456 • #058 • #100',

        // Estado espacial de la cámara POV en primera persona
        cameraRow: -2.15,
        cameraLane: 1.5,
        cameraY: 1.48,
        cameraPitch: 0.08, // >0 mira hacia abajo al piso; 0.14 mira al frente; <0 mira arriba al caer
        cameraRoll: 0,

        // Posición lógica del jugador activo en POV
        playerNumber: leadNum,
        playerRow: -0.52,
        playerLane: 1.5,

        // Interpolación de salto en POV
        jumpStartTime: 0,
        jumpDuration: 520,
        jumpStartRow: -0.52,
        jumpStartLane: 1.5,
        jumpTargetRow: 0,
        jumpTargetLane: 1.5,
        jumpWillBreak: false,
        jumpChosenId: null,

        // Tiempos de sub-fases cinemáticas
        phaseStartTime: now,
        phaseDuration: 2050,

        cracks: [],
        sparks: [],
        shards: [],
        shockwaves: [],
        dustMotes: Array.from({ length: 26 }, () => ({
          x: (Math.random() - 0.5) * 7,
          y: -1.6 + Math.random() * 4.0,
          z: -1 + Math.random() * 14,
          r: 0.8 + Math.random() * 1.7,
          speed: 0.002 + Math.random() * 0.004,
          phase: Math.random() * Math.PI * 2
        })),
        screenShake: 0,
        hoveredLane: -1,
        tileHitRegions: [],
        activeChatter: null
      }
    };

    this.setExternalPageChromeHidden(true);
    this.renderGlassBridgeLayout();
    this.startGlassBridgeRenderLoop();
    this.startAmbientSound('bridge');
    this.startBackPlayersChatterLoop();
  }

  continueBridgeStreakRound() {
    const st = this.bridgeState;
    if (!st) return;
    this.startGlassBridgeGame({
      bridgeLevel: st.bridgeLevel || 1,
      lives: Math.max(1, st.lives),
      score: st.score,
      streak: st.streak,
      powerups: st.powerups
    });
  }

  /**
   * Inicia el bucle de diálogo en vivo de los jugadores de atrás (#058 y #100),
   * quienes te presionan, se burlan o intentan engañarte para que saltes a un vidrio falso.
   */
  startBackPlayersChatterLoop() {
    if (this.chatterTimer) {
      clearInterval(this.chatterTimer);
      this.chatterTimer = null;
    }
    // Primer comentario apenas termina el plano inicial de los 3 jugadores
    setTimeout(() => {
      if (this.currentMode === 'bridge' && this.bridgeState && this.bridgeState.isFullscreenOpen &&
          !this.bridgeState.isAnimatingJump && !this.bridgeState.awaitingNextStep && !this.bridgeState.isGameOver && !this.bridgeState.isVictory) {
        this.triggerBackPlayerTaunt('start_step');
      }
    }, 2200);

    // Si el jugador tarda en saltar, los de atrás le gritan que se apure cada 8.5 segundos
    this.chatterTimer = setInterval(() => {
      if (this.currentMode !== 'bridge' || !this.bridgeState) return;
      const st = this.bridgeState;
      if (!st.isFullscreenOpen || st.isAnimatingJump || st.awaitingNextStep || st.isGameOver || st.isVictory) return;
      if (st.anim.camMode === 'INTRO_SQUAD') return;
      this.triggerBackPlayerTaunt('impatient');
    }, 8500);
  }

  /**
   * Sintetiza la voz hablada del jugador de atrás (#058 o #100) usando Web Speech API (en español)
   * acompañada de una cadencia vocal sintetizada para que siempre suene incluso en móviles.
   */
  speakBackPlayerLine(speakerNum, text) {
    if (!this.sfxEnabled || !text) return;

    // 1. Efecto corto de radio / murmullo vocal por Web Audio API
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const baseFreq = speakerNum === '058' ? 165 : 210;
      [0, 0.08, 0.16].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq + (idx % 2 === 0 ? 18 : -12), now + offset);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(920, now + offset);
        gain.gain.setValueAtTime(0.035, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.065);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.07);
      });
    } catch (e) {}

    // 2. Voz hablada real con window.speechSynthesis (TTS en Español)
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanSpeechText = text.replace(/[#*«»"“”]/g, '');
        const utter = new SpeechSynthesisUtterance(cleanSpeechText);
        utter.lang = 'es-EC';
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        const esVoice =
          voices.find(v => /es[-_](EC|CO|MX|PE|AR|419|US|ES)/i.test(v.lang)) ||
          voices.find(v => /^es/i.test(v.lang));
        if (esVoice) utter.voice = esVoice;

        // Tono y velocidad distintos para diferenciar a #058 y #100
        if (speakerNum === '058') {
          utter.pitch = 0.92;
          utter.rate = 1.08;
        } else {
          utter.pitch = 1.14;
          utter.rate = 1.12;
        }
        utter.volume = 0.95;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {}
  }

  /**
   * Genera y muestra en pantalla (además de hablarlo en voz alta) lo que gritan los jugadores de atrás (#058 y #100)
   */
  triggerBackPlayerTaunt(reason = 'step') {
    const st = this.bridgeState;
    if (!st || !st.isFullscreenOpen || st.isGameOver || st.isVictory) return;

    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)] || {};
    const correctOpt = q.correcta || 'A';
    const allOpts = ['A', 'B', 'C', 'D'];
    const wrongIntact = allOpts.filter(letter => letter !== correctOpt && !st.brokenOptionsInCurrentStep.has(letter));
    // Preferir la opción 'B' cuando 'B' es incorrecta para que te engañen diciendo "¡Sáltale a la B!"
    const trapLetter = wrongIntact.includes('B')
      ? 'B'
      : (wrongIntact[Math.floor(Math.random() * wrongIntact.length)] || 'B');

    // Determinar quién habla desde atrás según las vidas actuales
    let speakerNum = '058';
    let speakerRole = 'GRITÁNDOTE DESDE ATRÁS';
    if (st.lives >= 3) {
      speakerNum = Math.random() < 0.55 ? '058' : '100';
      speakerRole = speakerNum === '058' ? 'DETRÁS DE TI (#058)' : 'DESDE EL FONDO (#100)';
    } else if (st.lives === 2) {
      speakerNum = '100';
      speakerRole = 'DETRÁS DE TI (#100)';
    } else {
      speakerNum = '100';
      speakerRole = 'ÚLTIMO EN PIE (#100 EN PÁNICO)';
    }

    let pool = [];
    if (reason === 'fell') {
      pool = [
        {
          tag: '😱 RELEVO EN PÁNICO',
          color: 'rose',
          text: `«¡Sabía que no era esa! Ahora me toca saltar a mí... No sé si prefiero caer antes de dar el CACES.»`
        },
        {
          tag: '😱 RELEVO EN PÁNICO',
          color: 'rose',
          text: `«¡Se cayó #${st.lastFallenPlayerNum || '456'}! Por favor no falles ahora, que ya nos quedamos sin escudo humano.»`
        }
      ];
    } else if (st.lives === 1) {
      pool = [
        {
          tag: '😰 NERVIOS AL LÍMITE',
          color: 'amber',
          text: `«Por favor no falles... No sé si prefiero caer de este puente antes de dar el CACES.»`
        },
        {
          tag: '🔥 PRESIÓN CACES',
          color: 'cyan',
          text: `«¡Concéntrate #100! Eso lo sabe hasta la señora de las tortillas, no te puedes caer aquí.»`
        },
        {
          tag: '⏳ APÚRATE',
          color: 'rose',
          text: `«¡Salta ya! Mi abuela hubiera saltado más rápido y ya estoy solo en este puente.»`
        }
      ];
    } else {
      pool = [
        {
          tag: '😈 TRAMPA PARA HACERTE CAER',
          color: 'rose',
          text: `«¡Sáltale a la ${trapLetter} sin miedo! Te juro por la GPC que es la ${trapLetter}... (si te caes me abres camino).»`
        },
        {
          tag: '😈 SABOTAJE DESDE ATRÁS',
          color: 'rose',
          text: `«¡Oye #${st.anim.playerNumber}, sáltale a la B de una! Si el vidrio aguanta te sigo, y si te caes ya sé cuál no pisar.»`
        },
        {
          tag: '⏳ IMPACIENCIA',
          color: 'amber',
          text: `«¡Apúrate pues! Mi abuela hubiera saltado más rápido que tú.»`
        },
        {
          tag: '😂 BURLA CACES',
          color: 'cyan',
          text: `«¡Cómo vas a dudar en esa pregunta! ¡Eso lo sabe hasta la señora de las tortillas!»`
        },
        {
          tag: '🙏 SÚPLICA DESESPERADA',
          color: 'emerald',
          text: `«¡Por favor no falles! Si tú te caes el siguiente en saltar soy yo y no leí ese tema.»`
        },
        {
          tag: '💀 CRISIS EXISTENCIAL CACES',
          color: 'amber',
          text: `«No sé si prefiero caer de este puente ahorita mismo antes de tener que dar el CACES...»`
        },
        {
          tag: '😈 TRAMPA CLÍNICA',
          color: 'rose',
          text: `«¡Métele a la ${trapLetter}, hazme caso! En mi internado siempre daban la ${trapLetter}... ¡Salta ya!»`
        },
        {
          tag: '⏳ APÚRATE',
          color: 'amber',
          text: `«¡Muévete #${st.anim.playerNumber}, que te demoras más que asignación de plaza rural! ¡Mi abuela ya habría cruzado!»`
        }
      ];
    }

    let pickIdx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && pickIdx === this.lastChatterIndex) {
      pickIdx = (pickIdx + 1) % pool.length;
    }
    this.lastChatterIndex = pickIdx;
    const chosen = pool[pickIdx];

    st.anim.activeChatter = {
      speakerNum,
      speakerRole,
      tag: chosen.tag,
      color: chosen.color,
      text: chosen.text,
      timestamp: performance.now()
    };

    this.renderBackPlayerChatterBanner();
    this.speakBackPlayerLine(speakerNum, chosen.text);

    if (this.chatterHideTimer) {
      clearTimeout(this.chatterHideTimer);
    }
    this.chatterHideTimer = setTimeout(() => {
      if (this.bridgeState && this.bridgeState.anim) {
        const bubble = document.getElementById('bridge-back-player-chatter');
        if (bubble) {
          bubble.classList.add('opacity-0', 'translate-y-1');
        }
      }
    }, 6800);
  }

  /**
   * Actualiza en pantalla el globo de diálogo de los jugadores de atrás (#058 / #100)
   */
  renderBackPlayerChatterBanner() {
    const wrap = document.getElementById('bridge-back-player-chatter-wrap');
    const st = this.bridgeState;
    if (!wrap || !st) return;

    const chat = st.anim?.activeChatter;
    if (!chat || st.awaitingNextStep || st.isGameOver || st.isVictory) {
      wrap.innerHTML = '';
      return;
    }

    const borderMap = {
      rose: 'border-rose-500/80 bg-slate-950/92 text-rose-200',
      amber: 'border-amber-400/80 bg-slate-950/92 text-amber-200',
      cyan: 'border-cyan-400/80 bg-slate-950/92 text-cyan-200',
      emerald: 'border-emerald-400/80 bg-slate-950/92 text-emerald-200'
    };
    const badgeMap = {
      rose: 'bg-rose-500 text-white',
      amber: 'bg-amber-400 text-slate-950',
      cyan: 'bg-cyan-400 text-slate-950',
      emerald: 'bg-emerald-400 text-slate-950'
    };
    const cls = borderMap[chat.color] || borderMap.amber;
    const badgeCls = badgeMap[chat.color] || badgeMap.amber;

    wrap.innerHTML = `
      <div id="bridge-back-player-chatter" class="pointer-events-auto max-w-xl mx-auto px-3 py-2 rounded-2xl border-2 ${cls} shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-2.5">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-emerald-800/90 border border-emerald-400/60 flex flex-col items-center justify-center shrink-0 shadow-inner">
            <span class="font-mono text-[8px] text-emerald-200 leading-none">JUGADOR</span>
            <span class="font-mono text-xs font-black text-white leading-tight">#${chat.speakerNum}</span>
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span class="px-1.5 py-0.2 rounded ${badgeCls} font-mono text-[9px] font-black uppercase">${chat.tag}</span>
              <span class="font-mono text-[9px] text-slate-300 font-bold uppercase truncate">🗣️ ${chat.speakerRole}</span>
              <span class="inline-flex items-end gap-0.5 h-2.5 ml-0.5" aria-hidden="true">
                <span class="w-0.5 h-2.5 bg-emerald-400 animate-pulse"></span>
                <span class="w-0.5 h-1.5 bg-emerald-400 animate-pulse"></span>
                <span class="w-0.5 h-2 bg-emerald-400 animate-pulse"></span>
              </span>
            </div>
            <p class="font-display font-bold text-xs sm:text-sm text-white leading-snug">
              ${chat.text}
            </p>
          </div>
        </div>
        <button type="button" id="btn-replay-chatter" class="px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-[10px] font-mono font-bold text-cyan-300 shrink-0 cursor-pointer active:scale-95" title="Escuchar otra frase de los jugadores de atrás">
          🗣️ Otra
        </button>
      </div>
    `;

    wrap.querySelector('#btn-replay-chatter')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.triggerBackPlayerTaunt('manual');
    });
  }

  /**
   * Sale del modo pantalla completa cuando el usuario pulsa "✕ Salir"
   * y restaura la vista normal con el Ranking de Juegos.
   */
  exitBridgeFullscreen() {
    const st = this.bridgeState;
    if (st) {
      st.isFullscreenOpen = false;
    }
    this.setExternalPageChromeHidden(false);
    this.playTone('beep');
    this.renderGlassBridgeLayout();
    this.renderArcadeLeaderboard();
  }

  reopenBridgeFullscreen() {
    const st = this.bridgeState;
    if (!st) {
      this.startGlassBridgeGame();
      return;
    }
    st.isFullscreenOpen = true;
    this.setExternalPageChromeHidden(true);
    this.playTone('popup_open');
    this.renderGlassBridgeLayout();
  }

  renderGlassBridgeLayout() {
    const stage = document.getElementById('arcade-stage');
    if (!stage || !this.bridgeState) return;
    const st = this.bridgeState;
    const arcStats = Storage.getArcadeStats();
    const maxGlassStreak = Math.max(arcStats.bridgeBestStreak || 0, arcStats.bridgeBestStep || 0, st.streak);

    // Si el usuario salió con el botón "✕ Salir", mostrar tarjeta en el Hub y permitir ver el Ranking
    if (!st.isFullscreenOpen) {
      this.setExternalPageChromeHidden(false);
      stage.innerHTML = `
        <div class="p-5 sm:p-7 rounded-3xl bg-slate-950 text-white border-2 border-rose-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="space-y-1.5 text-center sm:text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-black">
              ○ △ □ • EL PUENTE DE CRISTAL #456 (PAUSADO EN PELDAÑO ${st.globalStepOffset + st.currentStep + 1})
            </div>
            <h3 class="font-display font-extrabold text-lg sm:text-xl text-white">
              Modo Inmersivo en Pantalla Completa (${st.lives} ${st.lives === 1 ? 'jugador vivo' : 'jugadores vivos'})
            </h3>
            <p class="font-mono text-xs text-slate-400">
              Racha actual: <b class="text-emerald-400">${st.streak} vidrios</b> • Récord Máx: <b class="text-amber-400">${maxGlassStreak} vidrios</b> • Puentes logrados: <b class="text-emerald-400">${arcStats.bridgeWins || 0}</b>
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <button type="button" id="btn-reopen-bridge-fs" class="bto-btn px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-emerald-500 hover:from-rose-400 hover:to-emerald-400 text-slate-950 font-display font-extrabold text-xs sm:text-sm border-transparent shadow-lg cursor-pointer">
              ▶ Volver al Juego (Pantalla Completa)
            </button>
            <button type="button" id="btn-new-bridge-fs" class="bto-btn px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs cursor-pointer">
              Reiniciar (#456)
            </button>
          </div>
        </div>
      `;
      stage.querySelector('#btn-reopen-bridge-fs')?.addEventListener('click', () => this.reopenBridgeFullscreen());
      stage.querySelector('#btn-new-bridge-fs')?.addEventListener('click', () => this.startGlassBridgeGame(null));
      return;
    }

    // Montar el juego en un Portal directo en document.body (fuera de .bto-card)
    // y ocultar header/ranking/footer para que SOLO exista el juego en pantalla completa.
    this.setExternalPageChromeHidden(true);
    stage.innerHTML = '';

    let portal = document.getElementById('bridge-fullscreen-portal');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'bridge-fullscreen-portal';
      document.body.appendChild(portal);
    }

    portal.className = 'fixed inset-0 z-[9999] w-screen h-[100dvh] bg-[#08020f] flex flex-col justify-between overflow-hidden select-none';
    portal.innerHTML = `
      <!-- MITAD SUPERIOR: VISOR 3D EN PRIMERA PERSONA (POV DEL JUGADOR QUE VA A SALTAR) -->
      <div id="bridge-3d-canvas-wrap" class="relative w-full h-[38dvh] min-h-[195px] max-h-[390px] sm:h-[44dvh] shrink-0 overflow-hidden bg-[#08020f]">
        <canvas id="squid-bridge-canvas" class="w-full h-full block cursor-pointer" width="840" height="440"></canvas>

        <!-- Barra Flotante Mínima dentro del Visor 3D: Escuadrón 3 Vidas + Peldaño + Sonido + Botón Salir -->
        <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
          <div class="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            <div class="px-2.5 py-1 rounded-full bg-slate-950/90 border border-rose-500/50 text-white font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg">
              <span id="bridge-3d-hearts-wrap" class="inline-flex items-center gap-0.5"></span>
              <span class="text-slate-600">|</span>
              <div id="bridge-3d-squad-wrap" class="inline-flex items-center gap-1"></div>
            </div>

            <span id="bridge-3d-step-pill" class="px-2.5 py-1 rounded-full bg-slate-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] sm:text-xs font-black backdrop-blur-md shadow-md">
              PELDAÑO 1/12
            </span>
            <span id="bridge-3d-bpm-pill" class="px-2.5 py-1 rounded-full bg-slate-950/90 border border-rose-500/55 text-rose-300 font-mono text-[10px] sm:text-xs font-black backdrop-blur-md shadow-md inline-flex items-center gap-1" title="Frecuencia cardíaca en vivo (aumenta mientras avanzas)">
              <span id="bridge-3d-bpm-heart" class="inline-block text-rose-500 transition-transform duration-150">❤️</span>
              <span class="bpm-val">72 BPM</span>
            </span>
            <span id="bridge-3d-streak-pill" class="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-950/90 border border-amber-500/45 text-amber-300 font-mono text-[10px] sm:text-xs font-bold backdrop-blur-md shadow-md">
              RACHA: 0
            </span>
          </div>

          <div class="flex items-center gap-1.5 pointer-events-auto">
            <button type="button" id="btn-bridge-sfx" class="btn-arcade-sfx-toggle px-2.5 py-1 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/45 text-cyan-300 font-mono text-[10px] sm:text-xs font-bold backdrop-blur-md shadow-md cursor-pointer active:scale-95">
              ${this.sfxEnabled ? '<span>🔊 Sonido</span>' : '<span class="text-rose-400">🔇 Mudo</span>'}
            </button>
            <button type="button" id="btn-bridge-exit" class="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 border border-rose-400 text-white font-mono text-[11px] sm:text-xs font-black shadow-lg cursor-pointer active:scale-95 flex items-center gap-1" title="Salir del juego">
              <span>✕ Salir</span>
            </button>
          </div>
        </div>

        <!-- Globo de Diálogo en Pantalla de los Jugadores de Atrás (#058 y #100) -->
        <div id="bridge-back-player-chatter-wrap" class="absolute top-12 left-2.5 right-2.5 z-20 pointer-events-none"></div>

        <!-- Indicador Cinemático Inferior dentro del Visor 3D -->
        <div class="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span id="bridge-pov-camera-badge" class="px-2.5 py-0.5 rounded-lg bg-slate-950/85 border border-cyan-500/45 text-cyan-300 font-mono text-[10px] font-bold backdrop-blur-sm shadow">
            🎬 PRESENTANDO ESCUADRÓN: #456 • #058 • #100
          </span>
        </div>
      </div>

      <!-- MITAD INFERIOR: PREGUNTA + 4 OPCIONES DE RESPUESTA / PERLA CACES (100% VISIBLE SIN SUPERPOSICIÓN) -->
      <div id="bridge-bottom-hud-overlay" class="w-full flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-5 bg-gradient-to-b from-[#150722] to-[#08020d] border-t border-rose-500/35 flex flex-col justify-between gap-2 z-10 max-w-5xl mx-auto"></div>

      <!-- OVERLAY DE FIN DE PARTIDA (VICTORIA O ELIMINACIÓN) -->
      <div id="bridge-question-popup" class="hidden fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center overflow-y-auto"></div>
    `;

    portal.querySelector('#btn-bridge-sfx')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSFX();
      const hdrBtn = document.getElementById('btn-sfx-toggle');
      if (hdrBtn) {
        hdrBtn.innerHTML = this.sfxEnabled
          ? `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
          : `<svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      }
    });

    portal.querySelector('#btn-bridge-exit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.exitBridgeFullscreen();
    });

    this.bindBridgeCanvasEvents();
    this.updateGlassBridgeDOM();
  }

  bindBridgeCanvasEvents() {
    const canvas = document.getElementById('squid-bridge-canvas');
    if (!canvas) return;

    const getCanvasPos = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const touch = evt.touches?.[0] || evt.changedTouches?.[0];
      const clientX = touch ? touch.clientX : evt.clientX;
      const clientY = touch ? touch.clientY : evt.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const pointInPoly = (px, py, pts) => {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i].x, yi = pts[i].y;
        const xj = pts[j].x, yj = pts[j].y;
        const intersect = ((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi + 0.00001) + xi);
        if (intersect) inside = !inside;
      }
      return inside;
    };

    canvas.addEventListener('mousemove', (e) => {
      if (!this.bridgeState) return;
      const pos = getCanvasPos(e);
      let foundLane = -1;
      const regions = this.bridgeState.anim.tileHitRegions || [];
      for (const reg of regions) {
        if (pointInPoly(pos.x, pos.y, reg.poly)) {
          foundLane = reg.lane;
          break;
        }
      }
      this.bridgeState.anim.hoveredLane = foundLane;
    });

    canvas.addEventListener('mouseleave', () => {
      if (this.bridgeState) this.bridgeState.anim.hoveredLane = -1;
    });

    canvas.addEventListener('click', (e) => {
      if (!this.bridgeState) return;
      const st = this.bridgeState;
      // Si hace clic durante el plano introductorio de los 3 jugadores, pasar directo al POV de #456
      if (st.anim.camMode === 'INTRO_SQUAD') {
        st.anim.camMode = 'POV_READY';
        st.anim.cameraRow = st.anim.playerRow;
        st.anim.cameraLane = st.anim.playerLane;
        st.anim.cameraY = 1.18;
        st.anim.cameraPitch = 0.14;
        this.updateGlassBridgeDOM();
        return;
      }
      if (st.awaitingNextStep && !st.isAnimatingJump && !st.isGameOver && !st.isVictory) {
        this.advanceBridgeStep();
        return;
      }
      if (st.isAnimatingJump || st.awaitingNextStep || st.isGameOver || st.isVictory) return;

      const pos = getCanvasPos(e);
      const regions = st.anim.tileHitRegions || [];
      for (const reg of regions) {
        if (pointInPoly(pos.x, pos.y, reg.poly)) {
          const optId = this.optionForLaneIndex(reg.lane);
          if (!st.brokenOptionsInCurrentStep.has(optId)) {
            this.handleBridgeJump(optId);
          }
          break;
        }
      }
    });
  }

  triggerGlassmakerEyePowerup() {
    const st = this.bridgeState;
    if (!st || st.powerups.glassmakerEye <= 0 || st.awaitingNextStep || st.isAnimatingJump || st.brokenOptionsInCurrentStep.size >= 2) return;
    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const options = Array.isArray(q.opciones) ? q.opciones : [];
    const wrongIds = options.map(o => o.id).filter(id => id !== q.correcta && !st.brokenOptionsInCurrentStep.has(id));
    wrongIds.slice(0, 2).forEach(id => {
      st.brokenOptionsInCurrentStep.add(id);
      const lIdx = this.laneIndexForOption(id);
      st.tiles[st.currentStep][lIdx] = 'broken';
      this.spawnGlassShards3D(st.currentStep, lIdx, 32);
    });
    st.anim.screenShake = 10;
    st.powerups.glassmakerEye -= 1;
    this.playTone('glass_shatter');
    this.updateGlassBridgeDOM();
  }

  triggerMarbleHintPowerup() {
    const st = this.bridgeState;
    if (!st || st.powerups.marbleHint <= 0 || st.hintRevealedInCurrentStep || st.awaitingNextStep || st.isAnimatingJump) return;
    st.hintRevealedInCurrentStep = true;
    st.powerups.marbleHint -= 1;
    this.playTone('beep');
    this.updateGlassBridgeDOM();
  }

  triggerTemperedShieldPowerup() {
    const st = this.bridgeState;
    if (!st || st.powerups.temperedShield <= 0 || st.shieldActiveInCurrentStep || st.awaitingNextStep || st.isAnimatingJump) return;
    st.shieldActiveInCurrentStep = true;
    st.powerups.temperedShield -= 1;
    this.playTone('beep');
    this.updateGlassBridgeDOM();
  }

  updateGlassBridgeDOM() {
    const st = this.bridgeState;
    if (!st || !st.isFullscreenOpen) return;

    const bottomOverlay = document.getElementById('bridge-bottom-hud-overlay');
    const popupEl = document.getElementById('bridge-question-popup');
    const stepPill = document.getElementById('bridge-3d-step-pill');
    const streakPill = document.getElementById('bridge-3d-streak-pill');
    const hearts3DWrap = document.getElementById('bridge-3d-hearts-wrap');
    const squad3DWrap = document.getElementById('bridge-3d-squad-wrap');
    const povBadge = document.getElementById('bridge-pov-camera-badge');
    const canvasWrap = document.getElementById('bridge-3d-canvas-wrap');

    const globalStepNum = st.globalStepOffset + st.currentStep + 1;
    const globalGoalNum = st.globalStepOffset + st.totalSteps;

    if (stepPill) {
      stepPill.textContent = st.isVictory
        ? `★ NIVEL ${st.bridgeLevel} LOGRADO`
        : `PELDAÑO ${globalStepNum}/${globalGoalNum}`;
    }
    if (streakPill) {
      streakPill.textContent = `RACHA: ${st.streak}`;
    }
    const bpmPill = document.getElementById('bridge-3d-bpm-pill');
    if (bpmPill) {
      const bpmVal = bpmPill.querySelector('.bpm-val');
      if (bpmVal) bpmVal.textContent = `${this.getBridgeCurrentBPM()} BPM`;
    }
    this.renderBackPlayerChatterBanner();
    if (hearts3DWrap) {
      hearts3DWrap.innerHTML = this.renderLivesHearts(st.lives, 3);
    }
    if (squad3DWrap) {
      squad3DWrap.innerHTML = this.renderSquadPlayersHUD(st.lives);
    }
    if (povBadge) {
      const mode = st.anim.camMode;
      if (mode === 'INTRO_SQUAD') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 font-mono text-[10px] font-black backdrop-blur-sm shadow';
        povBadge.textContent = '🎬 PLANO INICIAL: 3 JUGADORES (#456 • #058 • #100)';
      } else if (mode === 'POV_JUMPING' || mode === 'POV_FLOOR_CHECK_SAFE' || mode === 'POV_FLOOR_CRACK') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-[10px] font-black backdrop-blur-sm shadow';
        povBadge.textContent = `👁️ POV #${st.anim.playerNumber} • MIRANDO AL PISO PARA VER SI ESTÁ TEMPLADO...`;
      } else if (mode === 'POV_FALLING') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-rose-600/95 border border-rose-200 text-white font-mono text-[10px] font-black animate-bounce shadow-lg';
        povBadge.textContent = `✕ ¡EL VIDRIO SE ROMPIÓ! CAÍDA EN POV DE #${st.lastFallenPlayerNum || st.anim.playerNumber}`;
      } else if (mode === 'POV_SWITCH_BACK' || mode === 'POV_RELAY_JUMP') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-mono text-[10px] font-black shadow-lg';
        povBadge.textContent = `👁️ RELEVO EN POV #${st.anim.playerNumber} • SALTANDO AL VIDRIO TEMPLADO SEGURO`;
      } else {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-slate-950/85 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] font-bold backdrop-blur-sm shadow';
        povBadge.textContent = `👁️ TU POV: JUGADOR #${st.anim.playerNumber} (LISTO PARA SALTAR • ${st.lives} ${st.lives === 1 ? 'VIDA' : 'VIDAS'})`;
      }
    }

    if (canvasWrap) {
      if (st.awaitingNextStep) {
        canvasWrap.className = 'relative w-full h-[30dvh] min-h-[160px] max-h-[280px] sm:h-[35dvh] shrink-0 overflow-hidden bg-[#08020f] transition-all duration-200';
      } else {
        canvasWrap.className = 'relative w-full h-[38dvh] min-h-[195px] max-h-[390px] sm:h-[44dvh] shrink-0 overflow-hidden bg-[#08020f] transition-all duration-200';
      }
    }

    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const arcStats = Storage.getArcadeStats();

    if (!popupEl || !bottomOverlay) return;

    // 1. Pantalla de Fin de Puente (Victoria o Eliminación)
    if (st.isVictory || st.isGameOver) {
      bottomOverlay.innerHTML = '';
      popupEl.classList.remove('hidden');
      const bestStreakSaved = Math.max(arcStats.bridgeBestStreak || 0, arcStats.bridgeBestStep || 0);
      const nextLevel = (st.bridgeLevel || 1) + 1;
      const nextStartStep = st.globalStepOffset + st.totalSteps + 1;
      const nextEndStep = nextStartStep + st.totalSteps - 1;
      const reachedStep = st.isVictory ? (st.globalStepOffset + st.totalSteps) : (st.globalStepOffset + st.currentStep);

      popupEl.innerHTML = `
        <div class="w-full max-w-lg p-5 sm:p-7 rounded-3xl bg-slate-950/95 backdrop-blur-xl text-white border-2 ${st.isVictory ? 'border-emerald-500' : 'border-rose-500'} text-center space-y-4 shadow-[0_25px_70px_rgba(0,0,0,0.95)]">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs font-black uppercase ${
            st.isVictory ? 'bg-amber-400 text-slate-950' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }">
            ${st.isVictory ? `★ ¡PUENTE NIVEL ${st.bridgeLevel} LOGRADO!` : '✕ LOS 3 JUGADORES CAYERON (#456, #058 Y #100)'}
          </div>

          <h3 class="font-display font-extrabold text-2xl sm:text-3xl text-white">
            ${st.isVictory ? `¡Cruzaste hasta el Peldaño #${reachedStep}!` : `Eliminado en el Peldaño #${reachedStep + 1}`}
          </h3>

          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ${st.isVictory
              ? `Sumaste +1 puente logrado y recargaste +1 comodín 50/50 y +1 Pista. ¡Continúa hacia el Nivel ${nextLevel} (Peldaños ${nextStartStep} al ${nextEndStep}) conservando tu racha de ${st.streak} vidrios!`
              : 'Tu racha máxima en los vidrios y tus puentes logrados ya quedaron registrados en el Ranking de Juegos.'}
          </p>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span class="font-mono text-[10px] uppercase text-slate-400 block">Racha Máxima en Vidrios</span>
              <span class="font-mono font-black text-lg text-amber-400">${bestStreakSaved} vidrios</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span class="font-mono text-[10px] uppercase text-slate-400 block">Total Puentes Logrados</span>
              <span class="font-mono font-black text-lg text-emerald-400">${arcStats.bridgeWins || 0} puentes</span>
            </div>
          </div>

          <div class="flex flex-col gap-2.5 pt-2">
            ${st.isVictory ? `
              <button type="button" id="btn-bridge-continue-streak" class="bto-btn w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-display font-extrabold text-sm sm:text-base border-transparent shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer">
                <span>Continuar Racha • Nivel ${nextLevel} (Peldaño ${nextStartStep} al ${nextEndStep}) →</span>
              </button>
            ` : ''}
            <div class="flex flex-col sm:flex-row gap-2.5">
              <button type="button" id="btn-bridge-restart" class="bto-btn flex-1 py-3 px-5 rounded-2xl ${st.isVictory ? 'bg-slate-800 text-slate-200' : 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 shadow-lg shadow-rose-500/25'} font-display font-extrabold text-xs sm:text-sm border-transparent cursor-pointer">
                ${st.isVictory ? 'Reiniciar desde Peldaño 1' : 'Jugar de Nuevo (3 Jugadores: #456, #058, #100)'}
              </button>
              <button type="button" id="btn-bridge-exit-ranking" class="bto-btn py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-xs cursor-pointer">
                ✕ Salir
              </button>
            </div>
          </div>
        </div>
      `;

      popupEl.querySelector('#btn-bridge-continue-streak')?.addEventListener('click', () => {
        this.playTone('victory_fanfare');
        this.continueBridgeStreakRound();
      });
      popupEl.querySelector('#btn-bridge-restart')?.addEventListener('click', () => {
        this.playTone('beep');
        this.startGlassBridgeGame(null);
      });
      popupEl.querySelector('#btn-bridge-exit-ranking')?.addEventListener('click', () => {
        this.exitBridgeFullscreen();
      });
      return;
    }

    popupEl.classList.add('hidden');
    const options = Array.isArray(q.opciones) ? q.opciones : [];
    const perlaText = q.perla_caces || q.por_que_es || q.justificacion || `Guía Clínica MSP (${q.especialidad || 'CACES'}): Identifica el signo pivote antes de elegir la conducta terapéutica.`;
    const fuenteText = q.fuente ? `Fuente / GPC: ${q.fuente}` : (q.guia_msp ? `Normativa: ${q.guia_msp}` : '');

    // =========================================================================
    // 2. RETROALIMENTACIÓN CON PERLA CACES Y RESULTADOS DE SIMULADOR
    // Se muestra después de que el jugador (o el jugador de atrás tras el relevo)
    // aterriza en el vidrio templado y mira al frente.
    // =========================================================================
    if (st.awaitingNextStep) {
      const chosenId = st.lastChosenOptionId || q.correcta;
      const isCorrect = st.lastJumpOutcome === 'correct';
      const pctMap = this.getQuestionOptionPercentages(q);
      const breakdown = q.desglose_opciones || q.distractores || {};
      const chosenOptObj = options.find(o => o.id === chosenId);
      const chosenOptText = chosenOptObj ? (chosenOptObj.texto || chosenOptObj.text || '') : `Opción ${chosenId}`;
      const whyWrongText = (!isCorrect && chosenId)
        ? (breakdown[chosenId] || `La opción ${chosenId} (${chosenOptText}) es un distractor clásico del CACES; la conducta de primera elección según protocolo MSP es la opción ${q.correcta}.`)
        : '';

      const optionsReviewHtml = options.map(opt => {
        const isOptCorrect = opt.id === q.correcta;
        const isOptSelected = opt.id === chosenId;
        const pctBadge = this.renderOptionPercentagePill(pctMap[opt.id] ?? 15);
        const cleanOptText = this.formatMd((opt.texto || opt.text || '').replace(/^\*+|\*+$/g, ''));

        let cardCls = 'border-slate-800 bg-slate-900/55 text-slate-400 opacity-75';
        let letterCls = 'bg-slate-800 text-slate-300 border-slate-700';
        let statusTag = '';

        if (isOptCorrect) {
          cardCls = 'border-emerald-500 bg-emerald-500/15 text-white font-semibold ring-1 ring-emerald-500/30';
          letterCls = 'bg-emerald-500 text-slate-950 border-emerald-400 font-black';
          statusTag = `<span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[10px] font-black uppercase shrink-0">Clave Oficial</span>`;
        } else if (isOptSelected && !isOptCorrect) {
          cardCls = 'border-rose-500 bg-rose-500/15 text-white font-medium ring-1 ring-rose-500/30';
          letterCls = 'bg-rose-500 text-white border-rose-400 font-black';
          statusTag = `<span class="px-2 py-0.5 rounded bg-rose-500 text-white font-mono text-[10px] font-black uppercase shrink-0">Tu Elección</span>`;
        }

        return `
          <div class="p-2 sm:p-2.5 rounded-xl border ${cardCls} flex items-center justify-between gap-2 text-xs sm:text-sm">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="w-6 h-6 rounded-lg border font-mono text-xs flex items-center justify-center shrink-0 ${letterCls}">${opt.id}</span>
              <span class="leading-snug">${cleanOptText} ${pctBadge}</span>
            </div>
            ${statusTag}
          </div>
        `;
      }).join('');

      bottomOverlay.innerHTML = `
        <div class="p-3 sm:p-4 rounded-3xl bg-slate-950/95 border-2 ${isCorrect ? 'border-emerald-500/80' : 'border-rose-500/80'} text-white space-y-2.5 shadow-2xl">
          
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-1 rounded-xl font-mono text-[11px] sm:text-xs font-black uppercase flex items-center gap-1.5 ${
                isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }">
                ${isCorrect
                  ? `${SVG_ICONS.check} ¡VIDRIO TEMPLADO FIRME! (+20 XP)`
                  : `${SVG_ICONS.cross} #${st.lastFallenPlayerNum || '456'} CAYÓ • POV #${st.anim.playerNumber} SALTÓ AL TEMPLADO`}
              </span>

              <span class="text-emerald-400 font-mono font-bold text-xs flex items-center gap-1">
                <span>CLAVE OFICIAL:</span>
                <span class="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black text-xs">${q.correcta || 'A'}</span>
              </span>
            </div>

            <button type="button" id="btn-bridge-next-step" class="bto-btn px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-xs sm:text-sm border-transparent shrink-0 shadow-lg shadow-emerald-500/25 cursor-pointer">
              ${st.currentStep + 1 >= st.totalSteps ? '¡Saltar a la Meta! →' : `Siguiente Pregunta (${st.currentStep + 2}/${st.totalSteps}) →`}
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            ${optionsReviewHtml}
          </div>

          ${!isCorrect && whyWrongText ? `
            <div class="p-2.5 sm:p-3 rounded-2xl bg-rose-500/10 border border-rose-500/35 space-y-1">
              <div class="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-bold uppercase text-rose-400">
                ${SVG_ICONS.cross}
                <span>Por qué tu opción seleccionada (Opción ${chosenId}) es incorrecta:</span>
              </div>
              <div class="clinical-prose text-xs sm:text-sm text-slate-200 leading-relaxed">
                ${this.formatMd(whyWrongText)}
              </div>
            </div>
          ` : ''}

          <div class="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/35 space-y-1">
            <div class="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs font-bold uppercase text-amber-300">
              ${SVG_ICONS.diamond}
              <span>Perla CACES de Alto Rendimiento:</span>
            </div>
            <div class="clinical-prose text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
              ${this.formatMd(perlaText)}
            </div>
            ${fuenteText ? `<div class="font-mono text-[10px] font-semibold text-amber-200/75 pt-0.5">${this.formatMd(fuenteText)}</div>` : ''}
          </div>

          <button type="button" id="btn-bridge-next-step-bottom" class="sm:hidden bto-btn w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-xs border-transparent shadow-lg shadow-emerald-500/25 cursor-pointer">
            ${st.currentStep + 1 >= st.totalSteps ? '¡Saltar a la Meta! →' : `Siguiente Pregunta (${st.currentStep + 2}/${st.totalSteps}) →`}
          </button>
        </div>
      `;

      const goNext = () => this.advanceBridgeStep();
      bottomOverlay.querySelector('#btn-bridge-next-step')?.addEventListener('click', goNext);
      bottomOverlay.querySelector('#btn-bridge-next-step-bottom')?.addEventListener('click', goNext);
      return;
    }

    // =========================================================================
    // 3. VISTA ACTIVA DE PREGUNTA + COMODINES + 4 OPCIONES DE RESPUESTA (A, B, C, D)
    // =========================================================================
    bottomOverlay.innerHTML = `
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center justify-between gap-1.5">
          <div class="flex items-center gap-2 min-w-0">
            <span class="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-mono text-[11px] font-black shrink-0">
              PELDAÑO #${globalStepNum} • POV #${st.anim.playerNumber}
            </span>
            <span class="font-mono text-[11px] sm:text-xs text-emerald-400 font-bold truncate">
              ${q.especialidad || 'Medicina CACES'} ${q.subtema ? `• ${q.subtema}` : ''}
            </span>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" id="btn-hud-power-eye" ${st.powerups.glassmakerEye <= 0 || st.brokenOptionsInCurrentStep.size >= 2 ? 'disabled' : ''} class="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/45 text-sky-300 font-mono text-[11px] font-bold flex items-center gap-1 disabled:opacity-35 cursor-pointer" title="50/50: Rompe 2 vidrios falsos">
              ${SVG_ICONS.eye} <span>50/50</span> <b class="text-sky-400">x${st.powerups.glassmakerEye}</b>
            </button>
            <button type="button" id="btn-hud-power-marble" ${st.powerups.marbleHint <= 0 || st.hintRevealedInCurrentStep ? 'disabled' : ''} class="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/45 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1 disabled:opacity-35 cursor-pointer" title="Revela la Perla CACES">
              ${SVG_ICONS.sparkle} <span>Pista</span> <b class="text-amber-400">x${st.powerups.marbleHint}</b>
            </button>
            <button type="button" id="btn-hud-power-shield" ${st.powerups.temperedShield <= 0 || st.shieldActiveInCurrentStep ? 'disabled' : ''} class="px-2 py-1 rounded-xl ${st.shieldActiveInCurrentStep ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200' : 'bg-slate-900 hover:bg-slate-800 border-emerald-500/45 text-emerald-300'} border font-mono text-[11px] font-bold flex items-center gap-1 disabled:opacity-35 cursor-pointer" title="Escudo Templado">
              ${SVG_ICONS.shield} <span>${st.shieldActiveInCurrentStep ? 'Activo' : 'Escudo'}</span> <b class="text-emerald-400">x${st.powerups.temperedShield}</b>
            </button>
          </div>
        </div>

        <div class="p-2.5 sm:p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-1 shadow-inner">
          <div class="clinical-prose text-xs sm:text-sm text-slate-100 leading-relaxed">
            ${this.formatMd(q.enunciado || '')}
          </div>
          ${q.pregunta ? `<p class="font-display font-bold text-xs sm:text-sm text-emerald-400 pt-0.5">${this.formatMd(q.pregunta)}</p>` : ''}

          ${st.hintRevealedInCurrentStep ? `
            <div class="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-300 mt-1 flex items-start gap-1.5">
              ${SVG_ICONS.diamond}
              <div><b class="font-mono uppercase">Pista Perla CACES:</b> ${this.formatMd(perlaText)}</div>
            </div>
          ` : ''}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
          ${options.map((opt, idx) => {
            const isBroken = st.brokenOptionsInCurrentStep.has(opt.id);
            const fullText = (opt.texto || opt.text || '').replace(/^\*+|\*+$/g, '');
            return `
              <button type="button" data-quick-bridge-opt="${opt.id}" data-quick-bridge-lane="${idx}" ${isBroken || st.isAnimatingJump ? 'disabled' : ''} class="p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                isBroken
                  ? 'bg-rose-950/35 border-dashed border-rose-500/35 opacity-40 line-through text-rose-400 pointer-events-none'
                  : 'bg-slate-900/95 hover:bg-cyan-950/85 border-cyan-500/50 hover:border-emerald-400 text-white active:scale-[0.99]'
              }">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-black text-xs flex items-center justify-center shrink-0">${opt.id}</span>
                  <span class="text-xs sm:text-sm text-slate-100 font-medium leading-snug">${this.formatMd(fullText)}</span>
                </div>
                <span class="px-2 py-0.5 rounded-lg ${isBroken ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'} font-mono text-[10px] font-black shrink-0">
                  ${isBroken ? 'ROTO' : 'SALTAR'}
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    bottomOverlay.querySelector('#btn-hud-power-eye')?.addEventListener('click', () => {
      this.triggerGlassmakerEyePowerup();
    });
    bottomOverlay.querySelector('#btn-hud-power-marble')?.addEventListener('click', () => {
      this.triggerMarbleHintPowerup();
    });
    bottomOverlay.querySelector('#btn-hud-power-shield')?.addEventListener('click', () => {
      this.triggerTemperedShieldPowerup();
    });

    bottomOverlay.querySelectorAll('[data-quick-bridge-opt]').forEach(btn => {
      const laneIdx = parseInt(btn.getAttribute('data-quick-bridge-lane'), 10);
      btn.addEventListener('mouseenter', () => {
        if (this.bridgeState) this.bridgeState.anim.hoveredLane = laneIdx;
      });
      btn.addEventListener('mouseleave', () => {
        if (this.bridgeState) this.bridgeState.anim.hoveredLane = -1;
      });
      btn.addEventListener('click', () => {
        const chosenId = btn.getAttribute('data-quick-bridge-opt');
        this.handleBridgeJump(chosenId);
      });
    });
  }

  /**
   * Inicia el salto en Primera Persona (POV) del jugador activo:
   * Salta hacia el vidrio elegido mientras baja la mirada hacia el piso para ver si es templado.
   */
  handleBridgeJump(chosenOptionId) {
    const st = this.bridgeState;
    if (!st || st.isAnimatingJump || st.awaitingNextStep || st.isGameOver || st.isVictory) return;

    const q = st.questions[st.currentStep];
    const targetLane = this.laneIndexForOption(chosenOptionId);
    const isCorrect = chosenOptionId === q.correcta;
    const now = performance.now();

    st.lastChosenOptionId = chosenOptionId;
    st.isAnimatingJump = true;

    st.anim.camMode = 'POV_JUMPING';
    st.anim.jumpStartTime = now;
    st.anim.jumpDuration = 540;
    st.anim.jumpStartRow = st.anim.playerRow;
    st.anim.jumpStartLane = st.anim.playerLane;
    st.anim.jumpTargetRow = st.currentStep;
    st.anim.jumpTargetLane = targetLane;
    st.anim.jumpWillBreak = !isCorrect;
    st.anim.jumpChosenId = chosenOptionId;

    if (!isCorrect) {
      st.anim.cracks = Array.from({ length: 14 }, (_, i) => ({
        angle: (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.25,
        len: 0.28 + Math.random() * 0.24
      }));
    }

    this.playTone('jump');
    this.updateGlassBridgeDOM();
  }

  /**
   * Se ejecuta cuando los pies del jugador en POV aterrizan sobre el cristal (mirando al piso)
   */
  onPOVJumpLanded() {
    const st = this.bridgeState;
    if (!st) return;

    const now = performance.now();
    const q = st.questions[st.currentStep];
    const chosenOptionId = st.anim.jumpChosenId;
    const laneIdx = st.anim.jumpTargetLane;
    const isCorrect = !st.anim.jumpWillBreak;

    if (isCorrect) {
      // 1. ¡El vidrio es TEMPLADO! El jugador mira sus pies sobre el vidrio firme y luego levanta la mirada al frente
      this.playTone('glass_step');
      st.tiles[st.currentStep][laneIdx] = 'safe';
      st.safeLaneHistory[st.currentStep] = laneIdx;
      st.anim.shockwaves.push({
        row: st.currentStep,
        lane: laneIdx,
        radius: 0.08,
        alpha: 1.0
      });

      st.anim.camMode = 'POV_FLOOR_CHECK_SAFE';
      st.anim.phaseStartTime = now;
      st.anim.phaseDuration = 580; // Mira al piso templado y levanta la vista al frente
      this.updateGlassBridgeDOM();

      setTimeout(() => {
        if (!this.bridgeState || st.isGameOver) return;
        st.anim.camMode = 'POV_READY';
        st.anim.cameraPitch = 0.14;
        st.streak += 1;
        const stepBonus = 150 + (st.currentStep * 25) + (st.streak * 20);
        st.score += stepBonus;
        st.lastJumpOutcome = 'correct';
        st.isAnimatingJump = false;
        st.awaitingNextStep = true;

        this.addXP(20, true, false);
        Storage.registerAnswer(q.id || `bridge_${st.currentStep}`, true, null, {
          specialty: q.especialidad || 'Medicina Interna',
          mode: 'study',
          isFirstAttempt: true,
          selectedOption: chosenOptionId
        });
        Storage.saveArcadeStats({
          bridgeHighScore: st.score,
          bridgeBestStep: st.globalStepOffset + st.currentStep + 1,
          bridgeBestStreak: st.streak
        });
        this.saveHighScore(st.score);
        this.updateHUD();
        this.renderModeSelectorCards();
        this.updateGlassBridgeDOM();
      }, 580);
    } else {
      // 2. ¡El vidrio es FALSO! Mira al piso -> se agrieta -> se rompe y cae en POV ->
      //    pasa al POV del jugador de atrás -> salta al vidrio templado -> siguiente pregunta
      if (st.shieldActiveInCurrentStep) {
        this.playTone('glass_shatter');
        st.tiles[st.currentStep][laneIdx] = 'broken';
        st.brokenOptionsInCurrentStep.add(chosenOptionId);
        this.spawnGlassShards3D(st.currentStep, laneIdx, 40);
        st.shieldActiveInCurrentStep = false;
        st.anim.camMode = 'POV_READY';
        st.anim.cameraRow = st.anim.jumpStartRow;
        st.anim.cameraLane = st.anim.jumpStartLane;
        st.anim.cameraY = 1.18;
        st.anim.cameraPitch = 0.14;
        st.isAnimatingJump = false;
        this.updateGlassBridgeDOM();
        return;
      }

      Storage.registerAnswer(q.id || `bridge_${st.currentStep}`, false, chosenOptionId, {
        specialty: q.especialidad || 'Medicina Interna',
        mode: 'study',
        isFirstAttempt: true,
        selectedOption: chosenOptionId
      });

      // Sub-fase A: Mira al piso durante 220ms viendo cómo el cristal se agrieta bajo sus zapatillas
      st.anim.camMode = 'POV_FLOOR_CRACK';
      st.anim.phaseStartTime = now;
      st.anim.phaseDuration = 220;
      this.updateGlassBridgeDOM();

      setTimeout(() => {
        if (!this.bridgeState) return;
        const shatterNow = performance.now();
        this.playTone('glass_shatter');
        st.tiles[st.currentStep][laneIdx] = 'broken';
        st.brokenOptionsInCurrentStep.add(chosenOptionId);
        this.spawnGlassShards3D(st.currentStep, laneIdx, 56);
        st.anim.screenShake = 16;

        st.lastFallenPlayerNum = st.anim.playerNumber;
        st.lives -= 1;
        st.streak = 0;
        st.lastJumpOutcome = 'wrong';

        const safeLane = this.laneIndexForOption(q.correcta);
        st.tiles[st.currentStep][safeLane] = 'safe';
        st.safeLaneHistory[st.currentStep] = safeLane;

        // Sub-fase B: Animación de caída en primera persona (POV cayendo al abismo)
        st.anim.camMode = 'POV_FALLING';
        st.anim.phaseStartTime = shatterNow;
        st.anim.phaseDuration = 950;
        this.updateGlassBridgeDOM();

        setTimeout(() => {
          if (!this.bridgeState) return;

          // Si era el 3er jugador (#100, 0 vidas restantes): termina la partida tras su caída en POV
          if (st.lives <= 0) {
            this.playTone('flatline');
            st.isAnimatingJump = false;
            st.isGameOver = true;
            Storage.saveArcadeStats({
              bridgeHighScore: st.score,
              bridgeBestStep: st.globalStepOffset + st.currentStep
            });
            this.updateHUD();
            this.renderModeSelectorCards();
            this.updateGlassBridgeDOM();
            return;
          }

          // Sub-fase C: Pasa al POV del jugador de atrás (#058 o #100) parado en el peldaño anterior
          const nextSquad = this.getSquadOrderForLives(st.lives);
          const nextLeadNum = nextSquad[0] || (st.lives === 2 ? '058' : '100');
          const prevRow = st.currentStep > 0 ? (st.currentStep - 1) : -0.52;
          const prevLane = st.currentStep > 0 && st.safeLaneHistory[st.currentStep - 1] !== undefined
            ? st.safeLaneHistory[st.currentStep - 1]
            : 1.5;

          st.anim.playerNumber = nextLeadNum;
          st.anim.playerRow = prevRow;
          st.anim.playerLane = prevLane;
          st.anim.cameraRow = prevRow;
          st.anim.cameraLane = prevLane;
          st.anim.cameraY = 1.18;
          st.anim.cameraPitch = 0.16;
          st.anim.cameraRoll = 0;
          st.anim.camMode = 'POV_SWITCH_BACK';
          st.anim.phaseStartTime = performance.now();
          st.anim.phaseDuration = 380;
          this.playTone('beep');
          this.triggerBackPlayerTaunt('fell');
          this.updateGlassBridgeDOM();

          // Sub-fase D: Ese jugador de atrás salta en su POV al vidrio templado seguro,
          // mira el piso templado, levanta la vista al frente y pasa a la retroalimentación / siguiente pregunta
          setTimeout(() => {
            if (!this.bridgeState || st.isGameOver) return;
            const relayNow = performance.now();
            this.playTone('jump');
            st.anim.camMode = 'POV_RELAY_JUMP';
            st.anim.jumpStartTime = relayNow;
            st.anim.jumpDuration = 500;
            st.anim.jumpStartRow = prevRow;
            st.anim.jumpStartLane = prevLane;
            st.anim.jumpTargetRow = st.currentStep;
            st.anim.jumpTargetLane = safeLane;
            this.updateGlassBridgeDOM();

            setTimeout(() => {
              if (!this.bridgeState || st.isGameOver) return;
              this.playTone('glass_step');
              st.anim.playerRow = st.currentStep;
              st.anim.playerLane = safeLane;
              st.anim.shockwaves.push({
                row: st.currentStep,
                lane: safeLane,
                radius: 0.08,
                alpha: 1.0
              });
              st.anim.camMode = 'POV_FLOOR_CHECK_SAFE';
              st.anim.phaseStartTime = performance.now();
              st.anim.phaseDuration = 460;

              setTimeout(() => {
                if (!this.bridgeState || st.isGameOver) return;
                st.anim.camMode = 'POV_READY';
                st.anim.cameraPitch = 0.14;
                st.isAnimatingJump = false;
                st.awaitingNextStep = true;
                this.updateGlassBridgeDOM();
              }, 460);
            }, 500);
          }, 380);
        }, 950);
      }, 220);
    }
  }

  advanceBridgeStep() {
    const st = this.bridgeState;
    if (!st || st.isAnimatingJump) return;

    if (st.currentStep + 1 >= st.totalSteps) {
      const now = performance.now();
      st.isAnimatingJump = true;
      st.anim.camMode = 'POV_RELAY_JUMP';
      st.anim.jumpStartTime = now;
      st.anim.jumpDuration = 580;
      st.anim.jumpStartRow = st.anim.playerRow;
      st.anim.jumpStartLane = st.anim.playerLane;
      st.anim.jumpTargetRow = st.totalSteps + 0.25;
      st.anim.jumpTargetLane = 1.5;
      this.playTone('jump');

      setTimeout(() => {
        if (!this.bridgeState) return;
        st.isAnimatingJump = false;
        st.isVictory = true;
        st.score += 1500;
        this.playTone('victory_fanfare');
        this.addXP(120, true, true);
        if (window.confetti) {
          window.confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });
        }
        Storage.saveArcadeStats({
          bridgeHighScore: st.score,
          bridgeBestStep: st.globalStepOffset + st.totalSteps,
          bridgeBestStreak: st.streak,
          addBridgeWin: 1
        });
        this.saveHighScore(st.score);
        this.updateHUD();
        this.renderModeSelectorCards();
        this.updateGlassBridgeDOM();
      }, 600);
      return;
    }

    st.currentStep += 1;
    st.brokenOptionsInCurrentStep = new Set();
    st.hintRevealedInCurrentStep = false;
    st.shieldActiveInCurrentStep = false;
    st.awaitingNextStep = false;
    st.lastJumpOutcome = null;
    st.lastChosenOptionId = null;
    st.anim.camMode = 'POV_READY';
    st.anim.cameraPitch = 0.14;
    this.playTone('beep');
    this.updateGlassBridgeDOM();
    setTimeout(() => {
      if (this.bridgeState && !this.bridgeState.isAnimatingJump && !this.bridgeState.awaitingNextStep) {
        this.triggerBackPlayerTaunt('next_step');
      }
    }, 650);
  }

  spawnGlassShards3D(row, lane, count = 52) {
    if (!this.bridgeState) return;
    const laneCenterX = (lane - 1.5) * 0.94;
    const rowCenterZ = row;
    for (let i = 0; i < count; i++) {
      const polySides = 3 + (i % 2);
      const pts = [];
      for (let p = 0; p < polySides; p++) {
        const ang = (p / polySides) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
        const rad = 0.55 + Math.random() * 0.55;
        pts.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
      }
      this.bridgeState.anim.shards.push({
        x: laneCenterX + (Math.random() - 0.5) * 0.78,
        y: (Math.random() - 0.5) * 0.08,
        z: rowCenterZ + (Math.random() - 0.5) * 0.62,
        vx: (Math.random() - 0.5) * 0.052,
        vy: 0.018 - Math.random() * 0.058,
        vz: (Math.random() - 0.5) * 0.038,
        size: 7 + Math.random() * 15,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.34,
        tilt: Math.random() * Math.PI,
        vTilt: (Math.random() - 0.5) * 0.25,
        pts,
        alpha: 1.0
      });
    }
    for (let s = 0; s < 30; s++) {
      this.bridgeState.anim.sparks.push({
        x: laneCenterX + (Math.random() - 0.5) * 0.85,
        y: (Math.random() - 0.5) * 0.12,
        z: rowCenterZ + (Math.random() - 0.5) * 0.65,
        vx: (Math.random() - 0.5) * 0.06,
        vy: 0.025 - Math.random() * 0.04,
        vz: (Math.random() - 0.5) * 0.04,
        r: 1.5 + Math.random() * 2.5,
        alpha: 1.0
      });
    }
  }

  // =========================================================================
  // BUCLE DE FÍSICAS Y CÁMARA POV EN PRIMERA PERSONA A 60FPS
  // =========================================================================
  startGlassBridgeRenderLoop() {
    const loop = (now) => {
      if (this.currentMode !== 'bridge') return;
      const canvas = document.getElementById('squid-bridge-canvas');
      if (canvas && this.bridgeState && this.bridgeState.isFullscreenOpen) {
        this.resizeBridgeCanvasIfNeeded(canvas);
        this.updateBridgePhysics(now);
        this.drawGlassBridge3DScene(canvas, now);
      }
      this.activeRaf = requestAnimationFrame(loop);
    };
    this.activeRaf = requestAnimationFrame(loop);
  }

  resizeBridgeCanvasIfNeeded(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (Math.abs(canvas.width - targetW) > 4 || Math.abs(canvas.height - targetH) > 4) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }

  updateBridgePhysics(now) {
    const st = this.bridgeState;
    if (!st) return;
    const anim = st.anim;

    if (anim.screenShake > 0.2) {
      anim.screenShake *= 0.85;
    } else {
      anim.screenShake = 0;
    }

    // 1. PLANO INICIAL DE LOS 3 JUGADORES ('INTRO_SQUAD') -> TRANSICIÓN AL POV DE #456
    if (anim.camMode === 'INTRO_SQUAD') {
      const elapsed = Math.max(0, now - anim.introStartTime);
      const t = Math.min(1, elapsed / anim.introDuration);
      if (t < 0.62) {
        // Plano abierto mostrando a #456, #058 y #100 sobre la plataforma verde
        anim.cameraRow = -2.15 + (t / 0.62) * 0.25;
        anim.cameraLane = 1.5;
        anim.cameraY = 1.48;
        anim.cameraPitch = 0.08;
      } else {
        // Zoom suave hacia los ojos de #456 para entrar en su POV
        const zt = (t - 0.62) / 0.38;
        const ease = zt < 0.5 ? 2 * zt * zt : 1 - Math.pow(-2 * zt + 2, 2) / 2;
        anim.cameraRow = -1.90 + (anim.playerRow - (-1.90)) * ease;
        anim.cameraLane = 1.5;
        anim.cameraY = 1.48 + (1.18 - 1.48) * ease;
        anim.cameraPitch = 0.08 + (0.14 - 0.08) * ease;
      }
      if (t >= 1) {
        anim.camMode = 'POV_READY';
        anim.cameraRow = anim.playerRow;
        anim.cameraLane = anim.playerLane;
        anim.cameraY = 1.18;
        anim.cameraPitch = 0.14;
        this.updateGlassBridgeDOM();
      }
    }

    // 2. MODO POV LISTO PARA SALTAR ('POV_READY')
    else if (anim.camMode === 'POV_READY') {
      anim.cameraRow += (anim.playerRow - anim.cameraRow) * 0.14;
      anim.cameraLane += (anim.playerLane - anim.cameraLane) * 0.14;
      anim.cameraY = 1.18 + Math.sin(now * 0.0035) * 0.015;
      anim.cameraPitch += (0.14 - anim.cameraPitch) * 0.14;
      anim.cameraRoll *= 0.8;
    }

    // 3. SALTO EN PRIMERA PERSONA Y MIRADA AL PISO ('POV_JUMPING' o 'POV_RELAY_JUMP')
    else if (anim.camMode === 'POV_JUMPING' || anim.camMode === 'POV_RELAY_JUMP') {
      const elapsed = Math.max(0, now - anim.jumpStartTime);
      const t = Math.min(1, elapsed / anim.jumpDuration);
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      anim.playerRow = anim.jumpStartRow + (anim.jumpTargetRow - anim.jumpStartRow) * easeT;
      anim.playerLane = anim.jumpStartLane + (anim.jumpTargetLane - anim.jumpStartLane) * easeT;
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraY = 1.18 + Math.sin(t * Math.PI) * 1.12;

      // En la primera mitad del salto mira al frente; al caer hacia el vidrio inclina la cabeza al piso (pitch -> 0.72)
      if (t < 0.38) {
        anim.cameraPitch = 0.14 - (t / 0.38) * 0.06;
      } else {
        const lookDownT = (t - 0.38) / 0.62;
        anim.cameraPitch = 0.08 + lookDownT * 0.64;
      }

      if (t >= 1 && anim.camMode === 'POV_JUMPING') {
        anim.playerRow = anim.jumpTargetRow;
        anim.playerLane = anim.jumpTargetLane;
        anim.cameraRow = anim.playerRow;
        anim.cameraLane = anim.playerLane;
        anim.cameraY = 1.14;
        anim.cameraPitch = 0.72;
        this.onPOVJumpLanded();
      }
    }

    // 4. MIRANDO AL PISO TEMPLADO Y LUEGO LEVANTANDO LA MIRADA AL FRENTE ('POV_FLOOR_CHECK_SAFE')
    else if (anim.camMode === 'POV_FLOOR_CHECK_SAFE') {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const t = Math.min(1, elapsed / anim.phaseDuration);
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      if (t < 0.48) {
        // Mantiene la vista en el piso templado verde bajo sus zapatillas
        anim.cameraPitch = 0.72;
        anim.cameraY = 1.12;
      } else {
        // Levanta la mirada hacia el frente ("y luego mira al frente")
        const upT = (t - 0.48) / 0.52;
        const easeUp = 1 - Math.pow(1 - upT, 2);
        anim.cameraPitch = 0.72 + (0.14 - 0.72) * easeUp;
        anim.cameraY = 1.12 + (1.18 - 1.12) * easeUp;
      }
    }

    // 5. MIRANDO EL PISO AGRIETARSE BAJO LOS PIES ('POV_FLOOR_CRACK')
    else if (anim.camMode === 'POV_FLOOR_CRACK') {
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraPitch = 0.74;
      anim.cameraY = 1.10;
      anim.screenShake = 6;
    }

    // 6. CAÍDA LIBRE EN PRIMERA PERSONA ('POV_FALLING')
    else if (anim.camMode === 'POV_FALLING') {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const t = Math.min(1, elapsed / anim.phaseDuration);
      anim.cameraY = 1.10 - t * t * 13.5;
      // Al caer al vacío, la mirada gira hacia arriba viendo el puente alejarse
      anim.cameraPitch = 0.74 - t * 1.25;
      anim.cameraRoll = Math.sin(t * Math.PI * 3) * 0.18 * t;
    }

    // Actualizar fragmentos de cristal 3D
    for (let i = anim.shards.length - 1; i >= 0; i--) {
      const s = anim.shards[i];
      s.x += s.vx;
      s.y += s.vy;
      s.z += s.vz;
      s.vy -= 0.0052;
      s.rot += s.vRot;
      if (s.tilt !== undefined) s.tilt += s.vTilt || 0;
      s.alpha -= 0.014;
      if (s.alpha <= 0) {
        anim.shards.splice(i, 1);
      }
    }

    // Actualizar chispas de vidrio
    for (let i = anim.sparks.length - 1; i >= 0; i--) {
      const sp = anim.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.z += sp.vz;
      sp.vy -= 0.003;
      sp.alpha -= 0.028;
      if (sp.alpha <= 0) {
        anim.sparks.splice(i, 1);
      }
    }

    // Actualizar ondas de choque en vidrio templado
    for (let i = anim.shockwaves.length - 1; i >= 0; i--) {
      const sw = anim.shockwaves[i];
      sw.radius += 0.038;
      sw.alpha -= 0.035;
      if (sw.alpha <= 0) {
        anim.shockwaves.splice(i, 1);
      }
    }
  }

  /**
   * Proyección 3D con soporte de Cámara en Primera Persona (cameraLane, cameraY, cameraRow y cameraPitch):
   * - Cuando cameraPitch aumenta (mirando al piso), el piso bajo tus pies sube al centro de la pantalla.
   * - Cuando cameraPitch vuelve a 0.14 (mirando al frente), ves los 4 vidrios del siguiente peldaño y la meta.
   */
  project3D(x, y, z, canvasW, canvasH, cameraZ) {
    const st = this.bridgeState;
    const anim = st?.anim;
    const isNarrow = canvasW < 560;
    const camLane = anim ? anim.cameraLane : 1.5;
    const camX = (camLane - 1.5) * 0.94;
    const camY = anim ? anim.cameraY : 1.18;
    const camPitch = anim ? anim.cameraPitch : 0.14;

    const lateralFollow = anim?.camMode === 'INTRO_SQUAD' ? 0 : 0.52;
    const dx = x - camX * lateralFollow;

    const zOffset = anim?.camMode === 'INTRO_SQUAD' ? 0.55 : (isNarrow ? 1.10 : 1.18);
    const relZ = z - cameraZ + zOffset;
    const clampedZ = Math.max(0.22, relZ);

    const baseFov = isNarrow
      ? Math.min(canvasW * 1.24, canvasH * 1.62)
      : Math.min(canvasW * 1.02, canvasH * 1.72);
    const scale = baseFov / (clampedZ * 1.04 + 0.55);

    // Desplazamiento vertical según hacia dónde mira la cabeza (cameraPitch)
    const pitchShiftY = (camPitch - 0.14) * canvasH * 0.46;
    const horizonY = canvasH * (isNarrow ? 0.21 : 0.19) - pitchShiftY;

    const screenX = canvasW * 0.5 + dx * scale * (isNarrow ? 0.64 : 0.60);
    const screenY = horizonY + (camY - y) * scale * (isNarrow ? 0.62 : 0.58);
    return { x: screenX, y: screenY, scale, relZ };
  }

  drawGlassBridge3DScene(canvas, now) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const st = this.bridgeState;
    const anim = st.anim;

    ctx.save();
    if (anim.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * anim.screenShake,
        (Math.random() - 0.5) * anim.screenShake
      );
    }
    if (anim.cameraRoll) {
      ctx.translate(W * 0.5, H * 0.5);
      ctx.rotate(anim.cameraRoll);
      ctx.translate(-W * 0.5, -H * 0.5);
    }

    const camZ = anim.cameraRow;

    // 1. Recinto Arquitectónico Realista 3D (Pabellón de Circo VIP Squid Game)
    this.drawArenaEnvironment3D(ctx, W, H, camZ, st.totalSteps, now);

    // 2. Torres laterales y Guardias
    this.drawSideTowersAndGuards(ctx, W, H, camZ, now);

    // 3. Plataforma Roja Final con Escaleras, Puerta en Arco y Guardias Rosas
    this.drawGoalPlatformAndDoorway(ctx, W, H, camZ, st.totalSteps, now);

    // 4. Vigas de acero, riel rojo central y bombillos incandescentes
    this.drawBridgeRailsAndLights(ctx, W, H, camZ, st.totalSteps, now);

    // 5. Dibujar filas de baldosas de cristal 3D de atrás hacia adelante
    anim.tileHitRegions = [];
    for (let r = st.totalSteps - 1; r >= 0; r--) {
      if (r - camZ < -1.35) continue;
      this.drawBridgeRowTiles(ctx, W, H, camZ, r, now);
    }

    // 6. Dibujar Plataforma Verde de Salida cuando está cerca de la cámara
    if (-0.3 - camZ > -2.35) {
      this.drawStartingGreenPlatform(ctx, W, H, camZ);
    }

    // 7. Dibujar Fragmentos 3D de Vidrio Roto y Chispas cayendo al vacío
    this.drawFallingShards(ctx, W, H, camZ);

    // 8. Si estamos en el PLANO INICIAL ('INTRO_SQUAD'), mostrar a los 3 jugadores (#456, #058 y #100)
    //    sobre la plataforma verde de salida antes de entrar al POV del primero que saltará (#456).
    if (anim.camMode === 'INTRO_SQUAD') {
      const squadActors = [];
      if (st.lives >= 1) {
        squadActors.push({ num: st.lives === 3 ? '456' : (st.lives === 2 ? '058' : '100'), x: 0, z: -0.52, scale: 1.15 });
      }
      if (st.lives >= 2) {
        squadActors.push({ num: st.lives === 3 ? '058' : '100', x: 0.92, z: -1.02, scale: 0.86 });
      }
      if (st.lives >= 3) {
        squadActors.push({ num: '100', x: -0.92, z: -1.02, scale: 0.86 });
      }
      // Dibujar de más lejano a más cercano sin superponerse
      squadActors.sort((a, b) => b.z - a.z);
      squadActors.forEach(act => {
        this.drawSquidPlayer3D(ctx, W, H, camZ, act.x, 0, act.z, act.num, act.scale, 0, false, now, 0, 0, false);
      });
    } else {
      // 9. ESTAMOS EN EL POV EN PRIMERA PERSONA DEL JUGADOR QUE SALTA:
      //    - Si está mirando hacia abajo al piso ('POV_FLOOR_CHECK_SAFE', 'POV_FLOOR_CRACK' o final de 'POV_JUMPING'),
      //      dibujar sus propios pies/zapatillas blancas pisando el cristal para verificar si está templado.
      if (anim.cameraPitch > 0.35 && anim.camMode !== 'POV_FALLING') {
        this.drawPOVFeetOnLanding3D(ctx, W, H, camZ, now);
      }
      //    - Dibujar los antebrazos y manos anatómicas en primera persona del jugador activo (#456, #058 o #100)
      this.drawPOVForegroundHands3D(ctx, W, H, now);
    }

    ctx.restore();
  }

  /**
   * Cuando el jugador en POV salta y mira al piso para ver si el vidrio es templado,
   * dibuja sus propias piernas inferiores y zapatillas blancas pisando el cristal en primera persona.
   */
  drawPOVFeetOnLanding3D(ctx, W, H, camZ, now) {
    const st = this.bridgeState;
    if (!st) return;
    const anim = st.anim;
    const tileX = (anim.playerLane - 1.5) * 0.94;
    const footPos = this.project3D(tileX, 0.01, anim.playerRow, W, H, camZ);
    const s = Math.max(0.8, footPos.scale / 95);

    ctx.save();
    ctx.translate(footPos.x, footPos.y);

    // Sombra de contacto bajo las dos zapatillas sobre el vidrio
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-11 * s, 2 * s, 9 * s, 4.5 * s, -0.1, 0, Math.PI * 2);
    ctx.ellipse(11 * s, 2 * s, 9 * s, 4.5 * s, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Zapatillas blancas vistas desde arriba en primera persona (POV mirando al piso)
    [-1, 1].forEach(dir => {
      const fx = dir * 11 * s;
      ctx.save();
      ctx.translate(fx, 0);
      ctx.rotate(dir * 0.08);

      // Suela de goma exterior
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-6.2 * s, -14 * s, 12.4 * s, 20 * s, 5 * s);
      ctx.fill();

      // Cuerpo blanco de la zapatilla apuntando hacia adelante
      const shoeGrad = ctx.createLinearGradient(0, -14 * s, 0, 6 * s);
      shoeGrad.addColorStop(0, '#ffffff');
      shoeGrad.addColorStop(0.7, '#f1f5f9');
      shoeGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = shoeGrad;
      ctx.beginPath();
      ctx.roundRect(-5.5 * s, -13 * s, 11 * s, 18 * s, 4.5 * s);
      ctx.fill();

      // Cordones blancos y lengüeta
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = Math.max(1, 1.2 * s);
      for (let l = -8; l <= -2; l += 3) {
        ctx.beginPath();
        ctx.moveTo(-3.2 * s, l * s);
        ctx.lineTo(3.2 * s, l * s);
        ctx.stroke();
      }

      // Bajo del pantalón verde deportivo Squid Game llegando al tobillo
      const pantGrad = ctx.createLinearGradient(-6 * s, 0, 6 * s, 14 * s);
      pantGrad.addColorStop(0, '#0d7a5f');
      pantGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = pantGrad;
      ctx.beginPath();
      ctx.roundRect(-6.5 * s, 2 * s, 13 * s, 16 * s, 4 * s);
      ctx.fill();

      ctx.restore();
    });

    // Etiqueta visual sobre el vidrio al mirar al piso
    if (anim.camMode === 'POV_FLOOR_CHECK_SAFE') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
      ctx.beginPath();
      ctx.roundRect(-68 * s * 0.6, -34 * s, 136 * s * 0.6, 16 * s, 6 * s);
      ctx.fill();
      ctx.fillStyle = '#022c22';
      ctx.font = `900 ${Math.max(10, Math.round(8.5 * s))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓ VIDRIO TEMPLADO', 0, -26 * s);
    } else if (anim.camMode === 'POV_FLOOR_CRACK') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.95)';
      ctx.beginPath();
      ctx.roundRect(-68 * s * 0.6, -34 * s, 136 * s * 0.6, 16 * s, 6 * s);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.max(10, Math.round(8.5 * s))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕ ¡VIDRIO FALSO!', 0, -26 * s);
    }

    ctx.restore();
  }

  /**
   * Dibuja los brazos y manos anatómicas en Primera Persona (POV) del jugador que va a saltar (#456, #058 o #100)
   */
  drawPOVForegroundHands3D(ctx, W, H, now) {
    const st = this.bridgeState;
    if (!st || st.isGameOver || st.isVictory) return;
    const anim = st.anim;

    const isFallingPOV = anim.camMode === 'POV_FALLING';
    const isJumpingPOV = anim.camMode === 'POV_JUMPING' || anim.camMode === 'POV_RELAY_JUMP';
    const activeJumperNum = anim.playerNumber || '456';
    const baseScale = Math.min(W, H) / 340;
    const swayX = Math.sin(now * 0.0032) * 5 * baseScale;
    const breatheY = Math.cos(now * 0.0045) * 4 * baseScale;

    if (isFallingPOV) {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const fallT = Math.min(1, elapsed / anim.phaseDuration);
      const vigGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.15, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      vigGrad.addColorStop(0, 'rgba(225, 29, 72, 0)');
      vigGrad.addColorStop(1, `rgba(225, 29, 72, ${0.42 + fallT * 0.35})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(224, 242, 254, 0.30)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 14; i++) {
        const lx = ((i * 73 + Math.floor(now * 0.2)) % W);
        const ly = ((i * 59 + Math.floor(now * 1.4)) % H);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly - 48 * baseScale);
        ctx.stroke();
      }
    }

    [-1, 1].forEach(side => {
      ctx.save();
      const cornerX = side < 0 ? W * 0.16 + swayX : W * 0.84 - swayX;
      const jumpLift = isJumpingPOV ? -18 * baseScale : 0;
      const fallArmLift = isFallingPOV
        ? -H * 0.22 + Math.sin(now * 0.025 + side) * 18 * baseScale
        : jumpLift;
      const cornerY = H + 10 * baseScale + breatheY + fallArmLift;

      ctx.translate(cornerX, cornerY);
      const angle = isFallingPOV
        ? side * (-0.26 + Math.sin(now * 0.02 + side) * 0.18)
        : side * -0.40;
      ctx.rotate(angle);

      const s = baseScale * 2.22;

      const sleeveGrad = ctx.createLinearGradient(-14 * s, -45 * s, 14 * s, 10 * s);
      sleeveGrad.addColorStop(0, '#10b981');
      sleeveGrad.addColorStop(0.5, '#0d7a5f');
      sleeveGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = sleeveGrad;
      ctx.beginPath();
      ctx.roundRect(-11 * s, -36 * s, 22 * s, 52 * s, 8 * s);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect((side < 0 ? -9.5 : 5.5) * s, -32 * s, 2.2 * s, 42 * s);
      ctx.fillRect((side < 0 ? -5.8 : 1.8) * s, -32 * s, 1.8 * s, 42 * s);

      // Parche en la manga con el número del jugador que tiene el POV activo (#456, #058 o #100)
      ctx.fillStyle = 'rgba(248, 250, 252, 0.96)';
      ctx.beginPath();
      ctx.roundRect(-8.8 * s, -22 * s, 17.6 * s, 9.8 * s, 2.2 * s);
      ctx.fill();
      ctx.fillStyle = '#064e3b';
      ctx.font = `900 ${Math.max(8, Math.round(7.6 * s))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${activeJumperNum}`, 0, -17.1 * s);

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(-9.5 * s, -40 * s, 19 * s, 5 * s, 2 * s);
      ctx.fill();

      ctx.save();
      ctx.translate(0, -43 * s);
      ctx.scale(1, -1);
      this.drawRealisticHand3D(ctx, 0, 0, s * 1.55, side, isFallingPOV || isJumpingPOV, false);
      ctx.restore();

      ctx.restore();
    });
  }

  drawArenaEnvironment3D(ctx, W, H, camZ, totalSteps, now) {
    const wallGrad = ctx.createLinearGradient(0, 0, 0, H);
    wallGrad.addColorStop(0, '#09060e');
    wallGrad.addColorStop(0.22, '#180a1c');
    wallGrad.addColorStop(0.55, '#1d0d22');
    wallGrad.addColorStop(0.82, '#100716');
    wallGrad.addColorStop(1, '#060309');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, W, H);

    const pleatCount = 18;
    const arenaTopY = H * 0.04;
    const arenaFloorY = H * 0.96;
    for (let i = 0; i < pleatCount; i++) {
      const x0 = (i / pleatCount) * W;
      const x1 = ((i + 1) / pleatCount) * W;
      const distCenter = Math.abs((i + 0.5) / pleatCount - 0.5) * 2;
      const shade = 0.12 + distCenter * 0.22;
      const pGrad = ctx.createLinearGradient(x0, 0, x1, 0);
      pGrad.addColorStop(0, `rgba(45, 10, 24, ${shade})`);
      pGrad.addColorStop(0.5, `rgba(110, 22, 48, ${shade * 1.35})`);
      pGrad.addColorStop(1, `rgba(28, 6, 16, ${shade})`);
      ctx.fillStyle = pGrad;
      ctx.fillRect(x0, arenaTopY, x1 - x0 + 1, arenaFloorY - arenaTopY);
    }

    [-5.2, 5.2].forEach(wx => {
      const pNear = this.project3D(wx, -1.2, camZ + 0.5, W, H, camZ);
      const pFar = this.project3D(wx, -1.2, totalSteps + 3, W, H, camZ);
      const pNearTop = this.project3D(wx, 1.8, camZ + 0.5, W, H, camZ);
      const pFarTop = this.project3D(wx, 1.8, totalSteps + 3, W, H, camZ);

      ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pNear.x, pNear.y);
      ctx.lineTo(pFar.x, pFar.y);
      ctx.moveTo(pNearTop.x, pNearTop.y);
      ctx.lineTo(pFarTop.x, pFarTop.y);
      ctx.stroke();
    });

    const spotlightRows = [camZ + 1.2, camZ + 4.5, camZ + 8.5];
    spotlightRows.forEach((sz, idx) => {
      const leftTruss = this.project3D(-4.2, 3.3, sz, W, H, camZ);
      const rightTruss = this.project3D(4.2, 3.3, sz, W, H, camZ);
      if (leftTruss.y > -40 && leftTruss.y < H * 0.45) {
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
        ctx.lineWidth = Math.max(1.5, 4.5 * (leftTruss.scale / 120));
        ctx.beginPath();
        ctx.moveTo(leftTruss.x, leftTruss.y);
        ctx.lineTo(rightTruss.x, rightTruss.y);
        ctx.stroke();

        [-1.35, 1.35].forEach((lx, lIdx) => {
          const lampPos = this.project3D(lx, 3.15, sz, W, H, camZ);
          const targetFloor = this.project3D(lx * 0.75, 0, sz - 0.3, W, H, camZ);
          const coneSpread = Math.max(45, 135 * (targetFloor.scale / 110));

          const sway = Math.sin(now * 0.0015 + idx + lIdx) * 6;
          const coneGrad = ctx.createLinearGradient(lampPos.x, lampPos.y, targetFloor.x + sway, targetFloor.y + 40);
          coneGrad.addColorStop(0, lIdx === 0 ? 'rgba(254, 240, 138, 0.22)' : 'rgba(186, 230, 253, 0.20)');
          coneGrad.addColorStop(0.55, lIdx === 0 ? 'rgba(244, 63, 94, 0.07)' : 'rgba(56, 189, 248, 0.07)');
          coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.save();
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(lampPos.x - 4, lampPos.y);
          ctx.lineTo(lampPos.x + 4, lampPos.y);
          ctx.lineTo(targetFloor.x + sway + coneSpread, targetFloor.y + 55);
          ctx.lineTo(targetFloor.x + sway - coneSpread, targetFloor.y + 55);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(lampPos.x - 5, lampPos.y - 4, 10, 5);
          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(lampPos.x, lampPos.y + 1, Math.max(2, 4 * (lampPos.scale / 110)), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
    });

    const abyssFog = ctx.createLinearGradient(0, H * 0.65, 0, H);
    abyssFog.addColorStop(0, 'rgba(15, 23, 42, 0)');
    abyssFog.addColorStop(0.7, 'rgba(9, 13, 26, 0.45)');
    abyssFog.addColorStop(1, 'rgba(4, 6, 14, 0.78)');
    ctx.fillStyle = abyssFog;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);

    (this.bridgeState?.anim?.dustMotes || []).forEach((m, idx) => {
      const mz = ((m.z - camZ * 0.35) % 12 + 12) % 12 + camZ - 0.5;
      const mp = this.project3D(m.x, m.y + Math.sin(now * m.speed + m.phase) * 0.25, mz, W, H, camZ);
      const alpha = 0.16 + 0.16 * Math.sin(now * 0.003 + idx);
      ctx.fillStyle = `rgba(254, 249, 195, ${alpha})`;
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, Math.max(0.8, m.r * (mp.scale / 140)), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawSideTowersAndGuards(ctx, W, H, camZ, now = 0) {
    const towerZ = Math.max(camZ + 5.8, 6.8);
    [-3.35, 3.35].forEach(tx => {
      const top = this.project3D(tx, 0.85, towerZ, W, H, camZ);
      const bot = this.project3D(tx, -7.5, towerZ, W, H, camZ);
      const w = 36 * (top.scale / 100);
      const sideW = w * 0.38;

      const grad = ctx.createLinearGradient(top.x - w, top.y, top.x + w, bot.y);
      grad.addColorStop(0, '#7c2d12');
      grad.addColorStop(0.35, '#581c0c');
      grad.addColorStop(0.75, '#290d07');
      grad.addColorStop(1, '#0c0403');
      ctx.fillStyle = grad;
      ctx.fillRect(top.x - w, top.y, w * 2, bot.y - top.y);

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.lineWidth = 1;
      for (let yLine = top.y + 16; yLine < bot.y; yLine += 18) {
        ctx.beginPath();
        ctx.moveTo(top.x - w, yLine);
        ctx.lineTo(top.x + w, yLine);
        ctx.stroke();
      }

      ctx.fillStyle = '#1f0906';
      if (tx < 0) {
        ctx.fillRect(top.x + w, top.y, sideW, bot.y - top.y);
      } else {
        ctx.fillRect(top.x - w - sideW, top.y, sideW, bot.y - top.y);
      }

      ctx.fillStyle = '#9a3412';
      ctx.fillRect(top.x - w * 1.08, top.y - 5, w * 2.16, 7);

      this.drawPinkGuardFigure(ctx, top.x, top.y - 3, top.scale * 0.72, tx < 0 ? 'triangle' : 'square', now);
    });
  }

  drawGoalPlatformAndDoorway(ctx, W, H, camZ, totalSteps, now = 0) {
    const zStart = totalSteps - 0.35;
    const zEnd = totalSteps + 1.85;

    const pFL = this.project3D(-2.1, 0, zStart, W, H, camZ);
    const pFR = this.project3D(2.1, 0, zStart, W, H, camZ);
    const pBR = this.project3D(2.1, 0, zEnd, W, H, camZ);
    const pBL = this.project3D(-2.1, 0, zEnd, W, H, camZ);

    const pFL_bot = this.project3D(-2.1, -0.26, zStart, W, H, camZ);
    const pFR_bot = this.project3D(2.1, -0.26, zStart, W, H, camZ);
    const pierBotL = this.project3D(-1.7, -6.5, zStart + 0.2, W, H, camZ);
    const pierBotR = this.project3D(1.7, -6.5, zStart + 0.2, W, H, camZ);

    const pierW = Math.max(8, 22 * (pFL.scale / 100));
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(pFL_bot.x + pierW * 0.4, pFL_bot.y, pierW, pierBotL.y - pFL_bot.y);
    ctx.fillRect(pFR_bot.x - pierW * 1.4, pFR_bot.y, pierW, pierBotR.y - pFR_bot.y);

    ctx.beginPath();
    ctx.moveTo(pFL.x, pFL.y);
    ctx.lineTo(pFR.x, pFR.y);
    ctx.lineTo(pFR_bot.x, pFR_bot.y);
    ctx.lineTo(pFL_bot.x, pFL_bot.y);
    ctx.closePath();
    ctx.fillStyle = '#450a0a';
    ctx.fill();

    const platGrad = ctx.createLinearGradient(0, pBR.y, 0, pFL.y);
    platGrad.addColorStop(0, '#7f1d1d');
    platGrad.addColorStop(0.5, '#b91c1c');
    platGrad.addColorStop(1, '#991b1b');
    ctx.beginPath();
    ctx.moveTo(pFL.x, pFL.y);
    ctx.lineTo(pFR.x, pFR.y);
    ctx.lineTo(pBR.x, pBR.y);
    ctx.lineTo(pBL.x, pBL.y);
    ctx.closePath();
    ctx.fillStyle = platGrad;
    ctx.fill();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    const stairSteps = 6;
    for (let s = 0; s < stairSteps; s++) {
      const sz = zEnd + s * 0.25;
      const sy = s * 0.22;
      const sL = this.project3D(-1.42, sy, sz, W, H, camZ);
      const sR = this.project3D(1.42, sy, sz, W, H, camZ);
      const sH = Math.max(3.5, 7 * (sL.scale / 100));
      ctx.fillStyle = s % 2 === 0 ? '#64748b' : '#475569';
      ctx.fillRect(sL.x, sL.y - sH, sR.x - sL.x, sH);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(sL.x, sL.y - sH, sR.x - sL.x, sH);
    }

    const doorZ = zEnd + stairSteps * 0.25 + 0.2;
    const doorBaseY = stairSteps * 0.22;
    const dCenter = this.project3D(0, doorBaseY, doorZ, W, H, camZ);
    const dW = 76 * (dCenter.scale / 100);
    const dH = 122 * (dCenter.scale / 100);

    const archGrad = ctx.createLinearGradient(dCenter.x - dW, dCenter.y - dH, dCenter.x + dW, dCenter.y);
    archGrad.addColorStop(0, '#64748b');
    archGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = archGrad;
    ctx.beginPath();
    ctx.moveTo(dCenter.x - dW, dCenter.y);
    ctx.lineTo(dCenter.x - dW, dCenter.y - dH * 0.74);
    ctx.lineTo(dCenter.x - dW * 0.56, dCenter.y - dH);
    ctx.lineTo(dCenter.x + dW * 0.56, dCenter.y - dH);
    ctx.lineTo(dCenter.x + dW, dCenter.y - dH * 0.74);
    ctx.lineTo(dCenter.x + dW, dCenter.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const innerW = dW * 0.72;
    const innerH = dH * 0.85;
    const portalGrad = ctx.createLinearGradient(dCenter.x, dCenter.y - innerH, dCenter.x, dCenter.y);
    portalGrad.addColorStop(0, '#090514');
    portalGrad.addColorStop(0.65, '#1e1035');
    portalGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.moveTo(dCenter.x - innerW, dCenter.y);
    ctx.lineTo(dCenter.x - innerW, dCenter.y - innerH * 0.75);
    ctx.lineTo(dCenter.x - innerW * 0.52, dCenter.y - innerH);
    ctx.lineTo(dCenter.x + innerW * 0.52, dCenter.y - innerH);
    ctx.lineTo(dCenter.x + innerW, dCenter.y - innerH * 0.75);
    ctx.lineTo(dCenter.x + innerW, dCenter.y);
    ctx.closePath();
    ctx.fill();

    const gLeft = this.project3D(-1.05, 0, zEnd - 0.15, W, H, camZ);
    const gRight = this.project3D(1.05, 0, zEnd - 0.15, W, H, camZ);
    this.drawPinkGuardFigure(ctx, gLeft.x, gLeft.y, gLeft.scale * 0.92, 'circle', now);
    this.drawPinkGuardFigure(ctx, gRight.x, gRight.y, gRight.scale * 0.92, 'triangle', now);
  }

  drawPinkGuardFigure(ctx, x, y, scale, maskShape = 'circle', now = 0) {
    const s = Math.max(0.2, scale / 108);
    const breathe = now > 0 ? Math.sin(now * 0.003 + x) * 0.8 * s : 0;

    const shGrad = ctx.createRadialGradient(x, y, 2 * s, x, y, 13 * s);
    shGrad.addColorStop(0, 'rgba(0,0,0,0.68)');
    shGrad.addColorStop(0.6, 'rgba(0,0,0,0.32)');
    shGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, 13 * s, 4.8 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.ellipse(x - 4 * s, y - 1 * s, 3.4 * s, 2.1 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 4 * s, y - 1 * s, 3.4 * s, 2.1 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const suitGrad = ctx.createLinearGradient(x - 9 * s, y - 44 * s, x + 9 * s, y);
    suitGrad.addColorStop(0, '#fb7185');
    suitGrad.addColorStop(0.45, '#e11d48');
    suitGrad.addColorStop(1, '#881337');
    ctx.fillStyle = suitGrad;
    ctx.beginPath();
    ctx.roundRect(x - 6.5 * s, y - 22 * s, 5.2 * s, 21 * s, 2.2 * s);
    ctx.roundRect(x + 1.3 * s, y - 22 * s, 5.2 * s, 21 * s, 2.2 * s);
    ctx.fill();

    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.roundRect(x - 11.5 * s, y - 41 * s + breathe, 3.8 * s, 16 * s, 2 * s);
    ctx.roundRect(x + 7.7 * s, y - 41 * s + breathe, 3.8 * s, 16 * s, 2 * s);
    ctx.fill();
    this.drawRealisticHand3D(ctx, x - 9.6 * s, y - 24.5 * s + breathe, s * 0.72, -1, false, true);
    this.drawRealisticHand3D(ctx, x + 9.6 * s, y - 24.5 * s + breathe, s * 0.72, 1, false, true);

    ctx.fillStyle = suitGrad;
    ctx.beginPath();
    ctx.roundRect(x - 8.5 * s, y - 43 * s + breathe, 17 * s, 23 * s, 4.5 * s);
    ctx.fill();

    ctx.fillStyle = '#09090b';
    ctx.fillRect(x - 8.5 * s, y - 25 * s + breathe * 0.5, 17 * s, 3.2 * s);
    ctx.fillRect(x - 0.9 * s, y - 42 * s + breathe, 1.8 * s, 17 * s);

    ctx.fillStyle = suitGrad;
    ctx.beginPath();
    ctx.arc(x, y - 51 * s + breathe, 9.5 * s, 0, Math.PI * 2);
    ctx.fill();

    const maskGrad = ctx.createRadialGradient(x - 2 * s, y - 53 * s + breathe, 1 * s, x, y - 51 * s + breathe, 8 * s);
    maskGrad.addColorStop(0, '#374151');
    maskGrad.addColorStop(0.5, '#111827');
    maskGrad.addColorStop(1, '#030712');
    ctx.fillStyle = maskGrad;
    ctx.beginPath();
    ctx.arc(x, y - 51 * s + breathe, 7.4 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.2, 1.8 * s);
    ctx.beginPath();
    if (maskShape === 'circle') {
      ctx.arc(x, y - 51 * s + breathe, 3.6 * s, 0, Math.PI * 2);
    } else if (maskShape === 'triangle') {
      ctx.moveTo(x, y - 55 * s + breathe);
      ctx.lineTo(x - 4.2 * s, y - 48 * s + breathe);
      ctx.lineTo(x + 4.2 * s, y - 48 * s + breathe);
      ctx.closePath();
    } else {
      ctx.rect(x - 3.4 * s, y - 54.4 * s + breathe, 6.8 * s, 6.8 * s);
    }
    ctx.stroke();
  }

  drawBridgeRailsAndLights(ctx, W, H, camZ, totalSteps, now) {
    const zNear = Math.max(-0.8, camZ - 0.95);
    const zFar = totalSteps - 0.35;

    const cFL = this.project3D(-0.12, -0.025, zNear, W, H, camZ);
    const cFR = this.project3D(0.12, -0.025, zNear, W, H, camZ);
    const cBR = this.project3D(0.12, -0.025, zFar, W, H, camZ);
    const cBL = this.project3D(-0.12, -0.025, zFar, W, H, camZ);

    ctx.beginPath();
    ctx.moveTo(cFL.x, cFL.y);
    ctx.lineTo(cFR.x, cFR.y);
    ctx.lineTo(cBR.x, cBR.y);
    ctx.lineTo(cBL.x, cBL.y);
    ctx.closePath();
    ctx.fillStyle = '#be123c';
    ctx.fill();

    const railXs = [-1.96, -0.98, -0.12, 0.12, 0.98, 1.96];
    railXs.forEach((rx, idx) => {
      const pTop1 = this.project3D(rx, -0.015, zNear, W, H, camZ);
      const pTop2 = this.project3D(rx, -0.015, zFar, W, H, camZ);
      const pBot1 = this.project3D(rx, -0.11, zNear, W, H, camZ);
      const pBot2 = this.project3D(rx, -0.11, zFar, W, H, camZ);

      ctx.beginPath();
      ctx.moveTo(pTop1.x, pTop1.y);
      ctx.lineTo(pTop2.x, pTop2.y);
      ctx.lineTo(pBot2.x, pBot2.y);
      ctx.lineTo(pBot1.x, pBot1.y);
      ctx.closePath();
      ctx.fillStyle = (idx === 2 || idx === 3) ? '#881337' : '#334155';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pTop1.x, pTop1.y);
      ctx.lineTo(pTop2.x, pTop2.y);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = (idx === 0 || idx === 5) ? 4.2 : 2.2;
      ctx.stroke();
    });

    const bulbColors = ['#facc15', '#38bdf8', '#f43f5e', '#4ade80'];
    for (let i = 0; i <= totalSteps * 2; i++) {
      const bz = i * 0.5 - 0.3;
      if (bz < zNear || bz > zFar) continue;
      const color = bulbColors[i % bulbColors.length];
      const pulse = 0.8 + 0.2 * Math.sin(now * 0.006 + i);

      [-2.06, 2.06].forEach(bx => {
        const bp = this.project3D(bx, 0.03, bz, W, H, camZ);
        const r = Math.max(2.2, 6 * (bp.scale / 115));
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 11 * pulse;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, r * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  }

  drawBridgeRowTiles(ctx, W, H, camZ, rowIdx, now) {
    const st = this.bridgeState;
    const isCurrentTargetRow = rowIdx === st.currentStep && !st.awaitingNextStep && !st.isVictory && !st.isGameOver;
    const zFront = rowIdx - 0.35;
    const zBack = rowIdx + 0.35;

    const barL = this.project3D(-1.94, -0.06, rowIdx, W, H, camZ);
    const barR = this.project3D(1.94, -0.06, rowIdx, W, H, camZ);
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.lineWidth = Math.max(1.5, 4 * (barL.scale / 120));
    ctx.beginPath();
    ctx.moveTo(barL.x, barL.y);
    ctx.lineTo(barR.x, barR.y);
    ctx.stroke();

    for (let lane = 0; lane < 4; lane++) {
      const tileStatus = st.tiles[rowIdx][lane];
      const xCenter = (lane - 1.5) * 0.94;
      const halfW = 0.40;

      const pFL = this.project3D(xCenter - halfW, 0, zFront, W, H, camZ);
      const pFR = this.project3D(xCenter + halfW, 0, zFront, W, H, camZ);
      const pBR = this.project3D(xCenter + halfW, 0, zBack, W, H, camZ);
      const pBL = this.project3D(xCenter - halfW, 0, zBack, W, H, camZ);

      const pFL_b = this.project3D(xCenter - halfW, -0.045, zFront, W, H, camZ);
      const pFR_b = this.project3D(xCenter + halfW, -0.045, zFront, W, H, camZ);

      if (isCurrentTargetRow && tileStatus !== 'broken') {
        st.anim.tileHitRegions.push({
          row: rowIdx,
          lane,
          poly: [pFL, pFR, pBR, pBL]
        });
      }

      if (tileStatus === 'broken') {
        ctx.save();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.38)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(pFL.x, pFL.y);
        ctx.lineTo(pFL.x * 0.78 + pFR.x * 0.22, pFL.y * 0.78 + pFR.y * 0.22);
        ctx.lineTo(pBL.x * 0.85 + pBR.x * 0.15, pBL.y * 0.85 + pBR.y * 0.15);
        ctx.lineTo(pBL.x, pBL.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pFR.x, pFR.y);
        ctx.lineTo(pFR.x * 0.8 + pFL.x * 0.2, pFR.y * 0.8 + pFL.y * 0.2);
        ctx.lineTo(pBR.x * 0.82 + pBL.x * 0.18, pBR.y * 0.82 + pBL.y * 0.18);
        ctx.lineTo(pBR.x, pBR.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        continue;
      }

      const isHovered = isCurrentTargetRow && st.anim.hoveredLane === lane;

      ctx.beginPath();
      ctx.moveTo(pFL.x, pFL.y);
      ctx.lineTo(pFR.x, pFR.y);
      ctx.lineTo(pFR_b.x, pFR_b.y);
      ctx.lineTo(pFL_b.x, pFL_b.y);
      ctx.closePath();
      ctx.fillStyle = tileStatus === 'safe' ? 'rgba(16, 185, 129, 0.65)' : 'rgba(14, 165, 233, 0.48)';
      ctx.fill();

      const glassGrad = ctx.createLinearGradient(pFL.x, pFL.y, pBR.x, pBR.y);
      let strokeStyle = 'rgba(186, 230, 253, 0.75)';

      if (tileStatus === 'safe') {
        glassGrad.addColorStop(0, 'rgba(52, 211, 153, 0.58)');
        glassGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.42)');
        glassGrad.addColorStop(1, 'rgba(6, 182, 212, 0.52)');
        strokeStyle = '#6ee7b7';
      } else if (isHovered) {
        glassGrad.addColorStop(0, 'rgba(125, 211, 252, 0.68)');
        glassGrad.addColorStop(1, 'rgba(56, 189, 248, 0.45)');
        strokeStyle = '#ffffff';
      } else if (isCurrentTargetRow) {
        const pulse = 0.36 + 0.09 * Math.sin(now * 0.006 + lane);
        glassGrad.addColorStop(0, `rgba(103, 232, 249, ${pulse + 0.08})`);
        glassGrad.addColorStop(1, `rgba(14, 165, 233, ${pulse - 0.04})`);
        strokeStyle = '#a5f3fc';
      } else {
        glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
        glassGrad.addColorStop(1, 'rgba(15, 118, 110, 0.24)');
        strokeStyle = 'rgba(148, 163, 184, 0.5)';
      }

      ctx.beginPath();
      ctx.moveTo(pFL.x, pFL.y);
      ctx.lineTo(pFR.x, pFR.y);
      ctx.lineTo(pBR.x, pBR.y);
      ctx.lineTo(pBL.x, pBL.y);
      ctx.closePath();
      ctx.fillStyle = glassGrad;
      ctx.fill();
      ctx.lineWidth = isCurrentTargetRow ? 2.4 : 1.3;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pFL.x * 0.78 + pFR.x * 0.22, pFL.y * 0.78 + pFR.y * 0.22);
      ctx.lineTo(pBL.x * 0.48 + pBR.x * 0.52, pBL.y * 0.48 + pBR.y * 0.52);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.lineWidth = Math.max(1.2, 3.6 * (pFL.scale / 135));
      ctx.stroke();

      // Si está mirando al piso mientras el cristal se agrieta bajo sus pies ('POV_FLOOR_CRACK')
      if (
        (st.anim.camMode === 'POV_FLOOR_CRACK' || (st.anim.camMode === 'POV_JUMPING' && st.anim.jumpWillBreak)) &&
        rowIdx === st.anim.jumpTargetRow &&
        lane === st.anim.jumpTargetLane
      ) {
        const c = this.project3D(xCenter, 0.01, rowIdx, W, H, camZ);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2.0;
        (st.anim.cracks || []).forEach(cr => {
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(
            c.x + Math.cos(cr.angle) * cr.len * c.scale * 0.65,
            c.y + Math.sin(cr.angle) * cr.len * c.scale * 0.36
          );
          ctx.stroke();
        });
        ctx.restore();
      }

      if (isCurrentTargetRow || rowIdx === st.currentStep) {
        const center = this.project3D(xCenter, 0.02, rowIdx, W, H, camZ);
        const letter = this.optionForLaneIndex(lane);
        const badgeR = Math.max(10, 13.5 * (center.scale / 120));
        ctx.save();
        ctx.fillStyle = isHovered ? 'rgba(16, 185, 129, 0.94)' : 'rgba(15, 23, 42, 0.78)';
        ctx.beginPath();
        ctx.arc(center.x, center.y, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(125, 211, 252, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = `900 ${Math.max(11, Math.round(14.5 * (center.scale / 120)))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(letter, center.x, center.y + 0.5);
        ctx.restore();
      }
    }

    st.anim.shockwaves.filter(sw => sw.row === rowIdx).forEach(sw => {
      const xCenter = (sw.lane - 1.5) * 0.94;
      const c = this.project3D(xCenter, 0.02, rowIdx, W, H, camZ);
      ctx.save();
      ctx.strokeStyle = `rgba(52, 211, 153, ${sw.alpha})`;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, sw.radius * c.scale * 0.62, sw.radius * c.scale * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  drawStartingGreenPlatform(ctx, W, H, camZ) {
    const zStart = -2.10;
    const zEnd = -0.34;
    const pFL = this.project3D(-2.35, 0, zStart, W, H, camZ);
    const pFR = this.project3D(2.35, 0, zStart, W, H, camZ);
    const pBR = this.project3D(2.35, 0, zEnd, W, H, camZ);
    const pBL = this.project3D(-2.35, 0, zEnd, W, H, camZ);

    const pBL_bot = this.project3D(-2.35, -0.26, zEnd, W, H, camZ);
    const pBR_bot = this.project3D(2.35, -0.26, zEnd, W, H, camZ);

    ctx.beginPath();
    ctx.moveTo(pBL.x, pBL.y);
    ctx.lineTo(pBR.x, pBR.y);
    ctx.lineTo(pBR_bot.x, pBR_bot.y);
    ctx.lineTo(pBL_bot.x, pBL_bot.y);
    ctx.closePath();
    ctx.fillStyle = '#022c22';
    ctx.fill();

    const greenGrad = ctx.createLinearGradient(0, pBR.y, 0, Math.max(H, pFL.y));
    greenGrad.addColorStop(0, '#059669');
    greenGrad.addColorStop(0.5, '#047857');
    greenGrad.addColorStop(1, '#064e3b');
    ctx.beginPath();
    ctx.moveTo(pFL.x, Math.max(H + 10, pFL.y));
    ctx.lineTo(pFR.x, Math.max(H + 10, pFR.y));
    ctx.lineTo(pBR.x, pBR.y);
    ctx.lineTo(pBL.x, pBL.y);
    ctx.closePath();
    ctx.fillStyle = greenGrad;
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawFallingShards(ctx, W, H, camZ) {
    const shards = this.bridgeState?.anim?.shards || [];
    shards.forEach(s => {
      const p = this.project3D(s.x, s.y, s.z, W, H, camZ);
      const sz = s.size * (p.scale / 108);
      const tiltScale = s.tilt !== undefined ? Math.max(0.25, Math.abs(Math.cos(s.tilt))) : 0.7;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(s.rot);
      ctx.scale(1, tiltScale);

      const shardGrad = ctx.createLinearGradient(-sz, -sz, sz, sz);
      shardGrad.addColorStop(0, `rgba(224, 242, 254, ${s.alpha * 0.95})`);
      shardGrad.addColorStop(0.5, `rgba(56, 189, 248, ${s.alpha * 0.78})`);
      shardGrad.addColorStop(1, `rgba(14, 165, 233, ${s.alpha * 0.55})`);
      ctx.fillStyle = shardGrad;
      ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      const pts = s.pts || [{ x: 0, y: -1 }, { x: 0.85, y: 0.6 }, { x: -0.7, y: 0.8 }];
      pts.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x * sz, pt.y * sz);
        else ctx.lineTo(pt.x * sz, pt.y * sz);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    const sparks = this.bridgeState?.anim?.sparks || [];
    sparks.forEach(sp => {
      const p = this.project3D(sp.x, sp.y, sp.z, W, H, camZ);
      ctx.save();
      ctx.fillStyle = `rgba(224, 242, 254, ${sp.alpha})`;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, sp.r * (p.scale / 115)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawRealisticHand3D(ctx, x, y, s, side = 1, isOpen = false, isGloved = false) {
    ctx.save();
    ctx.translate(x, y);

    const palmGrad = ctx.createLinearGradient(-3 * s, -2 * s, 3 * s, 4 * s);
    if (isGloved) {
      palmGrad.addColorStop(0, '#27272a');
      palmGrad.addColorStop(0.5, '#18181b');
      palmGrad.addColorStop(1, '#09090b');
    } else {
      palmGrad.addColorStop(0, '#f7d3b5');
      palmGrad.addColorStop(0.55, '#e2ab82');
      palmGrad.addColorStop(1, '#b87d55');
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(0, -1.2 * s, 2.3 * s, 0.9 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palmGrad;
    ctx.beginPath();
    ctx.roundRect(-2.4 * s, -0.8 * s, 4.8 * s, 3.8 * s, 1.5 * s);
    ctx.fill();

    const thumbDir = -side;
    const thumbSpread = isOpen ? 0.48 : 0.28;
    ctx.save();
    ctx.translate(thumbDir * 2.1 * s, 0.6 * s);
    ctx.rotate(thumbDir * thumbSpread);
    ctx.fillStyle = palmGrad;
    ctx.beginPath();
    ctx.roundRect(-0.85 * s, 0, 1.7 * s, 3.1 * s, 0.85 * s);
    ctx.fill();
    ctx.restore();

    const fingerOffsets = [-1.65, -0.55, 0.55, 1.65];
    const fingerLengths = [3.1, 3.5, 3.2, 2.5];
    fingerOffsets.forEach((fx, idx) => {
      const fLen = (isOpen ? fingerLengths[idx] * 1.15 : fingerLengths[idx] * 0.92) * s;
      const spreadAngle = isOpen ? (idx - 1.5) * 0.11 : (idx - 1.5) * 0.03;
      ctx.save();
      ctx.translate(fx * s, 2.5 * s);
      ctx.rotate(spreadAngle);
      ctx.fillStyle = palmGrad;
      ctx.beginPath();
      ctx.roundRect(-0.56 * s, 0, 1.12 * s, fLen, 0.55 * s);
      ctx.fill();

      ctx.fillStyle = isGloved ? 'rgba(0,0,0,0.4)' : 'rgba(138, 86, 52, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0.3 * s, 0.42 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * Dibuja a los 3 jugadores (#456, #058, #100) durante el plano general de presentación ('INTRO_SQUAD')
   */
  drawSquidPlayer3D(
    ctx,
    W,
    H,
    camZ,
    worldX,
    worldY,
    worldZ,
    numberText,
    extraScale = 1,
    rotation = 0,
    hasShield = false,
    now = 0,
    jumpPhase = 0,
    landingSquash = 0,
    isFalling = false
  ) {
    const charSeed = parseInt(numberText || '456', 10) * 0.17;
    const isIdle = worldY === 0 && jumpPhase === 0 && !isFalling && now > 0;

    const breathePhase = now * 0.0042 + charSeed;
    const swayPhase = now * 0.0024 + charSeed * 1.7;
    const breathLift = isIdle ? Math.sin(breathePhase) * 0.018 : 0;
    const hipSwayX = isIdle ? Math.cos(swayPhase) * 0.018 : 0;
    const shoulderBreath = isIdle ? Math.sin(breathePhase) * 0.7 : 0;
    const headLookX = isIdle ? Math.sin(now * 0.0018 + charSeed) * 1.4 : 0;
    const idleArmSwing = isIdle ? Math.sin(swayPhase) * 0.065 : 0;

    if (!isFalling && worldY >= -0.15) {
      const lightOffsetX = worldX * 0.08;
      const shadowPos = this.project3D(worldX + lightOffsetX, 0, worldZ - 0.03, W, H, camZ);
      const footBasePos = this.project3D(worldX + hipSwayX, 0, worldZ, W, H, camZ);
      const heightAttenuation = Math.max(0.22, 1 - worldY * 0.45);
      const shScale = (shadowPos.scale / 110) * extraScale;
      const shR = Math.max(6, 24 * shScale * (1 + worldY * 0.25));

      const shGrad = ctx.createRadialGradient(shadowPos.x, shadowPos.y, shR * 0.08, shadowPos.x, shadowPos.y, shR);
      shGrad.addColorStop(0, `rgba(0, 0, 0, ${0.68 * heightAttenuation})`);
      shGrad.addColorStop(0.55, `rgba(0, 0, 0, ${0.34 * heightAttenuation})`);
      shGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.save();
      ctx.fillStyle = shGrad;
      ctx.beginPath();
      ctx.ellipse(shadowPos.x, shadowPos.y, shR, shR * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      if (worldY < 0.12) {
        const aoAlpha = Math.max(0, (1 - worldY * 7) * 0.78);
        ctx.fillStyle = `rgba(0, 0, 0, ${aoAlpha})`;
        ctx.beginPath();
        ctx.ellipse(footBasePos.x - 7.5 * shScale, footBasePos.y, 6.2 * shScale, 2.5 * shScale, -0.08, 0, Math.PI * 2);
        ctx.ellipse(footBasePos.x + 7.5 * shScale, footBasePos.y, 6.2 * shScale, 2.5 * shScale, 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const pos = this.project3D(worldX + hipSwayX, worldY + breathLift, worldZ, W, H, camZ);
    const s = Math.max(0.16, (pos.scale / 100) * extraScale);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    const jumpArc = jumpPhase > 0 ? Math.sin(jumpPhase * Math.PI) : 0;
    const leftLegLift = isFalling ? 7.5 * s : jumpArc * 8.5 * s;
    const rightLegLift = isFalling ? 3.2 * s : jumpArc * 5.8 * s;
    const armRaiseL = isFalling ? 1.05 : (jumpArc * 0.72 + idleArmSwing);
    const armRaiseR = isFalling ? 0.98 : (jumpArc * 0.72 - idleArmSwing);
    const handsOpen = isFalling || jumpPhase > 0.15;

    [-1, 1].forEach(dir => {
      const lift = dir < 0 ? leftLegLift : rightLegLift;
      const shoeX = dir * 7.4 * s;
      const shoeY = -lift;

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(shoeX - 5.4 * s, shoeY - 3.2 * s, 10.8 * s, 3.2 * s, 1.5 * s);
      ctx.fill();

      const shoeGrad = ctx.createLinearGradient(shoeX - 5 * s, shoeY - 6.5 * s, shoeX + 5 * s, shoeY - 1.5 * s);
      shoeGrad.addColorStop(0, '#ffffff');
      shoeGrad.addColorStop(0.65, '#f1f5f9');
      shoeGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = shoeGrad;
      ctx.beginPath();
      ctx.roundRect(shoeX - 5.0 * s, shoeY - 6.4 * s, 10.0 * s, 4.4 * s, [2.8 * s, 2.8 * s, 1 * s, 1 * s]);
      ctx.fill();

      ctx.fillStyle = '#0f766e';
      ctx.fillRect(shoeX - 2.6 * s, shoeY - 5.6 * s, 5.2 * s, 1.6 * s);
    });

    const legGradL = ctx.createLinearGradient(-12 * s, -26 * s, -3 * s, -26 * s);
    legGradL.addColorStop(0, '#044e3a');
    legGradL.addColorStop(0.45, '#0d7a5f');
    legGradL.addColorStop(1, '#022c22');
    ctx.fillStyle = legGradL;
    ctx.beginPath();
    ctx.roundRect(-11.4 * s, -26 * s - leftLegLift * 0.45, 8.0 * s, 21 * s - leftLegLift * 0.45, 3.6 * s);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-11.0 * s, -24.5 * s - leftLegLift * 0.45, 1.3 * s, 18 * s - leftLegLift * 0.45);

    const legGradR = ctx.createLinearGradient(3 * s, -26 * s, 12 * s, -26 * s);
    legGradR.addColorStop(0, '#022c22');
    legGradR.addColorStop(0.55, '#0d7a5f');
    legGradR.addColorStop(1, '#044e3a');
    ctx.fillStyle = legGradR;
    ctx.beginPath();
    ctx.roundRect(3.4 * s, -26 * s - rightLegLift * 0.45, 8.0 * s, 21 * s - rightLegLift * 0.45, 3.6 * s);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(9.7 * s, -24.5 * s - rightLegLift * 0.45, 1.3 * s, 18 * s - rightLegLift * 0.45);

    ctx.save();
    ctx.translate(-14.2 * s, (-48.5 - shoulderBreath) * s);
    ctx.rotate(0.12 + armRaiseL);
    const armGradL = ctx.createLinearGradient(-6 * s, 0, 1 * s, 0);
    armGradL.addColorStop(0, '#044e3a');
    armGradL.addColorStop(0.5, '#0d7a5f');
    armGradL.addColorStop(1, '#064e3b');
    ctx.fillStyle = armGradL;
    ctx.beginPath();
    ctx.roundRect(-5.6 * s, 0, 6.2 * s, 19.5 * s, 3.1 * s);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-5.0 * s, 1.8 * s, 1.4 * s, 15.5 * s);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(-5.2 * s, 18.2 * s, 5.4 * s, 2.0 * s, 0.8 * s);
    ctx.fill();
    this.drawRealisticHand3D(ctx, -2.5 * s, 20.6 * s, s * 0.92, -1, handsOpen, false);
    ctx.restore();

    ctx.save();
    ctx.translate(14.2 * s, (-48.5 - shoulderBreath) * s);
    ctx.rotate(-0.12 - armRaiseR);
    const armGradR = ctx.createLinearGradient(-1 * s, 0, 6 * s, 0);
    armGradR.addColorStop(0, '#064e3b');
    armGradR.addColorStop(0.5, '#0d7a5f');
    armGradR.addColorStop(1, '#044e3a');
    ctx.fillStyle = armGradR;
    ctx.beginPath();
    ctx.roundRect(-0.6 * s, 0, 6.2 * s, 19.5 * s, 3.1 * s);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(3.6 * s, 1.8 * s, 1.4 * s, 15.5 * s);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(-0.2 * s, 18.2 * s, 5.4 * s, 2.0 * s, 0.8 * s);
    ctx.fill();
    this.drawRealisticHand3D(ctx, 2.5 * s, 20.6 * s, s * 0.92, 1, handsOpen, false);
    ctx.restore();

    const jacketTopY = (-52 - shoulderBreath) * s;
    const jacketGrad = ctx.createLinearGradient(-15 * s, jacketTopY, 15 * s, -24 * s);
    jacketGrad.addColorStop(0, '#10b981');
    jacketGrad.addColorStop(0.28, '#0d7a5f');
    jacketGrad.addColorStop(0.72, '#065f46');
    jacketGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = jacketGrad;
    ctx.beginPath();
    ctx.roundRect(-14.6 * s, jacketTopY, 29.2 * s, 28.5 * s, [8.5 * s, 8.5 * s, 4 * s, 4 * s]);
    ctx.fill();

    const waistGrad = ctx.createLinearGradient(-14 * s, -27 * s, 14 * s, -27 * s);
    waistGrad.addColorStop(0, '#022c22');
    waistGrad.addColorStop(0.5, '#064e3b');
    waistGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = waistGrad;
    ctx.beginPath();
    ctx.roundRect(-13.8 * s, -26.8 * s, 27.6 * s, 3.6 * s, 1.2 * s);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-7.2 * s, jacketTopY - 1.8 * s, 14.4 * s, 3.5 * s, 1.6 * s);
    ctx.fill();
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.roundRect(-6.4 * s, jacketTopY - 0.8 * s, 12.8 * s, 2.2 * s, 1.0 * s);
    ctx.fill();

    ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
    ctx.beginPath();
    ctx.roundRect(-10.2 * s, jacketTopY + 8.0 * s, 20.4 * s, 11.2 * s, 2.4 * s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.lineWidth = Math.max(0.7, 0.9 * s);
    ctx.strokeRect(-9.6 * s, jacketTopY + 8.6 * s, 19.2 * s, 10.0 * s);

    ctx.fillStyle = '#064e3b';
    ctx.font = `900 ${Math.max(8, Math.round(10.2 * s))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numberText, 0, jacketTopY + 13.8 * s);

    const headCenterX = headLookX * s;
    const headCenterY = jacketTopY - 13.5 * s;

    const neckGrad = ctx.createLinearGradient(-4 * s, headCenterY + 7 * s, 4 * s, jacketTopY);
    neckGrad.addColorStop(0, '#d99b72');
    neckGrad.addColorStop(0.5, '#ecc19c');
    neckGrad.addColorStop(1, '#b57850');
    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.roundRect(headCenterX - 4.2 * s, headCenterY + 7.5 * s, 8.4 * s, 6.5 * s, 2 * s);
    ctx.fill();

    [-1, 1].forEach(earDir => {
      const earX = headCenterX + earDir * 12.2 * s;
      const earY = headCenterY + 0.8 * s;
      ctx.fillStyle = earDir < 0 ? '#f1c29b' : '#d69e74';
      ctx.beginPath();
      ctx.ellipse(earX, earY, 2.3 * s, 3.8 * s, earDir * 0.15, 0, Math.PI * 2);
      ctx.fill();
    });

    const skinGrad = ctx.createRadialGradient(
      headCenterX - 3.5 * s,
      headCenterY - 3 * s,
      2 * s,
      headCenterX,
      headCenterY,
      13.5 * s
    );
    skinGrad.addColorStop(0, '#fbe0c8');
    skinGrad.addColorStop(0.55, '#ecc19c');
    skinGrad.addColorStop(1, '#b87d55');
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.ellipse(headCenterX, headCenterY, 12.2 * s, 13.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const hairGrad = ctx.createRadialGradient(
      headCenterX - 4 * s,
      headCenterY - 7 * s,
      2 * s,
      headCenterX,
      headCenterY - 1 * s,
      15 * s
    );
    if (numberText === '058') {
      hairGrad.addColorStop(0, '#3f3f46');
      hairGrad.addColorStop(0.5, '#18181b');
      hairGrad.addColorStop(1, '#09090b');
    } else if (numberText === '100') {
      hairGrad.addColorStop(0, '#52525b');
      hairGrad.addColorStop(0.55, '#27272a');
      hairGrad.addColorStop(1, '#09090b');
    } else {
      hairGrad.addColorStop(0, '#292524');
      hairGrad.addColorStop(0.45, '#1c1917');
      hairGrad.addColorStop(1, '#0c0a09');
    }

    ctx.fillStyle = hairGrad;
    ctx.beginPath();
    ctx.ellipse(headCenterX, headCenterY - 1.6 * s, 12.8 * s, 12.4 * s, 0, Math.PI * 0.88, Math.PI * 2.12);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(headCenterX - 11.8 * s, headCenterY - 1 * s);
    ctx.quadraticCurveTo(headCenterX - 12.4 * s, headCenterY + 6.5 * s, headCenterX - 8.5 * s, headCenterY + 8.5 * s);
    ctx.quadraticCurveTo(headCenterX, headCenterY + 10.6 * s, headCenterX + 8.5 * s, headCenterY + 8.5 * s);
    ctx.quadraticCurveTo(headCenterX + 12.4 * s, headCenterY + 6.5 * s, headCenterX + 11.8 * s, headCenterY - 1 * s);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // JUEGO 2: AHORCADO CLÍNICO MSP (DIAGNÓSTICOS, FÁRMACOS Y EPÓNIMOS)
  // =========================================================================
  startHangmanGame() {
    const stage = document.getElementById('arcade-stage');
    if (!stage) return;

    this.stopAllLoops();
    this.bindMobileAudioUnlock();
    this.startAmbientSound('hangman');

    if (!this.hangmanSession) {
      this.hangmanSession = {
        score: 0,
        wordsSolved: 0,
        streak: 0,
        usedIndices: new Set()
      };
    }

    this.loadNextHangmanWord();
  }

  loadNextHangmanWord() {
    if (this.hangmanSession.usedIndices.size >= this.hangmanDictionary.length) {
      this.hangmanSession.usedIndices.clear();
    }

    const available = [];
    for (let i = 0; i < this.hangmanDictionary.length; i++) {
      if (!this.hangmanSession.usedIndices.has(i)) available.push(i);
    }
    const pickIdx = available[Math.floor(Math.random() * available.length)];
    this.hangmanSession.usedIndices.add(pickIdx);

    const item = this.hangmanDictionary[pickIdx];
    const cleanWord = item.word
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    this.hangmanState = {
      item,
      targetWord: cleanWord,
      guessedLetters: new Set(),
      wrongGuesses: 0,
      maxWrong: 6,
      extraHintShown: false,
      scalpelUses: 2,
      hintUses: 1,
      isSolved: false,
      isFailed: false
    };

    if (this.activeKeyHandler) {
      window.removeEventListener('keydown', this.activeKeyHandler);
    }
    this.activeKeyHandler = (e) => {
      const tab = document.getElementById('tab-arcade');
      if (!tab || tab.classList.contains('hidden') || this.currentMode !== 'hangman') return;
      if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      const key = e.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(key)) {
        this.handleHangmanLetter(key === 'Ñ' ? 'N' : key);
      } else if (e.key === 'Enter' && (this.hangmanState?.isSolved || this.hangmanState?.isFailed)) {
        this.loadNextHangmanWord();
      }
    };
    window.addEventListener('keydown', this.activeKeyHandler);

    this.renderHangmanUI();
  }

  renderHangmanSVG(wrongCount) {
    const strokeColor = wrongCount >= 5 ? '#F43F5E' : (wrongCount >= 3 ? '#F59E0B' : '#10B981');
    return `
      <svg class="w-40 h-44 mx-auto" viewBox="0 0 160 180" fill="none" stroke="currentColor">
        <line x1="20" y1="165" x2="140" y2="165" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
        <line x1="45" y1="165" x2="45" y2="20" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
        <line x1="45" y1="20" x2="105" y2="20" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
        <line x1="105" y1="20" x2="105" y2="42" stroke="#475569" stroke-width="3" stroke-linecap="round"/>

        ${wrongCount >= 1 ? `<circle cx="105" cy="56" r="14" stroke="${strokeColor}" stroke-width="3.5"/>` : ''}
        ${wrongCount >= 2 ? `<line x1="105" y1="70" x2="105" y2="115" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
        ${wrongCount >= 3 ? `<line x1="105" y1="82" x2="82" y2="102" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
        ${wrongCount >= 4 ? `<line x1="105" y1="82" x2="128" y2="102" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
        ${wrongCount >= 5 ? `<line x1="105" y1="115" x2="85" y2="145" stroke="${strokeColor}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
        ${wrongCount >= 6 ? `
          <line x1="105" y1="115" x2="125" y2="145" stroke="#F43F5E" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="99" y1="52" x2="103" y2="56" stroke="#F43F5E" stroke-width="2"/>
          <line x1="103" y1="52" x2="99" y2="56" stroke="#F43F5E" stroke-width="2"/>
          <line x1="107" y1="52" x2="111" y2="56" stroke="#F43F5E" stroke-width="2"/>
          <line x1="111" y1="52" x2="107" y2="56" stroke="#F43F5E" stroke-width="2"/>
        ` : ''}
      </svg>
    `;
  }

  renderHangmanUI() {
    const stage = document.getElementById('arcade-stage');
    if (!stage || !this.hangmanState) return;

    const st = this.hangmanState;
    const sess = this.hangmanSession;
    const remainingLives = st.maxWrong - st.wrongGuesses;

    const wordsArray = st.targetWord.split(' ');
    const wordSlotsHtml = wordsArray.map(wordPart => {
      const lettersHtml = wordPart.split('').map(ch => {
        const revealed = st.guessedLetters.has(ch) || st.isFailed || st.isSolved;
        const missedLetter = st.isFailed && !st.guessedLetters.has(ch);
        return `
          <span class="w-8 h-10 sm:w-10 sm:h-12 rounded-xl border-2 font-mono font-black text-base sm:text-xl flex items-center justify-center transition-all ${
            missedLetter
              ? 'border-rose-500 bg-rose-500/15 text-rose-400'
              : revealed
              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shadow-sm'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-transparent'
          }">
            ${revealed ? ch : '_'}
          </span>
        `;
      }).join('');
      return `<div class="flex flex-wrap items-center justify-center gap-1.5">${lettersHtml}</div>`;
    }).join('<span class="w-4 sm:w-6"></span>');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const keyboardHtml = alphabet.map(letter => {
      const tried = st.guessedLetters.has(letter);
      const isInWord = st.targetWord.includes(letter);
      let btnCls = 'bg-slate-100 dark:bg-slate-900 hover:border-emerald-500 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700';
      if (tried) {
        btnCls = isInWord
          ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black opacity-90'
          : 'bg-rose-500/15 text-rose-400 border-rose-500/30 opacity-45 line-through';
      }
      return `
        <button type="button" data-hangman-letter="${letter}" ${tried || st.isSolved || st.isFailed ? 'disabled' : ''} class="bto-btn h-10 sm:h-11 rounded-xl font-mono font-bold text-sm sm:text-base transition-all ${btnCls}">
          ${letter}
        </button>
      `;
    }).join('');

    stage.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
          <div class="flex items-center gap-3">
            <span class="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-black">CÓDIGO VITAL</span>
            <div>
              <span class="font-display font-bold text-sm sm:text-base block leading-tight">${st.item.category}</span>
              <span class="font-mono text-xs text-slate-400">Palabras Salvadas: <b class="text-emerald-400">${sess.wordsSolved}</b> • Racha: <b class="text-amber-400">x${sess.streak}</b></span>
            </div>
          </div>

          <div class="flex items-center gap-3 sm:gap-5">
            <button type="button" data-action="toggle-game-sound" class="btn-arcade-sfx-toggle px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-mono text-[11px] font-bold text-emerald-400 transition-all">
              ${this.sfxEnabled ? '<span>🔊 Sonido</span>' : '<span class="text-rose-400">🔇 Mudo</span>'}
            </button>
            <div class="text-right font-mono">
              <span class="text-[10px] text-slate-400 uppercase block">Puntaje</span>
              <span class="text-base sm:text-lg font-black text-emerald-400">${sess.score} pts</span>
            </div>
            <div class="text-right font-mono">
              <span class="text-[10px] text-slate-400 uppercase block">Estabilidad (${remainingLives}/${st.maxWrong})</span>
              <span class="text-sm font-bold ${remainingLives <= 2 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}">
                ${remainingLives * 16}% SpO2
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div class="lg:col-span-4 p-5 rounded-3xl bg-slate-950 text-white border border-slate-800 text-center space-y-3">
            <div class="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>MONITOR PACIENTE</span>
              <span class="${st.wrongGuesses >= 4 ? 'text-rose-400' : 'text-emerald-400'}">${6 - st.wrongGuesses} INTENTOS</span>
            </div>
            ${this.renderHangmanSVG(st.wrongGuesses)}
            <div class="grid grid-cols-2 gap-2 pt-2">
              <button type="button" id="btn-hangman-reveal-letter" ${st.scalpelUses <= 0 || st.isSolved || st.isFailed ? 'disabled' : ''} class="bto-btn py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-emerald-400 disabled:opacity-40">
                Bisturí Letra (x${st.scalpelUses})
              </button>
              <button type="button" id="btn-hangman-extra-hint" ${st.hintUses <= 0 || st.extraHintShown || st.isSolved || st.isFailed ? 'disabled' : ''} class="bto-btn py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400 disabled:opacity-40">
                Pista GPC (x${st.hintUses})
              </button>
            </div>
          </div>

          <div class="lg:col-span-8 space-y-5">
            <div class="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span class="font-mono text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 block">Caso Clínico / Definición CACES:</span>
              <p class="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                ${st.item.clue}
              </p>
              ${st.extraHintShown ? `
                <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-600 dark:text-amber-300">
                  <b class="font-mono uppercase">Pista Adicional MSP:</b> ${st.item.extraHint}
                </div>
              ` : ''}
            </div>

            <div class="py-3 px-2 flex flex-wrap items-center justify-center gap-y-3">
              ${wordSlotsHtml}
            </div>

            <div class="grid grid-cols-7 sm:grid-cols-9 gap-1.5 sm:gap-2">
              ${keyboardHtml}
            </div>
          </div>
        </div>

        ${(st.isSolved || st.isFailed) ? `
          <div class="p-5 rounded-3xl ${st.isSolved ? 'bg-emerald-500/15 border-2 border-emerald-500/40' : 'bg-rose-500/15 border-2 border-rose-500/40'} flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1.5">
              <span class="font-mono text-xs font-black uppercase ${st.isSolved ? 'text-emerald-500' : 'text-rose-500'}">
                ${st.isSolved ? `✓ ¡PACIENTE SALVADO! RESPUESTA: ${st.targetWord}` : `✕ PARO CLÍNICO — LA RESPUESTA ERA: ${st.targetWord}`}
              </span>
              <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                <b class="font-mono uppercase text-amber-600 dark:text-amber-300">${SVG_ICONS.diamond} Perla CACES:</b> ${st.item.pearl}
              </div>
            </div>
            <button type="button" id="btn-hangman-next-word" class="bto-btn px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-sm border-transparent shrink-0 shadow-lg shadow-emerald-500/25">
              Siguiente Caso Clínico →
            </button>
          </div>
        ` : ''}
      </div>
    `;

    stage.querySelectorAll('[data-hangman-letter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const letter = btn.getAttribute('data-hangman-letter');
        this.handleHangmanLetter(letter);
      });
    });

    stage.querySelector('#btn-hangman-reveal-letter')?.addEventListener('click', () => {
      if (st.scalpelUses <= 0 || st.isSolved || st.isFailed) return;
      const missingLetters = st.targetWord
        .replace(/\s+/g, '')
        .split('')
        .filter(ch => !st.guessedLetters.has(ch));
      if (missingLetters.length > 0) {
        const pick = missingLetters[Math.floor(Math.random() * missingLetters.length)];
        st.scalpelUses -= 1;
        this.handleHangmanLetter(pick);
      }
    });

    stage.querySelector('#btn-hangman-extra-hint')?.addEventListener('click', () => {
      if (st.hintUses <= 0 || st.extraHintShown || st.isSolved || st.isFailed) return;
      st.extraHintShown = true;
      st.hintUses -= 1;
      this.playTone('beep');
      this.renderHangmanUI();
    });

    stage.querySelectorAll('[data-action="toggle-game-sound"]').forEach(btn => {
      btn.addEventListener('click', () => this.toggleSFX());
    });

    stage.querySelector('#btn-hangman-next-word')?.addEventListener('click', () => {
      this.playTone('popup_open');
      this.loadNextHangmanWord();
    });
  }

  handleHangmanLetter(letter) {
    const st = this.hangmanState;
    if (!st || st.isSolved || st.isFailed || st.guessedLetters.has(letter)) return;

    st.guessedLetters.add(letter);

    if (st.targetWord.includes(letter)) {
      this.playTone('beep');
      const allUniqueLetters = new Set(st.targetWord.replace(/\s+/g, '').split(''));
      let allFound = true;
      allUniqueLetters.forEach(ch => {
        if (!st.guessedLetters.has(ch)) allFound = false;
      });

      if (allFound) {
        st.isSolved = true;
        this.playTone('victory_fanfare');
        this.hangmanSession.wordsSolved += 1;
        this.hangmanSession.streak += 1;
        const wordPoints = 200 + (st.maxWrong - st.wrongGuesses) * 35 + (this.hangmanSession.streak * 25);
        this.hangmanSession.score += wordPoints;

        this.addXP(25, true, false);
        Storage.registerAnswer(`hangman_${st.targetWord}`, true, null, {
          specialty: (st.item.category || '').split('•')[0].trim() || 'Medicina Interna',
          mode: 'study',
          isFirstAttempt: true
        });
        Storage.saveArcadeStats({
          hangmanHighScore: this.hangmanSession.score,
          addHangmanWord: 1,
          hangmanBestStreak: this.hangmanSession.streak
        });
        this.saveHighScore(this.hangmanSession.score);
        this.renderModeSelectorCards();
        this.renderArcadeLeaderboard();
      }
    } else {
      st.wrongGuesses += 1;
      this.playTone('wrong');
      if (st.wrongGuesses >= st.maxWrong) {
        st.isFailed = true;
        this.playTone('flatline');
        this.hangmanSession.streak = 0;
        Storage.saveArcadeStats({
          hangmanHighScore: this.hangmanSession.score
        });
        this.renderModeSelectorCards();
        this.renderArcadeLeaderboard();
      }
    }

    this.renderHangmanUI();
  }

  async renderArcadeLeaderboard() {
    const panel = document.getElementById('arcade-leaderboard-panel');
    if (!panel) return;

    const allUsers = await Storage.getRankedLeaderboard();
    const validTabs = ['streak', 'wins', 'hangman'];
    const activeTab = validTabs.includes(this.leaderboardTab) ? this.leaderboardTab : 'streak';

    const getMaxGlassStreak = (arc) => Math.max(Number(arc?.bridgeBestStreak || 0), Number(arc?.bridgeBestStep || 0));

    const sorted = [...allUsers].sort((a, b) => {
      const arcA = a.arcadeStats || {};
      const arcB = b.arcadeStats || {};
      const streakA = getMaxGlassStreak(arcA);
      const streakB = getMaxGlassStreak(arcB);
      const winsA = Number(arcA.bridgeWins || 0);
      const winsB = Number(arcB.bridgeWins || 0);

      if (activeTab === 'wins') {
        if (winsB !== winsA) return winsB - winsA;
        return streakB - streakA;
      } else if (activeTab === 'hangman') {
        if ((arcB.hangmanWordsSolved || 0) !== (arcA.hangmanWordsSolved || 0)) {
          return (arcB.hangmanWordsSolved || 0) - (arcA.hangmanWordsSolved || 0);
        }
        return (arcB.hangmanBestStreak || 0) - (arcA.hangmanBestStreak || 0);
      } else {
        if (streakB !== streakA) return streakB - streakA;
        return winsB - winsA;
      }
    });

    const rowsHtml = sorted.slice(0, 10).map((user, idx) => {
      const arc = user.arcadeStats || {};
      const maxGlassStreak = getMaxGlassStreak(arc);
      const totalBridges = Number(arc.bridgeWins || 0);

      let primaryMetric = `Racha máx: ${maxGlassStreak} vidrios`;
      let secondaryMetric = `Total de puentes logrados: ${totalBridges}`;

      if (activeTab === 'wins') {
        primaryMetric = `${totalBridges} ${totalBridges === 1 ? 'puente logrado' : 'puentes logrados'}`;
        secondaryMetric = `Racha máxima en vidrios: ${maxGlassStreak} seguidos`;
      } else if (activeTab === 'hangman') {
        primaryMetric = `${arc.hangmanWordsSolved || 0} palabras salvadas`;
        secondaryMetric = `Racha máxima: x${arc.hangmanBestStreak || 0}`;
      }

      return `
        <div class="p-3.5 sm:px-5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
          user.isCurrentUser
            ? 'bg-emerald-500/15 border-emerald-500/50'
            : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800'
        }">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
              idx === 0 ? 'bg-amber-400 text-slate-950' :
              idx === 1 ? 'bg-slate-300 text-slate-950' :
              idx === 2 ? 'bg-amber-700 text-white' :
              'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }">#${idx + 1}</span>
            <img src="${user.avatar}" referrerpolicy="no-referrer" alt="" class="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700">
            <div class="min-w-0">
              <div class="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate flex items-center gap-2">
                <span>${user.name}</span>
                ${user.isCurrentUser ? '<span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[10px] font-black uppercase">Tú</span>' : ''}
              </div>
              <div class="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">Jugador #456 • Cuentas Google</div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="font-mono font-black text-sm sm:text-base text-amber-500 dark:text-amber-400">${primaryMetric}</div>
            <div class="font-mono text-[11px] text-slate-400">${secondaryMetric}</div>
          </div>
        </div>
      `;
    }).join('');

    panel.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
            ${SVG_ICONS.trophy}
          </div>
          <div>
            <h3 class="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">Ranking de Juegos (Puente de Cristal & Ahorcado)</h3>
            <p class="font-mono text-xs text-slate-500 dark:text-slate-400">Clasificación exclusiva por Racha Máxima en los Vidrios y Total de Puentes Logrados</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button type="button" data-arcade-rank-tab="streak" class="px-3 py-2 rounded-xl font-display font-bold text-xs transition-all ${
            activeTab === 'streak' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }">
            Racha Máxima en Vidrios
          </button>
          <button type="button" data-arcade-rank-tab="wins" class="px-3 py-2 rounded-xl font-display font-bold text-xs transition-all ${
            activeTab === 'wins' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }">
            Total Puentes Logrados
          </button>
          <button type="button" data-arcade-rank-tab="hangman" class="px-3 py-2 rounded-xl font-display font-bold text-xs transition-all ${
            activeTab === 'hangman' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }">
            Ahorcado Clínico
          </button>
        </div>
      </div>

      <div class="space-y-2.5">
        ${rowsHtml || '<p class="text-center text-xs font-mono text-slate-400 py-4">Juega tu primera partida para inaugurar el Ranking de Juegos.</p>'}
      </div>
    `;

    panel.querySelectorAll('[data-arcade-rank-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.leaderboardTab = btn.getAttribute('data-arcade-rank-tab') || 'streak';
        this.renderArcadeLeaderboard();
      });
    });
  }
}
