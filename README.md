# Jardins Genebra — Landing Page

Landing page estática (HTML, CSS e JavaScript puro) do Condomínio Jardins Genebra.
Publicada com **NGINX em Docker**, pronta para o **Dokploy**.

## Estrutura

```
.
├── index.html        # Página
├── style.css         # Estilos
├── script.js         # Interações, formulário → WhatsApp
├── assets/           # Imagens e logos (LEIA-ME.txt não vai para produção)
├── Dockerfile        # Imagem nginx:alpine servindo o site na porta 80
├── nginx.conf        # Gzip, cache por tipo de arquivo e cabeçalhos de segurança
├── .dockerignore
└── .gitignore
```

## Testar localmente

Sem instalar nada: abra o `index.html` no navegador.

Com Docker (igual à produção):

```bash
docker build -t jardins-genebra .
docker run --rm -p 8080:80 jardins-genebra
# acesse http://localhost:8080
```

## 1. Subir no GitHub

Crie um repositório vazio no GitHub (sem README) e, dentro desta pasta:

```bash
git init
git add .
git commit -m "Landing page Jardins Genebra"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/jardins-genebra.git
git push -u origin main
```

> Pelo navegador também funciona: no repositório vazio, use **Add file → Upload files**
> e arraste **o conteúdo** desta pasta (inclusive a pasta `assets`). Arquivos que começam
> com ponto (`.gitignore`, `.dockerignore`) podem ficar ocultos no seu sistema — eles
> não são obrigatórios para o deploy funcionar.

## 2. Publicar no Dokploy

1. Conecte sua conta do GitHub ao Dokploy (área de provedores Git nas configurações), caso ainda não esteja conectada.
2. Crie (ou abra) um **Project** → **Create Service → Application**.
3. Em **General / Provider**: escolha **GitHub**, o repositório e a branch **main**.
4. Em **Build Type**: escolha **Dockerfile**
   - **Dockerfile Path:** `Dockerfile`
   - **Docker Context Path:** `.`
5. Clique em **Deploy** e acompanhe o log até concluir.
6. Na aba **Domains**, adicione o domínio:
   - **Host:** ex. `jardinsgenebra.com.br`
   - **Container Port:** `80`
   - **HTTPS:** ligado, certificado **letsencrypt**
7. No provedor do domínio, crie um registro **A** apontando para o IP do servidor do Dokploy
   (e um **CNAME** `www` → domínio principal, se quiser usar `www`).

Com o repositório conectado pelo GitHub, cada `git push` na branch configurada
dispara um novo deploy automaticamente.

**Alternativa sem Dockerfile:** Build Type **Static** (o Dokploy serve os arquivos com NGINX
— também usa a porta `80` no domínio). O Dockerfile deste projeto é recomendado porque
inclui as regras de cache, compressão e segurança do `nginx.conf`.

## Configurações importantes

| O quê | Onde |
|---|---|
| Número do WhatsApp (botões e formulário) | `index.html` (links `wa.me/5561999270059`) e `script.js` (`WHATSAPP_URL`) |
| Mensagem padrão do WhatsApp | `index.html` (parâmetro `?text=` dos links) e `script.js` (variável `msg`) |
| Link do Instagram | `index.html`, rodapé |
| Trocar imagens | `assets/` (mesmos nomes de arquivo) — ver `assets/LEIA-ME.txt` |

> Após alterar `style.css` ou `script.js`, o navegador pode manter a versão antiga
> por até 1 hora (cache). Para forçar na hora, mude a referência no `index.html`,
> ex.: `style.css?v=2`.
