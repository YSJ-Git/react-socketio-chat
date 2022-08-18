import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import { PaperAirplaneIcon } from "@heroicons/react/solid";

const ENDPOINT = "http://localhost:5001";

const socket = io.connect(ENDPOINT);

const Chat = () => {
  const [userId, setUserId] = useState("");
  const [msg, setMsg] = useState("");
  const [showMsg, setShowMsg] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [nickname, setNickName] = useState("");
  const [nicknameExist, setNicknameExist] = useState(0);
  const msgRef = useRef();

  useEffect(() => {
    console.log("연결된 유저들: ", connectedUsers);
  }, [connectedUsers]);

  socket.on("connect", () => {
    setUserId(socket.id);
    console.log("User Connection: ", socket.id);
    socket.on("send-to-client-users", (users) => {
      setConnectedUsers(users);
    });
    socket.on("to-all", (text) => {
      console.log("TEXT: ", text);
      setShowMsg(text);
    });
    socket.on("change-nickname", (nicknameArr) => {
      console.log("닉네임 배열: ", nicknameArr);
    });
    socket.on("user_leave", (user_id) => {
      console.log("떠난 유저:", user_id);
    });
  });
  socket.on("delete-all-msg", () => {
    console.log("no-user");
  });

  const msgHandle = (e) => {
    setMsg(e.target.value);
  };

  const sendMsg = (e) => {
    e.preventDefault();
    socket.emit("send-to-server", { msg, userId, nickname, nicknameExist });
    setMsg("");
    setNicknameExist(1);
    msgRef.current.value = "";
    msgRef.current.focus();
  };

  const nicknameHandle = (e) => {
    setNickName(e.target.value);
  };

  return (
    <div className="max-w-lg my-0 mx-auto">
      <div>
        <ul className="flex flex-col">
          {showMsg.map((msgList, index) => (
            <li
              key={index}
              className={
                (msgList.id === userId ? "my items-end" : "other items-start") +
                " mb-4 w-full flex-none flex flex-col"
              }
            >
              <div
                className={
                  (msgList.id === userId ? "my-name hidden" : "other-name") +
                  " user"
                }
              >
                <p className="text-xs hidden">{msgList.id}</p>
                <p>{msgList.nickname}</p>
              </div>
              <div
                className={
                  (msgList.id === userId
                    ? "my-msg bg-sky-300"
                    : "other-msg bg-gray-300") + " msg p-1 rounded max-w-full"
                }
              >
                <p className="break-words">{msgList.msg}</p>
              </div>
              <div className="date">
                <p className="text-xs">
                  {msgList.time}
                  <span>({msgList.date})</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="send-box">
        <form onSubmit={sendMsg}>
          <div className="flex justify-between border-t border-b border-solid border-gray-400">
            <input
              type="text"
              placeholder="닉네임"
              onChange={nicknameHandle}
              className={(nicknameExist === 0 ? "" : "hidden") + " nickname"}
            />
            <input
              type="text"
              placeholder="메시지 입력"
              onChange={msgHandle}
              ref={msgRef}
              className="w-full"
            ></input>
            <button type="submit">
              <PaperAirplaneIcon className="w-5 h-5 fill-cyan-400" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
