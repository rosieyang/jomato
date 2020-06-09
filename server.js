require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎉 Server running in ${process.env.NODE_ENV.toUpperCase()} mode on port ${PORT} 🎉 `.bgCyan.black.bold);
});