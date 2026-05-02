<h1 align="center">💸 Controle Financeiro via WhatsApp</h1>

<p align="center">
  Registre, liste e gerencie lançamentos financeiros enviando mensagens para si mesmo no WhatsApp.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Evolution_API-WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
</p>

---

## 📖 Como funciona

Você envia uma mensagem para **si mesmo** no WhatsApp. A **Evolution API** detecta a mensagem e dispara um webhook para este servidor. O servidor interpreta o comando, executa a operação no banco de dados e responde de volta para você no WhatsApp — tudo em segundos.

```
Você (WhatsApp)
      │  envia mensagem para si mesmo
      ▼
Evolution API  ──►  POST /webhook  ──►  Node.js + Express
                                              │
                                    interpreta o comando
                                              │
                               ┌──────────────┴──────────────┐
                               ▼                             ▼
                           Supabase                   Gera PDF
                        (salva / busca)             (se solicitado)
                               │
                               ▼
                    Evolution API  ──►  Você (WhatsApp)
                               responde com o resultado
```

---

## ✨ Funcionalidades

| Comando | Descrição |
|---|---|
| `Nome\nDescrição\nValor` | Registra um novo lançamento financeiro |
| `listar Nome` | Lista todos os lançamentos de uma pessoa com total |
| `deletar N` | Remove o item de índice N da última lista consultada |
| `pdf Nome` | Gera e envia um relatório PDF completo no WhatsApp |

---

## 🚀 Comandos Aceitos

O sistema aceita variações e sinônimos para cada ação:

- **Listar:** `listar`, `lista`, `list`
- **Deletar:** `deletar`, `delete`, `excluir`
- **PDF:** `pdf`, `relatorio`, `report`

---

## 📝 Como Registrar um Lançamento

Envie uma mensagem para si mesmo no WhatsApp com **3 linhas** (a data é opcional):

```
Mirella
Almoço no restaurante
45.50
2026-05-01
```

O bot responderá:

```
✅ Registrado
📁 Mirella
✍🏻 Almoço no restaurante
💰 R$ 45,50
```

> Se a pessoa não existir no banco, ela é **criada automaticamente**.

---

## 📋 Como Listar

```
listar Mirella
```

Resposta:

```
📊 *Mirella*

1 - Almoço no restaurante: 45.5
2 - Uber: 20

💰 *Total:* 65.5
```

---

## 🗑️ Como Deletar

Primeiro liste os registros, depois delete pelo número do item:

```
deletar 2
```

Resposta:

```
❌ Item removido com sucesso
━━━━━━━━━━━━━━━
📁 Mirella
✍🏻 Uber
💰 R$ 20,00
━━━━━━━━━━━━━━━
```

---

## 📄 Como Gerar PDF

```
pdf Mirella
```

O bot gera um documento PDF com todos os lançamentos da pessoa e envia diretamente no WhatsApp como arquivo.

---

## ⚙️ Instalação e Configuração

### 1. Clone o repositório e instale as dependências

```bash
git clone https://github.com/seu-usuario/controle-financeiro-whatsapp.git
cd controle-financeiro-whatsapp
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Seu número de telefone (sem + ou espaços)
PHONE_NUMBER=5511999999999

# Seu LID interno do WhatsApp (formato @lid — veja nos logs do webhook)
MY_LID=29738420699170

# Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_INSTANCE=nome-da-instancia
EVOLUTION_API_KEY=sua-chave-api

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima

# Servidor (opcional)
PORT=3000
```

### 3. Configure o banco de dados no Supabase

Crie as seguintes tabelas no seu projeto Supabase:

**Tabela `people`**
```sql
create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null
);
```

**Tabela `entries`**
```sql
create table entries (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id),
  name text,
  description text,
  amount numeric,
  value numeric,
  date date,
  entry_date timestamp
);
```

### 4. Inicie o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

### 5. Exponha o servidor com ngrok

```bash
ngrok http 3000
```

Configure a URL gerada pelo ngrok como webhook na sua instância da Evolution API.

---

## 🗂️ Estrutura do Projeto

```
src/
├── server.js                    # Inicializa o Express e a rota /webhook
├── controllers/
│   └── webhook.controller.js    # Recebe, valida e roteia todos os comandos
├── services/
│   ├── entries.service.js       # Salva lançamentos no Supabase
│   ├── people.service.js        # Busca ou cria pessoas no Supabase
│   ├── evolution.service.js     # Envia mensagens e PDFs via Evolution API
│   └── pdf.service.js           # Gera relatórios PDF com PDFKit
├── utils/
│   ├── parser.js                # Interpreta o texto da mensagem
│   ├── comandsList.js           # Sinônimos aceitos para cada comando
│   ├── formatCurrency.js        # Formatação para R$
│   ├── formatDate.js            # Formatação de datas (DD/MM/AAAA)
│   ├── normalizeDate.js         # Normalização de datas para UTC
│   └── normalizeText.js         # Remoção de acentos e caracteres especiais
├── config/
│   └── supabase.js              # Inicializa o cliente Supabase
└── assets/
    └── logo.png                 # Logo usada no cabeçalho do PDF
```

---

## 🛡️ Filtros de Segurança

O sistema ignora silenciosamente:

- ✅ Mensagens recebidas de outras pessoas (`fromMe = false`)
- ✅ Mensagens enviadas para grupos (`@g.us`)
- ✅ Mensagens que você enviar para outros contatos (apenas processa mensagens para si mesmo)
- ✅ Webhooks duplicados (anti-reprocessamento via `Set` em memória)

---

## 🧰 Tecnologias

- **[Node.js](https://nodejs.org/)** — Runtime JavaScript
- **[Express](https://expressjs.com/)** — Servidor HTTP
- **[Supabase](https://supabase.com/)** — Banco de dados PostgreSQL gerenciado
- **[Evolution API](https://doc.evolution-api.com/)** — Gateway WhatsApp
- **[PDFKit](https://pdfkit.org/)** — Geração de PDFs
- **[Axios](https://axios-http.com/)** — Requisições HTTP
- **[dotenv](https://github.com/motdotla/dotenv)** — Variáveis de ambiente
- **[nodemon](https://nodemon.io/)** — Hot reload em desenvolvimento
