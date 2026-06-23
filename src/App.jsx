import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Library from "./pages/Library/Library";
import Search from "./pages/Search/Search";
import Stats from "./pages/Stats/Stats";
import AnimeDetail from "./pages/AnimeDetail/AnimeDetail";
import BulkImport from "./pages/BulkImport/BulkImport";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Callback from "./pages/Auth/Callback";

// Redirect to login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: "white", padding: "2rem" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Redirect to home if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes — no layout */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/auth/callback" element={<Callback />} />

      {/* Protected routes — with layout */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/search" element={<Search />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/bulk-import" element={<BulkImport />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
      </Route>
    </Routes>
  );
}