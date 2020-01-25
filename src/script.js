import os from 'os';
import {get} from 'lodash';
import express from 'express';

const server = express();

const displayIp = document.querySelector('.display-ip');
const sendButton = document.querySelector('.outgoing-message__send');
const textArea = document.querySelector('.outgoing-message__input');
const incomingMessage = document.querySelector('.incoming-message__display');
const ipInputs = document.querySelectorAll('.enter-ip__input');
const errorMessage = document.querySelector('.outgoing-message__error');

server.post('/', (req, res, next) => {
    req.rawBody = '';
    req.setEncoding('utf8');
  
    req.on('data', (chunk) => { 
        req.rawBody += chunk;
    });
  
    req.on('end', () => {
        next();

        displayRes(req.rawBody);
        res.end();
    });
});

const getIp = () => {
    const ifaces = os.networkInterfaces();

    return get(get(ifaces, 'Ethernet', []).find(({family}) => family === 'IPv4'), 'address');
};

const showError = () => {
    errorMessage.className = 'outgoing-message__error outgoing-message__error--visible';
}

const hideError = () => {
    errorMessage.className = 'outgoing-message__error outgoing-message__error--hidden';
}

const sendMessage = () => {
    const targetIP = [].map.call(ipInputs, (item) => item.value).reduce((acc, item) => `${acc}.${item}`);
    const message = textArea.value;

    fetch(`http://${targetIP}`, {
        method: 'POST',
        body: message
    })
        .then(() => textArea.value = '')
        .catch(() => {
            showError();
            setTimeout(hideError, 5000);
        })
}

const displayRes = (message) => {
    incomingMessage.innerText = message;
}

displayIp.innerText = `Мой IP-адрес: ${getIp()}`;

server.listen(80, () => {
    console.log('Server is running');
});

sendButton.addEventListener('click', sendMessage);
