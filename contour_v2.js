function traceContours(mask) {

    if (typeof cv === "undefined") {
        console.error("OpenCV not loaded.");
        return [];
    }

    const src = new cv.Mat(mask.height, mask.width, cv.CV_8UC1);

    for (let y = 0; y < mask.height; y++) {
        for (let x = 0; x < mask.width; x++) {
            const index = y * mask.width + x;
            src.ucharPtr(y, x)[0] = mask.mask[index] ? 255 : 0;
        }
    }

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    cv.findContours(
        src,
        contours,
        hierarchy,
        cv.RETR_TREE,
        cv.CHAIN_APPROX_SIMPLE
    );

    const result = [];

    for (let i = 0; i < contours.size(); i++) {

    const contour = contours.get(i);
    const points = [];

    for (let j = 0; j < contour.rows; j++) {

        points.push({
            x: contour.intPtr(j, 0)[0],
            y: contour.intPtr(j, 0)[1]
        });

    }

    if (points.length > 2) {
        result.push(points);
    }

    contour.delete();

}

contour.delete();
    }

    contours.delete();
    hierarchy.delete();
    src.delete();

    return result;
}
