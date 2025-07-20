const addFilesBtn = document.getElementById("addFilesBtn");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const mergeBtn = document.getElementById("mergeBtn");
const statusMsg = document.getElementById("statusMsg");
const downloadBtn = document.getElementById("downloadBtn");
let files = [];
let uploaded = []; // same length as files, true if uploaded

addFilesBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async () => {
  const selected = [...fileInput.files].filter(f => f.type === "application/pdf");
  files = files.concat(selected);
  uploaded = uploaded.concat(selected.map(() => false)); // mark new files as not uploaded
  fileInput.value = null;
  updateFileList();
  await uploadNewFiles(selected.length); // Only upload new files
});


function updateFileList() {
  fileList.innerHTML = "";

  files.forEach((file, i) => {
    const tile = document.createElement("div");
    tile.className = "file-tile";
    tile.draggable = true;
    tile.dataset.index = i;

    // --- Drag and Drop Events ---
    tile.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", i);
      tile.classList.add("dragging");
    });
    tile.addEventListener("dragend", () => {
      tile.classList.remove("dragging");
    });
    tile.addEventListener("dragover", (e) => {
      e.preventDefault();
      tile.classList.add("drag-over");
    });
    tile.addEventListener("dragleave", () => {
      tile.classList.remove("drag-over");
    });
    tile.addEventListener("drop", (e) => {
      e.preventDefault();
      tile.classList.remove("drag-over");
      const fromIndex = Number(e.dataTransfer.getData("text/plain"));
      const toIndex = Number(tile.dataset.index);
      if (fromIndex !== toIndex) {
        // Swap files and uploaded status
        [files[fromIndex], files[toIndex]] = [files[toIndex], files[fromIndex]];
        [uploaded[fromIndex], uploaded[toIndex]] = [uploaded[toIndex], uploaded[fromIndex]];
        updateFileList();
      }
    });

    // --- PDF Preview ---
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

    // --- File Name ---
    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name.length > 20
      ? file.name.slice(0, 17) + "..."
      : file.name;

    // --- Remove Button ---
    const removeBtn = document.createElement("button");
    removeBtn.className = "file-remove";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove file";
    removeBtn.onclick = () => {
      files.splice(i, 1);
      uploaded.splice(i, 1);
      updateFileList();
    };

    // --- Zoom Button ---
    const zoomBtn = document.createElement("button");
    zoomBtn.className = "file-remove";
    zoomBtn.textContent = "🔍";
    zoomBtn.title = "Zoom Preview";
    zoomBtn.style.right = "30px";
    zoomBtn.onclick = () => {
      const modal = document.getElementById("previewModal");
      const previewCanvas = document.getElementById("previewCanvas");
      const ctx = previewCanvas.getContext("2d");

      const readerZoom = new FileReader();
      readerZoom.onload = function () {
        const typedArray = new Uint8Array(readerZoom.result);
        pdfjsLib.getDocument(typedArray).promise.then(pdfDoc => {
          pdfDoc.getPage(1).then(page => {
            const viewport = page.getViewport({ scale: 2.0 });
            previewCanvas.width = viewport.width;
            previewCanvas.height = viewport.height;
            page.render({ canvasContext: ctx, viewport });
            modal.style.display = "flex";
          });
        });
      };
      readerZoom.readAsArrayBuffer(file);
    };

    // --- Progress Bar ---
    const progress = document.createElement("div");
    progress.className = "file-progress";
    progress.innerHTML = `
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: 0%"></div>
      </div>
    `;

    // --- Append Elements ---
    tile.appendChild(removeBtn);
    tile.appendChild(zoomBtn);
    tile.appendChild(preview);
    tile.appendChild(name);
    tile.appendChild(progress);
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
      await realUpload(file, progress => {
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
function realUpload(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Replace this with your actual upload URL
    xhr.open("POST", "https://your-upload-server.com/upload");

    // Progress tracking
    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(new Error("Upload failed: " + xhr.status));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network error during upload"));
    };

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
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
      await realUpload(file, progress => {
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
async function uploadNewFiles(newCount) {
  if (newCount === 0) return;

  statusMsg.textContent = "Uploading files...";

  // Only upload the last newCount files
  for (let i = files.length - newCount; i < files.length; i++) {
    const file = files[i];
    const tile = fileList.children[i];
    const progressFill = tile.querySelector(".progress-bar-fill");

    try {
      await realUpload(file, progress => {
        progressFill.style.width = `${progress}%`;
      });

      progressFill.style.background = "#28c76f"; // success color
      uploaded[i] = true;
    } catch (err) {
      progressFill.style.background = "#ff4d4f"; // fail color
      uploaded[i] = false;
      console.error(`Upload failed for ${file.name}:`, err);
    }
  }

  statusMsg.textContent = "Upload complete.";
}
  
async function uploadNewFiles(newCount) {
  if (newCount === 0) return;

  statusMsg.textContent = "Uploading files...";

  for (let i = files.length - newCount; i < files.length; i++) {
    const file = files[i];
    const tile = fileList.children[i];
    const progressFill = tile.querySelector(".progress-bar-fill");

    try {
      await realUpload(file, progress => {
        progressFill.style.width = `${progress}%`;
      });

      progressFill.style.background = "#28c76f"; // success
      uploaded[i] = true;
    } catch (err) {
      progressFill.style.background = "#ff4d4f"; // fail
      uploaded[i] = false;
      console.error(`Upload failed for ${file.name}:`, err);
    }
  }

  statusMsg.textContent = "Upload complete.";
}
