function showTool(tool) {
  const container = document.getElementById('toolContainer');
  container.innerHTML = ''; // clear previous content

  if (tool === 'merge') {
    container.innerHTML = `
      <p>Select multiple PDF files to merge:</p>
      <input type="file" id="pdfMergeInput" accept="application/pdf" multiple />
      <button id="mergeBtn" disabled>Merge PDFs</button>
      <div id="status"></div>
    `;

    const input = document.getElementById('pdfMergeInput');
    const mergeBtn = document.getElementById('mergeBtn');
    const statusDiv = document.getElementById('status');

    input.addEventListener('change', () => {
      mergeBtn.disabled = input.files.length < 2;
      statusDiv.textContent = '';
    });

    mergeBtn.addEventListener('click', async () => {
      if (input.files.length < 2) {
        statusDiv.textContent = 'Please select at least two PDF files.';
        return;
      }

      statusDiv.textContent = 'Merging PDFs, please wait...';
      mergeBtn.disabled = true;
      input.disabled = true;

      try {
        const mergedPdf = await PDFLib.PDFDocument.create();
        for (const file of input.files) {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedBytes = await mergedPdf.save();
        statusDiv.innerHTML = 'PDFs merged successfully!';

        // Create download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Merged PDF';
        downloadBtn.id = 'downloadBtn';
        container.appendChild(downloadBtn);

        downloadBtn.onclick = () => download(mergedBytes, 'merged.pdf');
      } catch (e) {
        statusDiv.textContent = 'Error merging PDFs: ' + e.message;
      } finally {
        mergeBtn.disabled = false;
        input.disabled = false;
      }
    });
  } else {
    container.innerHTML = `<p><em>The "${tool}" tool is coming soon!</em></p>`;
  }
}

function download(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
