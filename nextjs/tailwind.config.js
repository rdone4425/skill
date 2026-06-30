module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
  // ponytail: limit Tailwind JIT to used classes only
  future: { hoverOnlyWhenSupported: true },
}