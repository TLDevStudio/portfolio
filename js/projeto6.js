const api = (() => {
    const CHAVE_USERS = 'or_users';
    const CHAVE_SESSAO = 'or_sessao';
    const CHAVE_PROGRESSO = 'or_progresso';

    function _lerUsuarios() {
        try { return JSON.parse(localStorage.getItem(CHAVE_USERS)) || []; }
        catch { return []; }
    }
    function _salvarUsuarios(lista) {
        localStorage.setItem(CHAVE_USERS, JSON.stringify(lista));
    }
    function _seed() {
        const usuarios = _lerUsuarios();
        if (!usuarios.find(u => u.email === 'demo@ondaderesultados.com')) {
            usuarios.push({
                nome: 'Aluno Demonstração',
                email: 'demo@ondaderesultados.com',
                senha: 'demo123',
                comprou: true
            });
            _salvarUsuarios(usuarios);
        }
    }
    _seed();

    return {
        cadastrar(nome, email, senha) {
            const usuarios = _lerUsuarios();
            if (usuarios.find(u => u.email === email)) {
                return { erro: 'Este e-mail já está cadastrado.' };
            }
            usuarios.push({ nome, email, senha, comprou: false });
            _salvarUsuarios(usuarios);
            return { ok: true };
        },
        login(email, senha) {
            const usuarios = _lerUsuarios();
            const user = usuarios.find(u => u.email === email && u.senha === senha);
            if (!user) return { erro: 'E-mail ou senha inválidos.' };
            localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ email: user.email, nome: user.nome }));
            return { ok: true, nome: user.nome };
        },
        logout() {
            localStorage.removeItem(CHAVE_SESSAO);
        },
        estaLogado() {
            return !!localStorage.getItem(CHAVE_SESSAO);
        },
        usuarioAtual() {
            try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO)); }
            catch { return null; }
        },
        temAcesso() {
            const sessao = this.usuarioAtual();
            if (!sessao) return false;
            const usuarios = _lerUsuarios();
            const user = usuarios.find(u => u.email === sessao.email);
            return !!(user && user.comprou);
        },
        simularCompra(nome, email) {
            const usuarios = _lerUsuarios();
            let user = usuarios.find(u => u.email === email);
            if (!user) {
                user = { nome: nome || 'Aluno', email, senha: Math.random().toString(36).slice(2, 8), comprou: true };
                usuarios.push(user);
            } else {
                user.comprou = true;
                if (nome) user.nome = nome;
            }
            _salvarUsuarios(usuarios);
            localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ email: user.email, nome: user.nome }));
            return user;
        },
        progresso() {
            try { return JSON.parse(localStorage.getItem(CHAVE_PROGRESSO)) || {}; }
            catch { return {}; }
        },
        marcarAulaConcluida(idAula) {
            const p = this.progresso();
            p[idAula] = true;
            localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(p));
        }
    };
})();

