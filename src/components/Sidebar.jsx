import { useEffect, useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { FaUsers, FaPlus } from "react-icons/fa";
import { Collapse, Button, Drawer, Form, Input, List, message, Modal } from "antd";
import useAuth from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useMyGroups, useCreateGroup } from "@/hooks/useGroups";
import "@/styles/sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useStore((state) => state.user);
  const { logout } = useAuth();
  const groups = useStore((state) => state.groups) || [];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const createGroup = useCreateGroup();
  const { myGroups = [], isLoadingMyGroups, refetch } = useMyGroups();
  const [joinedGroups, setJoinedGroups] = useState([]);
  const prevGroupsRef = useRef(myGroups);
  const navigate = useNavigate();

  useEffect(() => {
    if (prevGroupsRef.current !== myGroups) {
      setJoinedGroups(myGroups);
      prevGroupsRef.current = myGroups;
    }
  }, [myGroups]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleAddGroup = async (values) => {
    try {
      if (myGroups.some((group) => group.name === values.name)) {
        message.error("A group with this name already exists!");
        return;
      }
      await createGroup.mutateAsync({ name: values.name, password: values.password });
      form.resetFields();
      setDrawerOpen(false);
      await refetch();
    } catch (error) {
      console.error("Error creating group:", error);
      message.error(`Error: ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="sidebar">
      <Link className="logo" to="/">Market-group</Link>
      <div className="sidebar-content">
        <div className="profile">
          <img
            src={user?.avatar || "avatar.jpg"}
            alt="Profile"
            className="avatar"
          />
          <div className="info">
            <h4>{user ? user.name : "Guest"}</h4>
            <p>{user ? `@${user.username}` : "No username"}</p>
          </div>
        </div>
      </div>

      <Collapse
        style={{ marginTop: "10px" }}
        className="sidebar-collapse"
        defaultActiveKey={["1"]}
        items={[
          {
            key: "1",
            label: (
              <div className="collapse-label">
                <FaUsers /> Groups
              </div>
            ),
            children: (
              <>
                <Button
                  type="primary"
                  icon={<FaPlus />}
                  block
                  style={{ marginBottom: "10px" }}
                  onClick={() => setDrawerOpen(true)}
                >
                  Add Group
                </Button>

                
                <List
                  style={{ overflow: "hidden" }}
                  size="small"
                  bordered
                  loading={isLoadingMyGroups}
                  dataSource={[...(groups || []), ...(myGroups || [])]}
                  renderItem={(group) => (
                    <List.Item
                      onClick={() => group?._id && navigate(`/groups/${group._id}`)}
                      style={{ 
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: "1px solid #e4e5e6",
                        marginBottom: "5px",
                        borderRadius: "5px"
                      }}
                      className={`group-item ${window.location.pathname === `/groups/${group._id}` ? 'active' : ''}`}
                    >
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px",
                        width: "100%"
                      }}>
                        <FaUsers style={{ color: "#007bff" }} />
                        <strong style={{ 
                          fontSize: "14px",
                          color: window.location.pathname === `/groups/${group._id}` ? "#007bff" : "inherit"
                        }}>
                          {group?.name || "No Name"}
                        </strong>
                      </div>
                    </List.Item>
                  )}
                />
              </>
            ),
          },
        ]}
      />

      <Modal
        title="Yangi guruh qo'shish"
        open={drawerOpen}
        onCancel={() => setDrawerOpen(false)}
        footer={null}
        className="add-group-modal"
      >
        <Form form={form} onFinish={handleAddGroup} layout="vertical">
          <Form.Item
            name="name"
            label="Guruh nomi"
            rules={[{ required: true, message: "Iltimos, guruh nomini kiriting!" }]}
          >
            <Input placeholder="Guruh nomini kiriting..." />
          </Form.Item>
          <Form.Item
            name="password"
            label="Guruh paroli"
            rules={[{ required: true, message: "Iltimos, guruh parolini kiriting!" }]}
          >
            <Input.Password placeholder="Parolni kiriting..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Qo'shish
          </Button>
        </Form>
      </Modal>
    </div>
  );
}

export default Sidebar;
