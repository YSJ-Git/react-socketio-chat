const path = require("path");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

// localhost 포트 설정
const port = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/', (res, req) => {
    req.sendFile(path.join(__dirname, '../client/build/index.html'));
});
app.get('*', (res, req) => {
req.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// server instance
const server = http.createServer(app);

const getNowDate = () => {
  let today = new Date();

  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1; // 월
  let date = today.getDate(); // 날짜
  let day = today.getDay(); // 요일

  return year + "/" + month + "/" + date;
};

const getNowTime = () => {
  let today = new Date();

  let hours = today.getHours(); // 시
  let minutes = today.getMinutes(); // 분
  let seconds = today.getSeconds(); // 초
  let milliseconds = today.getMilliseconds(); // 밀리초

  return hours + ":" + minutes + ":" + seconds;
};

// socketio 생성후 서버 인스턴스 사용
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//모두에게 보일 메시지 배열
const showMsg = [];

//접속한 소켓
const connectedUserId = [];

const deleteDisconnectedUser = (userId) => {
  for (let i = 0; i < connectedUserId.length; i++) {
    if (connectedUserId[i] === userId) {
      connectedUserId.splice(i, 1);
      i--;
    }
  }
};

//닉네임
const nicknameArr = [];

// socketio
io.on("connection", (socket) => {
  console.log("소켓 아이디", socket.id);
  connectedUserId.push(socket.id);
  console.log("서버 접속유저들:", connectedUserId);
  socket.emit("send-to-client-users", connectedUserId);
  const count = io.engine.clientsCount;

  console.log("connected: ", socket.id);
  console.log("몇명?", count);
  socket.on("hello", (msg) => {
    console.log("서버에서 로그: ", msg);
  });
  const sendToAll = () => {
    console.log("전체메시지: ", showMsg);
    socket.emit("to-all", showMsg);
    io.emit("to-all", showMsg);
    socket.emit("change-nickname", nicknameArr);
  };

  socket.on("send-to-server", (msg) => {
    console.log("msgFromClient: ", msg);
    showMsg.push({
      id: msg.userId,
      msg: msg.msg,
      nickname: msg.nickname,
      date: getNowDate(),
      time: getNowTime(),
    });
    if (msg.nicknameExist === 0) {
      nicknameArr.push(msg.nickname);
    }
    sendToAll();
  });
  socket.on("disconnect", (reason) => {
    console.log("socket disconnected: ", socket.id, reason);
    socket.broadcast.emit("user_leave", socket.id);
    deleteDisconnectedUser(socket.id);
    console.log("삭제 후 서버 접속유저들:", connectedUserId);
  });

  socket.conn.on("close", (reason) => {
    // called when the underlying connection is closed
    console.log("소켓 close");
    showMsg.splice(0, showMsg.length);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
