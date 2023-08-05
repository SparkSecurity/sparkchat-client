import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addContext } from '../../store/contextSlice';
import { chatAPI, createUser, getUserInfo } from 'renderer/services/chat';

const AddContextDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [backendURL, setBackendURL] = useState('');
  const [inputUserID, setInputUserID] = useState('');
  const [inputName, setInputName] = useState('');
  const [inputAvatar, setInputAvatar] = useState('');
  const dispatch = useDispatch();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (inputUserID !== "") {
      const info = await getUserInfo({ backendURL }, inputUserID);
      if (info === null) {
        alert("User ID not found");
        return;
      }
      dispatch(addContext({ backendURL, userID: inputUserID, name: info.name, imageURL: info.image_url }));
      handleClose()
      return;
    }
    const userInfo = await createUser({ backendURL }, inputName, inputAvatar.length === 0 ? undefined: inputAvatar)
    dispatch(addContext({ backendURL, userID: userInfo.id, name: inputName, imageURL: inputAvatar }));
    handleClose();
  };

  return (
    <>
      <Button variant="outlined" style={{ width: '100%' }} onClick={handleOpen}>
        Add context
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Context</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Backend URL"
            type="text"
            fullWidth
            value={backendURL}
            onChange={(e) => setBackendURL(e.target.value)}
          />
          <TextField
            margin="dense"
            label="User ID (if empty, will register a new user)"
            type="text"
            fullWidth
            value={inputUserID}
            onChange={(e) => setInputUserID(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Name (ignored if user ID is presented)"
            type="text"
            fullWidth
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Avatar URL (optional, ignored if user ID is presented)"
            type="text"
            fullWidth
            value={inputAvatar}
            onChange={(e) => setInputAvatar(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddContextDialog;