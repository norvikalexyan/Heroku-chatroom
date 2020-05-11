require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socket(server);
const connectionUrl = `mongodb+srv://${process.env.username}:${process.env.password}@${process.env.dbUri}`;

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

server.listen(process.env.port, (err) => {
    if(err) {
        throw err;
    }
    //callback function
    console.log(`server is listening on port ${process.env.port}`);
}); //port of 3000