import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import NavbarComponent from "./components/NavBar/NavBarComponent";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import SignInComponent from "./components/SignIn/SignInComponent";
import SignUpComponent from "./components/SignUp/SignUpComponent";
import BookmarksPage from "./pages/BookmarksPage";
import CreateRecipePage from "./pages/CreateRecipePage";
import EditRecipePage from "./pages/EditRecipePage";
import HomePage from "./pages/HomePage";
import ModerationPage from "./pages/ModerationPage";
import MyRecipesPage from "./pages/MyRecipesPage";
import ProfilePage from "./pages/ProfilePage";
import RecipePage from "./pages/RecipePage";
import ReportsPage from "./pages/ReportsPage";
import authService from "./services/authService";
import "./App.css";

function App() {
  const [authModal, setAuthModal] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(authService.getCurrentUser()));

  const refreshUser = () => {
    setIsLoggedIn(Boolean(authService.getCurrentUser()));
  };

  const openSignIn = () => setAuthModal("signin");
  const openSignUp = () => setAuthModal("signup");
  const closeModal = () => setAuthModal(null);

  return (
    <>
      <NavbarComponent
        openSignIn={openSignIn}
        openSignUp={openSignUp}
        isLoggedIn={isLoggedIn}
        refreshUser={refreshUser}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipe/:recipeId" element={<RecipePage />} />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-recipes"
          element={
            <ProtectedRoute>
              <MyRecipesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <CreateRecipePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:recipeId/edit"
          element={
            <ProtectedRoute>
              <EditRecipePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute role="admin">
              <ModerationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute role="admin">
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {authModal === "signin" && (
        <SignInComponent closeModal={closeModal} refreshUser={refreshUser} />
      )}

      {authModal === "signup" && (
        <SignUpComponent
          closeModal={closeModal}
          openSignIn={openSignIn}
          refreshUser={refreshUser}
        />
      )}
    </>
  );
}

export default App;
