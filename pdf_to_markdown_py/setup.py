import os
import subprocess
from setuptools import setup, find_packages
from setuptools.command.develop import develop
from setuptools.command.install import install

def install_node_deps():
    """Install Node.js dependencies"""
    js_dir = os.path.join('pdf_to_markdown_py', 'js')
    if os.path.exists(os.path.join(js_dir, 'node_modules')):
        return

    print("Installing Node.js dependencies...")
    subprocess.check_call(['npm', 'install'], cwd=js_dir)

class CustomDevelopCommand(develop):
    def run(self):
        install_node_deps()
        develop.run(self)

class CustomInstallCommand(install):
    def run(self):
        install_node_deps()
        install.run(self)

setup(
    name="pdf-to-markdown",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    package_data={
        'pdf_to_markdown_py': [
            'js/pdf-to-md.js',
            'js/package.json',
            'js/node_modules/**/*'
        ]
    },
    install_requires=[],  # No Python dependencies required
    python_requires=">=3.10",
    cmdclass={
        'develop': CustomDevelopCommand,
        'install': CustomInstallCommand,
    },

    # Metadata
    author="Simonas",
    description="Python wrapper for PDF to Markdown converter",
    long_description=open('README.md').read(),
    long_description_content_type="text/markdown",
    keywords="pdf markdown converter",
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: JavaScript",
        "Topic :: Text Processing :: Markup :: Markdown",
        "Topic :: Text Processing :: Filters",
    ],
)
