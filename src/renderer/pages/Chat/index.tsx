import { Chip, IconButton, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from "renderer/hooks"
import { chatAPI, postMessage } from "renderer/services/chat"
import { selectActiveContext } from "renderer/store/contextSlice"
import { io, Socket } from "socket.io-client"
import styled from 'styled-components';
import SendIcon from '@mui/icons-material/Send';
import Message from './Message';
import { Item, Menu } from 'react-contexify';
import { cloneDeep } from 'lodash';

import "react-contexify/dist/ReactContexify.css";
import { BotSelector } from './BotSelector';

export type AppMessage = {
  id: number;
  sender: string;
  message: string;
  type: "message" | "bot";
  replyingTo?: {
    id: number;
    sender: string;
    message: string;
  };
  error?: string;
  botStatus?: "generating" | "error";
}

const MainBox = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 0 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`
const ChatHistoryBox = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: end;
  margin-top: 8px;
  margin-bottom: 8px;
  height: 0;
`

const ChatGuide = styled.span`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ChatHistoryHolder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #000000;
    border-radius: 20px;
    border: 3px solid #f5f5f5;
  }
`
const ChatInputBox = styled.div`
  margin: 16px 0;
  display: flex;
  flex-direction: row;
`

const parseMessage = (message: ChatAPI.Message, messages: {id: number; sender: string; message: string}[]): AppMessage => {
  const result: AppMessage = {
    id: message.id,
    sender: message.sender,
    message: message.message,
    type: message.botAction ? 'bot' : 'message',
  }
  if (message.replying_to !== undefined) {
    const replyingTo = messages.find(m => m.id === message.replying_to)
    if (!replyingTo) {
      console.log('cannot find replying to message with id', message.replying_to, ', ignore.')
    } else {
      result.replyingTo = {
        id: replyingTo.id,
        sender: replyingTo.sender,
        message: replyingTo.message,
      }
    }
  }
  return result
}

const lookupMessage = (messages: AppMessage[], id: number): (AppMessage | undefined) => {
  const message = messages.find(m => m.id === id)
  if (!message) {
    console.log('cannot find message with id', id, ', ignore.')
    return undefined
  }
  return message
}

const Chat: React.FC = () => {
  const activeContext = useAppSelector(selectActiveContext)
  const socketRef = useRef<Socket>()
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<AppMessage[]>([])
  const [input, setInput] = useState("")
  const messageEndDiv = useRef<HTMLDivElement | null>(null)
  const [currentMsg, setCurrentMsg] = useState<AppMessage | null>(null)
  const [replyToMsg, setReplyToMsg] = useState<AppMessage | null>(null)
  const textFieldRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (activeContext === null) return
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    socketRef.current = io(activeContext.backendURL)
    socketRef.current.on('connect', () => {
      setConnected(true)
    })
    socketRef.current.on('disconnect', () => {
      setConnected(false)
    })
    socketRef.current.on('history', (history: ChatAPI.Message[]) => {
      setMessages(history.map(msg => parseMessage(msg, history)))
    })
    socketRef.current.on('message', (message: ChatAPI.Message) => {
      setMessages(messages => [...messages, parseMessage(message, messages)])
    })
    socketRef.current.on('bot', (message: ChatAPI.BotMessage) => {
      if (message.status === "begin") {
        setMessages(messages => [...messages, {
          id: message.id,
          sender: message.sender,
          message: '',
          type: 'bot',
          botStatus: 'generating',
          replyingTo: lookupMessage(messages, message.replying_to)
        }])
      } else {
        setMessages(messages => {
          const targetMsgIndex = messages.findIndex(m => m.id === message.id)
          const targetMsg = cloneDeep(messages[targetMsgIndex])
          if (!targetMsg) {
            console.log('cannot find bot message with id', message.id, ', ignore.')
            return messages
          }
          if (message.status === "continue") {
            targetMsg.message = message.message
          } else if (message.status === "end") {
            if (targetMsg.botStatus === 'generating') {
              targetMsg.botStatus = undefined
            }
          } else {
            targetMsg.botStatus = 'error'
            targetMsg.error = message.message
          }
          const newMessages = [
            ...messages
          ]
          newMessages[targetMsgIndex] = targetMsg
          return newMessages
        })
      }
    })
  }, [activeContext])
  useEffect(() => {
    if (messageEndDiv.current) {
      setTimeout(() => {
        messageEndDiv.current!.scrollIntoView({behavior: 'smooth'})
      }, 0)
    }
  }, [messages])
  const sendMessage = () => {
    if (input.trim() === "") return
    chatAPI(postMessage, input, replyToMsg?.id)
    setInput("")
    setReplyToMsg(null)
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }
  const handleReply = () => {
    if (!currentMsg) return
    setReplyToMsg(currentMsg)
    textFieldRef.current!.focus()
  }
  const handleBotSelector = (botName: string) => {
    setInput(`@${botName} ${input}`)
    textFieldRef.current!.focus()
  }
  return (
    <MainBox>
      {!connected && <Chip label="Disconnected" color="error" />}
      <ChatHistoryBox>
        {messages.length === 0 && <ChatGuide>Send your first message below!</ChatGuide>}
        {messages.length !== 0 && <ChatHistoryHolder>
          {
            messages.map(msg => <Message key={`${msg.id}`} message={msg} onContextMenu={setCurrentMsg}/>)
          }
          <div ref={messageEndDiv}/>
        </ChatHistoryHolder>}
      </ChatHistoryBox>
      <BotSelector onClick={handleBotSelector}/>
      <ChatInputBox>
        <TextField
          label={replyToMsg ? `Reply to #${replyToMsg.id}` : "Message"}
          size="small"
          variant="outlined"
          style={{flexGrow: 1}}
          onKeyDown={onKeyDown}
          value={input}
          onChange={e => setInput(e.target.value)}
          inputRef={textFieldRef}
          />
        <IconButton color="primary" onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </ChatInputBox>
      <Menu id="context-menu">
        <Item onClick={handleReply}>Reply</Item>
      </Menu>
    </MainBox>
  )
}
export default Chat