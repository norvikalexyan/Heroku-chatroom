const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socket = require('socket.io');
const config = require('./.configs');

const port = 3000;
const app = express();
const server = http.createServer(app);
const io = socket(server);
const connectionUrl = `mongodb+srv://${config.username}:${config.password}@${config.dbUri}`;

mongoose.connect(connectionUrl, {useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if(err) {
        throw err;
    }
    console.log('db connection successful');
});

const messageStructure = mongoose.model('messages', {
    name: String,
    text: String
});

app.use(express.static(__dirname)); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/messages', (request, response) => {
    messageStructure.find({}, (err, allMessages) => {
        if(err) {
            //throw err;
            response.sendStatus(500);
        }
        response.send(allMessages);
    });
});

app.post('/messages', (request, response) => {
    const messageObject = new messageStructure(request.body);

    messageObject.save((err) => {
        if(err) {
            throw err;
        }
        io.emit('messageIncome', request.body);
        response.sendStatus(200);
    });
    //console.log(req.body);
    //messagesStorage.push(request.body);
});

io.on('connection', (socket) => {
    console.log('user connected');
});

server.listen(3000, (err) => {
    if(err) {
        throw err;
    }
    //callback function
    console.log(`server is listening on port ${port}`)
}); //port of 3000