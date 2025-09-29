import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography, Tag, Spin, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useUserPost } from "../../hooks/useUserPost";
import "../../styles/BlogDetail.css";
import { useTranslation } from "react-i18next";
import AuthorModal from "../../components/author/authorInfo";
import { useAuthor } from "../../hooks/useAuthor";
import CommentList from "../../components/comment/CommentList";

const { Title, Paragraph } = Typography;

const BlogDetailPage = () => {
  const { t } = useTranslation("blog");
  const { id } = useParams<{ id: string }>();
  const { postDetail, loadPostDetail } = useUserPost();
  const navigate = useNavigate();

  const { loadAuthorInfo, author, loading } = useAuthor();
  const [authorModalVisible, setAuthorModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      loadPostDetail(Number(id));
    }
  }, [id, loadPostDetail]);

  const handleOpenAuthor = async (authorId: number) => {
    await loadAuthorInfo(authorId);
    setAuthorModalVisible(true);
  };

  if (!postDetail) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Nút quay lại */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/blogs")}
        style={{ marginBottom: 16, paddingLeft: 0 }}
      >
        {t("backToList")}
      </Button>

      <Title level={2}>{postDetail.title}</Title>
      <p>
        <b>{t("author")}:</b>{" "}
        <span
          style={{ color: "#1890ff", cursor: "pointer" }}
          onClick={() => handleOpenAuthor(postDetail.author?.id)}
        >
          {postDetail.author?.penName}
        </span>
      </p>
      <p>
        <b>{t("category")}:</b> {postDetail.category?.name}
      </p>
      <p>
        <b>{t("tags")}:</b>{" "}
        {postDetail.tags.map((tag) => (
          <Tag key={tag.id} color="blue">
            {tag.name}
          </Tag>
        ))}
      </p>

      {/* Nội dung blog */}
      <Paragraph
        id="blog"
        className="blog-content"
        style={{ whiteSpace: "normal", wordBreak: "break-word" }}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: postDetail.content.replace(/&nbsp;/g, " "),
          }}
        />
      </Paragraph>

      <div style={{ marginTop: 40 }}>
        <CommentList
          postId={postDetail.id}
          postAuthorId={postDetail.author?.id}
        />
      </div>

      <AuthorModal
        open={authorModalVisible}
        loading={loading}
        author={author}
        onClose={() => setAuthorModalVisible(false)}
        title={t("authorInfo")}
      />
    </div>
  );
};
export default BlogDetailPage;
