const addFilesBtn = document.getElementById("addFilesBtn");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const mergeBtn = document.getElementById("mergeBtn");
const statusMsg = document.getElementById("statusMsg");
const downloadBtn = document.getElementById("downloadBtn");
let files = [];

addFilesBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const selected = [...fileInput.files].filter(f => f.type === "application/pdf");
  files = files.concat(selected);
  fileInput.value = null;
  updateFileList();
});

function updateFileList() {
  fileList.innerHTML = "";
  files.forEach((file, i) => {
    const tile = document.createElement("div");
    tile.className = "file-tile";

    // Rectangle preview (just an icon/text for now)
    const preview = document.createElement("div");
    preview.className = "file-preview";
    preview.textContent = "PDF"; // You can use an icon here

    // Filename at the bottom
    const name = document.createElement("div");
    name.className = "file-name";
    name.textContent = file.name;

    // Remove button (top right corner)
    const removeBtn = document.createElement("button");
    removeBtn.className = "file-remove";
    removeBtn.textContent = "✕";
    removeBtn.title = "Remove file";
    removeBtn.onclick = () => {
      files.splice(i, 1);
      updateFileList();
    };

    tile.appendChild(removeBtn);
    tile.appendChild(preview);
    tile.appendChild(name);
    fileList.appendChild(tile);
  });

  mergeBtn.disabled = files.length < 2;
  statusMsg.textContent = "";
  downloadBtn.style.display = "none";
}

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
