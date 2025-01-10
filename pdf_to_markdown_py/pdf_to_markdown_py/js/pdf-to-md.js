import pkg from 'pdfjs-dist';
const { getDocument, GlobalWorkerOptions } = pkg;
import _ from 'lodash';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js');

// Helper function to calculate standard deviation
function stdDev(numbers) {
    const mean = _.mean(numbers);
    const squareDiffs = numbers.map((num) => Math.pow(num - mean, 2));
    const avgSquareDiff = _.mean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

// Check if text is rotated significantly
function isRotatedByAtLeast35Degrees(transform) {
    const [a, b, c, d] = transform;
    const angle1 = Math.atan2(b, a) * (180 / Math.PI);
    const angle2 = Math.atan2(-c, d) * (180 / Math.PI);
    return Math.abs(angle1) >= 35 || Math.abs(angle2) >= 35;
}

// Function to convert text items to markdown
function processToMarkdown(textItems, articleAvgHeight, articleStdDevHeight) {
    const mdOps = [];
    let op = 'new';
    let mode = 'p';

    for (const textItem of textItems) {
        // Determine text formatting based on height
        if (textItem.height > articleAvgHeight + 3 * articleStdDevHeight) {
            mode = 'h1';
        } else if (textItem.height > articleAvgHeight + 2 * articleStdDevHeight) {
            mode = 'h2';
        } else if (textItem.height && textItem.height < articleAvgHeight - articleStdDevHeight) {
            mode = 'appendix';
        } else if (textItem.height) {
            mode = 'p';
        } else {
            mode = 'space';
        }

        // Check for rotated text
        if (isRotatedByAtLeast35Degrees(textItem.transform)) {
            mode = 'appendix';
        }

        mdOps.push({
            op,
            mode,
            text: textItem.str
        });

        op = textItem.hasEOL && !textItem.str ? 'new' : 'append';
    }

    // Convert to markdown format
    const mdChunks = [];
    const appendixChunks = [];
    mode = 'space';

    for (const x of mdOps) {
        const previousMode = mode;
        const changeToMdChunks = [];

        const isNewStart = x.mode !== 'space' && (x.op === 'new' || (previousMode === 'appendix' && x.mode !== previousMode));

        if (isNewStart) {
            switch (x.mode) {
                case 'h1':
                    changeToMdChunks.push('\n\n# ');
                    mode = x.mode;
                    break;
                case 'h2':
                    changeToMdChunks.push('\n\n## ');
                    mode = x.mode;
                    break;
                case 'p':
                    changeToMdChunks.push('\n\n');
                    mode = x.mode;
                    break;
                case 'appendix':
                    mode = x.mode;
                    appendixChunks.push('\n\n');
                    break;
            }
        } else {
            if (x.mode === 'appendix' && appendixChunks.length) {
                const lastChunk = appendixChunks[appendixChunks.length - 1];
                if (!lastChunk.match(/(\s+|-)$/) && lastChunk.length !== 1) {
                    appendixChunks.push(' ');
                }
            } else if (mdChunks.length) {
                const lastChunk = mdChunks[mdChunks.length - 1];
                if (!lastChunk.match(/(\s+|-)$/) && lastChunk.length !== 1) {
                    changeToMdChunks.push(' ');
                }
            }
        }

        if (x.text) {
            if (x.mode === 'appendix') {
                if (appendixChunks.length || isNewStart) {
                    appendixChunks.push(x.text);
                } else {
                    changeToMdChunks.push(x.text);
                }
            } else {
                changeToMdChunks.push(x.text);
            }
        }

        if (isNewStart && x.mode !== 'appendix' && appendixChunks.length) {
            const appendix = appendixChunks.join('')
                .split(/\r?\n/)
                .map(x => x.trim())
                .filter(Boolean)
                .map(x => `> ${x}`)
                .join('\n');
            changeToMdChunks.unshift(appendix);
            changeToMdChunks.unshift('\n\n');
            appendixChunks.length = 0;
        }

        if (x.mode === 'space' && changeToMdChunks.length) {
            changeToMdChunks.length = 1;
        }
        if (changeToMdChunks.length) {
            mdChunks.push(...changeToMdChunks);
        }
    }

    if (mdChunks.length) {
        mdChunks[0] = mdChunks[0].trimStart();
    }

    return mdChunks.join('');
}

async function convertPdfToMarkdown(pdfPath, outputFormat = 'markdown') {
    try {
        // Load the PDF document
        const loadingTask = getDocument(pdfPath);
        const doc = await loadingTask.promise;

        const textItems = [];

        // Extract text from all pages
        for (let i = 0; i < doc.numPages; i++) {
            const page = await doc.getPage(i + 1);
            const textContent = await page.getTextContent();
            textItems.push(textContent.items);
        }

        // Calculate text height statistics for the entire document
        const articleCharHeights = [];
        for (const textItem of textItems.flat()) {
            if (textItem.height) {
                articleCharHeights.push(...Array(textItem.str.length).fill(textItem.height));
            }
        }
        const articleAvgHeight = _.mean(articleCharHeights);
        const articleStdDevHeight = stdDev(articleCharHeights);

        if (outputFormat === 'json') {
            // Process each page separately and return as JSON with markdown content
            const pages = [];
            for (let i = 0; i < textItems.length; i++) {
                const pageContent = processToMarkdown(textItems[i], articleAvgHeight, articleStdDevHeight);
                if (pageContent.trim()) { // Only include non-empty pages
                    pages.push({
                        page: i + 1,
                        content: pageContent
                    });
                }
            }
            return JSON.stringify(pages, null, 2);
        }

        // For markdown output, process all pages together
        return processToMarkdown(textItems.flat(), articleAvgHeight, articleStdDevHeight);
    } catch (error) {
        console.error('Error converting PDF to Markdown:', error);
        throw error;
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
let inputPath, outputPath, outputFormat = 'markdown';

// Parse arguments
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') {
        outputFormat = 'json';
    } else if (!inputPath) {
        inputPath = args[i];
    } else if (!outputPath) {
        outputPath = args[i];
    }
}

if (!inputPath || !outputPath) {
    console.log('Usage: node pdf-to-md.js [--json] <input-pdf-path> <output-path>');
    console.log('Options:');
    console.log('  --json    Output as JSON with markdown content per page');
    process.exit(1);
}

import { writeFile } from 'fs/promises';

convertPdfToMarkdown(inputPath, outputFormat)
    .then(markdown => writeFile(outputPath, markdown, 'utf8'))
    .then(() => console.log(`Successfully converted ${inputPath} to ${outputPath}`))
    .catch(error => {
        console.error('Conversion failed:', error);
        process.exit(1);
    });
