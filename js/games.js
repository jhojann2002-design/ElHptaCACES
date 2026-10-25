/**
 * MOTOR ARCADE EHEP 3D - EL HPTA CACES (VERSIÓN v17: POV REAL SOBRE EL PELDAÑO + RELEVO CINEMÁTICO + FRASES ULEAM/CACES)
 * Incluye 2 Juegos Oficiales de Alto Rendimiento:
 *   1. El Puente de Cristal CACES (#456, #058, #100):
 *      - Portal en Pantalla Completa real (montado en document.body sin barra superior ni ranking).
 *      - Matriz de rotación de cámara 3D real (Pitch 3D):
 *        a) Al saltar caes EXACTAMENTE encima del peldaño elegido (no atrás).
 *        b) La cámara inclina la vista hacia tus pies (60°) viendo tus zapatillas blancas paradas
 *           sobre el cristal para comprobar si se rompe o si es vidrio templado, y luego levanta
 *           la mirada hacia adelante (viendo ya el siguiente peldaño frente a ti).
 *        c) Al perder una vida, tras caer al vacío en POV, la cámara hace una transición cinemática
 *           suave enfocando primero al jugador que estaba atrás (#058 o #100) parado en el peldaño
 *           anterior, acercándose a sus ojos para entrar en su POV antes de que salte al vidrio templado.
 *        d) Diálogos controlados (máximo 1 vez por peldaño, nunca cada 2 segundos), incluyendo frases
 *           de la ULEAM ("todo D de Diosito"), la rural, primer semestre, tirar la canica y el comodín
 *           del 50/50. Cuando queda la última vida (#100), los diálogos cambian a monólogo interno en POV.
 *        e) Latidos cardíacos progresivos (LUB-DUB) y música ambiental oscura estilo Squid Game.
 *   2. Ahorcado Clínico MSP (Diagnósticos, Fármacos de Elección y Epónimos CACES)
 *   + Ranking Top Arcade en Vivo con Cuentas y Fotos Reales de Google (Supabase).
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
    this.chatterTimeout = null;
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
   * Reproduce un latido cardíaco realista de doble golpe (LUB-DUB) que se intensifica al avanzar.
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

      // Golpe 1: LUB
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

      // Golpe 2: DUB (185ms después)
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

      const melodyNotes = [
        261.63, 311.13, 392.00, 415.30,
        392.00, 349.23, 311.13, 293.66,
        261.63, 311.13, 466.16, 415.30,
        392.00, 311.13, 293.66, 246.94
      ];
      const bassRoots = [65.41, 65.41, 51.91, 58.27];

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

          const maxGain = idx === 0 ? 0.045 : 0.024;
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
      pluckGain.gain.linearRampToValueAtTime(0.048, now + 0.015);
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

    if (mode === 'bridge') {
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
        this.playHeartbeatLubDub();
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
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.chatterTimeout) {
      clearTimeout(this.chatterTimeout);
      this.chatterTimeout = null;
    }
    if (this.chatterHideTimer) {
      clearTimeout(this.chatterHideTimer);
      this.chatterHideTimer = null;
    }
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {}
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
        statsLabel: `Palabras: ${arcStats.hangmanWordsSolved || 0} • Racha: x${arcStats.hangmanBestStreak || 0}`
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
  // JUEGO 1: EL PUENTE DE CRISTAL 3D (POV REAL SOBRE EL PELDAÑO + RELEVO SUAVE)
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
        enunciado: 'Paciente politraumatizado ingresa con hipotensión severa, ruidos cardíacos velados e ingurgitación yugular bilateral.',
        pregunta: '¿A qué entidad clínica corresponde esta tríada clásica (Tríada de Beck)?',
        opciones: [
          { id: 'A', texto: 'Taponamiento cardíaco agudo' },
          { id: 'B', texto: 'Neumotórax a tensión' },
          { id: 'C', texto: 'Hemotórax masivo' },
          { id: 'D', texto: 'Tórax inestable con contusión pulmonar' }
        ],
        correcta: 'A',
        perla_caces: 'La Tríada de Beck (hipotensión, ruidos cardíacos apagados e ingurgitación yugular) define al Taponamiento Cardíaco; requiere pericardiocentesis urgente.',
        fuente: 'ATLS 10ª Edición / Protocolos de Trauma MSP'
      },
      {
        id: 'sq_4',
        especialidad: 'Ginecología y Obstetricia',
        subtema: 'Clave Roja MSP',
        enunciado: 'Puérpera inmediata presenta sangrado transvaginal abundante (>1,000 ml) con útero blando y subinvolucionado por encima del ombligo.',
        pregunta: '¿Cuál es la causa más frecuente de Hemorragia Posparto representada en este cuadro?',
        opciones: [
          { id: 'A', texto: 'Atonía uterina (70% de los casos)' },
          { id: 'B', texto: 'Retención de restos placentarios' },
          { id: 'C', texto: 'Desgarro del canal cervico-vaginal' },
          { id: 'D', texto: 'Coagulopatía por consumo' }
        ],
        correcta: 'A',
        perla_caces: 'En las 4 T de la Hemorragia Posparto, el Tono (Atonía uterina) representa el 70% de los casos. Se activa Clave Roja + masaje bimanual + oxitocina + ácido tranexámico 1 g IV.',
        fuente: 'GPC Hemorragia Posparto - MSP Ecuador'
      },
      {
        id: 'sq_5',
        especialidad: 'Medicina Interna',
        subtema: 'Emergencias Hiperglucémicas',
        enunciado: 'Paciente con Diabetes Tipo 1 ingresa con respiración de Kussmaul, pH arterial 7.12, HCO3 10 mEq/L, glucosa 420 mg/dL y potasio sérico de 2.9 mEq/L.',
        pregunta: '¿Cuál es la conducta inmediata respecto a la insulina y el potasio tras iniciar hidratación con solución salina 0.9%?',
        opciones: [
          { id: 'A', texto: 'Diferir la insulina IV y reponer potasio primero hasta alcanzar K+ ≥ 3.3 mEq/L' },
          { id: 'B', texto: 'Iniciar bolo de insulina regular 0.1 UI/kg IV de inmediato' },
          { id: 'C', texto: 'Administrar bicarbonato de sodio en bolo rápido sin potasio' },
          { id: 'D', texto: 'Administrar insulina glargina subcutánea y dar alta' }
        ],
        correcta: 'A',
        perla_caces: 'En Cetoacidosis Diabética con K+ < 3.3 mEq/L está contraindicado iniciar insulina hasta reponer potasio, pues la insulina introduce K+ a la célula y desencadena arritmias letales.',
        fuente: 'ADA Standards of Care / GPC Diabetes MSP'
      },
      {
        id: 'sq_6',
        especialidad: 'Pediatría',
        subtema: 'AIEPI Respiratorio',
        enunciado: 'Lactante de 14 meses acude por tos, fiebre de 38.5 °C y frecuencia respiratoria de 48 respiraciones por minuto, sin tiraje subcostal ni estridor.',
        pregunta: 'Según AIEPI y GPC MSP, ¿cuál es la clasificación y el antibiótico oral de primera elección?',
        opciones: [
          { id: 'A', texto: 'Neumonía • Amoxicilina oral a dosis altas (80-90 mg/kg/día)' },
          { id: 'B', texto: 'Neumonía grave • Ceftriaxona intravenosa' },
          { id: 'C', texto: 'Tos o resfriado común • Solo paracetamol' },
          { id: 'D', texto: 'Crup viral • Dexametasona intramuscular' }
        ],
        correcta: 'A',
        perla_caces: 'En niños de 12 meses a 4 años, taquipnea se define como FR ≥ 40 rpm. Sin signos de peligro ni tiraje, se clasifica como Neumonía y se trata con Amoxicilina VO 80-90 mg/kg/día.',
        fuente: 'Manual Clínico AIEPI - MSP Ecuador'
      }
    ];

    const source = (Array.isArray(this.questionsPool) && this.questionsPool.length >= 6)
      ? this.questionsPool
      : fallbackQuestions;

    const normalized = source.map((q, idx) => {
      const letters = ['A', 'B', 'C', 'D'];
      let opciones = [];
      const rawOpts = q.opciones || q.options || [];
      if (Array.isArray(rawOpts)) {
        opciones = rawOpts.slice(0, 4).map((o, i) => {
          if (typeof o === 'string') return { id: letters[i], texto: o };
          return {
            id: (o.id || o.letter || letters[i]).toString().toUpperCase(),
            texto: o.texto || o.text || `Opción ${letters[i]}`
          };
        });
      }
      while (opciones.length < 4) {
        const nextL = letters[opciones.length];
        opciones.push({ id: nextL, texto: `Opción clínica ${nextL}` });
      }
      let correcta = 'A';
      if (typeof q.correcta === 'string' && letters.includes(q.correcta.toUpperCase())) {
        correcta = q.correcta.toUpperCase();
      } else if (typeof q.correct === 'number' && letters[q.correct]) {
        correcta = letters[q.correct];
      }
      return {
        id: q.id || `bridge_q_${idx}`,
        especialidad: q.especialidad || q.category || 'Medicina Interna',
        subtema: q.subtema || 'Caso Clínico CACES',
        enunciado: q.enunciado || '',
        pregunta: q.pregunta || q.question || 'Seleccione la conducta clínica correcta según normativa MSP:',
        opciones,
        correcta,
        perla_caces: q.perla_caces || q.explanation || 'Recuerda verificar siempre los criterios diagnósticos y de primera línea de las Guías de Práctica Clínica del MSP.',
        fuente: q.fuente || 'Guía de Práctica Clínica MSP Ecuador / EHEP CACES'
      };
    });

    const shuffled = [...normalized];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    while (shuffled.length < count) {
      shuffled.push(...fallbackQuestions);
    }
    return shuffled.slice(0, count);
  }

  getSquadOrderForLives(lives = 3) {
    if (lives >= 3) return ['456', '058', '100'];
    if (lives === 2) return ['058', '100'];
    if (lives === 1) return ['100'];
    return [];
  }

  laneIndexForOption(optionId = 'A') {
    const idx = ['A', 'B', 'C', 'D'].indexOf(String(optionId).toUpperCase());
    return idx >= 0 ? idx : 0;
  }

  optionForLaneIndex(laneIdx = 0) {
    return ['A', 'B', 'C', 'D'][Math.max(0, Math.min(3, laneIdx))] || 'A';
  }

  getOptionSelectionPercentages(q, stepIdx = 0) {
    const correctKey = (q?.correcta || 'A').toUpperCase();
    const seedStr = `${q?.id || stepIdx}_${q?.pregunta || ''}`;
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const correctPct = 52 + (absHash % 27);
    const rem = 100 - correctPct;
    const w1 = Math.max(4, Math.round(rem * 0.52));
    const w2 = Math.max(3, Math.round(rem * 0.31));
    const w3 = Math.max(1, rem - w1 - w2);
    const wrongPcts = [w1, w2, w3];

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
      spokenSteps: new Set(), // Garantiza máximo 1 diálogo automático por peldaño
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
        // 'INTRO_SQUAD'          -> Plano inicial mostrando a los 3 jugadores (#456, #058, #100)
        // 'POV_READY'            -> Primera Persona (POV) del jugador que va a saltar
        // 'POV_JUMPING'          -> Saltando y cayendo JUSTO EN EL PELDAÑO mientras mira hacia sus pies
        // 'POV_FLOOR_CHECK_SAFE' -> Mirando sus zapatillas sobre el vidrio templado y luego levantando la mirada al frente
        // 'POV_FLOOR_CRACK'      -> Mirando sus zapatillas sobre el vidrio agrietándose antes de romperse
        // 'POV_FALLING'          -> Cayendo al vacío en primera persona
        // 'RELAY_REVEAL_BEHIND'  -> Transición cinemática que muestra al jugador que estaba atrás (#058 o #100) y hace zoom hacia sus ojos
        // 'POV_RELAY_JUMP'       -> El jugador de atrás salta en su POV y cae justo sobre el vidrio templado seguro
        camMode: 'INTRO_SQUAD',
        introStartTime: now,
        introDuration: 2050,

        // Posición real 3D de los ojos de la cámara (con rotación Pitch real para que al caer en row=r estés ENCIMA del peldaño r)
        cameraRow: -2.25,
        cameraLane: 1.5,
        cameraY: 1.48,
        cameraPitch: 0.14, // En radianes: 0.16 rad (~9°) mira al frente; 1.05 rad (~60°) mira directo a tus pies sobre el vidrio
        cameraRoll: 0,

        // Posición lógica del jugador activo en POV (en el borde de salida -0.82 antes del peldaño 0, y exactamente en r al pisar el peldaño r)
        playerNumber: leadNum,
        playerRow: -0.82,
        playerLane: 1.5,

        // Interpolación de salto en POV
        jumpStartTime: 0,
        jumpDuration: 580,
        jumpStartRow: -0.82,
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
        marbleAnim: null,
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
    this.scheduleSingleStepDialogue(2250);
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
   * Programa como máximo 1 diálogo para el peldaño actual (nunca se repite cada 2 segundos).
   */
  scheduleSingleStepDialogue(delayMs = 950) {
    if (this.chatterTimeout) {
      clearTimeout(this.chatterTimeout);
      this.chatterTimeout = null;
    }
    this.chatterTimeout = setTimeout(() => {
      if (this.currentMode !== 'bridge' || !this.bridgeState) return;
      const st = this.bridgeState;
      if (!st.isFullscreenOpen || st.isAnimatingJump || st.awaitingNextStep || st.isGameOver || st.isVictory) return;
      if (st.spokenSteps.has(st.currentStep)) return;
      st.spokenSteps.add(st.currentStep);
      this.triggerBackPlayerTaunt('step_once');
    }, delayMs);
  }

  /**
   * Sintetiza la voz hablada en español (Web Speech API) + toque acústico suave.
   */
  speakBackPlayerLine(speakerNum, text, isInnerPOV = false) {
    if (!this.sfxEnabled || !text) return;

    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const baseFreq = isInnerPOV ? 185 : (speakerNum === '058' ? 165 : 208);
      [0, 0.075].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq + (idx === 0 ? 15 : -10), now + offset);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(880, now + offset);
        gain.gain.setValueAtTime(0.028, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.065);
      });
    } catch (e) {}

    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanSpeechText = text
          .replace(/[#*«»"“”]/g, '')
          .replace(/\bULEAM\b/gi, 'Uleam')
          .replace(/\bCACES\b/gi, 'Cases')
          .replace(/\bMSP\b/gi, 'M S P')
          .replace(/50\/50/g, 'cincuenta cincuenta');
        const utter = new SpeechSynthesisUtterance(cleanSpeechText);
        utter.lang = 'es-EC';
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        const esVoice =
          voices.find(v => /es[-_](EC|CO|MX|PE|AR|419|US|ES)/i.test(v.lang)) ||
          voices.find(v => /^es/i.test(v.lang));
        if (esVoice) utter.voice = esVoice;

        if (isInnerPOV) {
          utter.pitch = 0.96;
          utter.rate = 1.04;
        } else if (speakerNum === '058') {
          utter.pitch = 0.92;
          utter.rate = 1.06;
        } else {
          utter.pitch = 1.10;
          utter.rate = 1.09;
        }
        utter.volume = 0.95;
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {}
  }

  /**
   * Genera como máximo 1 vez por peldaño el diálogo:
   * - Si quedan 2 o 3 vidas: hablan los jugadores de atrás (#058 o #100) con frases de la ULEAM, la rural,
   *   primer semestre, tirar la canica, comodín 50/50 o trampas.
   * - Si queda 1 sola vida (#100): es monólogo interno en tu propio POV (sin gritos de "salta ya" desde atrás).
   */
  triggerBackPlayerTaunt(reason = 'step_once') {
    const st = this.bridgeState;
    if (!st || !st.isFullscreenOpen || st.isGameOver || st.isVictory) return;

    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)] || {};
    const correctOpt = q.correcta || 'A';
    const allOpts = ['A', 'B', 'C', 'D'];
    const wrongIntact = allOpts.filter(letter => letter !== correctOpt && !st.brokenOptionsInCurrentStep.has(letter));
    const trapLetter = wrongIntact.includes('B')
      ? 'B'
      : (wrongIntact[Math.floor(Math.random() * wrongIntact.length)] || 'B');

    const isLastLifePOV = st.lives === 1;
    let speakerNum = '058';
    let speakerRole = 'DESDE ATRÁS (#058)';

    if (isLastLifePOV) {
      speakerNum = '100';
      speakerRole = 'MI POV INTERNO (#100 • ÚLTIMA VIDA)';
    } else if (st.lives >= 3) {
      speakerNum = (st.currentStep % 2 === 0) ? '058' : '100';
      speakerRole = speakerNum === '058' ? 'DETRÁS DE TI (#058)' : 'DESDE ATRÁS (#100)';
    } else {
      speakerNum = '100';
      speakerRole = 'DETRÁS DE TI (#100)';
    }

    let pool = [];

    if (reason === 'fell') {
      if (isLastLifePOV) {
        pool = [
          {
            tag: '💭 MI POV • ÚLTIMO SOBREVIVIENTE',
            color: 'amber',
            text: `«Ya cayeron #456 y #058, me quedé solito... Calma doc, si sobrevivo a este puente nos vamos directo a la rural.»`
          },
          {
            tag: '💭 MI POV • ÚLTIMA VIDA',
            color: 'cyan',
            text: `«Solo quedo yo (#100)... En la ULEAM decían que todo es la D de Diosito, o mejor uso el comodín del 50/50.»`
          }
        ];
      } else {
        pool = [
          {
            tag: '😱 RELEVO DEL JUGADOR DE ATRÁS',
            color: 'rose',
            text: `«¡Se cayó #${st.lastFallenPlayerNum || '456'}! Ahora me toca ir de primero a mí (#${st.anim.playerNumber})... ¡Dale doc, que si sobrevivimos nos vamos a la rural!»`
          }
        ];
      }
    } else if (isLastLifePOV) {
      // Diálogos 100% en primera persona (POV) cuando queda la última vida (#100 solo en el puente)
      pool = [
        {
          tag: '💭 MI POV • CÁBALA ULEAM',
          color: 'amber',
          text: `«Me quedé solo en la última vida... En la ULEAM decían que cuando dudas, todo es la D de Diosito.»`
        },
        {
          tag: '💭 MI POV • META RURAL',
          color: 'emerald',
          text: `«Respira hondo doc... si sobrevivo a este puente nos vamos directo a la rural con sueldo completo.»`
        },
        {
          tag: '💭 MI POV • MEMORIA CLÍNICA',
          color: 'cyan',
          text: `«Calma, esto lo vimos en primer semestre... No tengas miedo a equivocarte, analiza bien la clínica.»`
        },
        {
          tag: '💭 MI POV • ESTRATEGIA',
          color: 'emerald',
          text: `«Ya no tengo a nadie atrás... mejor pruebo a tirar la canica o uso el comodín del 50/50 antes de saltar.»`
        },
        {
          tag: '💭 MI POV • NERVIOS CACES',
          color: 'amber',
          text: `«No sé si prefiero caer de este puente antes de dar el CACES, pero ya llegué hasta aquí... ¡vamos con fe!»`
        },
        {
          tag: '💭 MI POV • ÚLTIMO INTENTO',
          color: 'cyan',
          text: `«Última vida (#100)... Si dudo entre dos opciones, uso el comodín del 50/50 para asegurar el vidrio templado.»`
        }
      ];
    } else {
      // Diálogos de los compañeros de atrás (#058 y #100) cuando tienes 2 o 3 vidas
      pool = [
        {
          tag: '🎓 CÁBALA DE LA ULEAM',
          color: 'amber',
          text: `«¡En la ULEAM decían que todo es la D de Diosito! Si no te acuerdas de la guía, encomiéndate doc.»`
        },
        {
          tag: '🏥 RUMBO A LA RURAL',
          color: 'emerald',
          text: `«¡Dale doc, que si sobrevivimos a este puente nos vamos juntos a la rural!»`
        },
        {
          tag: '📚 PRIMER SEMESTRE',
          color: 'cyan',
          text: `«¡Eso lo vimos en primer semestre, doc! Cómo vas a dudar en esa pregunta.»`
        },
        {
          tag: '💪 ÁNIMO CLÍNICO',
          color: 'emerald',
          text: `«¡No tengas miedo a equivocarte, doc! Confía en tu ojo clínico y pisa firme ese vidrio.»`
        },
        {
          tag: '🔮 CONSEJO DE ATRÁS',
          color: 'cyan',
          text: `«¡Si estás dudando, prueba a tirar la canica para escuchar cuál vidrio suena templado!»`
        },
        {
          tag: '👁️ USA EL COMODÍN',
          color: 'emerald',
          text: `«¡Usa el comodín del 50/50 antes de saltar, doc! No arriesgues nuestras vidas a ciegas.»`
        },
        {
          tag: '😈 TRAMPA DESDE ATRÁS',
          color: 'rose',
          text: `«¡Sáltale a la ${trapLetter} sin miedo, doc! Te juro que esa es... (bueno, y si te caes me abres camino).»`
        },
        {
          tag: '😂 CLÁSICO DE FACULTAD',
          color: 'cyan',
          text: `«¡Eso lo sabe hasta la señora de las tortillas de afuera de la facultad, dale sin miedo doc!»`
        },
        {
          tag: '🙏 SÚPLICA DEL DE ATRÁS',
          color: 'amber',
          text: `«¡Por favor no falles, doc! Si tú te caes me toca saltar de puntero a mí.»`
        },
        {
          tag: '💀 TENSIÓN CACES',
          color: 'amber',
          text: `«No sé si prefiero caer de este puente antes de dar el CACES... ¡prueba a tirar la canica, doc!»`
        },
        {
          tag: '⏳ PRESIÓN DESDE ATRÁS',
          color: 'rose',
          text: `«¡Apúrate pues doc, mi abuela hubiera saltado más rápido! O usa el comodín del 50/50.»`
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
      isInnerPOV: isLastLifePOV,
      tag: chosen.tag,
      color: chosen.color,
      text: chosen.text,
      timestamp: performance.now()
    };

    this.renderBackPlayerChatterBanner();
    this.speakBackPlayerLine(speakerNum, chosen.text, isLastLifePOV);

    if (this.chatterHideTimer) {
      clearTimeout(this.chatterHideTimer);
    }
    this.chatterHideTimer = setTimeout(() => {
      const bubble = document.getElementById('bridge-back-player-chatter');
      if (bubble) {
        bubble.classList.add('opacity-0', 'translate-y-1');
      }
    }, 6200);
  }

  /**
   * Renderiza el mensaje en pantalla de lo que dicen los jugadores de atrás (o tu pensamiento POV en la última vida)
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
      <div id="bridge-back-player-chatter" class="pointer-events-auto max-w-xl mx-auto px-3 py-1.5 rounded-2xl border ${cls} shadow-[0_10px_28px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-300 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-xl bg-emerald-800/90 border border-emerald-400/60 flex flex-col items-center justify-center shrink-0">
            <span class="font-mono text-[7px] text-emerald-200 leading-none">${chat.isInnerPOV ? 'MI POV' : 'ATRÁS'}</span>
            <span class="font-mono text-[11px] font-black text-white leading-tight">#${chat.speakerNum}</span>
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
              <span class="px-1.5 py-0.2 rounded ${badgeCls} font-mono text-[9px] font-black uppercase">${chat.tag}</span>
              <span class="font-mono text-[9px] text-slate-300 font-bold uppercase truncate">${chat.speakerRole}</span>
            </div>
            <p class="font-display font-bold text-xs sm:text-sm text-white leading-snug">
              ${chat.text}
            </p>
          </div>
        </div>
        <button type="button" id="btn-replay-chatter" class="px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-[10px] font-mono font-bold text-cyan-300 shrink-0 cursor-pointer active:scale-95" title="Escuchar otra frase">
          🗣️ Otra
        </button>
      </div>
    `;

    wrap.querySelector('#btn-replay-chatter')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.triggerBackPlayerTaunt('manual');
    });
  }

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
      <!-- MITAD SUPERIOR: VISOR 3D EN PRIMERA PERSONA (CON CAÍDA EXACTA EN EL PELDAÑO Y MIRADA A LOS PIES) -->
      <div id="bridge-3d-canvas-wrap" class="relative w-full h-[38dvh] min-h-[195px] max-h-[390px] sm:h-[44dvh] shrink-0 overflow-hidden bg-[#08020f]">
        <canvas id="squid-bridge-canvas" class="w-full h-full block cursor-pointer" width="840" height="440"></canvas>

        <!-- Barra Flotante Mínima dentro del Visor 3D -->
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
            <span id="bridge-3d-bpm-pill" class="px-2.5 py-1 rounded-full bg-slate-950/90 border border-rose-500/55 text-rose-300 font-mono text-[10px] sm:text-xs font-black backdrop-blur-md shadow-md inline-flex items-center gap-1" title="Frecuencia cardíaca en vivo">
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

        <!-- Globo de Diálogo (Máximo 1 vez por peldaño) -->
        <div id="bridge-back-player-chatter-wrap" class="absolute top-12 left-2.5 right-2.5 z-20 pointer-events-none"></div>

        <!-- Indicador Cinemático Inferior dentro del Visor 3D -->
        <div class="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span id="bridge-pov-camera-badge" class="px-2.5 py-0.5 rounded-lg bg-slate-950/85 border border-cyan-500/45 text-cyan-300 font-mono text-[10px] font-bold backdrop-blur-sm shadow">
            🎬 PRESENTANDO ESCUADRÓN: #456 • #058 • #100
          </span>
        </div>
      </div>

      <!-- MITAD INFERIOR: PREGUNTA + COMODINES (50/50, CANICA, ESCUDO) + 4 OPCIONES DE RESPUESTA -->
      <div id="bridge-bottom-hud-overlay" class="w-full flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-4 bg-gradient-to-b from-[#150722] to-[#08020d] border-t border-rose-500/35 flex flex-col justify-between gap-2 z-10 max-w-5xl mx-auto"></div>

      <!-- OVERLAY DE FIN DE PARTIDA -->
      <div id="bridge-question-popup" class="hidden fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center overflow-y-auto"></div>
    `;

    portal.querySelector('#btn-bridge-sfx')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSFX();
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
      if (st.anim.camMode === 'INTRO_SQUAD') {
        st.anim.camMode = 'POV_READY';
        st.anim.cameraRow = st.anim.playerRow;
        st.anim.cameraLane = st.anim.playerLane;
        st.anim.cameraY = 1.18;
        st.anim.cameraPitch = 0.18;
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

  /**
   * Comodín del 50/50 (Ojo del Vidriero): Rompe 2 vidrios falsos dejando solo 2 opciones
   */
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

  /**
   * Tirar la Canica: Lanza una canica al peldaño actual para escuchar y ver una pista clínica
   */
  triggerMarbleHintPowerup() {
    const st = this.bridgeState;
    if (!st || st.powerups.marbleHint <= 0 || st.hintRevealedInCurrentStep || st.awaitingNextStep || st.isAnimatingJump) return;
    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const safeLane = this.laneIndexForOption(q.correcta);
    st.hintRevealedInCurrentStep = true;
    st.powerups.marbleHint -= 1;
    st.anim.marbleAnim = {
      startTime: performance.now(),
      duration: 650,
      startRow: st.anim.playerRow,
      startLane: st.anim.playerLane,
      targetRow: st.currentStep,
      targetLane: safeLane
    };
    this.playTone('glass_step');
    this.updateGlassBridgeDOM();
  }

  /**
   * Escudo Templado: Protege de 1 caída si eliges un cristal falso
   */
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
      } else if (mode === 'POV_JUMPING') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-[10px] font-black backdrop-blur-sm shadow';
        povBadge.textContent = `👁️ POV #${st.anim.playerNumber} • SALTANDO AL PELDAÑO Y MIRANDO A LOS PIES...`;
      } else if (mode === 'POV_FLOOR_CHECK_SAFE') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-emerald-950/95 border border-emerald-400 text-emerald-200 font-mono text-[10px] font-black backdrop-blur-sm shadow';
        povBadge.textContent = `✓ POV #${st.anim.playerNumber} • ¡VIDRIO TEMPLADO BAJO TUS PIES! MIRANDO AL FRENTE...`;
      } else if (mode === 'POV_FLOOR_CRACK') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-rose-950/95 border border-rose-400 text-rose-200 font-mono text-[10px] font-black backdrop-blur-sm shadow';
        povBadge.textContent = `⚠️ POV #${st.anim.playerNumber} • ¡EL CRISTAL BAJO TUS PIES SE ESTÁ ROMPIENDO!`;
      } else if (mode === 'POV_FALLING') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-rose-600/95 border border-rose-200 text-white font-mono text-[10px] font-black animate-bounce shadow-lg';
        povBadge.textContent = `✕ ¡EL VIDRIO SE ROMPIÓ! CAÍDA EN POV DE #${st.lastFallenPlayerNum || st.anim.playerNumber}`;
      } else if (mode === 'RELAY_REVEAL_BEHIND') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-mono text-[10px] font-black shadow-lg';
        povBadge.textContent = `🎬 EL JUGADOR DE ATRÁS (#${st.anim.playerNumber}) TOMA EL RELEVO → ENTRANDO A SU POV...`;
      } else if (mode === 'POV_RELAY_JUMP') {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-emerald-400 text-slate-950 font-mono text-[10px] font-black shadow-lg';
        povBadge.textContent = `👁️ POV #${st.anim.playerNumber} • SALTANDO AL VIDRIO TEMPLADO SEGURO`;
      } else {
        povBadge.className = 'px-2.5 py-0.5 rounded-lg bg-slate-950/85 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] font-bold backdrop-blur-sm shadow';
        povBadge.textContent = `👁️ TU POV: JUGADOR #${st.anim.playerNumber} (${st.lives} ${st.lives === 1 ? 'VIDA • ÚLTIMO EN PIE' : 'VIDAS'})`;
      }
    }

    if (canvasWrap) {
      if (st.awaitingNextStep) {
        canvasWrap.className = 'relative w-full h-[30dvh] min-h-[160px] max-h-[280px] sm:h-[35dvh] shrink-0 overflow-hidden bg-[#08020f] transition-all duration-200';
      } else {
        canvasWrap.className = 'relative w-full h-[38dvh] min-h-[195px] max-h-[390px] sm:h-[44dvh] shrink-0 overflow-hidden bg-[#08020f] transition-all duration-200';
      }
    }

    // Si terminó la partida (Victoria o Game Over), mostrar modal final
    if (st.isGameOver || st.isVictory) {
      if (popupEl) {
        popupEl.classList.remove('hidden');
        const arcStats = Storage.getArcadeStats();
        const maxStreak = Math.max(arcStats.bridgeBestStreak || 0, st.streak);
        popupEl.innerHTML = `
          <div class="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 ${st.isVictory ? 'border-emerald-500' : 'border-rose-500'} text-center space-y-5 shadow-2xl">
            <div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${st.isVictory ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'} shadow-lg">
              ${st.isVictory ? SVG_ICONS.trophy : SVG_ICONS.cross}
            </div>
            <div class="space-y-1.5">
              <span class="px-3 py-1 rounded-full font-mono text-xs font-black uppercase ${st.isVictory ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
                ${st.isVictory ? `★ PUENTE NIVEL ${st.bridgeLevel} COMPLETADO` : '✕ LOS 3 JUGADORES CAYERON AL VACÍO'}
              </span>
              <h3 class="font-display font-black text-2xl sm:text-3xl text-white">
                ${st.isVictory ? '¡Sobreviviste rumbo a la Rural!' : '¡Fin de la Partida en el Puente!'}
              </h3>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                ${st.isVictory
                  ? `Cruzaste los ${st.totalSteps} peldaños de cristal templado con ${st.lives} ${st.lives === 1 ? 'jugador vivo' : 'jugadores vivos'} y racha de ${st.streak} vidrios.`
                  : `Caíste en el peldaño ${globalStepNum}. Récord máximo: ${maxStreak} vidrios templados.`}
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              ${st.isVictory ? `
                <button type="button" id="btn-bridge-next-level" class="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-black text-sm shadow-lg cursor-pointer">
                  ▶ Siguiente Puente (Nivel ${st.bridgeLevel + 1})
                </button>
              ` : ''}
              <button type="button" id="btn-bridge-restart-modal" class="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-display font-black text-sm shadow-lg cursor-pointer">
                🔄 Jugar de Nuevo (#456)
              </button>
              <button type="button" id="btn-bridge-exit-modal" class="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold cursor-pointer">
                ✕ Salir al Ranking
              </button>
            </div>
          </div>
        `;
        popupEl.querySelector('#btn-bridge-next-level')?.addEventListener('click', () => this.continueBridgeStreakRound());
        popupEl.querySelector('#btn-bridge-restart-modal')?.addEventListener('click', () => this.startGlassBridgeGame(null));
        popupEl.querySelector('#btn-bridge-exit-modal')?.addEventListener('click', () => this.exitBridgeFullscreen());
      }
      return;
    } else if (popupEl) {
      popupEl.classList.add('hidden');
    }

    if (!bottomOverlay) return;
    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const options = Array.isArray(q.opciones) ? q.opciones : [];

    // MODO RETROALIMENTACIÓN: Cuando ya aterrizó en el vidrio templado y levantó la mirada al frente
    if (st.awaitingNextStep) {
      const isCorrect = st.lastJumpOutcome === 'correct';
      const pctMap = this.getOptionSelectionPercentages(q, st.currentStep);
      const isLastStep = st.currentStep + 1 >= st.totalSteps;

      bottomOverlay.innerHTML = `
        <div class="space-y-2.5 my-auto">
          <div class="p-3 sm:p-4 rounded-2xl border-2 ${isCorrect ? 'bg-emerald-950/40 border-emerald-500/70' : 'bg-rose-950/40 border-rose-500/70'} space-y-2.5 shadow-xl">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b ${isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'} pb-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}">
                  ${isCorrect ? '✓' : '✕'}
                </span>
                <div>
                  <h4 class="font-display font-black text-xs sm:text-sm ${isCorrect ? 'text-emerald-300' : 'text-rose-300'} uppercase">
                    ${isCorrect
                      ? `¡Vidrio Templado Firme! Jugador #${st.anim.playerNumber} sobre el peldaño ${globalStepNum}`
                      : `¡#${st.lastFallenPlayerNum} cayó al vacío! Jugador de atrás (#${st.anim.playerNumber}) tomó el relevo en el vidrio ${q.correcta}`}
                  </h4>
                </div>
              </div>
              <button type="button" id="btn-bridge-next-step" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer shrink-0">
                ${isLastStep ? '🏆 Cruzar a la Meta VIP →' : 'Siguiente Peldaño →'}
              </button>
            </div>

            <!-- Opciones resumidas con porcentajes estilo simulador -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              ${options.map(opt => {
                const isKey = opt.id === q.correcta;
                const isChosenWrong = !isCorrect && opt.id === st.lastChosenOptionId;
                const pct = pctMap[opt.id] || 10;
                return `
                  <div class="px-2.5 py-1.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    isKey
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 font-bold'
                      : isChosenWrong
                      ? 'bg-rose-500/20 border-rose-400 text-rose-200 line-through'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-75'
                  }">
                    <span class="truncate"><b class="font-mono mr-1">${opt.id})</b> ${this.formatMd(opt.texto)}</span>
                    ${this.renderOptionPercentagePill(pct)}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Perla CACES sin barra de desplazamiento -->
            <div class="p-2.5 sm:p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-2">
              <span class="text-amber-400 shrink-0 mt-0.5">${SVG_ICONS.sparkle}</span>
              <div class="text-xs text-amber-100 leading-snug">
                <strong class="text-amber-300 font-mono uppercase tracking-wider text-[10px] block mb-0.5">Perla CACES • ${q.especialidad} (${q.fuente}):</strong>
                ${this.formatMd(q.perla_caces)}
              </div>
            </div>
          </div>
        </div>
      `;

      bottomOverlay.querySelector('#btn-bridge-next-step')?.addEventListener('click', () => {
        this.advanceBridgeStep();
      });
      return;
    }

    // MODO PREGUNTA ACTIVA + BARRA DE COMODINES (50/50, TIRAR LA CANICA, ESCUDO TEMPLADO) + 4 OPCIONES
    const can5050 = st.powerups.glassmakerEye > 0 && st.brokenOptionsInCurrentStep.size < 2 && !st.isAnimatingJump;
    const canMarble = st.powerups.marbleHint > 0 && !st.hintRevealedInCurrentStep && !st.isAnimatingJump;
    const canShield = st.powerups.temperedShield > 0 && !st.shieldActiveInCurrentStep && !st.isAnimatingJump;

    bottomOverlay.innerHTML = `
      <div class="space-y-2 my-auto">
        <!-- Cabecera de la pregunta + Comodines interactivos -->
        <div class="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-inner space-y-1.5">
          <div class="flex flex-wrap items-center justify-between gap-1.5">
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-black uppercase">
                PELDAÑO #${globalStepNum} • SALTA #${st.anim.playerNumber}
              </span>
              <span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-mono text-[10px] font-bold">
                ${q.especialidad}
              </span>
            </div>

            <!-- Botones de Comodines (50/50, Tirar Canica, Escudo Templado) -->
            <div class="flex flex-wrap items-center gap-1.5">
              <button type="button" id="btn-power-5050" ${can5050 ? '' : 'disabled'} class="px-2.5 py-1 rounded-lg border font-mono text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                can5050
                  ? 'bg-purple-500/20 hover:bg-purple-500/35 border-purple-400/60 text-purple-200 cursor-pointer active:scale-95'
                  : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
              }" title="Comodín del 50/50: Rompe 2 vidrios falsos">
                <span>👁️ 50/50 (${st.powerups.glassmakerEye})</span>
              </button>

              <button type="button" id="btn-power-marble" ${canMarble ? '' : 'disabled'} class="px-2.5 py-1 rounded-lg border font-mono text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                canMarble
                  ? 'bg-cyan-500/20 hover:bg-cyan-500/35 border-cyan-400/60 text-cyan-200 cursor-pointer active:scale-95'
                  : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
              }" title="Tirar la canica para probar el cristal y ver pista">
                <span>🔮 Tirar Canica (${st.powerups.marbleHint})</span>
              </button>

              <button type="button" id="btn-power-shield" ${canShield ? '' : 'disabled'} class="px-2.5 py-1 rounded-lg border font-mono text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                st.shieldActiveInCurrentStep
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black'
                  : canShield
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/35 border-emerald-400/60 text-emerald-200 cursor-pointer active:scale-95'
                  : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
              }" title="Escudo Templado: Evita perder la vida si el vidrio se rompe">
                <span>🛡️ ${st.shieldActiveInCurrentStep ? 'Escudo Activo' : `Escudo (${st.powerups.temperedShield})`}</span>
              </button>
            </div>
          </div>

          <div class="text-xs sm:text-sm md:text-base font-medium text-slate-100 leading-snug">
            ${q.enunciado ? `<span class="text-slate-300">${this.formatMd(q.enunciado)}</span> ` : ''}
            <strong class="text-white">${this.formatMd(q.pregunta)}</strong>
          </div>

          ${st.hintRevealedInCurrentStep ? `
            <div class="p-2 rounded-xl bg-cyan-500/15 border border-cyan-400/50 text-[11px] sm:text-xs text-cyan-200 font-medium flex items-center gap-2">
              <span>🔮</span>
              <span><b>Sonido de la Canica:</b> El cristal templado vibra cerca de: <em>${this.formatMd(q.perla_caces.slice(0, 135))}...</em></span>
            </div>
          ` : ''}
        </div>

        <!-- 4 Opciones de Cristal (A, B, C, D) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
          ${options.map((opt, idx) => {
            const isBroken = st.brokenOptionsInCurrentStep.has(opt.id);
            return `
              <button type="button" data-opt-id="${opt.id}" data-lane-idx="${idx}" ${isBroken || st.isAnimatingJump ? 'disabled' : ''} class="bridge-opt-card group text-left px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                isBroken
                  ? 'bg-rose-950/25 border-rose-900/40 text-slate-600 line-through opacity-45 cursor-not-allowed'
                  : 'bg-slate-900/95 hover:bg-slate-800 border-slate-700/80 hover:border-emerald-400 text-slate-100 cursor-pointer shadow-sm active:scale-[0.99]'
              }">
                <span class="w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                  isBroken
                    ? 'bg-rose-950 text-rose-500 border border-rose-800'
                    : 'bg-slate-950 border border-slate-700 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 group-hover:border-emerald-300'
                }">
                  ${opt.id}
                </span>
                <span class="text-xs sm:text-sm leading-snug flex-1">
                  ${this.formatMd(opt.texto)}
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    bottomOverlay.querySelector('#btn-power-5050')?.addEventListener('click', () => this.triggerGlassmakerEyePowerup());
    bottomOverlay.querySelector('#btn-power-marble')?.addEventListener('click', () => this.triggerMarbleHintPowerup());
    bottomOverlay.querySelector('#btn-power-shield')?.addEventListener('click', () => this.triggerTemperedShieldPowerup());

    bottomOverlay.querySelectorAll('.bridge-opt-card').forEach(btn => {
      const laneIdx = parseInt(btn.getAttribute('data-lane-idx') || '0', 10);
      btn.addEventListener('mouseenter', () => {
        if (this.bridgeState) this.bridgeState.anim.hoveredLane = laneIdx;
      });
      btn.addEventListener('mouseleave', () => {
        if (this.bridgeState) this.bridgeState.anim.hoveredLane = -1;
      });
      btn.addEventListener('click', () => {
        const optId = btn.getAttribute('data-opt-id') || 'A';
        this.handleBridgeJump(optId);
      });
    });
  }

  /**
   * Inicia el salto en primera persona (POV) hacia el peldaño elegido (A, B, C o D).
   * El jugador cae EXACTAMENTE sobre `jumpTargetRow = st.currentStep` (nunca atrás).
   */
  handleBridgeJump(chosenOptionId = 'A') {
    const st = this.bridgeState;
    if (!st || st.isAnimatingJump || st.awaitingNextStep || st.isGameOver || st.isVictory) return;

    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const laneIdx = this.laneIndexForOption(chosenOptionId);
    const isCorrect = String(chosenOptionId).toUpperCase() === String(q.correcta).toUpperCase();
    const now = performance.now();

    st.isAnimatingJump = true;
    st.lastChosenOptionId = chosenOptionId;
    st.anim.hoveredLane = -1;

    // Ocultar globo de diálogo durante el salto para máxima inmersión
    st.anim.activeChatter = null;
    this.renderBackPlayerChatterBanner();

    st.anim.camMode = 'POV_JUMPING';
    st.anim.jumpStartTime = now;
    st.anim.jumpDuration = 580;
    st.anim.jumpStartRow = st.anim.playerRow;
    st.anim.jumpStartLane = st.anim.playerLane;
    st.anim.jumpTargetRow = st.currentStep; // Cae JUSTO ENCIMA del peldaño actual
    st.anim.jumpTargetLane = laneIdx;
    st.anim.jumpWillBreak = !isCorrect;
    st.anim.jumpChosenId = chosenOptionId;

    this.playTone('jump');
    this.updateGlassBridgeDOM();
  }

  /**
   * Se ejecuta cuando los pies del jugador aterrizan exactamente en el centro del peldaño (`playerRow = currentStep`).
   * La cámara mira hacia los pies (`cameraPitch = 1.05 rad`) para ver si el vidrio aguanta o se rompe,
   * y luego levanta la mirada hacia adelante (`cameraPitch -> 0.18 rad`).
   */
  onPOVJumpLanded() {
    const st = this.bridgeState;
    if (!st) return;

    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const chosenOptionId = st.anim.jumpChosenId || 'A';
    const laneIdx = st.anim.jumpTargetLane;
    const isCorrect = !st.anim.jumpWillBreak;
    const now = performance.now();

    if (isCorrect) {
      // 1. ¡El vidrio es TEMPLADO! Estás parado encima del peldaño mirando tus zapatillas sobre el cristal verde
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
      st.anim.phaseDuration = 920; // 440ms mirando a tus pies en el vidrio templado + 480ms levantando la mirada al frente
      this.updateGlassBridgeDOM();

      setTimeout(() => {
        if (!this.bridgeState || st.isGameOver) return;
        st.anim.camMode = 'POV_READY';
        st.anim.cameraPitch = 0.18;
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
      }, 920);
    } else {
      // 2. ¡El vidrio es FALSO!
      // Si tenía el Escudo Templado activo, el escudo absorbe la rotura y te regresa un paso atrás sin perder la vida
      if (st.shieldActiveInCurrentStep) {
        this.playTone('glass_shatter');
        st.tiles[st.currentStep][laneIdx] = 'broken';
        st.brokenOptionsInCurrentStep.add(chosenOptionId);
        this.spawnGlassShards3D(st.currentStep, laneIdx, 40);
        st.shieldActiveInCurrentStep = false;
        st.anim.playerRow = st.anim.jumpStartRow;
        st.anim.playerLane = st.anim.jumpStartLane;
        st.anim.cameraRow = st.anim.playerRow;
        st.anim.cameraLane = st.anim.playerLane;
        st.anim.cameraY = 1.18;
        st.anim.cameraPitch = 0.18;
        st.anim.camMode = 'POV_READY';
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

      // Sub-fase A (460ms): Miras hacia tus pies y ves cómo el cristal bajo tus zapatillas se llena de grietas
      st.anim.camMode = 'POV_FLOOR_CRACK';
      st.anim.phaseStartTime = now;
      st.anim.phaseDuration = 460;
      this.updateGlassBridgeDOM();

      setTimeout(() => {
        if (!this.bridgeState) return;
        const shatterNow = performance.now();
        this.playTone('glass_shatter');
        st.tiles[st.currentStep][laneIdx] = 'broken';
        st.brokenOptionsInCurrentStep.add(chosenOptionId);
        this.spawnGlassShards3D(st.currentStep, laneIdx, 58);
        st.anim.screenShake = 15;

        st.lastFallenPlayerNum = st.anim.playerNumber;
        st.lives -= 1;
        st.streak = 0;
        st.lastJumpOutcome = 'wrong';

        const safeLane = this.laneIndexForOption(q.correcta);
        st.tiles[st.currentStep][safeLane] = 'safe';
        st.safeLaneHistory[st.currentStep] = safeLane;

        // Sub-fase B (960ms): El cristal estalla bajo tus pies y caes al vacío en primera persona
        st.anim.camMode = 'POV_FALLING';
        st.anim.phaseStartTime = shatterNow;
        st.anim.phaseDuration = 960;
        this.updateGlassBridgeDOM();

        setTimeout(() => {
          if (!this.bridgeState) return;

          // Si cayó el último jugador (#100, 0 vidas restantes): fin de la partida
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

          // Sub-fase C (1350ms): Transición cinemática clara que enfoca primero en 3ra persona al jugador
          // que estaba atrás (#058 o #100) parado en el peldaño anterior y hace un zoom suave hacia sus ojos
          const nextSquad = this.getSquadOrderForLives(st.lives);
          const nextLeadNum = nextSquad[0] || (st.lives === 2 ? '058' : '100');
          const prevRow = st.currentStep > 0 ? (st.currentStep - 1) : -0.82;
          const prevLane = st.currentStep > 0 && st.safeLaneHistory[st.currentStep - 1] !== undefined
            ? st.safeLaneHistory[st.currentStep - 1]
            : 1.5;

          st.anim.playerNumber = nextLeadNum;
          st.anim.playerRow = prevRow;
          st.anim.playerLane = prevLane;
          st.anim.camMode = 'RELAY_REVEAL_BEHIND';
          st.anim.phaseStartTime = performance.now();
          st.anim.phaseDuration = 1350;
          this.playTone('popup_open');
          this.triggerBackPlayerTaunt('fell');
          this.updateGlassBridgeDOM();

          // Sub-fase D: Una vez dentro del POV del jugador de atrás (#058 o #100), salta al vidrio templado,
          // mira sus pies sobre el vidrio seguro y luego mira hacia adelante
          setTimeout(() => {
            if (!this.bridgeState || st.isGameOver) return;
            const relayNow = performance.now();
            this.playTone('jump');
            st.anim.camMode = 'POV_RELAY_JUMP';
            st.anim.jumpStartTime = relayNow;
            st.anim.jumpDuration = 580;
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
              st.anim.phaseDuration = 880;
              this.updateGlassBridgeDOM();

              setTimeout(() => {
                if (!this.bridgeState || st.isGameOver) return;
                st.anim.camMode = 'POV_READY';
                st.anim.cameraPitch = 0.18;
                st.isAnimatingJump = false;
                st.awaitingNextStep = true;
                this.updateGlassBridgeDOM();
              }, 880);
            }, 580);
          }, 1350);
        }, 960);
      }, 460);
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
      st.anim.jumpTargetRow = st.totalSteps + 0.35;
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
    st.anim.cameraPitch = 0.18;
    this.playTone('beep');
    this.updateGlassBridgeDOM();

    // Disparar como máximo 1 frase para este nuevo peldaño
    this.scheduleSingleStepDialogue(850);
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
        pts,
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
        anim.cameraRow = -2.35 + (t / 0.62) * 0.28;
        anim.cameraLane = 1.5;
        anim.cameraY = 1.52;
        anim.cameraPitch = 0.14;
      } else {
        const zt = (t - 0.62) / 0.38;
        const ease = zt < 0.5 ? 2 * zt * zt : 1 - Math.pow(-2 * zt + 2, 2) / 2;
        anim.cameraRow = -2.07 + (anim.playerRow - (-2.07)) * ease;
        anim.cameraLane = 1.5;
        anim.cameraY = 1.52 + (1.18 - 1.52) * ease;
        anim.cameraPitch = 0.14 + (0.18 - 0.14) * ease;
      }
      if (t >= 1) {
        anim.camMode = 'POV_READY';
        anim.cameraRow = anim.playerRow;
        anim.cameraLane = anim.playerLane;
        anim.cameraY = 1.18;
        anim.cameraPitch = 0.18;
        this.updateGlassBridgeDOM();
      }
    }

    // 2. MODO POV LISTO PARA SALTAR ('POV_READY')
    // La cámara está exactamente en (playerRow, playerLane) mirando hacia adelante (pitch = 0.18 rad)
    else if (anim.camMode === 'POV_READY') {
      anim.cameraRow += (anim.playerRow - anim.cameraRow) * 0.18;
      anim.cameraLane += (anim.playerLane - anim.cameraLane) * 0.18;
      anim.cameraY = 1.18 + Math.sin(now * 0.0035) * 0.014;
      anim.cameraPitch += (0.18 - anim.cameraPitch) * 0.16;
      anim.cameraRoll *= 0.8;
    }

    // 3. SALTO EN PRIMERA PERSONA CAYENDO EXACTAMENTE EN EL PELDAÑO Y MIRANDO A LOS PIES ('POV_JUMPING' o 'POV_RELAY_JUMP')
    else if (anim.camMode === 'POV_JUMPING' || anim.camMode === 'POV_RELAY_JUMP') {
      const elapsed = Math.max(0, now - anim.jumpStartTime);
      const t = Math.min(1, elapsed / anim.jumpDuration);
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      // Avanza hasta quedar exactamente encima del centro del peldaño (jumpTargetRow = st.currentStep)
      anim.playerRow = anim.jumpStartRow + (anim.jumpTargetRow - anim.jumpStartRow) * easeT;
      anim.playerLane = anim.jumpStartLane + (anim.jumpTargetLane - anim.jumpStartLane) * easeT;
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraY = 1.18 + Math.sin(t * Math.PI) * 0.95;

      // Al despegar mira hacia el peldaño objetivo y al ir cayendo inclina la cámara hacia los pies (1.05 rad = 60°)
      if (t < 0.30) {
        anim.cameraPitch = 0.18 + (t / 0.30) * 0.18;
      } else {
        const lookDownT = (t - 0.30) / 0.70;
        const smoothDown = lookDownT < 0.5 ? 2 * lookDownT * lookDownT : 1 - Math.pow(-2 * lookDownT + 2, 2) / 2;
        anim.cameraPitch = 0.36 + smoothDown * 0.69; // Termina en 1.05 rad (60° mirando directo a tus zapatillas sobre el vidrio)
      }

      if (t >= 1 && anim.camMode === 'POV_JUMPING') {
        anim.playerRow = anim.jumpTargetRow;
        anim.playerLane = anim.jumpTargetLane;
        anim.cameraRow = anim.playerRow;
        anim.cameraLane = anim.playerLane;
        anim.cameraY = 1.15;
        anim.cameraPitch = 1.05;
        this.onPOVJumpLanded();
      }
    }

    // 4. PARADO SOBRE EL PELDAÑO MIRANDO TUS PIES EN EL VIDRIO TEMPLADO Y LUEGO MIRANDO AL FRENTE ('POV_FLOOR_CHECK_SAFE')
    else if (anim.camMode === 'POV_FLOOR_CHECK_SAFE') {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const t = Math.min(1, elapsed / anim.phaseDuration);
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      if (t < 0.48) {
        // Primera mitad (0 a 440ms): miras directamente tus zapatillas paradas sobre el vidrio templado verde
        anim.cameraPitch = 1.05;
        anim.cameraY = 1.15;
      } else {
        // Segunda mitad (440ms a 920ms): levantas la mirada suavemente hacia adelante (donde ya te espera el siguiente peldaño)
        const upT = (t - 0.48) / 0.52;
        const easeUp = upT < 0.5 ? 2 * upT * upT : 1 - Math.pow(-2 * upT + 2, 2) / 2;
        anim.cameraPitch = 1.05 + (0.18 - 1.05) * easeUp;
        anim.cameraY = 1.15 + (1.18 - 1.15) * easeUp;
      }
    }

    // 5. MIRANDO EL CRISTAL AGRIETARSE BAJO TUS PIES ('POV_FLOOR_CRACK')
    else if (anim.camMode === 'POV_FLOOR_CRACK') {
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraPitch = 1.05; // Mirando directo a tus pies mientras el vidrio se raja
      anim.cameraY = 1.12;
      anim.screenShake = 6;
    }

    // 6. CAÍDA AL VACÍO EN PRIMERA PERSONA ('POV_FALLING')
    else if (anim.camMode === 'POV_FALLING') {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const t = Math.min(1, elapsed / anim.phaseDuration);
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraY = 1.12 - (t * t) * 6.4;
      anim.cameraPitch = 1.05 - t * 1.25; // Mientras cae al abismo, la vista gira viendo el puente alejarse arriba
      anim.cameraRoll = Math.sin(t * Math.PI * 2.5) * 0.18;
    }

    // 7. TRANSICIÓN CINEMÁTICA AL PERDER UNA VIDA ('RELAY_REVEAL_BEHIND'):
    //    Muestra primero al jugador que estaba atrás (#058 o #100) parado en el peldaño anterior
    //    y luego acerca la cámara suavemente hacia su cabeza para entrar en su POV.
    else if (anim.camMode === 'RELAY_REVEAL_BEHIND') {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const t = Math.min(1, elapsed / anim.phaseDuration);
      if (t < 0.52) {
        // Parte 1 (0 a 700ms): Plano en 3ra persona detrás/diagonal al jugador sobreviviente (#058 o #100)
        // para que el usuario vea claramente quién estaba atrás y va a tomar el relevo
        const p1 = t / 0.52;
        const ease1 = 1 - Math.pow(1 - p1, 2);
        anim.cameraRow = (anim.playerRow - 1.35) + ease1 * 0.25;
        anim.cameraLane = anim.playerLane + (1 - ease1) * 0.35;
        anim.cameraY = 1.58 - ease1 * 0.10;
        anim.cameraPitch = 0.22;
        anim.cameraRoll = 0;
      } else {
        // Parte 2 (700ms a 1350ms): Zoom suave hacia los ojos del jugador de atrás para entrar en su POV
        const p2 = (t - 0.52) / 0.48;
        const ease2 = p2 < 0.5 ? 2 * p2 * p2 : 1 - Math.pow(-2 * p2 + 2, 2) / 2;
        anim.cameraRow = (anim.playerRow - 1.10) + (anim.playerRow - (anim.playerRow - 1.10)) * ease2;
        anim.cameraLane = anim.playerLane;
        anim.cameraY = 1.48 + (1.18 - 1.48) * ease2;
        anim.cameraPitch = 0.22 + (0.18 - 0.22) * ease2;
        anim.cameraRoll = 0;
      }
    }

    // Actualizar fragmentos de vidrio roto
    for (let i = anim.shards.length - 1; i >= 0; i--) {
      const s = anim.shards[i];
      s.x += s.vx;
      s.y += s.vy;
      s.z += s.vz;
      s.vy -= 0.0032;
      s.rot += s.vRot;
      s.alpha -= 0.022;
      if (s.alpha <= 0) anim.shards.splice(i, 1);
    }

    // Actualizar ondas de impacto en vidrio templado
    for (let i = anim.shockwaves.length - 1; i >= 0; i--) {
      const w = anim.shockwaves[i];
      w.radius += 0.045;
      w.alpha -= 0.032;
      if (w.alpha <= 0) anim.shockwaves.splice(i, 1);
    }
  }

  /**
   * Proyección 3D con Matriz de Rotación de Cabeza (Pitch 3D real alrededor del eje X de la cámara).
   * Gracias a esta rotación geométrica real, cuando el jugador está parado EXACTAMENTE encima
   * del peldaño `r` (`camZ = r`) e inclina la vista hacia sus pies (`pitch = 1.05 rad`),
   * el vidrio bajo sus pies tiene profundidad positiva (`rotZ > 0`) y se ve justo debajo de sus zapatillas.
   */
  projectBridge3DPoint(worldX, worldY, worldZ, camX, camY, camZ, pitch, focal, cx, cy) {
    const dx = worldX - camX;
    const dy = camY - worldY; // positivo hacia abajo (el suelo está en worldY = 0 y los ojos en camY = 1.18)
    const dz = worldZ - camZ; // positivo hacia adelante a lo largo del puente

    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    // Profundidad a lo largo del rayo visual de la cámara y coordenada vertical perpendicular
    const rotZ = dz * cosP + dy * sinP;
    const rotY = dy * cosP - dz * sinP;

    const safeDepth = Math.max(0.16, rotZ);
    const scale = focal / safeDepth;

    return {
      x: cx + dx * scale,
      y: cy + rotY * scale,
      scale,
      depth: rotZ
    };
  }

  drawGlassBridge3DScene(canvas, now) {
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.bridgeState) return;
    const st = this.bridgeState;
    const anim = st.anim;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W * 0.5;
    const cy = H * 0.34;
    const focal = Math.min(W, H) * 0.92;

    const camX = (anim.cameraLane - 1.5) * 0.94;
    const camY = anim.cameraY;
    const camZ = anim.cameraRow;
    const pitch = anim.cameraPitch;

    ctx.save();
    if (anim.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * anim.screenShake,
        (Math.random() - 0.5) * anim.screenShake
      );
    }

    // 1. Fondo del Coliseo Squid Game
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#070312');
    skyGrad.addColorStop(0.55, '#130826');
    skyGrad.addColorStop(1, '#04010a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Haces de luz volumétricos
    [
      { x: W * 0.22, col: 'rgba(244, 63, 94, 0.10)' },
      { x: W * 0.78, col: 'rgba(16, 185, 129, 0.10)' }
    ].forEach(beam => {
      ctx.beginPath();
      ctx.moveTo(beam.x, 0);
      ctx.lineTo(beam.x - W * 0.25, H);
      ctx.lineTo(beam.x + W * 0.25, H);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, beam.col);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fill();
    });

    const proj = (wx, wy, wz) => this.projectBridge3DPoint(wx, wy, wz, camX, camY, camZ, pitch, focal, cx, cy);

    // 2. Vigas de acero rosas a lo largo de los 4 carriles (A, B, C, D)
    [-1.88, -0.94, 0, 0.94, 1.88].forEach(railX => {
      const zStart = Math.max(-1.8, camZ - 0.5);
      const zEnd = st.totalSteps + 1.2;
      const p1 = proj(railX, -0.03, zStart);
      const p2 = proj(railX, -0.03, zEnd);
      if (p1.depth > 0.15 || p2.depth > 0.15) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.72)';
        ctx.lineWidth = Math.max(1.5, Math.min(7, p1.scale * 0.022));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // 3. Plataforma de salida (detrás del peldaño 0)
    {
      const sTL = proj(-1.95, 0, -0.52);
      const sTR = proj(1.95, 0, -0.52);
      const sBR = proj(1.95, 0, -2.15);
      const sBL = proj(-1.95, 0, -2.15);
      if (sTL.depth > 0.18 && sBR.depth > 0.18) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sTL.x, sTL.y);
        ctx.lineTo(sTR.x, sTR.y);
        ctx.lineTo(sBR.x, sBR.y);
        ctx.lineTo(sBL.x, sBL.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 4. Plataforma de Meta VIP al final del puente
    {
      const fNear = st.totalSteps - 0.35;
      const fFar = st.totalSteps + 0.85;
      const fTL = proj(-1.95, 0, fFar);
      const fTR = proj(1.95, 0, fFar);
      const fBR = proj(1.95, 0, fNear);
      const fBL = proj(-1.95, 0, fNear);
      if (fTL.depth > 0.2 && fBR.depth > 0.2) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(fTL.x, fTL.y);
        ctx.lineTo(fTR.x, fTR.y);
        ctx.lineTo(fBR.x, fBR.y);
        ctx.lineTo(fBL.x, fBL.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 5. Dibujar todos los peldaños de cristal (del más lejano al más cercano, incluyendo el peldaño bajo tus pies)
    anim.tileHitRegions = [];
    const letters = ['A', 'B', 'C', 'D'];

    for (let r = st.totalSteps - 1; r >= 0; r--) {
      const zNear = r - 0.36;
      const zFar = r + 0.36;
      const isCurrentTargetStep = (r === st.currentStep) && !st.awaitingNextStep && !st.isGameOver && !st.isVictory;

      for (let lane = 0; lane < 4; lane++) {
        const tileState = st.tiles[r][lane];
        if (tileState === 'broken') continue;

        const xCenter = (lane - 1.5) * 0.94;
        const xLeft = xCenter - 0.41;
        const xRight = xCenter + 0.41;

        const pTL = proj(xLeft, 0, zFar);
        const pTR = proj(xRight, 0, zFar);
        const pBR = proj(xRight, 0, zNear);
        const pBL = proj(xLeft, 0, zNear);

        // Si las 4 esquinas están detrás de la lente, omitir
        if (pTL.depth <= 0.16 && pTR.depth <= 0.16 && pBR.depth <= 0.16 && pBL.depth <= 0.16) continue;

        const isHovered = isCurrentTargetStep && anim.hoveredLane === lane;
        const isSafe = tileState === 'safe';
        const isCrackingNow = (anim.camMode === 'POV_FLOOR_CRACK') && r === st.currentStep && lane === anim.jumpTargetLane;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pTL.x, pTL.y);
        ctx.lineTo(pTR.x, pTR.y);
        ctx.lineTo(pBR.x, pBR.y);
        ctx.lineTo(pBL.x, pBL.y);
        ctx.closePath();

        if (isCrackingNow) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.48)';
          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 3;
        } else if (isSafe) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.52)';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 3;
        } else if (isHovered) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
          ctx.strokeStyle = '#7dd3fc';
          ctx.lineWidth = 2.8;
        } else if (isCurrentTargetStep) {
          const pulse = 0.5 + 0.5 * Math.sin(now * 0.006);
          ctx.fillStyle = `rgba(56, 189, 248, ${0.20 + pulse * 0.12})`;
          ctx.strokeStyle = `rgba(125, 211, 252, ${0.72 + pulse * 0.25})`;
          ctx.lineWidth = 2.2;
        } else {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.17)';
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
          ctx.lineWidth = 1.4;
        }

        ctx.fill();
        ctx.stroke();

        // Reflejo diagonal del cristal
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pTL.x + (pTR.x - pTL.x) * 0.18, pTL.y + (pBL.y - pTL.y) * 0.18);
        ctx.lineTo(pTL.x + (pTR.x - pTL.x) * 0.62, pTL.y + (pBL.y - pTL.y) * 0.82);
        ctx.stroke();

        // Si el vidrio se está rajando bajo tus pies ('POV_FLOOR_CRACK'), dibujar las grietas radiales
        if (isCrackingNow) {
          const midX = (pTL.x + pTR.x + pBR.x + pBL.x) * 0.25;
          const midY = (pTL.y + pTR.y + pBR.y + pBL.y) * 0.25;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.2;
          for (let c = 0; c < 9; c++) {
            const ang = (c / 9) * Math.PI * 2 + 0.25;
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX + Math.cos(ang) * 34, midY + Math.sin(ang) * 20);
            ctx.stroke();
          }
        }

        // Etiqueta A, B, C, D en el peldaño objetivo
        if (isCurrentTargetStep || isSafe) {
          const centerPt = proj(xCenter, 0, r);
          if (centerPt.depth > 0.22) {
            ctx.fillStyle = isSafe ? '#ecfdf5' : '#e0f2fe';
            ctx.font = `900 ${Math.max(11, Math.min(22, Math.round(centerPt.scale * 0.16)))}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(letters[lane], centerPt.x, centerPt.y);
          }
        }

        ctx.restore();

        if (isCurrentTargetStep) {
          anim.tileHitRegions.push({
            lane,
            poly: [pTL, pTR, pBR, pBL]
          });
        }
      }
    }

    // 6. Ondas verdes de confirmación sobre el vidrio templado
    for (const w of anim.shockwaves) {
      const wx = (w.lane - 1.5) * 0.94;
      const p = proj(wx, 0, w.row);
      if (p.depth <= 0.16) continue;
      ctx.save();
      ctx.strokeStyle = `rgba(52, 211, 153, ${w.alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, w.radius * p.scale * 0.55, w.radius * p.scale * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 7. Animación de la canica si el usuario activó "🔮 Tirar Canica"
    if (anim.marbleAnim) {
      const m = anim.marbleAnim;
      const mt = Math.min(1, (now - m.startTime) / m.duration);
      const mRow = m.startRow + (m.targetRow - m.startRow) * mt;
      const mLane = m.startLane + (m.targetLane - m.startLane) * mt;
      const mY = Math.abs(Math.sin(mt * Math.PI * 2.5)) * (1 - mt * 0.6) * 0.45;
      const mp = proj((mLane - 1.5) * 0.94, mY, mRow);
      if (mp.depth > 0.16) {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, Math.max(4, mp.scale * 0.045), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      if (mt >= 1) {
        anim.marbleAnim = null;
      }
    }

    // 8. Fragmentos de cristal cayendo al abismo
    for (const s of anim.shards) {
      const p = proj(s.x, s.y, s.z);
      if (p.depth <= 0.16) continue;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(s.rot);
      ctx.fillStyle = `rgba(186, 230, 253, ${s.alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
      const sz = Math.max(2, (s.size * p.scale) / 110);
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.lineTo(sz * 0.9, sz * 0.6);
      ctx.lineTo(-sz * 0.8, sz * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 9. Dibujar a los jugadores en 3ra persona durante:
    //    - 'INTRO_SQUAD' (plano inicial de los 3 jugadores #456, #058 y #100)
    //    - 'RELAY_REVEAL_BEHIND' (cuando cae el de adelante y la cámara muestra claramente al jugador de atrás antes de entrar a su POV)
    if (anim.camMode === 'INTRO_SQUAD') {
      const introSquad = [
        { number: '100', row: -1.68, lane: 2.05 },
        { number: '058', row: -1.32, lane: 0.95 },
        { number: '456', row: -0.82, lane: 1.50 }
      ];
      introSquad.forEach(p => {
        this.drawThirdPersonPlayer3D(ctx, proj, p.number, p.row, p.lane, 0, false);
      });
    } else if (anim.camMode === 'RELAY_REVEAL_BEHIND') {
      // Mostrar también al 3er jugador atrás si quedan 2 vidas, y destacar con etiqueta de relevo al jugador que asume el mando
      if (st.lives === 2) {
        const backRow = Math.max(-1.45, anim.playerRow - 0.62);
        this.drawThirdPersonPlayer3D(ctx, proj, '100', backRow, 1.85, 0, false);
      }
      this.drawThirdPersonPlayer3D(ctx, proj, anim.playerNumber, anim.playerRow, anim.playerLane, 0, true);
    } else {
      // MODO POV PRIMERA PERSONA:
      // Cuando la cámara mira hacia abajo (pitch > 0.42), dibuja tus zapatillas blancas paradas EXACTAMENTE
      // sobre el cristal (`anim.playerRow`, `anim.playerLane`) para que veas el peldaño bajo tus pies
      if (pitch > 0.42 && anim.camMode !== 'POV_FALLING') {
        this.drawPOVFeetOnGlass3D(ctx, proj, anim, W, H, pitch);
      }
      // Manos y mangas en primer plano con el parche del jugador activo (#456, #058 o #100)
      this.drawPOVHandsForeground(ctx, W, H, now, anim);
    }

    ctx.restore();
  }

  /**
   * Dibuja un jugador de Squid Game en 3D con uniforme verde, zapatillas blancas y parche numérico.
   * Si `isRelayHighlight === true`, muestra un indicador flotante claro de que este jugador de atrás toma el relevo.
   */
  drawThirdPersonPlayer3D(ctx, projFn, numberStr, row, lane, liftY = 0, isRelayHighlight = false) {
    const wx = (lane - 1.5) * 0.94;
    const basePt = projFn(wx, liftY, row);
    if (basePt.depth <= 0.18) return;

    const s = Math.max(0.35, Math.min(3.2, basePt.scale * 0.0068));

    ctx.save();
    ctx.translate(basePt.x, basePt.y);

    // Sombra sobre la plataforma o vidrio
    ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15 * s, 5.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Piernas y zapatillas blancas
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = Math.max(2, 5.2 * s);
    ctx.lineCap = 'round';
    [-5.2 * s, 5.2 * s].forEach(lx => {
      ctx.beginPath();
      ctx.moveTo(lx, -21 * s);
      ctx.lineTo(lx, -2 * s);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(lx, 0, 4.4 * s, 2.3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Chaqueta deportiva verde Squid Game
    ctx.fillStyle = '#0d9488';
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = Math.max(1, 1.2 * s);
    ctx.beginPath();
    ctx.roundRect(-12 * s, -45 * s, 24 * s, 24 * s, 5 * s);
    ctx.fill();
    ctx.stroke();

    // Parche blanco con el número (#456, #058 o #100)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-9.5 * s, -38 * s, 19 * s, 10 * s, 2 * s);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = `900 ${Math.max(8, Math.round(7.5 * s))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numberStr, 0, -33 * s);

    // Cabeza
    ctx.fillStyle = '#f1c27d';
    ctx.beginPath();
    ctx.arc(0, -54 * s, 7.2 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -55.5 * s, 7.4 * s, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();

    // Etiqueta clara de relevo cuando cae el jugador de adelante
    if (isRelayHighlight) {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-72, -82 * s - 16, 144, 22, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 10px "JetBrains Mono", monospace';
      ctx.fillText(`⬆️ TOMA EL RELEVO #${numberStr}`, 0, -82 * s - 5);
    }

    ctx.restore();
  }

  /**
   * Dibuja tus propias zapatillas blancas proyectadas directamente en el centro del peldaño (`playerRow`, `playerLane`)
   * cuando miras hacia tus pies al saltar y aterrizar sobre el vidrio.
   */
  drawPOVFeetOnGlass3D(ctx, projFn, anim, W, H, pitch) {
    const visibility = Math.min(1, Math.max(0, (pitch - 0.42) / 0.45));
    if (visibility <= 0.02) return;

    const baseX = (anim.playerLane - 1.5) * 0.94;
    const baseZ = anim.playerRow + 0.05; // Justo en el centro del peldaño bajo tus ojos

    ctx.save();
    ctx.globalAlpha = visibility * 0.96;

    [-1, 1].forEach(dir => {
      const footWorldX = baseX + dir * 0.14;
      const heelPt = projFn(footWorldX, 0.01, baseZ - 0.06);
      const toePt = projFn(footWorldX, 0.01, baseZ + 0.15);
      if (heelPt.depth <= 0.15 || toePt.depth <= 0.15) return;

      const fx = (heelPt.x + toePt.x) * 0.5;
      const fy = (heelPt.y + toePt.y) * 0.5;
      const footLen = Math.max(20, Math.min(54, Math.hypot(toePt.x - heelPt.x, toePt.y - heelPt.y) * 1.15));
      const footWid = footLen * 0.48;

      // Suela y zapatilla blanca de Squid Game pisando el centro del vidrio
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(fx, fy, footWid, footLen * 0.55, dir * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cordones / puntera gris
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(fx - footWid * 0.45, fy - footLen * 0.1);
      ctx.lineTo(fx + footWid * 0.45, fy - footLen * 0.1);
      ctx.stroke();

      // Pantalón verde deportivo arriba del tobillo
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.roundRect(fx - footWid * 0.85, fy + footLen * 0.15, footWid * 1.7, footLen * 0.55, 6);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Dibuja en primer plano las manos y mangas del jugador activo (#456, #058 o #100)
   */
  drawPOVHandsForeground(ctx, W, H, now, anim) {
    const activeNum = anim.playerNumber || '456';
    const swayX = Math.sin(now * 0.0035) * 4;
    const swayY = Math.abs(Math.cos(now * 0.0035)) * 3 + (anim.camMode === 'POV_JUMPING' ? -12 : 0);

    ctx.save();
    [-1, 1].forEach(dir => {
      ctx.save();
      const baseX = W * 0.5 + dir * Math.min(165, W * 0.34) + swayX * dir;
      const baseY = H + 12 + swayY;

      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 25;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(baseX + dir * 24, baseY + 18);
      ctx.lineTo(baseX - dir * 10, baseY - 36);
      ctx.stroke();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(baseX + dir * 16, baseY + 14);
      ctx.lineTo(baseX - dir * 15, baseY - 34);
      ctx.stroke();

      if (dir === -1) {
        ctx.save();
        ctx.translate(baseX - 2, baseY - 17);
        ctx.rotate(-0.32);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-15, -8, 30, 15);
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(activeNum, 0, 0);
        ctx.restore();
      }

      const handX = baseX - dir * 12;
      const handY = baseY - 42;
      ctx.fillStyle = '#f1c27d';
      ctx.beginPath();
      ctx.ellipse(handX, handY, 9.5, 7.5, dir * -0.25, 0, Math.PI * 2);
      ctx.fill();

      for (let f = 0; f < 4; f++) {
        const fx = handX + (f - 1.5) * 3.6;
        const fy = handY - 6.5 - (f === 1 || f === 2 ? 2 : 0);
        ctx.beginPath();
        ctx.roundRect(fx - 1.5, fy - 4, 3, 7, 1.5);
        ctx.fill();
      }
      ctx.restore();
    });
    ctx.restore();
  }

  // =========================================================================
  // JUEGO 2: AHORCADO CLÍNICO MSP
  // =========================================================================
  startHangmanGame() {
    this.stopAllLoops();
    const stage = document.getElementById('arcade-stage');
    if (!stage) return;

    const pick = this.hangmanDictionary[Math.floor(Math.random() * this.hangmanDictionary.length)];
    this.hangmanState = {
      entry: pick,
      targetWord: pick.word.toUpperCase(),
      guessedLetters: new Set(),
      mistakes: 0,
      maxMistakes: 6,
      hintUsed: false,
      isSolved: false,
      isFailed: false
    };

    this.renderHangmanUI();
    this.startAmbientSound('hangman');

    this.activeKeyHandler = (e) => {
      if (this.currentMode !== 'hangman' || !this.hangmanState) return;
      const tab = document.getElementById('tab-arcade');
      if (!tab || tab.classList.contains('hidden')) return;
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(key)) {
        this.handleHangmanLetter(key);
      }
    };
    window.addEventListener('keydown', this.activeKeyHandler);
  }

  renderHangmanUI() {
    const stage = document.getElementById('arcade-stage');
    if (!stage || !this.hangmanState) return;
    const st = this.hangmanState;

    const vitalPercent = Math.max(0, Math.round(((st.maxMistakes - st.mistakes) / st.maxMistakes) * 100));
    const bpm = st.isFailed ? 0 : (72 + st.mistakes * 18);
    const spo2 = st.isFailed ? 0 : Math.max(74, 99 - st.mistakes * 4);
    const statusColor = st.mistakes <= 2 ? 'emerald' : (st.mistakes <= 4 ? 'amber' : 'rose');
    const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

    stage.innerHTML = `
      <div class="p-4 sm:p-6 space-y-5 bg-slate-950/90 rounded-3xl border border-slate-800 text-white">
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-extrabold uppercase tracking-wider">
              🏥 Monitor UCI • Ahorcado Clínico MSP
            </span>
            <span class="text-xs font-mono text-slate-400">${st.entry.category}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 font-mono text-xs">
              <span class="text-slate-400">FC:</span>
              <strong class="text-${statusColor}-400">${bpm} lpm</strong>
              <span class="text-slate-600">|</span>
              <span class="text-slate-400">SpO₂:</span>
              <strong class="text-sky-400">${spo2}%</strong>
            </div>
            <button id="btn-hangman-new" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 cursor-pointer">
              🔄 Otro Caso
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div class="lg:col-span-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center space-y-3">
            <div class="w-full flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>ESTABILIDAD HEMODINÁMICA</span>
              <span class="font-bold text-emerald-400">${vitalPercent}%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div class="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-300" style="width: ${vitalPercent}%"></div>
            </div>
            <svg class="w-40 h-44 text-slate-300" viewBox="0 0 160 180">
              <line x1="20" y1="165" x2="140" y2="165" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
              <line x1="45" y1="165" x2="45" y2="20" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
              <line x1="45" y1="20" x2="105" y2="20" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
              <line x1="105" y1="20" x2="105" y2="40" stroke="#f43f5e" stroke-width="2.5"/>
              ${st.mistakes >= 1 ? `<circle cx="105" cy="56" r="16" fill="none" stroke="#38bdf8" stroke-width="3.5"/>` : ''}
              ${st.mistakes >= 2 ? `<line x1="105" y1="72" x2="105" y2="118" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>` : ''}
              ${st.mistakes >= 3 ? `<line x1="105" y1="84" x2="82" y2="104" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>` : ''}
              ${st.mistakes >= 4 ? `<line x1="105" y1="84" x2="128" y2="104" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>` : ''}
              ${st.mistakes >= 5 ? `<line x1="105" y1="118" x2="86" y2="148" stroke="#f43f5e" stroke-width="3.5" stroke-linecap="round"/>` : ''}
              ${st.mistakes >= 6 ? `<line x1="105" y1="118" x2="124" y2="148" stroke="#f43f5e" stroke-width="3.5" stroke-linecap="round"/>` : ''}
            </svg>
            <div class="text-[11px] font-mono text-slate-400">
              Errores: <strong class="text-rose-400">${st.mistakes}</strong> / ${st.maxMistakes}
            </div>
          </div>

          <div class="lg:col-span-8 space-y-4">
            <div class="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  ${SVG_ICONS.pulse} Pista Clínica Principal
                </span>
                ${!st.hintUsed && !st.isSolved && !st.isFailed ? `
                  <button id="btn-hangman-hint" class="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold cursor-pointer">
                    💡 Ver Perla Auxiliar (-10 XP)
                  </button>
                ` : ''}
              </div>
              <p class="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">${st.entry.clue}</p>
              ${st.hintUsed ? `
                <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <strong>Pista Auxiliar:</strong> ${st.entry.extraHint}
                </div>
              ` : ''}
            </div>

            <div class="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 min-h-[76px]">
              ${st.targetWord.split('').map(ch => {
                if (ch === ' ') return `<span class="w-4 sm:w-6 h-10 inline-block"></span>`;
                const revealed = st.guessedLetters.has(ch) || st.isFailed;
                const isMissedLetter = st.isFailed && !st.guessedLetters.has(ch);
                return `
                  <span class="w-8 h-10 sm:w-9 sm:h-11 rounded-xl border font-mono font-black text-base sm:text-lg flex items-center justify-center ${
                    revealed
                      ? (isMissedLetter
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-emerald-500/20 border-emerald-400 text-emerald-300')
                      : 'bg-slate-900 border-slate-700 text-transparent'
                  }">
                    ${revealed ? ch : '_'}
                  </span>
                `;
              }).join('')}
            </div>

            ${st.isSolved || st.isFailed ? `
              <div class="p-4 rounded-2xl border ${st.isSolved ? 'bg-emerald-950/35 border-emerald-500/50' : 'bg-rose-950/35 border-rose-500/50'} space-y-3">
                <div class="flex items-center justify-between">
                  <div class="font-display font-black text-sm sm:text-base ${st.isSolved ? 'text-emerald-400' : 'text-rose-400'}">
                    ${st.isSolved ? '¡Diagnóstico / Fármaco Salvado con Éxito! (+60 XP)' : `¡Paro Clínico! El término era: ${st.targetWord}`}
                  </div>
                  <button id="btn-hangman-next-case" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs cursor-pointer">
                    Siguiente Caso →
                  </button>
                </div>
                <div class="text-xs text-slate-200 leading-relaxed bg-slate-950/75 p-3 rounded-xl border border-slate-800">
                  <strong class="text-amber-300 uppercase font-mono text-[10px] block mb-0.5">Perla Oficial CACES:</strong>
                  ${st.entry.pearl}
                </div>
              </div>
            ` : `
              <div class="flex flex-wrap justify-center gap-1.5 pt-1">
                ${alphabet.map(letter => {
                  const used = st.guessedLetters.has(letter);
                  const inWord = st.targetWord.includes(letter);
                  let btnClass = 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-sky-400 cursor-pointer';
                  if (used) {
                    btnClass = inWord
                      ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-300 opacity-80 cursor-not-allowed'
                      : 'bg-rose-950/40 border-rose-800/50 text-rose-500/50 opacity-45 cursor-not-allowed';
                  }
                  return `
                    <button class="hangman-key-btn w-8 h-9 sm:w-9 sm:h-10 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-all ${btnClass}" data-letter="${letter}" ${used ? 'disabled' : ''}>
                      ${letter}
                    </button>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-hangman-new')?.addEventListener('click', () => {
      this.playTone('click');
      this.startHangmanGame();
    });
    document.getElementById('btn-hangman-next-case')?.addEventListener('click', () => {
      this.playTone('click');
      this.startHangmanGame();
    });
    document.getElementById('btn-hangman-hint')?.addEventListener('click', () => {
      if (!this.hangmanState || this.hangmanState.hintUsed) return;
      this.hangmanState.hintUsed = true;
      this.xp = Math.max(0, this.xp - 10);
      this.updateHUD();
      this.playTone('beep');
      this.renderHangmanUI();
    });

    stage.querySelectorAll('.hangman-key-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const letter = btn.dataset.letter;
        if (letter) this.handleHangmanLetter(letter);
      });
    });
  }

  handleHangmanLetter(letter) {
    const st = this.hangmanState;
    if (!st || st.isSolved || st.isFailed || st.guessedLetters.has(letter)) return;

    st.guessedLetters.add(letter);

    if (st.targetWord.includes(letter)) {
      this.playTone('correct');
      const allRevealed = st.targetWord.split('').every(ch => ch === ' ' || st.guessedLetters.has(ch));
      if (allRevealed) {
        st.isSolved = true;
        this.playTone('victory_fanfare');
        this.addXP(60, true, true);
        const arcStats = Storage.getArcadeStats();
        Storage.saveArcadeStats({
          hangmanWordsSolved: (arcStats.hangmanWordsSolved || 0) + 1,
          hangmanBestStreak: (arcStats.hangmanBestStreak || 0) + 1
        });
        if (window.confetti) {
          window.confetti({ particleCount: 75, spread: 65, origin: { y: 0.65 } });
        }
      }
    } else {
      st.mistakes += 1;
      this.playTone('wrong');
      if (st.mistakes >= st.maxMistakes) {
        st.isFailed = true;
        this.playTone('flatline');
        this.addXP(5, false, false);
      }
    }

    this.renderHangmanUI();
  }

  // =========================================================================
  // RANKING TOP ARCADE EN VIVO (CUENTAS Y FOTOS REALES DE GOOGLE / SUPABASE)
  // =========================================================================
  async renderArcadeLeaderboard() {
    const container = document.getElementById('arcade-leaderboard-list');
    if (!container) return;

    const arcStats = Storage.getArcadeStats();
    const myBestBridge = Math.max(arcStats.bridgeBestStreak || 0, arcStats.bridgeBestStep || 0);
    const myProfile = Storage.getUserProfile ? Storage.getUserProfile() : null;

    let remotePlayers = [];
    if (typeof Storage.fetchLiveArcadeLeaderboard === 'function') {
      try {
        remotePlayers = await Storage.fetchLiveArcadeLeaderboard(15);
      } catch (e) {
        remotePlayers = [];
      }
    } else if (typeof Storage.getGlobalLeaderboard === 'function') {
      try {
        remotePlayers = await Storage.getGlobalLeaderboard();
      } catch (e) {
        remotePlayers = [];
      }
    }

    const mergedMap = new Map();
    if (Array.isArray(remotePlayers)) {
      for (const p of remotePlayers) {
        if (!p) continue;
        const pid = p.id || p.email || p.name;
        if (!pid) continue;
        mergedMap.set(pid, {
          id: pid,
          name: p.name || 'Médico CACES',
          avatar: p.avatar || '',
          xp: Number(p.xp || 0),
          streak: Number(p.bridgeBestStreak || p.streak || 0),
          isMe: Boolean(myProfile && (myProfile.id === pid || myProfile.email === pid))
        });
      }
    }

    const myId = (myProfile && (myProfile.id || myProfile.email)) ? (myProfile.id || myProfile.email) : 'local-me';
    const existingMe = mergedMap.get(myId);
    mergedMap.set(myId, {
      id: myId,
      name: (myProfile && myProfile.name) ? myProfile.name : 'Tú (Sesión Actual)',
      avatar: (myProfile && myProfile.avatar) ? myProfile.avatar : '',
      xp: Math.max(this.xp, existingMe ? existingMe.xp : 0),
      streak: Math.max(myBestBridge, this.streak, existingMe ? existingMe.streak : 0),
      isMe: true
    });

    const list = Array.from(mergedMap.values());
    list.sort((a, b) => b.streak - a.streak || b.xp - a.xp);

    container.innerHTML = list.slice(0, 8).map((item, idx) => {
      const rankInfo = this.getRankInfo(item.xp);
      const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));
      const avatarHtml = item.avatar
        ? `<img src="${item.avatar}" alt="${item.name}" class="w-8 h-8 rounded-full object-cover border border-emerald-500/50 shrink-0" referrerpolicy="no-referrer" />`
        : `<div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-emerald-400 shrink-0">${(item.name || 'M')[0].toUpperCase()}</div>`;

      return `
        <div class="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
          item.isMe
            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm'
            : 'bg-slate-900/60 border-slate-800/80'
        }">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-6 text-center font-mono text-xs font-extrabold ${idx < 3 ? 'text-amber-400' : 'text-slate-500'} shrink-0">${medal}</span>
            ${avatarHtml}
            <div class="min-w-0">
              <p class="text-xs font-bold text-white truncate">
                ${item.name} ${item.isMe ? '<span class="text-[10px] text-emerald-400 font-mono">(Tú)</span>' : ''}
              </p>
              <p class="text-[10px] text-slate-400 truncate">${rankInfo.title}</p>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs font-extrabold text-amber-400">
              🔥 ${item.streak} vidrios
            </span>
          </div>
        </div>
      `;
    }).join('');
  }
}
