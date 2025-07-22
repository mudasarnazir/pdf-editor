# PDF Utility Web App

A modern, user-friendly web app for PDF file operations including **Merge**, **Split**, and **Compress** PDFs — all maintaining a consistent, clean interface and easy navigation.

---

## Features

- **Home Page**: Central hub to navigate between Merge, Split, and Compress tools.
- **Merge PDFs**: Upload multiple PDFs, reorder pages, preview, and merge into a single file.
- **Split PDFs**: Split PDFs by odd pages, even pages, page ranges, or individual pages. Outputs either multiple PDFs or a ZIP archive.
- **Compress PDFs**: Reduce file size by adjusting DPI, image quality, and color options.
- **Preview & Zoom**: Each screen provides a preview canvas with zoom functionality before download.
- **Reset & Navigation**:
  - **Home button**: Navigate back to the main page from any tool.
  - **Reset button**: Clear current files and reset the interface for a fresh start.
- **Responsive Design**: Works smoothly on desktop and mobile devices.
- **Accessibility**: Keyboard navigation and ARIA labels.

---

## Technologies Used

- [PDF-lib](https://pdf-lib.js.org/) — PDF manipulation library
- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF rendering for preview
- [JSZip](https://stuk.github.io/jszip/) — Zip creation for split output
- Vanilla JavaScript, HTML5, and CSS3 with Google Fonts (Inter)

---

## How to Use

1. Clone or download this repository.
2. Open `index.html` in your browser.
3. Select a tool from the Home page.
4. Upload PDF files and use the tool features.
5. Preview and download your processed files.
6. Use **Reset** to clear files or **Home** to return to the main menu.

---

## Project Structure

- `index.html` — Home page for tool navigation
- `merge.html` — PDF merge interface and logic
- `split.html` — PDF split interface and logic
- `compress.html` — PDF compress interface and logic
- `style.css` — Common styles for consistent theme
- `script.js` (and others) — JavaScript files for tool functionality

---

## Contribution

Feel free to fork and submit pull requests for improvements or additional PDF tools.

---

## Contact

Mudasar Nazir — [mudasar80@gmail.com](mailto:mudasar80@gmail.com)

---

## License

MIT License
