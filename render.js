
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

function drawContours(contours) {

    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;

    for (const contour of contours) {

        if (contour.length < 2) continue;

        ctx.beginPath();

        ctx.moveTo(contour[0].x, contour[0].y);

        for (let i = 1; i < contour.length - 1; i++) {

            const xc = (contour[i].x + contour[i + 1].x) / 2;
            const yc = (contour[i].y + contour[i + 1].y) / 2;

            ctx.quadraticCurveTo(
                contour[i].x,
                contour[i].y,
                xc,
                yc
            );

        }

        ctx.quadraticCurveTo(
            contour[contour.length - 1].x,
            contour[contour.length - 1].y,
            contour[0].x,
            contour[0].y
        );

        ctx.closePath();
        ctx.stroke();

    }

}
