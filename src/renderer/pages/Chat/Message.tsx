import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Typography, CircularProgress, Tooltip, Divider } from '@mui/material';
import { UserDisplay } from './UserDisplay';
import { AppMessage } from './index';
import { useContextMenu } from 'react-contexify';
import MarkdownRender from 'renderer/components/MarkdownRender';
import { isEqual } from 'lodash';

type MessageProps = {
  message: AppMessage;
  onContextMenu?: (message: AppMessage) => void;
};

const MessageText = styled.div<{isError?: boolean}>`
  border-radius: 8px;
  padding: 2px 8px;
  transition: 0.3s;
  ${props => {
    if (props.isError) {
      return {
        backgroundColor: 'rgba(255,0,0,0.1)',
      }
    }
  }}
  &:hover {
    ${props => {
      if (props.isError) {
        return {
          backgroundColor: 'rgba(255,0,0,0.15)',
        }
      } else {
        return {
          backgroundColor: 'rgba(0,0,0,0.05)',
        }
      }
    }}
  }
`

const MessageContainer = styled.div<{isBot?: boolean}>`
  padding: 8px 12px;
  border-radius: 8px;
  display: block;
  width: 100%;
  box-sizing: border-box;
  ${props => {
    if (props.isBot) {
      return {
        backgroundColor: '#f5f5f5',
      }
    }
  }}
`;

const Sender = styled(Typography)`
  font-weight: bold;
  margin-bottom: 4px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LoadingIndicator = styled(CircularProgress)`
  margin-left: 8px;
`;

const ReplyContainer = styled.div`
  color: grey;
  font-size: 12px;
  margin-bottom: 4px;
`

const AIWarning = styled.span`
  text-align: right;
  width: 100%;
  color: gray;
  font-weight: lighter;
`

const NewLineTypography = styled(Typography)`
  white-space: pre-line;
`

const Message: React.FC<MessageProps> = ({ message, onContextMenu }) => {
  const { show } = useContextMenu({
    id: 'context-menu'
  });
  const handleShow = (e: React.MouseEvent) => {
    if (message.botStatus) return;
    if (onContextMenu) onContextMenu(message);
    show({event: e});
  }
  return (
    <MessageContainer isBot={message.type === "bot"}  onContextMenu={handleShow}>
      {message.replyingTo !== undefined && <ReplyContainer>
        Reply @
        <UserDisplay nameOnly userID={message.replyingTo.sender} />
        : {message.replyingTo.message.length > 70 ? message.replyingTo.message.slice(0, 67) + "..." : message.replyingTo.message}
      </ReplyContainer>}
      <Sender variant="caption">
        <UserDisplay userID={message.sender} nameStyle={{fontSize: 16}}/>
        {message.botStatus === "generating" && <LoadingIndicator size={16} />}
        {message.type === "bot" && <AIWarning>AI-generated content</AIWarning>}
      </Sender>
      <MessageText isError={message.botStatus === "error"}>
        {(message.type === "message" || message.botStatus) &&
          <NewLineTypography variant="body1">
            {message.message}
          </NewLineTypography>
        }
        {message.type === "bot" && !message.botStatus &&
          <MarkdownRender children={message.message} />
        }
      </MessageText>
      {message.error && <>
        <Divider style={{margin: '8px 0'}}/>
        <Typography variant="body1">
          Error: {message.error}
        </Typography>
      </>}
    </MessageContainer>
  );
};

const compareProps = (prevProps: MessageProps, nextProps: MessageProps) => {
  return isEqual(prevProps.message, nextProps.message);
}

export default React.memo(Message, compareProps);