const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const { assessGenuineness } = require("../controllers/Genuinenness.controller");
const axios = require('axios');

const contributor = async(req,res)=>{

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

}
module.exports = {contributor};