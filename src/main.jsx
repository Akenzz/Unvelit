import { StrictMode, useEffect, useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './login/login.jsx'
import Signup from './login/signin.jsx'
import OtpInput from './login/otp.jsx'
import UserDashboard from './body.jsx'
import ProfilePage from './body/Profilepage.jsx'
import Header from './body/header.jsx'
import CreatePost from './body/Post.jsx'
import Showpost from './body/Showpost.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import PasswordReset from './login/PasswordReset.jsx'
import PostFeed from './body/Contentpage.jsx'
import SplashScreen from './Anilogo.jsx'
import { PostProvider } from './Postcontext.jsx'
import Viewuser from './body/Viewuser.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: "",
        element: <Login />
      },
      {
        path: "Signup",
        element: <Signup />
      },
      {
        path: "OtpInput",
        element: <OtpInput />
      },
      {
        path: "PasswordReset",
        element: <PasswordReset />
      }
    ]
  },
  {
    path: '/user/:username/',
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <PostFeed />
      },
      {
        path: "Profilepage",
        element: <ProfilePage />
      },
      {
        path: "Post",
        element: <CreatePost />
      },
      {
        path: "Showpost/:tag/:id",
        element: <Showpost />
      },
      {
        path: "postsby/:user",
        element: <Viewuser />
      }
    ]
  }
])

function MainApp() {
  const [showSplash, setShowSplash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const visited = sessionStorage.getItem('visited');
    if (!visited) {
      setShowSplash(true);
      sessionStorage.setItem('visited', 'true');
    } else {
      setIsReady(true);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    setIsReady(true);
  };

  if (showSplash) return <SplashScreen onFinish={handleSplashFinish} />;
  if (!isReady) return null;

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <RouterProvider router={router} /> */}

    <PostProvider>
      <MainApp />
    </PostProvider>


  </StrictMode>,
)