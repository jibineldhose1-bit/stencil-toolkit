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

function isBlack(data, index) {
    const gray = (data[index] + data[index + 1] + data[index + 2]) / 3;
    return gray < 128;
}

function createMask(data, width, height) {

    const mask = [];

    for (let y = 0; y < height; y++) {

        mask[y] = [];

        for (let x = 0; x < width; x++) {

            const index = (y * width + x) * 4;

            mask[y][x] = isBlack(data, index);

        }

    }

    return mask;
}

function isOutlinePixel(data, width, height, x, y) {

    const index = (y * width + x) * 4;

    // Not black
    if (!isBlack(data, index)) return false;

    // Check all 8 neighbours
    for (let dy = -1; dy <= 1; dy++) {

        for (let dx = -1; dx <= 1; dx++) {

            if (dx === 0 && dy === 0) continue;

            const nx = x + dx;
            const ny = y + dy;

            // Outside image = edge
            if (nx < 0 || ny < 0 || nx >= width || ny >= height)
                return true;

            const n = (ny * width + nx) * 4;

            // White neighbour = outline
            if (!isBlack(data, n))
                return true;
        }
    }

    return false;
}

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
    
const mask = createMask(data, canvas.width, canvas.height);

console.log(mask);
    // Clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";

for (let y = 0; y < canvas.height; y++) {

    for (let x = 0; x < canvas.width; x++) {

        if (isOutlinePixel(data, canvas.width, canvas.height, x, y)) {

            ctx.fillRect(x, y, 1, 1);

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
