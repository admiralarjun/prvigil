const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const axios = require('axios');

const RepoSuggestion = async(req,res)=>{
  
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
}
module.exports = {RepoSuggestion};