# 🔐 Hashify

> A versatile, open-source cryptographic hash toolkit for developers and security professionals.

[![GitHub Stars](https://img.shields.io/github/stars/Centre-for-Information-Technology-India/Hashify?style=flat-square)](https://github.com/Centre-for-Information-Technology-India/Hashify)
[![GitHub License](https://img.shields.io/github/license/Centre-for-Information-Technology-India/Hashify?style=flat-square)](LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/Centre-for-Information-Technology-India/Hashify?style=flat-square)](https://github.com/Centre-for-Information-Technology-India/Hashify/issues)
[![GitHub Forks](https://img.shields.io/github/forks/Centre-for-Information-Technology-India/Hashify?style=flat-square)](https://github.com/Centre-for-Information-Technology-India/Hashify/fork)

Hashify is a free, fast, and secure online hash generator that supports multiple cryptographic algorithms including MD5, SHA-256, and SHA-512. Generate, compare, and batch-process hashes with advanced features like salt/pepper support, visualization, and history tracking—all in your browser, completely offline.

## 🌟 Features

### Core Capabilities
- **🔑 Hash Generator** - Generate MD5, SHA-256, and SHA-512 hashes
- **🔀 Hash Comparison** - Compare two inputs to see if their hashes match
- **📦 Batch Processing** - Upload files and process multiple entries at once
- **📊 Hash Visualizer** - See unique visual representations of hashes
- **📜 History Tracking** - Automatic tracking of recent hash operations

### Security Features
- **🧂 Salt & Pepper Support** - Add custom or random salt/pepper to your hashes
- **🔐 Client-Side Processing** - All hashing is done in your browser (no server uploads)
- **✅ Open Source** - Fully transparent code for security auditing
- **🚀 HTTPS Ready** - Secure by default

### User Experience
- 🌓 **Multiple Themes** - Light, Dark, Hacker, Zen, and Retro themes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- ⚡ **Instant Processing** - Real-time hash generation with debouncing
- 💾 **Export Options** - Download as TXT, JSON, CSV, or QR Code
- 🎨 **Modern UI** - Built with Tailwind CSS and Radix UI components

## 🚀 Quick Start

### Online Version
Visit [Hashify](https://hashify.cit.org.in) to use the tool instantly without any installation.

### Local Development

#### Prerequisites
- Node.js 18+ 
- npm or yarn

#### Installation

```bash
# Clone the repository
git clone https://github.com/Centre-for-Information-Technology-India/Hashify.git
cd Hashify

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Build for Production

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Generating Hashes

1. **Basic Hashing**
   - Select the "Generator" tab
   - Enter your text
   - Choose an algorithm (MD5, SHA-256, or SHA-512)
   - The hash generates automatically
   - Click copy or download your hash

2. **With Salt/Pepper**
   - Enable "Salt / Pepper" toggle
   - Enter a custom value or generate a random one
   - Choose position (prefix or postfix)
   - Generate hash with added security

3. **Download Options**
   - **TXT** - Plain text format
   - **JSON** - Structured data with metadata
   - **QR Code** - For sharing or scanning

### Comparing Hashes

1. Switch to "Compare" tab
2. Enter two different texts
3. Select your algorithm
4. See instant comparison results
5. Visual indicator shows if hashes match

### Batch Processing

1. Go to "Batch" tab
2. Upload a .txt or .csv file (one entry per line)
3. Select algorithm
4. Processing starts automatically
5. Download results as CSV or JSON

### Hash Visualization

1. Navigate to "Visualize" tab
2. Paste any hash (16+ characters)
3. See unique pixel art representation
4. Different hashes = different visual patterns

### History & Export

1. View all operations in "History" tab
2. See timestamp, algorithm, input, and hash
3. Export entire history as JSON
4. Clear history when needed

## 🛠️ Technology Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/)
- **UI Component Library**: [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Cryptography**: [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)

## 🔒 Security & Privacy

- **No Data Collection** - We don't collect, store, or transmit any user data
- **Client-Side Processing** - All hashing happens locally in your browser
- **No External Requests** - No data leaves your device
- **Open Source** - Review the code to verify our claims
- **HTTPS Only** - Encrypted connection (when deployed)

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or translations, your help makes Hashify better.

### Getting Started with Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Make** your changes
4. **Write** or update tests as needed
5. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
6. **Push** to the branch (`git push origin feature/AmazingFeature`)
7. **Open** a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

### Areas for Contribution
- 🐛 Bug fixes and issue resolution
- ✨ New features (new hash algorithms, more themes, etc.)
- 📝 Documentation improvements
- 🌍 Translations to other languages
- 🎨 UI/UX improvements
- ⚡ Performance optimization
- 🧪 Test coverage

## 📋 Requirements

- **Browsers Supported**:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Device**: Any device with a modern web browser
- **Connectivity**: Internet required only for initial loading

## 🗂️ Project Structure

```
Hashify/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── globals.css         # Global styles
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── hash-generator.tsx  # Main app component
│   │   ├── theme-provider.tsx  # Theme configuration
│   │   └── ui/                 # Reusable UI components
│   ├── hooks/
│   │   ├── use-toast.ts        # Toast notifications
│   │   └── use-mobile.tsx      # Mobile detection
│   └── lib/
│       ├── md5.ts              # MD5 implementation
│       └── utils.ts            # Utility functions
├── public/                      # Static assets
├── docs/                        # Documentation
├── package.json                 # Dependencies & scripts
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 📦 Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Type check with TypeScript
```

## 🎯 Roadmap

- [ ] Additional hash algorithms (BLAKE3, Argon2)
- [ ] File hashing with progress indicators
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Dark mode improvements
- [ ] Keyboard shortcuts
- [ ] Internationalization (i18n)
- [ ] REST API endpoint
- [ ] Hash benchmark tool

## 🐛 Found a Bug?

If you find a bug, please [open an issue](https://github.com/Centre-for-Information-Technology-India/Hashify/issues/new?template=bug_report.md) with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and OS information

## 💡 Feature Requests

Have an idea? We'd love to hear it! [Create a feature request](https://github.com/Centre-for-Information-Technology-India/Hashify/issues/new?template=feature_request.md) with details about your proposal.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Maintained by [Centre for Information Technology (India)](https://cit.org.in)

## 📞 Support

- 💬 [GitHub Discussions](https://github.com/Centre-for-Information-Technology-India/Hashify/discussions)
- 🐛 [Report Issues](https://github.com/Centre-for-Information-Technology-India/Hashify/issues)
- 📧 [Email Contact](mailto:support@cit.org.in)
- 🌐 [Visit CIT India](https://cit.org.in)

## 🌐 Localization

Hashify is available in multiple languages. Contributions welcome!

- 🇺🇸 English (English)
- 🇮🇳 हिंदी (Hindi) - *Coming Soon*
- 🇪🇸 Español (Spanish) - *Coming Soon*
- 🇫🇷 Français (French) - *Coming Soon*

Help us translate! Check [CONTRIBUTING.md](CONTRIBUTING.md#translations) for details.

---

<div align="center">

**[⬆ Back to Top](#-hashify)**

Made with ❤️ by the Hashify Community

[Star](https://github.com/Centre-for-Information-Technology-India/Hashify) • [Fork](https://github.com/Centre-for-Information-Technology-India/Hashify/fork) • [Share](#)

</div>
