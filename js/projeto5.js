let ordens = JSON.parse(localStorage.getItem('motoos_ordens') || '[]');
let editandoId = null;
let confirmCallback = null;

document.addEventListener('DOMContentLoaded', () => {
    gerarOS();
    addServico();
    renderDashboard();
});

function gerarOS() {
    document.getElementById('osNumero').textContent = Math.floor(10000 + Math.random() * 90000);
    document.getElementById('osData').textContent = new Date().toLocaleDateString('pt-BR');
}

function salvarOrdensLocal() {
    localStorage.setItem('motoos_ordens', JSON.stringify(ordens));
}

function showTab(tab) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + tab).classList.add('active');
    document.querySelectorAll('.tab-btn')[['nova', 'historico', 'dashboard'].indexOf(tab)].classList.add('active');
    if (tab === 'historico') renderHistorico();
    if (tab === 'dashboard') renderDashboard();
}

function addServico(desc = '', val = '') {
    const container = document.getElementById('f-servicos');
    const row = document.createElement('div');
    row.className = 'service-row';
    row.innerHTML = `
        <input class="form-input svc-desc" placeholder="Descrição do serviço" value="${desc}" oninput="calcTotal()"/>
        <input class="form-input svc-val" type="number" placeholder="R$ 0,00" value="${val}" oninput="calcTotal()" min="0" step="0.01"/>
        <button class="btn-remove-svc" onclick="this.closest('.service-row').remove(); calcTotal();" title="Remover">✕</button>
      `;
    container.appendChild(row);
    calcTotal();
}

function calcTotal() {
    const vals = document.querySelectorAll('.svc-val');
    let total = 0;
    vals.forEach(v => total += parseFloat(v.value) || 0);
    document.getElementById('f-total').textContent = total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById('qtd-servicos').textContent = vals.length + ' serviço(s)';
}

function salvarOS() {
    const nome = document.getElementById('f-nome').value.trim();
    if (!nome) { showToast('Informe o nome do cliente', 'error'); return; }

    const servicos = [];
    document.querySelectorAll('.service-row').forEach(row => {
        const d = row.querySelector('.svc-desc').value.trim();
        const v = parseFloat(row.querySelector('.svc-val').value) || 0;
        if (d) servicos.push({ descricao: d, valor: v });
    });

    const total = servicos.reduce((s, sv) => s + sv.valor, 0);

    const os = {
        id: editandoId || Date.now().toString(),
        numero: document.getElementById('osNumero').textContent,
        data: document.getElementById('osData').textContent,
        nome,
        telefone: document.getElementById('f-tel').value,
        endereco: document.getElementById('f-end').value,
        placa: document.getElementById('f-placa').value,
        km: document.getElementById('f-km').value,
        marca: document.getElementById('f-marca').value,
        obs: document.getElementById('f-obs').value,
        servicos,
        total,
        status: 'aberta'
    };

    if (editandoId) {
        const idx = ordens.findIndex(o => o.id === editandoId);
        if (idx !== -1) ordens[idx] = os;
        editandoId = null;
        showToast('OS atualizada com sucesso!');
    } else {
        ordens.unshift(os);
        showToast('OS salva com sucesso!');
    }

    salvarOrdensLocal();
    limparForm();
    renderDashboard();
}

