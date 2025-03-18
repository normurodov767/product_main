import React, { useState } from 'react';
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, message } from "antd"; 
import { useStore } from '../../hooks/useStore';
import './style.css'

function Home() {
  const user = useStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyUsername = () => {
    if (user?.username) {
      navigator.clipboard.writeText(user.username);
      message.success("Username copied to clipboard!");
    }
  };

  const showDeleteConfirm = () => {
    setIsModalOpen(true);
  };

  const handleDeleteAccount = () => {
    console.log("Account deleted"); 
    setIsModalOpen(false);
    message.success("Account deleted successfully!");
  };

  return (
    <div className='home'>
      <div className='home__user'>
        <div className='profile__content'>
          <h3>Profile</h3>
          <div className='content__btn'>
            <button className='username__copy' onClick={handleCopyUsername}>
              <FontAwesomeIcon icon={faCopy} /> Copy Username
            </button>
            <button className='username__delete' onClick={showDeleteConfirm}>
              <FontAwesomeIcon icon={faTrash} /> Delete Account
            </button>
          </div>
        </div>
        <div className='profile__info'>
          <div className='info__text'>
            <div className='user__active'>
              <p>{user ? user.username : "No username"}</p>
            </div>
            <h4>{user ? user.name : "Guest"}</h4>
          </div>
        </div>
      </div>

      <Modal
        title="Confirm Account Deletion"
        open={isModalOpen}
        onOk={handleDeleteAccount}
        onCancel={() => setIsModalOpen(false)}
        okText="Yes, Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete your account?</p>
      </Modal>
    </div>
  );
}

export default Home;
