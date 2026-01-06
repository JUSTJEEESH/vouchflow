# 🎥 VouchFlow

**Video Testimonials Made Simple**

VouchFlow is a minimalist web app for collecting authentic video testimonials via magic links. Built with Next.js 14 (App Router), Tailwind CSS, and Lucide icons.

## ✨ Features

- **Clean Landing Page**: Beautiful, mobile-responsive design with Apple-inspired aesthetics
- **Camera Recording**: One-click access to device camera for video testimonials
- **Guided Recording Interface**: 3-2-1 countdown with 60-second timer
- **Review & Submit**: Preview recorded videos before submission
- **Mobile-First Design**: Optimized for all devices - phone, tablet, desktop
- **Zero Friction**: No logins required for clients submitting testimonials

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A modern web browser with camera/microphone support

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Landing Page (`/`)
- Beautiful hero section with gradient text
- Feature highlights
- "Record Testimonial" CTA button
- Mobile-responsive navigation

### Recording Interface (`/record/demo`)
1. **Intro Stage**: Shows prompts and recording instructions
2. **Recording Stage**: 
   - 3-2-1 countdown before recording starts
   - Live camera preview with REC indicator
   - 60-second maximum recording time
   - Automatic stop at time limit
3. **Review Stage**:
   - Video playback controls
   - Option to retake or submit
4. **Success Stage**: Confirmation message after submission

## 🏗️ Project Structure

```
vouchflow/
├── app/                        # Next.js 14 App Router
│   ├── page.tsx               # Landing page component
│   ├── layout.tsx             # Root layout with metadata
│   ├── globals.css            # Global styles + Tailwind
│   └── record/
│       └── [id]/
│           └── page.tsx       # Dynamic recording interface
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript config
└── next.config.js             # Next.js config
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **Recording**: MediaRecorder API (WebRTC)
- **Font**: Inter (Google Fonts)

## 🎨 Design Philosophy

VouchFlow follows a **minimalist, premium** design approach:

- **Typography**: Clean Inter font with generous spacing
- **Color Palette**: 
  - Indigo primary (`#4F46E5`)
  - Slate grays for backgrounds
  - Gradient accents (indigo → purple)
- **Animations**: Smooth transitions with Tailwind utilities
- **Spacing**: Liberal use of whitespace for clarity
- **Mobile-First**: Designed for small screens, scales up beautifully

## 🔒 Browser Permissions & Privacy

### Required Permissions
- **Camera**: To record video testimonials
- **Microphone**: To capture audio

### Privacy Notes
- All recording happens locally in the browser
- Videos are stored as blob URLs until submission
- In production, videos will be uploaded to secure cloud storage (Cloudinary/UploadCare)
- No tracking or analytics in MVP version

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Safari 14+
- ✅ Firefox 55+
- ✅ Edge 79+
- ✅ iOS Safari 14.3+
- ✅ Chrome for Android 60+

## 📋 Product Roadmap

### ✅ Phase 1: The Link (Week 1) - COMPLETE
- [x] Camera access and recording
- [x] Landing page with conversion-focused copy
- [x] Recording interface with countdown
- [x] Review & submit flow
- [x] Success confirmation

### Phase 2: The Backend (Week 2)
- [ ] Supabase project setup
- [ ] Database schema for campaigns & videos
- [ ] Video upload integration (Cloudinary/UploadCare)
- [ ] Unique magic link generation
- [ ] Campaign ID validation

### Phase 3: Campaign Builder (Week 3)
- [ ] Creator dashboard
- [ ] Campaign creation form
  - Company name & logo upload
  - Custom prompts (3 questions)
  - Brand color customization
- [ ] Magic link management
- [ ] Video gallery with download

### Phase 4: The First Sale (Week 4)
- [ ] Google OAuth integration (Supabase Auth)
- [ ] User authentication flow
- [ ] Vercel deployment
- [ ] Custom domain setup
- [ ] Beta user testing
- [ ] First paying customer! 🎉

## 🔧 Customization Guide

### Update Branding
Edit `app/page.tsx`:
```tsx
<span className="text-xl font-semibold">YourBrand</span>
```

### Change Colors
Edit `tailwind.config.js`:
```js
extend: {
  colors: {
    primary: '#your-color',
  },
}
```

### Modify Prompts
Edit `app/record/[id]/page.tsx`:
```tsx
const prompts = [
  "Your custom question 1?",
  "Your custom question 2?",
  "Your custom question 3?"
];
```

### Adjust Recording Time
Change the max time in `app/record/[id]/page.tsx`:
```tsx
if (prev >= 90) { // Change from 60 to 90 for 90 seconds
```

## 🐛 Troubleshooting

### Camera Not Working?
1. Check browser permissions (Settings → Privacy → Camera)
2. Ensure you're on HTTPS (camera API requires secure context)
3. Verify no other app is using the camera
4. Try reloading the page

### Recording Not Starting?
1. Check browser console for errors (F12)
2. Verify MediaRecorder API support
3. Try a different browser
4. Clear browser cache

### Video Won't Play Back?
1. Check WebM/VP9 codec support
2. Try downloading and playing locally
3. Update your browser to the latest version

### Mobile Issues?
1. Enable camera permissions in device settings
2. Try Chrome or Safari (best support)
3. Check internet connection for initial load

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (For Production)
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_UPLOADCARE_KEY=your_upload_key
```

## 📊 Metrics to Track (Future)

- Magic links created
- Videos recorded
- Videos submitted
- Conversion rate (views → recordings)
- Average recording length
- Device breakdown (mobile vs desktop)

## 🤝 Contributing

This is your MVP! Feel free to:
- Customize the design to match your brand
- Add new features from the roadmap
- Experiment with different prompt strategies
- Test with real clients

## 📝 License

Private project - All rights reserved

## 🎯 Next Steps

1. **Test thoroughly**: Record videos on different devices
2. **Get feedback**: Share `/record/demo` link with friends
3. **Plan backend**: Set up Supabase account
4. **Design dashboard**: Sketch out creator interface
5. **Deploy**: Push to Vercel for live testing

## 💡 Pro Tips

- Keep prompts specific and actionable
- Test on actual client devices before launch
- Create a "best practices" guide for clients
- Record your own testimonial to test the flow
- Consider adding a "practice mode" for nervous clients

---

**Built with ❤️ for high-ticket service providers who need powerful social proof**

Need help? Check the troubleshooting section or review the code comments in each component.

Ready to collect testimonials that convert? 🚀
