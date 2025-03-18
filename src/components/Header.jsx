import { useState, useRef, useEffect } from "react";
import { Popover, Input, Button, message } from "antd";
import { faMagnifyingGlass, faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAuth from "@/hooks/useAuth";
import { useGroups, useJoinGroup, useMyGroups } from "@/hooks/useGroups";
import { useStore } from "@/hooks/useStore";
import '@/styles/header.css';

function Header() {
  const { logout } = useAuth();
  const user = useStore((state) => state.user);
  const darkMode = useStore((state) => state.darkMode);
  const [password, setPassword] = useState("");
  const [group, setGroup] = useState('');
  const { groups, isLoadingGroups, isErrorGroups } = useGroups(group);
  const { mutate: joinGroup, isLoading, isError, error } = useJoinGroup();
  const { refetch, myGroups } = useMyGroups();
  const menuRef = useRef(null);
  const [isMenuOpen, setMenuOpen] = useState(false);

  // Tashqi clicklarni kuzatish
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Guruhga qo'shish
  const handleJoin = (group) => {
    if (!group._id) {
      message.error("Guruh ID topilmadi!");
      return;
    }
    if (!password) {
      message.warning("Iltimos, parolni kiriting.");
      return;
    }
    joinGroup(
      { groupId: group._id, password },
      {
        onSuccess: () => {
          message.success("Guruhga muvaffaqiyatli qo'shildingiz!");
          setPassword("");
          setGroup("");
          refetch();
        },
        onError: (err) => {
          message.error(err.response?.data?.error || "Guruhga qo'shilishda xatolik yuz berdi.");
        },
      }
    );
  };

  // Guruhga qo'shish uchun popover(modal)
  const joinPopoverContent = (group) => (
    <div className="join-popover">
      <Input.Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Guruh parolini kiriting"
      />
      <Button
        type="primary"
        onClick={() => handleJoin(group)}
        disabled={isLoading}
        block
      >
        {isLoading ? "Qo'shilmoqda..." : "Qo'shilish"}
      </Button>
      {isError && message.error(error?.message || "Xatolik yuz berdi")}
    </div>
  );

  // Guruhlarni qidirish uchun filter
  const filteredGroups = groups?.filter(
    (g) => !myGroups?.some((myGroup) => myGroup._id === g._id)
  );

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            type="text"
            placeholder="Guruhlarni qidirish..."
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          />
          {group.length > 0 && (
            <div className="search-results">
              {groups.length > 0 && !isLoadingGroups && <h3>Guruhlar</h3>}
              <ul>
                {isLoadingGroups ? (
                  <p className="loading">Yuklanmoqda...</p>
                ) : filteredGroups.length > 0 ? (
                  filteredGroups.map((group, index) => (
                    <li key={group.id || index + 1}>
                      <div className="group-info">
                        <h4>{group.name}</h4>
                        <span>{new Date(group.createdAt).toISOString().slice(0, 19).replace('T', ' ')}</span>
                        <p>Yaratgan: <span>{group.owner.name}</span></p>
                      </div>
                      <Popover 
                        content={() => joinPopoverContent(group)} 
                        title="Guruh paroli" 
                        trigger="click"
                      >
                        <Button type="primary" size="small">Qo'shilish</Button>
                      </Popover>
                    </li>
                  ))
                ) : (
                  <p className="no-results">Guruhlar topilmadi</p>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        
        
        <div className="profile-menu" ref={menuRef}>
          <img
            src={user?.avatar || "/avatar.jpg"}
            alt="User Avatar"
            onClick={() => setMenuOpen(!isMenuOpen)}
          />
          
          {isMenuOpen && (
            <div className="dropdown">
              <Button type="text" block>Profil</Button>
              <Button type="text" block onClick={logout}>Chiqish</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
