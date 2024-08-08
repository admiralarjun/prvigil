const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const axios = require('axios');

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

module.exports = { assessGenuineness };
