import { Storage, getQuestionFingerprint } from './storage.js';

export class ExamEngine {
  constructor() {
    this.allQuestions = [];
    this.sessionQuestions = [];
    this.currentIndex = 0;
    this.userAnswers = {}; // { [questionId]: optionId }
    this.markedQuestions = new Set();
    this.mode = 'study'; // 'caces' | 'study' | 'errors' | 'bookmarks'
    this.timeRemaining = 0; // en segundos
    this.timeElapsed = 0;
    this.timerInterval = null;
    this.isFinished = false;
    this.isReviewing = false;
    this.reviewFilter = 'all'; // 'all' | 'wrong' | 'marked'
    this.lastSummary = null;

    // Callbacks de interfaz
    this.onTick = null;
    this.onStateChange = null;
    this.onFinish = null;
  }

  async loadQuestions() {
    this.allQuestions = await Storage.getAllQuestions();
    return this.allQuestions;
  }

  /**
   * Inicia una nueva sesión de estudio o simulacro
   */
  startSession({ mode = 'caces', count = 100, specialty = 'Todas', subtema = null, onlyErrors = false, questionIds = null }) {
    this.mode = mode;
    this.isFinished = false;
    this.isReviewing = false;
    this.reviewFilter = 'all';
    this.userAnswers = {};
    this.markedQuestions = new Set();
    this.currentIndex = 0;
    this.timeElapsed = 0;
    this.currentSubtema = subtema || null;

    // 1. Filtrar y deduplicar estrictamente el pool inicial
    let pool = Storage.deduplicateQuestions([...this.allQuestions]);

    if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
      const qSet = new Set(questionIds);
      pool = pool.filter(q => qSet.has(q.id));
    } else {
      if (specialty && specialty !== 'Todas') {
        pool = pool.filter(q => q.especialidad === specialty);
      }

      if (subtema && subtema !== 'Todos') {
        const sLower = subtema.toLowerCase().trim();
        pool = pool.filter(q => {
          if (!q.subtema) return false;
          const qSubLower = q.subtema.toLowerCase().trim();
          return qSubLower === sLower || qSubLower.includes(sLower) || sLower.includes(qSubLower);
        });
      }

      if (mode === 'errors' || onlyErrors) {
        const errorBank = Storage.getErrorBank();
        pool = pool.filter(q => errorBank[q.id] && !errorBank[q.id].dominada);
      }

      if (mode === 'bookmarks') {
        const bookmarks = Storage.getBookmarks();
        pool = pool.filter(q => bookmarks.includes(q.id));
      }
    }

    if (pool.length === 0) {
      throw new Error("No hay preguntas disponibles con los filtros seleccionados.");
    }

    // 2. Priorizar preguntas no vistas en los últimos 3 simulacros
    if (!questionIds && (mode === 'caces' || mode === 'study')) {
      const history = Storage.getExamHistory();
      const recentAnsweredIds = new Set();
      history.slice(0, 3).forEach(h => {
        if (h.respuestasUsuario) {
          Object.keys(h.respuestasUsuario).forEach(id => recentAnsweredIds.add(id));
        }
      });

      const unseen = pool.filter(q => !recentAnsweredIds.has(q.id));
      if (unseen.length >= count) {
        pool = unseen;
      } else if (unseen.length > 0) {
        const seen = pool.filter(q => recentAnsweredIds.has(q.id));
        pool = [...this.shuffleArray(unseen), ...this.shuffleArray(seen)];
      }
    }

    // 3. Selección ponderada o directa sin duplicados
    if (questionIds && questionIds.length > 0) {
      this.sessionQuestions = pool.slice(0, count);
    } else if (mode === 'caces' && specialty === 'Todas') {
      this.sessionQuestions = this.getPonderatedQuestions(pool, count);
    } else {
      const uniqueSelected = [];
      const seenFp = new Set();
      const shuffled = this.shuffleArray(pool);

      for (const q of shuffled) {
        const fp = getQuestionFingerprint(q) || q.id;
        if (!seenFp.has(fp)) {
          seenFp.add(fp);
          uniqueSelected.push(q);
        }
        if (uniqueSelected.length >= count) break;
      }
      this.sessionQuestions = uniqueSelected;
    }

