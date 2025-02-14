const { Server } = require("socket.io");

let connection={}
let messages={}
let timeOnline={}

module.exports.connectSocket=(server)=>{
    const io = new Server(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        console.log('New client connected');
        socket.on('join-call', (path) => {
            if(connection[path] === undefined){
                connection[path]=[]
            }
            connection[path].push(socket.id)
            timeOnline[socket.id] = new Date() 
            for(let i=0; i<connection.length; i++){
                io.to(connection[i]).emit('user-connected',socket.id)
            }
            if(messages[path]!==undefined){
                for(let i=0; i<messages.length; i++ ) { 
                    io.to(socket.id).emit("chat-message",messages[path][i]['data'], messages[path][i]['sender'], messages[path][i]['socket-id-sender'])
                }
            }
            
        });
        socket.on('signal', (toId,message) => {
            io.to(toId).emit( 'signal', socket.id, message)
        });
        socket.on('chat-message', (data,sender) => {
            const [matchingRoom,found] = Object.entriess(connection)
            .reduce(([room,isFound],[roomKey,roomValue])=>{
                if(!isFound&&roomValue.includes(socket.id)) {
                        return[roomKey,true];
                }
                return[room,isFound];
            },["",false])
            if(found===true){
                if(messages[matchingRoom]===undefined) {
                messages[matchingRoom]=[];
                }
                messages[matchingRoom].push({"sender":sender,'data':data,'socker-id-sender':socket.id})
                console.log("message",Key,":",sender,data)
                connection[matchingRoom].forEach(element => {
                    io.to(element).emit('chat-message',data.sender,socket.id)
                });
            }
            
        });
        socket.on('disconnect', () => {
            let diiffTime=Math.abs(timeOnline[socket.id]-new Date());
            let key;
            for(const[k,v] of JSON.parse(JSON.Stringfy(Object.entries(connection)))){
                for(let i=0;i<v.length;++i){
                    if(v[i]===socket.id){
                        key=k
                        for(let j=0;j<connection[key].length;++j){
                            io.to(connection[key][j]).emit('user-disconnected',socket.id,diiffTime)
                        }
                        let index=connection[key].indexOf(socket.id)
                        connection[key].splice(index,1)
                        if(connection[k].length===0){
                            delete connection[k]
                        }
                    }
                }
            }
            console.log('Client disconnected');
        });
    });
    return io;
}