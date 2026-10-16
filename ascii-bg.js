const canvas = document.createElement('canvas');
canvas.id = 'ascii-bg';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

// Caracteres ordenados do "mais vazio/escuro" para o "mais preenchido/brilhante"
const CHARS = ' .·:;~=+*#%@';
const SCRAMBLE_CHARS = '@#%*=+~;:·.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Paleta de cores do gradiente (inspirada no padrão do React Bits: Roxo, Rosa Neon e Ciano)
// Você pode trocar esses códigos RGB se quiser outras cores!
const COLORS = [
    { r: 82, g: 39, b: 255 },   // Roxo (#5227FF)
    { r: 255, g: 159, b: 252 }, // Rosa (#FF9FFC)
    { r: 0, g: 210, b: 255 }    // Azul/Ciano
];

const CELL_SIZE = 16; // Tamanho de cada letra em pixels (diminua para mais detalhes, aumente para letras maiores)
const MOUSE_RADIUS = 140; // Raio em que o mouse embaralha as letras

let width, height, cols, rows;
let time = 0;
const mouse = { x: -1000, y: -1000 };

// Ajusta o tamanho do canvas quando a tela abre ou muda de tamanho
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cols = Math.ceil(width / CELL_SIZE);
    rows = Math.ceil(height / CELL_SIZE);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});
window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

resize();

// Função auxiliar para misturar duas cores suavemente
function lerpColor(c1, c2, factor) {
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    return { r, g, b };
}

function draw() {
    // 1. Pinta o fundo de preto/roxo bem escuro
    ctx.fillStyle = '#080510';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `bold ${CELL_SIZE}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    time += 0.015; // Velocidade da animação das ondas

    // 2. Percorre cada coluna e linha da grade desenhando as letras
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const px = x * CELL_SIZE + CELL_SIZE / 2;
            const py = y * CELL_SIZE + CELL_SIZE / 2;

            // Coordenadas normalizadas (de 0 a 1)
            const nx = x / cols;
            const ny = y / rows;

            // Cria ondas suaves com Seno e Cosseno para simular o brilho em movimento
            const wave1 = Math.sin(nx * 4 + time) * Math.cos(ny * 4 - time * 0.8);
            const wave2 = Math.sin((nx + ny) * 3 - time * 1.2);
            const intensity = (wave1 + wave2 + 2) / 4; // Valor final entre 0 e 1

            // Calcula a distância da letra atual até o cursor do mouse
            const dx = px - mouse.x;
            const dy = py - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let char;
            let alpha = Math.max(0.08, Math.pow(intensity, 1.6));

            // 3. Efeito de Scramble (embaralhar) embaixo do cursor
            if (dist < MOUSE_RADIUS) {
                const mouseFactor = 1 - (dist / MOUSE_RADIUS);
                // Quanto mais perto do centro do mouse, maior a chance de sortear um caractere maluco
                if (Math.random() < mouseFactor * 0.85) {
                    const randIndex = Math.floor(Math.random() * SCRAMBLE_CHARS.length);
                    char = SCRAMBLE_CHARS[randIndex];
                } else {
                    const charIndex = Math.floor(intensity * (CHARS.length - 1));
                    char = CHARS[charIndex];
                }
                // Deixa as letras mais brilhantes perto do mouse
                alpha = Math.min(1, alpha + mouseFactor * 0.6);
            } else {
                // Fora do mouse, escolhe o caractere baseado na intensidade do brilho da onda
                const charIndex = Math.floor(intensity * (CHARS.length - 1));
                char = CHARS[charIndex];
            }

            // Se for espaço vazio, não precisa gastar processamento desenhando
            if (char === ' ') continue;

            // 4. Calcula a cor do gradiente para a posição atual
            const colorPos = (nx + ny + Math.sin(time * 0.5) * 0.5) % 1;
            const c1 = COLORS[0];
            const c2 = COLORS[1];
            const c3 = COLORS[2];
            
            let rgb;
            if (colorPos < 0.5) {
                rgb = lerpColor(c1, c2, colorPos * 2);
            } else {
                rgb = lerpColor(c2, c3, (colorPos - 0.5) * 2);
            }

            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            ctx.fillText(char, px, py);
        }
    }

    requestAnimationFrame(draw);
}

draw();

// ==========================================
// EFEITO HOLO CARD 3D (PC + CELULAR)
// ==========================================
const card = document.querySelector('.container');

if (card) {
    function updateHolo(clientX, clientY) {
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const px = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const py = Math.max(0, Math.min(100, (y / rect.height) * 100));

        const rotateX = ((py - 50) / 50) * -12;
        const rotateY = ((px - 50) / 50) * 12;

        card.style.setProperty('--rx', `${rotateX}deg`);
        card.style.setProperty('--ry', `${rotateY}deg`);
        card.style.setProperty('--px', `${px}%`);
        card.style.setProperty('--py', `${py}%`);
        card.style.setProperty('--holo-opacity', '1');
    }

    function resetHolo() {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--px', '50%');
        card.style.setProperty('--py', '50%');
        card.style.setProperty('--holo-opacity', '0');
    }

    // Eventos para Mouse (PC)
    card.addEventListener('mousemove', (e) => updateHolo(e.clientX, e.clientY));
    card.addEventListener('mouseleave', resetHolo);

    // Eventos para Toque (Celular)
    card.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        updateHolo(touch.clientX, touch.clientY);
    }, { passive: true });
    card.addEventListener('touchend', resetHolo);
}    