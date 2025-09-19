import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Tag,
  Divider,
  Input,
  Avatar,
  Space,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  ArrowRightOutlined,
  BookOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import "../../styles/HomePage.css";
import { useTranslation } from "react-i18next";
import { usePosts } from "../../hooks/useAuthorPost";
import { useUserPost } from "../../hooks/useUserPost";
import { useEffect } from "react";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const HomePage = () => {
  const { t } = useTranslation("home");
  const { loadUserPosts, posts } = useUserPost();
  const { loadTagsAndCategories, categories } = usePosts();

  useEffect(() => {
    loadTagsAndCategories();
    loadUserPosts();
  }, [loadTagsAndCategories, loadUserPosts]);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <Title className="hero-title">
            <span className="gradient-text">Blog System</span> -{" "}
            {t("hero.title")}
          </Title>
          <Paragraph className="hero-description">
            {t("hero.description")}
          </Paragraph>

          <Search
            placeholder={t("hero.searchPlaceholder")}
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                {t("hero.searchBtn")}
              </Button>
            }
            size="large"
            className="search-bar"
          />

          <div className="hero-stats">
            <div className="stat">
              <Title level={2} className="stat-number">
                1,000+
              </Title>
              <Text className="stat-label">{t("hero.stats.posts")}</Text>
            </div>
            <div className="stat">
              <Title level={2} className="stat-number">
                500+
              </Title>
              <Text className="stat-label">{t("hero.stats.authors")}</Text>
            </div>
            <div className="stat">
              <Title level={2} className="stat-number">
                50,000+
              </Title>
              <Text className="stat-label">{t("hero.stats.readers")}</Text>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"
            alt="Blog illustration"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="section">
        <Divider>
          <Title level={2} className="section-title">
            {t("categories.title")}
          </Title>
        </Divider>
        <Paragraph className="section-description">
          {t("categories.description")}
        </Paragraph>

        <div className="categories-grid">
          {categories.map((category, index) => {
            const colors = [
              "#f50",
              "#2db7f5",
              "#87d068",
              "#108ee9",
              "#ff85c0",
              "#722ed1",
              "#fa8c16",
              "#13c2c2",
            ];
            const color = colors[index % colors.length];

            return (
              <Card
                key={index}
                hoverable
                className="category-card"
                actions={[<ArrowRightOutlined />]}
              >
                <div className="category-icon">
                  <BookOutlined style={{ fontSize: "22px", color }} />
                </div>
                <Title level={4} className="category-name">
                  {category.name}
                </Title>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="section">
        <Divider>
          <Title level={2} className="section-title">
            {t("recentPosts.title")}
          </Title>
        </Divider>
        <Paragraph className="section-description">
          {t("recentPosts.description")}
        </Paragraph>

        <Row gutter={[24, 24]}>
          {posts
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 4) // Lấy đúng 4 bài mới nhất
            .map((post) => {
              const excerpt = post.content
                .replace(/<[^>]+>/g, "")
                .slice(0, 150);
              const readTime =
                Math.ceil(post.content.replace(/<[^>]+>/g, "").length / 200) +
                " phút";

              return (
                <Col xs={24} sm={12} lg={6} key={post.id}>
                  <Card
                    className="recent-post-card"
                    hoverable
                    cover={
                      <div className="post-image-container">
                        <img alt={post.title} src={post.imageUrl} />
                        <Tag color="blue" className="post-category-tag">
                          {post.category?.name}
                        </Tag>
                      </div>
                    }
                  >
                    <div className="post-content">
                      <Title level={4} className="post-title">
                        {post.title}
                      </Title>
                      <Paragraph
                        ellipsis={{ rows: 3 }}
                        className="post-excerpt"
                      >
                        {excerpt}
                      </Paragraph>

                      <div className="post-meta">
                        <Space size="small">
                          <Avatar size="small" icon={<UserOutlined />} />
                          <Text>{post.author?.penName}</Text>
                        </Space>
                        <Space size="small" className="post-date">
                          <CalendarOutlined />
                          <Text type="secondary">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </Text>
                        </Space>
                      </div>

                      <div className="post-footer">
                        <Space size="small">
                          <ClockCircleOutlined />
                          <Text type="secondary">{readTime}</Text>
                        </Space>
                        <Button type="link" size="small">
                          {t("recentPosts.readMore")} <ArrowRightOutlined />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
        </Row>

        <div className="view-all-container">
          <Button type="primary" size="large" icon={<EyeOutlined />}>
            {t("recentPosts.viewAll")}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
