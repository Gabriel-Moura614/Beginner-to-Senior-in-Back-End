// --- BANCO DE DADOS COM AULAS, EXERCÍCIOS E CHEAT SHEETS ---
const tracksData = {
  java: {
    title: "Trilha Java",
    icon: "☕",
    levels: [
      { 
        num: 1, 
        title: "Fundamentos", 
        unlocked: true,
        exercises: [
          {
            title: "Exercício 1: Olá, Mundo!",
            explanation: "Todo código Java começa dentro de uma classe. O método <code>main</code> é o ponto de partida do programa. Para imprimir algo na tela, usamos o comando <code>System.out.println()</code> (lembre-se: Java diferencia maiúsculas de minúsculas!).",
            task: "Apague o comentário e escreva o comando para imprimir exatamente <strong>Olá, Mundo!</strong> (com acento e exclamação).",
            initialCode: 'public class Main {\n    public static void main(String[] args) {\n        // Seu código aqui\n        \n    }\n}',
            expectedOutput: "Olá, Mundo!",
            cheatSheet: `
              <h4>Estrutura Base</h4>
              <pre>public class Main {\n  public static void main(String[] args) {\n    // código\n  }\n}</pre>
              <h4>Imprimir na tela</h4>
              <pre>System.out.println("Texto");</pre>
              <p><strong>Atenção:</strong> Todo comando em Java termina com <code>;</code> (ponto e vírgula) e textos vão entre <code>"aspas duplas"</code>.</p>
            `
          },
          {
            title: "Exercício 2: Variáveis",
            explanation: "Variáveis servem para guardar dados na memória. Em Java, precisamos dizer qual é o tipo da variável. Para textos, usamos <code>String</code>. Para números inteiros, usamos <code>int</code>.",
            task: "Crie uma variável chamada <code>idade</code> do tipo <code>int</code> valendo <strong>25</strong>, e imprima ela na tela usando <code>System.out.println()</code>.",
            initialCode: 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
            expectedOutput: "25",
            cheatSheet: `
              <h4>Criando Variáveis</h4>
              <pre>String nome = "João";\nint idade = 20;\ndouble altura = 1.75;</pre>
              <h4>Imprimir variável</h4>
              <pre>System.out.println(idade);</pre>
            `
          }
        ]
      },
      { 
        num: 2, 
        title: "Aprofundamento", 
        unlocked: false,
        exercises: []
      }
    ]
  },
  // ... (O resto das trilhas pode ficar resumido por enquanto)
};

// Elementos do DOM
const tracksContainer = document.getElementById("tracks-container");
const trackDetails = document.getElementById("track-details");
const exerciseScreen = document.getElementById("exercise-screen");
const levelsContainer = document.getElementById("levels-container");
const trackCards = document.querySelectorAll(".track-card");

// Elementos do Exercício
const exTitle = document.getElementById("ex-title");
const exExplanation = document.getElementById("ex-explanation");
const exTask = document.getElementById("ex-task");
const cheatSheetContent = document.getElementById("cheat-sheet-content");
const timerDisplay = document.getElementById("timer-display");
const terminalOutput = document.getElementById("terminal-output");
const runBtn = document.getElementById("run-btn");
const validationStatus = document.getElementById("validation-status");

let timerInterval;
let timerSeconds = 0;
let editorInstance;
let currentExpectedOutput = "";
let currentExerciseIndex = 0;
let currentTrackId = "";
let currentLevelNum = 0;

// --- CONFIGURAÇÃO DO MONACO EDITOR ---
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editorInstance = monaco.editor.create(document.getElementById('editor'), {
        value: '// Carregando editor...',
        language: 'java',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true
    });
});

