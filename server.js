const mongoose = require('mongoose');

const app = require('./app');

// ========== CONNECT TO DB ==========
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

const server = app.listen(PORT, () => {
  console.log(`🎉 Server running in ${process.env.NODE_ENV.toUpperCase()} mode on port ${PORT} 🎉 `.bgCyan.black.bold);
});

// ========== ERROR HANDLER ==========
process.on('unhandledRejection', err => {
  console.log('💥 [Unhandled rejection] Shutting down... 💥'.red.bold);
  console.log(`Error: ${err.name} (${err.message})`.red);

  // Close server & exit process
  server.close(() => process.exit(1));
});