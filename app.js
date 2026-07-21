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

    const url = URL.createObjectURL(file);

    previewImage.onload = function () {
        URL.revokeObjectURL(url);
    };

    previewImage.src = url;
    previewImage.style.display = "block";

    originalImage.src = url;
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
function createMask(data, width, height) {

    const mask = new Uint8Array(width * height);

    for (let i = 0; i < width * height; i++) {

        const p = i * 4;

        const gray =
            (data[p] + data[p + 1] + data[p + 2]) / 3;

        mask[i] = gray < 128 ? 1 : 0;
    }

    return mask;
}

function erodeMask(mask, width, height, amount) {

    let result = new Uint8Array(mask);

    for (let step = 0; step < amount; step++) {

        const temp = new Uint8Array(result);

        for (let y = 1; y < height - 1; y++) {

            for (let x = 1; x < width - 1; x++) {

                const i = y * width + x;

                if (result[i] === 0)
                    continue;

                if (
                    result[i - 1] === 0 ||
                    result[i + 1] === 0 ||
                    result[i - width] === 0 ||
                    result[i + width] === 0
                ) {

                    temp[i] = 0;

                }

            }

        }

        result = temp;

    }

    return result;
}

function renderStencil(mask, innerMask, width, height) {

    const spacing = 12;
    const radius = 3;

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    // Draw original mask (solid black)
    ctx.fillStyle = "black";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            if (mask[y * width + x]) {
                ctx.fillRect(x, y, 1, 1);
            }

        }
    }

    // Remove the eroded interior (leave outline)
    ctx.fillStyle = "white";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            if (innerMask[y * width + x]) {
                ctx.fillRect(x, y, 1, 1);
            }

        }
    }

    // Draw dots inside the interior
    ctx.fillStyle = "black";

    for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {

            if (innerMask[y * width + x]) {

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();

            }

        }
    }

}

function drawOutline(mask, width, height) {

    ctx.fillStyle = "black";

    for (let y = 1; y < height - 1; y++) {

        for (let x = 1; x < width - 1; x++) {

            const i = y * width + x;

            if (!mask[i]) continue;

            if (
                !mask[i - 1] ||
                !mask[i + 1] ||
                !mask[i - width] ||
                !mask[i + width]
            ) {

                ctx.beginPath();
                ctx.arc(x, y, 2.5, 0, Math.PI * 2);
                ctx.fill();

            }

        }

    }

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

const smallMask = erodeMask(
    mask,
    canvas.width,
    canvas.height,
    4
);

renderStencil(
    mask,
    smallMask,
    canvas.width,
    canvas.height
);
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