/* módulos */
const MODULOS = [
    {
        id: 'mod1', numero: '01', titulo: 'Consórcio — Do Básico ao Fechamento',
        subtitulo: 'Como vender o produto mais incompreendido do banco',
        meta: '8 aulas · ~2h30',
        aulas: [
            'O que é consórcio, de verdade', 'Por que o cliente tem medo desse produto',
            'Como abrir a conversa sobre consórcio', 'Estratégia de lance explicada de forma simples',
            'Comparando consórcio x financiamento', 'Lidando com "já tentei antes"',
            'Fechamento: da simulação à assinatura', 'Estudo de caso real (anonimizado)'
        ]
    },
    {
        id: 'mod2', numero: '02', titulo: 'As Primeiras Abordagens de Alta Performance',
        subtitulo: 'A importância da primeira impressão',
        meta: '6 aulas · ~1h50',
        aulas: [
            'Por que os primeiros 10 segundos decidem tudo', 'Abordagem para clientes receptivos',
            'Abordagem para clientes indiferentes', 'Abordagem para clientes resistentes',
            'Perguntas que geram curiosidade', 'Prática: simulações de abertura'
        ]
    },
    {
        id: 'mod3', numero: '03', titulo: 'Financiamento Imobiliário',
        subtitulo: 'Como tornar o sonho da casa própria uma venda concreta',
        meta: '7 aulas · ~2h10',
        aulas: [
            'A jornada do cliente que quer financiar', 'Documentação sem gerar fricção',
            'Explicando taxas e amortização em linguagem simples', 'Objeções mais comuns e como responder',
            'Do primeiro contato à proposta', 'Acompanhamento até a assinatura',
            'Estudo de caso real (anonimizado)'
        ]
    },
    {
        id: 'mod4', numero: '04', titulo: 'Cartão de Crédito e Seguros',
        subtitulo: 'Cross-sell de alta eficiência sem forçar a barra',
        meta: '5 aulas · ~1h30',
        aulas: [
            'Quando oferecer cartão faz sentido', 'Seguros como proteção, não como "empurrado"',
            'Como aumentar o ticket médio com naturalidade', 'Scripts de cross-sell',
            'Prática guiada'
        ]
    },
    {
        id: 'mod5', numero: '05', titulo: 'Gestão de Carteira e Fidelização',
        subtitulo: 'O cliente que já comprou é o melhor cliente para a próxima venda',
        meta: '6 aulas · ~2h00',
        aulas: [
            'Por que fidelizar custa menos que captar', 'Régua de contato eficiente',
            'Como pedir indicações sem parecer forçado', 'Identificando o próximo produto certo',
            'Relacionamento de longo prazo', 'Estudo de caso real (anonimizado)'
        ]
    },
    {
        id: 'mod6', numero: '06', titulo: 'Planejamento de Metas e Rotina de Alta Performance',
        subtitulo: 'Como estruturar sua semana para nunca mais perder uma meta',
        meta: '4 aulas · ~1h20',
        aulas: [
            'Planejamento semanal na prática', 'Gestão de pipeline de oportunidades',
            'Mindset nos momentos de pressão', 'Rotina dos melhores vendedores'
        ]
    }
];

function ir(view, hash) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');
    document.getElementById('footerPublico').style.display = (view === 'home') ? 'block' : 'none';

    if (view === 'membros') {
        renderizarAreaMembros();
    }

    window.scrollTo(0, 0);
    if (hash) {
        setTimeout(() => {
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 60);
    }
    atualizarNav();
    fecharMenuMobile();
}

function atualizarNav() {
    const logado = api.estaLogado();
    document.getElementById('navAreaMembros').style.display = logado ? '' : 'none';
    document.getElementById('navEntrar').innerHTML = logado
        ? '<a onclick="ir(\'membros\')" class="nav-cta">Área de Membros</a>'
        : '<a onclick="ir(\'login\')" class="nav-cta">Entrar</a>';
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('open');
}

/* LOGIN / CADASTRO / CHECKOUT */
function fazerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value;
    const erroEl = document.getElementById('loginErro');
    erroEl.style.display = 'none';

    if (!email || !senha) {
        erroEl.textContent = 'Preencha email e senha.';
        erroEl.style.display = 'block';
        return;
    }
    const res = api.login(email, senha);
    if (res.erro) {
        erroEl.textContent = res.erro;
        erroEl.style.display = 'block';
        return;
    }
    ir('membros');
}

function fazerCadastro() {
    const nome = document.getElementById('cadNome').value.trim();
    const email = document.getElementById('cadEmail').value.trim();
    const senha = document.getElementById('cadSenha').value;
    const erroEl = document.getElementById('cadastroErro');
    const sucessoEl = document.getElementById('cadastroSucesso');
    erroEl.style.display = 'none';
    sucessoEl.style.display = 'none';

    if (!nome || !email || !senha) {
        erroEl.textContent = 'Preencha todos os campos.';
        erroEl.style.display = 'block';
        return;
    }
    if (senha.length < 6) {
        erroEl.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        erroEl.style.display = 'block';
        return;
    }
    const res = api.cadastrar(nome, email, senha);
    if (res.erro) {
        erroEl.textContent = res.erro;
        erroEl.style.display = 'block';
        return;
    }
    sucessoEl.textContent = 'Conta criada com sucesso! Redirecionando para o login...';
    sucessoEl.style.display = 'block';
    setTimeout(() => ir('login'), 1200);
}

function fazerLogout() {
    api.logout();
    atualizarNav();
    ir('home');
}

