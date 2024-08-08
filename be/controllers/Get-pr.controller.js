const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const axios = require('axios');

 const Getpr = async(req,res)=>{
    
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
}
module.exports = {Getpr};
