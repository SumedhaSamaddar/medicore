require('dotenv').config();
const express = require('express');
const aiRoutes = require('./routes/ai'); // Adjust path as needed

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use('/api', aiRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`OpenAI API Key status: ${process.env.OPENAI_API_KEY ? 'Present' : 'Missing'}`);
});