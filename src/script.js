import os from 'os';
import {get, head} from 'lodash';
import express from 'express';

const server = express();

const PORT = 8000;

const displayIp = document.querySelector('.display-ip');
const sendButton = document.querySelector('.outgoing-message__send');
const textArea = document.querySelector('.outgoing-message__input');
const incomingMessage = document.querySelector('.incoming-message__display');
const ipInputs = document.querySelectorAll('.enter-ip__input');
const errorMessage = document.querySelector('.outgoing-message__error');
const clearIpButton = document.querySelector('.enter-ip__clear');
const clearMessagesButton = document.querySelector('.incoming-message__clean');

server.post('/', (req, res, next) => {
    req.rawBody = '';
    req.setEncoding('utf8');
  
    req.on('data', (chunk) => { 
        req.rawBody += chunk;
    });
  
    req.on('end', () => {
        next();

        displayIncomingMessage({message: req.rawBody, ip: head(get(req, 'headers.host', '').split(':'))});
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

const clearIp = () => {
    [].forEach.call(ipInputs, (item) => item.value = '');
}

const displayOutgoingMessage = (message) => {
    const newItem = document.createElement('div');
    newItem.className = 'outgoing-message__item';
    newItem.innerHTML = `Вы: <br>${message}`;
    newItem.align = 'right';
    incomingMessage.appendChild(newItem);
}

const displayIncomingMessage = ({message, ip}) => {
    const newItem = document.createElement('div');
    newItem.className = 'incoming-message__item';
    newItem.innerHTML = `${ip}: <br>${message}`;
    incomingMessage.appendChild(newItem);
    incomingMessage.scrollTo(0, incomingMessage.scrollHeight);
}

const clearMessages = () => {
    incomingMessage.innerHTML = '';
}

const sendMessage = () => {
    const targetIP = [].map.call(ipInputs, (item) => item.value).reduce((acc, item) => `${acc}.${item}`);
    const message = textArea.value;

    fetch(`http://${targetIP}:${PORT}`, {
        method: 'POST',
        body: message
    })
        .then(() => {
            textArea.value = '';
            displayOutgoingMessage(message);
        })
        .catch(() => {
            showError();
            setTimeout(hideError, 5000);
        })
}

setInterval(() => {
    const currentIp = getIp();

    displayIp.innerText = currentIp ? `Мой IP-адрес: ${currentIp}` : 'IP-адрес не определен';  
}, 2000);

server.listen(PORT, () => {
    console.log('Server is running');
});

sendButton.addEventListener('click', sendMessage);
clearIpButton.addEventListener('click', clearIp);
clearMessagesButton.addEventListener('click', clearMessages);
