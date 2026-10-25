// --- BANCO DE DADOS DAS TRILHAS ---
const tracksData = {
  java: {
    title: "Trilha Java",
    icon: "☕",
    levels: [
      { num: 1, title: "Fundamentos", desc: "Sintaxe, OOP, tipos de dados.", unlocked: true },
      { num: 2, title: "Aprofundamento", desc: "Coleções, Concorrência, JVM.", unlocked: false },
      { num: 3, title: "Persistência e Back-end", desc: "JDBC, JPA, Spring Boot.", unlocked: false },
      { num: 4, title: "Sênior", desc: "Microsserviços, Cloud, Design.", unlocked: false },
      { num: 5, title: "Exame de Certificado", desc: "Prova final com cheat sheet.", unlocked: false }
    ]
  },
  // ... (Mantenha os outros dados de sql, spring, docker, aws, backend, frontend iguais ao código anterior)
  sql: { title: "Trilha SQL", icon: "🗄️", levels: [{ num: 1, title: "Fundamentos", desc: "SELECT, WHERE.", unlocked: true }, { num: 2, title: "Agregações", desc: "JOIN.", unlocked: false }] },
  spring: { title: "Trilha Spring", icon: "🌱", levels: [{ num: 1, title: "Fundamentos", desc: "IoC, DI.", unlocked: true }] }
};

// Elementos do DOM
const tracksContainer = document.getElementById("tracks-container");
const trackDetails = document.getElementById("track-details");
const exerciseScreen = document.getElementById("exercise-screen");
const levelsContainer = document.getElementById("levels-container");
const trackCards = document.querySelectorAll(".track-card");

// Elementos do Exercício
const timerDisplay = document.getElementById("timer-display");
const terminalOutput = document.getElementById("terminal-output");
const runBtn = document.getElementById("run-btn");
const validationStatus = document.getElementById("validation-status");

let timerInterval;
let timerSeconds = 0;
let editorInstance;

// --- CONFIGURAÇÃO DO MONACO EDITOR ---
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editorInstance = monaco.editor.create(document.getElementById('editor'), {
        value: 'public class Main {\n    public static void main(String[] args) {\n        // Seu código aqui\n        \n    }\n}',
        language: 'java',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true
    });
});

// --- NAVEGAÇÃO BÁSICA ---
function openTrack(trackId) {
  const track = tracksData[trackId];
  if (!track) return;
  document.getElementById("detail-icon").textContent = track.icon;
  document.getElementById("detail-title").textContent = track.title;
  levelsContainer.innerHTML = "";

  track.levels.forEach(level => {
    const card = document.createElement("div");
    card.className = `level-card ${level.unlocked ? '' : 'locked'}`;
    card.innerHTML = `
      <div class="level-info"><h4>Nível ${level.num}: ${level.title}</h4><p>${level.desc}</p></div>
      <span class="level-status ${level.unlocked ? 'unlocked' : 'locked'}">${level.unlocked ? 'Disponível' : '🔒 Bloqueado'}</span>
    `;
    if (level.unlocked) {
      card.addEventListener("click", () => openExercise(trackId, level.num));
    }
    levelsContainer.appendChild(card);
  });

  tracksContainer.classList.add("hidden");
  trackDetails.classList.remove("hidden");
}

trackCards.forEach(card => {
  card.addEventListener("click", () => openTrack(card.getAttribute("data-track")));
});

document.getElementById("back-btn").addEventListener("click", () => {
  trackDetails.classList.add("hidden");
  tracksContainer.classList.remove("hidden");
});

document.getElementById("back-to-levels").addEventListener("click", () => {
  clearInterval(timerInterval);
  exerciseScreen.classList.add("hidden");
  trackDetails.classList.remove("hidden");
});

// --- LÓGICA DO EXERCÍCIO E CRONÔMETRO ---
function openExercise(trackId, levelNum) {
  trackDetails.classList.add("hidden");
  exerciseScreen.classList.remove("hidden");
  
  // Reseta terminal e status
  terminalOutput.textContent = "Aguardando execução...";
  validationStatus.textContent = "";
  validationStatus.className = "status-message";
  
  // Inicia Cronômetro
  timerSeconds = 0;
  updateTimerDisplay();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const secs = (timerSeconds % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${mins}:${secs}`;
}

// --- API DO PISTON (RODAR CÓDIGO JAVA) ---
runBtn.addEventListener("click", async () => {
  const code = editorInstance.getValue();
  terminalOutput.textContent = "Compilando e executando...";
  runBtn.disabled = true;
  validationStatus.textContent = "";

  try {
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "java",
        version: "15.0.2",
        files: [{ content: code }]
      })
    });

    const data = await response.json();
    
    // Pega a saída do terminal (seja erro ou sucesso)
    const output = data.run.output || data.compile.output || "Sem saída.";
    terminalOutput.textContent = output;

    // Validação básica: O código tem que ter "Hello, World!" e não ter erro de compilação
    if (output.includes("Hello, World!") && !data.compile.stderr && !data.run.stderr) {
      validationStatus.textContent = "✅ Desafio Concluído!";
      validationStatus.classList.add("success");
      clearInterval(timerInterval); // Para o tempo
      
      // Desbloqueia Nível 2 (Simulação)
      tracksData.java.levels[1].unlocked = true;
    } else {
      validationStatus.textContent = "❌ Quase lá. Verifique o terminal.";
      validationStatus.classList.add("error");
    }

  } catch (error) {
    terminalOutput.textContent = "Erro de conexão com a API de execução: " + error.message;
    validationStatus.textContent = "❌ Erro na API";
    validationStatus.classList.add("error");
  } finally {
    runBtn.disabled = false;
  }
});