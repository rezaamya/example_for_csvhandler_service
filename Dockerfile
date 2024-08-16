FROM node:22.6.0-alpine3.20 as build

WORKDIR	/app
COPY . .
RUN npm i
RUN npm run build

FROM node:22.6.0-alpine3.20 As production
WORKDIR /app
COPY package*.json .
RUN npm i --omit=dev
COPY --from=build /app/dist ./dist

CMD ["node", "dist/main"]
