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

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";

    const spacing = 20;
    const radius = 2;

    for (let y = 0; y < canvas.height; y += spacing) {

        for (let x = 0; x < canvas.width; x += spacing) {

            const index = (y * canvas.width + x) * 4;

            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            // Check if pixel is dark
            if (r < 128 && g < 128 && b < 128) {

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();

            }

        }

    }

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
