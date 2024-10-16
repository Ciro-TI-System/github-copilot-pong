let bolaImagem;
let jogadorImagem;
let computadorImagem;
let fundoImagem;
let quicarSom;
let golSom;

let pontosJogador = 0;
let pontosComputador = 0;
let jogoFinalizado = false;

class Raquete {
  constructor(x) {
    this.x = x;
    this.y = height / 2;
    this.w = 10;
    this.h = 60;
  }

  update() {
    // Se for o jogador
    if (this.x < width / 2) {
      this.y = mouseY;
    } else {
      // IA simples para o computador seguir a bola
      if (bola.y < this.y) {
        this.y -= 5;
      } else if (bola.y > this.y) {
        this.y += 5;
      }
    }

    // Limitar dentro da tela
    if (this.y < 0) {
      this.y = 0;
    }
    if (this.y > height - this.h) {
      this.y = height - this.h;
    }
  }

  desenha() {
    if (this.x < width / 2) {
      image(jogadorImagem, this.x, this.y, this.w, this.h);
    } else {
      image(computadorImagem, this.x, this.y, this.w, this.h);
    }
  }
}

class Bola {
  constructor() {
    this.r = 12;
    this.reset();
  }

  reset() {
    // Verifica se o jogo acabou
    if (pontosJogador === 3 || pontosComputador === 3) {
      jogoFinalizado = true;
      return;
    }

    this.x = width / 2;
    this.y = height / 2;
    const velocidadeMaxima = 10;
    this.vx = Math.random() * velocidadeMaxima * 2 - velocidadeMaxima;
    this.vy = Math.random() * velocidadeMaxima * 2 - velocidadeMaxima;
    this.angulo = 0; // Ângulo de rotação da bola
  }

  update() {
    if (jogoFinalizado) return; // Não atualiza se o jogo acabou

    this.x += this.vx;
    this.y += this.vy;
    this.angulo += Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 30;

    // Colisão com as bordas laterais (ponto)
    if (this.x < this.r || this.x > width - this.r) {
      if (this.x < this.r) {
        pontosComputador++;
      } else {
        pontosJogador++;
      }
      golSom.play();
      falaPontos();
      this.reset();
    }

    // Colisão com as bordas superior e inferior
    if (this.y < this.r || this.y > height - this.r) {
      this.vy *= -1;
    }

    // Colisão com as raquetes
    if (
      colideRetanguloCirculo(
        this.x,
        this.y,
        this.r,
        jogador.x,
        jogador.y,
        jogador.w,
        jogador.h
      ) ||
      colideRetanguloCirculo(
        this.x,
        this.y,
        this.r,
        computador.x,
        computador.y,
        computador.w,
        computador.h
      )
    ) {
      quicarSom.play();
      this.vx *= -1.1; // Aumenta um pouco a velocidade após cada colisão
      this.vy *= 1.1;
    }
  }

  desenha() {
    push();
    translate(this.x, this.y);
    rotate(this.angulo);
    image(bolaImagem, -this.r, -this.r, this.r * 2, this.r * 2);
    pop();
  }
}

// Função para desenhar o placar
function desenhaPlacar() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  stroke(0);
  strokeWeight(4);
  text(`${pontosJogador}`, width / 4, 50); // Placar do jogador
  text(`${pontosComputador}`, (3 * width) / 4, 50); // Placar do computador
}

// Função para detectar colisão entre círculo e retângulo
function colideRetanguloCirculo(cx, cy, raio, x, y, w, h) {
  if (
    cx + raio < x ||
    cx - raio > x + w ||
    cy + raio < y ||
    cy - raio > y + h
  ) {
    return false;
  }
  return true;
}

let bola;
let jogador;
let computador;

function falaPontos() {
  if ("speechSynthesis" in window) {
    const pontuacao = "Pontuação: " + pontosJogador + " a " + pontosComputador;
    const msg = new SpeechSynthesisUtterance(pontuacao);
    msg.lang = "pt-BR";
    window.speechSynthesis.speak(msg);
  }
}

function preload() {
  bolaImagem = loadImage("./image/bola.png");
  jogadorImagem = loadImage("./image/barra01.png");
  computadorImagem = loadImage("./image/barra02.png");
  fundoImagem = loadImage("./image/fundo2.png");
  quicarSom = loadSound("./audio/446100__justinvoke__bounce.wav");
  golSom = loadSound(
    "./audio/274178__littlerobotsoundfactory__jingle_win_synth_02.wav"
  );
}

function setup() {
  createCanvas(800, 400);
  bola = new Bola();
  jogador = new Raquete(30);
  computador = new Raquete(width - 30 - 10);
}

function draw() {
  background(0);

  // Desenhar fundo
  let canvasAspectRatio = width / height;
  let fundoAspectRatio = fundoImagem.width / fundoImagem.height;
  let zoom = 1;
  if (canvasAspectRatio > fundoAspectRatio) {
    zoom = width / fundoImagem.width;
  } else {
    zoom = height / fundoImagem.height;
  }
  let scaledWidth = fundoImagem.width * zoom;
  let scaledHeight = fundoImagem.height * zoom;
  image(
    fundoImagem,
    (width - scaledWidth) / 2,
    (height - scaledHeight) / 2,
    scaledWidth,
    scaledHeight
  );

  desenhaPlacar(); // Mostrar o placar no topo

  // Verifica se o jogo acabou
  if (jogoFinalizado) {
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255);
    stroke(0);
    strokeWeight(4);

    // Mostra o vencedor
    if (pontosJogador === 3) {
      text("Jogador venceu!", width / 2, height / 2);
    } else {
      text("Computador venceu!", width / 2, height / 2);
    }

    noLoop(); // Pausa o jogo
    return; // Para a execução do restante do código
  }

  bola.update();
  bola.desenha();

  jogador.update();
  jogador.desenha();

  computador.update();
  computador.desenha();
}

// Função para reiniciar o jogo ao pressionar a tecla "R"
function keyPressed() {
  if (key === "r" || key === "R") {
    pontosJogador = 0;
    pontosComputador = -1;
    jogoFinalizado = false;
    loop(); // Retorna a execução do jogo
    bola.reset();
  }
}
