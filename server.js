require('dotenv').config();
const mongoose = require('mongoose');

const app = require('./app');

const DB = process.env.MONGODB.replace(
  '<password>',
  process.env.MONGODB_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log('MongoDB connected successfully👍'.magenta.italic.bold));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🎉 Server running in ${process.env.NODE_ENV.toUpperCase()} mode on port ${PORT} 🎉 `.bgCyan.black.bold);
});