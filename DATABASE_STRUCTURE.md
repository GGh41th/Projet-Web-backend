# 📊 Database Structure Visualization

## 🌳 Complete Article & Comment Tree

```
📝 ARTICLE 1: "Getting Started with NestJS and TypeORM" (by John)
│   Votes: 2↑ 0↓
│
├─── 💬 Comment: "Great introduction!" (by Jane)
│    │   Votes: 1↑ 0↓
│
├─── 💬 Comment: "Question about migrations" (by Bob)
│    │   Votes: 1↑ 0↓
│    │
│    └─── 💬 Reply: "Re: migrations" (by John)
│         │   Votes: 1↑ 0↓
│
├─── 💬 Comment: "Excellent breakdown of TypeORM features" (by Alice) ⭐
│    │   Votes: 10↑ 2↓ (Score: +8)
│    │   Content: "This is hands down the best TypeORM tutorial I have seen!"
│
└─── 💬 Comment: "Question about entity relationships" (by Alice)
     │   Votes: 1↑ 0↓
     │
     └─── 💬 Reply: "Re: Circular dependencies" (by John)
          │   Votes: 1↑ 0↓
          │
          └─── 💬 Reply: "Re: forwardRef" (by Alice)
               │   Votes: 1↑ 0↓
               │
               └─── 💬 Reply: "Re: Performance" (by John)
                    │   Votes: 0↑ 0↓
                    │   LEVEL 4 NESTED!


📝 ARTICLE 2: "Building a REST API with Authentication" (by Jane)
│   Votes: 1↑ 1↓
│
├─── 💬 Comment: "Security considerations" (by Alice) ⭐
│    │   Votes: 9↑ 3↓ (Score: +6)
│    │   Content: "Great article! Always use refresh tokens alongside access tokens."
│
└─── 💬 Comment: "Alternative approaches to JWT" (by Alice)
     │   Votes: 1↑ 0↓
     │
     ├─── 💬 Reply: "Re: Redis sessions" (by Jane)
     │    │   Votes: 0↑ 0↓
     │
     └─── 💬 Reply: "Re: Trade-offs" (by Bob)
          │   Votes: 0↑ 0↓
          │
          └─── 💬 Reply: "Re: Exactly" (by Alice)
               │   Votes: 0↑ 0↓
               │   LEVEL 3 NESTED!


📝 ARTICLE 3: "Database Design Best Practices" (by Bob)
│   Votes: 2↑ 0↓
│
└─── 💬 Comment: "Performance optimization tips" (by Alice) ⭐
     │   Votes: 8↑ 4↓ (Score: +4)
     │   Content: "Don't forget about connection pooling! Improves performance significantly."
```

---

## 👥 Users in Database

```
Main Users (4):
┌─────────────────────────────────────────────────────────┐
│ 👤 john_doe       (john@example.com)                     │
│    - Created Article 1                                   │
│    - Multiple replies                                    │
│                                                          │
│ 👤 jane_smith     (jane@example.com)                     │
│    - Created Article 2                                   │
│    - Left comments and votes                            │
│                                                          │
│ 👤 bob_wilson     (bob@example.com)                      │
│    - Created Article 3                                   │
│    - Left comments and votes                            │
│                                                          │
│ 👤 alice_johnson  (alice@example.com) ⭐                 │
│    - Left 5 highly-voted comments                       │
│    - Active participant in discussions                  │
└─────────────────────────────────────────────────────────┘

Voter Users (10):
┌─────────────────────────────────────────────────────────┐
│ 👤 voter_1 through voter_10                             │
│    - Used to create specific vote counts                │
│    - voter1-7: Upvoted Alice's first comment            │
│    - voter8-9: Downvoted Alice's first comment          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Alice's Special Comments (Highly Voted)

```
Comment #1 on Article 1
┌──────────────────────────────────────────────────────────┐
│ Title: "Excellent breakdown of TypeORM features"         │
│ Content: "This is hands down the best TypeORM tutorial   │
│           I have seen!"                                  │
│                                                          │
│ Votes: ⬆️ 10  ⬇️ 2  (Score: +8)                          │
│ Upvoters: john, jane, bob + 7 voters (1-7)              │
│ Downvoters: voter8, voter9                              │
└──────────────────────────────────────────────────────────┘

Comment #2 on Article 2
┌──────────────────────────────────────────────────────────┐
│ Title: "Security considerations"                         │
│ Content: "Great article! Always use refresh tokens       │
│           alongside access tokens."                      │
│                                                          │
│ Votes: ⬆️ 9  ⬇️ 3  (Score: +6)                           │
│ Upvoters: john, jane, bob + 6 voters (1-6)              │
│ Downvoters: voter7, voter8, voter9                      │
└──────────────────────────────────────────────────────────┘

