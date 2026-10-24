import { Storage } from './storage.js';

export class AnalyticsManager {
  constructor() {
    this.radarChart = null;
    this.historyChart = null;
  }

  renderStats() {
    const history = Storage.getExamHistory();
    const tutorStats = Storage.getTutorStats();
    const errorBank = Storage.getErrorBank();
    const errorList = Object.values(errorBank);
    const errorsActive = errorList.filter(e => !e.dominada).length;
    const errorsMastered = errorList.filter(e => e.dominada).length;

    let totalQuestionsAnswered = tutorStats.totalAnswered || 0;
    let totalCorrect = tutorStats.totalCorrect || 0;
    let totalTime = 0;

    const specialtyAggregates = {
      "Medicina Interna": { total: 0, correct: 0 },
      "Pediatría": { total: 0, correct: 0 },
      "Ginecología y Obstetricia": { total: 0, correct: 0 },
      "Cirugía": { total: 0, correct: 0 },
      "Salud Mental": { total: 0, correct: 0 },
      "Salud Pública": { total: 0, correct: 0 },
      "Bioética": { total: 0, correct: 0 }
    };

    // 1. Sumar estadísticas acumuladas en tiempo real del Modo Tutor
    if (tutorStats.bySpecialty) {
      Object.keys(tutorStats.bySpecialty).forEach(spec => {
        if (!specialtyAggregates[spec]) {
          specialtyAggregates[spec] = { total: 0, correct: 0 };
        }
        specialtyAggregates[spec].total += tutorStats.bySpecialty[spec].total || 0;
        specialtyAggregates[spec].correct += tutorStats.bySpecialty[spec].correct || 0;
      });
    }

    // 2. Sumar Simulacros cerrados (y sesiones previas que no fueron contadas en tiempo real)
    history.forEach(sim => {
      totalTime += sim.tiempo || 0;
      if (!sim.realtimeTutorCounted) {
        totalQuestionsAnswered += sim.total || 0;
        totalCorrect += sim.puntuacion || 0;

        if (sim.desglose) {
          Object.keys(sim.desglose).forEach(spec => {
            if (spec.startsWith('_')) return;
            if (!specialtyAggregates[spec]) {
              specialtyAggregates[spec] = { total: 0, correct: 0 };
            }
            specialtyAggregates[spec].total += sim.desglose[spec].total || 0;
            specialtyAggregates[spec].correct += sim.desglose[spec].correct || 0;
          });
        }
      }
    });

    const globalPct = totalQuestionsAnswered > 0 
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) 
      : 0;

    const kpiAnswered = document.getElementById('kpi-answered');
    const kpiAccuracy = document.getElementById('kpi-accuracy');
    const kpiErrors = document.getElementById('kpi-errors');
    const kpiSimulacros = document.getElementById('kpi-simulacros');

    if (kpiAnswered) kpiAnswered.textContent = totalQuestionsAnswered;
    if (kpiAccuracy) kpiAccuracy.textContent = `${globalPct}%`;
    if (kpiErrors) kpiErrors.textContent = `${errorsActive} act. / ${errorsMastered} dom.`;
    if (kpiSimulacros) {
      const sessionsCount = history.length + (tutorStats.totalAnswered > 0 && history.length === 0 ? 1 : 0);
      kpiSimulacros.textContent = sessionsCount;
    }

    let bestSpec = null;
    let bestPct = -1;
    let weakSpec = null;
    let weakPct = 101;

    Object.keys(specialtyAggregates).forEach(s => {
      const agg = specialtyAggregates[s];
      if (agg.total > 0) {
        const pct = Math.round((agg.correct / agg.total) * 100);
        if (pct > bestPct) {
          bestPct = pct;
          bestSpec = s;
        }
        if (pct < weakPct) {
          weakPct = pct;
          weakSpec = s;
        }
      }
    });

