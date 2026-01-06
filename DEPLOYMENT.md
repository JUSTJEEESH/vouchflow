# 🚀 VouchFlow Deployment Guide

Deploy VouchFlow to production in minutes!

## Recommended: Vercel

Vercel is built by the Next.js team and offers the best performance.

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial VouchFlow commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your VouchFlow repository
   - Click "Deploy"

3. **Done!** 🎉
   Your app will be live at `your-project.vercel.app`

### Custom Domain

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `vouchflow.com`)
4. Follow DNS instructions
5. SSL certificate auto-provisioned!

## Environment Variables

When you add Supabase (Week 2), add these in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_UPLOADCARE_KEY=your_upload_key
```

**Add in Vercel:**
1. Project Settings → Environment Variables
2. Add each variable
3. Redeploy for changes to take effect

## Production Checklist

Before deploying to production:

### Security
- [ ] No hardcoded secrets in code
- [ ] Environment variables configured
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Camera permissions use secure context

### Performance
- [ ] Images optimized (use Next.js Image component)
- [ ] No console.logs in production
- [ ] Build passes without errors: `npm run build`

### UX
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Error states handled gracefully
- [ ] Loading states visible

### Legal (if collecting from real clients)
- [ ] Privacy policy page
- [ ] Terms of service
- [ ] Cookie consent (if needed)
- [ ] Data retention policy

## Alternative Platforms

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy automatically

## Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** (Built-in)
   - Automatic with Vercel deployment
   - Core Web Vitals tracking

2. **Posthog** (User analytics)
   ```bash
   npm install posthog-js
   ```

3. **Sentry** (Error tracking)
   ```bash
   npm install @sentry/nextjs
   ```

## Post-Deployment

### Test Production

1. Visit your live URL
2. Test recording flow end-to-end
3. Check mobile responsiveness
4. Test camera permissions
5. Verify video recording works

### Share Magic Links

Once backend is integrated (Week 2+):
```
https://yourdomain.com/record/unique-campaign-id
```

### Monitor Performance

- Check Vercel dashboard for build times
- Monitor Web Vitals
- Review error logs
- Track conversion rates

## Rollback Strategy

If something breaks:

**Vercel:**
1. Go to Deployments
2. Click on previous working deployment
3. Click "Promote to Production"

**GitHub:**
```bash
git revert HEAD
git push
```

## Domain Setup Example

### Namecheap → Vercel

1. **In Namecheap:**
   - Go to Domain List → Manage
   - Advanced DNS
   - Add A Record: `76.76.21.21`
   - Add CNAME: `www` → `cname.vercel-dns.com`

2. **In Vercel:**
   - Add domain
   - Wait for DNS propagation (5-30 minutes)
   - SSL auto-provisions

## Scaling Considerations

When you grow (Weeks 8-12+):

- **Video Storage**: Cloudinary/UploadCare have generous free tiers
- **Database**: Supabase free tier handles thousands of campaigns
- **Bandwidth**: Vercel free tier includes 100GB/month
- **Edge Functions**: Use for video processing if needed

## Costs (Estimated)

### Month 1-3 (MVP)
- Vercel: $0 (Hobby plan)
- Supabase: $0 (Free tier)
- Cloudinary: $0 (Free tier)
- Domain: ~$12/year
- **Total: ~$1/month**

### Month 4-6 (Growing)
- Vercel: $0-20
- Supabase: $0-25
- Cloudinary: $0
- **Total: ~$0-45/month**

### Scale (100+ users)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Cloudinary: ~$50/month
- **Total: ~$95/month**

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Guides](https://supabase.com/docs/guides)

---

**Ready to go live?** Follow the Quick Deploy section above!

Remember: Start with Vercel's free tier. You can always upgrade as you grow. 🚀
