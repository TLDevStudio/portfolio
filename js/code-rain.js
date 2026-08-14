(function () {
    const canvas = document.getElementById('rain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); setupColumns(); });

    const chars = '01{}[]<>/;=+-'.split('');
    const fontSize = 14;
    let columns = [];

    function setupColumns() {
        const total = Math.floor(canvas.width / fontSize);
        const edge = Math.floor(total * 0.24);
        columns = [];
        for (let i = 0; i < total; i++) {
            const isEdge = i < edge || i > total - edge;
            if (isEdge && Math.random() > 0.45) {
                columns.push({
                    x: i * fontSize,
                    y: Math.random() * canvas.height,
                    speed: 0.4 + Math.random() * 0.5
                });
            }
        }
    }
    setupColumns();

    function draw() {
        ctx.fillStyle = 'rgba(5, 8, 15, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ffcc';
        ctx.font = fontSize + 'px "Space Mono", monospace';

        columns.forEach(col => {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.globalAlpha = Math.random() * 0.5 + 0.15;
            ctx.fillText(text, col.x, col.y);
            ctx.globalAlpha = 1;

            col.y += col.speed * fontSize * 0.3;
            if (col.y > canvas.height) col.y = -20;
        });

        requestAnimationFrame(draw);
    }
    draw();
})();