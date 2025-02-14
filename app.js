const express=require('express');
const mongoose = require('mongoose'); 
const userRouter = require('./routes/user');  
const {createServer} = require('node:http');
const {connectSocket} = require('./controllers/socketManager');
const cors=require('cors');

const app=express();
const server=createServer(app);

connectSocket(server);


app.use(express.json());
app.use(cors());
app.use("/user", userRouter);

main()
.then(()=>{
    console.log('Connected to MongoDB');
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://moasadali007:K8wLWiPKvFrj3hqf@videocallappcluster0.pg9s4.mongodb.net/?retryWrites=true&w=majority&appName=VideoCallAppCluster0');
}
app.use((req,res,next)=>{
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

server.listen(3000,()=>{
    console.log('Server is running on port 3000');
});

