/**
 * MOTOR ARCADE EHEP 3D - EL HPTA CACES (VERSIÓN v18: MOTOR 3D REALISTA + CÁMARA LIBRE 360° + SOMBRAS DIRECCIONALES + GUARDIANES + ROSTROS)
 * Incluye 2 Juegos Oficiales de Alto Rendimiento:
 *   1. El Puente de Cristal CACES (#456, #058, #100):
 *      - Lente Gran Angular POV + Cámara Interactiva 360° (arrastra con el dedo/mouse o usa el botón
 *        "👀 Mirar Atrás" para voltear 180° y ver a los jugadores #058 y #100 detrás de ti, mirar arriba
 *        al techo/luces o abajo al abismo).
 *      - Salto POV con aterrizaje exacto sobre el peldaño elegido (mirando tus pies sobre el vidrio
 *        con espesor 3D y abrazaderas metálicas, y levantando luego la vista al frente).
 *      - Plataforma de Salida real al inicio del Peldaño 1 (con franja de peligro amarilla/negra y pórtico)
 *        y Plataforma de Meta al final con los 3 Guardianes Rosas 3D (○ △ □) armados y arco neón.
 *      - Entorno 3D completo: Techo abovedado con vigas de acero, lámparas colgantes y reflectores
 *        volumétricos, cortinajes del coliseo y abismo profundo con pilares estructurales y niebla.
 *      - Sombras direccionales en tiempo real proyectadas geométricamente (ray-plane intersection)
 *        desde los reflectores superiores sobre la plataforma y los cristales (cero elipses falsas).
 *      - Jugadores 3D realistas con rostro detallado (ojos con iris/pupilas y parpadeo, cejas, nariz,
 *        boca animada cuando hablan, cabello, uniforme con cierre y pliegues, y manos con 5 dedos).
 *      - Diálogos máximo 1 vez por peldaño (ULEAM "todo D de Diosito", rural, primer semestre,
 *        tirar la canica, comodín 50/50, y monólogo POV en la última vida).
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
    this.isSpeakingNow = false;
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

  getBridgeCurrentBPM() {
    const st = this.bridgeState;
    if (!st) return 74;
    const stepFactor = (st.currentStep || 0) * 5;
    const livesLostFactor = Math.max(0, 3 - (st.lives || 3)) * 15;
    const jumpingBoost = st.isAnimatingJump ? 14 : 0;
    return Math.min(152, Math.max(72, 72 + stepFactor + livesLostFactor + jumpingBoost));
  }

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

          const maxGain = idx === 0 ? 0.042 : 0.022;
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
      pluckGain.gain.linearRampToValueAtTime(0.044, now + 0.015);
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
      this.isSpeakingNow = false;
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
    this.isSpeakingNow = false;
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
        badge: '○ △ □ • POV 3D REALISTA 360°',
        badgeClass: 'bg-rose-500/15 text-rose-500 border border-rose-500/30',
        activeBorder: 'border-2 border-rose-500 ring-2 ring-rose-500/20',
        imgSrc: 'assets/juego-puente-cristal.png',
        imgWrapClass: 'bg-slate-950 border border-rose-500/30',
        imgClass: 'w-full h-full object-cover',
        title: '1. El Puente de Cristal (#456)',
        shortTitle: 'Puente de Cristal',
        desc: 'Cámara POV 360° con techo, abismo, guardianes ○△□, sombras reales y rostros 3D.',
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
  // JUEGO 1: EL PUENTE DE CRISTAL 3D (REALISTA + CÁMARA 360° + SOMBRAS DIRECCIONALES + GUARDIANES)
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
      spokenSteps: new Set(),
      isGameOver: false,
      isVictory: false,
      isFullscreenOpen: true,
      powerups: {
        glassmakerEye: carryOver ? Math.min(3, (carryOver.powerups?.glassmakerEye || 0) + 1) : 2,
        marbleHint: carryOver ? Math.min(3, (carryOver.powerups?.marbleHint || 0) + 1) : 2,
        temperedShield: carryOver ? Math.max(1, carryOver.powerups?.temperedShield || 0) : 1
      },
      anim: {
        camMode: 'INTRO_SQUAD',
        introStartTime: now,
        introDuration: 2250,

        // Posición 3D de la cámara con soporte de rotación libre de 360° (Yaw + Pitch)
        // Al empezar en Peldaño 1, el jugador #456 está parado en la Plataforma de Salida (row = -1.18)
        // detrás de la franja de peligro amarilla/negra para que se vea claramente que está por iniciar el puente.
        cameraRow: -2.85,
        cameraLane: 1.5,
        cameraY: 1.62,
        cameraPitch: 0.12,
        cameraYaw: 0,
        cameraRoll: 0,

        // Rotación libre controlada por el usuario (arrastrando la pantalla o con el botón Mirar Atrás)
        userYaw: 0,
        targetUserYaw: 0,
        userPitch: 0,
        targetUserPitch: 0,
        isDraggingLook: false,
        dragMoved: false,
        dragStartX: 0,
        dragStartY: 0,
        dragBaseYaw: 0,
        dragBasePitch: 0,

        // Posición lógica del jugador activo en POV
        playerNumber: leadNum,
        playerRow: -1.18,
        playerLane: 1.5,

        // Interpolación de salto en POV
        jumpStartTime: 0,
        jumpDuration: 600,
        jumpStartRow: -1.18,
        jumpStartLane: 1.5,
        jumpTargetRow: 0,
        jumpTargetLane: 1.5,
        jumpWillBreak: false,
        jumpChosenId: null,

        phaseStartTime: now,
        phaseDuration: 2250,

        cracks: [],
        sparks: [],
        shards: [],
        shockwaves: [],
        marbleAnim: null,
        dustMotes: Array.from({ length: 34 }, () => ({
          x: (Math.random() - 0.5) * 9,
          y: -4.0 + Math.random() * 8.5,
          z: -2 + Math.random() * 16,
          r: 0.9 + Math.random() * 1.9,
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
    this.scheduleSingleStepDialogue(2450);
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
   * Alterna entre mirar hacia atrás (180° para ver a #058 y #100 con sus caras 3D) y mirar hacia adelante (0°)
   */
  toggleLookBehindCamera() {
    const st = this.bridgeState;
    if (!st || !st.anim) return;
    const anim = st.anim;
    if (anim.camMode === 'INTRO_SQUAD') {
      anim.camMode = 'POV_READY';
    }
    const isLookingBack = Math.abs(anim.targetUserYaw) > 1.5;
    if (isLookingBack) {
      anim.targetUserYaw = 0;
      anim.targetUserPitch = 0;
    } else {
      anim.targetUserYaw = Math.PI;
      anim.targetUserPitch = 0.06;
    }
    this.playTone('click');
    this.updateLookBehindButtonUI();
  }

  updateLookBehindButtonUI() {
    const btn = document.getElementById('btn-bridge-look-behind');
    const st = this.bridgeState;
    if (!btn || !st || !st.anim) return;
    const isLookingBack = Math.abs(st.anim.targetUserYaw) > 1.5;
    if (isLookingBack) {
      btn.className = 'pointer-events-auto px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 border border-emerald-300 font-mono text-[10px] sm:text-xs font-black shadow-lg cursor-pointer active:scale-95 flex items-center gap-1';
      btn.innerHTML = '<span>🎯 Mirar al Frente</span>';
    } else {
      btn.className = 'pointer-events-auto px-2.5 py-1 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-amber-300 border border-amber-400/60 font-mono text-[10px] sm:text-xs font-extrabold shadow-lg cursor-pointer active:scale-95 flex items-center gap-1';
      btn.innerHTML = st.lives > 1 ? '<span>👀 Voltear a ver Atrás (#058/#100)</span>' : '<span>👀 Voltear Cámara (180°)</span>';
    }
  }

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

  speakBackPlayerLine(speakerNum, text, isInnerPOV = false) {
    if (!this.sfxEnabled || !text) return;
    this.isSpeakingNow = true;

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
        utter.onend = () => { this.isSpeakingNow = false; };
        utter.onerror = () => { this.isSpeakingNow = false; };
        window.speechSynthesis.speak(utter);
        setTimeout(() => { this.isSpeakingNow = false; }, 4200);
      } else {
        setTimeout(() => { this.isSpeakingNow = false; }, 3200);
      }
    } catch (e) {
      this.isSpeakingNow = false;
    }
  }

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
      <!-- MITAD SUPERIOR: VISOR 3D REALISTA GRAN ANGULAR CON CÁMARA LIBRE 360° -->
      <div id="bridge-3d-canvas-wrap" class="relative w-full h-[40dvh] min-h-[205px] max-h-[410px] sm:h-[45dvh] shrink-0 overflow-hidden bg-[#06020c] touch-none">
        <canvas id="squid-bridge-canvas" class="w-full h-full block cursor-grab active:cursor-grabbing" width="880" height="460"></canvas>

        <!-- Barra Superior dentro del Visor 3D -->
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
            <span id="bridge-3d-bpm-pill" class="px-2.5 py-1 rounded-full bg-slate-950/90 border border-rose-500/55 text-rose-300 font-mono text-[10px] sm:text-xs font-black backdrop-blur-md shadow-md inline-flex items-center gap-1">
              <span id="bridge-3d-bpm-heart" class="inline-block text-rose-500 transition-transform duration-150">❤️</span>
              <span class="bpm-val">72 BPM</span>
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

        <!-- Barra Inferior del Visor 3D: Estado POV + Botón para Voltear 180° a ver a los Jugadores de Atrás -->
        <div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none z-10">
          <span id="bridge-pov-camera-badge" class="px-2.5 py-1 rounded-xl bg-slate-950/88 border border-cyan-500/45 text-cyan-300 font-mono text-[9px] sm:text-[10px] font-bold backdrop-blur-sm shadow truncate">
            🖐️ Arrastra para mirar 360° (Techo, Abismo, Guardianes y Atrás)
          </span>
          <button type="button" id="btn-bridge-look-behind" class="pointer-events-auto px-2.5 py-1 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-amber-300 border border-amber-400/60 font-mono text-[10px] sm:text-xs font-extrabold shadow-lg cursor-pointer active:scale-95 flex items-center gap-1 shrink-0">
            <span>👀 Voltear a ver Atrás (#058/#100)</span>
          </button>
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

    portal.querySelector('#btn-bridge-look-behind')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleLookBehindCamera();
    });

    this.bindBridgeCanvasEvents();
    this.updateGlassBridgeDOM();
  }

  /**
   * Vincula el control interactivo 360° (arrastrar con el dedo o con el mouse sobre el visor 3D)
   * para mirar el techo, las luces, el abismo, los guardianes en la meta o voltear 180° a ver a los jugadores de atrás.
   */
  bindBridgeCanvasEvents() {
    const canvas = document.getElementById('squid-bridge-canvas');
    if (!canvas) return;

    const getCanvasPos = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const touch = evt.touches?.[0] || evt.changedTouches?.[0];
      const clientX = touch ? touch.clientX : evt.clientX;
      const clientY = touch ? touch.clientY : evt.clientY;
      return {
        clientX,
        clientY,
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

    const startDrag = (evt) => {
      if (!this.bridgeState) return;
      const st = this.bridgeState;
      if (st.anim.camMode === 'INTRO_SQUAD') {
        st.anim.camMode = 'POV_READY';
        st.anim.cameraRow = st.anim.playerRow;
        st.anim.cameraLane = st.anim.playerLane;
        st.anim.cameraY = 1.24;
        st.anim.cameraPitch = 0.16;
      }
      const pos = getCanvasPos(evt);
      st.anim.isDraggingLook = true;
      st.anim.dragMoved = false;
      st.anim.dragStartX = pos.clientX;
      st.anim.dragStartY = pos.clientY;
      st.anim.dragBaseYaw = st.anim.targetUserYaw;
      st.anim.dragBasePitch = st.anim.targetUserPitch;
    };

    const moveDrag = (evt) => {
      if (!this.bridgeState) return;
      const st = this.bridgeState;
      const pos = getCanvasPos(evt);

      if (st.anim.isDraggingLook) {
        const dx = pos.clientX - st.anim.dragStartX;
        const dy = pos.clientY - st.anim.dragStartY;
        if (Math.hypot(dx, dy) > 6) {
          st.anim.dragMoved = true;
        }
        // Rotación libre de 360° en horizontal (Yaw) y de -50° a +55° en vertical (Pitch)
        st.anim.targetUserYaw = st.anim.dragBaseYaw - dx * 0.0085;
        st.anim.targetUserPitch = Math.max(-0.78, Math.min(0.82, st.anim.dragBasePitch + dy * 0.0065));
        this.updateLookBehindButtonUI();
        return;
      }

      let foundLane = -1;
      const regions = st.anim.tileHitRegions || [];
      for (const reg of regions) {
        if (pointInPoly(pos.x, pos.y, reg.poly)) {
          foundLane = reg.lane;
          break;
        }
      }
      st.anim.hoveredLane = foundLane;
    };

    const endDrag = (evt) => {
      if (!this.bridgeState) return;
      const st = this.bridgeState;
      const wasMoved = st.anim.dragMoved;
      st.anim.isDraggingLook = false;

      if (wasMoved) return;

      if (st.awaitingNextStep && !st.isAnimatingJump && !st.isGameOver && !st.isVictory) {
        this.advanceBridgeStep();
        return;
      }
      if (st.isAnimatingJump || st.awaitingNextStep || st.isGameOver || st.isVictory) return;

      const pos = getCanvasPos(evt);
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
    };

    canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    canvas.addEventListener('touchstart', startDrag, { passive: true });
    canvas.addEventListener('touchmove', moveDrag, { passive: true });
    canvas.addEventListener('touchend', endDrag, { passive: true });
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
      this.spawnGlassShards3D(st.currentStep, lIdx, 36);
    });
    st.anim.screenShake = 10;
    st.powerups.glassmakerEye -= 1;
    this.playTone('glass_shatter');
    this.updateGlassBridgeDOM();
  }

  triggerMarbleHintPowerup() {
    const st = this.bridgeState;
    if (!st || st.powerups.marbleHint <= 0 || st.hintRevealedInCurrentStep || st.awaitingNextStep || st.isAnimatingJump) return;
    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const safeLane = this.laneIndexForOption(q.correcta);
    st.hintRevealedInCurrentStep = true;
    st.powerups.marbleHint -= 1;
    st.anim.marbleAnim = {
      startTime: performance.now(),
      duration: 680,
      startRow: st.anim.playerRow,
      startLane: st.anim.playerLane,
      targetRow: st.currentStep,
      targetLane: safeLane
    };
    this.playTone('glass_step');
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
    const bpmPill = document.getElementById('bridge-3d-bpm-pill');
    if (bpmPill) {
      const bpmVal = bpmPill.querySelector('.bpm-val');
      if (bpmVal) bpmVal.textContent = `${this.getBridgeCurrentBPM()} BPM`;
    }
    this.renderBackPlayerChatterBanner();
    this.updateLookBehindButtonUI();

    if (hearts3DWrap) {
      hearts3DWrap.innerHTML = this.renderLivesHearts(st.lives, 3);
    }
    if (squad3DWrap) {
      squad3DWrap.innerHTML = this.renderSquadPlayersHUD(st.lives);
    }
    if (povBadge) {
      const mode = st.anim.camMode;
      if (mode === 'INTRO_SQUAD') {
        povBadge.className = 'px-2.5 py-1 rounded-xl bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 font-mono text-[9px] sm:text-[10px] font-black backdrop-blur-sm shadow truncate';
        povBadge.textContent = '🎬 PLATAFORMA DE SALIDA: #456 • #058 • #100';
      } else if (mode === 'POV_JUMPING') {
        povBadge.className = 'px-2.5 py-1 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono text-[9px] sm:text-[10px] font-black backdrop-blur-sm shadow truncate';
        povBadge.textContent = `👁️ POV #${st.anim.playerNumber} • CAYENDO EN EL PELDAÑO Y MIRANDO A LOS PIES...`;
      } else if (mode === 'POV_FLOOR_CHECK_SAFE') {
        povBadge.className = 'px-2.5 py-1 rounded-xl bg-emerald-950/95 border border-emerald-400 text-emerald-200 font-mono text-[9px] sm:text-[10px] font-black backdrop-blur-sm shadow truncate';
        povBadge.textContent = `✓ POV #${st.anim.playerNumber} • ¡VIDRIO TEMPLADO BAJO TUS PIES! MIRANDO AL FRENTE...`;
      } else if (mode === 'POV_FLOOR_CRACK') {
        povBadge.className = 'px-2.5 py-1 rounded-xl bg-rose-950/95 border border-rose-400 text-rose-200 font-mono text-[9px] sm:text-[10px] font-black backdrop-blur-sm shadow truncate';
        povBadge.textContent = `⚠️ POV #${st.anim.playerNumber} • ¡EL CRISTAL BAJO TUS ZAPATILLAS SE ROMPE!`;
      } else if (mode === 'POV_FALLING') {
        povBadge.className = 'px-2.5 py-1 rounded-xl bg-rose-600/95 border border-rose-200 text-white font-mono text-[9px] sm:text-[10px] font-black animate-bounce shadow-lg truncate';
        povBadge.textContent = `✕ ¡CAÍDA AL ABISMO DE #${st.lastFallenPlayerNum || st.anim.playerNumber}!`;
      } else if (mode === 'RELAY_REVEAL_BEHIND') {
        povBadge.className = 'px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono text-[9px] sm:text-[10px] font-black shadow-lg truncate';
        povBadge.textContent = `🎬 RELEVO: EL JUGADOR DE ATRÁS (#${st.anim.playerNumber}) AVANZA → ENTRANDO A SU POV`;
      } else if (mode === 'POV_RELAY_JUMP') {
        povBadge.className = 'px-2.5 py-1 rounded-xl bg-emerald-400 text-slate-950 font-mono text-[9px] sm:text-[10px] font-black shadow-lg truncate';
        povBadge.textContent = `👁️ POV #${st.anim.playerNumber} • SALTANDO AL VIDRIO TEMPLADO SEGURO`;
      } else {
        povBadge.className = 'px-2.5 py-1 rounded-xl bg-slate-950/88 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] sm:text-[10px] font-bold backdrop-blur-sm shadow truncate';
        povBadge.textContent = `👁️ POV #${st.anim.playerNumber} • Arrastra el visor 3D para mirar alrededor o atrás`;
      }
    }

    if (canvasWrap) {
      if (st.awaitingNextStep) {
        canvasWrap.className = 'relative w-full h-[32dvh] min-h-[175px] max-h-[300px] sm:h-[36dvh] shrink-0 overflow-hidden bg-[#06020c] transition-all duration-200 touch-none';
      } else {
        canvasWrap.className = 'relative w-full h-[40dvh] min-h-[205px] max-h-[410px] sm:h-[45dvh] shrink-0 overflow-hidden bg-[#06020c] transition-all duration-200 touch-none';
      }
    }

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
                ${st.isVictory ? `★ PUENTE NIVEL ${st.bridgeLevel} COMPLETADO` : '✕ LOS 3 JUGADORES CAYERON AL ABISMO'}
              </span>
              <h3 class="font-display font-black text-2xl sm:text-3xl text-white">
                ${st.isVictory ? '¡Llegaste a la Meta con los Guardianes!' : '¡Fin de la Partida en el Puente!'}
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
                      : `¡#${st.lastFallenPlayerNum} cayó al abismo! Jugador de atrás (#${st.anim.playerNumber}) tomó el relevo en el vidrio ${q.correcta}`}
                  </h4>
                </div>
              </div>
              <button type="button" id="btn-bridge-next-step" class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer shrink-0">
                ${isLastStep ? '🏆 Cruzar a la Meta con los Guardianes →' : 'Siguiente Peldaño →'}
              </button>
            </div>

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

    const can5050 = st.powerups.glassmakerEye > 0 && st.brokenOptionsInCurrentStep.size < 2 && !st.isAnimatingJump;
    const canMarble = st.powerups.marbleHint > 0 && !st.hintRevealedInCurrentStep && !st.isAnimatingJump;
    const canShield = st.powerups.temperedShield > 0 && !st.shieldActiveInCurrentStep && !st.isAnimatingJump;

    bottomOverlay.innerHTML = `
      <div class="space-y-2 my-auto">
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
              }" title="Tirar la canica para probar el cristal">
                <span>🔮 Tirar Canica (${st.powerups.marbleHint})</span>
              </button>

              <button type="button" id="btn-power-shield" ${canShield ? '' : 'disabled'} class="px-2.5 py-1 rounded-lg border font-mono text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                st.shieldActiveInCurrentStep
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black'
                  : canShield
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/35 border-emerald-400/60 text-emerald-200 cursor-pointer active:scale-95'
                  : 'bg-slate-900 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
              }" title="Escudo Templado">
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
              <span><b>Sonido de la Canica:</b> El cristal templado resuena firme con: <em>${this.formatMd(q.perla_caces.slice(0, 135))}...</em></span>
            </div>
          ` : ''}
        </div>

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

    // Al saltar, centrar la vista hacia adelante automáticamente
    st.anim.targetUserYaw = 0;
    st.anim.targetUserPitch = 0;
    st.anim.activeChatter = null;
    this.renderBackPlayerChatterBanner();

    st.anim.camMode = 'POV_JUMPING';
    st.anim.jumpStartTime = now;
    st.anim.jumpDuration = 600;
    st.anim.jumpStartRow = st.anim.playerRow;
    st.anim.jumpStartLane = st.anim.playerLane;
    st.anim.jumpTargetRow = st.currentStep; // Aterriza EXACTAMENTE en el centro del peldaño elegido
    st.anim.jumpTargetLane = laneIdx;
    st.anim.jumpWillBreak = !isCorrect;
    st.anim.jumpChosenId = chosenOptionId;

    this.playTone('jump');
    this.updateGlassBridgeDOM();
  }

  onPOVJumpLanded() {
    const st = this.bridgeState;
    if (!st) return;

    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const chosenOptionId = st.anim.jumpChosenId || 'A';
    const laneIdx = st.anim.jumpTargetLane;
    const isCorrect = !st.anim.jumpWillBreak;
    const now = performance.now();

    if (isCorrect) {
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
      st.anim.phaseDuration = 940;
      this.updateGlassBridgeDOM();

      setTimeout(() => {
        if (!this.bridgeState || st.isGameOver) return;
        st.anim.camMode = 'POV_READY';
        st.anim.cameraPitch = 0.16;
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
      }, 940);
    } else {
      if (st.shieldActiveInCurrentStep) {
        this.playTone('glass_shatter');
        st.tiles[st.currentStep][laneIdx] = 'broken';
        st.brokenOptionsInCurrentStep.add(chosenOptionId);
        this.spawnGlassShards3D(st.currentStep, laneIdx, 42);
        st.shieldActiveInCurrentStep = false;
        st.anim.playerRow = st.anim.jumpStartRow;
        st.anim.playerLane = st.anim.jumpStartLane;
        st.anim.cameraRow = st.anim.playerRow;
        st.anim.cameraLane = st.anim.playerLane;
        st.anim.cameraY = 1.24;
        st.anim.cameraPitch = 0.16;
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

      st.anim.camMode = 'POV_FLOOR_CRACK';
      st.anim.phaseStartTime = now;
      st.anim.phaseDuration = 480;
      this.updateGlassBridgeDOM();

      setTimeout(() => {
        if (!this.bridgeState) return;
        const shatterNow = performance.now();
        this.playTone('glass_shatter');
        st.tiles[st.currentStep][laneIdx] = 'broken';
        st.brokenOptionsInCurrentStep.add(chosenOptionId);
        this.spawnGlassShards3D(st.currentStep, laneIdx, 64);
        st.anim.screenShake = 15;

        st.lastFallenPlayerNum = st.anim.playerNumber;
        st.lives -= 1;
        st.streak = 0;
        st.lastJumpOutcome = 'wrong';

        const safeLane = this.laneIndexForOption(q.correcta);
        st.tiles[st.currentStep][safeLane] = 'safe';
        st.safeLaneHistory[st.currentStep] = safeLane;

        st.anim.camMode = 'POV_FALLING';
        st.anim.phaseStartTime = shatterNow;
        st.anim.phaseDuration = 980;
        this.updateGlassBridgeDOM();

        setTimeout(() => {
          if (!this.bridgeState) return;

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

          const nextSquad = this.getSquadOrderForLives(st.lives);
          const nextLeadNum = nextSquad[0] || (st.lives === 2 ? '058' : '100');
          const prevRow = st.currentStep > 0 ? (st.currentStep - 1) : -1.18;
          const prevLane = st.currentStep > 0 && st.safeLaneHistory[st.currentStep - 1] !== undefined
            ? st.safeLaneHistory[st.currentStep - 1]
            : 1.5;

          st.anim.playerNumber = nextLeadNum;
          st.anim.playerRow = prevRow;
          st.anim.playerLane = prevLane;
          st.anim.camMode = 'RELAY_REVEAL_BEHIND';
          st.anim.phaseStartTime = performance.now();
          st.anim.phaseDuration = 1450;
          this.playTone('popup_open');
          this.triggerBackPlayerTaunt('fell');
          this.updateGlassBridgeDOM();

          setTimeout(() => {
            if (!this.bridgeState || st.isGameOver) return;
            const relayNow = performance.now();
            this.playTone('jump');
            st.anim.camMode = 'POV_RELAY_JUMP';
            st.anim.jumpStartTime = relayNow;
            st.anim.jumpDuration = 600;
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
              st.anim.phaseDuration = 900;
              this.updateGlassBridgeDOM();

              setTimeout(() => {
                if (!this.bridgeState || st.isGameOver) return;
                st.anim.camMode = 'POV_READY';
                st.anim.cameraPitch = 0.16;
                st.isAnimatingJump = false;
                st.awaitingNextStep = true;
                this.updateGlassBridgeDOM();
              }, 900);
            }, 600);
          }, 1450);
        }, 980);
      }, 480);
    }
  }

  advanceBridgeStep() {
    const st = this.bridgeState;
    if (!st || st.isAnimatingJump) return;

    if (st.currentStep + 1 >= st.totalSteps) {
      const now = performance.now();
      st.isAnimatingJump = true;
      st.anim.targetUserYaw = 0;
      st.anim.targetUserPitch = 0;
      st.anim.camMode = 'POV_RELAY_JUMP';
      st.anim.jumpStartTime = now;
      st.anim.jumpDuration = 620;
      st.anim.jumpStartRow = st.anim.playerRow;
      st.anim.jumpStartLane = st.anim.playerLane;
      st.anim.jumpTargetRow = st.totalSteps + 0.45;
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
      }, 640);
      return;
    }

    st.currentStep += 1;
    st.brokenOptionsInCurrentStep = new Set();
    st.hintRevealedInCurrentStep = false;
    st.shieldActiveInCurrentStep = false;
    st.awaitingNextStep = false;
    st.lastJumpOutcome = null;
    st.lastChosenOptionId = null;
    st.anim.targetUserYaw = 0;
    st.anim.targetUserPitch = 0;
    st.anim.camMode = 'POV_READY';
    st.anim.cameraPitch = 0.16;
    this.playTone('beep');
    this.updateGlassBridgeDOM();

    this.scheduleSingleStepDialogue(850);
  }

  spawnGlassShards3D(row, lane, count = 56) {
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
        vy: 0.018 - Math.random() * 0.062,
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
  // MOTOR DE FÍSICAS, PROYECCIÓN 360° Y SOMBRAS DIRECCIONALES EN TIEMPO REAL
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

    // Suavizado de la rotación libre 360° del usuario (Yaw + Pitch)
    anim.userYaw += (anim.targetUserYaw - anim.userYaw) * 0.18;
    anim.userPitch += (anim.targetUserPitch - anim.userPitch) * 0.18;

    // 1. PLANO INICIAL ('INTRO_SQUAD') mostrando la Plataforma de Salida con #456, #058 y #100
    if (anim.camMode === 'INTRO_SQUAD') {
      const elapsed = Math.max(0, now - anim.introStartTime);
      const t = Math.min(1, elapsed / anim.introDuration);
      if (t < 0.62) {
        anim.cameraRow = -3.15 + (t / 0.62) * 0.35;
        anim.cameraLane = 1.5 + Math.sin(t * Math.PI) * 0.25;
        anim.cameraY = 1.72;
        anim.cameraPitch = 0.14;
        anim.cameraYaw = 0;
      } else {
        const zt = (t - 0.62) / 0.38;
        const ease = zt < 0.5 ? 2 * zt * zt : 1 - Math.pow(-2 * zt + 2, 2) / 2;
        anim.cameraRow = -2.80 + (anim.playerRow - (-2.80)) * ease;
        anim.cameraLane = 1.5;
        anim.cameraY = 1.72 + (1.24 - 1.72) * ease;
        anim.cameraPitch = 0.14 + (0.16 - 0.14) * ease;
        anim.cameraYaw = 0;
      }
      if (t >= 1) {
        anim.camMode = 'POV_READY';
        anim.cameraRow = anim.playerRow;
        anim.cameraLane = anim.playerLane;
        anim.cameraY = 1.24;
        anim.cameraPitch = 0.16;
        anim.cameraYaw = 0;
        this.updateGlassBridgeDOM();
      }
    }

    // 2. MODO POV LISTO PARA SALTAR ('POV_READY') + CÁMARA LIBRE 360°
    else if (anim.camMode === 'POV_READY') {
      anim.cameraRow += (anim.playerRow - anim.cameraRow) * 0.18;
      anim.cameraLane += (anim.playerLane - anim.cameraLane) * 0.18;
      anim.cameraY = 1.24 + Math.sin(now * 0.0035) * 0.015;
      anim.cameraPitch = 0.16 + anim.userPitch;
      anim.cameraYaw = anim.userYaw;
      anim.cameraRoll *= 0.8;
    }

    // 3. SALTO EN PRIMERA PERSONA CAYENDO EXACTAMENTE EN EL PELDAÑO Y MIRANDO A LOS PIES ('POV_JUMPING' / 'POV_RELAY_JUMP')
    else if (anim.camMode === 'POV_JUMPING' || anim.camMode === 'POV_RELAY_JUMP') {
      const elapsed = Math.max(0, now - anim.jumpStartTime);
      const t = Math.min(1, elapsed / anim.jumpDuration);
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      anim.playerRow = anim.jumpStartRow + (anim.jumpTargetRow - anim.jumpStartRow) * easeT;
      anim.playerLane = anim.jumpStartLane + (anim.jumpTargetLane - anim.jumpStartLane) * easeT;
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraY = 1.24 + Math.sin(t * Math.PI) * 1.02;
      anim.cameraYaw = 0;

      if (t < 0.28) {
        anim.cameraPitch = 0.16 + (t / 0.28) * 0.18;
      } else {
        const lookDownT = (t - 0.28) / 0.72;
        const smoothDown = lookDownT < 0.5 ? 2 * lookDownT * lookDownT : 1 - Math.pow(-2 * lookDownT + 2, 2) / 2;
        anim.cameraPitch = 0.34 + smoothDown * 0.72; // 1.06 rad (~61° mirando directo a tus pies sobre el vidrio)
      }

      if (t >= 1 && anim.camMode === 'POV_JUMPING') {
        anim.playerRow = anim.jumpTargetRow;
        anim.playerLane = anim.jumpTargetLane;
        anim.cameraRow = anim.playerRow;
        anim.cameraLane = anim.playerLane;
        anim.cameraY = 1.20;
        anim.cameraPitch = 1.06;
        this.onPOVJumpLanded();
      }
    }

    // 4. MIRANDO TUS PIES EN EL VIDRIO TEMPLADO Y LUEGO LEVANTANDO LA VISTA AL FRENTE ('POV_FLOOR_CHECK_SAFE')
    else if (anim.camMode === 'POV_FLOOR_CHECK_SAFE') {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const t = Math.min(1, elapsed / anim.phaseDuration);
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraYaw = 0;
      if (t < 0.48) {
        anim.cameraPitch = 1.06;
        anim.cameraY = 1.20;
      } else {
        const upT = (t - 0.48) / 0.52;
        const easeUp = upT < 0.5 ? 2 * upT * upT : 1 - Math.pow(-2 * upT + 2, 2) / 2;
        anim.cameraPitch = 1.06 + (0.16 - 1.06) * easeUp;
        anim.cameraY = 1.20 + (1.24 - 1.20) * easeUp;
      }
    }

    // 5. MIRANDO EL CRISTAL AGRIETARSE BAJO TUS ZAPATILLAS ('POV_FLOOR_CRACK')
    else if (anim.camMode === 'POV_FLOOR_CRACK') {
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraPitch = 1.06;
      anim.cameraYaw = 0;
      anim.cameraY = 1.16;
      anim.screenShake = 6;
    }

    // 6. CAÍDA AL ABISMO EN PRIMERA PERSONA ('POV_FALLING')
    else if (anim.camMode === 'POV_FALLING') {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const t = Math.min(1, elapsed / anim.phaseDuration);
      anim.cameraRow = anim.playerRow;
      anim.cameraLane = anim.playerLane;
      anim.cameraY = 1.16 - (t * t) * 7.5;
      anim.cameraPitch = 1.06 - t * 1.38;
      anim.cameraYaw = 0;
      anim.cameraRoll = Math.sin(t * Math.PI * 2.5) * 0.20;
    }

    // 7. TRANSICIÓN CINEMÁTICA AL PERDER UNA VIDA ('RELAY_REVEAL_BEHIND')
    else if (anim.camMode === 'RELAY_REVEAL_BEHIND') {
      const elapsed = Math.max(0, now - anim.phaseStartTime);
      const t = Math.min(1, elapsed / anim.phaseDuration);
      anim.cameraYaw = 0;
      if (t < 0.55) {
        const p1 = t / 0.55;
        const ease1 = 1 - Math.pow(1 - p1, 2);
        anim.cameraRow = (anim.playerRow - 1.48) + ease1 * 0.25;
        anim.cameraLane = anim.playerLane + (1 - ease1) * 0.35;
        anim.cameraY = 1.62 - ease1 * 0.08;
        anim.cameraPitch = 0.20;
      } else {
        const p2 = (t - 0.55) / 0.45;
        const ease2 = p2 < 0.5 ? 2 * p2 * p2 : 1 - Math.pow(-2 * p2 + 2, 2) / 2;
        anim.cameraRow = (anim.playerRow - 1.23) + (anim.playerRow - (anim.playerRow - 1.23)) * ease2;
        anim.cameraLane = anim.playerLane;
        anim.cameraY = 1.54 + (1.24 - 1.54) * ease2;
        anim.cameraPitch = 0.20 + (0.16 - 0.20) * ease2;
      }
    }

    for (let i = anim.shards.length - 1; i >= 0; i--) {
      const s = anim.shards[i];
      s.x += s.vx;
      s.y += s.vy;
      s.z += s.vz;
      s.vy -= 0.0034;
      s.rot += s.vRot;
      s.alpha -= 0.020;
      if (s.alpha <= 0) anim.shards.splice(i, 1);
    }

    for (let i = anim.shockwaves.length - 1; i >= 0; i--) {
      const w = anim.shockwaves[i];
      w.radius += 0.045;
      w.alpha -= 0.032;
      if (w.alpha <= 0) anim.shockwaves.splice(i, 1);
    }
  }

  /**
   * Proyección 3D Gran Angular con Rotación Completa en 3 Ejes (Yaw Horizontal 360° + Pitch Vertical).
   * Permite girar la cabeza para ver el techo, el abismo, los guardianes en la meta y los jugadores de atrás.
   */
  projectBridge3DPoint(worldX, worldY, worldZ, camX, camY, camZ, yaw, pitch, focal, cx, cy) {
    const dx = worldX - camX;
    const dy = camY - worldY; // positivo hacia abajo (suelo en worldY=0, techo en worldY=+5.5, abismo en worldY=-18)
    const dz = worldZ - camZ; // positivo hacia adelante rumbo a la meta

    // 1. Rotación horizontal Yaw (alrededor del eje Y)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const yawX = dx * cosY - dz * sinY;
    const yawZ = dz * cosY + dx * sinY;

    // 2. Rotación vertical Pitch (alrededor del eje X local de la cámara)
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const rotZ = yawZ * cosP + dy * sinP;
    const rotY = dy * cosP - yawZ * sinP;

    const safeDepth = Math.max(0.14, rotZ);
    const scale = focal / safeDepth;

    return {
      x: cx + yawX * scale,
      y: cy + rotY * scale,
      scale,
      depth: rotZ
    };
  }

  /**
   * Proyección geométrica de Sombra Direccional en Tiempo Real (Ray-Plane Intersection)
   * desde el reflector principal `L = (lightX, lightY, lightZ)` sobre el plano `y = floorY`.
   */
  projectDirectionalShadowPoint(wx, wy, wz, floorY, lightX, lightY, lightZ, projFn) {
    const denom = (wy - lightY) || -0.001;
    const t = (floorY - lightY) / denom;
    const sx = lightX + (wx - lightX) * t;
    const sz = lightZ + (wz - lightZ) * t;
    return projFn(sx, floorY + 0.004, sz);
  }

  drawGlassBridge3DScene(canvas, now) {
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.bridgeState) return;
    const st = this.bridgeState;
    const anim = st.anim;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W * 0.5;
    const cy = H * 0.46; // Horizonte centrado para gran angular
    // Lente Gran Angular (~98° FOV) para que se vea amplio todo el coliseo, la plataforma, el techo y la meta
    const focal = Math.min(W, H) * 0.62;

    const camX = (anim.cameraLane - 1.5) * 0.94;
    const camY = anim.cameraY;
    const camZ = anim.cameraRow;
    const yaw = anim.cameraYaw || 0;
    const pitch = anim.cameraPitch || 0.16;

    // Posición en tiempo real del reflector direccional principal del techo (para cálculo de sombras reales)
    const mainLightX = Math.sin(now * 0.0008) * 1.45;
    const mainLightY = 6.2;
    const mainLightZ = camZ + 2.2 + Math.cos(now * 0.0006) * 0.9;

    const proj = (wx, wy, wz) => this.projectBridge3DPoint(wx, wy, wz, camX, camY, camZ, yaw, pitch, focal, cx, cy);

    ctx.save();
    if (anim.screenShake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * anim.screenShake,
        (Math.random() - 0.5) * anim.screenShake
      );
    }

    // 1. FONDO DEL COLISEO Y ABISMO PROFUNDO
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#05020a');
    skyGrad.addColorStop(0.42, '#130724');
    skyGrad.addColorStop(0.75, '#0b0316');
    skyGrad.addColorStop(1, '#020005');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. CORTINAJES DE CIRCO EN LAS PAREDES LATERALES Y PILARES DEL ABISMO
    this.drawColiseumWallsAndAbyss3D(ctx, proj, st, now, W, H);

    // 3. TECHO ABOVEDADO CON VIGAS DE ACERO, ANILLOS DORADOS Y REFLECTORES VOLUMÉTRICOS
    this.drawColiseumCeilingAndLights3D(ctx, proj, st, now, mainLightX, mainLightY, mainLightZ);

    // 4. PLATAFORMA DE SALIDA (CON FRANJA DE PELIGRO AMARILLA/NEGRA Y BARANDALES)
    this.drawStartPlatform3D(ctx, proj, now);

    // 5. PLATAFORMA DE META AL FINAL DEL PUENTE CON ARCO NEÓN Y LOS 3 GUARDIANES ROSAS (○ △ □)
    this.drawFinishPlatformAndGuards3D(ctx, proj, st, now, mainLightX, mainLightY, mainLightZ);

    // 6. VIGAS ESTRUCTURALES DE ACERO ROSA CON CARAS 3D Y PERNOS
    this.drawSteelBridgeRails3D(ctx, proj, st);

    // 7. PELDAÑOS DE CRISTAL 3D (CON ESPESOR FÍSICO DE 6CM, ABRAZADERAS METÁLICAS Y SOMBRAS DIRECCIONALES)
    anim.tileHitRegions = [];
    const letters = ['A', 'B', 'C', 'D'];

    // Ordenar peldaños por distancia a la cámara para pintado correcto tanto mirando al frente como mirando atrás
    const stepIndices = Array.from({ length: st.totalSteps }, (_, i) => i);
    stepIndices.sort((a, b) => Math.abs(b - camZ) - Math.abs(a - camZ));

    for (const r of stepIndices) {
      const zNear = r - 0.36;
      const zFar = r + 0.36;
      const isCurrentTargetStep = (r === st.currentStep) && !st.awaitingNextStep && !st.isGameOver && !st.isVictory;

      for (let lane = 0; lane < 4; lane++) {
        const tileState = st.tiles[r][lane];
        if (tileState === 'broken') continue;

        const xCenter = (lane - 1.5) * 0.94;
        const xLeft = xCenter - 0.41;
        const xRight = xCenter + 0.41;
        const thicknessY = -0.055; // Espesor físico 3D del bloque de cristal templado

        const pTL = proj(xLeft, 0, zFar);
        const pTR = proj(xRight, 0, zFar);
        const pBR = proj(xRight, 0, zNear);
        const pBL = proj(xLeft, 0, zNear);

        if (pTL.depth <= 0.15 && pTR.depth <= 0.15 && pBR.depth <= 0.15 && pBL.depth <= 0.15) continue;

        const bBL = proj(xLeft, thicknessY, zNear);
        const bBR = proj(xRight, thicknessY, zNear);

        const isHovered = isCurrentTargetStep && anim.hoveredLane === lane;
        const isSafe = tileState === 'safe';
        const isCrackingNow = (anim.camMode === 'POV_FLOOR_CRACK') && r === st.currentStep && lane === anim.jumpTargetLane;

        ctx.save();

        // Cara lateral/frontal 3D de espesor del bloque de vidrio
        if (bBL.depth > 0.15 && bBR.depth > 0.15) {
          ctx.fillStyle = isSafe ? 'rgba(6, 95, 70, 0.85)' : 'rgba(30, 58, 138, 0.55)';
          ctx.beginPath();
          ctx.moveTo(pBL.x, pBL.y);
          ctx.lineTo(pBR.x, pBR.y);
          ctx.lineTo(bBR.x, bBR.y);
          ctx.lineTo(bBL.x, bBL.y);
          ctx.closePath();
          ctx.fill();
        }

        // Superficie superior del cristal
        ctx.beginPath();
        ctx.moveTo(pTL.x, pTL.y);
        ctx.lineTo(pTR.x, pTR.y);
        ctx.lineTo(pBR.x, pBR.y);
        ctx.lineTo(pBL.x, pBL.y);
        ctx.closePath();

        if (isCrackingNow) {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.52)';
          ctx.strokeStyle = '#fecdd3';
          ctx.lineWidth = 2.8;
        } else if (isSafe) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.50)';
          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 2.6;
        } else if (isHovered) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.44)';
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 2.6;
        } else if (isCurrentTargetStep) {
          const pulse = 0.5 + 0.5 * Math.sin(now * 0.006);
          ctx.fillStyle = `rgba(56, 189, 248, ${0.19 + pulse * 0.12})`;
          ctx.strokeStyle = `rgba(125, 211, 252, ${0.75 + pulse * 0.22})`;
          ctx.lineWidth = 2.1;
        } else {
          ctx.fillStyle = 'rgba(186, 230, 253, 0.15)';
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.52)';
          ctx.lineWidth = 1.4;
        }
        ctx.fill();
        ctx.stroke();

        // Abrazaderas metálicas de sujeción en las 4 esquinas del vidrio
        ctx.fillStyle = '#cbd5e1';
        [pTL, pTR, pBR, pBL].forEach(corner => {
          const clampSz = Math.max(1.8, Math.min(5, corner.scale * 0.015));
          ctx.fillRect(corner.x - clampSz * 0.5, corner.y - clampSz * 0.5, clampSz, clampSz);
        });

        // Doble línea de reflexión especular del reflector sobre el cristal
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(pTL.x + (pTR.x - pTL.x) * 0.16, pTL.y + (pBL.y - pTL.y) * 0.15);
        ctx.lineTo(pTL.x + (pTR.x - pTL.x) * 0.58, pTL.y + (pBL.y - pTL.y) * 0.85);
        ctx.stroke();

        // Grietas radiales si se está rompiendo bajo tus pies
        if (isCrackingNow) {
          const midX = (pTL.x + pTR.x + pBR.x + pBL.x) * 0.25;
          const midY = (pTL.y + pTR.y + pBR.y + pBL.y) * 0.25;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.2;
          for (let c = 0; c < 10; c++) {
            const ang = (c / 10) * Math.PI * 2 + 0.2;
            ctx.beginPath();
            ctx.moveTo(midX, midY);
            ctx.lineTo(midX + Math.cos(ang) * 36, midY + Math.sin(ang) * 22);
            ctx.stroke();
          }
        }

        if (isCurrentTargetStep || isSafe) {
          const centerPt = proj(xCenter, 0.01, r);
          if (centerPt.depth > 0.2) {
            ctx.fillStyle = isSafe ? '#ecfdf5' : '#e0f2fe';
            ctx.font = `900 ${Math.max(11, Math.min(20, Math.round(centerPt.scale * 0.15)))}px "JetBrains Mono", monospace`;
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

    // 8. ONDAS DE IMPACTO Y CANICA 3D
    for (const w of anim.shockwaves) {
      const wx = (w.lane - 1.5) * 0.94;
      const p = proj(wx, 0.01, w.row);
      if (p.depth <= 0.15) continue;
      ctx.save();
      ctx.strokeStyle = `rgba(52, 211, 153, ${w.alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, w.radius * p.scale * 0.55, w.radius * p.scale * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (anim.marbleAnim) {
      const m = anim.marbleAnim;
      const mt = Math.min(1, (now - m.startTime) / m.duration);
      const mRow = m.startRow + (m.targetRow - m.startRow) * mt;
      const mLane = m.startLane + (m.targetLane - m.startLane) * mt;
      const mY = Math.abs(Math.sin(mt * Math.PI * 2.5)) * (1 - mt * 0.6) * 0.45;
      const mp = proj((mLane - 1.5) * 0.94, mY, mRow);
      if (mp.depth > 0.15) {
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
      if (mt >= 1) anim.marbleAnim = null;
    }

    // 9. FRAGMENTOS DE CRISTAL CAYENDO AL ABISMO
    for (const s of anim.shards) {
      const p = proj(s.x, s.y, s.z);
      if (p.depth <= 0.15) continue;
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

    // 10. JUGADORES 3D REALISTAS CON ROSTROS DETALLADOS Y SOMBRAS DIRECCIONALES EN TIEMPO REAL
    //     - Los jugadores de atrás (#058 y #100) SIEMPRE existen en el mundo 3D detrás de ti,
    //       así que cuando giras la cámara 180° (o pulsas "👀 Voltear a ver Atrás"), los ves parados
    //       detrás de ti con sus rostros, ojos parpadeando, boca moviéndose al hablar y sombra direccional real.
    const backPlayersToDraw = [];
    if (anim.camMode === 'INTRO_SQUAD') {
      backPlayersToDraw.push(
        { number: '100', row: -2.05, lane: 2.02, faceCamera: false, relayTag: false },
        { number: '058', row: -1.62, lane: 0.98, faceCamera: false, relayTag: false },
        { number: '456', row: -1.18, lane: 1.50, faceCamera: false, relayTag: false }
      );
    } else if (anim.camMode === 'RELAY_REVEAL_BEHIND') {
      if (st.lives === 2) {
        const row100 = Math.max(-1.85, anim.playerRow - 0.68);
        backPlayersToDraw.push({ number: '100', row: row100, lane: 1.92, faceCamera: true, relayTag: false });
      }
      backPlayersToDraw.push({ number: anim.playerNumber, row: anim.playerRow, lane: anim.playerLane, faceCamera: true, relayTag: true });
    } else {
      // En modo POV normal: posicionar a los compañeros vivos detrás del jugador actual
      if (st.lives >= 3) {
        const row058 = st.currentStep > 0 ? (st.currentStep - 1) : -1.62;
        const lane058 = st.currentStep > 0 && st.safeLaneHistory[st.currentStep - 1] !== undefined
          ? st.safeLaneHistory[st.currentStep - 1]
          : 0.98;
        const row100 = st.currentStep > 1 ? (st.currentStep - 2) : -2.08;
        const lane100 = st.currentStep > 1 && st.safeLaneHistory[st.currentStep - 2] !== undefined
          ? st.safeLaneHistory[st.currentStep - 2]
          : 2.02;
        backPlayersToDraw.push(
          { number: '100', row: row100, lane: lane100, faceCamera: true, relayTag: false },
          { number: '058', row: row058, lane: lane058, faceCamera: true, relayTag: false }
        );
      } else if (st.lives === 2) {
        const row100 = st.currentStep > 0 ? (st.currentStep - 1) : -1.68;
        const lane100 = st.currentStep > 0 && st.safeLaneHistory[st.currentStep - 1] !== undefined
          ? st.safeLaneHistory[st.currentStep - 1]
          : 1.85;
        backPlayersToDraw.push(
          { number: '100', row: row100, lane: lane100, faceCamera: true, relayTag: false }
        );
      }
    }

    // Ordenar jugadores de más lejano a más cercano respecto a la cámara
    backPlayersToDraw.sort((a, b) => Math.abs(b.row - camZ) - Math.abs(a.row - camZ));
    for (const bp of backPlayersToDraw) {
      this.drawRealisticHumanPlayer3D(
        ctx,
        proj,
        bp.number,
        bp.row,
        bp.lane,
        0,
        now,
        mainLightX,
        mainLightY,
        mainLightZ,
        bp.faceCamera,
        bp.relayTag
      );
    }

    // 11. PIES Y PIERNAS EN POV + SOMBRA DIRECCIONAL PROPIA + MANOS CON 5 DEDOS EN PRIMER PLANO
    if (anim.camMode !== 'INTRO_SQUAD' && anim.camMode !== 'RELAY_REVEAL_BEHIND') {
      // Sombra direccional real proyectada por tu propio cuerpo sobre el cristal/plataforma bajo tus pies
      this.drawCharacterDirectionalShadow3D(
        ctx,
        proj,
        (anim.playerLane - 1.5) * 0.94,
        0,
        anim.playerRow,
        mainLightX,
        mainLightY,
        mainLightZ
      );

      if (pitch > 0.35 && anim.camMode !== 'POV_FALLING') {
        this.drawPOVFeetOnGlass3D(ctx, proj, anim, W, H, pitch);
      }
      this.drawPOVHandsForeground(ctx, W, H, now, anim);
    }

    ctx.restore();
  }

  /**
   * Dibuja las paredes del coliseo con cortinajes plisados estilo Squid Game y los pilares profundos del abismo
   */
  drawColiseumWallsAndAbyss3D(ctx, proj, st, now, W, H) {
    // 1. Pilares de acero descendiendo hacia el abismo oscuro (y = 0 hasta y = -18)
    for (let r = -1; r <= st.totalSteps + 1; r += 2) {
      [-1.88, 1.88].forEach(px => {
        const pTop = proj(px, -0.06, r);
        const pBot = proj(px, -16.5, r);
        if (pTop.depth > 0.2 && pBot.depth > 0.2) {
          const pillarGrad = ctx.createLinearGradient(pTop.x, pTop.y, pBot.x, pBot.y);
          pillarGrad.addColorStop(0, 'rgba(159, 18, 57, 0.65)');
          pillarGrad.addColorStop(0.45, 'rgba(30, 41, 59, 0.45)');
          pillarGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
          ctx.strokeStyle = pillarGrad;
          ctx.lineWidth = Math.max(1.5, Math.min(8, pTop.scale * 0.032));
          ctx.beginPath();
          ctx.moveTo(pTop.x, pTop.y);
          ctx.lineTo(pBot.x, pBot.y);
          ctx.stroke();
        }
      });

      // Crucetas estructurales en el abismo bajo el puente
      const cL = proj(-1.88, -2.2, r);
      const cR = proj(1.88, -2.2, r);
      if (cL.depth > 0.25 && cR.depth > 0.25) {
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.28)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cL.x, cL.y);
        ctx.lineTo(cR.x, cR.y);
        ctx.stroke();
      }
    }

    // 2. Paredes laterales de circo con pliegues verticales carmesí/violeta
    [-6.2, 6.2].forEach(wallX => {
      for (let z = -2; z < st.totalSteps + 3; z += 2) {
        const wTL = proj(wallX, 4.8, z + 2);
        const wTR = proj(wallX, 4.8, z);
        const wBR = proj(wallX, -8.0, z);
        const wBL = proj(wallX, -8.0, z + 2);
        if (wTL.depth > 0.25 && wTR.depth > 0.25) {
          const isEven = ((z + 2) / 2) % 2 === 0;
          ctx.fillStyle = isEven ? 'rgba(136, 19, 55, 0.16)' : 'rgba(76, 5, 25, 0.14)';
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(wTL.x, wTL.y);
          ctx.lineTo(wTR.x, wTR.y);
          ctx.lineTo(wBR.x, wBR.y);
          ctx.lineTo(wBL.x, wBL.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    });
  }

  /**
   * Dibuja el techo industrial del coliseo con cerchas metálicas, anillos de luz dorados y haces volumétricos
   */
  drawColiseumCeilingAndLights3D(ctx, proj, st, now, mainLightX, mainLightY, mainLightZ) {
    const roofY = 4.9;

    // Cerchas transversales del techo
    for (let z = -2; z <= st.totalSteps + 2; z += 2) {
      const rL = proj(-4.8, roofY, z);
      const rR = proj(4.8, roofY, z);
      if (rL.depth > 0.22 && rR.depth > 0.22) {
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.38)';
        ctx.lineWidth = Math.max(1, Math.min(4, rL.scale * 0.018));
        ctx.beginPath();
        ctx.moveTo(rL.x, rL.y);
        ctx.lineTo(rR.x, rR.y);
        ctx.stroke();
      }
    }

    // Vigas longitudinales del techo
    [-3.6, 0, 3.6].forEach(lx => {
      for (let z = -2; z < st.totalSteps + 2; z += 2) {
        const p1 = proj(lx, roofY, z);
        const p2 = proj(lx, roofY, z + 2);
        if (p1.depth > 0.22 && p2.depth > 0.22) {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });

    // Luminarias circulares cálidas y reflectores volumétricos a lo largo del techo
    for (let z = 0; z <= st.totalSteps; z += 3) {
      const lampPt = proj(z % 6 === 0 ? -0.9 : 0.9, roofY - 0.25, z);
      const floorTarget = proj(0, 0, z);
      if (lampPt.depth > 0.2) {
        // Cono de luz volumétrica hacia el puente
        if (floorTarget.depth > 0.2) {
          const coneGrad = ctx.createLinearGradient(lampPt.x, lampPt.y, floorTarget.x, floorTarget.y);
          coneGrad.addColorStop(0, 'rgba(253, 224, 71, 0.20)');
          coneGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.07)');
          coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = coneGrad;
          const spread = Math.max(25, floorTarget.scale * 0.55);
          ctx.beginPath();
          ctx.moveTo(lampPt.x - 6, lampPt.y);
          ctx.lineTo(lampPt.x + 6, lampPt.y);
          ctx.lineTo(floorTarget.x + spread, floorTarget.y);
          ctx.lineTo(floorTarget.x - spread, floorTarget.y);
          ctx.closePath();
          ctx.fill();
        }

        // Halo y foco de la lámpara en el techo
        const rBulb = Math.max(3, Math.min(14, lampPt.scale * 0.045));
        const glow = ctx.createRadialGradient(lampPt.x, lampPt.y, 1, lampPt.x, lampPt.y, rBulb * 3.2);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        glow.addColorStop(0.4, 'rgba(251, 191, 36, 0.45)');
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lampPt.x, lampPt.y, rBulb * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Dibuja la Plataforma de Salida al inicio del puente con su franja de peligro amarilla/negra y barandales
   * para que cuando estás en el Peldaño 1 se vea claramente que estás en el inicio del puente.
   */
  drawStartPlatform3D(ctx, proj, now) {
    const zFront = -0.52;
    const zBack = -2.65;
    const pFL = proj(-2.15, 0, zFront);
    const pFR = proj(2.15, 0, zFront);
    const pBR = proj(2.15, 0, zBack);
    const pBL = proj(-2.15, 0, zBack);

    if (pFL.depth > 0.15 || pFR.depth > 0.15 || pBR.depth > 0.15 || pBL.depth > 0.15) {
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(pFL.x, pFL.y);
      ctx.lineTo(pFR.x, pFR.y);
      ctx.lineTo(pBR.x, pBR.y);
      ctx.lineTo(pBL.x, pBL.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Franja de advertencia amarilla/negra en el borde de salida (z = -0.68 a -0.52)
      const stripes = 10;
      for (let i = 0; i < stripes; i++) {
        const x1 = -2.05 + (i / stripes) * 4.10;
        const x2 = -2.05 + ((i + 1) / stripes) * 4.10;
        const s1 = proj(x1, 0.005, -0.53);
        const s2 = proj(x2, 0.005, -0.53);
        const s3 = proj(x2, 0.005, -0.72);
        const s4 = proj(x1, 0.005, -0.72);
        if (s1.depth > 0.15 && s3.depth > 0.15) {
          ctx.fillStyle = i % 2 === 0 ? '#facc15' : '#090d16';
          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.lineTo(s3.x, s3.y);
          ctx.lineTo(s4.x, s4.y);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Barandales laterales iluminados de la plataforma de salida
      [-2.10, 2.10].forEach(rx => {
        const rFTop = proj(rx, 0.95, zFront);
        const rBTop = proj(rx, 0.95, zBack);
        const rFBot = proj(rx, 0, zFront);
        const rBBot = proj(rx, 0, zBack);
        if (rFTop.depth > 0.16 && rBTop.depth > 0.16) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(rFTop.x, rFTop.y);
          ctx.lineTo(rBTop.x, rBTop.y);
          ctx.moveTo(rFBot.x, rFBot.y);
          ctx.lineTo(rFTop.x, rFTop.y);
          ctx.moveTo(rBBot.x, rBBot.y);
          ctx.lineTo(rBTop.x, rBTop.y);
          ctx.stroke();
        }
      });

      ctx.restore();
    }
  }

  /**
   * Dibuja la Plataforma de Meta VIP al final del puente con su arco neón y los 3 Guardianes Rosas (○ △ □)
   * proyectando sombras direccionales reales sobre la meta.
   */
  drawFinishPlatformAndGuards3D(ctx, proj, st, now, lightX, lightY, lightZ) {
    const fNear = st.totalSteps - 0.35;
    const fFar = st.totalSteps + 1.45;
    const fTL = proj(-2.25, 0, fFar);
    const fTR = proj(2.25, 0, fFar);
    const fBR = proj(2.25, 0, fNear);
    const fBL = proj(-2.25, 0, fNear);

    if (fTL.depth <= 0.18 || fBR.depth <= 0.18) return;

    ctx.save();
    // Piso de la plataforma de meta
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(fTL.x, fTL.y);
    ctx.lineTo(fTR.x, fTR.y);
    ctx.lineTo(fBR.x, fBR.y);
    ctx.lineTo(fBL.x, fBL.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Arco Neón de Meta ("META ○ △ □")
    const archZ = st.totalSteps + 0.95;
    const aBL = proj(-1.95, 0, archZ);
    const aTL = proj(-1.95, 2.35, archZ);
    const aTR = proj(1.95, 2.35, archZ);
    const aBR = proj(1.95, 0, archZ);
    if (aTL.depth > 0.2 && aTR.depth > 0.2) {
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = Math.max(2.5, aTL.scale * 0.035);
      ctx.beginPath();
      ctx.moveTo(aBL.x, aBL.y);
      ctx.lineTo(aTL.x, aTL.y);
      ctx.lineTo(aTR.x, aTR.y);
      ctx.lineTo(aBR.x, aBR.y);
      ctx.stroke();

      const bannerMid = proj(0, 2.15, archZ);
      ctx.fillStyle = '#fde047';
      ctx.font = `900 ${Math.max(9, Math.min(18, Math.round(bannerMid.scale * 0.14)))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★ META CACES ○ △ □ ★', bannerMid.x, bannerMid.y);
    }

    // Los 3 Guardianes de Squid Game custodiando la meta:
    // Izquierda: Triángulo (△ Soldado armado), Centro: Cuadrado (□ Líder), Derecha: Círculo (○ Guardia)
    const guards = [
      { x: -1.15, z: st.totalSteps + 0.55, symbol: 'triangle' },
      { x: 0.0,   z: st.totalSteps + 0.42, symbol: 'square' },
      { x: 1.15,  z: st.totalSteps + 0.55, symbol: 'circle' }
    ];

    guards.forEach(g => {
      this.drawPinkGuard3D(ctx, proj, g.x, g.z, g.symbol, now, lightX, lightY, lightZ);
    });

    ctx.restore();
  }

  /**
   * Dibuja un Guardián Rosa de Squid Game en 3D con overol carmesí, máscara negra con símbolo (○, △ o □),
   * rifle y sombra direccional proyectada en tiempo real sobre la plataforma de meta.
   */
  drawPinkGuard3D(ctx, proj, wx, wz, symbolType, now, lightX, lightY, lightZ) {
    // 1. Sombra direccional real en el suelo de la meta
    this.drawCharacterDirectionalShadow3D(ctx, proj, wx, 0, wz, lightX, lightY, lightZ);

    const basePt = proj(wx, 0, wz);
    const headPt = proj(wx, 1.48, wz);
    if (basePt.depth <= 0.2 || headPt.depth <= 0.2) return;

    const hPx = Math.max(12, Math.abs(basePt.y - headPt.y));
    const wPx = hPx * 0.42;

    ctx.save();
    // Piernas del overol rosa
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = Math.max(2, wPx * 0.28);
    ctx.lineCap = 'round';
    [-wPx * 0.24, wPx * 0.24].forEach(lx => {
      ctx.beginPath();
      ctx.moveTo(basePt.x + lx, basePt.y - hPx * 0.42);
      ctx.lineTo(basePt.x + lx, basePt.y);
      ctx.stroke();
    });

    // Torso con overol rosa intenso y cinturón táctico negro
    const torsoGrad = ctx.createLinearGradient(basePt.x - wPx * 0.5, headPt.y, basePt.x + wPx * 0.5, basePt.y);
    torsoGrad.addColorStop(0, '#fb7185');
    torsoGrad.addColorStop(0.5, '#e11d48');
    torsoGrad.addColorStop(1, '#881337');
    ctx.fillStyle = torsoGrad;
    ctx.beginPath();
    ctx.roundRect(basePt.x - wPx * 0.52, basePt.y - hPx * 0.80, wPx * 1.04, hPx * 0.44, Math.max(2, wPx * 0.18));
    ctx.fill();

    // Cinturón negro y cierre central
    ctx.fillStyle = '#090d16';
    ctx.fillRect(basePt.x - wPx * 0.52, basePt.y - hPx * 0.48, wPx * 1.04, Math.max(2, hPx * 0.06));

    // Rifle táctico cruzado sobre el pecho
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(2, wPx * 0.18);
    ctx.beginPath();
    ctx.moveTo(basePt.x - wPx * 0.55, basePt.y - hPx * 0.68);
    ctx.lineTo(basePt.x + wPx * 0.58, basePt.y - hPx * 0.46);
    ctx.stroke();

    // Capucha rosa y máscara negra de esgrima
    const rHead = Math.max(4, hPx * 0.17);
    const hx = headPt.x;
    const hy = basePt.y - hPx * 0.90;

    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(hx, hy, rHead * 1.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(hx, hy, rHead * 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Símbolo geométrico blanco brillante en la máscara (○, △ o □)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.4, rHead * 0.24);
    const symR = rHead * 0.52;
    if (symbolType === 'circle') {
      ctx.beginPath();
      ctx.arc(hx, hy, symR, 0, Math.PI * 2);
      ctx.stroke();
    } else if (symbolType === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(hx, hy - symR);
      ctx.lineTo(hx + symR * 0.95, hy + symR * 0.8);
      ctx.lineTo(hx - symR * 0.95, hy + symR * 0.8);
      ctx.closePath();
      ctx.stroke();
    } else {
      ctx.strokeRect(hx - symR * 0.85, hy - symR * 0.85, symR * 1.7, symR * 1.7);
    }

    ctx.restore();
  }

  /**
   * Dibuja las vigas de acero rosas en 3D con cara superior y lateral a lo largo del puente
   */
  drawSteelBridgeRails3D(ctx, proj, st) {
    [-1.88, -0.94, 0, 0.94, 1.88].forEach(railX => {
      for (let z = -1; z < st.totalSteps + 1; z++) {
        const p1 = proj(railX, -0.03, z);
        const p2 = proj(railX, -0.03, z + 1);
        const p1Bot = proj(railX, -0.14, z);
        const p2Bot = proj(railX, -0.14, z + 1);

        if (p1.depth > 0.16 && p2.depth > 0.16) {
          // Cara lateral de la viga I de acero
          ctx.fillStyle = 'rgba(159, 18, 57, 0.78)';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p2Bot.x, p2Bot.y);
          ctx.lineTo(p1Bot.x, p1Bot.y);
          ctx.closePath();
          ctx.fill();

          // Borde superior metálico brillante
          ctx.strokeStyle = '#fb7185';
          ctx.lineWidth = Math.max(1.5, Math.min(6, p1.scale * 0.022));
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });
  }

  /**
   * Proyecta en tiempo real la Sombra Direccional anatómica de un personaje sobre el plano del suelo/vidrio
   * calculando la intersección exacta rayo-plano desde el reflector superior (lightX, lightY, lightZ).
   */
  drawCharacterDirectionalShadow3D(ctx, proj, charX, floorY, charZ, lightX, lightY, lightZ) {
    // Puntos 3D del esqueleto del personaje (pies, cadera, hombros, cabeza y manos)
    const footL = this.projectDirectionalShadowPoint(charX - 0.14, floorY + 0.02, charZ, floorY, lightX, lightY, lightZ, proj);
    const footR = this.projectDirectionalShadowPoint(charX + 0.14, floorY + 0.02, charZ, floorY, lightX, lightY, lightZ, proj);
    const shldrL = this.projectDirectionalShadowPoint(charX - 0.24, floorY + 1.15, charZ, floorY, lightX, lightY, lightZ, proj);
    const shldrR = this.projectDirectionalShadowPoint(charX + 0.24, floorY + 1.15, charZ, floorY, lightX, lightY, lightZ, proj);
    const headTop = this.projectDirectionalShadowPoint(charX, floorY + 1.56, charZ, floorY, lightX, lightY, lightZ, proj);

    if (footL.depth <= 0.16 || headTop.depth <= 0.16) return;

    ctx.save();
    const shadGrad = ctx.createLinearGradient(footL.x, footL.y, headTop.x, headTop.y);
    shadGrad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
    shadGrad.addColorStop(0.65, 'rgba(2, 6, 23, 0.42)');
    shadGrad.addColorStop(1, 'rgba(2, 6, 23, 0.08)');

    ctx.fillStyle = shadGrad;
    ctx.beginPath();
    ctx.moveTo(footL.x, footL.y);
    ctx.lineTo(footR.x, footR.y);
    ctx.lineTo(shldrR.x, shldrR.y);
    ctx.lineTo(headTop.x, headTop.y);
    ctx.lineTo(shldrL.x, shldrL.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Dibuja un Jugador Humano 3D Realista (#456, #058 o #100) con:
   * - Sombra direccional proyectada en tiempo real desde los reflectores superiores
   * - Zapatillas blancas detalladas, piernas con rodillas y franjas laterales
   * - Chaqueta deportiva verde Squid Game con cierre, cuello y parche numérico
   * - Brazos articulados y manos con 5 dedos individuales (nunca círculos)
   * - Rostro humano realista (ojos con iris/pupilas y parpadeo, cejas, nariz con relieve,
   *   boca que se mueve cuando el personaje está hablando y peinado diferenciado).
   */
  drawRealisticHumanPlayer3D(ctx, proj, numberStr, row, lane, liftY, now, lightX, lightY, lightZ, showFrontFace = true, isRelayHighlight = false) {
    const wx = (lane - 1.5) * 0.94;
    const bobY = Math.sin(now * 0.0045 + Number(numberStr)) * 0.02;
    const wy = liftY + bobY;

    // 1. Sombra direccional geométrica en tiempo real sobre la plataforma o vidrio
    this.drawCharacterDirectionalShadow3D(ctx, proj, wx, 0, row, lightX, lightY, lightZ);

    const basePt = proj(wx, wy, row);
    const headPt = proj(wx, wy + 1.54, row);
    if (basePt.depth <= 0.18 || headPt.depth <= 0.18) return;

    const totalH = Math.max(18, Math.abs(basePt.y - headPt.y));
    const s = totalH / 64;

    const st = this.bridgeState;
    const isThisPlayerSpeaking = Boolean(
      this.isSpeakingNow &&
      st &&
      st.anim &&
      st.anim.activeChatter &&
      st.anim.activeChatter.speakerNum === numberStr
    );

    ctx.save();
    ctx.translate(basePt.x, basePt.y);

    // 2. Piernas articuladas (muslo + rodilla + pantorrilla) y zapatillas blancas
    [-6.2 * s, 6.2 * s].forEach((lx, idx) => {
      const dir = idx === 0 ? -1 : 1;
      // Pantalón deportivo verde oscuro con sombreado cilíndrico
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = Math.max(2.5, 6.2 * s);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lx, -25 * s);
      ctx.lineTo(lx + dir * 0.8 * s, -12 * s);
      ctx.lineTo(lx, -2.5 * s);
      ctx.stroke();

      // Doble franja blanca lateral del pantalón
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = Math.max(1, 1.2 * s);
      ctx.beginPath();
      ctx.moveTo(lx + dir * 2.6 * s, -24 * s);
      ctx.lineTo(lx + dir * 2.6 * s, -3 * s);
      ctx.stroke();

      // Zapatilla blanca con suela y puntera
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = Math.max(1, 1.1 * s);
      ctx.beginPath();
      ctx.ellipse(lx + dir * 0.6 * s, -1 * s, 5.2 * s, 2.6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 3. Torso con sombreado 3D, cierre central blanco, cuello y parche numérico
    const torsoGrad = ctx.createLinearGradient(-14 * s, -50 * s, 14 * s, -24 * s);
    torsoGrad.addColorStop(0, '#14b8a6');
    torsoGrad.addColorStop(0.5, '#0d9488');
    torsoGrad.addColorStop(1, '#115e59');
    ctx.fillStyle = torsoGrad;
    ctx.strokeStyle = '#042f2e';
    ctx.lineWidth = Math.max(1, 1.2 * s);
    ctx.beginPath();
    ctx.roundRect(-13.5 * s, -48 * s, 27 * s, 25 * s, 6 * s);
    ctx.fill();
    ctx.stroke();

    // Cierre vertical blanco de la chaqueta
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = Math.max(1, 1.3 * s);
    ctx.beginPath();
    ctx.moveTo(0, -48 * s);
    ctx.lineTo(0, -23 * s);
    ctx.stroke();

    // Parche blanco con el número del jugador (#456, #058, #100)
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(0.8, 0.9 * s);
    ctx.beginPath();
    ctx.roundRect(-10.5 * s, -41 * s, 21 * s, 10.5 * s, 2.2 * s);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = `900 ${Math.max(8, Math.round(7.8 * s))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numberStr, 0, -35.6 * s);

    // 4. Brazos articulados y manos realistas con 5 dedos individuales
    [-1, 1].forEach(dir => {
      const wave = isThisPlayerSpeaking ? Math.sin(now * 0.015) * 3.5 * s : 0;
      const shX = dir * 14 * s;
      const shY = -45 * s;
      const elbX = dir * 17.5 * s;
      const elbY = -34 * s - wave * 0.5;
      const wristX = dir * 15.5 * s;
      const wristY = -24 * s - wave;

      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = Math.max(2.2, 5.0 * s);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shX, shY);
      ctx.lineTo(elbX, elbY);
      ctx.lineTo(wristX, wristY);
      ctx.stroke();

      // Palma de la mano + 5 dedos articulados
      ctx.fillStyle = '#f1c27d';
      ctx.beginPath();
      ctx.ellipse(wristX, wristY + 1.5 * s, 2.8 * s, 2.4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      for (let f = -2; f <= 2; f++) {
        const fx = wristX + f * 0.95 * s;
        const fy = wristY + 3.2 * s;
        ctx.beginPath();
        ctx.roundRect(fx - 0.4 * s, fy, 0.8 * s, 2.4 * s, 0.4 * s);
        ctx.fill();
      }
    });

    // 5. Cuello, Cabeza Anatómica y Rostro Humano Realista
    ctx.fillStyle = '#e0ac69';
    ctx.fillRect(-3.2 * s, -52 * s, 6.4 * s, 5 * s);

    const headY = -58.5 * s;
    const headR = 8.6 * s;

    // Orejas
    ctx.fillStyle = '#e0ac69';
    [-headR * 0.95, headR * 0.95].forEach(ex => {
      ctx.beginPath();
      ctx.ellipse(ex, headY + 0.5 * s, 1.8 * s, 3.0 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Rostro con sombreado 3D radial
    const faceGrad = ctx.createRadialGradient(-2 * s, headY - 2 * s, 1 * s, 0, headY, headR * 1.1);
    faceGrad.addColorStop(0, '#ffdbac');
    faceGrad.addColorStop(0.65, '#f1c27d');
    faceGrad.addColorStop(1, '#c68642');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(0, headY, headR * 0.92, headR * 1.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabello detallado según el jugador (#100 canoso/veterano, #058 y #456 pelinegro con volumen)
    ctx.fillStyle = numberStr === '100' ? '#475569' : '#0f172a';
    ctx.beginPath();
    ctx.arc(0, headY - 1.8 * s, headR * 0.98, Math.PI * 0.92, Math.PI * 2.08);
    ctx.fill();

    if (showFrontFace) {
      // Cejas expresivas
      ctx.strokeStyle = numberStr === '100' ? '#334155' : '#0f172a';
      ctx.lineWidth = Math.max(1, 1.3 * s);
      [-1, 1].forEach(dir => {
        ctx.beginPath();
        ctx.moveTo(dir * 1.5 * s, headY - 2.2 * s);
        ctx.lineTo(dir * 5.2 * s, headY - 2.8 * s);
        ctx.stroke();
      });

      // Ojos con esclera blanca, iris, pupila y parpadeo natural
      const isBlinking = (Math.floor(now / 180) % 23 === 0);
      [-3.3 * s, 3.3 * s].forEach(ox => {
        if (isBlinking) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = Math.max(1, 1.1 * s);
          ctx.beginPath();
          ctx.moveTo(ox - 1.8 * s, headY - 0.5 * s);
          ctx.lineTo(ox + 1.8 * s, headY - 0.5 * s);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(ox, headY - 0.5 * s, 1.9 * s, 1.25 * s, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(ox, headY - 0.5 * s, 0.95 * s, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ox - 0.3 * s, headY - 0.8 * s, 0.35 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Nariz con relieve
      ctx.strokeStyle = 'rgba(146, 64, 14, 0.65)';
      ctx.lineWidth = Math.max(0.9, 1.0 * s);
      ctx.beginPath();
      ctx.moveTo(0, headY - 0.8 * s);
      ctx.lineTo(-0.7 * s, headY + 2.2 * s);
      ctx.lineTo(0.8 * s, headY + 2.2 * s);
      ctx.stroke();

      // Boca realista (se abre y anima en tiempo real cuando el jugador te está hablando)
      const mouthY = headY + 4.6 * s;
      if (isThisPlayerSpeaking) {
        const openH = (1.2 + Math.abs(Math.sin(now * 0.022)) * 2.2) * s;
        ctx.fillStyle = '#7f1d1d';
        ctx.strokeStyle = '#450a0a';
        ctx.lineWidth = Math.max(0.8, 0.9 * s);
        ctx.beginPath();
        ctx.ellipse(0, mouthY, 2.6 * s, openH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = Math.max(1, 1.2 * s);
        ctx.beginPath();
        ctx.moveTo(-2.4 * s, mouthY);
        ctx.quadraticCurveTo(0, mouthY + 0.8 * s, 2.4 * s, mouthY);
        ctx.stroke();
      }
    }

    // Etiqueta de identificación o relevo sobre el jugador
    if (isRelayHighlight || isThisPlayerSpeaking) {
      const labelTxt = isRelayHighlight
        ? `⬆️ TOMA EL RELEVO #${numberStr}`
        : `🗣️ #${numberStr} HABLANDO`;
      ctx.fillStyle = isRelayHighlight ? '#fbbf24' : '#10b981';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(-64, headY - 26 * s, 128, 20, 7);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 10px "JetBrains Mono", monospace';
      ctx.fillText(labelTxt, 0, headY - 26 * s + 10);
    }

    ctx.restore();
  }

  /**
   * Dibuja tus propias piernas y zapatillas blancas paradas directamente sobre el peldaño
   * cuando miras hacia abajo en POV.
   */
  drawPOVFeetOnGlass3D(ctx, projFn, anim, W, H, pitch) {
    const visibility = Math.min(1, Math.max(0, (pitch - 0.35) / 0.45));
    if (visibility <= 0.02) return;

    const baseX = (anim.playerLane - 1.5) * 0.94;
    const baseZ = anim.playerRow + 0.05;

    ctx.save();
    ctx.globalAlpha = visibility * 0.96;

    [-1, 1].forEach(dir => {
      const footWorldX = baseX + dir * 0.14;
      const heelPt = projFn(footWorldX, 0.01, baseZ - 0.06);
      const toePt = projFn(footWorldX, 0.01, baseZ + 0.16);
      if (heelPt.depth <= 0.15 || toePt.depth <= 0.15) return;

      const fx = (heelPt.x + toePt.x) * 0.5;
      const fy = (heelPt.y + toePt.y) * 0.5;
      const footLen = Math.max(22, Math.min(58, Math.hypot(toePt.x - heelPt.x, toePt.y - heelPt.y) * 1.15));
      const footWid = footLen * 0.48;

      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(fx, fy, footWid, footLen * 0.55, dir * 0.06, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(fx - footWid * 0.45, fy - footLen * 0.1);
      ctx.lineTo(fx + footWid * 0.45, fy - footLen * 0.1);
      ctx.stroke();

      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.roundRect(fx - footWid * 0.85, fy + footLen * 0.15, footWid * 1.7, footLen * 0.55, 6);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Dibuja en primer plano las manos articuladas con 5 dedos y mangas del jugador activo (#456, #058 o #100)
   */
  drawPOVHandsForeground(ctx, W, H, now, anim) {
    const activeNum = anim.playerNumber || '456';
    const swayX = Math.sin(now * 0.0035) * 4;
    const swayY = Math.abs(Math.cos(now * 0.0035)) * 3 + (anim.camMode === 'POV_JUMPING' ? -12 : 0);

    ctx.save();
    [-1, 1].forEach(dir => {
      ctx.save();
      const baseX = W * 0.5 + dir * Math.min(170, W * 0.35) + swayX * dir;
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

      // Pulgar + 4 dedos individuales
      ctx.beginPath();
      ctx.roundRect(handX + dir * 6.5, handY - 3, 3.5, 6.5, 1.5);
      ctx.fill();

      for (let f = 0; f < 4; f++) {
        const fx = handX + (f - 1.5) * 3.6;
        const fy = handY - 6.5 - (f === 1 || f === 2 ? 2.2 : 0);
        ctx.beginPath();
        ctx.roundRect(fx - 1.5, fy - 4.5, 3, 8, 1.5);
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
