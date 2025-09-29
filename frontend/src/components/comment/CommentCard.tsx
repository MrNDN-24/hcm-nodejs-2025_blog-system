import { useState } from "react";
import { Avatar, Button, Input } from "antd";
import type { CommentSerializer, CreateCommentDto } from "../../types/comment.type";
import "../../styles/CommentCard.css";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;

interface CommentCardProps {
  comment: CommentSerializer;
  postId: number;
  postAuthorId?: number;
  depth?: number;
  createComment: (dto: CreateCommentDto) => Promise<void>;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  postId,
  depth = 0,
  postAuthorId,
  createComment
}) => {
  const [replying, setReplying] = useState(false); 
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(false); 
  const { t } = useTranslation("comments");

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    const parentId = comment.parent?.id ?? comment.id;
    await createComment({ postId, content: replyContent, parentId });
    setReplyContent("");
    setReplying(false);
    setShowReplies(true); // show replies mới ngay sau khi gửi
  };

  return (
    <div className="comment-card" style={{ marginLeft: depth * 24 }}>
      {/* Info người comment */}
      <div className="comment-header">
        <Avatar
          size="small"
          src={comment.author?.avatarUrl || comment.user?.avatarUrl}
        />
        <span className="comment-author">
          {comment.author?.penName || comment.user?.fullName || comment.user?.username}
          {comment.author?.id === postAuthorId && (
            <span className="post-author-badge"> ({t("postAuthor")})</span>
          )}
        </span>
        <span className="comment-date">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Nội dung */}
      <div className="comment-content">{comment.content}</div>

      {/* Actions */}
      <div className="comment-actions">
        <Button type="link" size="small" onClick={() => setReplying(!replying)}>
          {t("reply")}
        </Button>
        {comment.replies?.length > 0 && (
          <Button
            type="link"
            size="small"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies
              ? t("hideReplies", { count: comment.replies.length })
              : t("showReplies", { count: comment.replies.length })}
          </Button>
        )}
      </div>

      {/* Form reply */}
      {replying && (
        <div className="comment-reply-form">
          <TextArea
            rows={2}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={t("writeReply")}
          />
          <div className="comment-reply-actions">
            <Button size="small" type="primary" onClick={handleReply}>
              {t("send")}
            </Button>
            <Button size="small" onClick={() => setReplying(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Render replies đệ quy */}
      {showReplies &&
        comment.replies?.length > 0 &&
        comment.replies.map((reply) => (
          <CommentCard
            key={reply.id}
            comment={reply}
            postId={postId}
            postAuthorId={postAuthorId}
            depth={depth + 1}
            createComment={createComment}
          />
        ))}
    </div>
  );
};

export default CommentCard;
