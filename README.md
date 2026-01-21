# Family Tree Viewer

![Family Tree Concept](gen_to_tree.png)

## About

A privacy-focused, high-performance genealogy visualization application that renders family trees on an infinite canvas with seamless zoom capabilities.

This project was inspired by my recent research into my own family tree. While exploring my ancestry, I couldn't find any user-friendly tool to visualize and navigate through genealogical data. Existing solutions were either too complex, outdated, or lacked the intuitive experience I was looking for - something as smooth and natural as navigating a map.

## Key Features

- **Privacy First** - All GEDCOM file processing happens locally in your browser. Your family data never leaves your device.
- **Infinite Canvas** - Pan and zoom seamlessly through your family tree, from a bird's-eye view to detailed individual cards.
- **High Performance** - Optimized to handle trees with 10,000+ people smoothly.
- **Multiple Views** - Switch between different visualization modes: All Relatives, Family View, Hourglass, and Pedigree charts.
- **Export Options** - Save your tree as PNG, PDF, or SVG for printing or sharing.

## Tech Stack

- React 18 + TypeScript
- Custom Canvas rendering engine
- D3.js for tree layout algorithms
- Zustand for state management
- Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

## License

MIT