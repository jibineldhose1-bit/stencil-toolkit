let opencvReady = false;

cv.onRuntimeInitialized = function () {
    opencvReady = true;
    alert("OpenCV loaded successfully!");
};
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

/* ===========================================================
   STENCIL TOOLKIT V2
   PART 2
   Border Engine + Adaptive Erosion + Convert Button
===========================================================*/



/* ===========================================================
                BORDER ENGINE
===========================================================*/


/* ---------- Improved Hexagonal Packing ---------- */

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
   
const contours = traceContours(binary);

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw the outline
drawContours(contours);

// Draw the dots
drawDots(inner);

};


