
import './App.css';
import { useSocket } from './context/SocketProvider';
import { useEffect, useState } from 'react';
import { io, Socket } from "socket.io-client";

function App() {

  const { sendMessage, messages } = useSocket();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage(""); // ⬅️ Clear the input after sending
    }
  };
  

  return (
    <div className=" App h-screen flex justify-center items-center text-center">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border text-xl mr-3 p-3"
        placeholder="send message"
      />
      <button
        className='bg-blue-400 text-2xl py-2 px-3 text-white'
        onClick={handleSend}
      >
        send
      </button>

      <div>
        {messages.map(e =>{
          return <li>{e}</li>
        })}
      </div>
    </div>
  );
}

export default App;
