FROM node:20-slim
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma
RUN npm install --ignore-scripts

COPY . .

# dummy URL da build ne pukne na "env not found"
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=$DATABASE_URL
# preskoči auth provjere tijekom builda ako ih imaš
ENV NEXTAUTH_SECRET=dummy
ENV NEXTAUTH_URL=https://tableboost.app

RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
