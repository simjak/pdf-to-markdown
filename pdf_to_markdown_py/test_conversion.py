from pdf_to_markdown_py import PdfToMarkdown
import os

# Initialize converter
converter = PdfToMarkdown()

# Get the absolute path to the test PDF
current_dir = os.path.dirname(os.path.abspath(__file__))
input_pdf = os.path.join(os.path.dirname(current_dir), 'data', 'flow.pdf')
output_md = os.path.join(current_dir, 'output.md')

print(f"Converting {input_pdf} to {output_md}")

try:
    # Test file conversion
    converter.convert(input_pdf, output_md)
    print("File conversion successful!")

    # Test string conversion
    markdown_text = converter.convert_string(input_pdf)
    print("\nString conversion successful!")
    print("\nFirst 200 characters of the output:")
    print(markdown_text[:200] + "...")

    # Test JSON conversion
    json_content = converter.convert_string(input_pdf, as_json=True)
    print("\nJSON conversion successful!")

except FileNotFoundError:
    print("Error: Input PDF file not found")
except Exception as e:
    print(f"Error during conversion: {e}")
