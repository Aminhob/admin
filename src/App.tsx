/** @jsxImportSource react */
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Button, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './index.css';

// Simple pages
function Home() {
  return <h1>Welcome to Admin Dashboard</h1>;
}

function Dashboard() {
  return <h1>Dashboard</h1>;
}

function Users() {
  return <h1>Users</h1>;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <nav style={{ padding: '1rem', background: '#f5f5f5' }}>
            <Button component={Link} to="/" color="primary">
              Home
            </Button>
            <Button component={Link} to="/dashboard" color="primary">
              Dashboard
            </Button>
            <Button component={Link} to="/users" color="primary">
              Users
            </Button>
          </nav>
          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
