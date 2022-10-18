import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import {
  PaperAirplaneIcon,
  XCircleIcon,
  OfficeBuildingIcon,
} from "@heroicons/react/solid";
import InputEmoji from "react-input-emoji";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";
import ContentEditable from "react-contenteditable";
import Switch from "@mui/material/Switch";
import {
  alpha,
  styled,
  createTheme,
  ThemeProvider,
} from "@mui/material/styles";

const label = { inputProps: { "aria-label": "Company Switch" } };
const theme = createTheme({
  palette: {
    indigo: {
      main: "#8c87e9",
      contrastText: "#fff",
    },
  },
});

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
    "https://res.cloudinary.com/applotnwjd/image/upload/v1661442000/tart-lotto-thumb/user_icon_gizpki.png"
  );
  const [uploadImg, setUploadImg] = useState("");
  const [showImgBox, setShowImgBox] = useState(false);
  const msgRef = useRef();
  const scrollRef = useRef();
  const copyImgref = useRef();
  const [copyImg, setCopyImg] = useState("");
  const [companyMode, setCompanyMode] = useState(false);

  socket.on("connect", () => {
    setUserId(socket.id);
    socket.on("send-to-client-users", (users) => {
      setConnectedUsers(users);
    });
    socket.on("to-all", (text) => {
      setShowMsg(text);
    });
    socket.on("change-nickname", (nicknameArr) => {
      setNicknameList((prevList) => nicknameArr);
      //console.log("닉네임 배열: ", nicknameArr);
    });
  });

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

  const sendCopyImg = (copyImg) => {
    socket.emit("send-to-server-copy-img", {
      userId,
      nickname,
      nicknameExist,
      copyImg,
      thumbUrl,
    });
    setCopyImg("");
    setShowImgBox(false);
  };

  const nicknameHandle = (e) => {
    setNickName(e.target.value);
  };

  function handleOnEnter(text) {
    console.log("enter", text);
  }

  const thumbCallback = (img) => {
    setThumbUrl(img.info.secure_url);
  };

  const uploadCallback = (img) => {
    sendUploadImg(img.info.secure_url);
  };

  const handleEditor = (e) => {
    //console.log("과연?", e);
    setCopyImg(e.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="flex justify-center">
        <div className="flex-none clearfix jordy w-11/12 xl:w-1/2">
          {companyMode ? (
            <img
              src="https://res.cloudinary.com/applotnwjd/image/upload/v1661486654/background_wo3w0y.jpg"
              alt="배경"
            />
          ) : (
            <img
              src="https://res.cloudinary.com/applotnwjd/image/upload/v1666129664/paper_hq0qyq.jpg"
              alt="배경"
            />
          )}

          <div className="mb-24">
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
                      width={30}
                      height={30}
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
                        : "other-msg bg-gray-300") +
                      " msg p-1 rounded max-w-full"
                    }
                  >
                    <p className="break-words">{msgList.msg}</p>
                    <a href={msgList.uploadImg} target="_blank">
                      <img
                        src={msgList.uploadImg}
                        className="rounded-md mr-1 max-w-xs"
                      />
                    </a>
                    <div
                      className="rounded-md mr-1 max-w-xs break-all"
                      dangerouslySetInnerHTML={{ __html: msgList.copyImg }}
                    ></div>
                  </div>
                  <div className="date">
                    <p className="text-xs">
                      {msgList.time}
                      {/* <span>({msgList.date})</span> */}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div ref={scrollRef}></div>
          </div>
          <div
            className={
              (companyMode
                ? "bg-gradient-to-r from-[#09a9f3] to-[#096cd1] "
                : "bg-white ") +
              "send-box fixed bottom-0 left-1/2 -translate-x-1/2 w-11/12 xl:w-1/2 border-t border-solid border-indigo-300 pt-1 px-2"
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <CloudinaryUploadWidget
                  imgUrl={thumbCallback}
                  btnColor="#4f46e5"
                  text="프로필"
                />
                <CloudinaryUploadWidget
                  imgUrl={uploadCallback}
                  btnColor="#4f46e5"
                  text="첨부"
                />
                <button
                  className="w-14 h-7 text-sm text-white bg-indigo-600 rounded mb-1"
                  onClick={() => setShowImgBox((prev) => !prev)}
                >
                  이미지
                </button>
              </div>
              <div className="flex items-center">
                <Switch
                  {...label}
                  color="indigo"
                  onClick={() => setCompanyMode((prev) => !prev)}
                />
                <OfficeBuildingIcon
                  className={
                    (companyMode ? "fill-white " : "fill-indigo-700 ") +
                    "w-5 h-5 "
                  }
                />
              </div>
            </div>
            <form onSubmit={sendMsgBtn}>
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="닉네임"
                  onChange={nicknameHandle}
                  className={
                    (nicknameExist === 0 ? "" : "hidden") +
                    " nickname rounded-3xl w-20 sm:w-40 h-10 p-2.5 border border-[#eaeaea]"
                  }
                />
                <input
                  type="text"
                  placeholder="메시지 입력"
                  onChange={msgHandle}
                  ref={msgRef}
                  className="w-full hidden"
                  value={msg}
                ></input>
                <div
                  className={
                    (companyMode ? "white " : "indigo ") + "w-full emoji"
                  }
                >
                  <InputEmoji
                    type="text"
                    //value={text}
                    //onChange={msgHandle}
                    onChange={setMsg}
                    ref={msgRef}
                    //onChange={setText}
                    onEnter={sendMsg}
                    placeholder="메시지 입력"
                  />
                </div>

                <button type="submit">
                  <PaperAirplaneIcon
                    className={
                      (companyMode ? "fill-white " : "fill-indigo-700 ") +
                      "w-5 h-5"
                    }
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
        <div
          className={
            (showImgBox ? "" : "hidden ") +
            "text-center fixed left-1/2 bottom-28 -translate-x-2/4 border border-indigo-700"
          }
        >
          <ContentEditable
            id="editor"
            innerRef={copyImgref}
            html={copyImg}
            disabled={false}
            onChange={(e) => handleEditor(e)}
            className="w-80 sm:w-96 min-h-min bg-white p-2 text-center"
          />
          <button
            className="bg-indigo-600 text-white w-full p-2 hover:bg-indigo-700"
            onClick={() => sendCopyImg(copyImg)}
          >
            이미지 전송
          </button>
          <XCircleIcon
            className="w-7 h-7 fill-indigo-600 bg-white absolute -right-3 -top-3 rounded-full	cursor-pointer hover:fill-indigo-700"
            onClick={() => setShowImgBox(false)}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Chat;
