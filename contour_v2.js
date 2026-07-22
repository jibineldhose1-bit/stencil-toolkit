
const DIRS = [
    [1, 0],   // E
    [1, 1],   // SE
    [0, 1],   // S
    [-1, 1],  // SW
    [-1, 0],  // W
    [-1,-1],  // NW
    [0,-1],   // N
    [1,-1]    // NE
];

function isBlack(mask, x, y){

    if(
        x < 0 ||
        y < 0 ||
        x >= mask.width ||
        y >= mask.height
    ){
        return false;
    }

    return mask.mask[y * mask.width + x];
}

function isBoundary(mask, x, y){

    if(!isBlack(mask,x,y))
        return false;

    for(const [dx,dy] of DIRS){

        if(!isBlack(mask,x+dx,y+dy))
            return true;

    }

    return false;
}
function traceContours_old(mask) {

    const contours = [];
    const visited = new Uint8Array(mask.mask.length);

    const w = mask.width;
    const h = mask.height;

    function idx(x, y) {
        return y * w + x;
    }

    function isBoundary(x, y) {

        if (!mask.mask[idx(x, y)]) return false;

        const dirs = [
            [0,-1],[1,0],[0,1],[-1,0]
        ];

        for (const [dx,dy] of dirs) {

            const nx = x + dx;
            const ny = y + dy;

            if (
                nx < 0 ||
                ny < 0 ||
                nx >= w ||
                ny >= h ||
                !mask.mask[idx(nx, ny)]
            ) {
                return true;
            }
        }

        return false;
    }

    for (let y = 0; y < h; y++) {

        for (let x = 0; x < w; x++) {

            const i = idx(x, y);

            if (
                visited[i] ||
                !isBoundary(x, y)
            ) continue;

            const stack = [[x, y]];
            const contour = [];

            while (stack.length) {

                const [cx, cy] = stack.pop();

                const ci = idx(cx, cy);

                if (
                    cx < 0 ||
                    cy < 0 ||
                    cx >= w ||
                    cy >= h ||
                    visited[ci] ||
                    !isBoundary(cx, cy)
                ) continue;

                visited[ci] = 1;

                contour.push({
                    x: cx,
                    y: cy
                });

                for (let yy = -1; yy <= 1; yy++) {

                    for (let xx = -1; xx <= 1; xx++) {

                        if (xx === 0 && yy === 0) continue;

                        stack.push([
                            cx + xx,
                            cy + yy
                        ]);
                    }
                }

            }

            if (contour.length > 5)
                contours.push(contour);

        }

    }

    return contours;
}

function traceContours(mask) {

    const src = new cv.Mat(
        mask.height,
        mask.width,
        cv.CV_8UC1
    );

    for (let i = 0; i < mask.mask.length; i++) {
        src.data[i] = mask.mask[i] ? 255 : 0;
    }

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    cv.findContours(
        src,
        contours,
        hierarchy,
        cv.RETR_TREE,
        cv.CHAIN_APPROX_NONE
    );

    const result = [];

    for (let i = 0; i < contours.size(); i++) {

        const c = contours.get(i);
        const pts = [];

        for (let j = 0; j < c.data32S.length; j += 2) {
            pts.push({
                x: c.data32S[j],
                y: c.data32S[j + 1]
            });
        }

        result.push(pts);

        c.delete();
    }

    src.delete();
    hierarchy.delete();
    contours.delete();

    return result;
}
