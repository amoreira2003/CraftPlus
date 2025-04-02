import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import on from "./on.webp";
import off from "./off.webp";
import configIMG from "./configure.webp";
import Sockette from "sockette";

function App() {
  const [switchList, setSwitchList] = useState({});
  const [pairInputValue, setPairInput] = useState("");
  const [UUID, setPairUUID] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    new Sockette("ws://191.101.235.108:3100", {
      timeout: 1000,
      maxAttempts: 10,
      onopen: (e) => {
        console.log("Connected!", e);
        socket.current = e.target;
        e.target.send(
          JSON.stringify(
            createPayload("authenticate", { devType: "reactClient" })
          )
        );
      },
      onmessage: (e) => receiveMessage(e.target, e.data),
      onreconnect: (e) => console.log("Reconnecting...", e),
      onmaximum: (e) => console.log("Stop Attempting!", e),
      onclose: (e) => console.log("Closed!", e),
      onerror: (e) => console.log("Error:", e),
    });

    return () => {
      socket.current.close();
    };
  }, []);

  function createPayload(commandType, commandPayload) {
    return { type: commandType, payload: commandPayload };
  }

  function canParseJSON(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      return false;
    }
  }

  function toggleSwitchSide(uuid, side, value) {
    socket.current.send(
      JSON.stringify(
        createPayload("toggleSwitchSide", { uuid: uuid, side: side, value: value })
      )
    );
  }

  function handleSwitchToggle(uuid, value) {
    console.log(socket);
    socket.current.send(
      JSON.stringify(
        createPayload("toggleSwitch", { uuid: uuid, value: value })
      )
    );
  }

  function receiveMessage(socket, message) {
    console.log("Previous Any Switch: ", socket);
    console.log("Message: ", message);
    if (!canParseJSON(message)) {
      alert("Non Formatted Message Received: " + message);
      return;
    }

    const messageParsed = JSON.parse(message);
    switch (messageParsed.type) {
      case "pairRequestInformation":
        setPairUUID(messageParsed.payload.uuid);
        startPairSequence();
        break;

      case "syncInformation":
        console.log(messageParsed);
        console.log("synced", messageParsed.payload.switchList);
        setSwitchList(messageParsed.payload.switchList);
        break;

      case "pairRequestCompleted":
        closePairSequence();
        break;

      default:
        alert("An Unknown Message was received: " + message);
    }
  }

  function editSwitchConfiguration() {
    console.log("Edit Switch Configuration");
  }

  function startPairSequence() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("pairMenu").style.display = "flex";
  }

  function closePairSequence() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("pairMenu").style.display = "none";
    setPairInput("");
    setPairUUID(null);
  }

  function finishPairRequest() {
    socket.current.send(
      JSON.stringify(
        createPayload("pairRequestFinish", {
          uuid: UUID,

          left: false,
          right: false,
          top: false,
          bottom: false,
          front: false,
          back: false,

          value: false,
          connected: false,
          customName: pairInputValue,
        })
      )
    );
    closePairSequence();
  }

  return (
    <div className="wrapper">
      <div id="overlay" className="overlay">
        <div className="overlayPairBackground">
          
          <div id="pairMenu" className="overlayPair">
            <div className="relativeButton">
              <i
                onClick={() => {
                  closePairSequence();
                }}
                className="bx bx-x closeButton"
              />
            </div>
            <img alt="" className="pairImage" src={on} />
            <h1>Smart Switch</h1>
            <h6>
              Lets you control your redstone contraptions from anywhere. <br />{" "}
              <br /> Choose from different Sides to suit your needs, or
              experiment with other available presets, like setting a timer for
              scheduled tasks or using the hold button for added control and
              convenience in your operations.
            </h6>
            <div className="overlayPairInfoArea">
              <div className="PairInfo">
                <h6>DEVICE NAME</h6>
                <input
                  maxLength={24}
                  value={pairInputValue}
                  onChange={(e) => {
                    setPairInput(e.target.value);
                  }}
                />
                <div onClick={() => finishPairRequest()} className="pairButton">
                  <i className="bx bxs-plus-circle" />
                  PAIR DEVICE
                </div>
              </div>
            </div>
          </div>


          <div id="pairMenu2" className="overlayPair">
            <div className="relativeButton">
              <i
                onClick={() => {
                  closePairSequence();
                }}
                className="bx bx-x closeButton"
              />
            </div>
            <img alt="" className="pairImage" src={on} />
            <h1>Smart Config</h1>
            <h6>
              Lets you control your redstone contraptions from anywhere. 
            </h6>
          </div>
          </div>
          </div>
      
      <div className="switchList">
        {Object.keys(switchList).map((uuid) => (
          <label
            style={
              switchList[uuid].connected
                ? switchList[uuid].value
                  ? { backgroundColor: "#353f24" }
                  : { backgroundColor: "#232728" }
                : { backgroundColor: "#3f2424" }
            }
            key={uuid}
            className="switch"
          >
            <img
              alt=""
              className="switchImage"
              src={
                switchList[uuid].connected
                  ? switchList[uuid].value
                    ? on
                    : off
                  : off
              }
            ></img>
            <div className="textContainer">
              <h1>
                {switchList[uuid].customName
                  ? switchList[uuid].customName
                  : "Smart Switch"}
              </h1>
              <h6>
                {switchList[uuid].connected
                  ? switchList[uuid].value
                    ? "ON"
                    : "OFF"
                  : "DISCONNECTED"}
              </h6>
            </div>
            <input
              key={uuid}
              checked={switchList[uuid].value}
              id={uuid}
              type="checkbox"
              onChange={(event) => {
                switchList[uuid].connected
                  ? handleSwitchToggle(uuid, event.target.checked)
                  : console.log("Cannot Toggle, Switch is disconnected");
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default App;
