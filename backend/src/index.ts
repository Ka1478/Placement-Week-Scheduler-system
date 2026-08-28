import app from './server';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Placement Week Scheduler Backend running on http://localhost:${PORT}`);
  console.log(`📊 REST API Available at http://localhost:${PORT}/api/schedule`);
  console.log(` GraphQL Console Available at http://localhost:${PORT}/graphql`);
});
