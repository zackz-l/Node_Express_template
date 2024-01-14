# FROM node:16.15.0
FROM public.ecr.aws/docker/library/node:16.20.1
WORKDIR /app

COPY package*.json /app/

RUN npm ci

COPY . .
RUN npx prisma generate

RUN npm run build

EXPOSE 8000
CMD [ "npm" ,"run" ,"start:stable" ]
