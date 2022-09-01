import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import { PaperAirplaneIcon } from "@heroicons/react/solid";
import InputEmoji from "react-input-emoji";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

const ENDPOINT = "young-anchorage-68307.herokuapp.com";
//const ENDPOINT = "localhost:3001";

const socket = io.connect(ENDPOINT);

const Chat = () => {
  const [userId, setUserId] = useState("");
  const [msg, setMsg] = useState("");
  const [showMsg, setShowMsg] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [nickname, setNickName] = useState("");
  const [nicknameList, setNicknameList] = useState([]);
  const [nicknameExist, setNicknameExist] = useState(0);
  const [text, setText] = useState("");
  const [thumbUrl, setThumbUrl] = useState(
    "https://res.cloudinary.com/applotnwjd/image/upload/v1661442000/tart-lotto-thumb/user_gmrg6z.png"
  );
  const [uploadImg, setUploadImg] = useState("");
  const msgRef = useRef();
  const scrollRef = useRef();

  // useEffect(() => {
  //   //console.log("연결된 유저들: ", connectedUsers);
  // }, [connectedUsers]);

  socket.on("connect", () => {
    setUserId(socket.id);
    //console.log("User Connection: ", socket.id);
    socket.on("send-to-client-users", (users) => {
      setConnectedUsers(users);
    });
    socket.on("to-all", (text) => {
      //console.log("TEXT: ", text);
      setShowMsg(text);
    });
    socket.on("change-nickname", (nicknameArr) => {
      setNicknameList((prevList) => nicknameArr);
      console.log("닉네임 배열: ", nicknameArr);
    });
    // socket.on("user_leave", (user_id) => {
    //   //console.log("떠난 유저:", user_id);
    // });
  });
  // socket.on("delete-all-msg", () => {
  //   //console.log("no-user");
  // });

  useEffect(() => {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [showMsg]);

  const msgHandle = (e) => {
    setMsg(e.target.value);
  };

  const sendMsgBtn = (e) => {
    e.preventDefault();
    socket.emit("send-to-server", {
      msg,
      userId,
      nickname,
      nicknameExist,
      thumbUrl,
    });
    setMsg("");
    setNicknameExist(1);
    msgRef.current.value = "";
    msgRef.current.focus();
  };

  const sendMsg = () => {
    socket.emit("send-to-server", {
      msg,
      userId,
      nickname,
      nicknameExist,
      thumbUrl,
    });
    setMsg("");
    setNicknameExist(1);
    msgRef.current.value = "";
    msgRef.current.focus();
  };

  const sendUploadImg = (uploadImgUrl) => {
    socket.emit("send-to-server-img", {
      userId,
      nickname,
      nicknameExist,
      uploadImgUrl,
      thumbUrl,
    });
    setUploadImg("");
  };

  const nicknameHandle = (e) => {
    setNickName(e.target.value);
  };

  function handleOnEnter(text) {
    console.log("enter", text);
  }

  const thumbCallback = (img) => {
    //console.log("이미지: ", img);
    setThumbUrl(img.info.secure_url);
  };

  const uploadCallback = (img) => {
    //console.log("업로드이미지: ", img);
    sendUploadImg(img.info.secure_url);
  };

  return (
    <div className="flex justify-center">
      {/*<div className="max-w-xs mr-8 border-r border-gray-300 pr-8">
        <strong className="mb-2 block">접속 닉네임</strong>
        <ul>
          {nicknameList.map((nickname, index) => (
            <li key={index}>{nickname}</li>
          ))}
        </ul>
          </div>*/}
      <div className="max-w-lg min-w-[50%] w-2/3 flex-none clearfix jordy">
        <img
          src="https://res.cloudinary.com/applotnwjd/image/upload/v1661486654/background_wo3w0y.jpg"
          alt="배경"
        />
        <div className="mb-11">
          <ul className="flex flex-col">
            {showMsg.map((msgList, index) => (
              <li
                key={index}
                className={
                  (msgList.id === userId
                    ? "my items-end"
                    : "other items-start") +
                  " mb-4 w-full flex-none flex flex-col"
                }
              >
                {/* <div className="flex items-start mb-1"> */}
                <div
                  className={
                    (msgList.id === userId
                      ? "my flex-row-reverse items-start"
                      : "other") + " flex items-start mb-1"
                  }
                >
                  <img
                    src={msgList.thumb}
                    width={40}
                    height={40}
                    className="rounded-md mr-1"
                  />
                  <div
                    className={
                      (msgList.id === userId
                        ? "my-name hidden"
                        : "other-name") + " user"
                    }
                  >
                    <p className="text-xs hidden">{msgList.id}</p>
                    <p>{msgList.nickname}</p>
                  </div>
                </div>
                <div
                  className={
                    (msgList.id === userId
                      ? "my-msg bg-sky-300"
                      : "other-msg bg-gray-300") + " msg p-1 rounded max-w-full"
                  }
                >
                  <p className="break-words">{msgList.msg}</p>
                  <a href={msgList.uploadImg} target="_blank">
                    <img
                      src={msgList.uploadImg}
                      className="rounded-md mr-1 max-w-xs"
                    />
                  </a>
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
          <div ref={scrollRef}></div>
        </div>
        <div className="send-box fixed bottom-0 w-1/2">
          <form onSubmit={sendMsgBtn}>
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
                className="w-full hidden"
                value={msg}
              ></input>
              <InputEmoji
                type="text"
                //value={text}
                //onChange={msgHandle}
                onChange={setMsg}
                ref={msgRef}
                className="w-full"
                //onChange={setText}
                onEnter={sendMsg}
                placeholder="메시지 입력"
              />
              <button type="submit">
                <PaperAirplaneIcon className="w-5 h-5 fill-cyan-400" />
              </button>
              <CloudinaryUploadWidget
                imgUrl={thumbCallback}
                btnColor="blue"
                text="프로필"
              />
              <CloudinaryUploadWidget
                imgUrl={uploadCallback}
                btnColor="red"
                text="첨부"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