function irParaPagamento() {
    const email = document.getElementById('checkoutEmail').value.trim();
    const nome = document.getElementById('checkoutNome').value.trim();
    const msgEl = document.getElementById('checkoutMsg');
    const btn = document.getElementById('btnPagar');

    if (!email || !nome) {
        msgEl.style.background = '#fff0f0';
        msgEl.style.color = '#c62828';
        msgEl.textContent = 'Preencha nome e e-mail para continuar.';
        msgEl.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'Processando pagamento simulado...';

    setTimeout(() => {
        api.simularCompra(nome, email);
        msgEl.style.background = '#f0fff4';
        msgEl.style.color = '#2e7d32';
        msgEl.textContent = '✓ Pagamento simulado aprovado! Redirecionando para sua área de membros...';
        msgEl.style.display = 'block';
        setTimeout(() => {
            btn.disabled = false;
            btn.querySelector('.btn-label').textContent = '🔒 Pagar R$ 499,00 (simulado)';
            ir('membros');
        }, 1400);
    }, 1500);
}

function irParaCadastroDireto() { ir('cadastro'); }

const VIDEOS_DEMO = {
    1: '../videos/demo1.mp4',
    2: '../videos/demo2.mp4',
    3: '../videos/demo3.mp4'
};
function carregarVideo(n) {
    const container = document.getElementById('video' + n);
    container.innerHTML = `<video src="${VIDEOS_DEMO[n]}" controls autoplay playsinline></video>`;
}

/* RENDER: preview público de módulos bloqueados */
function renderizarModulosBloqueadosPublico() {
    const container = document.getElementById('modulos-bloqueados-publico');
    container.innerHTML = MODULOS.slice(1).map(m => `
    <div class="module" id="pub-${m.id}">
        <div class="module-header" onclick="toggleModulo('pub-${m.id}')">
            <span class="module-number">${m.numero}</span>
            <div class="module-title-wrap">
                <div class="module-title">${m.titulo}</div>
                <div class="module-subtitle">${m.subtitulo}</div>
            </div>
            <div class="module-meta">
                <span class="module-lessons">${m.meta}</span>
                <div class="lock-icon locked">🔒</div>
            </div>
        </div>
        <div class="module-body collapsed" id="pub-${m.id}-body">
            <div class="lock-overlay">
                <div class="lock-overlay-icon">🔒</div>
                <div class="lock-overlay-text">
                    <strong>Conteúdo bloqueado</strong>
                    Este módulo é desbloqueado após a confirmação da sua inscrição (simulada). Faça seu
                    cadastro para acessar todas as aulas.
                </div>
            </div>
        </div>
    </div>
    `).join('');
}

function renderizarPreviewMod1() {
    const m = MODULOS[0];
    document.getElementById('lista-mod1-preview').innerHTML = m.aulas.map((titulo, i) => `
    <div class="lesson" onclick="abrirAulaModal('${m.id}', ${i})">
        <div class="lesson-icon">▶</div>
        <div class="lesson-text">
            <div class="lesson-title">${i + 1}. ${titulo}</div>
        </div>
        <div class="lesson-duration">${8 + i * 2} min</div>
    </div>
    `).join('');
}

let aulaAtual = { moduloId: null, index: 0 };

// Único vídeo usado em todas as aulas do protótipo
const VIDEO_DEMO_UNICO = '../videos/demo3.mp4';
const PDF_DEMO_UNICO = '../pdfs/material-aula.pdf';

function getVideoSrc(idModulo, index) {
    return VIDEO_DEMO_UNICO;
}

function getPdfSrc(idModulo, index) {
    return PDF_DEMO_UNICO;
}

function abrirAulaModal(idModulo, index) {
    aulaAtual = { moduloId: idModulo, index };
    renderizarAulaModal();
    const modal = document.getElementById('aulaModal');
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function renderizarAulaModal() {
    const modulo = MODULOS.find(m => m.id === aulaAtual.moduloId);
    if (!modulo) return;
    const titulo = modulo.aulas[aulaAtual.index];

    document.getElementById('aulaModuloTag').textContent =
        `MÓDULO ${modulo.numero} · ${modulo.titulo.toUpperCase()}`;
    document.getElementById('aulaTitulo').textContent = `${aulaAtual.index + 1}. ${titulo}`;
    document.getElementById('aulaContador').textContent = `Aula ${aulaAtual.index + 1} de ${modulo.aulas.length}`;

    const video = document.getElementById('aulaVideoPlayer');
    video.pause();
    video.onerror = () => {
        console.warn('Vídeo de demonstração não encontrado em:', video.src);
    };
    video.src = getVideoSrc(aulaAtual.moduloId, aulaAtual.index);
    video.load();

    document.getElementById('aulaBtnAnterior').disabled = aulaAtual.index === 0;
    document.getElementById('aulaBtnProxima').disabled = aulaAtual.index === modulo.aulas.length - 1;

    const pdfSrc = getPdfSrc(aulaAtual.moduloId, aulaAtual.index);
    const nomeArquivo = `material-aula-${String(aulaAtual.index + 1).padStart(2, '0')}.pdf`;
    document.getElementById('aulaMaterialNome').textContent = nomeArquivo;
    const linkPdf = document.getElementById('aulaMaterialLink');
    linkPdf.href = pdfSrc;
    linkPdf.setAttribute('download', nomeArquivo);
}

function aulaAnterior() {
    if (aulaAtual.index > 0) { aulaAtual.index--; renderizarAulaModal(); }
}

function aulaProxima() {
    const modulo = MODULOS.find(m => m.id === aulaAtual.moduloId);
    if (modulo && aulaAtual.index < modulo.aulas.length - 1) {
        aulaAtual.index++;
        renderizarAulaModal();
    }
}

function fecharAulaModal() {
    const modal = document.getElementById('aulaModal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.getElementById('aulaVideoPlayer').pause();
}

function toggleModulo(id) {
    const body = document.getElementById(id + '-body');
    if (body) body.classList.toggle('collapsed');
    const moduleEl = document.getElementById(id);
    if (moduleEl) moduleEl.classList.toggle('open');
}

/* ÁREA DE MEMBROS (protegida — precisa de login + compra) */
function renderizarAreaMembros() {
    const conteudo = document.getElementById('membrosConteudo');

    if (!api.estaLogado()) {
        conteudo.innerHTML = `
                    <div class="locked-banner">
                        <h2>Faça login para continuar</h2>
                        <p>Você precisa entrar na sua conta para acessar a área de membros.</p>
                        <a onclick="ir('login')" class="btn-primary" style="cursor:pointer;">Fazer Login</a>
                    </div>`;
        return;
    }
    if (!api.temAcesso()) {
        conteudo.innerHTML = `
                    <div class="locked-banner">
                        <h2>Seu acesso ainda não foi liberado</h2>
                        <p>Finalize sua inscrição (simulada) para desbloquear todos os módulos da mentoria.</p>
                        <a onclick="ir('checkout')" class="btn-primary" style="cursor:pointer;">Concluir Inscrição</a>
                    </div>`;
        return;
    }

    const user = api.usuarioAtual();
    document.getElementById('nomeAluno').textContent = user.nome || 'Aluno';

    const progresso = api.progresso();
    let totalAulas = 0, concluidas = 0;
    MODULOS.forEach(m => m.aulas.forEach((_, i) => {
        totalAulas++;
        if (progresso[m.id + '-' + i]) concluidas++;
    }));
    const pct = totalAulas ? Math.round((concluidas / totalAulas) * 100) : 0;

    const modulosHtml = MODULOS.map((m, mi) => {
        const aulasHtml = m.aulas.map((titulo, i) => {
            const chaveAula = m.id + '-' + i;
            const feito = !!progresso[chaveAula];
            return `
    <div class="lesson" onclick="abrirAulaModal('${m.id}', ${i})">
        <div class="lesson-icon">${feito ? '✓' : '▶'}</div>
        <div class="lesson-text">
            <div class="lesson-title">${i + 1}. ${titulo}</div>
            <div class="lesson-bar-wrap"><div class="lesson-bar" style="width:${feito ? 100 : 0}%; background:var(--gold);"></div></div>
        </div>
        <div class="lesson-duration">${feito ? 'Concluída' : (8 + i * 2) + ' min'}</div>
    </div>`;
        }).join('');

        const aulasNoModulo = m.aulas.length;
        const concluidasNoModulo = m.aulas.filter((_, i) => progresso[m.id + '-' + i]).length;

        return `
    <div class="module ${mi === 0 ? 'open' : ''}" id="${m.id}">
        <div class="module-header" onclick="toggleModulo('${m.id}')">
            <span class="module-number">${m.numero}</span>
            <div class="module-title-wrap">
                <div class="module-title">${m.titulo}</div>
                <div class="module-subtitle">${m.subtitulo}</div>
            </div>
            <div class="module-meta">
                <span class="module-lessons">${m.meta}</span>
                <div class="anel-container">${concluidasNoModulo}/${aulasNoModulo}</div>
                <span class="module-chevron">▼</span>
            </div>
        </div>
        <div class="module-body ${mi === 0 ? '' : 'collapsed'}" id="${m.id}-body">
            <p class="module-intro">${m.subtitulo}.</p>
            <div>${aulasHtml}</div>
        </div>
    </div>`;
    }).join('');

    conteudo.innerHTML = `
    <div class="membros-hero">
        <p class="membros-hero-tag">Área de Membros</p>
        <h1>Bem-vindo à Mentoria</h1>
        <p>Seu espaço exclusivo de aprendizado em vendas bancárias</p>
        <div class="progresso-geral">
            <div class="prog-stat"><div class="prog-stat-num">${concluidas}</div><div class="prog-stat-label">Aulas Concluídas</div></div>
            <div class="prog-stat"><div class="prog-stat-num">${MODULOS.length}</div><div class="prog-stat-label">Módulos Disponíveis</div></div>
            <div class="prog-stat"><div class="prog-stat-num">${totalAulas}</div><div class="prog-stat-label">Total de Aulas</div></div>
        </div>
        <div class="prog-bar-wrap">
            <div class="prog-bar-label"><span>Progresso geral</span><span>${pct}%</span></div>
            <div class="prog-bar-track"><div class="prog-bar-fill" style="width:${pct}%"></div></div>
        </div>
    </div>
    <div class="membros-content">
        <p class="section-tag">Grade de Conteúdo</p>
        <h2 class="section-title">Módulos da Mentoria</h2>
        <p class="section-subtitle">Todos os módulos desbloqueados. Clique em qualquer aula para marcar
            como assistida (simulado).</p>
        ${modulosHtml}
    </div>
    <footer class="membros-footer">
        <div class="membros-footer-logo">Onda de <span>Resultados</span></div>
        <p>© 2026 · Protótipo de portfólio — mentoria e mentor fictícios</p>
    </footer>
    `;
}

function marcarAula(chave) {
    api.marcarAulaConcluida(chave);
    renderizarAreaMembros();
}

function animarContadores() {
    document.querySelectorAll('.hero-stat-num[data-target]').forEach(el => {
        const alvo = parseInt(el.getAttribute('data-target'), 10);
        const sufixo = el.getAttribute('data-suffix') || '';
        let atual = 0;
        const passo = Math.max(1, Math.round(alvo / 40));
        const timer = setInterval(() => {
            atual += passo;
            if (atual >= alvo) { atual = alvo; clearInterval(timer); }
            el.textContent = atual + sufixo;
        }, 25);
    });
}

/* REVEAL ON SCROLL */
function iniciarRevealOnScroll() {
    const alvos = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
    }, { threshold: 0.12 });
    alvos.forEach(el => obs.observe(el));
}

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
    renderizarPreviewMod1();
    renderizarModulosBloqueadosPublico();
    animarContadores();
    iniciarRevealOnScroll();
    atualizarNav();
});

