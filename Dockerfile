FROM node

WORKDIR /home/noteTaker

COPY . .

CMD ["node", "app.js"]