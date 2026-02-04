import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Message } from '../../components/Message';
import styles from './Chat.module.scss';

export const Chat = ({ currentUsername }) => {
  return (
    <div className={styles.chat}>
      <h1>Chat Page</h1>
      <Button onClick={() => {}}>Add Room</Button>
      <div className={styles.chat__inputGroup}>
        <Input
          placeholder="Input your message..."
          value={''}
          onChange={() => {}}
        />
        <Button onClick={() => {}}>Send</Button>
      </div>
      <Message text="Hello, how are you?" sender={currentUsername} />
    </div>
  );
};
