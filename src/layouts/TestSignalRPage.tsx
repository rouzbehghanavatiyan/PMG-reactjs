import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const TestSignalRPage = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7001/chatHub")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR!");

          connection.on("ReceiveMessage", (user, message) => {
            setMessages((prev) => [...prev, `${user}: ${message}`]);
          });
        })
        .catch((e) => console.log("Connection failed: ", e));

      return () => {
        if (connection) {
          connection.stop();
        }
      };
    }
  }, [connection]);

  const sendMessage = async () => {
    if (
      connection &&
      connection.state === signalR.HubConnectionState.Connected
    ) {
      try {
        await connection.invoke("SendMessage", "Rouzbeh", "سلام از طرف React!");
      } catch (e) {
        console.error("Error sending message: ", e);
      }
    } else {
      console.log("No connection to server yet.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>تست اتصال SignalR</h3>
      <button onClick={sendMessage}>ارسال پیام به سرور</button>
      <hr />
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default TestSignalRPage;
