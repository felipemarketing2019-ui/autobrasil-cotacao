---
## ⚠️ CORREÇÃO — Scooter (adicionada após implementação inicial)

**Importante:** Scooter possui tabela própria e preço fixo. Não calcular scooter pela tabela de motos.

Para Scooter, exibir **apenas** os dois planos abaixo (sem Ouro, Prata ou Bronze):

| Plano | Preço |
|---|---|
| Plano Total | R$ 155,00/mês |
| Plano Parcial | R$ 94,00/mês |

**Benefícios Plano Total:** Roubo, Furto, Reboque até 200km, Perda total, Danos a terceiros até R$ 5.000,00, Manutenção inclusa, Cobertura em todo Brasil, Sem consulta SPC / Serasa.

**Benefícios Plano Parcial:** Roubo, Furto, Reboque até 200km, Cobertura em todo Brasil, Sem consulta SPC / Serasa.

---

Você é um desenvolvedor front-end sênior especialista em landing pages mobile-first de alta conversão.

Crie uma landing page simples de captação para uma empresa de proteção veicular chamada Auto Brasil Proteção Veicular.

Objetivo:
Usuários virão de anúncios do Meta Ads, principalmente pelo celular. A página deve ser rápida, objetiva, responsiva e focada em gerar lead via simulação, WhatsApp e agendamento.

Stack desejada:
- HTML, CSS e JavaScript puro, ou React/Vite se o projeto já estiver nessa stack.
- Código simples, limpo, leve e fácil de editar.
- Mobile-first.
- Não usar bibliotecas pesadas.
- Interface parecida com os layouts enviados: cards arredondados, campos grandes, botões destacados, aparência moderna e confiável.

Layout geral:
1. No desktop:
   - Fundo externo chumbo/azulado escuro.
   - Card/modal central branco com bordas arredondadas.
2. No mobile:
   - NÃO usar fundo chumbo.
   - Usar fundo verde da marca.
   - Card branco ocupando quase toda a largura.
   - Tudo deve funcionar perfeitamente em tela pequena.

Cores base:
- Verde escuro: #005c2e ou similar.
- Verde CTA WhatsApp: #25D366.
- Laranja CTA principal: #ff8a1f.
- Azul escuro institucional: #002b6c.
- Branco: #ffffff.
- Cinza claro para campos: #f5f7f8.

Fluxo da página:

TELA 1 — Simular cotação
Criar formulário com:
- Título: "Simular cotação"
- Subtítulo: "Leva menos de 1 minuto • sem dados pessoais"
- Campo select: Categoria do veículo
  Opções:
  - Carro
  - Moto até 250cc
  - Moto até 300cc
- Campo texto: Marca/modelo
  Placeholder: "Ex: Honda Biz, Ford Ka, HB20"
- Campo número/select: Ano
  Placeholder: "2020"
- Campo texto: Cidade / bairro
  Placeholder: "Nova Iguaçu - RJ"
- Campo valor monetário: Valor estimado do veículo
  Placeholder: "R$ 50.000,00"
- Botão laranja: "CALCULAR SIMULAÇÃO"

Ao clicar em "CALCULAR SIMULAÇÃO":
- Validar categoria e valor do veículo.
- Calcular automaticamente os valores dos planos conforme tabela abaixo.
- Ir para a Tela 2.

Tabela de cotação:

Categoria: Carro
Faixas:
- R$ 0,01 até R$ 10.000,00 | cota 1,0 | Plano Ouro R$ 99,00 | Plano Prata R$ 89,00
- R$ 10.001,00 até R$ 20.000,00 | cota 1,5 | Plano Ouro R$ 139,00 | Plano Prata R$ 112,00
- R$ 20.001,00 até R$ 30.000,00 | cota 2,0 | Plano Ouro R$ 159,00 | Plano Prata R$ 142,00
- R$ 30.001,00 até R$ 40.000,00 | cota 2,5 | Plano Ouro R$ 189,00 | Plano Prata R$ 168,00
- R$ 40.001,00 até R$ 50.000,00 | cota 3,0 | Plano Ouro R$ 235,00 | Plano Prata R$ 199,00
- R$ 50.001,00 até R$ 60.000,00 | cota 3,5 | Plano Ouro R$ 280,00 | Plano Prata R$ 255,00
- R$ 60.001,00 até R$ 70.000,00 | cota 4,0 | Plano Ouro R$ 380,00 | Plano Prata R$ 349,00
- R$ 70.001,00 até R$ 80.000,00 | cota 4,5 | Plano Ouro R$ 480,00 | Plano Prata R$ 395,00

Categoria: Moto até 250cc
Faixas:
- R$ 0,01 até R$ 10.000,00 | cota 1,0 | Plano Ouro R$ 159,00 | Plano Prata R$ 139,00
- R$ 10.001,00 até R$ 13.000,00 | cota 1,5 | Plano Ouro R$ 179,00 | Plano Prata R$ 159,00
- R$ 13.001,00 até R$ 16.000,00 | cota 2,0 | Plano Ouro R$ 189,00 | Plano Prata R$ 179,00
- R$ 16.001,00 até R$ 20.000,00 | cota 2,5 | Plano Ouro R$ 199,00 | Plano Prata R$ 189,00

