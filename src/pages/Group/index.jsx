import React, { useEffect, useState } from "react";
import { Modal, Input, Dropdown, Button, List, Spin, message } from "antd";
import { useParams } from "react-router-dom";
import { FaShoppingCart, FaTimes, FaStoreSlash  } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import {
  useMyGroups,
  useMember,
  useConfirmLeaveGroup,
  useConfirmDeleteGroup,
  useAddMember,
  useRemoveMember,
  useGroupItems
} from "@/hooks/useGroups";
import { useStore } from "@/hooks/useStore";
import './style.css';

function Group() {
  const { id } = useParams();
  const { myGroups, isLoadingMyGroups } = useMyGroups();
  const group = myGroups.find((g) => String(g._id) === String(id));
  const [member, setMember] = useState('');
  const { members, isLoadingMember, isErrorMember } = useMember(member);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useStore((state) => state.user);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const confirmLeaveGroup = useConfirmLeaveGroup();
  const confirmDeleteGroup = useConfirmDeleteGroup();
  const { mutate: addMemberMutate } = useAddMember();
  const { mutate: removeMemberMutate } = useRemoveMember();
  const { addItemMutation, removeItemMutation, markItemAsBoughtMutation, removeBoughtItemMutation } = useGroupItems();
  const [newItem, setNewItem] = useState("");

  // guruh ma'lumotlarini yuklashdagi xatolik nazorati vaqti 
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // guruh ma'lumotlarini yuklashdagi xatolik nazorati
  if (!group) {
    return (
      <div style={{ textAlign: "center", marginTop: "20vh" }}>
        {loadingTimeout ? (
          <p style={{ color: "red", fontSize: "18px", textAlign: "center" }}>
            Ma'lumot yuklanmadi. Iltimos, qayta urinib ko'ring!
          </p>
        ) : (
          <Spin size="large" />
        )}
      </div>
    );
  }

  // guruh loadingi
  if (isLoadingMyGroups) {
    return <Spin size="large" />;
  }

  // modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  // modalni yopish
  const handleCancel = () => {
    setIsModalOpen(false);
    setMember("");
  };

  // foydalanuvchi qo'shishni tasdiqlovchi modal va foydalanuvchi qo'shish
  const handleSelectMember = (member) => {
    console.log(user, group, member);
    
    if (!user?._id || !group?._id) {
        message.error("Foydalanuvchi yoki guruh ma'lumotlari topilmadi!");
        return;
    }

    if (user._id !== group.owner._id) {
        message.error("Faqat guruh egasi yangi a'zolar qo'sha oladi!");
        return;
    }

    if (!member?._id) {
        message.error("A'zo ma'lumotlari topilmadi!");
        return;
    }

    Modal.confirm({
        title: "A'zo qo'shishni tasdiqlang",
        content: `${member.name} (@${member.username}) ni guruhga qo'shmoqchimisiz?`,
        onOk: () => {
            return new Promise((resolve, reject) => {
                addMemberMutate(
                    { groupId: group._id, memberId: member._id },
                    {
                        onSuccess: () => {
                            setIsModalOpen(false);
                            setMember("");
                            message.success(`${member.name} guruhga qo'shildi!`);
                            resolve();
                        },
                        onError: (error) => {
                            message.error(`Xatolik: ${error.response?.data?.message || error.message}`);
                            reject();
                        },
                    }
                );
            });
        },
        okText: "Ha",
        cancelText: "Yo'q",
    });
  };
  

  // Add Member va Delete Group va Leave Group tugmalari
  const items = [
    {
      label: "A'zo qo'shish",
      key: "add-member",
      onClick: showModal,
    },
    {
      type: "divider",
    },
    {
      label: user?._id === group?.owner?._id ? "Guruhni o'chirish" : "Guruhdan chiqish",
      key: "delete-group",
      onClick: () => {
        if (!user?._id || !group?._id) {
          message.error("Foydalanuvchi yoki guruh ma'lumotlari topilmadi!");
          return;
        }
        
        if (user._id === group.owner._id) {
          confirmDeleteGroup(group._id);
        } else {
          confirmLeaveGroup(group._id);
        }
      },
      danger: true,
    },
  ];

  // Guruhdan foydalanuvchini o'chirish
  const handleRemoveMember = (member) => {
    if (!user?._id || !group?._id) {
      message.error("Foydalanuvchi yoki guruh ma'lumotlari topilmadi!");
      return;
    }

    if (user._id !== group.owner._id) {
      message.error("Faqat guruh egasi a'zolarni o'chira oladi!");
      return;
    }

    Modal.confirm({
      title: "A'zoni o'chirishni tasdiqlang",
      content: `${member.name} (@${member.username}) ni guruhdan o'chirmoqchimisiz?`,
      onOk: () => {
        return new Promise((resolve, reject) => {
          removeMemberMutate(
            { groupId: group._id, memberId: member._id },
            {
              onSuccess: () => {
                message.success(`${member.name} guruhdan o'chirildi!`);
                resolve();
              },
              onError: (error) => {
                message.error(`Xatolik: ${error.response?.data?.message || error.message}`);
                reject();
              },
            }
          );
        });
      },
      okText: "Ha",
      cancelText: "Yo'q",
    });
  };

  // Guruhga mahsulot qo'shish
  const handleAddItem = () => {
    if (!newItem.trim()) return;
    if (!user?._id || !group?._id) {
      message.error("Foydalanuvchi yoki guruh ma'lumotlari topilmadi!");
      return;
    }
    addItemMutation.mutate({
      groupId: group._id,
      itemData: {
        title: newItem,
        addedBy: user._id,
      },
    });
    setNewItem("");
  };

  // Guruhdan mahsulotni o'chirish
  const handleRemoveItem = (itemId) => {
    removeItemMutation.mutate(itemId);
  };

  // Guruhdan mahsulotni sotib olingan deb belgilash
  const handleMarkAsBought = (itemId) => {
    markItemAsBoughtMutation.mutate(itemId);
  };

  // Sotib olingan mahsulotni o'chirish
  const handleRemoveBoughtItem = (itemId) => {
    removeBoughtItemMutation.mutate(itemId);
  };

  return (
    <div className="group-page">
      <div className="group-header">
        <h3>{group.name}</h3>
        <div className="group-actions">
          <div className="owner">
            <h3>Owner:</h3>
            <p>
              <span>{group?.owner?.name ? group.owner.name[0].toUpperCase() : ""}</span>
              {group?.owner?.name ? group.owner.name.charAt(0).toUpperCase() + group.owner.name.slice(1) : "Guest"}
              ({group?.owner ? group.owner.username : "No username"})
            </p>
          </div>
          <Dropdown menu={{ items }} trigger={["click"]} overlayClassName="custom-dropdown">
            <button onClick={(e) => e.preventDefault()} className="menu-btn-group">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </Dropdown>
        </div>
      </div>
      <div className="group-content">
        <div className="group-info">
          <div className="group-description">
            <h4>
              Items <span>{group.items.length}</span>
            </h4>
            <div className="group-items">
              <input
                type="text"
                className="input"
                placeholder="Add Title"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <button className="add-item" onClick={handleAddItem}>+</button>
            </div>
          </div>
          <ul className="items-list">
            {group.items.length > 0 ? (
              group.items.map((item, index) => (
                <li key={`${item._id}-${index}`} className="item-card">
                  <div className="avatar">{item.title[0].toUpperCase()}</div>
                  <div className="item-content">
                    <div className="item-title-wrapper">
                      <h4 className="item-title">{item.title}</h4>
                      {item.isBought && item.boughtBy ? (
                        <span className="bought-label">
                          Bought By <strong>{item.boughtBy.name
                          .split(" ")
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ") || "Unknown"}</strong>
                          {" " + new Date(item.boughtAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          , {new Date(item.boughtAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                    <p className="item-meta">
                      Created By {item.owner?.name
                        .split(" ")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ") || "Unknown"} (
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })},
                      {new Date(item.createdAt).toLocaleDateString()})
                    </p>
                  </div>
                  <div className="item-actions">
                    {!item.isBought ? (
                      <button className="btn green" onClick={() => handleMarkAsBought(item._id)}>
                        <FaShoppingCart />
                      </button>
                    ): item.isBought && (
                      <button className="btn yellow" onClick={() => handleRemoveBoughtItem(item._id)}>
                        <FaStoreSlash  />
                      </button>
                    )}

                    {(user?._id === group?.owner?._id || user?._id === item?.owner?._id) && (
                      <button className="btn red" onClick={() => handleRemoveItem(item._id)}>
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </li>

              ))
            ) : (
              <p>Hozircha hech qanday item yo'q.</p>
            )}
          </ul>
        </div>
        <div className="group-members">
          <div className="group-description">
            <h4>
              Members <span>{group.members.length}</span>
            </h4>
          </div>
          <ul className="members-list">
            {group.members.map((member, index) => (
              <li key={`${member.id}-${index}`} className="member-item">
                <div className="avatar">{member.username[0].toUpperCase()}</div>
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  <span className="member-username">{member.username}</span>
                </div>
                {user?._id === group.owner._id && member._id !== group.owner._id && (
                  <button className="remove-btn" onClick={() => handleRemoveMember(member)}>
                    <FaTimes />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Modal
        className="custom-modal"
        title="Add New Member"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} className="cancel-btn">
            Cancel
          </Button>
        ]}
        styles={{
          body: { height: "300px" },
          content: { maxWidth: "500px" },
        }}
      >
        <Input
          placeholder="Enter member name"
          value={member}
          onChange={(e) => setMember(e.target.value)}
          className="member-input"
        />
        <List
          bordered
          dataSource={members}
          loading={isLoadingMember}
          renderItem={(item) => (
            <List.Item onClick={() => handleSelectMember(item)} style={{ cursor: "pointer" }} className="member-item">
              {item.username} (@{item.name})
            </List.Item>
          )}
          style={{ marginTop: "10px", maxHeight: "250px", overflowY: "auto", scrollbarWidth: "none" }}
        />
        {isErrorMember && <p style={{ color: "red" }}>Error loading members</p>}
      </Modal>
    </div>
  );
}

export default Group;
