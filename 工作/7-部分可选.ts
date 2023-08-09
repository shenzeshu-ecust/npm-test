interface Article {
  title: string;
  content: string;
  author: string;
  date: Date;
  readCount: number;
}

// 如何实现
interface CreateArticleOptions {
  title: string;
  content: string;
  author: string;
  date?: Date;
  readCount?: number;
}
// 一句话
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type CreateArticleOptionsType = Optional<Article, "date" | "readCount">;

function createArticle(options: CreateArticleOptions) {
  options.author = "as";
}
