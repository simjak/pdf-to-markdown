# PDF to Markdown

A Python wrapper for a PDF to Markdown converter that intelligently preserves document structure and formatting.

## Features

- Converts PDF documents to Markdown format
- Preserves document structure (headings, paragraphs)
- Handles rotated text
- Supports both string and file output
- Optional JSON output with per-page content

## Requirements

- Python 3.7 or higher
- Node.js 14 or higher

## Installation

### Using pip
```bash
pip install pdf-to-markdown
```

### Using Poetry
```bash
# From PyPI (once published)
poetry add pdf-to-markdown

# From local directory during development
poetry add path/to/pdf_to_markdown_py

# Directly from git repository (HTTPS)
poetry add git+https://github.com/simjak/pdf-to-markdown.git

# Directly from git repository (SSH)
poetry add git+ssh://git@github.com:simjak/pdf-to-markdown.git
```

### Using uv
```bash
# From PyPI (once published)
uv pip install pdf-to-markdown

# From local directory during development
uv pip install path/to/pdf_to_markdown_py

# Directly from git repository (HTTPS)
uv pip install git+https://github.com/simjak/pdf-to-markdown.git

# Directly from git repository (SSH)
uv pip install git+ssh://git@github.com:simjak/pdf-to-markdown.git
```

The package will automatically install required Node.js dependencies during installation, regardless of which package manager you use.

## Usage

### Python API

```python
from pdf_to_markdown_py import PdfToMarkdown

# Initialize converter
converter = PdfToMarkdown()

# Convert PDF to markdown file
converter.convert('input.pdf', 'output.md')

# Convert PDF to markdown string
markdown_text = converter.convert_string('input.pdf')

# Get JSON output with per-page content
json_content = converter.convert_string('input.pdf', as_json=True)
```

### Error Handling

```python
try:
    converter.convert('input.pdf', 'output.md')
except FileNotFoundError:
    print("Input PDF file not found")
except subprocess.CalledProcessError as e:
    print(f"Conversion failed: {e}")
```

## How it Works

This package is a Python wrapper around a Node.js PDF to Markdown converter that uses pdf.js for PDF parsing. The wrapper manages the Node.js process and provides a convenient Python API for the conversion functionality.

The converter:
1. Analyzes text positioning and formatting in the PDF
2. Detects document structure (headings, paragraphs)
3. Handles special cases like rotated text
4. Generates clean, structured Markdown output

## License

MIT
