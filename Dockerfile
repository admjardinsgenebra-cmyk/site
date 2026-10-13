# Landing page estática do Condomínio Jardins Genebra
# Servida por NGINX na porta 80 (configure a porta 80 no domínio do Dokploy)
FROM nginx:1.27-alpine

# Configuração do servidor (gzip, cache, cabeçalhos de segurança)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Arquivos do site
COPY index.html style.css script.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Remove arquivos de apoio que não precisam ir para produção
RUN rm -f /usr/share/nginx/html/assets/LEIA-ME.txt

EXPOSE 80

# Verificação de saúde simples (usada pelo Docker/Dokploy)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
