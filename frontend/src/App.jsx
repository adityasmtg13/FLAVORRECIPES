import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import RecipeGenerator from './pages/RecipeGenerator';
import MyRecipes from './pages/MyRecipes';
import RecipeDetail from './pages/RecipeDetail';
import ShoppingList from './pages/ShoppingList';
import Settings from './pages/Settings';
import MealPlanner from './pages/MealPlanner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes - to be implemented */}
          <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><RecipeGenerator /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
          <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
          <Route path="/meal-plan" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
          <Route path="/shopping-list" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Footer />
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#FDFBD4',
            color: '#38240D',
            border: '1px solid #C05800',
            borderRadius: '0.5rem',
          },
          success: {
            iconTheme: {
              primary: '#713600',
              secondary: '#FDFBD4',
            },
          },
          error: {
            iconTheme: {
              primary: '#C05800',
              secondary: '#FDFBD4',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

// Temporary Coming Soon component
const ComingSoon = ({ page }) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFBD4' }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#38240D' }}>{page}</h1>
        <p style={{ color: '#713600' }}>Coming soon...</p>
      </div>
    </div>
  );
};

export default App;
