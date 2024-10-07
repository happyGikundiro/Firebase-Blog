export interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  liked: boolean;
  likedBy: string[];
  comments?: BlogComment[];
}

export interface BlogComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}