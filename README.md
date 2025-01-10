# PDF to Markdown Converter

A simple script to convert PDF files to Markdown format. This script extracts text from PDF files while preserving the document structure (headings, paragraphs, etc.) and converts it to properly formatted Markdown.

## Features

- Converts PDF files to Markdown format
- Preserves document structure (headings, paragraphs)
- Handles rotated text
- Processes appendices and special formatting
- Maintains text hierarchy based on font sizes

## Installation

1. Make sure you have Node.js installed on your system
2. Clone or download this repository
3. Install dependencies:
```bash
npm install
```

## Usage

Run the script with input and output file paths:

```bash
node pdf-to-md.js [--json] <input-pdf-path> <output-path>
```

Options:
- `--json`: Output as JSON with text content separated by pages

Examples:
```bash
# Convert to markdown
node pdf-to-md.js document.pdf converted.md

# Convert to JSON with page separation
node pdf-to-md.js --json document.pdf output.json
```

The JSON output is an array of objects with the following structure:
```json
[
  {
    "page": 1,
    "content": "Page content in markdown format"
  },
  {
    "page": 2,
    "content": "Page content in markdown format"
  }
]
```

## How it works

The script uses pdfjs-dist to:
1. Extract text content from PDF pages
2. Analyze text formatting (font sizes, rotation)
3. Convert to markdown with proper structure:
   - Larger text becomes headers
   - Regular text becomes paragraphs
   - Rotated text is treated as appendices
   - Maintains proper spacing and formatting

## Requirements

- Node.js 14.0 or higher
- NPM (Node Package Manager)
