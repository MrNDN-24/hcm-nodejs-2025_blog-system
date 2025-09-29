import { useState, useEffect } from "react";
import { Typography, Input, Button, Spin, Pagination } from "antd";
import { useComment } from "../../hooks/useComment";
import CommentCard from "./CommentCard";
import type { CommentSerializer } from "../../types/comment.type";
import { useTranslation } from "react-i18next";

const { Title } = Typography;
const { TextArea } = Input;

interface CommentListProps {
  postId: number;
  postAuthorId?: number;
}

const CommentList: React.FC<CommentListProps> = ({ postId, postAuthorId }) => {
  const { comments, loadComments, createComment, loading } = useComment(postId);
  const [newComment, setNewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // số comment trên 1 trang
  const { t } = useTranslation("comments");

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await createComment({ postId, content: newComment });
    setNewComment("");
  };

  // Lấy comment hiển thị cho trang hiện tại
  const startIndex = (currentPage - 1) * pageSize;
  const currentComments = comments.slice(startIndex, startIndex + pageSize);

  return (
    <div style={{ marginTop: 40 }}>
      <Title level={4}>{t("commentListTitle")}</Title>

      {/* Form comment */}
      <div style={{ marginBottom: 16 }}>
        <TextArea
          rows={3}
          placeholder={t("writeComment")}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          type="primary"
          onClick={handleAddComment}
          style={{ marginTop: 8 }}
        >
          {t("send")}
        </Button>
      </div>

      {/* Danh sách comment */}
      {loading ? (
        <Spin />
      ) : comments.length > 0 ? (
        <>
          {currentComments.map((comment: CommentSerializer) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              createComment={createComment}
            />
          ))}

          {/* Pagination */}
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={comments.length}
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: 16, textAlign: "center" }}
          />
        </>
      ) : (
        <p>{t("noComments")}</p>
      )}
    </div>
  );
};

export default CommentList;
