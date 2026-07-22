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

function traceContours(mask){

    const contours = [];
    const visited = new Uint8Array(mask.mask.length);

    const w = mask.width;
    const h = mask.height;

    function index(x,y){
        return y*w+x;
    }

    for(let sy=0; sy<h; sy++){

        for(let sx=0; sx<w; sx++){

            if(
                !isBoundary(mask,sx,sy) ||
                visited[index(sx,sy)]
            ){
                continue;
            }

            const contour=[];

            let x=sx;
            let y=sy;

            let dir=0;

            let loop=0;

            while(loop<100000){

                contour.push({
                    x:x,
                    y:y
                });

                visited[index(x,y)]=1;

                let found=false;

                for(let i=0;i<8;i++){

                    const nd=(dir+7+i)%8;

                    const dx=DIRS[nd][0];
                    const dy=DIRS[nd][1];

                    const nx=x+dx;
                    const ny=y+dy;

                    if(
                        isBoundary(mask,nx,ny) &&
                        !visited[index(nx,ny)]
                    ){

                        x=nx;
                        y=ny;

                        dir=nd;

                        found=true;

                        break;

                    }

                }

                if(!found)
                    break;

                if(
                    x===sx &&
                    y===sy
                ){
                    break;
                }

                loop++;

            }

            if(contour.length>4){

                contours.push(contour);

            }

        }

    }

    return contours;

}