Comment #3 on Article 3
┌──────────────────────────────────────────────────────────┐
│ Title: "Performance optimization tips"                   │
│ Content: "Don't forget about connection pooling!         │
│           Improves performance significantly."           │
│                                                          │
│ Votes: ⬆️ 8  ⬇️ 4  (Score: +4)                           │
│ Upvoters: john, jane, bob + 5 voters (1-5)              │
│ Downvoters: voter6, voter7, voter8, voter9              │
└──────────────────────────────────────────────────────────┘
```

---

## 🗂️ Database Tables & Relationships

```
┌─────────────┐           ┌──────────────┐           ┌─────────────┐
│    users    │           │   articles   │           │   images    │
├─────────────┤           ├──────────────┤           ├─────────────┤
│ id          │◄─────────┤│ authorId     │           │ id          │
│ username    │           │ title        │           │ filename    │
│ email       │           │ content      │           │ path        │
│ password    │           │ createdAt    │           │ mimetype    │
│ name        │           │ updatedAt    │           └─────────────┘
│ lastName    │           │ parentId     │
│ bio         │           └──────────────┘
│ role        │                  │
└─────────────┘                  │ Self-Reference
       │                         │ (for comments)
       │                         ▼
       │                  ┌──────────────┐
       │                  │   articles   │
       │                  │ (as comments)│
       │                  └──────────────┘
       │
       │
   Many-to-Many Voting Relationships:
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌──────────────────────┐          ┌──────────────────────┐
│ article_upvoters_user│          │article_downvoters_user│
├──────────────────────┤          ├──────────────────────┤
│ articlesId           │          │ articlesId           │
│ usersId              │          │ usersId              │
└──────────────────────┘          └──────────────────────┘
   (Junction Table)                 (Junction Table)
```

---

## 🔢 Comment Nesting Levels

```
Level 1: Top-level comments (parentId = article.id)
   │
   ├─ Alice: "Excellent breakdown..." (10↑ 2↓)
   ├─ Jane: "Great introduction!"
   ├─ Bob: "Question about migrations"
   └─ Alice: "Question about entity relationships"

Level 2: First replies (parentId = comment.id)
   │
   ├─ John: "Re: migrations"
   └─ John: "Re: Circular dependencies"

Level 3: Nested replies
   │
   ├─ Alice: "Re: forwardRef"
   ├─ Jane: "Re: Redis sessions"
   ├─ Bob: "Re: Trade-offs"
   └─ Alice: "Re: Exactly"

Level 4: Deep nested replies
   │
   └─ John: "Re: Performance"
```

---

## 📈 Vote Score Calculation

```
Score = (Number of Upvotes) - (Number of Downvotes)

Examples from seed data:

Alice Comment 1:  10 upvotes - 2 downvotes = +8 score
Alice Comment 2:   9 upvotes - 3 downvotes = +6 score
Alice Comment 3:   8 upvotes - 4 downvotes = +4 score
Article 1:         2 upvotes - 0 downvotes = +2 score
Article 2:         1 upvote  - 1 downvote  = 0 score
```

---

## 🔄 How Comments Are Retrieved

### GET /articles/full/:id?depth=2

```
Query with depth=2 will load:

Article 1 (John's NestJS article)
├─ Comment: "Excellent breakdown..." (Alice) ⭐ +8 score
│  └─ [depth=2 reached, no more nested loading]
│
├─ Comment: "Great introduction!" (Jane) +1 score
│  └─ [depth=2 reached]
│
├─ Comment: "Question about migrations" (Bob) +1 score
│  └─ Reply: "Re: migrations" (John)
│     └─ [depth=2 reached]
│
└─ Comment: "Question about entity relationships" (Alice) +1 score
   └─ Reply: "Re: Circular dependencies" (John)
      └─ Reply: "Re: forwardRef" (Alice) ← VISIBLE at depth=2
         └─ [depth limit, need to load more with another request]

Comments are sorted by: score DESC (highest voted first)
```

### GET /articles/comments/:commentId/replies?depth=1

```
Used to load "more replies" beyond the initial depth limit.

Example: Load deeper replies from Alice's "Re: forwardRef" comment
└─ Reply: "Re: forwardRef" (Alice)
   └─ Reply: "Re: Performance" (John) ← Loaded with this endpoint
```

---

## 🎨 Frontend Usage Pattern

```
1. Homepage/Feed:
   GET /articles/search?page=1&limit=10
   → Shows list of articles with vote counts

2. Article Detail Page:
   GET /articles/full/:id?depth=3
   → Shows article + nested comments (up to 3 levels)
   → Comments sorted by score (Alice's comments appear first!)

3. "Load More Replies" Button:
   GET /articles/comments/:commentId/replies?depth=2
   → Loads deeper nested comments on demand

4. Voting:
   POST /articles/:id/upvote (with JWT token)
   POST /articles/:id/downvote (with JWT token)
   → Toggle: Click upvote again to remove
   → Switch: Upvote → Downvote switches votes
```

---

## 🧪 Test Scenarios

```
✅ Test 1: Article listing shows vote counts
   GET /articles/search
   → Should see Article 1 with 2 upvotes, 0 downvotes

✅ Test 2: Comments sorted by vote score
   GET /articles/full/[article1-id]?depth=3
   → Alice's "Excellent breakdown" (+8) should appear FIRST
   → Before Jane's "Great introduction" (+1)

✅ Test 3: Nested comment loading (4 levels deep)
   GET /articles/full/[article1-id]?depth=4
   → Should see the full thread from Alice → John → Alice → John

✅ Test 4: Vote toggle (login as voter10)
   POST /articles/[alice-comment1-id]/upvote
   → Score changes from +8 to +9
   POST /articles/[alice-comment1-id]/upvote (again)
   → Score changes back to +8 (vote removed)

✅ Test 5: Vote switch (login as voter8, who downvoted)
   POST /articles/[alice-comment1-id]/upvote
   → Downvote removed, upvote added
   → Score changes from +8 to +10 (moved from downvote to upvote)
```

---

## 🔐 Authentication

```
Login to get JWT token:
POST /auth/login
Body: {
  "email": "alice@example.com",
  "password": "password123"
}

Response: {
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Use token in subsequent requests:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

