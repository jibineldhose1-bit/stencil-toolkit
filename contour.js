function traceContours(mask) {

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
