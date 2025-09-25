import { Menu, Dropdown, Avatar, Badge, List, Spin } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import { useAuthContext } from "../../hooks/useAuthContext";
import "../../styles/MainNavbar.css";
import { useTranslation } from "react-i18next";
import { useAuthForm } from "../../hooks/useAuthForm";
import LanguageSwitcher from "../LanguageSwitcher";
import { useState, useEffect } from "react";
import FollowedAuthorsModal from "../follower/FollowedAuthorsModal";
import { useNotification } from "../../hooks/useNotification";
import { io } from "socket.io-client";

const MainNavbar = () => {
  const { isLoggedIn, user } = useAuthContext();
  const { t } = useTranslation("navbar");
  const { handleLogout } = useAuthForm();

  const [followedOpen, setFollowedOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const {
    notifications,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  const [localNotifs, setLocalNotifs] = useState(notifications);

  useEffect(() => {
    if (isLoggedIn && user?.role === "user") {
      loadNotifications();
    }
  }, [isLoggedIn, user, loadNotifications]);

  useEffect(() => {
    setLocalNotifs(notifications);
  }, [notifications]);

  // ✅ Realtime Socket.IO
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      query: { userId: user.sub },
    });

    socket.on("notification", (notif) => {
      setLocalNotifs((prev) => [notif, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, user]);

  const unreadCount = localNotifs.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
    setLocalNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setLocalNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">{t("profile")}</Link>
      </Menu.Item>

      {user?.role === "user" && (
        <Menu.Item key="followed" onClick={() => setFollowedOpen(true)}>
          {t("followedAuthors")}
        </Menu.Item>
      )}

      <Menu.Item key="logout" onClick={handleLogout}>
        {t("logout")}
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
      {localNotifs.length > 0 && (
        <div
          className="notification-mark-all"
          onClick={(e) => {
            e.stopPropagation();
            handleMarkAllAsRead();
          }}
        >
          {t("markAllAsRead")}
        </div>
      )}

      {loading ? (
        <Spin className="notification-spin" />
      ) : localNotifs.length === 0 ? (
        <div className="notification-empty">{t("noNotifications")}</div>
      ) : (
        <List
          size="small"
          dataSource={localNotifs}
          renderItem={(item) => (
            <List.Item
              className={`notification-item ${item.isRead ? "read" : "unread"}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!item.isRead) handleMarkAsRead(item.id); // chỉ đánh dấu
              }}
            >
              <div className="notification-message">{item.message}</div>
              {!item.isRead && <span className="notification-dot" />}
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <>
      <div className="main-navbar">
        <Menu
          theme="light"
          mode="horizontal"
          selectable={false}
          className="menu-left"
        >
          <Menu.Item key="home">
            <Link to="/">{t("home")}</Link>
          </Menu.Item>
          <Menu.Item key="blogs">
            <Link to="/blogs">{t("blogs")}</Link>
          </Menu.Item>

          {user?.role === "author" && (
            <Menu.Item key="my-posts">
              <Link to="/author/posts">{t("myPosts")}</Link>
            </Menu.Item>
          )}

          {user?.role === "admin" && (
            <Menu.Item key="dashboard">
              <Link to="/admin/dashboard">{t("dashboard")}</Link>
            </Menu.Item>
          )}
        </Menu>

        <div className="menu-right">
          <LanguageSwitcher />

          {isLoggedIn && user?.role === "user" && (
            <Dropdown
              overlay={notificationMenu}
              trigger={["click"]}
              visible={notifOpen}
              onVisibleChange={(flag) => setNotifOpen(flag)}
              placement="bottomRight"
            >
              <div className="bell-wrapper">
                <BellOutlined className="bell-icon" />
                {unreadCount > 0 && (
                  <Badge
                    count={unreadCount}
                    size="small"
                    className="bell-badge"
                  />
                )}
              </div>
            </Dropdown>
          )}

          {isLoggedIn ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="user-avatar">
                <Avatar icon={<UserOutlined />} />
              </div>
            </Dropdown>
          ) : (
            <Menu theme="light" mode="horizontal" selectable={false}>
              <Menu.Item key="login">
                <Link to="/login">{t("login")}</Link>
              </Menu.Item>
              <Menu.Item key="register">
                <Link to="/register">{t("register")}</Link>
              </Menu.Item>
            </Menu>
          )}
        </div>
      </div>

      <FollowedAuthorsModal
        open={followedOpen}
        onClose={() => setFollowedOpen(false)}
      />
    </>
  );
};

export default MainNavbar;
