const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const articleNumber = req.body.queryResult.parameters['article-number'];

  // Load and parse the JSON file
  const data = fs.readFileSync('articles.json', 'utf8');
  const articles = JSON.parse(data);

  // Find article matching the number
  const article = articles.find(a => a.article == articleNumber);

  if (!article) {
    return res.json({
      fulfillmentText: `Sorry, I couldn't find Article ${articleNumber}.`
    });
  }

  // Handle nested content (if it's an object)
  let contentText = '';
  if (typeof article.content === 'string') {
    contentText = article.content;
  } else {
    // For object-type content, flatten to readable string
    for (const [key, value] of Object.entries(article.content)) {
      if (typeof value === 'object') {
        contentText += `\n${key.toUpperCase()}:\n`;
        for (const [subKey, subVal] of Object.entries(value)) {
          contentText += `  ${subKey}) ${subVal}\n`;
        }
      } else {
        contentText += `${key}) ${value}\n`;
      }
    }
  }

  // Respond with clean text
  return res.json({
    fulfillmentText: `Article ${article.article}:\n${contentText}`
  });
});

app.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});
