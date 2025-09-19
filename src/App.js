import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';

const log = (message) => {
  console.log(message);
};

const URLShortenerPage = ({ shortenURL, data, error, loading }) => {
  const [urls, setUrls] = useState(['']);

  const handleURLChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleAddURL = () => {
    if (urls.length < 5) {
      setUrls([...urls, '']);
    }
  };

  const handleShorten = () => {
    shortenURL(urls.filter(url => url.trim() !== ''));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        URL Shortener
      </Typography>
      {urls.map((url, index) => (
        <Box key={index} sx={{ my: 2 }}>
          <TextField
            fullWidth
            label={`URL ${index + 1}`}
            variant="outlined"
            value={url}
            onChange={(e) => handleURLChange(index, e.target.value)}
          />
        </Box>
      ))}
      {urls.length < 5 && (
        <Button onClick={handleAddURL} variant="outlined" sx={{ mr: 2 }}>
          Add another URL
        </Button>
      )}
      <Button onClick={handleShorten} variant="contained">
        Shorten URLs
      </Button>
      {loading && <CircularProgress sx={{ display: 'block', my: 2 }} />}
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {data.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Shortened Links
          </Typography>
          <List>
            {data.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={`Original: ${item.originalUrl}`}
                  secondary={`Shortened: ${window.location.origin}/${item.shortcode}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};
const StatisticsPage = () => {
  const { shortcode } = useParams();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    setStats({
      totalClicks: 15,
      clickData: [
        { timestamp: new Date().toISOString(), source: 'direct', location: 'New York, USA' },
        { timestamp: new Date().toISOString(), source: 'facebook', location: 'London, UK' },
      ]
    });
  }, [shortcode]);
  if (!stats) {
    return <Typography variant="h6">Loading statistics...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Statistics for /{shortcode}
      </Typography>
      <Typography variant="h6">Total Clicks: {stats.totalClicks}</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>Click Details:</Typography>
      <List>
        {stats.clickData.map((click, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`Timestamp: ${new Date(click.timestamp).toLocaleString()}`}
              secondary={`Source: ${click.source} | Location: ${click.location}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};
const RedirectionHandler = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    log(`Attempting to redirect for shortcode: ${shortcode}`);
    const originalUrl = localStorage.getItem(shortcode);

    if (originalUrl) {
      log(`Redirecting to: ${originalUrl}`);
      window.location.href = originalUrl;
    } else {
      log(`Shortcode not found: ${shortcode}`);
      navigate('/error');
    }
  }, [shortcode, navigate]);

  return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 10 }} />;
};
function App() {
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shortenURL = (urls) => {
    setLoading(true);
    setError(null);
    setShortenedUrls([]);
    setTimeout(() => {
      try {
        const results = urls.map(url => {
          const shortcode = Math.random().toString(36).substring(2, 8);
          localStorage.setItem(shortcode, url);
          log(`Shortened ${url} to ${shortcode}`);
          return { originalUrl: url, shortcode };
        });
        setShortenedUrls(results);
        setLoading(false);
      } catch (e) {
        setError("An error occurred. Please try again.");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <URLShortenerPage
              shortenURL={shortenURL}
              data={shortenedUrls}
              error={error}
              loading={loading}
            />
          }
        />
        <Route path="/stats/:shortcode" element={<StatisticsPage />} />
        <Route path="/:shortcode" element={<RedirectionHandler />} />
        <Route
          path="/error"
          element={
            <Container maxWidth="md" sx={{ mt: 4 }}>
              <Alert severity="error">URL not found or invalid.</Alert>
            </Container>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;