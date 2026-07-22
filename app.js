/* ===========================================================
   STENCIL TOOLKIT V2
   PART 1
   Setup + Upload + Mask Engine
   Replace the beginning of app.js with this.
   Do NOT mix with the old code.
=========================================================== */

const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d");

let originalImage = null;

const SETTINGS = {

    borderThickness:1,
    dotSpacing:12,
    dotRadius:3,
    blackThreshold:128

};

const borderSlider =
document.getElementById("borderThickness");

const borderValue =
document.getElementById("borderValue");

borderSlider.addEventListener("input",function(){

    SETTINGS.borderThickness =
    parseFloat(this.value);

    borderValue.textContent =
    SETTINGS.borderThickness.toFixed(1)+" px";

});

const dotSizeSlider =
document.getElementById("dotSize");

const dotSizeValue =
document.getElementById("dotSizeValue");

dotSizeSlider.addEventListener("input", function () {

    SETTINGS.dotRadius =
        parseFloat(this.value);

    dotSizeValue.textContent =
        SETTINGS.dotRadius + " px";

});

const dotSpacingSlider =
document.getElementById("dotSpacing");

const dotSpacingValue =
document.getElementById("dotSpacingValue");

dotSpacingSlider.addEventListener("input", function () {

    SETTINGS.dotSpacing =
        parseInt(this.value);

    dotSpacingValue.textContent =
        SETTINGS.dotSpacing + " px";

});

imageInput.addEventListener("change", loadImage);

function loadImage(e) {

    const file = e.target.files[0];

    if (!file)
        return;

    const url = URL.createObjectURL(file);

    originalImage = new Image();

    originalImage.onload = function () {

        previewImage.src = url;
        previewImage.style.display = "block";

        canvas.width = originalImage.width;
        canvas.height = originalImage.height;

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.drawImage(
            originalImage,
            0,
            0
        );

    };

    originalImage.src = url;

}

/* =======================================================
                    MASK ENGINE
======================================================= */

function createMask(imageData) {

    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;

    const mask = new Uint8Array(width * height);

    for (let i = 0; i < mask.length; i++) {

        const p = i * 4;

        mask[i] =
            pixels[p] < SETTINGS.blackThreshold
                ? 1
                : 0;

    }

    return {

        width,
        height,
        mask

    };

}

function cloneMask(mask) {

    return new Uint8Array(mask);

}

function inside(x, y, width, height) {

    return (

        x >= 0 &&
        y >= 0 &&
        x < width &&
        y < height

    );

}

function index(x, y, width) {

    return y * width + x;

}

function removeNoise(binary) {

    const width = binary.width;
    const height = binary.height;

    const mask = cloneMask(binary.mask);

    const visited = new Uint8Array(mask.length);

    const stack = [];

    const component = [];

    const minimumPixels = 80;

    for (let i = 0; i < mask.length; i++) {

        if (!mask[i])
            continue;

        if (visited[i])
            continue;

        stack.length = 0;
        component.length = 0;

        stack.push(i);
        visited[i] = 1;

        while (stack.length) {

            const current = stack.pop();

            component.push(current);

            const x = current % width;
            const y = Math.floor(current / width);

            const neighbours = [

                [x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1]

            ];

            for (const n of neighbours) {

                if (!inside(
                    n[0],
                    n[1],
                    width,
                    height
                ))
                    continue;

                const ni = index(
                    n[0],
                    n[1],
                    width
                );

                if (!mask[ni])
                    continue;

                if (visited[ni])
                    continue;

                visited[ni] = 1;

                stack.push(ni);

            }

        }

        if (component.length < minimumPixels) {

            for (const p of component)
                mask[p] = 0;

        }

    }

    binary.mask = mask;

    return binary;

}

/* ===========================================================
   STENCIL TOOLKIT V2
   PART 2
   Border Engine + Adaptive Erosion + Convert Button
===========================================================*/



/* ===========================================================
                BORDER ENGINE
===========================================================*/

function extractOutline(binary) {

    const width = binary.width;
    const height = binary.height;

    const outline = new Uint8Array(width * height);

    const thickness = Math.max(
        1,
        Math.round(SETTINGS.borderThickness * 2)
    );

    for (let y = 0; y < height; y++) {

        for (let x = 0; x < width; x++) {

            const p = index(x, y, width);

            if (!binary.mask[p])
                continue;

            let edge = false;

            for (let dy = -thickness; dy <= thickness && !edge; dy++) {

                for (let dx = -thickness; dx <= thickness; dx++) {

                    if (dx === 0 && dy === 0)
                        continue;

                    const nx = x + dx;
                    const ny = y + dy;

                    if (!inside(nx, ny, width, height)) {

                        edge = true;
                        break;

                    }

                    if (!binary.mask[index(nx, ny, width)]) {

                        edge = true;
                        break;

                    }

                }

            }

            if (edge)
                outline[p] = 1;

        }

    }

    return {
        width,
        height,
        mask: outline
    };

}


