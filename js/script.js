/* ============================================================
   AUTO BRASIL PROTEÇÃO VEICULAR — Lógica da Cotação
   ============================================================ */

/* ---- CONFIGURAÇÃO ---- */
const WHATSAPP_NUMBER = '5521966528201';

/* Chave Web3Forms — obter em https://web3forms.com (grátis)
   Informe seu e-mail lá e cole a chave gerada aqui */
const WEB3FORMS_KEY = '97045284-679d-4e35-b093-6715ec8d86d6';

/* ---- CATEGORIAS ---- */
const VEHICLE_CATEGORIES = {
  CARRO:    'Carro',
  MOTO_250: 'Moto até 250cc',
  MOTO_300: 'Moto até 300cc',
  SCOOTER:  'Scooter',
};

/* ---- PLANOS FIXOS: SCOOTER ----
   Importante: Scooter possui tabela própria e preço fixo.
   Não calcular scooter pela tabela de motos.
   Para Scooter, mostrar apenas Plano Total e Plano Parcial. */
const SCOOTER_PLANS = {
  total: {
    name: 'Plano Total',
    price: 155,
    benefits: [
      'Roubo',
      'Furto',
      'Reboque até 200km',
      'Perda total',
      'Danos a terceiros até R$ 5.000,00',
      'Manutenção inclusa',
      'Cobertura em todo Brasil',
      'Sem consulta SPC / Serasa',
    ],
  },
  parcial: {
    name: 'Plano Parcial',
    price: 94,
    benefits: [
      'Roubo',
      'Furto',
      'Reboque até 200km',
      'Cobertura em todo Brasil',
      'Sem consulta SPC / Serasa',
    ],
  },
};

/* ---- TABELA DE PREÇOS (Carro e Motos) ----
   Para editar: altere os valores ouro/prata de cada faixa abaixo.
   Scooter não usa esta tabela — ver SCOOTER_PLANS acima. */
const TABELA_PRECOS = {
  carro: [
    { min: 0.01,   max: 10000,  ouro: 99.00,  prata: 89.00  },
    { min: 10001,  max: 20000,  ouro: 139.00, prata: 112.00 },
    { min: 20001,  max: 30000,  ouro: 159.00, prata: 142.00 },
    { min: 30001,  max: 40000,  ouro: 189.00, prata: 168.00 },
    { min: 40001,  max: 50000,  ouro: 235.00, prata: 199.00 },
    { min: 50001,  max: 60000,  ouro: 280.00, prata: 255.00 },
    { min: 60001,  max: 70000,  ouro: 380.00, prata: 349.00 },
    { min: 70001,  max: 80000,  ouro: 480.00, prata: 395.00 },
  ],
  'moto-250': [
    { min: 0.01,  max: 10000,  ouro: 159.00, prata: 139.00 },
    { min: 10001, max: 13000,  ouro: 179.00, prata: 159.00 },
    { min: 13001, max: 16000,  ouro: 189.00, prata: 179.00 },
    { min: 16001, max: 20000,  ouro: 199.00, prata: 189.00 },
  ],
  'moto-300': [
    { min: 0.01, max: 20000, ouro: 199.00, prata: 189.00 },
  ],
};

const PRECO_BRONZE = 79.90;

/* Mapa de chave → nome de exibição */
const NOMES_CATEGORIA = {
  carro:      VEHICLE_CATEGORIES.CARRO,
  'moto-250': VEHICLE_CATEGORIES.MOTO_250,
  'moto-300': VEHICLE_CATEGORIES.MOTO_300,
  scooter:    VEHICLE_CATEGORIES.SCOOTER,
};

/* ---- UTMs — capturados na URL e persistidos em sessionStorage ---- */
function capturarUTMs() {
  const params = new URLSearchParams(window.location.search);
  const chaves = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const utms = {};
  chaves.forEach(k => {
    const v = params.get(k);
    if (v) utms[k] = v;
  });
  if (Object.keys(utms).length) {
    sessionStorage.setItem('ab_utms', JSON.stringify(utms));
  }
}

