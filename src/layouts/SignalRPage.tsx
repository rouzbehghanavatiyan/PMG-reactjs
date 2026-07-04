import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const SignalRPage = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);

    // مرحله ۱: ساخت کانکشن
    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7001/chatHub") // آدرس Hub در بک‌اند خود را جایگزین کنید
            .withAutomaticReconnect() // تلاش مجدد در صورت قطع شدن
            .build();

        setConnection(newConnection);
    }, []);

    // مرحله ۲: شروع اتصال و لیسن کردن رویدادها
    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log("Connected to SignalR!");

                    // دریافت پیام از بک‌اند
                    // "ReceiveMessage" نام متدی است که بک‌اند صدا می‌زند
                    connection.on("ReceiveMessage", (user, message) => {
                        setMessages(prev => [...prev, `${user}: ${message}`]);
                    });
                })
                .catch(e => console.log("Connection failed: ", e));

            // قطع اتصال هنگام خروج از کامپوننت (Cleanup)
            return () => {
                if (connection) {
                    connection.stop();
                }
            };
        }
    }, [connection]);

    // مرحله ۳: ارسال پیام به بک‌اند
    const sendMessage = async () => {
        if (connection && connection.state === signalR.HubConnectionState.Connected) {
            try {
                // "SendMessage" نام متدی در کلاس Hub بک‌اند شماست
                await connection.invoke("SendMessage", "Rouzbeh", "سلام از طرف React!");
            } catch (e) {
                console.error("Error sending message: ", e);
            }
        } else {
             console.log("No connection to server yet.");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
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

export default SignalRPage;
