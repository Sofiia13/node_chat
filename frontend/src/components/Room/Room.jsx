import styles from './Room.module.scss';

export const Room = ({ roomName, isSelected, onSelect }) => {
  return (
    <div className={`${styles.room} ${isSelected ? styles.room__selected : ''}`} onClick={onSelect}>
      {roomName}
    </div>
  );
};
