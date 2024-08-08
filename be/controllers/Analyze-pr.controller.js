const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const { assessGenuineness } = require("../controllers/Genuinenness.controller");

const axios = require('axios');
const promptTemplates = {
    Security: 'Analyze the following pull request for security issues in concise, with evidence pointing to code lines in neat markdown: {body}',
    Compliance: 'Analyze the following pull request for compliance issues in concise, with evidence pointing to code lines in neat markdown: {body}',
    OWASP: 'Analyze the following pull request for OWASP vulnerabilities in concise, with evidence pointing to code lines in neat markdown: {body}',
};

const analysispr = async(req,res) => {
    
    const { repo, prNumber, prompt } = req.body;
    if (!repo || !prNumber) {
      return res.status(400).json({ error: 'Repository URL and PR number are required' });
    }
  
    try {
      // Fetch the specified PR from the GitHub repository
      const prResponse = await axios.get(`https://api.github.com/repos/${repo}/pulls/${prNumber}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      });
      const pr = prResponse.data;
  
      // Fetch PR conversations
      const conversationsResponse = await axios.get(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      });
      const conversations = conversationsResponse.data;
  
      // Fetch PR commits
      const commitsResponse = await axios.get(`https://api.github.com/repos/${repo}/pulls/${prNumber}/commits`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      });
      const commits = commitsResponse.data;
  
      // Fetch PR checks
      const checksResponse = await axios.get(`https://api.github.com/repos/${repo}/commits/${pr.head.sha}/check-runs`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      });
      const checks = checksResponse.data.check_runs;
  
      // Fetch PR diffs (files changed)
      const diffResponse = await axios.get(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      });
      const diffs = diffResponse.data;
  
      // Define the prompt based on the selected type
      const promptTemplate = promptTemplates[prompt] || promptTemplates.Security;
  
      // Combine PR details, conversations, commits, checks, and diffs into the analysis text
      const prDetails = `
        PR Title: ${pr.title}
        PR Body: ${pr.body}
        Conversations: ${conversations.map(comment => comment.body).join('\n')}
        Commits: ${commits.map(commit => commit.commit.message).join('\n')}
        Checks: ${checks.map(check => check.name + ': ' + check.conclusion).join('\n')}
        Diffs: ${diffs.map(file => file.filename + '\n' + file.patch).join('\n')}
      `;
      const promptText = promptTemplate.replace('{body}', prDetails);

      // Analyze the PR using LLM
      const result = await model.generateContent(promptText);
      const response = await result.response;
      const analysisText = await response.text();
  
      // Assess the contributor's genuineness
      const genuineness = await assessGenuineness(pr.user.login);
  
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
            genuineness: genuineness,
          },
          body: pr.body,
          analysis: analysisText,
          diffs: diffs.map(file => ({
            filename: file.filename,
            patch: file.patch,
          })),
        },
      });
    } catch (error) {
      console.error('Error analyzing PR:', error);
      res.status(500).json({ error: 'Failed to fetch or analyze pull request' });
    }

}
module.exports = {analysispr};