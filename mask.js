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
