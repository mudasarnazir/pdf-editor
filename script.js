const addFilesBtn = document.getElementById("addFilesBtn");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const mergeBtn = document.getElementById("mergeBtn");
const statusMsg = document.getElementById("statusMsg");
const downloadBtn = document.getElementById("downloadBtn");
let files = [];

addFilesBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async () => {
  const selected = [...fileInput.files].filter(f => f.type === "application/pdf");
  files = files.concat(selected);
  fileInput.value = null;
  updateFileList();
  await uploadFilesSequentially(); // Automatically start upload after adding
});


function updateFileList() {
  fileList.innerHTML = "";

  files.forEach((file, i) => {
    const tile = document.createElement("div");
    tile.className = "file-tile";

    const preview = document.createElement("div");
    preview.className = "file-preview";
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 140;

    const reader = new FileReader();
    reader.onload = function () {
      const typedArray = new Uint8Array(reader.result);
      pdfjsLib.getDocument(typedArray).promise.then(pdfDoc => {
        pdfDoc.getPage(1).then(page => {
          const viewport = page.getViewport({ scale: 0.5 });
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          page.render({ canvasContext: context, viewport });
        });
      });
    };
    reader.readAsArrayBuffer(file);
    preview.appendChild(canvas);

    
    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name;
name.textContent = file.name.length > 20
  ? file.name.slice(0, 17) + "..."
  : file.name;
    // Remove Button
    const removeBtn = document.createElement("button");
    removeBtn.className = "file-remove";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove file";
    removeBtn.onclick = () => {
      files.splice(i, 1);
      updateFileList();
    };

    // Zoom Button
    const zoomBtn = document.createElement("button");
    zoomBtn.className = "file-remove";
    zoomBtn.textContent = "🔍";
    zoomBtn.title = "Zoom Preview";
    zoomBtn.style.right = "30px"; // push left of ✕ button
    zoomBtn.onclick = () => {
      const modal = document.getElementById("previewModal");
      const previewCanvas = document.getElementById("previewCanvas");
      const ctx = previewCanvas.getContext("2d");

      const readerZoom = new FileReader();
      readerZoom.onload = function () {
        const typedArray = new Uint8Array(readerZoom.result);
        pdfjsLib.getDocument(typedArray).promise.then(pdfDoc => {
          pdfDoc.getPage(1).then(page => {
            const viewport = page.getViewport({ scale: 2.0 }); // Zoom scale
            previewCanvas.width = viewport.width;
            previewCanvas.height = viewport.height;
            page.render({ canvasContext: ctx, viewport });
            modal.style.display = "flex";
          });
        });
      };
      readerZoom.readAsArrayBuffer(file);
    };

    tile.appendChild(removeBtn);
    tile.appendChild(zoomBtn);
    tile.appendChild(preview);
    tile.appendChild(name);
    fileList.appendChild(tile);
  });

  mergeBtn.disabled = files.length < 2;
  statusMsg.textContent = "";
  downloadBtn.style.display = "none";
}

document.querySelector(".modal-close").addEventListener("click", () => {
  document.getElementById("previewModal").style.display = "none";
});

window.addEventListener("click", (e) => {
  const modal = document.getElementById("previewModal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
});


mergeBtn.addEventListener("click", async () => {
  if (files.length < 2) return;

  mergeBtn.disabled = true;
  statusMsg.textContent = "Merging PDFs, please wait...";

  try {
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(buffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }

    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    downloadBtn.href = url;
    downloadBtn.download = "merged.pdf";
    downloadBtn.style.display = "inline-block";
    statusMsg.textContent = "Merge successful!";
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "Error during merge: " + err.message;
  }

  mergeBtn.disabled = false;
});
const progress = document.createElement("div");
progress.className = "file-progress";
progress.innerHTML = `
  <div class="progress-bar-bg">
    <div class="progress-bar-fill" style="width: 0%"></div>
  </div>
`;
tile.appendChild(progress);
async function uploadFilesSequentially() {
  if (files.length === 0) return;

  statusMsg.textContent = "Uploading files...";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const tile = fileList.children[i];
    const progressFill = tile.querySelector(".progress-bar-fill");

    try {
      await simulateUpload(file, progress => {
        progressFill.style.width = `${progress}%`;
      });

      progressFill.style.background = "#28c76f"; // success color
    } catch (err) {
      progressFill.style.background = "#ff4d4f"; // fail color
      console.error(`Upload failed for ${file.name}:`, err);
    }
  }

  statusMsg.textContent = "Upload complete.";
}
function simulateUpload(file, onProgress) {
  return new Promise((resolve, reject) => {
    const total = 100;
    let progress = 0;
    const failChance = 0.2; // simulate 20% failure chance

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= total) {
        clearInterval(interval);
        if (Math.random() < failChance) {
          reject(new Error("Simulated upload failure"));
        } else {
          onProgress(100);
          resolve();
        }
      } else {
        onProgress(progress);
      }
    }, 200);
  });
}
async function uploadFilesSequentially() {
  if (files.length === 0) return;

  statusMsg.textContent = "Uploading files...";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const tile = fileList.children[i];
    const progressFill = tile.querySelector(".progress-bar-fill");

    try {
      await simulateUpload(file, progress => {
        progressFill.style.width = `${progress}%`;
      });

      progressFill.style.background = "#28c76f"; // success color
    } catch (err) {
      progressFill.style.background = "#ff4d4f"; // fail color
      console.error(`Upload failed for ${file.name}:`, err);
    }
  }

  statusMsg.textContent = "Upload complete.";
}
