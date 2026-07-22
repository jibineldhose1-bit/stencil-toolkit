
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