function limparForm() {
    ['f-nome', 'f-tel', 'f-end', 'f-placa', 'f-km', 'f-marca', 'f-obs'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-servicos').innerHTML = '';
    editandoId = null;
    gerarOS();
    addServico();
    calcTotal();
}

function renderHistorico(filtro = '') {
    const lista = document.getElementById('lista-historico');
    const f = filtro.toLowerCase();
    const filtered = ordens.filter(os =>
        os.nome.toLowerCase().includes(f) ||
        (os.placa || '').toLowerCase().includes(f) ||
        os.numero.includes(f)
    );

    if (!filtered.length) {
        lista.innerHTML = `<div class="history-empty"><div class="empty-icon">📋</div>Nenhuma OS encontrada</div>`;
        return;
    }

    lista.innerHTML = filtered.map(os => `
        <div class="os-card" id="card-${os.id}">
          <div class="os-card-header">
            <div>
              <div class="os-card-num">OS #${os.numero} <span>· ${os.data}</span></div>
              <div style="margin-top:0.3rem">
                <span class="status-badge ${os.status || 'aberta'}">${statusLabel(os.status)}</span>
              </div>
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:flex-start">
              <select class="form-select" style="font-size:0.58rem;padding:0.35rem 0.5rem;width:auto" onchange="alterarStatus('${os.id}', this.value)">
                <option value="aberta" ${os.status === 'aberta' ? 'selected' : ''}>Aberta</option>
                <option value="pendente" ${os.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                <option value="concluida" ${os.status === 'concluida' ? 'selected' : ''}>Concluída</option>
              </select>
            </div>
          </div>
          <div class="os-card-body">
            <div><div class="os-field-label">Cliente</div><div class="os-field-val">${os.nome}</div></div>
            <div><div class="os-field-label">Placa</div><div class="os-field-val">${os.placa || '—'}</div></div>
            <div><div class="os-field-label">Moto</div><div class="os-field-val">${os.marca || '—'}</div></div>
            <div><div class="os-field-label">Telefone</div><div class="os-field-val">${os.telefone || '—'}</div></div>
            <div><div class="os-field-label">KM</div><div class="os-field-val">${os.km ? os.km + ' km' : '—'}</div></div>
            <div><div class="os-field-label">Serviços</div><div class="os-field-val">${os.servicos.length} item(ns)</div></div>
          </div>
          ${os.servicos.length ? `
          <div class="os-services-list">
            ${os.servicos.map(s => `
              <div class="os-service-item">
                <span>${s.descricao}</span>
                <span class="os-service-price">R$ ${Number(s.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
          </div>` : ''}
          ${os.obs ? `<div style="margin-top:0.8rem;padding:0.8rem;background:var(--card);border-left:2px solid var(--border2)"><div class="os-field-label" style="margin-bottom:0.3rem">Observações</div><div style="font-size:0.82rem;color:var(--muted2);line-height:1.6">${os.obs}</div></div>` : ''}
          <div class="os-card-footer">
            <div>
              <div class="os-field-label">Total</div>
              <div class="os-total-display"><span>R$ </span>${Number(os.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="os-card-actions">
              <button class="btn btn-outline btn-sm" onclick="editarOS('${os.id}')">✏️ Editar</button>
              <button class="btn btn-green btn-sm" onclick="gerarPDFOS('${os.id}')">📄 PDF</button>
              ${os.telefone ? `<a class="btn btn-sm" href="https://wa.me/55${os.telefone.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(os.nome)}!%20Sua%20OS%20Nº${os.numero}%20foi%20registrada.%20Total%3A%20R%24%20${os.total.toFixed ? os.total.toFixed(2) : os.total}" target="_blank" style="background:rgba(37,211,102,0.15);color:#22c55e;border:1px solid rgba(37,211,102,0.3)">💬 WA</a>` : ''}
              <button class="btn btn-sm" style="background:rgba(239,68,68,0.15);color:var(--red);border:1px solid rgba(239,68,68,0.3)" onclick="confirmarExcluir('${os.id}')">🗑</button>
            </div>
          </div>
        </div>
      `).join('');
}

function filtrarHistorico(v) { renderHistorico(v); }

function statusLabel(s) {
    if (s === 'concluida') return '✓ Concluída';
    if (s === 'pendente') return '⚠ Pendente';
    return '● Aberta';
}

function alterarStatus(id, status) {
    const os = ordens.find(o => o.id === id);
    if (os) { os.status = status; salvarOrdensLocal(); renderHistorico(document.getElementById('busca-input').value); }
}

function editarOS(id) {
    const os = ordens.find(o => o.id === id);
    if (!os) return;
    editandoId = id;
    document.getElementById('f-nome').value = os.nome;
    document.getElementById('f-tel').value = os.telefone || '';
    document.getElementById('f-end').value = os.endereco || '';
    document.getElementById('f-placa').value = os.placa || '';
    document.getElementById('f-km').value = os.km || '';
    document.getElementById('f-marca').value = os.marca || '';
    document.getElementById('f-obs').value = os.obs || '';
    document.getElementById('osNumero').textContent = os.numero;
    document.getElementById('osData').textContent = os.data;
    document.getElementById('f-servicos').innerHTML = '';
    os.servicos.forEach(s => addServico(s.descricao, s.valor));
    showTab('nova');
    showToast('Editando OS #' + os.numero);
}

function confirmarExcluir(id) {
    confirmCallback = id;
    document.getElementById('confirm-dialog').classList.add('open');
    document.getElementById('confirm-yes').onclick = () => {
        excluirOS(confirmCallback);
        closeConfirm();
    };
}
function closeConfirm() { document.getElementById('confirm-dialog').classList.remove('open'); }
function excluirOS(id) {
    ordens = ordens.filter(o => o.id !== id);
    salvarOrdensLocal();
    renderHistorico(document.getElementById('busca-input').value);
    renderDashboard();
    showToast('OS excluída');
}

function renderDashboard() {
    const total = ordens.length;
    const fat = ordens.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
    const ticket = total ? fat / total : 0;
    const servs = ordens.reduce((s, o) => s + (o.servicos ? o.servicos.length : 0), 0);

    document.getElementById('d-total').textContent = total;
    document.getElementById('d-faturamento').textContent = 'R$ ' + fat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('d-ticket').textContent = 'R$ ' + ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('d-servicos').textContent = servs;

    const recentes = document.getElementById('dash-recentes');
    const top5 = ordens.slice(0, 5);
    if (!top5.length) {
        recentes.innerHTML = `<div class="history-empty"><div class="empty-icon">📊</div>Nenhuma OS registrada ainda</div>`;
        return;
    }
    recentes.innerHTML = top5.map(os => `
        <div class="os-card" style="margin-bottom:0.6rem;cursor:pointer" onclick="showTab('historico')">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
            <div>
              <div class="os-card-num" style="font-size:1.1rem">OS #${os.numero} — ${os.nome}</div>
              <div style="font-size:0.78rem;color:var(--muted);margin-top:0.2rem">${os.placa || '—'} · ${os.marca || '—'} · ${os.data}</div>
            </div>
            <div style="display:flex;align-items:center;gap:0.8rem">
              <span class="status-badge ${os.status || 'aberta'}">${statusLabel(os.status)}</span>
              <div class="os-total-display" style="font-size:1.4rem">R$ ${Number(os.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      `).join('');
}

function coletarDadosForm() {
    const servicos = [];
    document.querySelectorAll('.service-row').forEach(row => {
        const d = row.querySelector('.svc-desc').value.trim();
        const v = parseFloat(row.querySelector('.svc-val').value) || 0;
        if (d) servicos.push({ descricao: d, valor: v });
    });
    return {
        numero: document.getElementById('osNumero').textContent,
        data: document.getElementById('osData').textContent,
        nome: document.getElementById('f-nome').value,
        telefone: document.getElementById('f-tel').value,
        endereco: document.getElementById('f-end').value,
        placa: document.getElementById('f-placa').value,
        km: document.getElementById('f-km').value,
        marca: document.getElementById('f-marca').value,
        obs: document.getElementById('f-obs').value,
        servicos,
        total: servicos.reduce((s, sv) => s + sv.valor, 0)
    };
}

function gerarPDF() { gerarPDFDados(coletarDadosForm()); }
function gerarPDFOS(id) {
    const os = ordens.find(o => o.id === id);
    if (os) gerarPDFDados(os);
}

function gerarPDFDados(os) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 15;

    doc.setFillColor(17, 17, 17);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 107, 26);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MOTO OS PRO', 15, 18);
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Ordem de Serviço', 15, 26);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`OS Nº ${os.numero}`, 195, 18, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${os.data}`, 195, 26, { align: 'right' });

    y = 45;

    doc.setFillColor(240, 240, 240);
    doc.rect(10, y - 5, 190, 8, 'F');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 15, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);

    const campos = [
        ['Cliente', os.nome], ['Telefone', os.telefone], ['Endereço', os.endereco],
        ['Placa', os.placa], ['KM', os.km ? os.km + ' km' : ''], ['Moto', os.marca]
    ];

    campos.forEach(([label, val]) => {
        if (!val) return;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(label.toUpperCase() + ':', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text(String(val), 50, y);
        y += 7;
    });

    y += 5;

    doc.setFillColor(240, 240, 240);
    doc.rect(10, y - 5, 190, 8, 'F');
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SERVIÇOS REALIZADOS', 15, y);
    y += 8;

    doc.setFillColor(30, 30, 30);
    doc.rect(10, y - 4, 190, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('DESCRIÇÃO', 15, y);
    doc.text('VALOR', 185, y, { align: 'right' });
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    os.servicos.forEach((s, i) => {
        if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(10, y - 4, 190, 7, 'F'); }
        doc.setTextColor(30, 30, 30);
        doc.text(String(s.descricao), 15, y);
        doc.setTextColor(200, 80, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('R$ ' + Number(s.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 185, y, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        y += 7;
        if (y > 260) { doc.addPage(); y = 20; }
    });

    y += 5;

    doc.setFillColor(17, 17, 17);
    doc.rect(120, y - 5, 80, 14, 'F');
    doc.setTextColor(160, 160, 160);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 125, y + 1);
    doc.setTextColor(255, 107, 26);
    doc.setFontSize(14);
    doc.text('R$ ' + Number(os.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 195, y + 3, { align: 'right' });
    y += 20;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.line(15, y, 90, y);
    doc.text('Assinatura do Cliente', 15, y + 5);
    doc.line(110, y, 195, y);
    doc.text('Assinatura do Mecânico', 110, y + 5);
    y += 20;

    if (os.obs) {
        doc.setFillColor(240, 240, 240);
        doc.rect(10, y - 5, 190, 8, 'F');
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('OBSERVAÇÕES', 15, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const linhas = doc.splitTextToSize(os.obs, 175);
        doc.text(linhas, 15, y);
    }

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text('Sistema MotoOS Pro — Desenvolvido por Thiago Lemos · @thiagoolemoos__ · wa.me/5521975930204', 105, 290, { align: 'center' });

    doc.save(`OS-${os.numero}-${(os.nome || 'cliente').replace(/\s/g, '_')}.pdf`);
    showToast('PDF gerado com sucesso!');
}

function openModal() { document.getElementById('modal-contrato').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { document.getElementById('modal-contrato').classList.remove('open'); document.body.style.overflow = ''; }
document.getElementById('modal-contrato').addEventListener('click', function (e) { if (e.target === this) closeModal(); });

let toastTimer;
function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.className = 'toast', 2800);
}