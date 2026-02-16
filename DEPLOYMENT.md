# Lingvik Deployment Guide

## Quick Start

### Local Development

1. **Clone and Install**
```bash
git clone <repository-url>
cd Lingvik
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Database**
```bash
# Run migrations
npx prisma migrate dev

# Seed initial data
npx prisma db seed
```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000`

### Test Accounts

After seeding, you can login with:
- **Admin**: `admin@lingvik.com` / `password123`
- **Test User**: `user@test.com` / `password123`

---

## Production Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL database (or SQLite for testing)
- Environment for hosting (Vercel, Railway, etc.)

### Vercel Deployment

1. **Push to GitHub**
```bash
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Environment Variables**

Required:
```env
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-secret-key-here
```

Optional OAuth:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
```

4. **Run Migrations**

After deployment, connect to your database and run:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Railway Deployment

1. **Create Railway Account** at [railway.app](https://railway.app)

2. **Create New Project**
   - Connect GitHub repo
   - Add PostgreSQL database

3. **Configure Environment**
   - Railway auto-configures `DATABASE_URL`
   - Add other env variables

4. **Deploy**
   - Railway automatically deploys on push

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build and Run**
```bash
docker build -t lingvik .
docker run -p 3000:3000 --env-file .env lingvik
```

---

## Database Configuration

### PostgreSQL (Production)

Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lingvik?schema=public"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
}
```

Run migrations:
```bash
npx prisma migrate dev
```

### SQLite (Development)

Default configuration for easy local development:
```env
DATABASE_URL="file:./dev.db"
```

```prisma
datasource db {
  provider = "sqlite"
}
```

---

## Performance Optimization

### Database Indexes

Add these for better performance:
```prisma
model User {
  @@index([email])
  @@index([streak])
}

model Exercise {
  @@index([lessonId])
  @@index([grammarTag])
}

model UserProgress {
  @@index([userId])
  @@index([lessonId])
}
```

### Caching

Consider adding:
- Redis for session storage
- CDN for static assets
- Database connection pooling

---

## Monitoring

### Error Tracking

Integrate Sentry:
```bash
npm install @sentry/nextjs
```

### Analytics

Options:
- Vercel Analytics
- Google Analytics
- PostHog
- Mixpanel

---

## Security Checklist

- [ ] Change `NEXTAUTH_SECRET` to a strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Database backups configured
- [ ] User data encryption at rest

---

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use managed database service
- CDN for static content

### Database Optimization
- Connection pooling
- Read replicas for heavy queries
- Database indexing
- Query optimization

### Caching Strategy
- Redis for session data
- Cache API responses
- Static page generation where possible

---

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Issues

```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

### Connection Issues

Check:
1. Database URL is correct
2. Database is accessible
3. Environment variables are set
4. Prisma client is generated

---

## Support

For issues or questions:
1. Check documentation
2. Review GitHub issues
3. Create new issue with details

---

## Updates and Maintenance

### Dependency Updates
```bash
npm update
npm audit fix
```

### Database Migrations
```bash
npx prisma migrate dev --name description
npx prisma generate
```

### Backup Strategy
- Regular database backups
- Version control for code
- Environment config backups
