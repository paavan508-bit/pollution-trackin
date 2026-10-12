let currentSatId = '25544'; 

async function switchSatellite(name, noradId) {
    currentSatId = noradId;
    document.getElementById('satName').innerText = name;
    document.getElementById('activeRadarLabel').innerText = name.toUpperCase();
    
    document.querySelectorAll('.sat-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('connectionStatus').innerText = "Acquiring Signal...";
    await fetchAndTrackSatellite();
}

async function fetchAndTrackSatellite() {
    try {
        const response = await fetch(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${currentSatId}&FORMAT=TLE`);
        const text = await response.text();
        const lines = text.trim().split('\n');

        if (lines.length < 2) throw new Error("Invalid TLE data");

        const tleLine1 = lines.length === 3 ? lines[1] : lines[0];
        const tleLine2 = lines.length === 3 ? lines[2] : lines[1];

        document.getElementById('connectionStatus').innerText = "ONLINE (LIVE TLE)";
        document.getElementById('connectionStatus').style.color = "#3fb950";

        const satrec = satellite.twoline2satrec(tleLine1, tleLine2);

        clearInterval(window.trackerInterval);
        window.trackerInterval = setInterval(() => updateOrbitPosition(satrec), 1000);
        updateOrbitPosition(satrec);

    } catch (err) {
        document.getElementById('connectionStatus').innerText = "ONLINE (SIMULATED)";
        document.getElementById('connectionStatus').style.color = "#d29922";
        runFallbackSimulation();
    }
}

function updateOrbitPosition(satrec) {
    const now = new Date();
    const pv = satellite.propagate(satrec, now);
    const gmst = satellite.gstime(now);

    if (pv.position) {
        const pd = satellite.eciToGeodetic(pv.position, gmst);
        const lat = satellite.degreesLat(pd.latitude);
        const lng = satellite.degreesLong(pd.longitude);
        const height = pd.height;
        const speed = Math.sqrt(pv.velocity.x**2 + pv.velocity.y**2 + pv.velocity.z**2);

        document.getElementById('satLat').innerText = lat.toFixed(2) + "°";
        document.getElementById('satLng').innerText = lng.toFixed(2) + "°";
        document.getElementById('satAlt').innerText = height.toFixed(1) + " km";
        document.getElementById('satVel').innerText = speed.toFixed(2) + " km/s";

        const mapX = ((lng + 180) / 360) * 100;
        const mapY = ((90 - lat) / 180) * 100;

        const blip = document.getElementById('targetBlip');
        blip.style.left = `${mapX}%`;
        blip.style.top = `${mapY}%`;
    }
}

function runFallbackSimulation() {
    let step = 0;
    clearInterval(window.trackerInterval);
    window.trackerInterval = setInterval(() => {
        step += 0.04;
        let lat = Math.sin(step) * 50;
        let lng = (step * 25) % 360 - 180;

        document.getElementById('satLat').innerText = lat.toFixed(2) + "°";
        document.getElementById('satLng').innerText = lng.toFixed(2) + "°";
        document.getElementById('satAlt').innerText = "415.4 km";
        document.getElementById('satVel').innerText = "7.66 km/s";

        const mapX = ((lng + 180) / 360) * 100;
        const mapY = ((90 - lat) / 180) * 100;

        const blip = document.getElementById('targetBlip');
        blip.style.left = `${mapX}%`;
        blip.style.top = `${mapY}%`;
    }, 1000);
}

window.onload = () => fetchAndTrackSatellite();