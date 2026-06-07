# Usa uma versão super leve do Node.js
FROM node:20-alpine

# Cria a pasta onde o sistema vai morar dentro do container
WORKDIR /app

# Copia os arquivos de configuração das dependências
COPY package*.json ./

# Instala as ferramentas necessárias (sem instalar pacotes inúteis)
RUN npm install --production

# Copia o resto do código fonte do ERP
COPY . .

# Expõe a porta que o sistema vai usar para se comunicar
EXPOSE 3000

# O comando que "liga" o motor
CMD ["npm", "start"]