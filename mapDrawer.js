const { createCanvas, loadImage } = require("canvas");
const { ICONS, TEAM_COLORS } = require("./enums");
const path = require("path");

const CANVAS_SIZE = 1024;

let iconCache = null;
let mapImage = null;

async function tintIcon(iconImage, color) {
    const offCanvas = createCanvas(iconImage.width, iconImage.height);
    const offCtx = offCanvas.getContext("2d");

    offCtx.drawImage(iconImage, 0, 0);

    offCtx.globalCompositeOperation = "source-atop";
    offCtx.fillStyle = color;
    offCtx.fillRect(0, 0, iconImage.width, iconImage.height);

    return offCanvas;
}

async function prepareResources() {
    if (!mapImage) {
        mapImage = await loadImage(path.join(__dirname, "images", "MapLochMorHex.png"));
    }
    if (!iconCache) {
        iconCache = {};
        for (const [iconType, fileName] of Object.entries(ICONS)) {
            const originalIcon = await loadImage(path.join(__dirname, "images", fileName));
            iconCache[iconType] = {};
            for (const [team, color] of Object.entries(TEAM_COLORS)) {
                iconCache[iconType][team] = await tintIcon(originalIcon, color);
            }
        }
    }
}

async function drawMapWithIcons(items) {
    await prepareResources();

    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(mapImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (const item of items) {
        const iconType = item.iconType.toString();
        const team = item.teamId;
        const iconImg = iconCache[iconType]?.[team];
        if (!iconImg) continue;

        const x = item.x * CANVAS_SIZE;
        const y = item.y * CANVAS_SIZE;

        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.fillStyle = TEAM_COLORS[team] || "rgba(255,255,255,0.8)";
        ctx.arc(x, y, 28, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        const scale = 0.5;
        ctx.drawImage(
            iconImg,
            x - (iconImg.width * scale) / 2,
            y - (iconImg.height * scale) / 2,
            iconImg.width * scale,
            iconImg.height * scale
        );
    }

    return canvas.toBuffer("image/png");
}

module.exports = { drawMapWithIcons };