function initNavLogoWave() {
    const container = document.getElementById('navLogo');
    const canvasEl = document.getElementById('navLogoCanvas');
    if (!container || !canvasEl || typeof THREE === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
        u_time: { value: 0 },
        u_base: { value: new THREE.Color('#F8F6F0') },
        u_wave1: { value: new THREE.Color('#E8C97A') },
        u_wave2: { value: new THREE.Color('#C9A84C') },
        u_wave3: { value: new THREE.Color('#A07830') },
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
    varying vec2 vUv;
    void main(){
        vUv = uv;
    gl_Position = vec4(position, 1.0);
      }
    `,
        fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float u_time;
    uniform vec3  u_base;
    uniform vec3  u_wave1;
    uniform vec3  u_wave2;
    uniform vec3  u_wave3;

    float waveLine(vec2 uv, float baseline, float freq, float speed, float amp, float phase){
        return baseline + sin(uv.x * freq + u_time * speed + phase) * amp;
      }

    void main(){
        vec2 uv = vUv;
    vec3 col = u_base;
    float edge = 0.025;

    float l1 = waveLine(uv, 0.40, 4.0, 0.35, 0.07, 0.0);
    float f1 = 1.0 - smoothstep(l1 - edge, l1 + edge, uv.y);
    col = mix(col, u_wave1, f1 * 0.35);

    float l2 = waveLine(uv, 0.28, 5.5, 0.55, 0.055, 2.4);
    float f2 = 1.0 - smoothstep(l2 - edge, l2 + edge, uv.y);
    col = mix(col, u_wave2, f2 * 0.55);

    float l3 = waveLine(uv, 0.15, 7.0, 0.8, 0.045, 4.8);
    float f3 = 1.0 - smoothstep(l3 - edge, l3 + edge, uv.y);
    col = mix(col, u_wave3, f3 * 0.85);

    float sheen = smoothstep(0.0, 1.0, sin(uv.x * 6.283 - u_time * 0.4) * 0.5 + 0.5);
    col += u_wave3 * sheen * 0.05 * f3;

    gl_FragColor = vec4(col, 1.0);
      }
    `
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h, false);
    }
    resize();

    if ('ResizeObserver' in window) {
        new ResizeObserver(resize).observe(container);
    } else {
        window.addEventListener('resize', resize);
    }

    const SPEED_FACTOR = 2.2;

    const clock = new THREE.Clock();
    function animate() {
        uniforms.u_time.value = clock.getElapsedTime() * SPEED_FACTOR;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

window.addEventListener('DOMContentLoaded', initNavLogoWave);



function initHeroWaveBg() {

    const container = document.getElementById('wave-bg');
    const canvasEl = document.getElementById('heroWaveCanvas');

    if (!container || !canvasEl || typeof THREE === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {

        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_goldPale: { value: new THREE.Color('#F0DFAE') },
        u_goldLight: { value: new THREE.Color('#E8C97A') },
        u_gold: { value: new THREE.Color('#C9A84C') },
        u_goldDark: { value: new THREE.Color('#A07830') },
        u_goldDeep: { value: new THREE.Color('#7A5A20') },
        u_foam: { value: new THREE.Color('#FDF9EE') },
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthTest: false,
        vertexShader: `

    varying vec2 vUv;
    void main(){
        vUv = uv;
    gl_Position = vec4(position, 1.0);
                }
    `,

        fragmentShader: `

    precision highp float;
    varying vec2 vUv;
    uniform float u_time;
    uniform vec2  u_resolution;
    uniform vec3  u_goldPale;
    uniform vec3  u_goldLight;
    uniform vec3  u_gold;
    uniform vec3  u_goldDark;
    uniform vec3  u_goldDeep;
    uniform vec3  u_foam;

    float oceanWave(float flowX, float t, float speed, float scale){
        float w = 0.0;
    w += sin(flowX * 4.0  * scale + t * speed)               * 0.5;
    w += sin(flowX * 8.0  * scale + t * speed * 1.6 + 1.5)    * 0.25;
    w += sin(flowX * 14.0 * scale + t * speed * 0.7 + 3.0)    * 0.15;
    w += sin(flowX * 20.0 * scale + t * speed * 2.1 + 4.5)    * 0.08;
    return w;

                }

    vec4 waveLayer(vec2 uv, float aspect, float baseline, float amp, float speed, float scale, float tilt, float skew, vec3 color, float fillAlpha){
        float x = uv.x * aspect;
    float y = uv.y;
    float flowX = x - y * skew;
    float crestBase = baseline + uv.x * tilt;
    float w = oceanWave(flowX, u_time, speed, scale) * amp;
    float crest = crestBase + w;
    float fill = 1.0 - smoothstep(crest - 0.02, crest + 0.004, y);
    float glow = 1.0 - smoothstep(0.0, 0.018, abs(y - crest));
    float foamLine = 1.0 - smoothstep(0.0, 0.006, abs(y - (crest + 0.012)));
    vec3 finalColor = mix(color, u_foam, foamLine * 0.7);
    float alpha = fill * fillAlpha + glow * fillAlpha * 0.6 + foamLine * fillAlpha * 0.6;
    return vec4(finalColor, clamp(alpha, 0.0, 1.0));
                }

    void main(){

        vec2 uv = vUv;
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec3 col = vec3(0.0);
    float alpha = 0.0;
    vec4 l1 = waveLayer(uv, aspect, 0.30, 0.05, 0.35, 0.55, 0.40, 0.75, u_goldPale, 0.30);
    col = mix(col, l1.rgb, l1.a);
    alpha = max(alpha, l1.a);
    vec4 l2 = waveLayer(uv, aspect, 0.21, 0.05, 0.48, 0.68, 0.48, 0.85, u_goldLight, 0.40);
    col = mix(col, l2.rgb, l2.a);
    alpha = max(alpha, l2.a);
    vec4 l3 = waveLayer(uv, aspect, 0.13, 0.05, 0.62, 0.80, 0.56, 0.95, u_gold, 0.50);
    col = mix(col, l3.rgb, l3.a);
    alpha = max(alpha, l3.a);
    vec4 l4 = waveLayer(uv, aspect, 0.06, 0.045, 0.78, 0.92, 0.64, 1.05, u_goldDark, 0.58);
    col = mix(col, l4.rgb, l4.a);
    alpha = max(alpha, l4.a);
    vec4 l5 = waveLayer(uv, aspect, 0.00, 0.03, 0.92, 1.05, 0.72, 1.15, u_goldDeep, 0.55);
    col = mix(col, l5.rgb, l5.a);
    alpha = max(alpha, l5.a);
    float topFade = smoothstep(0.44, 0.68, uv.y);
    alpha *= (1.0 - topFade);
    gl_FragColor = vec4(col, alpha);
                }

    `

    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;
        renderer.setSize(w, h, false);
        uniforms.u_resolution.value.set(w, h);
    }

    resize();

    if ('ResizeObserver' in window) {
        new ResizeObserver(resize).observe(container);
    } else {
        window.addEventListener('resize', resize);
    }

    const SPEED_FACTOR = 2.5;
    const clock = new THREE.Clock();

    function animate() {

        uniforms.u_time.value = clock.getElapsedTime() * SPEED_FACTOR;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

window.addEventListener('DOMContentLoaded', initHeroWaveBg);

// mercado ao vivo
async function fetchMarket() {
    const el = document.getElementById('marketItems');
    if (!el) return;

    try {
        const [cryptoRes, fxRes] = await Promise.allSettled([
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl&include_24hr_change=true'),
            fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL')
        ]);

        const items = [];

        if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
            const crypto = await cryptoRes.value.json();
            const fmt = n => n >= 1000
                ? 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
                : 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            items.push({ icon: '₿', name: 'Bitcoin', label: 'BTC', price: fmt(crypto.bitcoin.brl), change: crypto.bitcoin.brl_24h_change });
            items.push({ icon: '⟠', name: 'Ethereum', label: 'ETH', price: fmt(crypto.ethereum.brl), change: crypto.ethereum.brl_24h_change });
            items.push({ icon: '◎', name: 'Solana', label: 'SOL', price: fmt(crypto.solana.brl), change: crypto.solana.brl_24h_change });
        }

        if (fxRes.status === 'fulfilled' && fxRes.value.ok) {
            const fx = await fxRes.value.json();
            const fmtFx = n => 'R$ ' + parseFloat(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            items.push({ icon: '🇺🇸', name: 'Dólar', label: 'USD/BRL', price: fmtFx(fx.USDBRL.bid), change: parseFloat(fx.USDBRL.pctChange) });
            items.push({ icon: '🇪🇺', name: 'Euro', label: 'EUR/BRL', price: fmtFx(fx.EURBRL.bid), change: parseFloat(fx.EURBRL.pctChange) });
        }

        items.push({ icon: '🏦', name: 'CDI', label: 'Taxa anual', price: '13,65% a.a.', change: null });
        items.push({ icon: '📊', name: 'IPCA', label: '12 meses', price: '4,83%', change: null });

        if (!items.length) {
            el.innerHTML = '<div class="market-loading">Dados indisponíveis</div>';
            return;
        }

        el.innerHTML = items.map(item => {
            const cls = item.change == null ? 'neu' : item.change >= 0 ? 'up' : 'down';
            const txt = item.change == null ? '—' : (item.change >= 0 ? '▲ ' : '▼ ') + Math.abs(item.change).toFixed(2) + '%';
            return `
    <div class="market-item">
        <div class="market-item-left">
            <div class="market-icon">${item.icon}</div>
            <div>
                <div class="market-name">${item.name}</div>
                <div class="market-label">${item.label}</div>
            </div>
        </div>
        <div class="market-right">
            <div class="market-price">${item.price}</div>
            <div class="market-change ${cls}">${txt}</div>
        </div>
    </div>`;
        }).join('');

        setTimeout(() => {
            document.querySelectorAll('.market-item').forEach(item => {
                item.classList.add('updated');
                setTimeout(() => item.classList.remove('updated'), 700);
            });
        }, 50);

    } catch {
        el.innerHTML = '<div class="market-loading">Erro ao carregar dados</div>';
    }
}

fetchMarket();
setInterval(fetchMarket, 60000);

// ONDA 3D (Three.js) — efeito visual do hero

function initWaveBackground() {
    const container = document.getElementById('wave-bg');
    if (!container || typeof THREE === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    if (!width || !height) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);

    const isNarrow = width / height < 0.9;
    camera.position.set(0, isNarrow ? 20 : 14, isNarrow ? 30 : 22);
    camera.lookAt(0, -3, -2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const WIDTH = 46, DEPTH = 46, SEG = 26;
    const geometry = new THREE.PlaneGeometry(WIDTH, DEPTH, SEG, SEG);
    geometry.rotateX(-Math.PI / 2.15);

    const posAttr = geometry.attributes.position;
    const base = Float32Array.from(posAttr.array);

    const colorAttr = new THREE.BufferAttribute(new Float32Array(posAttr.count * 3), 3);
    geometry.setAttribute('color', colorAttr);

    const navy = new THREE.Color('#1A1A2E');
    const gold = new THREE.Color('#C9A84C');
    const cream = new THREE.Color('#F4EFE3');

    const surfaceMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const surface = new THREE.Mesh(geometry, surfaceMat);
    scene.add(surface);

    const wireMat = new THREE.MeshBasicMaterial({
        color: 0xC9A84C,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
        depthWrite: false
    });
    const wire = new THREE.Mesh(geometry, wireMat);
    scene.add(wire);

    let t = 0;
    let rafId = null;

    function animate() {
        t += 0.005;
        const pos = posAttr.array;
        const col = colorAttr.array;

        for (let i = 0; i < posAttr.count; i++) {
            const ix = i * 3;
            const x = base[ix];
            const z = base[ix + 2];

            const wave = Math.sin(x * 0.16 + t * 1.3) * 0.75
                + Math.sin(z * 0.22 + t * 0.9) * 0.55
                + Math.sin((x + z) * 0.09 + t * 0.5) * 0.4;

            pos[ix + 1] = base[ix + 1] + wave;

            const mix = THREE.MathUtils.clamp((wave + 2.2) / 4.4, 0, 1);
            const c = navy.clone().lerp(gold, mix).lerp(cream, mix * 0.25);
            col[ix] = c.r; col[ix + 1] = c.g; col[ix + 2] = c.b;
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate);
    }
    animate();

    // --- responsivo ---
    function onResize() {
        width = container.clientWidth;
        height = container.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    // pausa quando a aba não está visível (economiza bateria/CPU)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        } else if (!rafId) {
            animate();
        }
    });
}

// UTILITÁRIOS — nav, reveal, contadores

function toggleModule(id) {
    const body = document.getElementById(id + '-body');
    if (!body) return;
    body.classList.toggle('collapsed');
}

const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (nav) nav.style.boxShadow = window.scrollY > 10
        ? '0 2px 20px rgba(0,0,0,0.08)'
        : 'none';
});

const reveals = document.querySelectorAll('.reveal');
function revealOnScroll() {
    reveals.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
            el.classList.add('show');
        } else {
            el.classList.remove('show');
        }
    });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

function animateCounters() {
    document.querySelectorAll('.hero-stat-num').forEach(counter => {
        const target = Number(counter.dataset.target);
        const suffix = counter.dataset.suffix || '';
        let current = 0;
        const inc = target / 80;
        const update = () => {
            current += inc;
            if (current >= target) {
                counter.textContent = target + suffix;
            } else {
                counter.textContent = Math.floor(current) + suffix;
                requestAnimationFrame(update);
            }
        };
        update();
    });
}

/* MODAL DE COMPRA */
function openModal() {
    const modal = document.getElementById('purchaseModal');

    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}


/* FECHAR MODAL */

function closeModal() {
    const modal = document.getElementById('purchaseModal');

    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}


/* IR PARA CHECKOUT */

function goToWhatsApp() {
    const numero = "5521975930204";
    const mensagem = encodeURIComponent(
        "Olá! Vi a demonstração da Landing Page + Plataforma de Curso e tenho interesse no projeto a partir de R$ 3.499. Gostaria de saber mais detalhes."
    );

    window.open(
        `https://wa.me/${5521975930204}?text=${mensagem}`,
        "_blank"
    );
}


/* ESC FECHA O MODAL */

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeModal();
        fecharAulaModal();
    }
});