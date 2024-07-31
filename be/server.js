require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.use(cors());
app.use(express.json());

const promptTemplates = {
  Security: 'Analyze the following pull request for security issues in concise, neat and jotted manner: {body}',
  Compliance: 'Analyze the following pull request for compliance issues in concise, neat and jotted manner: {body}',
  OWASP: 'Analyze the following pull request for OWASP vulnerabilities in concise, neat and jotted manner: {body}',
};

const assessGenuineness = async (username) => {
  try {
    const userResponse = await axios.get(`https://api.github.com/users/${username}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
    const { public_repos, followers, following, created_at } = userResponse.data;
    
    // Example heuristic: Basic genuineness score based on followers, repositories, and account age
    const accountAge = Math.floor((new Date() - new Date(created_at)) / (1000 * 60 * 60 * 24 * 365)); // in years
    const score = public_repos + followers - following + accountAge;

    return {
      username,
      public_repos,
      followers,
      following,
      account_age: accountAge,
      genuineness_score: score
    };
  } catch (error) {
    console.error(`Failed to fetch or assess user: ${username}`, error);
    return null;
  }
};

app.post('/api/analyze-pr', async (req, res) => {
    const { repo, prNumber, prompt } = req.body;
  
    if (!repo || !prNumber) {
      return res.status(400).json({ error: 'Repository URL and PR number are required' });
    }
  
    try {
      // Fetch the specified PR from the GitHub repository
      const prResponse = await axios.get(`https://api.github.com/repos/${repo}/pulls/${prNumber}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      });
      const pr = prResponse.data;
  
      // Define the prompt based on the selected type
      const promptTemplate = promptTemplates[prompt] || promptTemplates.Security;
  
      // Analyze the PR using Gemini LLM
      const promptText = promptTemplate.replace('{body}', pr.body);
      const result = await model.generateContent(promptText);
      const response = await result.response;
      const analysisText = await response.text();
  
      // Fetch PR diffs
      const diffResponse = await axios.get(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      });
      const diffs = diffResponse.data;
  
      // Assess the contributor's genuineness
      const genuineness = await assessGenuineness(pr.user.login);
      console.log(analysisText)
      res.json({
        pr: {
          id: pr.id,
          title: pr.title,
          url: pr.html_url,
          state: pr.state,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          user: {
            login: pr.user.login,
            genuineness: genuineness
          },
          body: pr.body,
          analysis: analysisText,
          diffs: diffs.map(file => ({
            filename: file.filename,
            patch: file.patch,
          })),
        }
      });
    } catch (error) {
      console.error('Error analyzing PR:', error);
      res.status(500).json({ error: 'Failed to fetch or analyze pull request' });
    }
});

// Add this endpoint to your backend code if you need a separate endpoint for fetching PRs
app.post('/api/get-prs', async (req, res) => {
    const { repo } = req.body;

    if (!repo) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    try {
        // Fetch pull requests from the GitHub repository
        const prResponse = await axios.get(`https://api.github.com/repos/${repo}/pulls`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        const prs = prResponse.data;

        res.json({ prs });
    } catch (error) {
        console.error('Error fetching pull requests:', error);
        res.status(500).json({ error: 'Failed to fetch pull requests' });
    }
});


app.get('/api/repo-suggestions/:fullname', async (req, res) => {
    const { fullname } = req.params;
  
    if (!fullname) {
      return res.status(400).json({ error: 'Fullname parameter is required' });
    }
  
    try {
      // Fetch repository suggestions based on the fullname
      const searchResponse = await axios.get(`https://api.github.com/search/repositories?q=${fullname}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      });
      const repos = searchResponse.data.items;
  
      res.json(repos);
    } catch (error) {
      console.error('Failed to fetch repository suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch repository suggestions' });
    }
});

app.get('/api/contributors', async (req, res) => {
    const { repo } = req.query;
  
    if (!repo) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }
  
    try {
      // Fetch contributors from GitHub
      const contributorsResponse = await axios.get(`https://api.github.com/repos/${repo}/contributors`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      });
      const contributors = contributorsResponse.data;
  
      // Process contributor information if necessary (e.g., calculate genuineness score)
      const processedContributors = await Promise.all(contributors.map(async (contributor) => {
        return {
          ...contributor,
          genuineness: await assessGenuineness(contributor.login),
        };
      }));
  
      res.json(processedContributors);
    } catch (error) {
      console.error('Failed to fetch contributor details:', error);
      res.status(500).json({ error: 'Failed to fetch contributor details' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
