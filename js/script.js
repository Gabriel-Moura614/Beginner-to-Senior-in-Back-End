// Banco de dados local com as informações de cada trilha
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
  sql: {
    title: "Trilha SQL",
    icon: "🗄️",
    levels: [
      { num: 1, title: "Fundamentos", desc: "SELECT, WHERE, ORDER BY.", unlocked: true },
      { num: 2, title: "Agregações", desc: "JOIN, GROUP BY, Subqueries.", unlocked: false },
      { num: 3, title: "Modelagem", desc: "Índices, transações, normalização.", unlocked: false },
      { num: 4, title: "Sênior", desc: "Performance, query plans.", unlocked: false },
      { num: 5, title: "Exame de Certificado", desc: "Prova final com cheat sheet.", unlocked: false }
    ]
  },
  spring: {
    title: "Trilha Spring Boot",
    icon: "🌱",
    levels: [
      { num: 1, title: "Fundamentos", desc: "IoC, DI, estrutura de projeto.", unlocked: true },
      { num: 2, title: "Spring MVC", desc: "REST controllers, DTOs.", unlocked: false },
      { num: 3, title: "JPA & Security", desc: "Data JPA, transações, Security básico.", unlocked: false },
      { num: 4, title: "Sênior", desc: "JWT, OAuth2, Actuator, performance.", unlocked: false },
      { num: 5, title: "Exame de Certificado", desc: "App quebrado para consertar.", unlocked: false }
    ]
  },
  docker: {
    title: "Trilha Docker",
    icon: "🐳",
    levels: [
      { num: 1, title: "Fundamentos", desc: "Imagens, containers, docker run.", unlocked: true },
      { num: 2, title: "Compose", desc: "Volumes, networks, multi-stage build.", unlocked: false },
      { num: 3, title: "Otimização", desc: "Healthchecks, boas práticas.", unlocked: false },
      { num: 4, title: "Sênior", desc: "Segurança, CI/CD, Kubernetes.", unlocked: false },
      { num: 5, title: "Exame de Certificado", desc: "Stack multi-serviço com bugs.", unlocked: false }
    ]
  },
  aws: {
    title: "Trilha AWS",
    icon: "☁️",
    levels: [
      { num: 1, title: "Fundamentos", desc: "Regiões, IAM básico, Free Tier.", unlocked: true },
      { num: 2, title: "EC2 & RDS", desc: "Security Groups, SSH, deploy básico.", unlocked: false },
      { num: 3, title: "S3 & Monitoramento", desc: "Deploy real, CloudWatch.", unlocked: false },
      { num: 4, title: "Sênior", desc: "VPC, Load Balancer, Auto Scaling.", unlocked: false },
      { num: 5, title: "Exame de Certificado", desc: "Ambiente com falhas para corrigir.", unlocked: false }
    ]
  },
  backend: {
    title: "Trilha Back-end Geral",
    icon: "🔧",
    levels: [
      { num: 1, title: "Git & HTTP", desc: "Commit, branch, métodos HTTP.", unlocked: true },
      { num: 2, title: "Git Avançado & REST", desc: "Rebase, design de API.", unlocked: false },
      { num: 3, title: "Design & Auth", desc: "JWT, OAuth2, 12 Factor App.", unlocked: false },
      { num: 4, title: "Sênior", desc: "System design, observabilidade.", unlocked: false },
      { num: 5, title: "Exame de Certificado", desc: "Sistema com falhas de design.", unlocked: false }
    ]
  },
  frontend: {
    title: "Trilha Front-End",
    icon: "🎨",
    levels: [
      { num: 1, title: "Base", desc: "HTML semântico, CSS básico, JS.", unlocked: true },
      { num: 2, title: "Layouts", desc: "Flexbox, Grid, responsividade.", unlocked: false },
      { num: 3, title: "Componentes", desc: "Design system, animações, fetch.", unlocked: false },
      { num: 4, title: "Refinamento", desc: "Acessibilidade, performance.", unlocked: false },
      { num: 5, title: "Exame de Certificado", desc: "Criar interface do zero com mockup.", unlocked: false }
    ]
  }
};

// Elementos do DOM
const tracksContainer = document.getElementById("tracks-container");
const trackDetails = document.getElementById("track-details");
const backBtn = document.getElementById("back-btn");
const detailIcon = document.getElementById("detail-icon");
const detailTitle = document.getElementById("detail-title");
const levelsContainer = document.getElementById("levels-container");

// Seleciona todos os cards da tela inicial
const trackCards = document.querySelectorAll(".track-card");

// Função para abrir a trilha selecionada
function openTrack(trackId) {
  const track = tracksData[trackId];
  if (!track) return;

  // Atualiza o cabeçalho
  detailIcon.textContent = track.icon;
  detailTitle.textContent = track.title;

  // Limpa os níveis antigos
  levelsContainer.innerHTML = "";

  // Cria os cards de cada nível
  track.levels.forEach(level => {
    const card = document.createElement("div");
    card.className = `level-card ${level.unlocked ? '' : 'locked'}`;
    
    card.innerHTML = `
      <div class="level-info">
        <h4>Nível ${level.num}: ${level.title}</h4>
        <p>${level.desc}</p>
      </div>
      <span class="level-status ${level.unlocked ? 'unlocked' : 'locked'}">
        ${level.unlocked ? 'Disponível' : '🔒 Bloqueado'}
      </span>
    `;

    // Evento de clique (se estiver desbloqueado)
    if (level.unlocked) {
      card.addEventListener("click", () => {
        alert(`Abrindo ${track.title} - Nível ${level.num}`);
        // Aqui no futuro vai entrar a tela do exercício com o editor de código
      });
    }

    levelsContainer.appendChild(card);
  });

  // Troca a tela
  tracksContainer.classList.add("hidden");
  trackDetails.classList.remove("hidden");
}

// Adiciona o evento de clique em cada card da tela inicial
trackCards.forEach(card => {
  card.addEventListener("click", () => {
    const trackId = card.getAttribute("data-track");
    openTrack(trackId);
  });
});

// Botão de voltar
backBtn.addEventListener("click", () => {
  trackDetails.classList.add("hidden");
  tracksContainer.classList.remove("hidden");
});