    // Cronómetro oficial: 108 segundos por pregunta (100 preguntas = 3 horas = 10,800 segundos)
    if (mode === 'caces') {
      this.timeRemaining = this.sessionQuestions.length * 108;
    } else {
      this.timeRemaining = 0;
    }

    this.startTimer();
    this.notifyState();
    return this.sessionQuestions;
  }

  getPonderatedQuestions(pool, targetCount) {
    const components = [
      { name: "Medicina Interna", quota: Math.round(targetCount * 0.26) },
      { name: "Pediatría", quota: Math.round(targetCount * 0.21) },
      { name: "Ginecología y Obstetricia", quota: Math.round(targetCount * 0.17) },
      { name: "Cirugía", quota: Math.round(targetCount * 0.14) },
      { name: "Salud Mental", quota: Math.max(1, Math.round(targetCount * 0.08)) },
      { name: "Salud Pública", quota: Math.max(1, Math.round(targetCount * 0.08)) },
      { name: "Bioética", quota: Math.max(1, Math.round(targetCount * 0.06)) }
    ];

    let selected = [];
    const usedKeys = new Set();

    components.forEach(comp => {
      let compPool = pool.filter(q => q.especialidad === comp.name);
      compPool = this.shuffleArray(compPool);

      let added = 0;
      for (const q of compPool) {
        const key = getQuestionFingerprint(q) || q.id;
        if (!usedKeys.has(key)) {
          usedKeys.add(key);
          selected.push(q);
          added++;
        }
        if (added >= comp.quota) break;
      }
    });

    if (selected.length < targetCount) {
      const remainingPool = this.shuffleArray(pool);
      for (const q of remainingPool) {
        const key = getQuestionFingerprint(q) || q.id;
        if (!usedKeys.has(key)) {
          usedKeys.add(key);
          selected.push(q);
        }
        if (selected.length >= targetCount) break;
      }
    }

    return this.shuffleArray(selected.slice(0, targetCount));
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      this.timeElapsed++;
      if (this.mode === 'caces' && !this.isFinished) {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.timeRemaining = 0;
          this.finishExam();
        }
      }

      if (typeof this.onTick === 'function') {
        const timeToDisplay = this.mode === 'caces' && !this.isFinished ? this.timeRemaining : this.timeElapsed;
        this.onTick({
          remaining: this.timeRemaining,
          elapsed: this.timeElapsed,
          formatted: this.formatTime(timeToDisplay),
          isUrgent: this.mode === 'caces' && this.timeRemaining < 900
        });
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getCurrentQuestion() {
    return this.sessionQuestions[this.currentIndex] || null;
  }

  /**
   * Retorna el estado actual completo de la sesión (requerido por Tutor IA y UI)
   */
  getState() {
    const currentQ = this.getCurrentQuestion();
    const selectedAns = currentQ ? this.userAnswers[currentQ.id] : null;

    return {
      question: currentQ,
      index: this.currentIndex,
      total: this.sessionQuestions.length,
      selectedAnswer: selectedAns,
      isMarked: currentQ ? this.markedQuestions.has(currentQ.id) : false,
      userAnswers: this.userAnswers,
      markedQuestions: Array.from(this.markedQuestions),
      mode: this.mode,
      isFinished: this.isFinished,
      isReviewing: this.isReviewing,
      reviewFilter: this.reviewFilter,
      answeredCount: Object.keys(this.userAnswers).length,
      markedCount: this.markedQuestions.size
    };
  }

  selectAnswer(optionId) {
    if ((this.isFinished && !this.isReviewing) || this.isReviewing) return;

    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return;

    this.userAnswers[currentQ.id] = optionId;
    const isCorrect = optionId === currentQ.correcta;
    Storage.registerAnswer(currentQ.id, isCorrect);

    this.notifyState();
  }

  toggleCurrentMark() {
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return;

    if (this.markedQuestions.has(currentQ.id)) {
      this.markedQuestions.delete(currentQ.id);
    } else {
      this.markedQuestions.add(currentQ.id);
    }
    this.notifyState();
  }

  goToQuestion(index) {
    if (index >= 0 && index < this.sessionQuestions.length) {
      this.currentIndex = index;
      this.notifyState();
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.sessionQuestions.length - 1) {
      this.currentIndex++;
      this.notifyState();
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.notifyState();
    }
  }

  goToFirstUnanswered() {
    const idx = this.sessionQuestions.findIndex(q => !this.userAnswers[q.id]);
    if (idx !== -1) {
      this.goToQuestion(idx);
    }
  }

  async finishExam() {
    this.stopTimer();
    this.isFinished = true;

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const specialtyStats = {
      "Medicina Interna": { total: 0, correct: 0, incorrect: 0, weight: 26 },
      "Pediatría": { total: 0, correct: 0, incorrect: 0, weight: 21 },
      "Ginecología y Obstetricia": { total: 0, correct: 0, incorrect: 0, weight: 17 },
      "Cirugía": { total: 0, correct: 0, incorrect: 0, weight: 14 },
      "Salud Mental": { total: 0, correct: 0, incorrect: 0, weight: 8 },
      "Salud Pública": { total: 0, correct: 0, incorrect: 0, weight: 8 },
      "Bioética": { total: 0, correct: 0, incorrect: 0, weight: 6 }
    };

    this.sessionQuestions.forEach(q => {
      const spec = q.especialidad || 'Medicina Interna';
      if (!specialtyStats[spec]) {
        specialtyStats[spec] = { total: 0, correct: 0, incorrect: 0 };
      }
      specialtyStats[spec].total++;

      const selected = this.userAnswers[q.id];
      if (!selected) {
        unanswered++;
        specialtyStats[spec].incorrect++;
      } else if (selected === q.correcta) {
        correct++;
        specialtyStats[spec].correct++;
      } else {
        incorrect++;
        specialtyStats[spec].incorrect++;
      }
    });

    const total = this.sessionQuestions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= 60;
    
    // Escala Oficial CACES: Aprobación en 700 pts (60%), Techo en 1000 pts (100%)
    const puntajeCaces = total > 0
      ? (percentage < 60
          ? Math.round((percentage / 60) * 700)
          : Math.round(700 + ((percentage - 60) / 40) * 300))
      : 0;

    Object.keys(specialtyStats).forEach(s => {
      const st = specialtyStats[s];
      st.pct = st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0;
    });

    const summary = {
      modo: this.mode === 'caces' ? 'Simulacro Oficial CACES' : 'Práctica de Estudio',
      puntuacion: correct,
      total: total,
      incorrectas: incorrect,
      sinResponder: unanswered,
      porcentaje: percentage,
      puntajeCaces: puntajeCaces,
      aprobado: passed,
      tiempo: this.timeElapsed,
      desglose: specialtyStats,
      respuestasUsuario: { ...this.userAnswers }, // Guardado para no repetir preguntas en siguientes sesiones
      fecha: new Date().toLocaleDateString('es-EC', { dateStyle: 'long', timeStyle: 'short' })
    };

    this.lastSummary = summary;
    await Storage.saveExamResult(summary);

    if (typeof this.onFinish === 'function') {
      this.onFinish(summary);
    }

    this.notifyState();
    return summary;
  }

  startReview(filter = 'all') {
    this.isReviewing = true;
    this.reviewFilter = filter;
    this.currentIndex = 0;
    this.notifyState();
  }

  exitReview() {
    this.isReviewing = false;
    this.notifyState();
  }

  notifyState() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}