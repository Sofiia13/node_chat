import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Message } from '../../components/Message';
import { Modal } from '../../components/Modal';
import { RoomsList } from '../../components/RoomsList/RoomsList';
import { api } from '../../api/client';
import styles from './Chat.module.scss';

const socket = io('http://localhost:3001');

export const Chat = ({ currentUsername }) => {
  const [message, setMessage] = useState('');
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingRoomName, setEditingRoomName] = useState('');
  const [rooms, setRooms] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await api.get('/rooms');
        const loadedRooms = response.data.rooms || [];
        setRooms(loadedRooms);
        setSelectedRoom(loadedRooms[0] || null);
      } catch (error) {
        console.error(error);
      }
    };

    loadRooms();
  }, []);

  useEffect(() => {
    socket.on('newMessage', (data) => {
      setMessagesList((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedRoom) return;

      try {
        const response = await api.get(`/api/${selectedRoom.id}/messages`);
        const loadedMessages = response.data.messages || [];
        setMessagesList(loadedMessages);
      } catch (error) {
        console.error(error);
      }
    };

    loadMessages();
  }, [selectedRoom, messagesList.length]);

  const handleOpenAddRoom = () => setIsAddRoomOpen(true);
  const handleCloseAddRoom = () => {
    setIsAddRoomOpen(false);
    setNewRoomName('');
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
    setIsEditRoomOpen(true);
  };

  const handleCloseEditRoom = () => {
    setIsEditRoomOpen(false);
    setEditingRoomId(null);
    setEditingRoomName('');
  };

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text || !selectedRoom) {
      return;
    }
    try {
      const response = await api.post(`/api/${selectedRoom.id}/messages`, {
        author: currentUsername,
        text,
      });
      setMessage('');
      socket.emit('sendMessage', response.data.message);
      setMessagesList((prevMessages) => [
        ...prevMessages,
        response.data.message,
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRoom = async () => {
    const name = newRoomName.trim();
    if (!name) {
      return;
    }
    try {
      const response = await api.post('/rooms', { name });
      const createdRoom = response.data.room;
      if (createdRoom) {
        setRooms((prevRooms) => [...prevRooms, createdRoom]);
        setSelectedRoom(createdRoom);
      }
      handleCloseAddRoom();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
      if (selectedRoom && selectedRoom.id === roomId) {
        setSelectedRoom(rooms[0] || null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditRoom = async () => {
    const newName = editingRoomName.trim();
    if (!newName) {
      return;
    }
    try {
      await api.put(`/rooms/${editingRoomId}`, { newName });
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === editingRoomId ? { ...room, name: newName } : room,
        ),
      );
      if (selectedRoom && selectedRoom.id === editingRoomId) {
        setSelectedRoom((prevRoom) => ({ ...prevRoom, name: newName }));
      }
      handleCloseEditRoom();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.chat}>
      <h1>Chat Page</h1>
      <Button onClick={handleOpenAddRoom}>Add Room</Button>
      <RoomsList
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        onDeleteRoom={(room) => handleDeleteRoom(room.id)}
        onEditRoom={handleOpenEditRoom}
      />

      <Modal isOpen={isAddRoomOpen} onClose={handleCloseAddRoom}>
        <h2 className={styles.modal__title}>Create room</h2>
        <Input
          placeholder="Room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <div className={styles.modal__actions}>
          <Button onClick={handleCreateRoom}>Create</Button>
          <Button onClick={handleCloseAddRoom}>Cancel</Button>
        </div>
      </Modal>

      <Modal isOpen={isEditRoomOpen} onClose={handleCloseEditRoom}>
        <h2 className={styles.modal__title}>Edit room</h2>
        <Input
          placeholder="Room name"
          value={editingRoomName}
          onChange={(e) => setEditingRoomName(e.target.value)}
        />
        <div className={styles.modal__actions}>
          <Button onClick={handleEditRoom}>Save</Button>
          <Button onClick={handleCloseEditRoom}>Cancel</Button>
        </div>
      </Modal>

      <div className={styles.chat__inputGroup}>
        <Input
          placeholder="Input your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
      {messagesList.map((msg, index) => (
        <Message key={index} text={msg.text} sender={msg.author} />
      ))}
    </div>
  );
};
