import { useCallback, useEffect, useState } from "react"
import { chatAPI, getBots } from "renderer/services/chat"
import styled from "styled-components"
import { Chip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';

const BotSelectorBox = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
`

const iconStyle = {
  style: {
    marginLeft: 12,
    fontSize: 16
  }
}
export const BotSelector: React.FC<{onClick: (name: string) => void}> = (props) => {
  const [bots, setBots] = useState<ChatAPI.Bot[]>([])
  const fetchBots = useCallback(async () => {
    const bots = await chatAPI(getBots)
    setBots(bots)
  }, [])
  useEffect(() => {
    fetchBots()
  }, [fetchBots])
  return <BotSelectorBox>
    {bots.map(bot => <Chip
      key={bot.id}
      label={`@${bot.name}`}
      onClick={() => props.onClick(bot.name)}
      icon={bot.action === "TRANSLATION" ? <TranslateIcon {...iconStyle}/> : <ChatOutlinedIcon {...iconStyle}/>}
    />)}
  </BotSelectorBox>
}