function getUTMs() {
  try { return JSON.parse(sessionStorage.getItem('ab_utms') || '{}'); } catch { return {}; }
}

capturarUTMs();

/* ---- GEOLOCALIZAÇÃO POR IP ----
   Inicia a busca imediatamente ao carregar e guarda a Promise.
   No envio do formulário aguardamos o resultado com await — garante
   que os dados chegam mesmo que o usuário submeta rapidamente. */
const geoPromise = fetch('https://ipapi.co/json/')
  .then(r => r.json())
  .then(d => ({
    cidade: d.city          || '',
    estado: d.region        || '',
    pais:   d.country_name  || '',
    ip:     d.ip            || '',
  }))
  .catch(() => ({})); // falha silenciosa — retorna objeto vazio

/* ---- ESTADO DA SESSÃO ---- */
const state = {
  categoria: '',
  modelo: '',
  ano: '',
  cidade: '',
  valor: 0,
  quote: null,
  planoSelecionado: null, // { id, nome, preco }
};

/* ============================================================
   FUNÇÕES UTILITÁRIAS
   ============================================================ */

function parseCurrencyBR(str) {
  return parseFloat(String(str).replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

function formatCurrencyBR(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getQuote(categoria, valor) {
  /* Scooter: preço fixo, independente do valor do veículo */
  if (categoria === 'scooter') {
    return {
      isFixedPrice: true,
      isOutOfRange: false,
      plans: SCOOTER_PLANS,
    };
  }

  const faixas = TABELA_PRECOS[categoria];
  if (!faixas || !Number.isFinite(valor) || valor <= 0) {
    return { isFixedPrice: false, isOutOfRange: true, ouro: null, prata: null };
  }

  const faixa = faixas.find(f => valor >= f.min && valor <= f.max);
  if (!faixa) {
    return { isFixedPrice: false, isOutOfRange: true, ouro: null, prata: null };
  }

  return { isFixedPrice: false, isOutOfRange: false, ouro: faixa.ouro, prata: faixa.prata };
}

function buildWhatsAppLink({ categoria, modelo, ano, cidade, valor, plano, precoPlano }) {
  const cat = NOMES_CATEGORIA[categoria] || categoria;
  const msg = [
    'Olá, vim pelo anúncio e gostaria de falar sobre minha simulação da Auto Brasil.',
    `Veículo: ${cat}${modelo ? `, ${modelo}` : ''}${ano ? `, ano ${ano}` : ''}`,
    `valor ${formatCurrencyBR(valor)}${cidade ? `, cidade ${cidade}` : ''}.`,
    `Plano escolhido: ${plano} - ${precoPlano}.`,
  ].join(' ');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function buildScheduleWhatsAppLink({ nome, telefone, contato, data, periodo, plano }) {
  const dataFmt = data ? formatDate(data) : 'a combinar';
  const msg = [
    'Olá, quero agendar uma negociação com a Auto Brasil.',
    `Meu nome é ${nome}, telefone ${telefone}.`,
    `Prefiro contato por ${contato}.`,
    `Melhor data: ${dataFmt}, período: ${periodo}.`,
    `Plano de interesse: ${plano}.`,
  ].join(' ');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

/* Remove caracteres HTML perigosos e limita tamanho */
function sanitizar(str) {
  return String(str).replace(/[<>"'`\\]/g, '').trim().slice(0, 300);
}

/* Data e hora do envio formatada em pt-BR */
function dataHoraEnvio() {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

function validateSimulationForm() {
  const categoria = document.getElementById('categoria').value;
  const valor = parseCurrencyBR(document.getElementById('valor').value);
  if (!categoria) return 'Selecione a categoria do veículo.';
  if (!valor || valor <= 0) return 'Informe o valor estimado do veículo.';
  return null;
}

function validateScheduleForm() {
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.replace(/\D/g, '');
  const data = document.getElementById('data-agenda').value;
  if (!nome || nome.length < 3) return 'Informe seu nome completo (mínimo 3 caracteres).';
  if (telefone.length < 10) return 'Informe um telefone válido com DDD.';
  if (!data) return 'Selecione uma data para o agendamento.';
  return null;
}

/* ============================================================
   NAVEGAÇÃO
   ============================================================ */

function irParaTela(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${n}`).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   MÁSCARAS DE INPUT
   ============================================================ */

function maskCurrencyBR(input) {
  const digits = input.value.replace(/\D/g, '');
  if (!digits) { input.value = ''; return; }
  const num = parseInt(digits, 10) / 100;
  input.value = num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function maskTelefone(input) {
  const d = input.value.replace(/\D/g, '').slice(0, 11);
  if (!d) { input.value = ''; return; }
  if (d.length <= 2)  { input.value = `(${d}`; return; }
  if (d.length <= 6)  { input.value = `(${d.slice(0,2)}) ${d.slice(2)}`; return; }
  if (d.length <= 10) { input.value = `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`; return; }
  input.value = `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

function maskAno(input) {
  input.value = input.value.replace(/\D/g, '').slice(0, 4);
}

/* ============================================================
   RENDERIZAÇÃO — TELA 2
   ============================================================ */

function renderResultado() {
  const { categoria, modelo, valor, quote } = state;

  const partes = [
    `Veículo de ${formatCurrencyBR(valor)}`,
    NOMES_CATEGORIA[categoria] || categoria,
    modelo || null,
  ].filter(Boolean);
  document.getElementById('resumo').textContent = partes.join(' • ');

  const listaEl  = document.getElementById('planos');
  const alertaEl = document.getElementById('msg-fora-tabela');

  /* ── SCOOTER: planos fixos, sem tabela de valor ── */
  if (quote && quote.isFixedPrice) {
    alertaEl.hidden = true;
    const { total, parcial } = quote.plans;
    listaEl.innerHTML = [
      criarCardHTML('total',   total.name,   total.price,   total.benefits,   true),
      criarCardHTML('parcial', parcial.name, parcial.price, parcial.benefits, false),
    ].join('');
    vincularEventosCards();
    selecionarPlano('total', total.name, formatCurrencyBR(total.price));
    return;
  }

  /* ── FORA DE TABELA: valor acima do limite ── */
  if (!quote || quote.isOutOfRange) {
    alertaEl.hidden = false;
    alertaEl.innerHTML = `
      <div class="alerta-consulta-icone">🚨</div>
      <div class="alerta-consulta-titulo">Veículo acima da faixa padrão!</div>
      <div class="alerta-consulta-texto">
        Para veículos acima de <strong>R$ 80.000</strong>, nossa equipe faz uma cotação
        personalizada. Fale agora com um consultor — é rápido e sem compromisso.
      </div>
    `;
    listaEl.innerHTML = criarCardHTML('bronze', 'Plano Bronze', PRECO_BRONZE, [
      'App de monitoramento',
      'Assistência 24 horas',
    ], false);
    vincularEventosCards();
    selecionarPlano('bronze', 'Plano Bronze', formatCurrencyBR(PRECO_BRONZE));
    return;
  }

  /* ── RESULTADO NORMAL: Carro e Motos na tabela ── */
  alertaEl.hidden = true;
  listaEl.innerHTML = [
    criarCardHTML('prata', 'Plano Prata', quote.prata, [
      'Roubo e furto',
      'Colisão parcial',
      'Assistência 24h',
    ], false),
    criarCardHTML('ouro', 'Plano Ouro', quote.ouro, [
      'Cobertura completa',
      'Carro reserva',
      'Vidros, retrovisores e faróis',
      'Assistência premium 24h',
    ], true),
    criarCardHTML('bronze', 'Plano Bronze', PRECO_BRONZE, [
      'App de monitoramento',
      'Assistência 24 horas',
    ], false),
  ].join('');

  vincularEventosCards();
  selecionarPlano('ouro', 'Plano Ouro', formatCurrencyBR(quote.ouro));
}

function criarCardHTML(id, nome, preco, beneficios, destaque) {
  const precoFmt = preco !== null ? formatCurrencyBR(preco) : null;
  const valorHTML = precoFmt
    ? `<span class="plano-valor">${precoFmt}<small>/mês</small></span>`
    : `<span class="plano-valor consulta">Sob consulta</span>`;

  return `
    <div class="plano-card${destaque ? ' destaque' : ''}"
         data-id="${id}" data-nome="${nome}" data-preco="${precoFmt || 'Sob consulta'}">
      ${destaque ? '<span class="badge-destaque">⭐ MAIS ESCOLHIDO</span>' : ''}
      <div class="plano-cabecalho">
        <span class="plano-nome-text">${nome}</span>
        ${valorHTML}
      </div>
      <ul class="plano-beneficios-lista">
        ${beneficios.map(b => `<li>${b}</li>`).join('')}
      </ul>
      <div class="plano-selecao">
        <input type="radio" name="plano" id="radio-${id}" value="${id}">
        <label for="radio-${id}">Selecionar este plano</label>
      </div>
    </div>
  `;
}

function vincularEventosCards() {
  document.querySelectorAll('.plano-card').forEach(card => {
    card.addEventListener('click', () => {
      selecionarPlano(card.dataset.id, card.dataset.nome, card.dataset.preco);
    });
  });
}

function mostrarSucessoAgendamento(nome) {
  document.getElementById('form-agendamento').hidden = true;
  document.getElementById('badge-plano').hidden = true;
  document.getElementById('sucesso-nome').textContent = nome.split(' ')[0];
  document.getElementById('sucesso-agendamento').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selecionarPlano(id, nome, preco) {
  state.planoSelecionado = { id, nome, preco };
  document.querySelectorAll('.plano-card').forEach(c => c.classList.remove('selecionado'));
  const card  = document.querySelector(`.plano-card[data-id="${id}"]`);
  const radio = document.getElementById(`radio-${id}`);
  if (card)  card.classList.add('selecionado');
  if (radio) radio.checked = true;
}

/* ============================================================
   INICIALIZAÇÃO & EVENTOS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Data mínima = hoje */
  document.getElementById('data-agenda').min = new Date().toISOString().split('T')[0];

  /* Máscaras */
  const valorEl = document.getElementById('valor');
  valorEl.addEventListener('input', () => maskCurrencyBR(valorEl));

  const anoEl = document.getElementById('ano');
  anoEl.addEventListener('input', () => maskAno(anoEl));

  const telEl = document.getElementById('telefone');
  telEl.addEventListener('input', () => maskTelefone(telEl));

  /* ── TELA 1: Calcular simulação ── */
  document.getElementById('form-simulacao').addEventListener('submit', e => {
    e.preventDefault();
    const erro   = validateSimulationForm();
    const erroEl = document.getElementById('erro-simulacao');
    if (erro) {
      erroEl.textContent = erro;
      erroEl.hidden = false;
      return;
    }
    erroEl.hidden = true;

    state.categoria = document.getElementById('categoria').value;
    state.modelo    = document.getElementById('modelo').value.trim();
    state.ano       = document.getElementById('ano').value.trim();
    state.cidade    = document.getElementById('cidade').value.trim();
    state.valor     = parseCurrencyBR(document.getElementById('valor').value);
    state.quote     = getQuote(state.categoria, state.valor);

    renderResultado();
    irParaTela(2);
  });

  /* ── TELA 2: WhatsApp ── */
  document.getElementById('btn-whatsapp').addEventListener('click', () => {
    const plano = state.planoSelecionado || { nome: 'A definir', preco: '' };
    const link  = buildWhatsAppLink({ ...state, plano: plano.nome, precoPlano: plano.preco });
    window.open(link, '_blank');
  });

  /* ── TELA 2: Agendar ── */
  document.getElementById('btn-agendar').addEventListener('click', () => {
    const plano = state.planoSelecionado;
    document.getElementById('badge-plano').textContent = plano
      ? `Plano selecionado: ${plano.nome} — ${plano.preco}`
      : 'Plano: a definir com consultor';
    irParaTela(3);
  });

  /* ── TELA 2: Refazer ── */
  document.getElementById('btn-refazer').addEventListener('click', () => irParaTela(1));

  /* ── TELA 3: Voltar ── */
  document.getElementById('btn-voltar').addEventListener('click', () => irParaTela(2));

  /* Rate limiting: bloqueia envios com menos de 30s de intervalo */
  let _ultimoEnvio = 0;

  /* ── TELA 3: Confirmar agendamento → envia e-mail via Web3Forms ── */
  document.getElementById('form-agendamento').addEventListener('submit', async e => {
    e.preventDefault();

    /* Honeypot: bot preencheu o campo oculto — ignorar silenciosamente */
    if (document.getElementById('botcheck').checked) return;

    /* Rate limiting */
    const agora = Date.now();
    if (agora - _ultimoEnvio < 30000) {
      const erroEl = document.getElementById('erro-agendamento');
      erroEl.textContent = 'Aguarde alguns segundos antes de tentar novamente.';
      erroEl.hidden = false;
      return;
    }

    const erro   = validateScheduleForm();
    const erroEl = document.getElementById('erro-agendamento');
    if (erro) {
      erroEl.textContent = erro;
      erroEl.hidden = false;
      return;
    }
    erroEl.hidden = true;

    /* Sanitização: remove caracteres perigosos antes de enviar */
    const nome     = sanitizar(document.getElementById('nome').value);
    const telefone = sanitizar(document.getElementById('telefone').value);
    const contato  = document.querySelector('input[name="contato"]:checked')?.value || 'WhatsApp';
    const data     = document.getElementById('data-agenda').value;
    const periodo  = document.querySelector('input[name="periodo"]:checked')?.value || 'Manhã';
    const plano    = state.planoSelecionado
      ? `${state.planoSelecionado.nome} - ${state.planoSelecionado.preco}`
      : 'A definir';

    const btnConfirmar = document.getElementById('btn-confirmar');
    btnConfirmar.textContent = 'Enviando...';
    btnConfirmar.disabled = true;

    try {
      const geoData = await geoPromise;
      const utms = getUTMs();
      const utmLabels = {
        utm_source:   'UTM Source',
        utm_medium:   'UTM Medium',
        utm_campaign: 'UTM Campaign',
        utm_term:     'UTM Term',
        utm_content:  'UTM Content',
      };
      const utmPayload = {};
      Object.entries(utmLabels).forEach(([k, label]) => {
        if (utms[k]) utmPayload[label] = utms[k];
      });

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Agendamento Auto Brasil — ${nome}`,
          from_name: 'Auto Brasil Cotação',
          Nome: nome,
          Telefone: telefone,
          'Contato preferido': contato,
          Data: formatDate(data),
          Período: periodo,
          Plano: plano,
          Categoria: NOMES_CATEGORIA[state.categoria] || state.categoria,
          Modelo: state.modelo || '—',
          Ano: state.ano || '—',
          Cidade: state.cidade || '—',
          'Valor do veículo': formatCurrencyBR(state.valor),
          'Data e hora do envio': dataHoraEnvio(),
          ...(geoData.cidade ? { 'Localização': `${geoData.cidade}, ${geoData.estado} — ${geoData.pais}` } : {}),
          ...(geoData.ip     ? { 'IP': geoData.ip } : {}),
          ...utmPayload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        _ultimoEnvio = Date.now();
        mostrarSucessoAgendamento(nome);
      } else {
        throw new Error(json.message || 'Erro desconhecido');
      }
    } catch {
      erroEl.textContent = 'Não foi possível enviar. Tente novamente ou fale pelo WhatsApp.';
      erroEl.hidden = false;
      btnConfirmar.textContent = 'CONFIRMAR AGENDAMENTO';
      btnConfirmar.disabled = false;
    }
  });

  /* ── TELA 3: Nova simulação após sucesso ── */
  document.getElementById('btn-nova-simulacao').addEventListener('click', () => {
    document.getElementById('form-agendamento').hidden = false;
    document.getElementById('form-agendamento').reset();
    document.getElementById('badge-plano').hidden = false;
    document.getElementById('sucesso-agendamento').hidden = true;
    irParaTela(1);
  });

});