    const strengthEl = document.getElementById('kpi-strength');
    const weaknessEl = document.getElementById('kpi-weakness');
    if (strengthEl) {
      strengthEl.textContent = bestSpec ? `${bestSpec} (${bestPct}%)` : "Responde en Simulador o Tutor";
    }
    if (weaknessEl) {
      weaknessEl.textContent = weakSpec ? `${weakSpec} (${weakPct}%)` : "Responde en Simulador o Tutor";
    }

    this.renderRadarChart(specialtyAggregates);
    this.renderHistoryChart(history, tutorStats, globalPct);
  }

  isDarkMode() {
    return document.documentElement.classList.contains('dark');
  }

  renderRadarChart(specialtyAggregates) {
    const canvas = document.getElementById('radarChart');
    if (!canvas || !window.Chart) return;

    const isDark = this.isDarkMode();
    const textColor = isDark ? '#e4e4e7' : '#18181b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)';
    const accentColor = isDark ? '#CCFF00' : '#0f172a';
    const fillBg = isDark ? 'rgba(204, 255, 0, 0.22)' : 'rgba(204, 255, 0, 0.45)';

    const labels = Object.keys(specialtyAggregates);
    const data = labels.map(k => {
      const agg = specialtyAggregates[k];
      return agg.total > 0 ? Math.round((agg.correct / agg.total) * 100) : 0;
    });

    if (this.radarChart) {
      this.radarChart.destroy();
    }

    this.radarChart = new window.Chart(canvas, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: '% Dominio EHEP (Simulador + Tutor)',
          data: data,
          backgroundColor: fillBg,
          borderColor: accentColor,
          borderWidth: 2.5,
          pointBackgroundColor: '#FF2A5F',
          pointBorderColor: '#000',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: gridColor },
            grid: { color: gridColor },
            pointLabels: {
              color: textColor,
              font: { family: '"JetBrains Mono", monospace', size: 10, weight: 'bold' }
            },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: {
              stepSize: 20,
              color: textColor,
              backdropColor: 'transparent',
              font: { family: '"JetBrains Mono", monospace', size: 9 }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Dominio: ${context.raw}%`
            }
          }
        }
      }
    });
  }

  renderHistoryChart(history, tutorStats = null, globalPct = 0) {
    const canvas = document.getElementById('historyChart');
    if (!canvas || !window.Chart) return;

    const isDark = this.isDarkMode();
    const textColor = isDark ? '#a1a1aa' : '#52525b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const lineColor = isDark ? '#CCFF00' : '#0f172a';

    const recent = [...history].reverse().slice(-12);
    let labels = recent.map((item, idx) => `#${idx + 1}`);
    let data = recent.map(item => item.porcentaje || 0);

    if (tutorStats && tutorStats.totalAnswered > 0) {
      const tutorPct = Math.round((tutorStats.totalCorrect / tutorStats.totalAnswered) * 100);
      labels.push('Tutor');
      data.push(tutorPct);
    }

    if (this.historyChart) {
      this.historyChart.destroy();
    }

    this.historyChart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Sin datos'],
        datasets: [
          {
            label: '% Precisión (Simulacros + Tutor)',
            data: data.length > 0 ? data : [0],
            fill: true,
            borderColor: lineColor,
            backgroundColor: isDark ? 'rgba(204, 255, 0, 0.14)' : 'rgba(204, 255, 0, 0.35)',
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: lineColor,
            pointBorderColor: '#000'
          },
          {
            label: 'Umbral CACES (60%)',
            data: (labels.length > 0 ? labels : ['Sin datos']).map(() => 60),
            borderColor: '#FF2A5F',
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: {
              stepSize: 20,
              color: textColor,
              font: { family: '"JetBrains Mono", monospace', size: 10 },
              callback: (val) => `${val}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { family: '"JetBrains Mono", monospace', size: 10 }
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: textColor,
              boxWidth: 12,
              font: { family: '"JetBrains Mono", monospace', size: 10 }
            }
          }
        }
      }
    });
  }
}

export const Analytics = new AnalyticsManager();
