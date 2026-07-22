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
