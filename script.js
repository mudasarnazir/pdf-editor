function showTool(tool) {
  const container = document.getElementById('toolContainer');
  container.innerHTML = '';

  if (tool === 'merge') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files);
      const mergedPdf = await PDFLib.PDFDocument.create();

      for (const file of files) {
        const reader = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(reader);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      download(mergedBytes, 'merged.pdf');
    };

    container.appendChild(input);
  } else {
    container.innerHTML = `<p>Coming Soon: ${tool} tool</p>`;
  }
}

function download(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
