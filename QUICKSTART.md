# 🚀 VouchFlow Quick Start

Get VouchFlow running in 3 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14
- React 18
- Tailwind CSS
- Lucide Icons
- TypeScript

## Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

## Step 3: Test the App

### Landing Page
1. Open [http://localhost:3000](http://localhost:3000)
2. You'll see the clean VouchFlow homepage
3. Click "Record Testimonial"

### Recording Flow
1. You'll be redirected to `/record/demo`
2. Click "Start Recording"
3. Allow camera/microphone permissions
4. Watch the 3-2-1 countdown
5. Record for up to 60 seconds
6. Review your video
7. Submit!

## Common Issues & Quick Fixes

### ❌ "Cannot find module"
```bash
npm install
```

### ❌ Camera not working
- Make sure you're on `localhost` (secure context)
- Check browser permissions
- Try Chrome or Safari

### ❌ Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## File Structure Overview

```
vouchflow/
├── app/
│   ├── page.tsx          ← Landing page
│   └── record/[id]/
│       └── page.tsx      ← Recording interface
└── package.json
```

## What's Working Right Now

✅ Beautiful landing page  
✅ Camera access  
✅ Video recording (60s max)  
✅ Countdown timer  
✅ Review & retake  
✅ Mobile responsive  

## What's Coming Next

📋 Supabase backend (Week 2)  
🎨 Campaign builder (Week 3)  
🔐 User auth (Week 4)  
🚀 Deploy to Vercel (Week 4)  

## Need Help?

1. Check the main README.md
2. Look at code comments in the components
3. Open browser DevTools (F12) to see any errors

---

**You're all set!** 🎉

Now test the recording flow and start thinking about:
- What prompts work best for your clients?
- What branding changes do you want?
- How you'll integrate with Supabase next week?
