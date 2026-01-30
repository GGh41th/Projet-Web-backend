import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { ArticleService } from '../article/article.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const articleService = app.get(ArticleService);

  console.log('🌱 Starting database seeding...\n');

  try {
    console.log('👤 Creating main users...');
    const john = await usersService.create({
      email: 'john@example.com',
      username: 'john_doe',
      password: 'password123',
      name: 'John',
      lastName: 'Doe',
      bio: 'Software developer passionate about NestJS',
    });
    console.log('✅ Created: john_doe');

    const jane = await usersService.create({
      email: 'jane@example.com',
      username: 'jane_smith',
      password: 'password123',
      name: 'Jane',
      lastName: 'Smith',
      bio: 'Tech blogger and full-stack developer',
    });
    console.log('✅ Created: jane_smith');

    const bob = await usersService.create({
      email: 'bob@example.com',
      username: 'bob_wilson',
      password: 'password123',
      name: 'Bob',
      lastName: 'Wilson',
      bio: 'Backend engineer specializing in database design',
    });
    console.log('✅ Created: bob_wilson');

    const alice = await usersService.create({
      email: 'alice@example.com',
      username: 'alice_johnson',
      password: 'password123',
      name: 'Alice',
      lastName: 'Johnson',
      bio: 'Senior developer and tech community enthusiast',
    });
    console.log('✅ Created: alice_johnson');

    console.log('\n👤 Creating voter users...');
    const voters: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const voter = await usersService.create({
        email: `voter${i}@example.com`,
        username: `voter_${i}`,
        password: 'password123',
        name: 'Voter',
        lastName: `Number ${i}`,
      });
      voters.push(voter);
    }
    console.log('✅ Created 10 voters');

    console.log('\n📝 Creating articles...');
    const art1 = await articleService.create(john.id, {
      title: 'Getting Started with NestJS and TypeORM',
      content: 'NestJS is a progressive Node.js framework for building efficient and scalable server-side applications.',
    });
    console.log('✅ Article 1');

    const art2 = await articleService.create(jane.id, {
      title: 'Building a REST API with Authentication',
      content: 'Authentication is a crucial part of any web application. JWT-based auth with Passport strategies.',
    });
    console.log('✅ Article 2');

    const art3 = await articleService.create(bob.id, {
      title: 'Database Design Best Practices',
      content: 'Designing a good database schema is essential for application performance and scalability.',
    });
    console.log('✅ Article 3');

    console.log('\n💬 Creating comments...');
    const c1 = await articleService.createComment(jane.id, {
      title: 'Great introduction!',
      content: 'This is a very helpful guide for beginners.',
      parentId: art1.id,
    });
    const c2 = await articleService.createComment(bob.id, {
      title: 'Question about migrations',
      content: 'How do you handle database migrations in production?',
      parentId: art1.id,
    });
    const r1 = await articleService.createComment(john.id, {
      title: 'Re: migrations',
      content: 'In production, always use migrations instead of synchronize.',
      parentId: c2.id,
    });
    console.log('✅ Basic comments created');

    console.log('\n💬 Creating Alice comments with votes...');
    const ac1 = await articleService.createComment(alice.id, {
      title: 'Excellent breakdown of TypeORM features',
      content: 'This is hands down the best TypeORM tutorial I have seen!',
      parentId: art1.id,
    });
    const ac2 = await articleService.createComment(alice.id, {
      title: 'Security considerations',
      content: 'Great article! Always use refresh tokens alongside access tokens.',
      parentId: art2.id,
    });
    const ac3 = await articleService.createComment(alice.id, {
      title: 'Performance optimization tips',
      content: 'Don forget about connection pooling! Improves performance significantly.',
      parentId: art3.id,
    });
    console.log('✅ Alice standalone comments');

    const ac4 = await articleService.createComment(alice.id, {
      title: 'Question about entity relationships',
      content: 'How do you handle circular dependencies between entities?',
      parentId: art1.id,
    });
    const ra1 = await articleService.createComment(john.id, {
      title: 'Re: Circular dependencies',
      content: 'You can use forwardRef() function in TypeORM.',
      parentId: ac4.id,
    });
    const nr1 = await articleService.createComment(alice.id, {
      title: 'Re: forwardRef',
      content: 'Thanks! Does this impact performance?',
      parentId: ra1.id,
    });
    const dr1 = await articleService.createComment(john.id, {
      title: 'Re: Performance',
      content: 'No performance impact! Just a TypeScript decorator pattern.',
      parentId: nr1.id,
    });
    console.log('✅ Nested comment thread 1');

    const ac5 = await articleService.createComment(alice.id, {
      title: 'Alternative approaches to JWT',
      content: 'Have you considered session-based auth with Redis?',
      parentId: art2.id,
    });
    const ra2 = await articleService.createComment(jane.id, {
      title: 'Re: Redis sessions',
      content: 'Great point! Redis sessions are more flexible.',
      parentId: ac5.id,
    });
    const ra3 = await articleService.createComment(bob.id, {
      title: 'Re: Trade-offs',
      content: 'JWT is stateless and scales better, but Redis gives more control.',
      parentId: ac5.id,
    });
    const nr2 = await articleService.createComment(alice.id, {
      title: 'Re: Exactly',
      content: 'For microservices, JWT is the way to go.',
      parentId: ra3.id,
    });
    console.log('✅ Nested comment thread 2');

    console.log('\n⬆️ Adding votes...');
    await articleService.upvote(art1.id, jane.id);
    await articleService.upvote(art1.id, bob.id);
    await articleService.upvote(art2.id, john.id);
    await articleService.downvote(art2.id, bob.id);
    await articleService.upvote(art3.id, john.id);
    await articleService.upvote(art3.id, jane.id);
    console.log('✅ Article votes');

    await articleService.upvote(c1.id, john.id);
    await articleService.upvote(c2.id, jane.id);
    await articleService.upvote(r1.id, jane.id);
    console.log('✅ Comment votes');

    // Alice comment 1: 10 upvotes, 2 downvotes
    for (let i = 0; i < 7; i++) await articleService.upvote(ac1.id, voters[i].id);
    await articleService.upvote(ac1.id, john.id);
    await articleService.upvote(ac1.id, jane.id);
    await articleService.upvote(ac1.id, bob.id);
    await articleService.downvote(ac1.id, voters[7].id);
    await articleService.downvote(ac1.id, voters[8].id);
    console.log('✅ Alice comment 1: 10 upvotes, 2 downvotes');

    // Alice comment 2: 9 upvotes, 3 downvotes
    for (let i = 0; i < 6; i++) await articleService.upvote(ac2.id, voters[i].id);
    await articleService.upvote(ac2.id, john.id);
    await articleService.upvote(ac2.id, jane.id);
    await articleService.upvote(ac2.id, bob.id);
    await articleService.downvote(ac2.id, voters[6].id);
    await articleService.downvote(ac2.id, voters[7].id);
    await articleService.downvote(ac2.id, voters[8].id);
    console.log('✅ Alice comment 2: 9 upvotes, 3 downvotes');

    // Alice comment 3: 8 upvotes, 4 downvotes
    for (let i = 0; i < 5; i++) await articleService.upvote(ac3.id, voters[i].id);
    await articleService.upvote(ac3.id, john.id);
    await articleService.upvote(ac3.id, jane.id);
    await articleService.upvote(ac3.id, bob.id);
    await articleService.downvote(ac3.id, voters[5].id);
    await articleService.downvote(ac3.id, voters[6].id);
    await articleService.downvote(ac3.id, voters[7].id);
    await articleService.downvote(ac3.id, voters[8].id);
    console.log('✅ Alice comment 3: 8 upvotes, 4 downvotes');

    await articleService.upvote(ac4.id, john.id);
    await articleService.upvote(ac5.id, jane.id);
    await articleService.upvote(ra1.id, bob.id);
    await articleService.upvote(nr1.id, jane.id);
    console.log('✅ Nested thread votes');

    console.log('\n🎉 Seeding completed!\n');
    console.log('📊 Summary:');
    console.log('   - 14 users (4 main + 10 voters)');
    console.log('   - 3 articles');
    console.log('   - 14 comments (nested up to 4 levels)');
    console.log('   - Alice\'s comments:');
    console.log('     * Comment 1: 10↑ 2↓ (score +8)');
    console.log('     * Comment 2: 9↑ 3↓ (score +6)');
    console.log('     * Comment 3: 8↑ 4↓ (score +4)');
    console.log('\n🔐 Login: alice@example.com / password123\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await app.close();
  }
}

seed();
