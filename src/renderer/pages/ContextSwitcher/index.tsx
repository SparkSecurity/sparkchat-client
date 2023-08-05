import { Card, CardHeader, CardContent, Container, List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Typography, ListItemButton } from "@mui/material"
import { deepPurple } from "@mui/material/colors"
import { useAppDispatch, useAppSelector } from "renderer/hooks"
import { selectContexts, removeContext, setActiveContext, Context } from "renderer/store/contextSlice"
import React from "react"
import AddContextDialog from "./AddContextDialog"
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom'

const ContextSwitcher: React.FC = () => {
  const dispatch = useAppDispatch()
  const contexts = useAppSelector(selectContexts)
  const navigate = useNavigate();
  const handleRemove = (contextIndex: number) => {
    dispatch(removeContext(contextIndex));
  };
  const handleListItemClick = (context: Context) => {
    dispatch(setActiveContext(context));
    navigate('/chat');
  };
  return (
    <React.Fragment>
      <div>
        <Typography style={{lineHeight: 4, marginTop: -100}} variant="h4" align="center">SparkChat Challenge</Typography>
        <Container style={{width: 500}}>
          <Card variant="outlined" style={{padding: 8}}>
            <List>
              {contexts.length === 0 && <ListItem><ListItemText primary="No contexts found" /></ListItem>}
              {contexts.map((context: Context, index) => (
                <ListItem key={context.userID + context.backendURL} secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(index)}>
                    <DeleteIcon />
                  </IconButton>
                } disablePadding>
                  <ListItemButton onClick={() => handleListItemClick(context)}>
                    <ListItemAvatar><Avatar sx={{bgcolor: deepPurple[200]}} src={context.imageURL}/></ListItemAvatar>
                    <ListItemText primary={context.name} secondary={<>{context.userID} <br/> {`@ ${context.backendURL}`}</>} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <AddContextDialog />
          </Card>
        </Container>
      </div>
    </React.Fragment>
  )
}

export default ContextSwitcher