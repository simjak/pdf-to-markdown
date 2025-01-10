import os
import subprocess
import json
from pathlib import Path
from typing import Union, List, Dict

__all__ = ['PdfToMarkdown']

class PdfToMarkdown:
    def __init__(self):
        # Get the directory where the Node.js script is located
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.js_script = os.path.join(self.script_dir, 'js', 'pdf-to-md.js')

    def convert(self, input_path: Union[str, Path], output_path: Union[str, Path], as_json: bool = False) -> None:
        """
        Convert a PDF file to Markdown format.

        Args:
            input_path: Path to the input PDF file
            output_path: Path where the output should be saved
            as_json: If True, output will be JSON with markdown content per page

        Raises:
            subprocess.CalledProcessError: If the conversion fails
            FileNotFoundError: If the input file doesn't exist
        """
        input_path = str(input_path)
        output_path = str(output_path)

        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Input file not found: {input_path}")

        # Prepare the command
        cmd = ['node', self.js_script]
        if as_json:
            cmd.append('--json')
        cmd.extend([input_path, output_path])

        # Run the conversion
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            raise subprocess.CalledProcessError(
                e.returncode,
                e.cmd,
                f"Conversion failed: {e.stderr}"
            )

    def convert_string(self, input_path: Union[str, Path], as_json: bool = False) -> Union[str, List[Dict[str, Union[int, str]]]]:
        """
        Convert a PDF file to Markdown and return as a string.

        Args:
            input_path: Path to the input PDF file
            as_json: If True, returns JSON with markdown content per page

        Returns:
            If as_json is False, returns the markdown string
            If as_json is True, returns a list of dicts with page numbers and content

        Raises:
            subprocess.CalledProcessError: If the conversion fails
            FileNotFoundError: If the input file doesn't exist
        """
        # Create a temporary file for output
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.md', mode='w+') as temp:
            self.convert(input_path, temp.name, as_json)
            temp.seek(0)
            content = temp.read()

            if as_json:
                return json.loads(content)
            return content
