import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Button,
  Tag,
  Input,
  Avatar,
  Space,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useUserPost } from "../../hooks/useUserPost";
import "../../styles/HomePage.css";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const BlogList = () => {
  const { loadUserPosts, posts } = useUserPost();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    loadUserPosts();
  }, [loadUserPosts]);

  // Filter theo search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [posts, searchText]);

  // Paginate
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage]);

  return (
    <div className="blog-list-container">
      <Title level={2}>Danh sách bài viết</Title>

      <Search
        placeholder="Tìm kiếm bài viết..."
        enterButton={<SearchOutlined />}
        size="large"
        onSearch={(value) => setSearchText(value)}
        style={{ marginBottom: 24 }}
        allowClear
      />

      <Row gutter={[24, 24]}>
        {paginatedPosts.map((post) => {
          const excerpt = post.content.replace(/<[^>]+>/g, "").slice(0, 150);
          const readTime =
            Math.ceil(post.content.replace(/<[^>]+>/g, "").length / 200) +
            " phút";

          return (
            <Col xs={24} sm={12} lg={6} key={post.id}>
              <Card
                hoverable
                cover={
                  <div className="post-image-container">
                    <img alt={post.title} src={post.imageUrl} />
                    {post.category && (
                      <Tag color="blue" className="post-category-tag">
                        {post.category.name}
                      </Tag>
                    )}
                  </div>
                }
              >
                <div className="post-content">
                  <Title level={4}>{post.title}</Title>
                  <Paragraph ellipsis={{ rows: 3 }}>{excerpt}</Paragraph>

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

                  <div className="post-footer" style={{ marginTop: 8 }}>
                    <Space size="small">
                      <ClockCircleOutlined />
                      <Text type="secondary">{readTime}</Text>
                    </Space>
                    <Button type="link" size="small">
                      Xem chi tiết <ArrowRightOutlined />
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {filteredPosts.length > pageSize && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredPosts.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default BlogList;
