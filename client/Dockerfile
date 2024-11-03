FROM node:alpine AS build

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install -g @angular/cli

RUN npm install

RUN npm audit fix

RUN npm run build --prod

# CMD ["ng", "serve", "--host", "0.0.0.0"]

FROM nginx:latest AS ngi

COPY --from=build /usr/src/app/dist/mtg-trader/browser /usr/share/nginx/html
COPY /nginx.conf  /etc/nginx/conf.d/default.conf

EXPOSE 80