// --- NAVEGAÇÃO ---
function openTrack(trackId) {
  const track = tracksData[trackId];
  if (!track) return;
  document.getElementById("detail-icon").textContent = track.icon;
  document.getElementById("detail-title").textContent = track.title;
  levelsContainer.innerHTML = "";

  track.levels.forEach(level => {
    const card = document.createElement("div");
    card.className = `level-card ${level.unlocked ? '' : 'locked'}`;
    
    // Mostra quantos exercícios tem no nível
    const exCount = level.exercises ? level.exercises.length : 0;
    const descText = level.unlocked ? `${exCount} exercícios disponíveis` : level.desc;

    card.innerHTML = `
      <div class="level-info"><h4>Nível ${level.num}: ${level.title}</h4><p>${descText}</p></div>
      <span class="level-status ${level.unlocked ? 'unlocked' : 'locked'}">${level.unlocked ? 'Disponível' : '🔒 Bloqueado'}</span>
    `;
    if (level.unlocked && exCount > 0) {
      card.addEventListener("click", () => openExercise(trackId, level.num, 0)); // 0 = começa no primeiro ex
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

// --- LÓGICA DO EXERCÍCIO ---
function openExercise(trackId, levelNum, exerciseIndex) {
  currentTrackId = trackId;
  currentLevelNum = levelNum;
  currentExerciseIndex = exerciseIndex;

  const levelData = tracksData[trackId].levels.find(l => l.num === levelNum);
  const exercise = levelData.exercises[exerciseIndex];

  if (!exercise) return;

  // Atualiza a tela
  trackDetails.classList.add("hidden");
  exerciseScreen.classList.remove("hidden");
  
  exTitle.textContent = exercise.title;
  exExplanation.innerHTML = exercise.explanation;
  exTask.innerHTML = exercise.task;
  cheatSheetContent.innerHTML = exercise.cheatSheet;
  currentExpectedOutput = exercise.expectedOutput;
  
  // Atualiza o Monaco Editor
  if(editorInstance) {
    editorInstance.setValue(exercise.initialCode);
  } else {
    // Se o Monaco ainda não carregou, espera um pouco
    setTimeout(() => editorInstance.setValue(exercise.initialCode), 500);
  }
  
  // Reseta terminal e status
  terminalOutput.textContent = "Aguardando execução...";
  validationStatus.textContent = "";
  validationStatus.className = "status-message";
  
  // Inicia Cronômetro (ou continua, se já estiver rodando)
  if (!timerInterval) {
    timerSeconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => { timerSeconds++; updateTimerDisplay(); }, 1000);
  }
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
    
    // --- TRATAMENTO DE ERRO DA API (O CONSERTO) ---
    let output = "";
    let isError = false;

    // Se falhou na compilação (ex: erro de sintaxe, falta de ponto e vírgula)
    if (data.compile && data.compile.stderr) {
      output = data.compile.stderr;
      isError = true;
    } 
    // Se falhou na execução (ex: divisão por zero)
    else if (data.run && data.run.stderr) {
      output = data.run.stderr;
      isError = true;
    } 
    // Se rodou perfeitamente
    else if (data.run && data.run.output) {
      output = data.run.output;
    } else {
      output = "Ocorreu um erro desconhecido na API.";
      isError = true;
    }

    terminalOutput.textContent = output;

    // Validação do exercício
    if (!isError && output.trim() === currentExpectedOutput.trim()) {
      validationStatus.textContent = "✅ Desafio Concluído!";
      validationStatus.classList.add("success");
      
      // Lógica simples de próxima etapa: avança pro próximo ex, ou desbloqueia próximo nível
      setTimeout(() => {
        const levelData = tracksData[currentTrackId].levels.find(l => l.num === currentLevelNum);
        if (currentExerciseIndex + 1 < levelData.exercises.length) {
          // Tem próximo exercício neste nível
          openExercise(currentTrackId, currentLevelNum, currentExerciseIndex + 1);
        } else {
          // Acabaram os exercícios do nível, desbloqueia o próximo
          const nextLevel = tracksData[currentTrackId].levels.find(l => l.num === currentLevelNum + 1);
          if (nextLevel) {
            nextLevel.unlocked = true;
            alert("🎉 Você concluiu todos os exercícios deste nível! O próximo nível foi desbloqueado.");
            document.getElementById("back-to-levels").click();
          } else {
            alert("🎉 Você concluiu todos os exercícios da trilha!");
          }
        }
      }, 2000);

    } else if (!isError) {
      validationStatus.textContent = "❌ A saída não é a esperada. Verifique o terminal.";
      validationStatus.classList.add("error");
    } else {
      validationStatus.textContent = "❌ Erro de compilação. Leia o terminal.";
      validationStatus.classList.add("error");
    }

  } catch (error) {
    terminalOutput.textContent = "Erro de conexão: " + error.message;
    validationStatus.textContent = "❌ Erro na API";
    validationStatus.classList.add("error");
  } finally {
    runBtn.disabled = false;
  }
});