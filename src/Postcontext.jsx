import { createContext, useContext, useState } from 'react';

const PostContext = createContext();

export const usePostContext = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [scrollY, setScrollY] = useState(0);

  return (
    <PostContext.Provider value={{ posts, setPosts, scrollY, setScrollY }}>
      {children}
    </PostContext.Provider>
  );
  
};