Categoria: Moto até 300cc
Faixas:
- R$ 0,01 até R$ 20.000,00 | cota 1,0 | Plano Ouro R$ 199,00 | Plano Prata R$ 189,00

Plano Bronze:
- Mostrar como opção adicional: "Plano Bronze"
- Valor fixo: R$ 79,90
- Descrição: "App de monitoramento + assistência 24 horas"

Caso o valor informado esteja fora da tabela:
- Não mostrar preço automático.
- Mostrar mensagem: "Para este valor, fale diretamente com nosso consultor para uma cotação personalizada."
- Ainda permitir falar no WhatsApp e agendar negociação.

TELA 2 — Resultado da simulação
Criar tela com:
- Título: "Sua simulação está pronta"
- Subtítulo: "Escolha o plano ideal para o seu veículo"
- Resumo em uma caixa:
  "Veículo de R$ [valor] • [categoria] • [modelo]"
- Aviso:
  "Esta é apenas uma simulação estimada. A cotação real depende de análise da Auto Brasil, categoria do veículo, plano contratado e regulamento."

Exibir cards dos planos:
1. Plano Prata
   - Valor calculado pela tabela ou "Sob consulta"
   - Benefícios:
     - Roubo e furto
     - Colisão parcial
     - Assistência 24h

2. Plano Ouro
   - Valor calculado pela tabela ou "Sob consulta"
   - Destacar com selo "MAIS ESCOLHIDO"
   - Benefícios:
     - Cobertura completa
     - Carro reserva
     - Vidros, retrovisores e faróis
     - Assistência premium 24h

3. Plano Bronze
   - R$ 79,90
   - Benefícios:
     - App de monitoramento
     - Assistência 24 horas

Na tela de resultado, colocar botões:
- Botão verde: "FALAR COM CONSULTOR AGORA"
- Botão laranja: "AGENDAR NEGOCIAÇÃO"
- Link secundário: "Refazer simulação"

Ao clicar em "FALAR COM CONSULTOR AGORA":
- Abrir WhatsApp em nova aba ou redirecionar.
- Usar número configurável em uma constante chamada WHATSAPP_NUMBER.
- Criar mensagem automática com:
  Nome do lead se existir;
  Categoria;
  Modelo;
  Ano;
  Cidade/bairro;
  Valor do veículo;
  Plano selecionado;
  Valor simulado.

Exemplo de mensagem:
"Olá, vim pelo anúncio e gostaria de falar sobre minha simulação da Auto Brasil. Veículo: [categoria], [modelo], ano [ano], valor [valor], cidade [cidade]. Plano escolhido: [plano] - [valor]."

Ao clicar em "AGENDAR NEGOCIAÇÃO":
- Ir para Tela 3.

TELA 3 — Agendar negociação
Criar formulário com:
- Título: "Agendar negociação"
- Subtítulo: "Informe seus dados de contato"
- Exibir plano selecionado em uma faixa discreta.
- Campo: Nome completo
- Campo: Telefone / WhatsApp
- Escolha de contato:
  - WhatsApp
  - Ligação
- Campo data
- Campo período:
  - Manhã
  - Tarde
  - Noite
- Texto LGPD curto:
  "Seus dados serão usados apenas para contato comercial da Auto Brasil Proteção Veicular."
- Botões:
  - "Voltar"
  - "CONFIRMAR AGENDAMENTO"

Ao confirmar agendamento:
- Validar nome e telefone.
- Redirecionar para WhatsApp com mensagem automática:
"Olá, quero agendar uma negociação com a Auto Brasil. Meu nome é [nome], telefone [telefone]. Prefiro contato por [forma]. Melhor data: [data], período: [período]. Plano de interesse: [plano]."

Requisitos de UX:
- Campos grandes e fáceis de tocar no celular.
- Botões com altura mínima de 48px.
- Máscara de moeda brasileira no valor.
- Máscara de telefone brasileiro.
- Design limpo, sem excesso de texto.
- Não pedir dados pessoais na primeira tela.
- Primeira tela deve parecer rápida e sem compromisso.
- Evitar a palavra "seguro"; usar "proteção veicular".
- Usar textos persuasivos, mas sem promessas absolutas.
- Interface deve transmitir confiança.

Requisitos técnicos:
- Criar funções separadas para:
  - parseCurrencyBR()
  - formatCurrencyBR()
  - getQuoteByVehicleValue()
  - buildWhatsAppLink()
  - validateSimulationForm()
  - validateScheduleForm()
- Centralizar a tabela de preços em um objeto/array fácil de editar.
- Comentar apenas o necessário.
- Código final deve estar pronto para copiar e rodar.
- Garantir responsividade.
- Garantir que o botão de WhatsApp funcione no mobile.

Entregáveis:
1. Código completo.
2. Explicação curta de onde alterar:
   - número do WhatsApp;
   - cores;
   - tabela de preços;
   - textos dos planos.
3. Não criar backend.
4. Não usar banco de dados.
5. Toda lógica deve rodar no front-end.