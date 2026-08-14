(function () {
    const canvas = document.getElementById('web-canvas');
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 32;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const isMobile = window.innerWidth < 768;

    const exclusion = { xMin: -20, xMax: 20, yMin: -16, yMax: 18 };
    function inExclusion(x, y) {
        return x > exclusion.xMin && x < exclusion.xMax && y > exclusion.yMin && y < exclusion.yMax;
    }

    const nodeCount = isMobile ? 26 : 46;
    const nodes = [];
    let attempts = 0;
    while (nodes.length < nodeCount && attempts < nodeCount * 25) {
        attempts++;
        const x = (Math.random() - 0.5) * 72;
        const y = (Math.random() - 0.5) * 46;
        const z = (Math.random() - 0.5) * 22;
        if (inExclusion(x, y) && Math.random() < 0.85) continue;
        nodes.push(new THREE.Vector3(x, y, z));
    }

    const pointsGeo = new THREE.BufferGeometry().setFromPoints(nodes);
    const pointsMat = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.55, transparent: true, opacity: 0.85 });
    const pointCloud = new THREE.Points(pointsGeo, pointsMat);

    const maxDist = 14;
    const linePositions = [];
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[i].distanceTo(nodes[j]) < maxDist) {
                linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
            }
        }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.1 });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);

    const group = new THREE.Group();
    group.add(pointCloud);
    group.add(lineSegments);
    scene.add(group);

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
        requestAnimationFrame(animate);
        group.rotation.y += 0.0006;
        group.rotation.x += 0.00015;
        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();