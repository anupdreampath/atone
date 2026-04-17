import * as neonDb from './src/utils/neonDb.js';

(async () => {
  try {
    console.log('📋 Fetching query logs from database...');
    const result = await neonDb.query('SELECT DISTINCT field_name FROM query_logs');
    console.log('Unique field_name values:');
    console.log(result.rows);
    
    console.log('\n📊 Sample logs:');
    const allLogs = await neonDb.query('SELECT * FROM query_logs LIMIT 5');
    allLogs.rows.forEach(log => {
      console.log(`- user_id: ${log.user_id}, field_name: "${log.field_name}", value: "${log.query_value}"`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
