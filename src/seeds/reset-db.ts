import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function resetDatabase() {
  console.log('🗑️  Resetting database...\n');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // Drop all tables
    await dataSource.dropDatabase();
    console.log('✅ Database dropped successfully');

    // Recreate tables
    await dataSource.synchronize();
    console.log('✅ Database schema recreated successfully\n');

    console.log('🎉 Database reset complete! You can now run the seed script.\n');
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  } finally {
    await app.close();
  }
}

resetDatabase();
