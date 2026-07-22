
downloadBtn.onclick = function () {

    const link = document.createElement("a");

    link.download = "stencil.png";

    link.href = canvas.toDataURL("image/png");

    link.click();

};
