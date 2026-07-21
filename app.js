const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");

let originalImage = new Image();

imageInput.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        originalImage.onload = function () {
            previewImage.src = originalImage.src;
            previewImage.style.display = "block";
        };

        originalImage.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

convertBtn.addEventListener("click", function () {

    if (!originalImage.src) {
        alert("Please select an image first.");
        return;
    }

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    ctx.drawImage(originalImage, 0, 0);

    // Placeholder
    alert("Conversion engine will be added in the next step.");
});

downloadBtn.addEventListener("click", function () {

    if (canvas.width === 0) {
        alert("Nothing to download.");
        return;
    }

    const link = document.createElement("a");
    link.download = "converted.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});
