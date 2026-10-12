let isSatelliteMode = true;

function toggleDashboardMode() {
    isSatelliteMode = !isSatelliteMode;
    const btn = document.getElementById('modeToggle');
    const satView = document.getElementById('satelliteView');
    const govView = document.getElementById('govAIView');

    if (isSatelliteMode) {
        btn.innerText = "Switch to Gov/AI Data";
        btn.style.background = "#238636";
        satView.classList.add('active-view');
        govView.classList.remove('active-view');
    } else {
        btn.innerText = "Switch to Live Satellite";
        btn.style.background = "#1f6feb";
        govView.classList.add('active-view');
        satView.classList.remove('active-view');
    }
}

function updateTargetData(locationName) {
    let seed = locationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let cloud = (seed % 45) + 8;
    let ndvi = ((seed * 3) % 50) + 40;
    let moisture = ((seed * 7) % 55) + 30;

    document.getElementById('targetName').innerText = locationName;
    document.getElementById('mapTargetText').innerText = locationName.toUpperCase();
    document.getElementById('cloudMetric').innerText = cloud + "%";
    document.getElementById('ndviMetric').innerText = ndvi + "%";
    document.getElementById('moistureMetric').innerText = moisture + "%";

    // Smoothly animated via CSS transition property on .ring-chart
    document.getElementById('cloudRing').style.background = `conic-gradient(#58a6ff ${cloud * 3.6}deg, #21262d 0deg)`;
    document.getElementById('ndviRing').style.background = `conic-gradient(#238636 ${ndvi * 3.6}deg, #21262d 0deg)`;
    document.getElementById('moistureRing').style.background = `conic-gradient(#1f6feb ${moisture * 3.6}deg, #21262d 0deg)`;
}

function sendQuery() {
    const input = document.getElementById('userInput');
    const logs = document.getElementById('chatLogs');
    const val = input.value.trim();
    if (!val) return;

    logs.innerHTML += `<p><b>You:</b> ${val}</p>`;
    input.value = '';

    updateTargetData(val);

    setTimeout(() => {
        logs.innerHTML += `<p style="color: #58a6ff;"><b>AI:</b> Multispectral scan calibrated for <b>"${val}"</b>. Telemetry metrics updated across all sensor feeds.</p>`;
        logs.scrollTop = logs.scrollHeight;
    }, 400);
}

function handleKey(e) { 
    if (e.key === 'Enter') sendQuery(); 
}

window.onload = () => {
    updateTargetData("India");
};