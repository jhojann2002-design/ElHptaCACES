/**
 * MOTOR ARCADE EHEP 3D - EL HPTA CACES
 * Incluye 2 Juegos Oficiales de Alto Rendimiento:
 * 1. El Puente de Cristal CACES (Motor 3D en Perspectiva 60FPS estilo Squid Game:
 *    cámara que avanza hacia la meta, salto parabólico del Jugador #456,
 *    física de fragmentos de vidrio roto y caída libre al vacío).
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
  heartFull: `<svg class="w-5 h-5 text-rose-500 inline-block" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
  heartEmpty: `<svg class="w-5 h-5 text-slate-600 inline-block opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
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
    this.questionsPool = [];

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
    let html = '<span class="inline-flex items-center gap-1">';
    for (let i = 0; i < maxLives; i++) {
      html += i < safeLives ? SVG_ICONS.heartFull : SVG_ICONS.heartEmpty;
    }
    html += '</span>';
    return html;
  }

  // =========================================================================
  // MOTOR DE AUDIO SINTETIZADO (SALTO, CRISTAL TEMPLADO, VIDRIO ROTO Y CAÍDA)
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
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.22);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (type === 'correct' || type === 'glass_step') {
        // Sonido cristalino firme + acorde de éxito
        [783.99, 1046.5, 1318.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.055);
          gain.gain.setValueAtTime(0.16, now + idx * 0.055);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.28);
          osc.start(now + idx * 0.055);
          osc.stop(now + idx * 0.055 + 0.28);
        });
      } else if (type === 'glass_shatter') {
        // Estallido agudo de cristal rompiéndose + caída al abismo
        [1420, 980, 620, 310].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.03);
          osc.frequency.exponentialRampToValueAtTime(65, now + 0.45);
          gain.gain.setValueAtTime(0.15, now + i * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
          osc.start(now + i * 0.03);
          osc.stop(now + 0.48);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(85, now + 0.3);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {}
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    localStorage.setItem('caces_sfx', this.sfxEnabled ? 'on' : 'off');
    return this.sfxEnabled;
  }

  // =========================================================================
  // SISTEMA DE 5 RANGOS CLÍNICOS REBALANCEADOS (ESCALA ANUAL)
  // =========================================================================
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
    if (this.blitzInterval) {
      clearInterval(this.blitzInterval);
      this.blitzInterval = null;
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
    gridContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

    const modes = [
      {
        id: 'bridge',
        badge: '○ △ □ • 3D SQUID GAME',
        badgeClass: 'bg-rose-500/15 text-rose-500 border border-rose-500/30',
        activeBorder: 'border-2 border-rose-500 ring-2 ring-rose-500/20',
        imgSrc: 'assets/juego-puente-cristal.png',
        imgWrapClass: 'bg-slate-950 border border-rose-500/30',
        imgClass: 'w-full h-full object-cover',
        title: '1. El Puente de Cristal (#456)',
        desc: 'Salta al peldaño de cristal con la respuesta correcta para avanzar hacia la meta sin caer al vacío.',
        statsLabel: `Racha Máx. Vidrios: ${Math.max(arcStats.bridgeBestStreak || 0, arcStats.bridgeBestStep || 0)} • Puentes Logrados: ${arcStats.bridgeWins || 0}`
      },
      {
        id: 'hangman',
        badge: 'PALABRA OCULTA MSP',
        badgeClass: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
        activeBorder: 'border-2 border-emerald-500 ring-2 ring-emerald-500/20',
        imgSrc: 'assets/juego-ahorcado.png',
        imgWrapClass: 'bg-emerald-100/95 dark:bg-emerald-950/60 border border-emerald-500/30 p-2.5',
        imgClass: 'w-full h-full object-contain',
        title: '2. Ahorcado Clínico MSP',
        desc: 'Adivina el diagnóstico, fármaco de elección o signo clínico letra por letra antes de agotar tus intentos.',
        statsLabel: `Palabras Salvadas: ${arcStats.hangmanWordsSolved} • Mejor Racha: x${arcStats.hangmanBestStreak || 0}`
      }
    ];

    gridContainer.innerHTML = modes.map(m => {
      const isActive = this.currentMode === m.id;
      return `
        <button type="button" data-game-mode="${m.id}" class="arcade-mode-btn bto-card text-left p-4 sm:p-5 rounded-3xl bg-white dark:bg-bto-panel transition-all flex flex-col justify-between gap-3 group ${
          isActive ? m.activeBorder : 'hover:border-slate-400 dark:hover:border-slate-600'
        }">
          <div class="flex items-stretch gap-4">
            <div class="w-24 sm:w-28 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-md group-hover:scale-[1.02] transition-transform ${m.imgWrapClass}">
              <img src="${m.imgSrc}" alt="${m.title}" class="${m.imgClass}">
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono text-[11px] font-black uppercase px-2.5 py-0.5 rounded-lg truncate ${m.badgeClass}">${m.badge}</span>
                  <span class="font-mono text-xs font-bold shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400'}">${isActive ? '● EN JUEGO' : 'JUGAR →'}</span>
                </div>
                <h3 class="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white leading-snug">${m.title}</h3>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">${m.desc}</p>
              </div>
            </div>
          </div>
          <div class="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            <span>${m.statsLabel}</span>
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
  // JUEGO 1: EL PUENTE DE CRISTAL 3D (SQUID GAME CANVAS 60FPS + FÍSICA)
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
        perla_caces: 'En Preeclampsia con signos de gravedad la impregnación es 4 g IV en 20 min + mantenimiento 1 g/h. En Eclampsia convulsiva es 6 g IV en 20 min + 2 g/h.'
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
        perla_caces: 'Todo recién nacido recibe BCG (previene tuberculosis meníngea y miliar) y Hepatitis B monodosis en las primeras 24 horas.'
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
        perla_caces: 'Triada de Beck = Hipotensión + Ruidos cardíacos velados + Ingurgitación yugular (Taponamiento Cardíaco).'
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
        perla_caces: 'Intoxicación por Organofosforados (síndrome colinérgico): Atropinización inmediata evaluando la desaparición de broncorrea.'
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
        perla_caces: 'La Atonía Uterina (Tono) causa el 70% de las HPP. El uterotónico de primera línea es Oxitocina + masaje uterino bimanual + Ácido Tranexámico 1 g IV.'
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
    // Orden idéntico a la imagen de referencia: #456 al frente, #058 y #100 atrás
    if (lives >= 3) return ['456', '058', '100'];
    if (lives === 2) return ['058', '100'];
    if (lives === 1) return ['100'];
    return [];
  }

  computeFollowerSlot(followerIdx, leadRow, safeLaneHistory, leadLane = 1.5) {
    // Mantiene a los compañeros en formación abierta en V (flancos izquierdo y derecho)
    // para que NUNCA se interpongan entre la cámara y el jugador principal
    const targetStep = Math.round(leadRow) - (followerIdx + 1);
    const flankLane = followerIdx === 0 ? 2.88 : 0.12; // #058 flanco derecho, #100 flanco izquierdo

    if (targetStep >= 0 && safeLaneHistory[targetStep] !== undefined) {
      let safeLane = safeLaneHistory[targetStep];
      // Si el carril seguro de atrás coincide con la línea visual del jugador principal,
      // desplazar al compañero hacia el borde exterior para dejar libre la vista del líder
      if (Math.abs(safeLane - leadLane) < 0.85) {
        safeLane = leadLane <= 1.5
          ? Math.min(3.1, safeLane + (followerIdx === 0 ? 0.95 : -0.55))
          : Math.max(-0.1, safeLane - (followerIdx === 0 ? -0.55 : 0.95));
      } else {
        safeLane += (followerIdx === 0 ? 0.28 : -0.28);
      }
      return {
        row: targetStep - 0.18,
        lane: safeLane
      };
    }

    // En la plataforma verde de salida: abiertos a los lados como en la imagen de referencia
    if (followerIdx === 0) {
      return { row: -1.18, lane: flankLane }; // #058 derecha
    }
    return { row: -1.22, lane: flankLane }; // #100 izquierda
  }

  startGlassBridgeGame(carryOver = null) {
    this.stopAllLoops();
    const totalSteps = 12;
    const bridgeLevel = carryOver ? (carryOver.bridgeLevel + 1) : 1;
    const globalStepOffset = (bridgeLevel - 1) * totalSteps;
    const lives = carryOver ? carryOver.lives : 3;
    const squadNums = this.getSquadOrderForLives(lives);
    const leadNum = squadNums[0] || '456';

    const followers = squadNums.slice(1).map((num, idx) => {
      const slot = this.computeFollowerSlot(idx, -0.72, {}, 1.5);
      return {
        num,
        row: slot.row,
        lane: slot.lane,
        y: 0,
        jumpPhase: 0,
        hopActive: false,
        hopStartTime: 0,
        hopDuration: 460,
        hopStartRow: slot.row,
        hopStartLane: slot.lane,
        hopTargetRow: slot.row,
        hopTargetLane: slot.lane
      };
    });

    this.bridgeState = {
      totalSteps,
      bridgeLevel,
      globalStepOffset,
      currentStep: 0, // 0..11 dentro del nivel actual
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
      isGameOver: false,
      isVictory: false,
      powerups: {
        glassmakerEye: carryOver ? Math.min(3, (carryOver.powerups?.glassmakerEye || 0) + 1) : 2,
        marbleHint: carryOver ? Math.min(3, (carryOver.powerups?.marbleHint || 0) + 1) : 2,
        temperedShield: carryOver ? Math.max(1, carryOver.powerups?.temperedShield || 0) : 1
      },
      anim: {
        cameraRow: -0.95,
        targetCameraRow: -0.95,
        playerRow: -0.72,
        playerLane: 1.5,
        playerY: 0,
        playerScale: 1,
        playerRotation: 0,
        playerJumpPhase: 0,
        landingSquash: 0,
        playerNumber: leadNum,
        followers,
        fallingActors: [], // Jugadores cayendo al vacío mientras los de atrás avanzan
        cracks: [],        // Grietas radiales en el cristal antes/durante el estallido
        sparks: [],        // Polvo y chispas de vidrio al romperse
        dustMotes: Array.from({ length: 26 }, () => ({
          x: (Math.random() - 0.5) * 7,
          y: -1.5 + Math.random() * 3.5,
          z: -1 + Math.random() * 14,
          r: 0.8 + Math.random() * 1.8,
          speed: 0.002 + Math.random() * 0.004,
          phase: Math.random() * Math.PI * 2
        })),
        jumpActive: false,
        jumpStartTime: 0,
        jumpDuration: 560,
        jumpStartRow: -0.72,
        jumpStartLane: 1.5,
        jumpTargetRow: 0,
        jumpTargetLane: 1.5,
        jumpWillBreak: false,
        jumpChosenId: null,
        isRelayAdvance: false,
        screenShake: 0,
        hoveredLane: -1,
        shards: [],
        shockwaves: [],
        tileHitRegions: []
      }
    };

    this.renderGlassBridgeLayout();
    this.startGlassBridgeRenderLoop();
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

  renderGlassBridgeLayout() {
    const stage = document.getElementById('arcade-stage');
    if (!stage || !this.bridgeState) return;

    stage.innerHTML = `
      <div class="space-y-3 sm:space-y-5">
        <!-- Cabecera HUD de El Puente de Cristal -->
        <div id="bridge-hud-bar"></div>

        <!-- Layout Principal: Visor 3D Fijo (Sticky) en Celular + Panel Clínico de Salto -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-start">
          
          <!-- Escenario 3D en Perspectiva (Sticky en móvil para verlo siempre al bajar a las preguntas) -->
          <div id="bridge-viewport-card" class="lg:col-span-6 sticky top-[52px] lg:static z-30 relative rounded-3xl overflow-hidden border-2 border-rose-500/50 bg-[#0d0414] shadow-[0_18px_40px_rgba(0,0,0,0.75)] h-[240px] sm:h-[300px] lg:h-[550px] flex flex-col justify-between select-none">
            <canvas id="squid-bridge-canvas" class="w-full h-full block cursor-pointer" width="760" height="620"></canvas>

            <!-- Overlay superior en el visor 3D -->
            <div class="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
              <span class="px-2.5 py-1 rounded-full bg-slate-950/85 border border-rose-500/50 text-rose-400 font-mono text-[10px] sm:text-[11px] font-black tracking-wider backdrop-blur-md shadow-md">
                ○ △ □ • LÍDER #<span id="bridge-3d-player-num">456</span>
              </span>
              <div id="bridge-3d-lives-pill" class="px-2.5 py-1 rounded-full bg-slate-950/85 border border-rose-500/40 font-mono text-[11px] font-bold text-white flex items-center gap-1.5 backdrop-blur-md shadow-lg">
                <span class="text-[9px] uppercase text-slate-300 hidden sm:inline">JUGADORES:</span>
                <span id="bridge-3d-hearts-wrap" class="inline-flex items-center gap-0.5"></span>
              </div>
              <span id="bridge-3d-step-pill" class="px-2.5 py-1 rounded-full bg-slate-950/85 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] sm:text-[11px] font-bold backdrop-blur-md shadow-md">
                PELDAÑO 1 / 12
              </span>
            </div>

            <!-- Instrucción inferior en el visor 3D -->
            <div class="absolute bottom-2 left-2.5 right-2.5 text-center pointer-events-none">
              <span id="bridge-3d-footer-hint" class="inline-block px-3 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/30 text-cyan-200 font-mono text-[10px] sm:text-[11px] backdrop-blur-md">
                Toca un cristal A, B, C, D en el puente 3D o elige tu respuesta abajo
              </span>
            </div>
          </div>

          <!-- Panel de Caso Clínico, Comodines y Opciones de Salto -->
          <div id="bridge-side-panel" class="lg:col-span-6 flex flex-col justify-between space-y-3 sm:space-y-4"></div>

        </div>
      </div>
    `;

    this.bindBridgeCanvasEvents();
    this.updateGlassBridgeDOM();
  }

  bindBridgeCanvasEvents() {
    const canvas = document.getElementById('squid-bridge-canvas');
    if (!canvas) return;

    const getCanvasPos = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
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

  updateGlassBridgeDOM() {
    const st = this.bridgeState;
    if (!st) return;

    const hudBar = document.getElementById('bridge-hud-bar');
    const sidePanel = document.getElementById('bridge-side-panel');
    const stepPill = document.getElementById('bridge-3d-step-pill');
    const hearts3DWrap = document.getElementById('bridge-3d-hearts-wrap');
    const playerNum3D = document.getElementById('bridge-3d-player-num');

    const globalStepNum = st.globalStepOffset + st.currentStep + 1;
    const globalGoalNum = st.globalStepOffset + st.totalSteps;

    if (stepPill) {
      stepPill.textContent = st.isVictory
        ? `★ PUENTE NIVEL ${st.bridgeLevel} LOGRADO`
        : `NIVEL ${st.bridgeLevel} • PELDAÑO ${globalStepNum}/${globalGoalNum}`;
    }
    if (hearts3DWrap) {
      hearts3DWrap.innerHTML = this.renderLivesHearts(st.lives, 3);
    }
    if (playerNum3D) {
      playerNum3D.textContent = st.anim.playerNumber;
    }

    const q = st.questions[Math.min(st.currentStep, st.totalSteps - 1)];
    const arcStats = Storage.getArcadeStats();
    const maxGlassStreak = Math.max(arcStats.bridgeBestStreak || 0, arcStats.bridgeBestStep || 0, st.streak);

    if (hudBar) {
      hudBar.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-black">JUGADOR #${st.anim.playerNumber}</span>
            <div>
              <span class="font-display font-bold text-xs sm:text-base block leading-tight">
                ${st.isVictory ? `¡Puente Nivel ${st.bridgeLevel} Logrado!` : `Peldaño #${globalStepNum} • Racha actual: ${st.streak} vidrios`}
              </span>
              <span class="font-mono text-[11px] text-emerald-400">${q.especialidad || 'Medicina CACES'} ${q.subtema ? `• ${q.subtema}` : ''}</span>
            </div>
          </div>

          <div class="flex items-center gap-4 sm:gap-6">
            <div class="text-right font-mono">
              <span class="text-[10px] text-slate-400 uppercase block">Racha Máx. Vidrios</span>
              <span class="text-sm sm:text-base font-black text-amber-400">${maxGlassStreak} seguidos</span>
            </div>
            <div class="text-right font-mono">
              <span class="text-[10px] text-slate-400 uppercase block">Puentes Logrados</span>
              <span class="text-sm sm:text-base font-black text-emerald-400">${arcStats.bridgeWins || 0}</span>
            </div>
          </div>
        </div>
      `;
    }

    if (!sidePanel) return;

    // Pantalla de Fin de Puente (Victoria con botón SEGUIR EN RACHA o Eliminación)
    if (st.isVictory || st.isGameOver) {
      const arcStats = Storage.getArcadeStats();
      const bestStreakSaved = Math.max(arcStats.bridgeBestStreak || 0, arcStats.bridgeBestStep || 0);
      const nextLevel = (st.bridgeLevel || 1) + 1;
      const nextStartStep = st.globalStepOffset + st.totalSteps + 1;
      const nextEndStep = nextStartStep + st.totalSteps - 1;
      const reachedStep = st.isVictory ? (st.globalStepOffset + st.totalSteps) : (st.globalStepOffset + st.currentStep);

      sidePanel.innerHTML = `
        <div class="my-auto p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border-2 ${st.isVictory ? 'border-emerald-500/60' : 'border-rose-500/40'} text-center space-y-4">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs font-black uppercase ${
            st.isVictory ? 'bg-amber-400 text-slate-950' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }">
            ${st.isVictory ? `★ ¡PUENTE NIVEL ${st.bridgeLevel} LOGRADO!` : '✕ ELIMINADO EN EL PUENTE DE CRISTAL'}
          </div>

          <h3 class="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            ${st.isVictory ? `¡Cruzaste hasta el Peldaño #${reachedStep}!` : `Tus 3 jugadores cayeron en el Peldaño #${reachedStep + 1}`}
          </h3>

          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            ${st.isVictory
              ? `Sumaste +1 puente logrado y recargaste +1 comodín 50/50 y +1 Canica. ¡Continúa hacia el Nivel ${nextLevel} (Peldaños ${nextStartStep} al ${nextEndStep}) conservando tu racha de ${st.streak} vidrios!`
              : 'Tu racha máxima en los vidrios y tus puentes logrados ya quedaron registrados en el Ranking de Juegos.'}
          </p>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span class="font-mono text-[10px] uppercase text-slate-400 block">Racha Máxima en Vidrios</span>
              <span class="font-mono font-black text-lg text-amber-500">${bestStreakSaved} vidrios</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span class="font-mono text-[10px] uppercase text-slate-400 block">Total Puentes Logrados</span>
              <span class="font-mono font-black text-lg text-emerald-500">${arcStats.bridgeWins || 0} puentes</span>
            </div>
          </div>

          <div class="flex flex-col gap-2.5 pt-2">
            ${st.isVictory ? `
              <button type="button" id="btn-bridge-continue-streak" class="bto-btn w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-display font-extrabold text-base border-transparent shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2">
                <span>Continuar Racha • Nivel ${nextLevel} (Peldaño ${nextStartStep} al ${nextEndStep}) →</span>
              </button>
            ` : ''}
            <div class="flex flex-col sm:flex-row gap-2.5">
              <button type="button" id="btn-bridge-restart" class="bto-btn flex-1 py-3.5 px-5 rounded-2xl ${st.isVictory ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 shadow-lg shadow-rose-500/25'} font-display font-extrabold text-xs sm:text-sm border-transparent">
                ${st.isVictory ? 'Reiniciar desde Peldaño 1' : 'Intentar de Nuevo (#456)'}
              </button>
              <button type="button" id="btn-bridge-switch-hangman" class="bto-btn py-3.5 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 font-display font-bold text-xs">
                Ir a Ahorcado →
              </button>
            </div>
          </div>
        </div>
      `;

      sidePanel.querySelector('#btn-bridge-continue-streak')?.addEventListener('click', () => {
        this.playTone('correct');
        this.continueBridgeStreakRound();
      });
      sidePanel.querySelector('#btn-bridge-restart')?.addEventListener('click', () => {
        this.playTone('beep');
        this.startGlassBridgeGame(null);
      });
      sidePanel.querySelector('#btn-bridge-switch-hangman')?.addEventListener('click', () => {
        this.currentMode = 'hangman';
        this.leaderboardTab = 'hangman';
        this.renderModeSelectorCards();
        this.startHangmanGame();
        this.renderArcadeLeaderboard();
      });
      return;
    }

    const options = Array.isArray(q.opciones) ? q.opciones : [];
    const hintText = q.perla_caces || q.justificacion || q.por_que_es || `Guía Clínica MSP (${q.especialidad || 'CACES'}): Identifica el dato pivote antes de saltar al vidrio.`;

    sidePanel.innerHTML = `
      <div class="space-y-3 sm:space-y-3.5">
        <!-- Comodines del Puente -->
        <div class="grid grid-cols-3 gap-2">
          <button type="button" id="btn-power-eye" ${st.powerups.glassmakerEye <= 0 || st.awaitingNextStep || st.isAnimatingJump || st.brokenOptionsInCurrentStep.size >= 2 ? 'disabled' : ''} class="bto-btn p-2 sm:p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-center disabled:opacity-40" title="Rompe 2 vidrios falsos en el puente 3D">
            <span class="font-mono text-[11px] font-bold text-sky-500 flex items-center gap-1">${SVG_ICONS.eye} 50/50</span>
            <span class="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 font-mono text-[10px] font-black">x${st.powerups.glassmakerEye}</span>
          </button>

          <button type="button" id="btn-power-marble" ${st.powerups.marbleHint <= 0 || st.hintRevealedInCurrentStep || st.awaitingNextStep || st.isAnimatingJump ? 'disabled' : ''} class="bto-btn p-2 sm:p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-center disabled:opacity-40" title="Revela la pista clínica del caso">
            <span class="font-mono text-[11px] font-bold text-amber-500 flex items-center gap-1">${SVG_ICONS.sparkle} Pista</span>
            <span class="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono text-[10px] font-black">x${st.powerups.marbleHint}</span>
          </button>

          <button type="button" id="btn-power-shield" ${st.powerups.temperedShield <= 0 || st.shieldActiveInCurrentStep || st.awaitingNextStep || st.isAnimatingJump ? 'disabled' : ''} class="bto-btn p-2 sm:p-2.5 rounded-2xl ${st.shieldActiveInCurrentStep ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'} flex items-center justify-center gap-1.5 text-center disabled:opacity-40" title="Evita caer al vacío si eliges un vidrio falso">
            <span class="font-mono text-[11px] font-bold text-emerald-500 flex items-center gap-1">${SVG_ICONS.shield} ${st.shieldActiveInCurrentStep ? 'Activo' : 'Escudo'}</span>
            <span class="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-black">x${st.powerups.temperedShield}</span>
          </button>
        </div>

        <!-- Panel de Avance tras el Salto (Visible arriba en móvil para avanzar sin bajar) -->
        ${st.awaitingNextStep ? `
          <div class="p-3.5 sm:p-4 rounded-2xl ${st.lastJumpOutcome === 'correct' ? 'bg-emerald-500/15 border-2 border-emerald-500/50' : 'bg-rose-500/15 border-2 border-rose-500/50'} space-y-2 shadow-lg">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <b class="font-mono uppercase block ${st.lastJumpOutcome === 'correct' ? 'text-emerald-500' : 'text-rose-400'}">
                  ${st.lastJumpOutcome === 'correct' ? '✓ ¡Salto firme en Vidrio Templado!' : `✕ ¡El vidrio estalló! El jugador #${st.anim.playerNumber} tomó el relevo y avanzó.`}
                </b>
                ${this.formatMd(hintText)}
              </div>
              <button type="button" id="btn-bridge-next-step" class="bto-btn px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-extrabold text-xs sm:text-sm border-transparent shrink-0 shadow-md">
                ${st.currentStep + 1 >= st.totalSteps ? '¡Saltar a la Meta! →' : `Siguiente Peldaño (${st.currentStep + 2}/${st.totalSteps}) →`}
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Enunciado de la Pregunta -->
        <div class="p-3.5 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 max-h-40 sm:max-h-52 overflow-y-auto">
          <div class="clinical-prose text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            ${this.formatMd(q.enunciado || '')}
          </div>
          ${q.pregunta ? `<p class="font-display font-bold text-xs sm:text-base text-emerald-600 dark:text-emerald-400">${this.formatMd(q.pregunta)}</p>` : ''}

          ${st.hintRevealedInCurrentStep ? `
            <div class="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-300">
              <b class="font-mono uppercase">Pista del Vidriero:</b> ${this.formatMd(hintText.substring(0, 200) + (hintText.length > 200 ? '...' : ''))}
            </div>
          ` : ''}
        </div>

        <!-- Tarjetas de los 4 Cristales (Sincronizadas con el Puente 3D) -->
        <div class="grid grid-cols-1 gap-2">
          ${options.map((opt, idx) => {
            const isBroken = st.brokenOptionsInCurrentStep.has(opt.id);
            const isCorrectOpt = opt.id === q.correcta;

            let cardCls = 'bg-gradient-to-r from-cyan-500/10 via-slate-900/20 to-sky-500/10 border border-cyan-500/40 hover:border-emerald-400 text-slate-900 dark:text-white';
            let badgeHtml = `<span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-mono text-[10px] font-bold">SALTAR →</span>`;

            if (isBroken) {
              cardCls = 'bg-rose-950/25 border border-dashed border-rose-500/40 opacity-45 line-through text-rose-400 pointer-events-none';
              badgeHtml = `<span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold">ROTO</span>`;
            } else if (st.awaitingNextStep && isCorrectOpt) {
              cardCls = 'bg-emerald-500/20 border-2 border-emerald-400 text-slate-900 dark:text-white';
              badgeHtml = `<span class="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[10px] font-black">TEMPLADO ✓</span>`;
            }

            return `
              <button type="button" data-bridge-option="${opt.id}" data-bridge-lane="${idx}" ${isBroken || st.awaitingNextStep || st.isAnimatingJump ? 'disabled' : ''} class="bridge-tile-btn p-3 sm:p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-2.5 ${cardCls}">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="w-7 h-7 rounded-lg bg-slate-900 text-cyan-300 border border-cyan-500/40 font-mono font-black text-xs flex items-center justify-center shrink-0">${opt.id}</span>
                  <span class="text-xs sm:text-sm font-medium leading-snug">${this.formatMd(opt.texto || opt.text || '')}</span>
                </div>
                <div class="shrink-0">${badgeHtml}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Conectar hover de tarjetas con las baldosas del puente 3D
    sidePanel.querySelectorAll('[data-bridge-option]').forEach(btn => {
      const laneIdx = parseInt(btn.getAttribute('data-bridge-lane'), 10);
      btn.addEventListener('mouseenter', () => {
        if (this.bridgeState) this.bridgeState.anim.hoveredLane = laneIdx;
      });
      btn.addEventListener('mouseleave', () => {
        if (this.bridgeState) this.bridgeState.anim.hoveredLane = -1;
      });
      btn.addEventListener('click', () => {
        const chosenId = btn.getAttribute('data-bridge-option');
        this.handleBridgeJump(chosenId);
      });
    });

    // Comodín 1: Ojo del Vidriero (50/50 rompe 2 vidrios falsos en el puente 3D con fragmentos)
    sidePanel.querySelector('#btn-power-eye')?.addEventListener('click', () => {
      if (st.powerups.glassmakerEye <= 0 || st.awaitingNextStep || st.isAnimatingJump) return;
      const wrongIds = options.map(o => o.id).filter(id => id !== q.correcta && !st.brokenOptionsInCurrentStep.has(id));
      wrongIds.slice(0, 2).forEach(id => {
        st.brokenOptionsInCurrentStep.add(id);
        const lIdx = this.laneIndexForOption(id);
        st.tiles[st.currentStep][lIdx] = 'broken';
        this.spawnGlassShards3D(st.currentStep, lIdx, 26);
      });
      st.powerups.glassmakerEye -= 1;
      this.playTone('glass_shatter');
      this.updateGlassBridgeDOM();
    });

    // Comodín 2: Canica de Prueba
    sidePanel.querySelector('#btn-power-marble')?.addEventListener('click', () => {
      if (st.powerups.marbleHint <= 0 || st.hintRevealedInCurrentStep || st.awaitingNextStep || st.isAnimatingJump) return;
      st.hintRevealedInCurrentStep = true;
      st.powerups.marbleHint -= 1;
      this.playTone('beep');
      this.updateGlassBridgeDOM();
    });

    // Comodín 3: Escudo Templado
    sidePanel.querySelector('#btn-power-shield')?.addEventListener('click', () => {
      if (st.powerups.temperedShield <= 0 || st.shieldActiveInCurrentStep || st.awaitingNextStep || st.isAnimatingJump) return;
      st.shieldActiveInCurrentStep = true;
      st.powerups.temperedShield -= 1;
      this.playTone('beep');
      this.updateGlassBridgeDOM();
    });

    sidePanel.querySelector('#btn-bridge-next-step')?.addEventListener('click', () => {
      this.advanceBridgeStep();
    });
  }

  /**
   * Dispara la animación de salto parabólico de los compañeros de atrás para seguir al líder
   */
  triggerFollowersAdvance(leadTargetRow, now = performance.now()) {
    const st = this.bridgeState;
    if (!st) return;
    const leadLane = st.anim.jumpActive ? st.anim.jumpTargetLane : st.anim.playerLane;
    st.anim.followers.forEach((f, idx) => {
      const slot = this.computeFollowerSlot(idx, leadTargetRow, st.safeLaneHistory, leadLane);
      if (Math.abs(slot.row - f.row) > 0.05 || Math.abs(slot.lane - f.lane) > 0.05) {
        f.hopActive = true;
        f.hopStartTime = now + idx * 95;
        f.hopDuration = 450;
        f.hopStartRow = f.row;
        f.hopStartLane = f.lane;
        f.hopTargetRow = slot.row;
        f.hopTargetLane = slot.lane;
      }
    });
  }

  /**
   * Dispara la animación 3D de salto parabólico del Jugador líder hacia el cristal elegido
   */
  handleBridgeJump(chosenOptionId) {
    const st = this.bridgeState;
    if (!st || st.isAnimatingJump || st.awaitingNextStep || st.isGameOver || st.isVictory) return;

    const q = st.questions[st.currentStep];
    const targetLane = this.laneIndexForOption(chosenOptionId);
    const isCorrect = chosenOptionId === q.correcta;
    const now = performance.now();

    st.isAnimatingJump = true;
    st.anim.jumpActive = true;
    st.anim.isRelayAdvance = false;
    st.anim.jumpStartTime = now;
    st.anim.jumpDuration = 560;
    st.anim.jumpStartRow = st.anim.playerRow;
    st.anim.jumpStartLane = st.anim.playerLane;
    st.anim.jumpTargetRow = st.currentStep;
    st.anim.jumpTargetLane = targetLane;
    st.anim.jumpWillBreak = !isCorrect;
    st.anim.jumpChosenId = chosenOptionId;

    if (!isCorrect) {
      // Pre-generar grietas radiales que aparecen un instante antes de romperse
      st.anim.cracks = Array.from({ length: 9 }, (_, i) => ({
        angle: (i / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
        len: 0.25 + Math.random() * 0.2
      }));
    }

    this.playTone('jump');
    this.updateGlassBridgeDOM();
  }

  /**
   * Se ejecuta cuando los pies del jugador tocan el cristal en 3D
   */
  onBridgeJumpLanded() {
    const st = this.bridgeState;
    if (!st) return;

    const now = performance.now();
    const q = st.questions[st.currentStep];
    const chosenOptionId = st.anim.jumpChosenId;
    const laneIdx = st.anim.jumpTargetLane;
    const isCorrect = !st.anim.jumpWillBreak;

    // Si es el salto de relevo de un compañero que tomó la posta mientras el anterior caía
    if (st.anim.isRelayAdvance) {
      st.anim.isRelayAdvance = false;
      this.playTone('glass_step');
      st.tiles[st.currentStep][laneIdx] = 'safe';
      st.safeLaneHistory[st.currentStep] = laneIdx;
      st.anim.landingSquash = 1.0;
      st.anim.shockwaves.push({
        row: st.currentStep,
        lane: laneIdx,
        radius: 0.08,
        alpha: 1.0
      });
      this.triggerFollowersAdvance(st.currentStep, now);
      st.isAnimatingJump = false;
      st.awaitingNextStep = true;
      st.anim.targetCameraRow = st.currentStep - 0.58;
      this.updateGlassBridgeDOM();
      return;
    }

    if (isCorrect) {
      // ¡Vidrio templado firme!
      this.playTone('glass_step');
      st.tiles[st.currentStep][laneIdx] = 'safe';
      st.safeLaneHistory[st.currentStep] = laneIdx;
      st.anim.landingSquash = 1.0;
      st.anim.shockwaves.push({
        row: st.currentStep,
        lane: laneIdx,
        radius: 0.08,
        alpha: 1.0
      });

      // Los compañeros de atrás avanzan de peldaño siguiendo al líder
      this.triggerFollowersAdvance(st.currentStep, now);

      st.streak += 1;
      const stepBonus = 150 + (st.currentStep * 25) + (st.streak * 20);
      st.score += stepBonus;
      st.lastJumpOutcome = 'correct';
      st.isAnimatingJump = false;
      st.awaitingNextStep = true;
      st.anim.targetCameraRow = st.currentStep - 0.58;

      this.addXP(20, true, false);
      Storage.registerAnswer(q.id || `bridge_${st.currentStep}`, true, null, {
        specialty: q.especialidad || 'Medicina Interna',
        mode: 'study',
        isFirstAttempt: true
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
      this.renderArcadeLeaderboard();
    } else {
      // ¡Vidrio falso! Estalla en pedazos 3D con grietas, fragmentos y polvo de cristal
      this.playTone('glass_shatter');
      st.tiles[st.currentStep][laneIdx] = 'broken';
      st.brokenOptionsInCurrentStep.add(chosenOptionId);
      this.spawnGlassShards3D(st.currentStep, laneIdx, 48);
      st.anim.screenShake = 15;

      // Si tenía Escudo Templado activo, da un salto acrobático de regreso sin caer al abismo
      if (st.shieldActiveInCurrentStep) {
        st.shieldActiveInCurrentStep = false;
        st.anim.playerRow = st.anim.jumpStartRow;
        st.anim.playerLane = st.anim.jumpStartLane;
        st.anim.playerY = 0;
        st.isAnimatingJump = false;
        this.updateGlassBridgeDOM();
        return;
      }

      Storage.registerAnswer(q.id || `bridge_${st.currentStep}`, false, chosenOptionId, {
        specialty: q.especialidad || 'Medicina Interna',
        mode: 'study',
        isFirstAttempt: true
      });

      // 1. El jugador que pisó el vidrio falso empieza a caer al vacío girando en 3D
      st.anim.fallingActors.push({
        num: st.anim.playerNumber,
        row: st.currentStep,
        lane: laneIdx,
        y: 0,
        scale: 1,
        rot: 0,
        vx: (Math.random() - 0.5) * 0.012,
        vz: 0.006,
        startTime: now,
        duration: 1250
      });

      st.lives -= 1;
      st.streak = 0;
      st.lastJumpOutcome = 'wrong';

      const safeLane = this.laneIndexForOption(q.correcta);
      st.tiles[st.currentStep][safeLane] = 'safe';
      st.safeLaneHistory[st.currentStep] = safeLane;

      if (st.lives <= 0) {
        // Si era el último jugador (#100), esperar a que caiga al abismo para mostrar Game Over
        setTimeout(() => {
          if (!this.bridgeState) return;
          st.isAnimatingJump = false;
          st.isGameOver = true;
          Storage.saveArcadeStats({
            bridgeHighScore: st.score,
            bridgeBestStep: st.globalStepOffset + st.currentStep
          });
          this.updateHUD();
          this.renderModeSelectorCards();
          this.updateGlassBridgeDOM();
          this.renderArcadeLeaderboard();
        }, 980);
      } else {
        // 2. ¡ANTES DE QUE TERMINE DE CAER! El jugador de atrás salta inmediatamente al vidrio seguro y continúa
        const nextFollower = st.anim.followers.shift();
        const relayStartRow = nextFollower ? nextFollower.row : Math.max(-1.05, st.currentStep - 1);
        const relayStartLane = nextFollower ? nextFollower.lane : 1.5;
        const nextLeadNum = nextFollower ? nextFollower.num : (st.lives === 2 ? '058' : '100');

        st.anim.playerNumber = nextLeadNum;
        st.anim.playerRow = relayStartRow;
        st.anim.playerLane = relayStartLane;
        st.anim.playerY = 0;
        st.anim.playerScale = 1;
        st.anim.playerRotation = 0;

        setTimeout(() => {
          if (!this.bridgeState || st.isGameOver) return;
          const jumpNow = performance.now();
          this.playTone('jump');
          st.anim.jumpActive = true;
          st.anim.isRelayAdvance = true;
          st.anim.jumpStartTime = jumpNow;
          st.anim.jumpDuration = 540;
          st.anim.jumpStartRow = relayStartRow;
          st.anim.jumpStartLane = relayStartLane;
          st.anim.jumpTargetRow = st.currentStep;
          st.anim.jumpTargetLane = safeLane;
          st.anim.jumpWillBreak = false;
          st.anim.jumpChosenId = q.correcta;
          st.anim.targetCameraRow = st.currentStep - 0.58;
          this.triggerFollowersAdvance(st.currentStep, jumpNow + 80);
          this.updateGlassBridgeDOM();
        }, 160);
      }
    }
  }

  advanceBridgeStep() {
    const st = this.bridgeState;
    if (!st || st.isAnimatingJump) return;

    if (st.currentStep + 1 >= st.totalSteps) {
      // Salto final a la Plataforma Roja de Meta frente a los Guardias
      const now = performance.now();
      st.isAnimatingJump = true;
      st.anim.jumpActive = true;
      st.anim.isRelayAdvance = false;
      st.anim.jumpStartTime = now;
      st.anim.jumpDuration = 600;
      st.anim.jumpStartRow = st.anim.playerRow;
      st.anim.jumpStartLane = st.anim.playerLane;
      st.anim.jumpTargetRow = st.totalSteps + 0.35;
      st.anim.jumpTargetLane = 1.5;
      st.anim.jumpWillBreak = false;
      st.anim.jumpChosenId = 'GOAL';
      st.anim.targetCameraRow = st.totalSteps - 2.1;
      this.triggerFollowersAdvance(st.totalSteps, now + 90);
      this.playTone('jump');

      setTimeout(() => {
        if (!this.bridgeState) return;
        st.isAnimatingJump = false;
        st.isVictory = true;
        st.score += 1500;
        this.playTone('correct');
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
        this.renderArcadeLeaderboard();
      }, 650);
      return;
    }

    st.currentStep += 1;
    st.brokenOptionsInCurrentStep = new Set();
    st.hintRevealedInCurrentStep = false;
    st.shieldActiveInCurrentStep = false;
    st.awaitingNextStep = false;
    st.lastJumpOutcome = null;
    st.anim.targetCameraRow = st.currentStep - 0.88;
    this.updateGlassBridgeDOM();
  }

  spawnGlassShards3D(row, lane, count = 48) {
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
        vx: (Math.random() - 0.5) * 0.048,
        vy: 0.015 - Math.random() * 0.055,
        vz: (Math.random() - 0.5) * 0.035,
        size: 6 + Math.random() * 14,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.34,
        tilt: Math.random() * Math.PI,
        vTilt: (Math.random() - 0.5) * 0.25,
        pts,
        alpha: 1.0
      });
    }
    // Chispas brillantes de polvo de cristal
    for (let s = 0; s < 28; s++) {
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
  // RENDERIZADOR 3D EN PERSPECTIVA A 60FPS (EL PUENTE DE CRISTAL SQUID GAME)
  // =========================================================================
  startGlassBridgeRenderLoop() {
    const loop = (now) => {
      if (this.currentMode !== 'bridge') return;
      const canvas = document.getElementById('squid-bridge-canvas');
      if (canvas && this.bridgeState) {
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

    // 1. Suavizado de cámara avanzando por el puente
    anim.cameraRow += (anim.targetCameraRow - anim.cameraRow) * 0.085;

    // 2. Reducir vibración de pantalla y rebote de aterrizaje
    if (anim.screenShake > 0.2) {
      anim.screenShake *= 0.85;
    } else {
      anim.screenShake = 0;
    }
    if (anim.landingSquash > 0.01) {
      anim.landingSquash *= 0.82;
    } else {
      anim.landingSquash = 0;
    }

    // 3. Animación parabólica de salto del jugador líder
    if (anim.jumpActive) {
      const elapsed = now - anim.jumpStartTime;
      const t = Math.min(1, Math.max(0, elapsed / anim.jumpDuration));
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      anim.playerRow = anim.jumpStartRow + (anim.jumpTargetRow - anim.jumpStartRow) * easeT;
      anim.playerLane = anim.jumpStartLane + (anim.jumpTargetLane - anim.jumpStartLane) * easeT;
      anim.playerY = Math.sin(t * Math.PI) * 1.32;
      anim.playerJumpPhase = t;

      if (t >= 1) {
        anim.jumpActive = false;
        anim.playerRow = anim.jumpTargetRow;
        anim.playerLane = anim.jumpTargetLane;
        anim.playerY = 0;
        anim.playerJumpPhase = 0;
        if (anim.jumpChosenId !== 'GOAL') {
          this.onBridgeJumpLanded();
        }
      }
    }

    // 4. Animación de los compañeros de atrás avanzando de peldaño
    for (const f of (anim.followers || [])) {
      if (f.hopActive) {
        const elapsed = now - f.hopStartTime;
        if (elapsed < 0) continue;
        const t = Math.min(1, elapsed / f.hopDuration);
        const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        f.row = f.hopStartRow + (f.hopTargetRow - f.hopStartRow) * easeT;
        f.lane = f.hopStartLane + (f.hopTargetLane - f.hopStartLane) * easeT;
        f.y = Math.sin(t * Math.PI) * 0.95;
        f.jumpPhase = t;
        if (t >= 1) {
          f.hopActive = false;
          f.row = f.hopTargetRow;
          f.lane = f.hopTargetLane;
          f.y = 0;
          f.jumpPhase = 0;
        }
      }
    }

    // 5. Actualizar jugadores que están cayendo al abismo tras romperse el vidrio
    const fallingActors = anim.fallingActors || [];
    for (let i = fallingActors.length - 1; i >= 0; i--) {
      const fa = fallingActors[i];
      const elapsed = now - fa.startTime;
      const t = Math.min(1, elapsed / fa.duration);
      fa.y = -t * t * 10.5;
      fa.lane += fa.vx;
      fa.row += fa.vz;
      fa.scale = Math.max(0.04, 1 - t * 0.9);
      fa.rot = t * 5.4;
      if (t >= 1) {
        fallingActors.splice(i, 1);
      }
    }

    // 6. Actualizar fragmentos de cristal 3D cayendo al vacío
    for (let i = anim.shards.length - 1; i >= 0; i--) {
      const s = anim.shards[i];
      s.x += s.vx;
      s.y += s.vy;
      s.z += s.vz;
      s.vy -= 0.0052; // Gravedad acelerando hacia el abismo
      s.rot += s.vRot;
      if (s.tilt !== undefined) s.tilt += s.vTilt || 0;
      s.alpha -= 0.014;
      if (s.alpha <= 0) {
        anim.shards.splice(i, 1);
      }
    }

    // 7. Actualizar chispas de vidrio
    const sparks = anim.sparks || [];
    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.z += sp.vz;
      sp.vy -= 0.003;
      sp.alpha -= 0.028;
      if (sp.alpha <= 0) {
        sparks.splice(i, 1);
      }
    }

    // 8. Actualizar ondas de choque en vidrio templado
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
   * Proyecta coordenadas del mundo 3D (x, y, z) a coordenadas 2D del Canvas
   * Adaptado automáticamente a pantallas anchas (móvil sticky) y altas (desktop)
   */
  project3D(x, y, z, canvasW, canvasH, cameraZ) {
    const isCompactMobile = canvasH < canvasW * 0.68;
    const relZ = z - cameraZ + (isCompactMobile ? 2.15 : 2.38);
    const clampedZ = Math.max(0.28, relZ);
    const baseFov = Math.min(canvasW * 0.92, canvasH * (isCompactMobile ? 1.55 : 1.08));
    const scale = baseFov / (clampedZ * 1.26 + 0.98);

    const horizonY = canvasH * (isCompactMobile ? 0.16 : 0.22);
    const cameraHeight = isCompactMobile ? 1.48 : 1.62;

    const screenX = canvasW * 0.5 + x * scale * 0.58;
    const screenY = horizonY + (cameraHeight - y) * scale * (isCompactMobile ? 0.44 : 0.49);
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

    // 1. Fondo atmosférico profundo estilo Squid Game (abismo violeta-negro con neblina volumétrica)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#07020c');
    bgGrad.addColorStop(0.28, '#170726');
    bgGrad.addColorStop(0.65, '#1e0b2e');
    bgGrad.addColorStop(1, '#050109');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Haces de luz volumétricos cenitales sobre el puente
    const beamGrad = ctx.createRadialGradient(W * 0.5, H * 0.18, 8, W * 0.5, H * 0.45, Math.max(W, H) * 0.65);
    beamGrad.addColorStop(0, 'rgba(244, 63, 94, 0.22)');
    beamGrad.addColorStop(0.42, 'rgba(56, 189, 248, 0.08)');
    beamGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 0, W, H);

    const camZ = anim.cameraRow;

    // Partículas de polvo flotando en el abismo iluminado
    (anim.dustMotes || []).forEach((m, idx) => {
      const mz = ((m.z - camZ * 0.35) % 12 + 12) % 12 + camZ - 1;
      const mp = this.project3D(m.x, m.y + Math.sin(now * m.speed + m.phase) * 0.25, mz, W, H, camZ);
      const alpha = 0.15 + 0.15 * Math.sin(now * 0.003 + idx);
      ctx.fillStyle = `rgba(248, 250, 252, ${alpha})`;
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, Math.max(0.8, m.r * (mp.scale / 140)), 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Torres laterales de ladrillo oscuro con Guardias vigilando en lo alto
    this.drawSideTowersAndGuards(ctx, W, H, camZ);

    // 3. Plataforma Roja Final + Escaleras Grises + Puerta en Arco + 2 Guardias Rosas
    this.drawGoalPlatformAndDoorway(ctx, W, H, camZ, st.totalSteps);

    // 4. Jugadores que están cayendo al abismo (se dibujan debajo del nivel de las vigas/baldosas para que pasen por el hueco)
    (anim.fallingActors || []).forEach(fa => {
      if (fa.y < -0.35) {
        this.drawSquidPlayer3D(
          ctx,
          W,
          H,
          camZ,
          (fa.lane - 1.5) * 0.94,
          fa.y,
          fa.row,
          fa.num,
          fa.scale,
          fa.rot,
          false,
          now,
          0,
          0,
          true
        );
      }
    });

    // 5. Vigas de acero blancas, doble riel rojo central y bombillos de feria luminosos
    this.drawBridgeRailsAndLights(ctx, W, H, camZ, st.totalSteps, now);

    // 6. Dibujar filas de baldosas de cristal 3D de atrás hacia adelante (Z-order)
    anim.tileHitRegions = [];
    for (let r = st.totalSteps - 1; r >= 0; r--) {
      if (r - camZ < -1.8) continue;
      this.drawBridgeRowTiles(ctx, W, H, camZ, r, now);
    }

    // 7. Dibujar Plataforma Verde de Salida con grosor 3D
    if (-0.5 - camZ > -2.1) {
      this.drawStartingGreenPlatform(ctx, W, H, camZ);
    }

    // 8. Dibujar Fragmentos 3D de Vidrio Roto y Chispas cayendo al vacío
    this.drawFallingShards(ctx, W, H, camZ);

    // 9. Dibujar compañeros de atrás primero (con apertura lateral automática y menor escala)
    // y SIEMPRE dibujar al Jugador Principal al final para que jamás sea tapado
    const leadWorldX = (anim.playerLane - 1.5) * 0.94;
    const renderActors = [];

    // Compañeros de atrás (#058, #100) abiertos en V y nunca sobre el eje visual del líder
    (anim.followers || []).forEach((f, idx) => {
      let fWorldX = (f.lane - 1.5) * 0.94;
      if (!st.isGameOver && Math.abs(fWorldX - leadWorldX) < 0.78) {
        const pushDir = idx === 0 ? 1 : -1;
        fWorldX = leadWorldX + pushDir * 0.85;
      }
      renderActors.push({
        worldX: fWorldX,
        worldY: (f.y || 0) - 0.06,
        worldZ: f.row,
        num: f.num,
        scale: 0.76,
        rot: 0,
        shield: false,
        jumpPhase: f.jumpPhase || 0,
        squash: 0,
        falling: false,
        isLead: false
      });
    });

    // Jugadores recién iniciando la caída (aún cerca de la superficie)
    (anim.fallingActors || []).forEach(fa => {
      if (fa.y >= -0.35) {
        renderActors.push({
          worldX: (fa.lane - 1.5) * 0.94,
          worldY: fa.y,
          worldZ: fa.row,
          num: fa.num,
          scale: fa.scale,
          rot: fa.rot,
          shield: false,
          jumpPhase: 0,
          squash: 0,
          falling: true,
          isLead: false
        });
      }
    });

    // Jugador Líder (#456 o relevo): prioridad visual absoluta en primer plano
    if (!st.isGameOver) {
      renderActors.push({
        worldX: leadWorldX,
        worldY: anim.playerY,
        worldZ: anim.playerRow,
        num: anim.playerNumber,
        scale: anim.playerScale,
        rot: anim.playerRotation,
        shield: st.shieldActiveInCurrentStep,
        jumpPhase: anim.playerJumpPhase || 0,
        squash: anim.landingSquash || 0,
        falling: false,
        isLead: true
      });
    }

    renderActors.sort((a, b) => {
      if (a.isLead !== b.isLead) return a.isLead ? 1 : -1;
      return b.worldZ - a.worldZ;
    });
    renderActors.forEach(act => {
      this.drawSquidPlayer3D(
        ctx,
        W,
        H,
        camZ,
        act.worldX,
        act.worldY,
        act.worldZ,
        act.num,
        act.scale,
        act.rot,
        act.shield,
        now,
        act.jumpPhase,
        act.squash,
        act.falling
      );
    });

    ctx.restore();
  }

  drawSideTowersAndGuards(ctx, W, H, camZ) {
    const towerZ = Math.max(camZ + 6.2, 7.2);
    [-3.35, 3.35].forEach(tx => {
      const top = this.project3D(tx, 0.85, towerZ, W, H, camZ);
      const bot = this.project3D(tx, -6.5, towerZ, W, H, camZ);
      const w = 38 * (top.scale / 100);
      const sideW = w * 0.35;

      // Cara frontal iluminada de la columna
      const grad = ctx.createLinearGradient(top.x - w, top.y, top.x + w, bot.y);
      grad.addColorStop(0, '#6b271f');
      grad.addColorStop(0.5, '#451712');
      grad.addColorStop(1, '#160605');
      ctx.fillStyle = grad;
      ctx.fillRect(top.x - w, top.y, w * 2, bot.y - top.y);

      // Cara lateral 3D en sombra hacia el interior del puente
      ctx.fillStyle = '#260c09';
      if (tx < 0) {
        ctx.fillRect(top.x + w, top.y, sideW, bot.y - top.y);
      } else {
        ctx.fillRect(top.x - w - sideW, top.y, sideW, bot.y - top.y);
      }

      // Cornisa superior 3D
      ctx.fillStyle = '#7f2f25';
      ctx.fillRect(top.x - w * 1.08, top.y - 4, w * 2.16, 6);

      // Guardia rosa en la cima de cada torre
      this.drawPinkGuardFigure(ctx, top.x, top.y - 2, top.scale * 0.72, tx < 0 ? 'triangle' : 'square');
    });
  }

  drawGoalPlatformAndDoorway(ctx, W, H, camZ, totalSteps) {
    const zStart = totalSteps - 0.35;
    const zEnd = totalSteps + 1.85;

    const pFL = this.project3D(-2.1, 0, zStart, W, H, camZ);
    const pFR = this.project3D(2.1, 0, zStart, W, H, camZ);
    const pBR = this.project3D(2.1, 0, zEnd, W, H, camZ);
    const pBL = this.project3D(-2.1, 0, zEnd, W, H, camZ);

    const pFL_bot = this.project3D(-2.1, -0.22, zStart, W, H, camZ);
    const pFR_bot = this.project3D(2.1, -0.22, zStart, W, H, camZ);

    // Canto frontal 3D de la plataforma roja
    ctx.beginPath();
    ctx.moveTo(pFL.x, pFL.y);
    ctx.lineTo(pFR.x, pFR.y);
    ctx.lineTo(pFR_bot.x, pFR_bot.y);
    ctx.lineTo(pFL_bot.x, pFL_bot.y);
    ctx.closePath();
    ctx.fillStyle = '#450a0a';
    ctx.fill();

    // Superficie de la Plataforma Roja de Meta con gradiente
    const platGrad = ctx.createLinearGradient(0, pBR.y, 0, pFL.y);
    platGrad.addColorStop(0, '#7f1d1d');
    platGrad.addColorStop(1, '#b91c1c');
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

    // Escaleras grises 3D al fondo de la plataforma roja
    const stairSteps = 6;
    for (let s = 0; s < stairSteps; s++) {
      const sz = zEnd + s * 0.25;
      const sy = s * 0.22;
      const sL = this.project3D(-1.42, sy, sz, W, H, camZ);
      const sR = this.project3D(1.42, sy, sz, W, H, camZ);
      const sH = Math.max(3.5, 7 * (sL.scale / 100));
      ctx.fillStyle = s % 2 === 0 ? '#52525b' : '#3f3f46';
      ctx.fillRect(sL.x, sL.y - sH, sR.x - sL.x, sH);
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(sL.x, sL.y - sH, sR.x - sL.x, sH);
    }

    // Arco de Salida icónico en la cima de las escaleras (como en la imagen de referencia)
    const doorZ = zEnd + stairSteps * 0.25 + 0.2;
    const doorBaseY = stairSteps * 0.22;
    const dCenter = this.project3D(0, doorBaseY, doorZ, W, H, camZ);
    const dW = 76 * (dCenter.scale / 100);
    const dH = 122 * (dCenter.scale / 100);

    // Marco exterior biselado de piedra gris
    const archGrad = ctx.createLinearGradient(dCenter.x - dW, dCenter.y - dH, dCenter.x + dW, dCenter.y);
    archGrad.addColorStop(0, '#52525b');
    archGrad.addColorStop(1, '#27272a');
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
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Interior profundo del portal
    const innerW = dW * 0.72;
    const innerH = dH * 0.85;
    const portalGrad = ctx.createLinearGradient(dCenter.x, dCenter.y - innerH, dCenter.x, dCenter.y);
    portalGrad.addColorStop(0, '#090514');
    portalGrad.addColorStop(1, '#1e1035');
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

    // Dos Guardias Rosas custodiando el inicio de las escaleras
    const gLeft = this.project3D(-1.05, 0, zEnd - 0.15, W, H, camZ);
    const gRight = this.project3D(1.05, 0, zEnd - 0.15, W, H, camZ);
    this.drawPinkGuardFigure(ctx, gLeft.x, gLeft.y, gLeft.scale * 0.92, 'circle');
    this.drawPinkGuardFigure(ctx, gRight.x, gRight.y, gRight.scale * 0.92, 'triangle');
  }

  drawPinkGuardFigure(ctx, x, y, scale, maskShape = 'circle') {
    const s = Math.max(0.2, scale / 108);
    // Sombra elíptica
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(x, y, 11 * s, 4.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Piernas y Torso con volumen 3D (Traje carmesí/rosa Squid Game)
    const suitGrad = ctx.createLinearGradient(x - 9 * s, y - 44 * s, x + 9 * s, y);
    suitGrad.addColorStop(0, '#f43f5e');
    suitGrad.addColorStop(0.55, '#e11d48');
    suitGrad.addColorStop(1, '#881337');
    ctx.fillStyle = suitGrad;
    ctx.fillRect(x - 6 * s, y - 22 * s, 5 * s, 22 * s);
    ctx.fillRect(x + 1 * s, y - 22 * s, 5 * s, 22 * s);
    ctx.beginPath();
    ctx.roundRect(x - 8.5 * s, y - 43 * s, 17 * s, 23 * s, 4.5 * s);
    ctx.fill();

    // Cinturón y arnés negro
    ctx.fillStyle = '#09090b';
    ctx.fillRect(x - 8.5 * s, y - 25 * s, 17 * s, 3.2 * s);
    ctx.fillRect(x - 1.2 * s, y - 42 * s, 2.4 * s, 17 * s);

    // Capucha rosa y máscara negra 3D
    ctx.fillStyle = suitGrad;
    ctx.beginPath();
    ctx.arc(x, y - 51 * s, 9.5 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(x, y - 51 * s, 7.3 * s, 0, Math.PI * 2);
    ctx.fill();

    // Símbolo blanco nítido en la máscara (○ △ □)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.2, 1.8 * s);
    ctx.beginPath();
    if (maskShape === 'circle') {
      ctx.arc(x, y - 51 * s, 3.6 * s, 0, Math.PI * 2);
    } else if (maskShape === 'triangle') {
      ctx.moveTo(x, y - 55 * s);
      ctx.lineTo(x - 4.2 * s, y - 48 * s);
      ctx.lineTo(x + 4.2 * s, y - 48 * s);
      ctx.closePath();
    } else {
      ctx.rect(x - 3.4 * s, y - 54.4 * s, 6.8 * s, 6.8 * s);
    }
    ctx.stroke();
  }

  drawBridgeRailsAndLights(ctx, W, H, camZ, totalSteps, now) {
    const zNear = Math.max(-0.7, camZ - 0.85);
    const zFar = totalSteps - 0.35;

    // 1. Franja/Viga Roja Central (idéntica a la imagen de referencia con bordes blancos)
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

    // 2. Rieles metálicos de soporte con profundidad 3D
    const railXs = [-1.96, -0.98, -0.12, 0.12, 0.98, 1.96];
    railXs.forEach((rx, idx) => {
      const pTop1 = this.project3D(rx, -0.015, zNear, W, H, camZ);
      const pTop2 = this.project3D(rx, -0.015, zFar, W, H, camZ);
      const pBot1 = this.project3D(rx, -0.11, zNear, W, H, camZ);
      const pBot2 = this.project3D(rx, -0.11, zFar, W, H, camZ);

      // Alma inferior oscura de la viga de acero
      ctx.beginPath();
      ctx.moveTo(pTop1.x, pTop1.y);
      ctx.lineTo(pTop2.x, pTop2.y);
      ctx.lineTo(pBot2.x, pBot2.y);
      ctx.lineTo(pBot1.x, pBot1.y);
      ctx.closePath();
      ctx.fillStyle = (idx === 2 || idx === 3) ? '#881337' : '#334155';
      ctx.fill();

      // Riel superior blanco brillante
      ctx.beginPath();
      ctx.moveTo(pTop1.x, pTop1.y);
      ctx.lineTo(pTop2.x, pTop2.y);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = (idx === 0 || idx === 5) ? 4.2 : 2.2;
      ctx.stroke();
    });

    // 3. Bombillos de feria de colores vibrantes en los bordes exteriores (como en la imagen)
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

        // Núcleo blanco incandescente del bombillo
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

    // Travesaño metálico transversal oscuro bajo cada fila
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

      // Puntos del espesor inferior del cristal (grosor 3D)
      const pFL_b = this.project3D(xCenter - halfW, -0.045, zFront, W, H, camZ);
      const pFR_b = this.project3D(xCenter + halfW, -0.045, zFront, W, H, camZ);

      if (isCurrentTargetRow && tileStatus !== 'broken') {
        st.anim.tileHitRegions.push({
          row: rowIdx,
          lane,
          poly: [pFL, pFR, pBR, pBL]
        });
      }

      // Si el cristal se rompió: dibujar dientes de vidrio roto sujetados a los rieles laterales y el abismo abierto
      if (tileStatus === 'broken') {
        ctx.save();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.38)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.2;

        // Diente de vidrio roto izquierdo
        ctx.beginPath();
        ctx.moveTo(pFL.x, pFL.y);
        ctx.lineTo(pFL.x * 0.78 + pFR.x * 0.22, pFL.y * 0.78 + pFR.y * 0.22);
        ctx.lineTo(pBL.x * 0.85 + pBR.x * 0.15, pBL.y * 0.85 + pBR.y * 0.15);
        ctx.lineTo(pBL.x, pBL.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Diente de vidrio roto derecho
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

      // Canto frontal 3D del cristal (efecto vidrio grueso templado)
      ctx.beginPath();
      ctx.moveTo(pFL.x, pFL.y);
      ctx.lineTo(pFR.x, pFR.y);
      ctx.lineTo(pFR_b.x, pFR_b.y);
      ctx.lineTo(pFL_b.x, pFL_b.y);
      ctx.closePath();
      ctx.fillStyle = tileStatus === 'safe' ? 'rgba(16, 185, 129, 0.65)' : 'rgba(14, 165, 233, 0.48)';
      ctx.fill();

      // Gradiente translúcido realista del panel de cristal (estilo turquesa/cian de la imagen)
      const glassGrad = ctx.createLinearGradient(pFL.x, pFL.y, pBR.x, pBR.y);
      let strokeStyle = 'rgba(186, 230, 253, 0.75)';

      if (tileStatus === 'safe') {
        glassGrad.addColorStop(0, 'rgba(52, 211, 153, 0.55)');
        glassGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.38)');
        glassGrad.addColorStop(1, 'rgba(6, 182, 212, 0.50)');
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

      // Doble reflejo especular diagonal en cada vidrio
      ctx.beginPath();
      ctx.moveTo(pFL.x * 0.78 + pFR.x * 0.22, pFL.y * 0.78 + pFR.y * 0.22);
      ctx.lineTo(pBL.x * 0.48 + pBR.x * 0.52, pBL.y * 0.48 + pBR.y * 0.52);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.lineWidth = Math.max(1.2, 3.6 * (pFL.scale / 135));
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pFL.x * 0.62 + pFR.x * 0.38, pFL.y * 0.62 + pFR.y * 0.38);
      ctx.lineTo(pBL.x * 0.32 + pBR.x * 0.68, pBL.y * 0.32 + pBR.y * 0.68);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = Math.max(0.8, 1.6 * (pFL.scale / 135));
      ctx.stroke();

      // Si el jugador está a punto de romper este cristal, dibujar grietas radiales de tensión
      if (
        st.anim.jumpActive &&
        st.anim.jumpWillBreak &&
        rowIdx === st.anim.jumpTargetRow &&
        lane === st.anim.jumpTargetLane &&
        st.anim.playerJumpPhase > 0.78
      ) {
        const c = this.project3D(xCenter, 0.01, rowIdx, W, H, camZ);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.6;
        (st.anim.cracks || []).forEach(cr => {
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(
            c.x + Math.cos(cr.angle) * cr.len * c.scale * 0.55,
            c.y + Math.sin(cr.angle) * cr.len * c.scale * 0.28
          );
          ctx.stroke();
        });
        ctx.restore();
      }

      // Etiqueta A, B, C, D sobre los 4 cristales del peldaño actual
      if (isCurrentTargetRow || rowIdx === st.currentStep) {
        const center = this.project3D(xCenter, 0.02, rowIdx, W, H, camZ);
        const letter = this.optionForLaneIndex(lane);
        const badgeR = Math.max(9, 13 * (center.scale / 115));
        ctx.save();
        ctx.fillStyle = isHovered ? 'rgba(16, 185, 129, 0.92)' : 'rgba(15, 23, 42, 0.72)';
        ctx.beginPath();
        ctx.arc(center.x, center.y, badgeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#ffffff' : 'rgba(125, 211, 252, 0.8)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.font = `900 ${Math.max(10, Math.round(14 * (center.scale / 115)))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(letter, center.x, center.y + 0.5);
        ctx.restore();
      }
    }

    // Dibujar ondas de impacto en ese peldaño si existen
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
    const zStart = -1.75;
    const zEnd = -0.45;
    const pFL = this.project3D(-2.25, 0, zStart, W, H, camZ);
    const pFR = this.project3D(2.25, 0, zStart, W, H, camZ);
    const pBR = this.project3D(2.25, 0, zEnd, W, H, camZ);
    const pBL = this.project3D(-2.25, 0, zEnd, W, H, camZ);

    const pBL_bot = this.project3D(-2.25, -0.24, zEnd, W, H, camZ);
    const pBR_bot = this.project3D(2.25, -0.24, zEnd, W, H, camZ);

    // Pared vertical 3D del borde de la plataforma verde hacia el abismo
    ctx.beginPath();
    ctx.moveTo(pBL.x, pBL.y);
    ctx.lineTo(pBR.x, pBR.y);
    ctx.lineTo(pBR_bot.x, pBR_bot.y);
    ctx.lineTo(pBL_bot.x, pBL_bot.y);
    ctx.closePath();
    ctx.fillStyle = '#022c22';
    ctx.fill();

    // Superficie verde esmeralda oscura (idéntica a la plataforma de la imagen)
    const greenGrad = ctx.createLinearGradient(0, pBR.y, 0, pFL.y);
    greenGrad.addColorStop(0, '#047857');
    greenGrad.addColorStop(0.5, '#065f46');
    greenGrad.addColorStop(1, '#064e3b');
    ctx.beginPath();
    ctx.moveTo(pFL.x, pFL.y);
    ctx.lineTo(pFR.x, pFR.y);
    ctx.lineTo(pBR.x, pBR.y);
    ctx.lineTo(pBL.x, pBL.y);
    ctx.closePath();
    ctx.fillStyle = greenGrad;
    ctx.fill();
    ctx.strokeStyle = '#10b981';
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

    // Chispas y polvo de cristal
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

  /**
   * Dibuja al Jugador 3D de espaldas estilo muñeco 3D de la imagen de referencia (#456, #058, #100),
   * con articulación de brazos/piernas en salto, squash-and-stretch, sombra dinámica en el suelo y cabeza 3D iluminada.
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
    // 1. Sombra proyectada dinámica sobre la plataforma/vidrio (y = 0)
    if (!isFalling && worldY >= -0.15) {
      const shadowPos = this.project3D(worldX, 0, worldZ, W, H, camZ);
      const heightAttenuation = Math.max(0.28, 1 - worldY * 0.42);
      const shR = Math.max(5, 22 * (shadowPos.scale / 110) * heightAttenuation * extraScale);
      const shGrad = ctx.createRadialGradient(shadowPos.x, shadowPos.y, shR * 0.1, shadowPos.x, shadowPos.y, shR);
      shGrad.addColorStop(0, `rgba(0, 0, 0, ${0.62 * heightAttenuation})`);
      shGrad.addColorStop(0.65, `rgba(0, 0, 0, ${0.28 * heightAttenuation})`);
      shGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.save();
      ctx.fillStyle = shGrad;
      ctx.beginPath();
      ctx.ellipse(shadowPos.x, shadowPos.y, shR, shR * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const idleBob = (worldY === 0 && !isFalling && now > 0) ? Math.sin(now * 0.006 + worldX) * 0.022 : 0;
    const pos = this.project3D(worldX, worldY + idleBob, worldZ, W, H, camZ);
    const s = Math.max(0.16, (pos.scale / 100) * extraScale);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    // Efecto Squash & Stretch en salto y aterrizaje
    const airStretch = jumpPhase > 0 ? Math.sin(jumpPhase * Math.PI) * 0.11 : 0;
    const squashX = 1 - airStretch * 0.5 + landingSquash * 0.14;
    const squashY = 1 + airStretch - landingSquash * 0.14;
    ctx.scale(squashX, squashY);

    // Aura de Escudo Templado si está activo
    if (hasShield) {
      ctx.save();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.arc(0, -36 * s, 34 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Cinemática de piernas y brazos durante el salto o caída
    const jumpArc = jumpPhase > 0 ? Math.sin(jumpPhase * Math.PI) : 0;
    const leftLegLift = isFalling ? 7 * s : jumpArc * 8 * s;
    const rightLegLift = isFalling ? 3 * s : jumpArc * 5.5 * s;
    const armRaise = isFalling ? 0.95 : jumpArc * 0.65;

    // Zapatillas deportivas blancas con suela gris (como en el muñeco 3D de la imagen)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(-7.5 * s, (-1.5 - leftLegLift / s) * s, 6.2 * s, 3.6 * s, -0.1, 0, Math.PI * 2);
    ctx.ellipse(7.5 * s, (-1.5 - rightLegLift / s) * s, 6.2 * s, 3.6 * s, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-7.5 * s, (-2.6 - leftLegLift / s) * s, 5.8 * s, 3.3 * s, -0.1, 0, Math.PI * 2);
    ctx.ellipse(7.5 * s, (-2.6 - rightLegLift / s) * s, 5.8 * s, 3.3 * s, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Piernas del pantalón verde deportivo con sombreado cilíndrico 3D
    const legGradL = ctx.createLinearGradient(-12 * s, -26 * s, -3 * s, -26 * s);
    legGradL.addColorStop(0, '#064e3b');
    legGradL.addColorStop(0.5, '#047857');
    legGradL.addColorStop(1, '#022c22');
    ctx.fillStyle = legGradL;
    ctx.beginPath();
    ctx.roundRect(-11.5 * s, -25 * s - leftLegLift * 0.5, 8.2 * s, 22 * s - leftLegLift * 0.5, 4 * s);
    ctx.fill();

    const legGradR = ctx.createLinearGradient(3 * s, -26 * s, 12 * s, -26 * s);
    legGradR.addColorStop(0, '#022c22');
    legGradR.addColorStop(0.5, '#047857');
    legGradR.addColorStop(1, '#064e3b');
    ctx.fillStyle = legGradR;
    ctx.beginPath();
    ctx.roundRect(3.3 * s, -25 * s - rightLegLift * 0.5, 8.2 * s, 22 * s - rightLegLift * 0.5, 4 * s);
    ctx.fill();

    // Brazos articulados con franja blanca deportiva y manos 3D
    ctx.save();
    ctx.translate(-14.5 * s, -47 * s);
    ctx.rotate(0.14 + armRaise);
    ctx.fillStyle = '#047857';
    ctx.beginPath();
    ctx.roundRect(-5.5 * s, 0, 6.2 * s, 21 * s, 3.2 * s);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-4.6 * s, 2 * s, 1.6 * s, 15 * s);
    // Mano izquierda
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(-2.5 * s, 21.5 * s, 2.8 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(14.5 * s, -47 * s);
    ctx.rotate(-0.14 - armRaise);
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.roundRect(-0.7 * s, 0, 6.2 * s, 21 * s, 3.2 * s);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(3.0 * s, 2 * s, 1.6 * s, 15 * s);
    // Mano derecha
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(2.5 * s, 21.5 * s, 2.8 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Torso / Chaqueta verde deportiva con volumen 3D
    const jacketGrad = ctx.createLinearGradient(-15 * s, -52 * s, 15 * s, -23 * s);
    jacketGrad.addColorStop(0, '#10b981');
    jacketGrad.addColorStop(0.45, '#059669');
    jacketGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = jacketGrad;
    ctx.beginPath();
    ctx.roundRect(-14.5 * s, -51 * s, 29 * s, 28 * s, 8.5 * s);
    ctx.fill();

    // Cuello blanco deportivo y pretina/cinturón negro (como en la imagen de referencia)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-7 * s, -52.5 * s, 14 * s, 3.2 * s, 1.5 * s);
    ctx.fill();

    ctx.fillStyle = '#09090b';
    ctx.fillRect(-14.2 * s, -26.5 * s, 28.4 * s, 3.8 * s);

    // Parche y Número icónico en la espalda (456, 058, 100)
    ctx.fillStyle = 'rgba(2, 44, 34, 0.55)';
    ctx.beginPath();
    ctx.roundRect(-10.5 * s, -43.5 * s, 21 * s, 11.5 * s, 3 * s);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.max(7.5, Math.round(10 * s))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numberText, 0, -37.5 * s);

    // Sombra bajo la cabeza sobre los hombros
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, -51.5 * s, 9.5 * s, 3.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeza 3D esférica grande con iluminación suave estilo muñeco 3D de la imagen
    const headGrad = ctx.createRadialGradient(-5.5 * s, -71 * s, 2.5 * s, 0, -66 * s, 17.5 * s);
    headGrad.addColorStop(0, '#fef08a');
    headGrad.addColorStop(0.35, '#fcd34d');
    headGrad.addColorStop(0.75, '#d97706');
    headGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -66 * s, 16 * s, 0, Math.PI * 2);
    ctx.fill();

    // Brillo especular 3D en la parte superior izquierda de la cabeza
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-5.5 * s, -72.5 * s, 5.2 * s, 3.2 * s, -0.45, 0, Math.PI * 2);
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

          <div class="flex items-center gap-5">
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
            <div class="space-y-1">
              <span class="font-mono text-xs font-black uppercase ${st.isSolved ? 'text-emerald-500' : 'text-rose-500'}">
                ${st.isSolved ? `✓ ¡PACIENTE SALVADO! RESPUESTA: ${st.targetWord}` : `✕ PARO CLÍNICO — LA RESPUESTA ERA: ${st.targetWord}`}
              </span>
              <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <b>Perla CACES:</b> ${st.item.pearl}
              </p>
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

    stage.querySelector('#btn-hangman-next-word')?.addEventListener('click', () => {
      this.playTone('beep');
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
        this.playTone('correct');
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

  // =========================================================================
  // RANKING DE JUEGOS EN VIVO (SIN XP GLOBAL: SOLO RACHA EN VIDRIOS Y PUENTES)
  // =========================================================================
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
        // Por defecto: Racha Máxima en los Vidrios
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
