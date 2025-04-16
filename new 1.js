// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(express.json());

// Facebook/Instagram API Configuration
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI;

// Twitter API Configuration
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL;

// Facebook/Instagram OAuth Endpoint
app.get('/auth/facebook', (req, res) => {
  const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${FB_REDIRECT_URI}&scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish`;
  res.redirect(authUrl);
});

// Facebook/Instagram Callback
app.get('/auth/facebook/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for access token
    const { data } = await axios.get(`https://graph.facebook.com/v12.0/oauth/access_token`, {
      params: {
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        redirect_uri: FB_REDIRECT_URI,
        code
      }
    });

    const { access_token } = data;
    
    // Get user pages (for Facebook)
    const pagesData = await axios.get(`https://graph.facebook.com/v12.0/me/accounts?access_token=${access_token}`);
    
    // Get Instagram business account (if connected)
    const instagramData = await axios.get(`https://graph.facebook.com/v12.0/me?fields=instagram_business_account&access_token=${access_token}`);
    
    res.json({
      accessToken: access_token,
      pages: pagesData.data.data,
      instagramAccount: instagramData.data.instagram_business_account
    });
    
  } catch (error) {
    console.error('Facebook auth error:', error.response.data);
    res.status(500).json({ error: 'Facebook authentication failed' });
  }
});

// Twitter OAuth Start
app.get('/auth/twitter', (req, res) => {
  const oauthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${TWITTER_API_KEY}&redirect_uri=${TWITTER_CALLBACK_URL}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;
  res.redirect(oauthUrl);
});

// Twitter Callback
app.get('/auth/twitter/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for access token
    const { data } = await axios.post(
      'https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: TWITTER_API_KEY,
        redirect_uri: TWITTER_CALLBACK_URL,
        code_verifier: 'challenge'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${TWITTER_API_KEY}:${TWITTER_API_SECRET}`).toString('base64')}`
        }
      }
    );

    const { access_token, refresh_token } = data;
    
    // Get user info
    const userData = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    
    res.json({
      accessToken: access_token,
      refreshToken: refresh_token,
      user: userData.data.data
    });
    
  } catch (error) {
    console.error('Twitter auth error:', error.response.data);
    res.status(500).json({ error: 'Twitter authentication failed' });
  }
});

// API to schedule posts
app.post('/api/schedule', async (req, res) => {
  try {
    const { platform, content, scheduleTime, accessToken, pageId } = req.body;
    
    let response;
    
    if (platform === 'facebook') {
      response = await axios.post(
        `https://graph.facebook.com/v12.0/${pageId}/feed`,
        {
          message: content.text,
          link: content.link,
          published: false,
          scheduled_publish_time: Math.floor(new Date(scheduleTime).getTime() / 1000)
        },
        {
          params: { access_token: accessToken }
        }
      );
    } 
    else if (platform === 'instagram') {
      // First create the media container
      const mediaResponse = await axios.post(
        `https://graph.facebook.com/v12.0/${pageId}/media`,
        {
          image_url: content.imageUrl,
          caption: content.caption,
          is_carousel_item: false
        },
        {
          params: { access_token: accessToken }
        }
      );
      
      // Then publish the container
      response = await axios.post(
        `https://graph.facebook.com/v12.0/${pageId}/media_publish`,
        {
          creation_id: mediaResponse.data.id
        },
        {
          params: { access_token: accessToken }
        }
      );
    }
    else if (platform === 'twitter') {
      response = await axios.post(
        'https://api.twitter.com/2/tweets',
        {
          text: content.text
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
    }
    
    res.json({ success: true, data: response.data });
    
  } catch (error) {
    console.error('Scheduling error:', error.response.data);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));