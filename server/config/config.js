let urlDB;
if (process.env.NODE_ENV !== 'production') {
  // urlDB = 'mongodb://mongo/metisPN';
  urlDB = 'mongodb+srv://admin:admin@cluster0.3d3uc.mongodb.net/metisPN?retryWrites=true&w=majority';
} else {
  urlDB = process.env.MONGO_URI;
}
process.env.URL_DB = urlDB;
