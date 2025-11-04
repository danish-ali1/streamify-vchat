import { Route, Routes, Navigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import OnboardingPage from "./pages/OnboardingPage"
import CallPage from "./pages/CallPage"
import ChatPage from "./pages/ChatPage"
import NotificationPage from "./pages/NotificationPage"
import toast ,{Toaster} from 'react-hot-toast';
import Layout from "./components/Layout.jsx"
import PageLoader from "./components/PageLoader";

import useAuthUser from "./hooks/useAuthUser";


function App() {
  
  const { isLoading, authUser } = useAuthUser();

  // While the auth check is in progress, don't evaluate route guards that may redirect.
  if (isLoading) return <PageLoader />;

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  return (
    <>
  <div className="min-h-screen" data-theme="night"> 
        <Routes>
          <Route path="/" element={isAuthenticated && isOnboarded ? ( <Layout showSidebar={true} > <HomePage/> </Layout>) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )} />
          <Route path="/signup"element={!isAuthenticated ? <SignupPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />}/>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} /> }/>
          <Route path="/onboarding" element={isAuthenticated ? (!isOnboarded ? <OnboardingPage /> : <Navigate to="/" />) : <Navigate to="/login" />} />
           <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
           <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
          <Route path="/notifications" element={isAuthenticated && isOnboarded? ( <Layout showSidebar={true}> <NotificationPage /> </Layout> ): ( <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />  ) } />
        </Routes>
      </div>
      <Toaster />
    </>
  )
}

export default App