/* ===========================================================
            HEXAGONAL DOT ENGINE
===========================================================*/


/* ===========================================================
            CONVERT BUTTON
===========================================================*/


/* ===========================================================
   STENCIL TOOLKIT V2
   PART 3
   Bridge Protection + Better Hexagonal Packing
===========================================================*/

/* ---------- Bridge Protection ---------- */

function protectThinBridges(binary) {

    const width = binary.width;
    const height = binary.height;

    const protectedMask = cloneMask(binary.mask);

    for (let y = 2; y < height - 2; y++) {

        for (let x = 2; x < width - 2; x++) {

            const p = index(x, y, width);

            if (!binary.mask[p])
                continue;

            let count = 0;

            for (let yy = -1; yy <= 1; yy++) {

                for (let xx = -1; xx <= 1; xx++) {

                    if (binary.mask[index(x + xx, y + yy, width)])
                        count++;

                }

            }

            /* Thin bridge */

            if (count <= 4) {

                protectedMask[p] = 2;

            }

        }

    }

    return {

        width,
        height,
        mask: protectedMask

    };

}

/* ---------- Adaptive Erosion ---------- */

function adaptiveErode(binary, iterations) {

    let current = cloneMask(binary.mask);

    const width = binary.width;
    const height = binary.height;

    for (let step = 0; step < iterations; step++) {

        const next = cloneMask(current);

        for (let y = 1; y < height - 1; y++) {

            for (let x = 1; x < width - 1; x++) {

                const p = index(x, y, width);

                if (current[p] == 0)
                    continue;

                /* Protected bridge */

                if (current[p] == 2)
                    continue;

                if (

                    current[index(x - 1, y, width)] == 0 ||
                    current[index(x + 1, y, width)] == 0 ||
                    current[index(x, y - 1, width)] == 0 ||
                    current[index(x, y + 1, width)] == 0

                ) {

                    next[p] = 0;

                }

            }

        }

        current = next;

    }

    return {

        width,
        height,
        mask: current

    };

}

function drawOutline(outline) {

    ctx.fillStyle = "black";

    for (let i = 0; i < outline.mask.length; i++) {

        if (!outline.mask[i])
            continue;

        const x = i % outline.width;
        const y = (i / outline.width) | 0;

        ctx.fillRect(x, y, 1, 1);
    }
}

/* ---------- Improved Hexagonal Packing ---------- */

function drawDots(inner) {

    const spacing = SETTINGS.dotSpacing;
    const radius = SETTINGS.dotRadius;

    ctx.fillStyle = "black";

    const vertical = spacing * 0.866;

    for (let y = radius; y < inner.height; y += vertical) {

        const offset =
            (Math.floor(y / vertical) % 2)
                ? spacing / 2
                : 0;

        for (let x = radius + offset; x < inner.width; x += spacing) {

            const ix = Math.floor(x);
            const iy = Math.floor(y);

            const p = index(ix, iy, inner.width);

            if (!inner.mask[p])
    continue;

// Keep dots away from the outline
if (
    p > inner.width &&
    p < inner.mask.length - inner.width &&
    (
        !inner.mask[p - 1] ||
        !inner.mask[p + 1] ||
        !inner.mask[p - inner.width] ||
        !inner.mask[p + inner.width]
    )
) {
    continue;
}
            ctx.beginPath();

            ctx.arc(
                x,
                y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }

}

/* ---------- Replace Convert Button ---------- */

convertBtn.onclick = function () {

    if (!originalImage) {

        alert("Upload an image first.");
        return;

    }

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    ctx.drawImage(originalImage, 0, 0);

    const img = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    let binary = createMask(img);

    binary = removeNoise(binary);

    binary = protectThinBridges(binary);

    const erosionSteps = Math.max(
    1,
    Math.round(
        SETTINGS.borderThickness * 2
    )
);

const inner = adaptiveErode(
    binary,
    erosionSteps
);

    const border = extractOutline(binary);

    ctx.fillStyle = "white";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawOutline(border);

drawDots(inner);

};

downloadBtn.onclick = function () {

    const link = document.createElement("a");

    link.download = "stencil.png";

    link.href = canvas.toDataURL("image/png");

    link.click();

};
